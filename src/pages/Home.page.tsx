import classes from '../components/Welcome/Welcome.module.scss';
import { Link } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from '@mantine/core';
import { TablerIcon } from '@/components';
import { useDocumentTypes } from '@/features/admin/hooks';
import { Dots } from '../components/Welcome/Dots';
import { useBrand } from '@/hooks/usePublicConfig';

export function HomePage() {
  const { documentTypes } = useDocumentTypes();
  const colorScheme = useComputedColorScheme();
  const brand = useBrand();
  const features = [
    {
      icon: 'brain',
      title: 'AI Data Extraction',
      description:
        'Advanced Vision and LLM engines instantly classify, extract, and normalize document data with high confidence.',
    },
    {
      icon: 'shieldCheck',
      title: 'Secure & Verified Matching',
      description:
        'Canonical data structures and LLM confidence scoring ensure only rightful owners are matched to their documents.',
    },
    {
      icon: 'vectorTriangle',
      title: 'Semantic Search Engine',
      description:
        'Embeddings-powered search goes beyond exact matches — finding the right document even with partial or imperfect data.',
    },
    {
      icon: 'mapPin',
      title: 'Nationwide Station Network',
      description:
        `Drop off or collect verified documents at any ${brand.appName} partner station, or request doorstep delivery.`,
    },
    {
      icon: 'lock',
      title: 'Privacy-First by Design',
      description:
        'Sensitive document details are never exposed publicly. Only verified owners can view or act on a match.',
    },
    {
      icon: 'reportMoney',
      title: 'Transparent & Affordable Fees',
      description:
        'A small recovery fee is only generated after a successful, staff-approved match — zero upfront cost.',
    },
  ];

  const steps = [
    {
      icon: 'scan',
      step: '01',
      title: 'Scan or Report',
      description:
        'Upload a photo of the found document or describe what you lost. Our AI handles all extraction automatically — no tedious forms.',
    },
    {
      icon: 'sparkles',
      step: '02',
      title: 'AI Finds the Match',
      description:
        'Our semantic engine searches indexed cases instantly, scores each potential match, and alerts you the moment something is found.',
    },
    {
      icon: 'home',
      step: '03',
      title: 'Claim & Collect',
      description:
        'Verify ownership in a few clicks, pay a small fee, then collect at your nearest station or have it delivered to your door.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Documents Indexed' },
    { value: '47', label: 'Partner Stations' },
    { value: '98%', label: 'Match Accuracy' },
    { value: '<2 min', label: 'Avg. Scan Time' },
  ];

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <Box pos="relative" bg="dark.7" style={{ overflow: 'hidden' }}>
        <Box
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundImage:
              'radial-gradient(ellipse at top right, rgba(34,139,230,0.35) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(21,170,191,0.35) 0%, transparent 60%)',
            zIndex: 0,
          }}
        />

        <Container
          size="lg"
          pos="relative"
          style={{ zIndex: 1, paddingTop: rem(130), paddingBottom: rem(130) }}
        >
          <div className={classes.inner}>
            <Dots className={classes.dots} style={{ left: 0, top: 0 }} />
            <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
            <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
            <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

            {/* Eyebrow badge */}
            <Group justify="center" mb="lg">
              <Badge
                size="lg"
                radius="xl"
                variant="gradient"
                gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
                leftSection={<TablerIcon name="sparkles" size={14} />}
              >
                AI-Native Document Recovery
              </Badge>
            </Group>

            <Title
              order={1}
              ta="center"
              style={{
                fontSize: rem(68),
                fontWeight: 900,
                lineHeight: 1.08,
                color: 'white',
                letterSpacing: '-1.5px',
              }}
            >
              Your Lost Document,{' '}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
                inherit
              >
                Found.
              </Text>
            </Title>

            <Text
              ta="center"
              c="gray.3"
              size="xl"
              maw={640}
              mx="auto"
              mt="lg"
              mb={rem(48)}
              style={{ lineHeight: 1.65 }}
            >
              {brand.appName} uses AI vision extraction and semantic search to reunite people with their
              lost identity documents — securely, quickly, and with full privacy protection.
            </Text>

            <Group justify="center" gap="lg">
              <Button
                component={Link}
                to="/register"
                size="xl"
                radius="xl"
                variant="gradient"
                gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
              >
                Get Started Free
              </Button>
              <Button
                component={Link}
                to="/login"
                size="xl"
                radius="xl"
                variant="white"
                color="dark"
              >
                Sign In
              </Button>
            </Group>
          </div>
        </Container>
      </Box>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <Box
        style={{
          background: 'linear-gradient(90deg, #0f1923 0%, #0d2137 50%, #0f1923 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
        py={rem(44)}
      >
        <Container size="lg">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xl">
            {stats.map((stat, i) => (
              <Stack key={i} align="center" gap={4}>
                <Text
                  style={{
                    fontSize: rem(42),
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  c="gray.4"
                  size="sm"
                  fw={500}
                  tt="uppercase"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {stat.label}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <Container size="lg" py={rem(100)}>
        <Badge
          size="md"
          radius="xl"
          variant="light"
          color="cyan"
          mb="md"
          style={{ display: 'block', width: 'fit-content', margin: '0 auto' }}
        >
          Simple by design
        </Badge>
        <Title order={2} ta="center" mb="sm" style={{ fontSize: rem(36), fontWeight: 800 }}>
          Reunited in 3 Steps
        </Title>
        <Text c="dimmed" ta="center" maw={560} mx="auto" mb={rem(60)} size="lg">
          From scan to handover — the entire process is automated, guided, and takes just minutes.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={rem(40)}>
          {steps.map((step, index) => (
            <Box key={index} pos="relative">
              {/* Connector line between steps (visible on sm+) */}
              {index < steps.length - 1 && (
                <Box
                  pos="absolute"
                  top={rem(30)}
                  right={rem(-20)}
                  w={rem(40)}
                  h={2}
                  bg="linear-gradient(90deg, #0ea5e9, #6366f1)"
                  style={{ display: 'none', '@media(min-width:48em)': { display: 'block' } }}
                />
              )}

              <Group mb="md" align="center" gap="sm">
                <Text
                  style={{
                    fontSize: rem(52),
                    fontWeight: 900,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.25,
                    userSelect: 'none',
                    minWidth: rem(60),
                  }}
                >
                  {step.step}
                </Text>
                <ThemeIcon
                  size={52}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
                >
                  <TablerIcon name={step.icon as any} size={26} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Text fz="xl" fw={700} mb="xs">
                {step.title}
              </Text>
              <Text fz="md" c="dimmed" style={{ lineHeight: 1.65 }}>
                {step.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Divider mx="xl" />

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <Container size="lg" py={rem(100)}>
        <Badge
          size="md"
          radius="xl"
          variant="light"
          color="indigo"
          mb="md"
          style={{ display: 'block', width: 'fit-content', margin: '0 auto' }}
        >
          Built different
        </Badge>
        <Title order={2} ta="center" mb="sm" style={{ fontSize: rem(36), fontWeight: 800 }}>
          Why Choose {brand.appName}?
        </Title>
        <Text c="dimmed" ta="center" maw={580} mx="auto" mb={rem(60)} size="lg">
          Engineered to simplify recovery, maximize reach, and protect your data throughout the
          entire process.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {features.map((feature, index) => (
            <Card
              key={index}
              shadow="sm"
              radius="lg"
              padding="xl"
              withBorder
              style={{
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(14,165,233,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <ThemeIcon
                size={56}
                radius="xl"
                variant="gradient"
                gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
                mb="lg"
              >
                <TablerIcon name={feature.icon as any} size={28} stroke={1.5} />
              </ThemeIcon>
              <Text fz="lg" fw={700} mb="xs">
                {feature.title}
              </Text>
              <Text fz="sm" c="dimmed" style={{ lineHeight: 1.65 }}>
                {feature.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* ─── Supported Documents ──────────────────────────────────────────── */}
      <Box bg="dark.7" py={rem(100)} c="white">
        <Container size="lg">
          <Badge
            size="md"
            radius="xl"
            variant="light"
            color="cyan"
            mb="md"
            style={{ display: 'block', width: 'fit-content', margin: '0 auto' }}
          >
            Wide coverage
          </Badge>
          <Title order={2} ta="center" mb="sm" style={{ fontSize: rem(36), fontWeight: 800 }}>
            Supported Identity Documents
          </Title>
          <Text c="gray.4" ta="center" maw={580} mx="auto" mb={rem(60)} size="lg">
            Our AI engine natively parses, validates, and normalizes each document type with strict
            structures for perfect matching.
          </Text>

          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="lg">
            {documentTypes.map((doc) => (
              <Card
                key={doc.id}
                bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
                radius="md"
                ta="center"
                padding="lg"
                withBorder
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  transition: 'border-color 200ms ease, background 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    colorScheme === 'dark' ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.5)';
                  e.currentTarget.style.background =
                    colorScheme === 'dark' ? 'rgba(14,165,233,0.06)' : 'rgba(14,165,233,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.background = '';
                }}
              >
                <ThemeIcon size={48} radius="xl" variant="light" color="cyan" mx="auto" mb="md">
                  <TablerIcon name={doc.icon as any} size={24} />
                </ThemeIcon>
                <Text
                  fw={600}
                  size="xs"
                  tt="uppercase"
                  c={colorScheme === 'dark' ? 'white' : 'dimmed'}
                  style={{ letterSpacing: '0.5px' }}
                >
                  {doc.name}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ─── CTA Footer ───────────────────────────────────────────────────── */}
      <Box
        py={rem(100)}
        style={{
          background:
            'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%)',
        }}
      >
        <Container size="md" ta="center">
          <ThemeIcon
            size={64}
            radius="xl"
            variant="gradient"
            gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
            mx="auto"
            mb="lg"
          >
            <TablerIcon name="heart" size={32} stroke={1.5} />
          </ThemeIcon>
          <Title order={2} mb="sm" style={{ fontSize: rem(32), fontWeight: 800 }}>
            Ready to recover what's yours?
          </Title>
          <Text c="dimmed" size="lg" maw={500} mx="auto" mb="xl">
            Join thousands of citizens already using {brand.appName} to safely recover their most
            important documents.
          </Text>
          <Group justify="center" gap="md">
            <Button
              component={Link}
              to="/register"
              size="lg"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'civicBlue.6', to: 'civicNavy.7' }}
            >
              Create Free Account
            </Button>
            <Button component={Link} to="/found" size="lg" radius="xl" variant="light" color="cyan">
              Report a Found Document
            </Button>
          </Group>
        </Container>
      </Box>
    </>
  );
}
