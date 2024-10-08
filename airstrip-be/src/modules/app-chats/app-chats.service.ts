import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthedUser } from '../auth/types/service';
import { AppsService } from '../apps/apps.service';
import { Response } from 'express';
import { AiProvider } from '../ai-integrations/types/common';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { convertToCoreMessages, LanguageModel, Message, streamText } from 'ai';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AppChatsService {
  constructor(
    private readonly appsService: AppsService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async streamChatWithApp(
    appId: string,
    resp: Response,
    messages: Message[],
    user: AuthedUser,
  ) {
    const app = await this.appsService.getAppById(appId);
    const { systemPrompt, aiProvider } = app;

    if (!aiProvider) {
      throw new BadRequestException(
        'App is disabled as no AI provider is set.',
      );
    } else if (!aiProvider.aiProviderApiKeyEncrypted) {
      throw new BadRequestException(
        'App is disabled as no AI provider API key is set.',
      );
    } else if (!aiProvider.aiModel) {
      throw new BadRequestException('App is disabled as no AI model is set.');
    }

    const apiKey = await this.encryptionService.decrypt(
      aiProvider.aiProviderApiKeyEncrypted,
    );

    const languageModel = this.getLanguageModel(
      aiProvider.aiProvider,
      aiProvider.aiModel,
      {
        apiKey,
        baseURL: aiProvider.aiProviderApiUrl || undefined,
      },
    );

    const streamTextResp = await streamText({
      model: languageModel,
      system: systemPrompt || undefined,
      temperature: app.temperature,
      messages: convertToCoreMessages(messages as any),
      onFinish: (event) => {
        resp.write(
          `d: ${JSON.stringify({
            finishReason: event.finishReason,
            usage: event.usage,
          })}\n`,
        );
      },
    });

    return streamTextResp.pipeAIStreamToResponse(resp);
  }

  private getLanguageModel(
    aiProvider: AiProvider,
    model: string,
    genAiSettings: {
      apiKey: string;
      baseURL?: string;
    },
  ) {
    let languageModel: LanguageModel;
    switch (aiProvider) {
      case AiProvider.OPENAI:
      case AiProvider.OPENAI_COMPATIBLE:
        languageModel = createOpenAI({
          ...genAiSettings,
          compatibility:
            aiProvider === AiProvider.OPENAI ? 'strict' : 'compatible',
        })(model);
        break;
      case AiProvider.ANTHROPIC:
        languageModel = createAnthropic(genAiSettings)(model);
        break;
      case AiProvider.COHERE:
        languageModel = createCohere(genAiSettings)(model);
        break;
      case AiProvider.GOOGLE:
        languageModel = createGoogleGenerativeAI(genAiSettings)(model);
        break;
      case AiProvider.MISTRAL:
        languageModel = createMistral(genAiSettings)(model);
        break;
      default:
        throw new BadRequestException(`Invalid AI provider: '${aiProvider}'`);
    }

    return languageModel;
  }
}
