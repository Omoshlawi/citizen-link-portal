import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Divider, Grid, NavLink, Stack, Text, Title } from '@mantine/core';
import { DashboardPageHeader, TablerIcon } from '@/components';
import PasswordSettings from '../components/PasswordSettings';
import ProfileSettings from '../components/ProfileSettings';
import TwoFactorSettings from '../components/TwoFactorSettings';

const SettingsPage = () => {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.includes('change-password')) {
      return 'password';
    }
    if (location.pathname.includes('two-factor')) {
      return 'security';
    }
    return 'profile';
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      value: 'profile',
      label: 'Profile',
      icon: 'user',
      href: '/dashboard/settings/profile',
    },
    {
      value: 'password',
      label: 'Password',
      icon: 'key',
      href: '/dashboard/settings/change-password',
    },
    {
      value: 'security',
      label: 'Two-Factor Auth',
      icon: 'shieldLock',
      href: '/dashboard/settings/two-factor',
    },
  ] as const;

  const sections: Record<string, { title: string; description: string }> = {
    profile: {
      title: 'Profile Information',
      description: 'Update your name and view your account details.',
    },
    password: {
      title: 'Change Password',
      description: 'Ensure your account is secured with a strong, unique password.',
    },
    security: {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of protection to your account.',
    },
  };

  const current = sections[activeTab];

  return (
    <Stack gap="xl">
      <DashboardPageHeader
        title="Account Settings"
        subTitle="Manage your personal information, security, and preferences"
        icon="settings"
      />

      <Grid gutter={32}>
        {/* ── Sidebar nav ──────────────────────────────────── */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Box style={{ borderRight: '1px solid var(--mantine-color-default-border)' }} h="100%">
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              c="dimmed"
              px="sm"
              pb="xs"
              mb={4}
              style={{ letterSpacing: '0.06em' }}
            >
              Settings
            </Text>
            <Stack gap={0}>
              {navItems.map(({ value, label, icon, href }) => {
                const active = activeTab === value;
                return (
                  <NavLink
                    key={value}
                    component={Link}
                    to={href}
                    label={label}
                    active={active}
                    color="civicBlue"
                    fw={active ? 600 : 400}
                    leftSection={<TablerIcon name={icon} size={16} stroke={active ? 2 : 1.5} />}
                  />
                );
              })}
            </Stack>
          </Box>
        </Grid.Col>

        {/* ── Content area ─────────────────────────────────── */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Stack gap="lg">
            <Box>
              <Title order={3} mb={4}>
                {current.title}
              </Title>
              <Text size="sm" c="dimmed">
                {current.description}
              </Text>
              <Divider mt="sm" />
            </Box>

            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'password' && <PasswordSettings />}
            {activeTab === 'security' && <TwoFactorSettings />}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default SettingsPage;
