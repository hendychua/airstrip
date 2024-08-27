import { AiProvider } from '@/utils/backend/client/common/types';

export class CreateAiIntegrationReq {
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
  aiModel: string;
}

export class UpdateAiIntegrationReq {
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
  aiModel: string;
}

export class RestrictedToTeamResp {
  id: string;
  name: string;
}

export class AiIntegrationKeyResp {
  id: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  restrictedToTeam: RestrictedToTeamResp | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
  aiModel: string;
}

export class ListAiIntegrationsResp {
  data: AiIntegrationKeyResp[];
  nextPageCursor: string | null;
}

export class GetAllAiIntegrationsAccessibleByTeamResp {
  data: AiIntegrationKeyResp[];
}
