import { Outlet } from 'react-router-dom';
import {
  AppShell,
  Box,
  Center,
  Container,
  Grid,
  Group,
  Paper,
  rem,
  Text,
  Title,
} from '@mantine/core';
import { ColorSchemeToggle, Logo } from '@/components';
import { useBrand } from '@/hooks/usePublicConfig';

const AuthLayout = () => {
  const brand = useBrand();
  return (
    <AppShell>
      <AppShell.Main p={0}>
        <Grid gutter={0} style={{ minHeight: '100vh' }}>
          {/* Left panel: brand identity */}
          <Grid.Col
            span={{ base: 12, md: 5, lg: 5 }}
            style={{
              background:
                'linear-gradient(160deg, var(--mantine-color-civicNavy-7) 0%, var(--mantine-color-civicNavy-9) 100%)',
              color: 'white',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2.5rem',
              overflow: 'hidden',
            }}
            visibleFrom="md"
          >
            {/* Decorative circle */}
            <Box
              pos="absolute"
              style={{
                bottom: '-12%',
                right: '-18%',
                width: rem(520),
                height: rem(520),
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, var(--mantine-color-civicBlue-4) 0%, transparent 70%)',
                opacity: 0.18,
                zIndex: 0,
              }}
            />
            {/* Second decorative circle */}
            <Box
              pos="absolute"
              style={{
                top: '-8%',
                left: '-15%',
                width: rem(380),
                height: rem(380),
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.06)',
                zIndex: 0,
              }}
            />

            {/* Logo */}
            <Box style={{ zIndex: 1, position: 'relative' }}>
              <Logo />
            </Box>

            {/* Hero text */}
            <Box style={{ zIndex: 1, position: 'relative' }}>
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                style={{
                  color: 'var(--mantine-color-civicGold-5)',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                Staff Portal
              </Text>
              <Title
                order={1}
                style={{
                  fontSize: rem(44),
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  fontWeight: 800,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                Manage civic <br />
                services{' '}
                <Text
                  component="span"
                  inherit
                  style={{ color: 'var(--mantine-color-civicGold-5)' }}
                >
                  with confidence.
                </Text>
              </Title>
              <Text
                size="md"
                style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}
                maw={400}
              >
                Review cases, verify found documents, manage claims, and coordinate citizen
                services — all from one secure platform.
              </Text>
            </Box>

            {/* Footer */}
            <Box style={{ zIndex: 1, position: 'relative' }}>
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                &copy; {new Date().getFullYear()} {brand.copyrightHolder}. All rights reserved.
              </Text>
            </Box>
          </Grid.Col>

          {/* Right panel: form */}
          <Grid.Col span={{ base: 12, md: 7, lg: 7 }} style={{ position: 'relative' }}>
            <Box pos="absolute" top={rem(20)} right={rem(20)} style={{ zIndex: 10 }}>
              <ColorSchemeToggle />
            </Box>

            <Center
              style={{
                height: '100vh',
                padding: 'var(--mantine-spacing-xl)',
                backgroundColor: 'var(--mantine-color-body)',
              }}
            >
              <Container size="xs" w="100%">
                <Box hiddenFrom="md" mb="lg" ta="center">
                  <Group justify="center">
                    <Logo />
                  </Group>
                </Box>

                <Paper p={{ base: 0, sm: 'xl' }} bg="transparent">
                  <Outlet />
                </Paper>
              </Container>
            </Center>
          </Grid.Col>
        </Grid>
      </AppShell.Main>
    </AppShell>
  );
};

export default AuthLayout;
