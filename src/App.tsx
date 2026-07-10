import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/tiptap/styles.css';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ApiConfigProvider } from '@/lib/api';
import { Router } from '@/Router';
import { theme } from '@/theme';
import BrandMeta from '@/components/BrandMeta';

export default function App() {
  return (
    <ApiConfigProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <BrandMeta />
          <Notifications />
          <Router />
        </ModalsProvider>
      </MantineProvider>
    </ApiConfigProvider>
  );
}
