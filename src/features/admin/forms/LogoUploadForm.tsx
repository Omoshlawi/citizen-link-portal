import React, { useState } from 'react';
import { Button, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { ImageUpload } from '@/features/cases/components';
import { handleApiErrors, uploadStaticFile } from '@/lib/api';
import { useSystemSettingsApi } from '../hooks';

type LogoUploadFormProps = {
  onClose?: () => void;
};

/**
 * Branding images used by server-rendered templates only — the portal, website
 * and app bundle their own logos.
 */
const TARGETS = {
  emailHeader: {
    setting: 'branding.email_header_key',
    label: 'Email header',
    hint: 'Full-width banner at the top of every email. 1200 × 300 px PNG (shown at 600 px wide).',
  },
  printLogo: {
    setting: 'branding.logo_key',
    label: 'Print logo',
    hint: 'Compact logo on delivery labels and invoices — symbol and name, no tagline. Transparent PNG, about 1300 × 300 px.',
  },
} as const;
type Target = keyof typeof TARGETS;

const LogoUploadForm: React.FC<LogoUploadFormProps> = ({ onClose }) => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target>('emailHeader');
  const { updateSetting, mutateSettings } = useSystemSettingsApi();

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }
    try {
      setLoading(true);
      const key = await uploadStaticFile(files[0]);
      await updateSetting(TARGETS[target].setting, { value: key, isPublic: true });
      mutateSettings();
      showNotification({
        title: 'Success',
        message: `${TARGETS[target].label} updated`,
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
      <SegmentedControl
        fullWidth
        value={target}
        onChange={(v) => setTarget(v as Target)}
        data={Object.entries(TARGETS).map(([value, t]) => ({ value, label: t.label }))}
      />
      <Text size="sm" c="dimmed">
        {TARGETS[target].hint}
      </Text>
      <ImageUpload
        multiple={false}
        maxFiles={1}
        accept={IMAGE_MIME_TYPE}
        uploading={loading}
        onFilesChange={setFiles}
        label="Email & print branding"
        description="Used only in emails and printable documents. The portal, website and app use their built-in logo."
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
