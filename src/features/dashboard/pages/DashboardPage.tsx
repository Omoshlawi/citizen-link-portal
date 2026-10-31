import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Box,
  Divider,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from '@mantine/core';
import { TablerIcon, TablerIconName } from '@/components/TablerIcon';
import { useDocumentCases } from '@/features/cases/hooks';
import { FoundDocumentCaseStatus, LostDocumentCaseStatus } from '@/features/cases/types';
import { useClaims } from '@/features/claims/hooks';
import { ClaimStatus } from '@/features/claims/types';

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  description: string;
  icon: TablerIconName;
  color: string;
  count: number;
  isLoading: boolean;
  linkTo: string;
}

function KpiCard({ label, description, icon, color, count, isLoading, linkTo }: KpiCardProps) {
  const colorScheme = useComputedColorScheme();
  return (
    <Box
      style={(theme) => ({
        border: `1px solid ${theme.colors.dark[colorScheme === 'dark' ? 6 : 2] ?? 'var(--mantine-color-default-border)'}`,
        borderLeft: `3px solid var(--mantine-color-${color}-6)`,
        padding: 'var(--mantine-spacing-md)',
        backgroundColor: 'var(--mantine-color-body)',
      })}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
          {label}
        </Text>
        <TablerIcon
          name={icon}
          size={18}
          stroke={1.5}
          style={{ color: `var(--mantine-color-${color}-6)` }}
        />
      </Group>

      {isLoading ? (
        <Skeleton height={36} width={60} mb={4} />
      ) : (
        <Title
          order={2}
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 800,
            color: `var(--mantine-color-${color}-6)`,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {count}
        </Title>
      )}

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {description}
        </Text>
        <Anchor component={Link} to={linkTo} size="xs" c={`${color}.6`}>
          View →
        </Anchor>
      </Group>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const foundSubmitted = useDocumentCases({
    caseType: 'FOUND',
    status: FoundDocumentCaseStatus.SUBMITTED,
    limit: 1,
  });
  const foundDraft = useDocumentCases({
    caseType: 'FOUND',
    status: FoundDocumentCaseStatus.DRAFT,
    limit: 1,
  });
  const lostActive = useDocumentCases({
    caseType: 'LOST',
    status: LostDocumentCaseStatus.SUBMITTED,
    limit: 1,
  });
  const claimsPending = useClaims({ status: ClaimStatus.PENDING, limit: 1 });
  const claimsUnderReview = useClaims({ status: ClaimStatus.UNDER_REVIEW, limit: 1 });

  return (
    <Stack gap="xl">
      {/* Page header */}
      <Box>
        <Group justify="space-between" align="center" mb="xs">
          <Stack gap={0}>
            <Title
              order={4}
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
            >
              Overview
            </Title>
            <Text size="xs" c="dimmed">
              Staff dashboard — {dayjs().format('dddd, DD MMMM YYYY')}
            </Text>
          </Stack>
        </Group>
        <Divider />
      </Box>

      {/* KPI grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <KpiCard
          label="Awaiting Verification"
          description="Found cases submitted, pending staff review"
          icon="fileCheck"
          color="civicBlue"
          count={foundSubmitted.totalCount}
          isLoading={foundSubmitted.isLoading}
          linkTo="/dashboard/cases/found?status=SUBMITTED"
        />
        <KpiCard
          label="Pending Collection"
          description="Found cases in draft awaiting collection"
          icon="packageImport"
          color="teal"
          count={foundDraft.totalCount}
          isLoading={foundDraft.isLoading}
          linkTo="/dashboard/cases/found?status=DRAFT"
        />
        <KpiCard
          label="Active Lost Cases"
          description="Open lost document reports"
          icon="fileSearch"
          color="civicNavy"
          count={lostActive.totalCount}
          isLoading={lostActive.isLoading}
          linkTo="/dashboard/cases/lost?status=SUBMITTED"
        />
        <KpiCard
          label="Claims Pending"
          description="Claims awaiting staff review"
          icon="filterQuestion"
          color="civicGold"
          count={claimsPending.totalCount}
          isLoading={claimsPending.isLoading}
          linkTo="/dashboard/claims?status=PENDING"
        />
        <KpiCard
          label="Claims Under Review"
          description="Claims awaiting staff review"
          icon="filterQuestion"
          color="civicGold"
          count={claimsUnderReview.totalCount}
          isLoading={claimsUnderReview.isLoading}
          linkTo="/dashboard/claims?status=UNDER_REVIEW"
        />
      </SimpleGrid>
    </Stack>
  );
}
