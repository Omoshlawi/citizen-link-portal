import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const APP_SCHEME = 'citizenlinkapp';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.citizenlink';

/**
 * Allowlist of the routes an email CTA may bounce into, keyed by URL segment.
 *
 * Deliberately path-based: accepting a `?to=<url>` parameter would make this an
 * open redirect on a domain whose emails carry handover codes and payment
 * receipts. The only untrusted input is the id, which is pattern-checked before
 * it is interpolated.
 */
type Target = {
  path: (id: string) => string;
  needsId: boolean;
  label: string;
};

const TARGETS: Record<string, Target> = {
  'document-case': {
    path: (id) => `document-case/${id}`,
    needsId: true,
    label: 'your case',
  },
  claims: { path: (id) => `claims/${id}`, needsId: true, label: 'your claim' },
  match: { path: (id) => `match/${id}`, needsId: true, label: 'your match' },
  wallet: { path: () => 'wallet', needsId: false, label: 'your wallet' },
};

const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
const CODE_PATTERN = /^\d{4,8}$/;

/** Custom schemes do nothing on a desktop browser, so only phones attempt one. */
const isMobileDevice = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export type DeepLinkTarget = {
  /** The citizenlinkapp:// URL, or null when the route is not allowlisted. */
  url: string | null;
  label: string;
  isMobile: boolean;
  openApp: () => void;
};

/** Resolves `/open/:resource/:id` into an app URL. */
export const useDeepLink = (): DeepLinkTarget => {
  const { resource, id } = useParams<{ resource: string; id?: string }>();

  const target = useMemo(() => {
    const entry = resource ? TARGETS[resource] : undefined;
    if (!entry) {
      return null;
    }
    if (!entry.needsId) {
      return { url: `${APP_SCHEME}://${entry.path('')}`, label: entry.label };
    }
    if (!id || !ID_PATTERN.test(id)) {
      return null;
    }
    return { url: `${APP_SCHEME}://${entry.path(id)}`, label: entry.label };
  }, [resource, id]);

  return useResolved(target?.url ?? null, target?.label ?? '');
};

/** Resolves `/delivery/confirm?code=…` into the confirm-delivery app URL. */
export const useDeliveryConfirmLink = (): DeepLinkTarget => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const url = CODE_PATTERN.test(code) ? `${APP_SCHEME}://confirm-delivery?code=${code}` : null;

  return useResolved(url, 'your delivery');
};

const useResolved = (url: string | null, label: string): DeepLinkTarget => {
  const isMobile = useMemo(isMobileDevice, []);

  const openApp = useCallback(() => {
    if (url) {
      window.location.href = url;
    }
  }, [url]);

  return { url, label, isMobile, openApp };
};
