import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  CopyButton,
  Divider,
  Group,
  Loader,
  Modal,
  PasswordInput,
  PinInput,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import QRCode from 'qrcode';
import { authClient } from '@/lib/api';
import { TablerIcon } from '@/components';
import { useBrand } from '@/hooks/usePublicConfig';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const PasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const DisableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractSecret(uri: string): string {
  try {
    return new URL(uri).searchParams.get('secret') ?? uri;
  } catch {
    return uri;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const TwoFactorSettings = () => {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const user = session?.user;
  const brand = useBrand();

  // Enable modal state
  const [enableOpened, { open: openEnable, close: closeEnableRaw }] = useDisclosure(false);
  const [step, setStep] = useState(0); // 0=password, 1=scan, 2=verify
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Disable modal state
  const [disableOpened, { open: openDisable, close: closeDisable }] = useDisclosure(false);

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: '' },
  });

  const disableForm = useForm<z.infer<typeof DisableSchema>>({
    resolver: zodResolver(DisableSchema),
    defaultValues: { password: '' },
  });

  // Generate QR code whenever totpUri changes
  useEffect(() => {
    if (!totpUri) { return; }
    QRCode.toDataURL(totpUri, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => { setQrDataUrl(null); });
  }, [totpUri]);

  const resetEnableState = () => {
    setStep(0);
    setTotpUri(null);
    setBackupCodes([]);
    setQrDataUrl(null);
    setTotpCode('');
    setVerifyError('');
    passwordForm.reset();
  };

  const handleCloseEnable = () => {
    closeEnableRaw();
    resetEnableState();
  };

  // Step 0 → 1: verify password, get TOTP URI + backup codes
  const onSubmitPassword = async (data: z.infer<typeof PasswordSchema>) => {
    const result = await authClient.twoFactor.enable({
      password: data.password,
      issuer: 'CitizenLink',
    });
    if (result.error) {
      passwordForm.setError('password', {
        message: result.error.message ?? 'Incorrect password.',
      });
      return;
    }
    setTotpUri(result.data!.totpURI);
    setBackupCodes(result.data!.backupCodes);
    setStep(1);
  };

  // Step 1 → 2
  const onProceedToVerify = () => {
    setStep(2);
  };

  // Step 2: verify TOTP code → actually enables 2FA
  const onVerifyCode = async (code: string) => {
    if (code.length !== 6) { return; }
    setIsVerifying(true);
    setVerifyError('');
    try {
      const result = await (authClient.twoFactor as any).verifyTotp({ code });
      if (result?.error) {
        setVerifyError(result.error.message ?? 'Invalid code. Please try again.');
        setTotpCode('');
        return;
      }
      // 2FA is now active — refresh session and close
      refetchSession();
      handleCloseEnable();
      showNotification({
        title: '2FA enabled',
        message: 'Two-factor authentication is now active on your account.',
        color: 'green',
      });
    } catch (err: any) {
      setVerifyError(err?.message ?? 'Invalid code. Please try again.');
      setTotpCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const onDisable = async (data: z.infer<typeof DisableSchema>) => {
    const result = await authClient.twoFactor.disable({ password: data.password });
    if (result.error) {
      disableForm.setError('password', {
        message: result.error.message ?? 'Incorrect password.',
      });
      return;
    }
    showNotification({
      title: '2FA disabled',
      message: 'Two-factor authentication has been removed from your account.',
      color: 'orange',
    });
    refetchSession();
    closeDisable();
    disableForm.reset();
  };

  if (!user) { return <Loader size="sm" />; }

  const isEnabled = (user as any).twoFactorEnabled as boolean;
  const secret = totpUri ? extractSecret(totpUri) : null;

  return (
    <Stack gap="lg">
      {!isEnabled && (
        <Alert
          color="civicGold"
          variant="light"
          icon={<TablerIcon name="alertTriangle" size={16} stroke={1.5} />}
        >
          Your account is not protected by two-factor authentication. Enable it to significantly
          reduce the risk of unauthorised access.
        </Alert>
      )}

      {/* Status card */}
      <Box
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderLeft: `3px solid var(--mantine-color-${isEnabled ? 'civicGreen' : 'gray'}-6)`,
          backgroundColor: 'var(--mantine-color-body)',
          padding: 'var(--mantine-spacing-lg)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size={44} variant="light" color={isEnabled ? 'civicGreen' : 'gray'}>
              <TablerIcon name={isEnabled ? 'shieldCheck' : 'shield'} size={22} stroke={1.5} />
            </ThemeIcon>

            <Box>
              <Group gap="xs" mb={4} align="center">
                <Text fw={600} size="sm" c="civicNavy.7">
                  Authenticator App
                </Text>
                <Badge size="sm" variant="light" color={isEnabled ? 'civicGreen' : 'gray'}>
                  {isEnabled ? 'Active' : 'Not configured'}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" maw={400}>
                Use an authenticator app like Google Authenticator or Authy to generate
                one-time security codes at sign-in.
              </Text>
            </Box>
          </Group>

          <Box style={{ flexShrink: 0 }}>
            {isEnabled ? (
              <Button
                color="red"
                variant="outline"
                size="sm"
                onClick={openDisable}
                leftSection={<TablerIcon name="shieldOff" size={15} stroke={1.5} />}
              >
                Disable
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={openEnable}
                leftSection={<TablerIcon name="shieldCheck" size={15} stroke={2} />}
              >
                Enable 2FA
              </Button>
            )}
          </Box>
        </Group>
      </Box>

      {/* ── Enable Modal ─────────────────────────────────────────────── */}
      <Modal
        opened={enableOpened}
        onClose={handleCloseEnable}
        title={
          <Group gap="sm">
            <ThemeIcon size={26} color="civicBlue" variant="light">
              <TablerIcon name="shieldLock" size={14} stroke={1.5} />
            </ThemeIcon>
            <Text fw={700} size="md">
              Enable Two-Factor Authentication
            </Text>
          </Group>
        }
        size="lg"
        closeOnClickOutside={false}
      >
        <Stepper active={step} size="xs" mb="xl" styles={{ separator: { marginInline: 4 } }}>
          <Stepper.Step label="Confirm" description="Verify identity" />
          <Stepper.Step label="Scan" description="Set up your app" />
          <Stepper.Step label="Verify" description="Confirm it works" />
        </Stepper>

        {/* ── Step 0: Password ── */}
        {step === 0 && (
          <Box component="form" onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Confirm your password to start the 2FA setup process.
              </Text>
              <PasswordInput
                label="Current Password"
                placeholder="Your current password"
                size="md"
                autoFocus
                {...passwordForm.register('password')}
                error={passwordForm.formState.errors.password?.message}
              />
              <Group justify="flex-end" mt="xs">
                <Button variant="default" size="md" onClick={handleCloseEnable}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="md"
                  loading={passwordForm.formState.isSubmitting}
                  rightSection={<TablerIcon name="arrowRight" size={16} stroke={2} />}
                >
                  Continue
                </Button>
              </Group>
            </Stack>
          </Box>
        )}

        {/* ── Step 1: Scan QR + backup codes ── */}
        {step === 1 && totpUri && (
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              Open your authenticator app and scan the QR code below, or enter the secret
              key manually. Then save your backup codes somewhere safe before continuing.
            </Text>

            {/* QR code */}
            <Box
              style={{
                border: '1px solid var(--mantine-color-default-border)',
                backgroundColor: 'var(--mantine-color-default-hover)',
                padding: 'var(--mantine-spacing-lg)',
                textAlign: 'center',
              }}
            >
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                c="dimmed"
                mb="md"
                style={{ letterSpacing: '0.06em' }}
              >
                Scan with your authenticator app
              </Text>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="TOTP QR Code"
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    imageRendering: 'pixelated',
                    background: 'white',
                    padding: 8,
                  }}
                  width={200}
                  height={200}
                />
              ) : (
                <Box style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader size="sm" />
                </Box>
              )}

              {secret && (
                <Box mt="md">
                  <Text size="xs" c="dimmed" mb={6}>
                    Can't scan? Enter this key manually:
                  </Text>
                  <CopyButton value={secret}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied!' : 'Click to copy'} withArrow>
                        <Code
                          block
                          fz="sm"
                          fw={700}
                          p="sm"
                          onClick={copy}
                          style={{ cursor: 'pointer', letterSpacing: '0.1em', userSelect: 'all' }}
                        >
                          {secret}
                        </Code>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Box>
              )}
            </Box>

            <Divider label="Backup Codes" labelPosition="left" />

            <Box>
              <Group gap="xs" mb="xs" justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  Save these codes — they can restore access if you lose your device.
                  Each code can only be used once.
                </Text>
                <CopyButton value={backupCodes.join('\n')}>
                  {({ copied, copy }) => (
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      color={copied ? 'civicGreen' : 'civicBlue'}
                      leftSection={<TablerIcon name={copied ? 'check' : 'copy'} size={12} stroke={2} />}
                      onClick={copy}
                      style={{ flexShrink: 0 }}
                    >
                      {copied ? 'Copied' : 'Copy all'}
                    </Button>
                  )}
                </CopyButton>
              </Group>

              <Box
                style={{
                  border: '1px solid var(--mantine-color-orange-3)',
                  padding: 'var(--mantine-spacing-md)',
                }}
              >
                <Group gap="md" wrap="wrap">
                  {backupCodes.map((code) => (
                    <Code key={code} fz="sm" fw={600}>
                      {code}
                    </Code>
                  ))}
                </Group>
              </Box>
            </Box>

            <Group justify="flex-end" mt="xs">
              <Button
                size="md"
                onClick={onProceedToVerify}
                rightSection={<TablerIcon name="arrowRight" size={16} stroke={2} />}
              >
                I've scanned the code and saved my backup codes
              </Button>
            </Group>
          </Stack>
        )}

        {/* ── Step 2: Verify code ── */}
        {step === 2 && (
          <Stack gap="lg" align="center">
            <ThemeIcon size={64} radius={0} variant="light" color="civicBlue" mx="auto">
              <TablerIcon name="deviceMobile" size={32} stroke={1.5} />
            </ThemeIcon>

            <Box ta="center">
              <Text fw={600} size="md" c="civicNavy.7" mb={4}>
                Enter the code from your app
              </Text>
              <Text size="sm" c="dimmed">
                Open your authenticator app and enter the 6-digit code shown for {brand.appName}.
              </Text>
            </Box>

            <PinInput
              length={6}
              type="number"
              size="lg"
              value={totpCode}
              onChange={(val) => {
                setTotpCode(val);
                setVerifyError('');
              }}
              onComplete={onVerifyCode}
              disabled={isVerifying}
              error={!!verifyError}
              autoFocus
              oneTimeCode
            />

            {verifyError && (
              <Text size="sm" c="red.6" ta="center">
                {verifyError}
              </Text>
            )}

            <Button
              size="md"
              fullWidth
              loading={isVerifying}
              disabled={totpCode.length !== 6}
              onClick={() => { onVerifyCode(totpCode); }}
              leftSection={!isVerifying && <TablerIcon name="shieldCheck" size={16} stroke={2} />}
            >
              Verify & Enable 2FA
            </Button>

            <Button variant="subtle" size="sm" onClick={() => { setStep(1); setTotpCode(''); setVerifyError(''); }}>
              ← Back
            </Button>
          </Stack>
        )}
      </Modal>

      {/* ── Disable Modal ────────────────────────────────────────────── */}
      <Modal
        opened={disableOpened}
        onClose={closeDisable}
        title={
          <Group gap="sm">
            <ThemeIcon size={26} color="red" variant="light">
              <TablerIcon name="shieldOff" size={14} stroke={1.5} />
            </ThemeIcon>
            <Text fw={700} size="md" c="red.7">
              Disable Two-Factor Authentication
            </Text>
          </Group>
        }
      >
        <Box component="form" onSubmit={disableForm.handleSubmit(onDisable)}>
          <Stack gap="lg">
            <Alert
              color="red"
              variant="light"
              icon={<TablerIcon name="alertTriangle" size={16} stroke={1.5} />}
            >
              Disabling 2FA will reduce the security of your account. Only proceed if necessary.
            </Alert>
            <PasswordInput
              label="Account Password"
              description="Confirm your identity to disable 2FA."
              placeholder="Your current password"
              size="md"
              autoFocus
              {...disableForm.register('password')}
              error={disableForm.formState.errors.password?.message}
            />
            <Group justify="flex-end">
              <Button variant="default" size="md" onClick={closeDisable}>
                Cancel
              </Button>
              <Button
                color="red"
                size="md"
                type="submit"
                loading={disableForm.formState.isSubmitting}
                leftSection={<TablerIcon name="shieldOff" size={15} stroke={1.5} />}
              >
                Disable 2FA
              </Button>
            </Group>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
};

export default TwoFactorSettings;
