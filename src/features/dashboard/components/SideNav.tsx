import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppShell, Avatar, Box, NavLink, ScrollArea, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { TablerIcon, TablerIconName } from '@/components/TablerIcon';
import { authClient } from '@/lib/api';
import { getNameInitials } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = {
  icon: TablerIconName;
  label: string;
  href: string;
};

type NavGroup = {
  type: 'group';
  label: string;
  items: NavItem[];
};

type NavStandalone = {
  type: 'item';
} & NavItem;

type NavEntry = NavStandalone | NavGroup;

// ─── Navigation config ───────────────────────────────────────────────────────

const navConfig: NavEntry[] = [
  { type: 'item', icon: 'gauge', label: 'Dashboard', href: '' },
  {
    type: 'group',
    label: 'Case Management',
    items: [
      { icon: 'files', label: 'Cases', href: 'cases' },
      { icon: 'filterQuestion', label: 'Claims', href: 'claims' },
      { icon: 'exchange', label: 'Matches', href: 'matches' },
      { icon: 'history', label: 'Status Transitions', href: 'status-transitions' },
      { icon: 'messageReport', label: 'Chat Reports', href: 'chat-reports' },
    ],
  },
  {
    type: 'group',
    label: 'Document Custody',
    items: [
      { icon: 'buildingWarehouse', label: 'Custody Operation', href: 'custody' },
      { icon: 'buildingStore', label: 'Stations', href: 'stations' },
      { icon: 'userCog', label: 'Staff Operations Scope', href: 'operation-scope' },
      { icon: 'settingsAutomation', label: 'Operation Types', href: 'document-operation-types' },
    ],
  },
  {
    type: 'group',
    label: 'Configuration',
    items: [
      { icon: 'idBadge2', label: 'Document Types', href: 'document-types' },
      { icon: 'messageQuestion', label: 'Transition Reasons', href: 'status-transition-reasons' },
      { icon: 'template', label: 'Templates', href: 'templates' },
      { icon: 'shieldLock', label: 'Access Control', href: 'iam' },
      { icon: 'adjustments', label: 'System Settings', href: 'system-settings' },
      { icon: 'mapPin', label: 'Address Management', href: 'address-management' },
    ],
  },
  { type: 'item', icon: 'settings', label: 'Settings', href: 'settings' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveHref(href: string) {
  return href === '' ? '/dashboard' : `/dashboard/${href}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

type SideNavProps = { onClose?: () => void };

const SideNav: React.FC<SideNavProps> = ({ onClose }) => {
  const location = useLocation();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  function isActive(href: string) {
    const path = resolveHref(href);
    return href === ''
      ? location.pathname === '/dashboard'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function renderItem(item: NavItem, index: number) {
    const active = isActive(item.href);
    return (
      <NavLink
        key={index}
        component={Link}
        to={resolveHref(item.href)}
        active={active}
        label={item.label}
        color="civicBlue"
        fw={active ? 600 : 400}
        leftSection={<TablerIcon name={item.icon} size={15} stroke={active ? 2 : 1.5} />}
        onClick={onClose}
      />
    );
  }

  return (
    <>
      {/* ── User profile ───────────────────────────────────── */}
      <AppShell.Section>
        <Box
          px="sm"
          py="xs"
          style={{
            background: 'var(--mantine-color-civicNavy-7)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            minHeight: 60,
          }}
        >
          <Avatar
            size={36}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 700,
              flexShrink: 0,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {user ? getNameInitials(user.name) : '?'}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text
              size="sm"
              fw={600}
              c="white"
              truncate
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              {user?.name ?? '—'}
            </Text>
            <Text size="xs" truncate style={{ color: 'rgba(255,255,255,0.55)' }}>
              {user?.email ?? '—'}
            </Text>
          </Box>
        </Box>
      </AppShell.Section>

      {/* ── Navigation ─────────────────────────────────────── */}
      <AppShell.Section grow component={ScrollArea} px={4}>
        <Stack gap={0} pt={4}>
          {navConfig.map((entry, i) => {
            if (entry.type === 'item') {
              return renderItem(entry, i);
            }

            // Check if any child is active (to keep group open by default)
            const anyChildActive = entry.items.some((item) => isActive(item.href));

            return (
              <NavLink
                key={i}
                label={
                  <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    {entry.label}
                  </Text>
                }
                defaultOpened={anyChildActive || entry.label === 'Case Management'}
                childrenOffset={12}
                style={{ marginTop: i > 0 ? 4 : 0 }}
                styles={{
                  root: { color: 'var(--mantine-color-dimmed)' },
                  chevron: { color: 'var(--mantine-color-dimmed)' },
                }}
              >
                {entry.items.map(renderItem)}
              </NavLink>
            );
          })}
        </Stack>
      </AppShell.Section>

      {/* ── Sign out ───────────────────────────────────────── */}
      <AppShell.Section px={4} pb="xs">
        <NavLink
          label="Sign out"
          color="red"
          leftSection={<TablerIcon name="logout" size={15} stroke={1.5} />}
          onClick={() =>
            modals.openConfirmModal({
              title: 'Sign out',
              children: <Text size="sm">Are you sure you want to sign out?</Text>,
              labels: { confirm: 'Sign out', cancel: 'Cancel' },
              confirmProps: { color: 'red' },
              onConfirm: () => {
                onClose?.();
                authClient.signOut();
              },
            })
          }
        />
      </AppShell.Section>
    </>
  );
};

export default SideNav;
