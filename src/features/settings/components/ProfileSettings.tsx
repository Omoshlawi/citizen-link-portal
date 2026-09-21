import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Avatar, Box, Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { authClient } from '@/lib/api';
import { getNameInitials } from '@/lib/utils';

const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const ChangeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;
type ChangeEmailFormValues = z.infer<typeof ChangeEmailSchema>;

const ProfileSettings = () => {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [emailChangeSent, setEmailChangeSent] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
    values: { name: user?.name || '', email: user?.email || '' },
  });

  const emailForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { error } = await authClient.updateUser({ name: data.name });
      if (error) {
        throw new Error(error.message);
      }
      showNotification({
        title: 'Profile updated',
        message: 'Your profile information has been saved.',
        color: 'green',
      });
    } catch (error: any) {
      showNotification({
        title: 'Update failed',
        message: error.message || 'Failed to update profile.',
        color: 'red',
      });
    }
  };

  const onChangeEmail = async (data: ChangeEmailFormValues) => {
    try {
      const { error } = await authClient.changeEmail({ newEmail: data.newEmail });
      if (error) {
        throw new Error(error.message);
      }
      setEmailChangeSent(data.newEmail);
      emailForm.reset();
    } catch (error: any) {
      showNotification({
        title: 'Failed to initiate email change',
        message: error.message || 'An unexpected error occurred.',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Identity summary */}
      <Box
        style={{
          border: `1px solid var(--mantine-color-default-border)`,
          borderLeft: `3px solid var(--mantine-color-civicBlue-6)`,
          padding: 'var(--mantine-spacing-md)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group gap="md">
          <Avatar
            size={48}
            color="civicBlue"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
          >
            {user?.name ? getNameInitials(user.name) : '?'}
          </Avatar>
          <Box>
            <Text fw={600} size="sm" c="civicNavy.7">
              {user?.name || '—'}
            </Text>
            <Text size="xs" c="dimmed">
              {user?.email || '—'}
            </Text>
          </Box>
        </Group>
      </Box>

      {/* Edit form */}
      <Box
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Stack gap="lg" p="xl">
          <TextInput
            label="Full Name"
            description="Your display name visible across the platform."
            placeholder="Your full name"
            size="md"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />

          <Divider label="Account" labelPosition="left" />

          <TextInput
            label="Email Address"
            description="Your current email address."
            placeholder="your.email@example.com"
            size="md"
            disabled
            leftSection={<TablerIcon name="mail" size={16} stroke={1.5} />}
            {...form.register('email')}
          />
        </Stack>

        <Group
          justify="flex-end"
          px="xl"
          py="md"
          style={{
            borderTop: '1px solid var(--mantine-color-default-border)',
          }}
        >
          <Button
            type="submit"
            size="md"
            loading={form.formState.isSubmitting}
            leftSection={<TablerIcon name="check" size={16} stroke={2} />}
          >
            Save Changes
          </Button>
        </Group>
      </Box>

      {/* Change email section */}
      <Box
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Stack gap="lg" p="xl">
          <Box>
            <Text fw={600} size="sm">
              Change Email Address
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              A verification link will be sent to your new address. Your email changes once you
              click it.
            </Text>
          </Box>

          {emailChangeSent ? (
            <Alert color="civicBlue" icon={<TablerIcon name="mailCheck" size={16} />}>
              A verification link has been sent to{' '}
              <Text component="span" fw={600} size="sm">
                {emailChangeSent}
              </Text>
              . Click the link in that email to complete the change.
              <Text
                component="button"
                size="xs"
                c="civicBlue.6"
                mt={8}
                style={{
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  display: 'block',
                }}
                onClick={() => setEmailChangeSent(null)}
              >
                Send to a different address
              </Text>
            </Alert>
          ) : (
            <Box component="form" onSubmit={emailForm.handleSubmit(onChangeEmail)}>
              <Stack gap="md">
                <TextInput
                  label="New Email Address"
                  placeholder="new.email@example.com"
                  size="md"
                  leftSection={<TablerIcon name="mail" size={16} stroke={1.5} />}
                  {...emailForm.register('newEmail')}
                  error={emailForm.formState.errors.newEmail?.message}
                />
                <Group justify="flex-end">
                  <Button
                    type="submit"
                    size="md"
                    variant="outline"
                    loading={emailForm.formState.isSubmitting}
                    leftSection={<TablerIcon name="send" size={16} stroke={1.5} />}
                  >
                    Send Verification Link
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export default ProfileSettings;
