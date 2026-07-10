import { Anchor, Button, Container, Group, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { usePublicConfig } from '@/hooks/usePublicConfig';

export default function ContactUsPage() {
  const { supportEmail, supportPhone } = usePublicConfig();
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Title ta="center">Contact Us</Title>
        <Text ta="center" c="dimmed">
          Have questions or need assistance? Reach out to our team.
        </Text>

        <Group justify="center" gap="xl">
          <Text size="sm">
            Email:{' '}
            <Anchor href={`mailto:${supportEmail}`}>{supportEmail}</Anchor>
          </Text>
          <Text size="sm">
            Phone: <Anchor href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</Anchor>
          </Text>
        </Group>

        <form onSubmit={(e) => e.preventDefault()}>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Your name" required />
            <TextInput label="Email" placeholder="your@email.com" required />
            <Textarea label="Message" placeholder="How can we help?" minRows={4} required />
            <Group justify="flex-end">
              <Button type="submit">Send Message</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
