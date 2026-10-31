import { Outlet } from 'react-router-dom';
import { Stack } from '@mantine/core';
import { DashboardPageHeader, RouteTab, RouteTabs } from '@/components';

const TABS: RouteTab[] = [
  { value: '', label: 'Recorded Matches', icon: 'database' },
  { value: 'semantic', label: 'Semantic Search', icon: 'vectorTriangle' },
];

/** Layout route: `/dashboard/matches` (recorded) and `/dashboard/matches/semantic`. */
const MatchesPage = () => (
  <Stack gap="md">
    <DashboardPageHeader
      title="Matches"
      subTitle="Recorded matches and real-time semantic similarity search"
      icon="exchange"
    />
    <RouteTabs basePath="/dashboard/matches" tabs={TABS} iconSize={16} />
    <Outlet />
  </Stack>
);

export default MatchesPage;
