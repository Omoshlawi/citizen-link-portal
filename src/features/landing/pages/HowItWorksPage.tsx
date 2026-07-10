import { Container, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { TablerIcon } from '@/components';
import { usePublicConfig } from '@/hooks/usePublicConfig';

export default function HowItWorksPage() {
  const { appName } = usePublicConfig();
  const steps = [
    {
      title: 'Report a Document',
      description:
        'Found a document? Upload a photo and our AI will extract the necessary info securely.',
      icon: 'upload',
    },
    {
      title: 'AI Identification',
      description: 'Our system classifies and indexes the document without compromising privacy.',
      icon: 'robot',
    },
    {
      title: 'Search & Match',
      description: 'Users searching for documents are matched using deterministic algorithms.',
      icon: 'search',
    },
    {
      title: 'Secure Recovery',
      description: 'The document is safely returned to its owner through verified channels.',
      icon: 'shieldCheck',
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title ta="center">How {appName} Works</Title>
        <Text ta="center" c="dimmed" size="lg">
          The most advanced document matching system designed for speed and security.
        </Text>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="xl" mt="xl">
          {steps.map((step, index) => (
            <Stack key={index} gap="sm" align="center" ta="center">
              <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                <TablerIcon name={step.icon as any} size={30} />
              </ThemeIcon>
              <Text fw={700} size="lg">
                {step.title}
              </Text>
              <Text c="dimmed">{step.description}</Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
