import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Box, Button, Divider, Group, PasswordInput, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { authClient } from '@/lib/api';

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof PasswordSchema>;

const PasswordSettings = () => {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        throw new Error(error.message);
      }
      showNotification({
        title: 'Password changed',
        message: 'Your password has been updated and other sessions have been signed out.',
        color: 'green',
      });
      form.reset();
    } catch (error: any) {
      showNotification({
        title: 'Change failed',
        message: error.message || 'Failed to change password.',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="lg">
      <Alert
        color="civicBlue"
        variant="light"
        icon={<TablerIcon name="infoCircle" size={16} stroke={1.5} />}
      >
        Changing your password will sign you out of all other active sessions for your security.
      </Alert>

      <Box
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Stack gap="lg" p="xl">
          <PasswordInput
            label="Current Password"
            description="Enter the password currently associated with your account."
            placeholder="Your current password"
            size="md"
            leftSection={<TablerIcon name="key" size={16} stroke={1.5} />}
            {...form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message}
          />

          <Divider label="New Password" labelPosition="left" />

          <PasswordInput
            label="New Password"
            description="Must be at least 8 characters. Use a mix of letters, numbers, and symbols."
            placeholder="At least 8 characters"
            size="md"
            {...form.register('newPassword')}
            error={form.formState.errors.newPassword?.message}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Repeat your new password"
            size="md"
            {...form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
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
            leftSection={<TablerIcon name="lock" size={16} stroke={2} />}
          >
            Update Password
          </Button>
        </Group>
      </Box>
    </Stack>
  );
};

export default PasswordSettings;
