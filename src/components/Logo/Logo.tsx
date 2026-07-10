import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Text } from '@mantine/core';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import styles from './Logo.module.css';

type LogoProps = {
  // Retained for call-site compatibility; the logo is now a single dynamic image.
  mode?: 'name' | 'icon' | 'vertical' | 'horizontal';
};

const Logo: FC<LogoProps> = () => {
  const { logoUrl, appName } = usePublicConfig();

  return (
    <Box
      className={styles.logoContainer}
      component={Link}
      to="/"
      style={{ textDecoration: 'none' }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={appName}
          h={40}
          w="auto"
          fit="contain"
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <Text fw={800} size="xl" c="civicNavy.7" style={{ cursor: 'pointer' }}>
          {appName}
        </Text>
      )}
    </Box>
  );
};

export default Logo;
