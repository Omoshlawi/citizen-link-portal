import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { Stack } from '@mantine/core';
import { ErrorState, RouteTab, RouteTabs } from '@/components';
import { MatchDetailHeader, MatchScoreBreakdown } from '../components';
import { useMatch } from '../hooks';
import { Match } from '../types';
import MatchDetailSkeleton from './MatchDetailSkeleton';

type MatchDetailContext = { match: Match };

/** Read the match loaded by the `MatchDetailPage` layout from inside a tab route. */
export const useMatchDetail = () => useOutletContext<MatchDetailContext>();

const TABS: RouteTab[] = [
  { value: 'comparison', label: 'Case Comparison', icon: 'columns' },
  { value: 'analysis', label: 'Analysis', icon: 'robot' },
  { value: 'images', label: 'Document Images', icon: 'photo' },
];

/** Layout route: each tab is a child path under `/dashboard/matches/:matchId`. */
const MatchDetailPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, isLoading, error } = useMatch(matchId);

  if (isLoading) {
    return <MatchDetailSkeleton />;
  }
  if (error || !match) {
    return <ErrorState error={error} message="No match data available" title="Match Detail" />;
  }

  return (
    <Stack gap="xl">
      <MatchDetailHeader match={match} />

      <MatchScoreBreakdown match={match} />

      <Stack gap="md">
        <RouteTabs basePath={`/dashboard/matches/${matchId}`} tabs={TABS} iconSize={16} />
        <Outlet context={{ match } satisfies MatchDetailContext} />
      </Stack>
    </Stack>
  );
};

export default MatchDetailPage;
