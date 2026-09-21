import { useCallback } from 'react';
import {
  IconBrightnessAutoFilled,
  IconBrightnessDownFilled,
  IconMoonFilled,
} from '@tabler/icons-react';
import { ActionIcon, Button, Group, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const toggleTheme = useCallback(() => {
    switch (colorScheme) {
      case 'light':
        setColorScheme('dark');
        break;
      case 'dark':
        setColorScheme('auto');
        break;
      default:
        setColorScheme('light');
    }
  }, [setColorScheme, colorScheme]);

  return (
    <ActionIcon
      variant="light"
      aria-label="Theme Settings"
      onClick={toggleTheme}
      size="lg"
      radius="xl"
    >
      {colorScheme === 'dark' && <IconMoonFilled stroke={1.5} />}
      {colorScheme === 'light' && <IconBrightnessDownFilled stroke={1.5} />}
      {colorScheme === 'auto' && <IconBrightnessAutoFilled stroke={1.5} />}
    </ActionIcon>
  );

  return (
    <Group justify="center" mt="xl">
      <Button onClick={() => setColorScheme('light')}>Light</Button>
      <Button onClick={() => setColorScheme('dark')}>Dark</Button>
      <Button onClick={() => setColorScheme('auto')}>Auto</Button>
    </Group>
  );
}
