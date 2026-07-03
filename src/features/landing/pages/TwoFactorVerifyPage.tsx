import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  Loader,
  PinInput,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { authClient } from '@/lib/api';
import { TablerIcon } from '@/components';
import { useBrand } from '@/hooks/usePublicConfig';

const TwoFactorVerifyPage = () => {
  const brand = useBrand();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (value: string) => {
    if (value.length !== 6) { return; }
    setIsVerifying(true);
    setError('');
    try {
      const result = await authClient.twoFactor.verifyTotp({ code: value });
      if (result.error) {
        setError(result.error.message ?? 'Invalid code. Please try again.');
        setCode('');
        return;
      }
      showNotification({
        title: 'Login successful',
        message: 'You have successfully logged in.',
        color: 'green',
        position: 'top-right',
      });
      navigate(callbackUrl ?? '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Stack gap="xl">
      <Stack gap="xs" align="center">
        <ThemeIcon size={56} variant="light" color="civicBlue" mb="sm">
          {isVerifying ? (
            <Loader size="sm" color="civicBlue" />
          ) : (
            <TablerIcon name="deviceMobile" size={28} stroke={1.5} />
          )}
        </ThemeIcon>

        <Title order={2} fw={700} ta="center">
          Two-Factor Authentication
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={320}>
          Open your authenticator app and enter the 6-digit code shown for {brand.appName}.
        </Text>
      </Stack>

      <Stack gap="md" align="center">
        <PinInput
          length={6}
          type="number"
          size="lg"
          value={code}
          onChange={(val) => {
            setCode(val);
            setError('');
          }}
          onComplete={handleVerify}
          disabled={isVerifying}
          error={!!error}
          autoFocus
          oneTimeCode
        />

        {error && (
          <Text size="sm" c="red.6" ta="center">
            {error}
          </Text>
        )}

        <Box w="100%">
          <Button
            fullWidth
            size="md"
            loading={isVerifying}
            disabled={code.length !== 6}
            onClick={() => { handleVerify(code); }}
            leftSection={!isVerifying && <TablerIcon name="shieldCheck" size={16} stroke={2} />}
          >
            Verify & Sign In
          </Button>
        </Box>
      </Stack>

      <Group justify="center">
        <Text size="sm" c="dimmed">
          Having trouble?{' '}
          <Text
            component="span"
            size="sm"
            c="civicBlue"
            style={{ cursor: 'pointer' }}
            onClick={() => { navigate('/login'); }}
          >
            Back to login
          </Text>
        </Text>
      </Group>
    </Stack>
  );
};

export default TwoFactorVerifyPage;
