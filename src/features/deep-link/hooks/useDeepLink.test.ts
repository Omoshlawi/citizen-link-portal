import { describe, expect, it } from 'vitest';
import { resolveTarget, TARGETS } from './useDeepLink';

const TOKEN = 'aBcD1234eFgH5678iJkL';

describe('deep link allowlist', () => {
  describe('auth targets', () => {
    // The mobile app puts two of these under auth/ and the third at the root.
    // Getting that asymmetry wrong silently lands the user on the wrong screen.
    it.each([
      ['verify-email', `citizenlinkapp://auth/verify-email?token=${TOKEN}`, `/verify-email?token=${TOKEN}`],
      ['reset-password', `citizenlinkapp://auth/reset-password?token=${TOKEN}`, `/reset-password?token=${TOKEN}`],
      ['change-email-verify', `citizenlinkapp://change-email-verify?token=${TOKEN}`, `/change-email-verify?token=${TOKEN}`],
    ])('%s maps to the app route and keeps a browser path', (resource, appUrl, webUrl) => {
      const resolved = resolveTarget(resource, TOKEN);
      expect(resolved.url).toBe(appUrl);
      expect(resolved.webUrl).toBe(webUrl);
    });

    it.each(['short', '', 'has spaces', 'bad/slash', '../../evil'])(
      'rejects the malformed token %j',
      (token) => {
        expect(resolveTarget('verify-email', token).url).toBeNull();
      },
    );
  });

  describe('domain targets', () => {
    it.each([
      ['document-case', 'abc123', 'citizenlinkapp://document-case/abc123'],
      ['claims', 'claim-1', 'citizenlinkapp://claims/claim-1'],
      ['match', 'match-1', 'citizenlinkapp://match/match-1'],
      ['wallet', '', 'citizenlinkapp://wallet'],
    ])('%s resolves to %s', (resource, value, expected) => {
      expect(resolveTarget(resource, value).url).toBe(expected);
    });

    // There is no citizen-facing web view for these, so offering a browser
    // path would send people somewhere that cannot show them anything.
    it.each(['document-case', 'claims', 'match', 'wallet'])(
      '%s offers no browser path',
      (resource) => {
        expect(resolveTarget(resource, 'abc123').webUrl).toBeNull();
      },
    );

    it.each(['../../evil', 'a b', 'x'.repeat(65), 'semi;colon'])(
      'rejects the malformed id %j',
      (id) => {
        expect(resolveTarget('document-case', id).url).toBeNull();
      },
    );
  });

  describe('delivery confirmation', () => {
    it('accepts a printed label code', () => {
      expect(resolveTarget('confirm-delivery', '481920').url).toBe(
        'citizenlinkapp://confirm-delivery?code=481920',
      );
    });

    it.each(['abc', '12', '1234567890', ''])('rejects the code %j', (code) => {
      expect(resolveTarget('confirm-delivery', code).url).toBeNull();
    });
  });

  it('rejects any resource outside the allowlist', () => {
    for (const resource of ['unknown', '', '../admin', 'Wallet']) {
      expect(resolveTarget(resource, 'abc123').url).toBeNull();
    }
  });

  it('never builds a URL from a scheme supplied by the caller', () => {
    // Guards against the open-redirect shape this design deliberately avoids.
    expect(resolveTarget('document-case', 'https://evil.test').url).toBeNull();
    expect(resolveTarget('verify-email', 'https://evil.test').url).toBeNull();
    for (const target of Object.values(TARGETS)) {
      expect(target.appPath('x')).not.toMatch(/^[a-z]+:\/\//);
    }
  });
});
