import { useEffect } from 'react';
import { usePublicConfig } from '@/hooks/usePublicConfig';

/**
 * Keeps the document title in sync with the branded app name from public config.
 * Renders nothing; must be mounted inside ApiConfigProvider (SWR context).
 */
const BrandMeta = () => {
  const { appName } = usePublicConfig();

  useEffect(() => {
    if (appName) {
      document.title = appName;
    }
  }, [appName]);

  return null;
};

export default BrandMeta;
