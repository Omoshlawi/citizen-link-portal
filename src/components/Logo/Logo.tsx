import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, useComputedColorScheme } from '@mantine/core';
import symbol from '@/assets/brand/brand-symbol.png';
import wordmarkDark from '@/assets/brand/brand-wordmark-dark.png';
import wordmark from '@/assets/brand/brand-wordmark.png';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import styles from './Logo.module.css';

type LogoProps = {
  /** `icon` = symbol only; every other mode = symbol + wordmark (no tagline). */
  mode?: 'name' | 'icon' | 'vertical' | 'horizontal';
  /** Force the white-lettering variant (e.g. on the navy auth hero), whatever the colour scheme. */
  onDark?: boolean;
  /** Rendered height in px. */
  height?: number;
};

/**
 * Bundled brand logo. Branding rarely changes, so it ships with the app rather
 * than being fetched from S3 — the S3 branding images are for email and print
 * templates only.
 */
const Logo: FC<LogoProps> = ({ mode = 'horizontal', onDark = false, height = 40 }) => {
  const { appName } = usePublicConfig();
  const isDark = useComputedColorScheme('light') === 'dark';
  const src = mode === 'icon' ? symbol : onDark || isDark ? wordmarkDark : wordmark;

  return (
    <Box
      className={styles.logoContainer}
      component={Link}
      to="/"
      style={{ textDecoration: 'none' }}
    >
      <Image
        src={src}
        alt={appName}
        h={height}
        w="auto"
        fit="contain"
        style={{ cursor: 'pointer' }}
      />
    </Box>
  );
};

export default Logo;
