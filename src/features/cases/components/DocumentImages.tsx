/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  ActionIcon,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { TablerIcon } from '@/components';
import CaseDocumentImageUploadForm from '../forms/CaseDocumentImageUploadForm';
import { CaseType, Document, FoundDocumentCaseStatus, LostDocumentCaseStatus } from '../types';
import styles from './DocumentImage.module.css';

type Prop = {
  document: Document;
  reportType: CaseType;
  status: string;
};

const DocumentImages: React.FC<Prop> = ({ document, reportType, status }) => {
  const { images = [] } = document;
  const onUploadImage = () => {
    const modalId = modals.open({
      title: 'Upload Document Images',
      children: (
        <CaseDocumentImageUploadForm document={document} onClose={() => modals.close(modalId)} />
      ),
    });
  };
  const handleView = (url: string) => {
    modals.open({
      size: '90vw', // Sets the width to 90% of viewport width
      centered: true,
      withCloseButton: true,
      padding: 'xs',
      styles: {
        inner: {
          padding: '2vh',
        },
        content: {
          maxHeight: '96vh', // Sets the maximum height to 96% of viewport height
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          flex: 1, // Makes the body take the available space
          padding: 0, // Remove default padding
        },
      },
      children: (
        <Image
          src={url}
          height="100%"
          fit="contain"
          radius="md"
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      ),
    });
  };

  if (images.length === 0) {
    return (
      <div>
        <Group mb="md" justify="space-between">
          <Stack>
            <Title order={4}>Document Images</Title>
            <Text size="sm" c="dimmed" mb={4}>
              Scanned Images of the document
            </Text>
          </Stack>
          {/* <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<TablerIcon name="upload" size={16} />}
            onClick={onUploadImage}
            disabled={
              (reportType === 'FOUND' && status !== FoundDocumentCaseStatus.DRAFT) ||
              (reportType === 'LOST' && status !== LostDocumentCaseStatus.SUBMITTED)
            }
          >
            Upload Images
          </Button> */}
        </Group>
        <Card p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Stack align="center" gap="md">
            <TablerIcon name="photo" size={48} style={{ opacity: 0.3 }} />
            <Text c="dimmed">No images uploaded yet</Text>
            {/* <Button
              variant="light"
              color="green"
              size="sm"
              leftSection={<TablerIcon name="upload" size={16} />}
              onClick={onUploadImage}
              disabled={
                (reportType === 'FOUND' && status !== FoundDocumentCaseStatus.DRAFT) ||
                (reportType === 'LOST' && status !== LostDocumentCaseStatus.SUBMITTED)
              }
            >
              Upload Images
            </Button> */}
          </Stack>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Group mb="md" justify="space-between">
        <Stack>
          <Title order={4}>Document Images</Title>
          <Text size="sm" c="dimmed" mb={4}>
            Scanned Images of the document
          </Text>
        </Stack>
        {/* <Button
          variant="light"
          color="green"
          size="sm"
          leftSection={<TablerIcon name="upload" size={16} />}
          onClick={onUploadImage}
          disabled={
            (reportType === 'FOUND' && status !== FoundDocumentCaseStatus.DRAFT) ||
            (reportType === 'LOST' && status !== LostDocumentCaseStatus.SUBMITTED)
          }
        >
          Reupload
        </Button> */}
      </Group>

      <Grid gutter="lg">
        {images.map((image, index) => {
          const url = `/api/files/stream?fileName=${image.url}`;
          return (
            <Grid.Col key={index} span={{ base: 12, sm: images.length === 1 ? 12 : 6 }}>
              <Card
                p={0}
                radius="md"
                withBorder
                className={styles.imageCard}
                style={{ overflow: 'hidden' }}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={url}
                    height={images.length === 1 ? 500 : 400}
                    fit="cover"
                    radius="md"
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                  />
                  <Group gap="md" justify="center" className={styles.actionButtonsGroup}>
                    <Tooltip label="Filter Image and rescan">
                      <ActionIcon
                        color="teal"
                        variant="filled"
                        size="lg"
                        className={styles.actionButton}
                      >
                        <TablerIcon name="filter" size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Re-scan Document Image">
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="lg"
                        className={styles.actionButton}
                      >
                        <TablerIcon name="scan" size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Expand image">
                      <ActionIcon
                        variant="filled"
                        size="lg"
                        className={styles.actionButton}
                        onClick={() => handleView(url)}
                      >
                        <TablerIcon name="windowMaximize" size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </div>
                {images.length > 1 && (
                  <Text size="xs" c="dimmed" p="xs" ta="center" fw={500}>
                    Image {index + 1} of {images.length}
                  </Text>
                )}
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </div>
  );
};

export default DocumentImages;
