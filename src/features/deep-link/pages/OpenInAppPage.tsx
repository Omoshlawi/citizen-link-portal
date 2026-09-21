import { Alert, Anchor, Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { TablerIcon } from '@/components';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import { DeepLinkTarget, PLAY_STORE_URL } from '../hooks';

type Props = {
  target: DeepLinkTarget;
};

/**
 * Bounce page for email CTAs. Gmail and Outlook only action http(s) links, so
 * every CTA points here and this page hands off to the app.
 *
 * Deliberately shows no case, claim or payment detail: anyone holding the URL
 * can load it, so the record itself only ever renders inside the app.
 */
const OpenInAppPage = ({ target }: Props) => {
  const { appName } = usePublicConfig();
  const { url, label, isMobile, openApp } = target;

  if (!url) {
    return (
      <Stack gap="xl" align="center" py="xl">
        <ThemeIcon size={64} variant="light" color="red">
          <TablerIcon name="alertTriangle" size={32} />
        </ThemeIcon>
        <Stack gap="xs" align="center">
          <Title order={2} fw={700} ta="center">
            This link isn&apos;t valid
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={360}>
            It may have been mistyped or truncated by your email app. Open {appName} directly and
            the item will be waiting for you.
          </Text>
        </Stack>
        <Anchor href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
          Get {appName} on Google Play
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" align="center" py="xl">
      <ThemeIcon size={64} variant="light" color="civicBlue">
        <TablerIcon name="deviceMobile" size={32} />
      </ThemeIcon>

      <Stack gap="xs" align="center">
        <Title order={2} fw={700} ta="center">
          Open {label} in {appName}
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          {isMobile
            ? `Tap below and ${appName} will take you straight there.`
            : `This opens in the ${appName} mobile app. Open this email on your phone, or install the app below.`}
        </Text>
      </Stack>

      {isMobile && (
        <Button
          size="md"
          onClick={openApp}
          rightSection={<TablerIcon name="arrowRight" size={18} />}
        >
          Open in {appName}
        </Button>
      )}

      <Alert variant="light" color="civicBlue" maw={420}>
        <Text size="sm">
          Don&apos;t have the app yet?{' '}
          <Anchor href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
            Install {appName}
          </Anchor>{' '}
          and sign in with the same account.
        </Text>
      </Alert>
    </Stack>
  );
};

export default OpenInAppPage;
