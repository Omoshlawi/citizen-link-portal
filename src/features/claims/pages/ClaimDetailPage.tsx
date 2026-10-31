import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { DashboardPageHeader, ErrorState, RouteTab, RouteTabs } from '@/components';
import { ClaimActions, ClaimDetailSkeleton } from '../components';
import useCompareCases from '../hooks/use-compare-cases';
import { Claim } from '../types';

type ClaimDetailContext = Pick<
  ReturnType<typeof useCompareCases>,
  'comparisons' | 'foundCase' | 'match'
> & { claim: Claim };

/** Read the claim loaded by the `ClaimDetailPage` layout from inside a tab route. */
export const useClaimDetail = () => useOutletContext<ClaimDetailContext>();

const TABS: RouteTab[] = [
  { value: 'cases-comparison', label: 'Cases Comparison', icon: 'briefcase' },
  { value: 'attachments', label: 'Attachments Comparison', icon: 'paperclip' },
  { value: 'exchanges', label: 'Exchanges', icon: 'arrowsExchange' },
];

/** Layout route: each tab is a child path under `/dashboard/claims/:claimId`. */
const ClaimDetailPage = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const { claim, error, isLoading, comparisons, foundCase, match } = useCompareCases(claimId);

  if (isLoading) {
    return <ClaimDetailSkeleton />;
  }
  if (error || !claim) {
    return <ErrorState error={error} message="No report data available" title="Report Detail" />;
  }
  return (
    <Stack gap="xl">
      <DashboardPageHeader
        icon="filterQuestion"
        title={`${claim.claimNumber}`}
        subTitle={() => (
          <Group gap="sm">
            <Text c="dimmed">Claim detail</Text>
            <Badge size="xs">{claim.status}</Badge>
          </Group>
        )}
        traiiling={<ClaimActions claim={claim} />}
      />
      <Stack gap="md">
        <RouteTabs basePath={`/dashboard/claims/${claimId}`} tabs={TABS} iconSize={12} />
        <Outlet context={{ claim, comparisons, foundCase, match } satisfies ClaimDetailContext} />
      </Stack>
    </Stack>
  );
};

export default ClaimDetailPage;
