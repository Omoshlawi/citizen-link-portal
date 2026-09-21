// Link and Button are only used by the commented-out "Get Started" button below.
import { Outlet } from 'react-router-dom';
import { AppShell, Flex, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ColorSchemeToggle, Logo } from '@/components';
import { FooterCentered } from '@/components/Footer/Footer';

const LandingLayout = () => {
  const [opened] = useDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: true },
      }}
    >
      <AppShell.Header
        withBorder={false}
        bg="transparent"
        style={{ backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Flex align="center" justify="space-between" h="100%" px="xl" maw={1400} mx="auto">
          <Group gap="md" style={{ flex: '0 0 auto' }}>
            {/* <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" /> */}
            <Logo />
          </Group>

          <Group gap="sm" style={{ flex: '0 0 auto' }}>
            {/* Self-registration is disabled in the portal: citizens sign up
                in the mobile app, and staff accounts are created for them and
                the credentials issued. Kept rather than deleted so it can be
                switched back on.
            <Button
              variant="gradient"
              gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
              component={Link}
              to="/register"
              radius="xl"
              px="xl"
              visibleFrom="xs"
            >
              Get Started
            </Button>
            */}
            <ColorSchemeToggle />
          </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* <Stack gap="xs">
          <Button
            variant="subtle"
            component={Link}
            to="/about"
            onClick={close}
            fullWidth
            justify="flex-start"
          >
            About us
          </Button>
          <Button
            variant="subtle"
            component={Link}
            to="/how-it-works"
            onClick={close}
            fullWidth
            justify="flex-start"
          >
            How it works
          </Button>
          <Button
            variant="subtle"
            component={Link}
            to="/contact"
            onClick={close}
            fullWidth
            justify="flex-start"
          >
            Contact us
          </Button>
        </Stack> */}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      {/* TODO: Add footer */}
      <FooterCentered />
    </AppShell>
  );
};

export default LandingLayout;
