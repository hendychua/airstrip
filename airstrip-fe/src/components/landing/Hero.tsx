'use client';

import { Container, Flex, rem, Text } from '@mantine/core';
import GetStartedButton from './GetStartedButton';
import AbstractDotsAnimation from '../animations/AbstractDotsAnimation';

export default function Hero() {
  return (
    <Container>
      <div style={{ position: 'relative' }}>
        <Flex justify="center" style={{ opacity: 0.2 }}>
          <AbstractDotsAnimation size={500} loop={true} />
        </Flex>
        <div style={{ position: 'absolute', top: '0%' }}>
          <Text fw="400" size="48px" pt={rem(150)} ta="center">
            Open-source Enterprise AI Management Platform
          </Text>
          <Text size="18px" pt={rem(20)} ta="center" c="dimmed">
            Manage your AI integrations, control access, and build internal AI
            apps with ease.
          </Text>
          <Flex pt={rem(40)} justify="center">
            <GetStartedButton />
          </Flex>
        </div>
      </div>
    </Container>
  );
}
