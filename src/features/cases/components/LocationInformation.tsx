import React from 'react';
import { Grid, Group, Stack, Text } from '@mantine/core';
import { SectionTitle } from '@/components';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import { CaseType, DocumentCase } from '../types';

interface LocationProps {
  documentCase: DocumentCase;
  reportType: CaseType;
  status: string;
}

const LocationInformation: React.FC<LocationProps> = ({ documentCase }) => {
  const { addressLocaleSpec } = usePublicConfig();

  const levelLabel = (level: string) =>
    addressLocaleSpec?.levels.find((spec) => spec.level === level)?.label ??
    `Administrative Level ${level.replace('level', '')}`;

  const rows = [
    { label: levelLabel('level1'), value: documentCase.level1 },
    { label: levelLabel('level2'), value: documentCase.level2 },
    { label: levelLabel('level3'), value: documentCase.level3 },
    { label: 'Place', value: documentCase.place },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <SectionTitle label="Location Information" />
      </Group>
      <Grid>
        {rows.map(({ label, value }) => (
          <Grid.Col key={label} span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              {label}
            </Text>
            <Text>{value || 'N/A'}</Text>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

export default LocationInformation;
