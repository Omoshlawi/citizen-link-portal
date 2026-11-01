import React from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { TablerIcon } from '@/components';
import { useStaffGrantDetail } from '../hooks/useCustody';
import { StaffOperationScope } from '../types';

type ExpandedGrantRowProps = {
  userId: string;
  onRevoke: (grant: StaffOperationScope) => void;
};

/** Loads the staff member's grants only once their row is expanded. */
export const ExpandedGrantRow: React.FC<ExpandedGrantRowProps> = ({ userId, onRevoke }) => {
  const { detail, isLoading, error } = useStaffGrantDetail(userId);

  if (isLoading) {
    return (
      <Group py="sm" justify="center">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          Loading operations…
        </Text>
      </Group>
    );
  }

  if (error || !detail) {
    return (
      <Alert color="red" variant="light" my="xs" icon={<TablerIcon name="alertCircle" size={16} />}>
        Couldn't load this staff member's operations.
      </Alert>
    );
  }

  if (detail.stations.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="sm">
        No active operations.
      </Text>
    );
  }

  return (
    <Stack gap="sm" py="xs">
      {detail.stations.map((sg, i) => (
        <React.Fragment key={sg.stationId}>
          {i > 0 && <Divider />}
          <Box>
            <Group gap="xs" mb={6}>
              <TablerIcon name="building" size={14} />
              <Text size="sm" fw={600}>
                {sg.station?.name ?? sg.stationId}
              </Text>
              {sg.station?.code && (
                <Badge size="xs" variant="light" color="teal">
                  {sg.station.code}
                </Badge>
              )}
            </Group>
            <Group gap={6} wrap="wrap" pl={22}>
              {sg.operations.map((op) => (
                <Badge
                  key={op.id}
                  variant="light"
                  color="civicBlue"
                  size="sm"
                  rightSection={
                    <Tooltip label="Revoke" withArrow position="top">
                      <ActionIcon
                        size={12}
                        variant="transparent"
                        color="red"
                        onClick={() => onRevoke({ ...op, user: detail.user, station: sg.station })}
                        aria-label={`Revoke ${op.operationType?.name}`}
                      >
                        <TablerIcon name="x" size={10} />
                      </ActionIcon>
                    </Tooltip>
                  }
                >
                  {op.operationType?.name ?? op.operationTypeId}
                </Badge>
              ))}
            </Group>
          </Box>
        </React.Fragment>
      ))}
    </Stack>
  );
};
