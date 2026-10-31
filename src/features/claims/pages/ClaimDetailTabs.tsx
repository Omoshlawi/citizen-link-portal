import { useMemo, useState } from 'react';
import { ActionIcon, Box, Divider, Image, Paper, SimpleGrid, Table, Text } from '@mantine/core';
import { TablerIcon } from '@/components';
import { ExchangesPanel } from '@/features/cases/components';
import { useAppColors } from '@/hooks/useAppColors';
import { useClaimDetail } from './ClaimDetailPage';

export const ClaimCasesComparisonTab = () => {
  const { comparisons } = useClaimDetail();
  return (
    <Paper p={0} flex={1} w="100%" style={{ overflow: 'auto' }}>
      <Table variant="vertical" layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td w={160}>Field name</Table.Td>
            <Table.Td w={160}>Lost</Table.Td>
            <Table.Td w={160}>Found</Table.Td>
          </Table.Tr>

          {comparisons.map((comparison, i) => (
            <Table.Tr key={i}>
              <Table.Td>{comparison.field}</Table.Td>
              <Table.Th>{comparison.lost}</Table.Th>
              <Table.Th>{comparison.found}</Table.Th>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};

export const ClaimAttachmentsTab = () => {
  const { claim, foundCase } = useClaimDetail();
  const attachments = useMemo(() => claim.attachments ?? [], [claim]);
  const images = useMemo(() => foundCase?.case?.document?.images ?? [], [foundCase]);
  const [selectedimageIndex, setSelectedimageindex] = useState(0);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const { bgColor } = useAppColors();
  const selectedImage = `/api/files/stream?fileName=${images[selectedimageIndex]?.url}`;
  const selectedAttachment = `/api/files/stream?fileName=${attachments[selectedAttachmentIndex]?.storageKey}`;
  const navigateImage = (direction: number) => {
    setSelectedimageindex((prev) => (prev + direction + images.length) % images.length);
  };
  const navigateAttachment = (direction: number) => {
    setSelectedAttachmentIndex(
      (prev) => (prev + direction + attachments.length) % attachments.length
    );
  };

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }}>
      <Paper bg={bgColor} p="md">
        <Text fw="bold">Found Document</Text>
        <Divider mb="md" />

        <Box style={{ position: 'relative' }}>
          <Image
            src={selectedImage}
            fit="contain"
            radius="md"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
            style={{ width: '100%', height: '100%' }}
          />

          {images.length > 1 && (
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                pointerEvents: 'none', // allow only buttons to capture clicks
              }}
            >
              <ActionIcon
                onClick={() => navigateImage(-1)}
                radius="xl"
                variant="filled"
                style={{ pointerEvents: 'auto' }}
              >
                <TablerIcon name="chevronLeft" />
              </ActionIcon>

              <ActionIcon
                onClick={() => navigateImage(1)}
                radius="xl"
                variant="filled"
                style={{ pointerEvents: 'auto' }}
              >
                <TablerIcon name="chevronRight" />
              </ActionIcon>
            </Box>
          )}
        </Box>
      </Paper>
      <Paper bg={bgColor} p="md">
        <Text fw="bold">Attached Support document</Text>
        <Divider mb="md" />
        <Box style={{ position: 'relative' }}>
          <Image
            src={selectedAttachment}
            style={{ width: '100%' }}
            fit="contain"
            radius="md"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
          />
          {attachments.length > 1 && (
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                pointerEvents: 'none',
              }}
            >
              <ActionIcon
                onClick={() => navigateAttachment(-1)}
                radius="xl"
                variant="filled"
                style={{ pointerEvents: 'auto' }}
              >
                <TablerIcon name="chevronLeft" />
              </ActionIcon>

              <ActionIcon
                onClick={() => navigateAttachment(1)}
                radius="xl"
                variant="filled"
                style={{ pointerEvents: 'auto' }}
              >
                <TablerIcon name="chevronRight" />
              </ActionIcon>
            </Box>
          )}
        </Box>
        {attachments.length > 1 && (
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            {selectedAttachmentIndex + 1} / {attachments.length}
          </Text>
        )}
      </Paper>
    </SimpleGrid>
  );
};

export const ClaimExchangesTab = () => {
  const { claim } = useClaimDetail();
  return claim.foundDocumentCaseId ? (
    <ExchangesPanel foundCaseId={claim.foundDocumentCaseId} />
  ) : null;
};
