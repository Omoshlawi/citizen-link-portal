import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const APP_SCHEME = 'citizenlinkapp';

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=app.citizenlink';

const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{16,512}$/;
const CODE_PATTERN = /^\d{4,8}$/;

export type Target = {
  /** Path after citizenlinkapp:// — must match the Expo Router route exactly. */
  appPath: (value: string) => string;
  /** Where the value comes from: a path segment or a query parameter. */
  param: 'id' | 'token' | 'code';
  /** Validated before the value is interpolated into any URL. */
  pattern: RegExp;
  /**
   * Existing portal route that can complete the same action in a browser.
   * Only auth targets have one — there is no citizen-facing web view for a
   * case, claim, match or wallet, so those can only be finished in the app.
   */
  webPath?: (value: string) => string;
  label: string;
};

/**
 * Allowlist of the routes an email CTA may bounce into, keyed by URL segment.
 *
 * Deliberately not driven by a `?to=<url>` parameter: that would make this an
 * open redirect on a domain whose emails carry handover codes, payment receipts
 * and password-reset tokens. Only the value is untrusted, and it is
 * pattern-checked before it is interpolated.
 */
export const TARGETS: Record<string, Target> = {
  // Domain targets — app only.
  'document-case': {
    appPath: (id) => `document-case/${id}`,
    param: 'id',
    pattern: ID_PATTERN,
    label: 'your case',
  },
  claims: {
    appPath: (id) => `claims/${id}`,
    param: 'id',
    pattern: ID_PATTERN,
    label: 'your claim',
  },
  match: {
    appPath: (id) => `match/${id}`,
    param: 'id',
    pattern: ID_PATTERN,
    label: 'your match',
  },
  wallet: {
    appPath: () => 'wallet',
    param: 'id',
    pattern: /^$/,
    label: 'your wallet',
  },

  // Auth targets — app first, portal as the browser path. Note the asymmetry:
  // two sit under auth/ in the mobile app and change-email-verify does not.
  'verify-email': {
    appPath: (token) => `auth/verify-email?token=${token}`,
    param: 'token',
    pattern: TOKEN_PATTERN,
    webPath: (token) => `/verify-email?token=${token}`,
    label: 'your account',
  },
  'reset-password': {
    appPath: (token) => `auth/reset-password?token=${token}`,
    param: 'token',
    pattern: TOKEN_PATTERN,
    webPath: (token) => `/reset-password?token=${token}`,
    label: 'your password reset',
  },
  'change-email-verify': {
    appPath: (token) => `change-email-verify?token=${token}`,
    param: 'token',
    pattern: TOKEN_PATTERN,
    webPath: (token) => `/change-email-verify?token=${token}`,
    label: 'your email change',
  },

  // Printed on every courier delivery label.
  'confirm-delivery': {
    appPath: (code) => `confirm-delivery?code=${code}`,
    param: 'code',
    pattern: CODE_PATTERN,
    label: 'your delivery',
  },
};

export type ResolvedTarget = {
  /** The citizenlinkapp:// URL, or null when the route is not allowlisted. */
  url: string | null;
  /** Portal route that completes the same action in a browser, when one exists. */
  webUrl: string | null;
  label: string;
};

/** Pure resolver — exported so the allowlist can be tested without a router. */
export const resolveTarget = (
  resource: string | undefined,
  value: string,
): ResolvedTarget => {
  const entry = resource ? TARGETS[resource] : undefined;
  if (!entry || !entry.pattern.test(value)) {
    return { url: null, webUrl: null, label: '' };
  }
  return {
    url: `${APP_SCHEME}://${entry.appPath(value)}`,
    webUrl: entry.webPath ? entry.webPath(value) : null,
    label: entry.label,
  };
};

/** Custom schemes do nothing in a desktop browser, so only phones attempt one. */
const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export type DeepLinkTarget = ResolvedTarget & {
  isMobile: boolean;
  openApp: () => void;
};

/**
 * Resolves `/open/:resource/:id?` — taking the value from the path segment or
 * from `?token=` / `?code=`, depending on what the target declares.
 */
export const useDeepLink = (): DeepLinkTarget => {
  const { resource, id } = useParams<{ resource: string; id?: string }>();
  const [searchParams] = useSearchParams();

  const resolved = useMemo(() => {
    const entry = resource ? TARGETS[resource] : undefined;
    if (!entry) {return { url: null, webUrl: null, label: '' };}

    const value =
      entry.param === 'id'
        ? (id ?? '')
        : (searchParams.get(entry.param) ?? '');

    return resolveTarget(resource, value);
  }, [resource, id, searchParams]);

  const isMobile = useMemo(isMobileDevice, []);

  const openApp = useCallback(() => {
    if (resolved.url) {window.location.href = resolved.url;}
  }, [resolved.url]);

  return { ...resolved, isMobile, openApp };
};

/** Resolves `/delivery/confirm?code=…`, the URL printed on courier labels. */
export const useDeliveryConfirmLink = (): DeepLinkTarget => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';

  const resolved = useMemo(
    () => resolveTarget('confirm-delivery', code),
    [code],
  );
  const isMobile = useMemo(isMobileDevice, []);

  const openApp = useCallback(() => {
    if (resolved.url) {window.location.href = resolved.url;}
  }, [resolved.url]);

  return { ...resolved, isMobile, openApp };
};
