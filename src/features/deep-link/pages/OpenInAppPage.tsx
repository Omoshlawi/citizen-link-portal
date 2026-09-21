import { Navigate } from 'react-router-dom';
import { Alert, Anchor, Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { TablerIcon } from '@/components';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import { DeepLinkTarget, PLAY_STORE_URL } from '../hooks';

type Props = {
  target: DeepLinkTarget;
};

/**
 * Bounce page for email CTAs and printed labels. Gmail and Outlook only action
 * http(s) links, so every CTA points here and this page hands off to the app.
 *
 * Deliberately shows no case, claim or payment detail: anyone holding the URL
 * can load it, so the record itself only ever renders inside the app.
 */
const OpenInAppPage = ({ target }: Props) => {
  const { appName } = usePublicConfig();
  const { url, webUrl, label, isMobile, openApp } = target;

  // On a desktop browser a custom scheme does nothing, so where the action can
  // be completed on the web (the auth routes) go straight there. Tokens are
  // time-limited and those pages act on mount, so an extra click is pure
  // friction. `replace` keeps the back button out of a bounce loop.
  if (url && webUrl && !isMobile) {
    return <Navigate to={webUrl} replace />;
  }

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
            It may have expired, or been mistyped or truncated by your email app. Request a new link
            and try again.
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

      {isMobile && webUrl && (
        <Anchor href={webUrl} size="sm">
          Continue in this browser instead
        </Anchor>
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
