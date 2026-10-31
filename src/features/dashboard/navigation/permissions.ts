import { EffectivePermissions } from '@/features/admin/types';

/** Granted when the user holds ANY listed action on ANY listed resource. */
export type PermissionRule = Record<string, string[]>;

const ANY_WRITE = ['create', 'update', 'delete', 'restore'];

/**
 * Which permission unlocks each dashboard page, keyed by its path segment under
 * `/dashboard` (the same `href` the side nav uses). Pages without an entry are
 * open to every signed-in staff member. The side nav and the route guards both
 * read this map, so a page is never linked but blocked, or hidden but reachable.
 *
 * UI only — the API's own permission guards remain the enforcement.
 */
export const PAGE_PERMISSIONS: Record<string, PermissionRule> = {
  // Case management
  cases: { documentCase: ['list-any'] },
  claims: { claim: ['list-any'] },
  matches: { match: ['list-any'] },
  'status-transitions': { statusTransition: ['view'] },
  'chat-reports': { chatReport: ['read'] },

  // Document custody
  custody: { documentOperation: ['manage'] },
  stations: { station: ANY_WRITE },
  'operation-scope': { staffOperationScope: ['view', 'manage'] },
  'document-operation-types': { documentOperationType: ['manage'] },

  // Configuration
  'document-types': { documentType: ANY_WRITE },
  'status-transition-reasons': { transitionReason: ANY_WRITE },
  templates: { templates: ANY_WRITE },
  iam: { setting: ['manage-system'] },
  // User detail is reached from the IAM users tab.
  users: { setting: ['manage-system'] },
  'system-settings': { setting: ['view-any', 'manage-system'] },
  'address-management': {
    addressHierarchy: ANY_WRITE,
    addressLocale: ANY_WRITE,
    address: ['view-any'],
  },
};

export const hasAnyPermission = (effective: EffectivePermissions, rule?: PermissionRule) =>
  !rule ||
  Object.entries(rule).some(([resource, actions]) =>
    actions.some((action) => effective[resource]?.includes(action))
  );
