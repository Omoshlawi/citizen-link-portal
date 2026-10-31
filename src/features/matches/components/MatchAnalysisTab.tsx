import { Badge, Paper, Table, Text, ThemeIcon } from '@mantine/core';
import { SectionTitle, TablerIcon } from '@/components';
import { Match } from '../types';

interface MatchAnalysisTabProps {
  match: Match;
}

export const MatchAnalysisTab = ({ match }: MatchAnalysisTabProps) => {
  // Older or hand-inserted matches can carry `{}` here, so check the fields themselves.
  const fields = match.layer2FieldScores?.fields ?? [];

  if (fields.length === 0) {
    return (
      <Paper withBorder p="xl" ta="center">
        <TablerIcon name="databaseOff" size={48} color="dimmed" stroke={1.5} />
        <Text c="dimmed" mt="md">
          No detailed field analysis available for this match.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg">
      <SectionTitle label="Detailed Field Comparison" />
      <Table.ScrollContainer minWidth={800} mt="md">
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Field</Table.Th>
              <Table.Th ta="center">Match</Table.Th>
              <Table.Th>Lost Case (Trigger)</Table.Th>
              <Table.Th>Found Case (Candidate)</Table.Th>
              <Table.Th ta="center">Weight</Table.Th>
              <Table.Th ta="center">Score</Table.Th>
              <Table.Th ta="center">Impact</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {fields.map((f, i) => (
              <Table.Tr key={i}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {f.field.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </Table.Td>
                <Table.Td ta="center">
                  <ThemeIcon
                    size={20}
                    radius="xl"
                    color={f.matched ? 'green' : 'red'}
                    variant="light"
                  >
                    <TablerIcon name={f.matched ? 'check' : 'x'} size={12} />
                  </ThemeIcon>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace">
                    {f.triggerValue || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace">
                    {f.maskedCandidatevalue || f.candidateValue || '—'}
                  </Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text size="xs" c="dimmed">
                    {(f.weight * 100).toFixed(0)}%
                  </Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    size="xs"
                    variant="light"
                    color={f.score >= 0.8 ? 'green' : f.score >= 0.4 ? 'yellow' : 'red'}
                  >
                    {(f.score * 100).toFixed(0)}%
                  </Badge>
                </Table.Td>
                <Table.Td ta="center">
                  <Text size="xs" fw={700}>
                    +{(f.contribution * 100).toFixed(1)}%
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
