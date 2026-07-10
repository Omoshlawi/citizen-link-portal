import React, { useState } from 'react';
import { Button, Group, Stack } from '@mantine/core';
import { FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { handleApiErrors, uploadStaticFile } from '@/lib/api';
import { ImageUpload } from '@/features/cases/components';
import { useSystemSettingsApi } from '../hooks';

type LogoUploadFormProps = {
  onClose?: () => void;
};

const LogoUploadForm: React.FC<LogoUploadFormProps> = ({ onClose }) => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateSetting, mutateSettings } = useSystemSettingsApi();

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }
    try {
      setLoading(true);
      const key = await uploadStaticFile(files[0]);
      await updateSetting('branding.logo_key', { value: key, isPublic: true });
      mutateSettings();
      showNotification({
        title: 'Success',
        message: 'Logo uploaded successfully',
        color: 'green',
        position: 'top-right',
      });
      onClose?.();
    } catch (error) {
      const e = handleApiErrors(error);
      if (e.detail) {
        showNotification({
          title: 'Error uploading logo',
          message: e.detail,
          color: 'red',
          position: 'top-right',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <ImageUpload
        multiple={false}
        maxFiles={1}
        accept={IMAGE_MIME_TYPE}
        uploading={loading}
        onFilesChange={setFiles}
        label="Logo"
        description="Upload the platform logo. Stored publicly and served to the apps and website."
      />
      <Group justify="flex-end">
        <Button onClick={handleUpload} disabled={files.length === 0 || loading} loading={loading}>
          Upload
        </Button>
      </Group>
    </Stack>
  );
};

export default LogoUploadForm;
