import { z } from 'zod';
import {
  DocumentTypeSchema,
  RoleSchema,
  SystemSettingSchema,
  TransitionReasonSchema,
} from '../utils';

export interface DocumentType {
  id: string;
  category:
    | 'IDENTITY'
    | 'ACADEMIC'
    | 'PROFESSIONAL'
    | 'VEHICLE'
    | 'FINANCIAL'
    | 'MEDICAL'
    | 'LEGAL'
    | 'OTHER'; // A
  name: string;
  loyaltyPoints: number;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  replacementInstructions: string;
  averageReplacementCost: number;
  requiredVerification: 'LOW' | 'STANDARD' | 'HIGH' | 'INSTITUTIONAL';
  voided: boolean;
}

export type DocumentTypeFormData = z.infer<typeof DocumentTypeSchema>;

export interface TransitionReason {
  id: string;
  code: string;
  entityType: string;
  fromStatus: string;
  toStatus: string;
  auto: boolean;
  label: string;
  description: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  voided: boolean;
}

export type TransitionReasonFormData = z.infer<typeof TransitionReasonSchema>;

export interface RolePermission {
  resource: string;
  resourceName: string;
  action: string;
  actionName: string;
}

export interface SystemRole {
  role: string;
  name: string;
  label?: string;
  permissions: RolePermission[];
}

// ─── Resource (read-only, from code) / Role ──────────────────────────────────

export interface ResourceAction {
  slug: string;
  name: string;
  description: string | null;
}

export interface Resource extends ResourceAction {
  actions: ResourceAction[];
}

export interface PermissionGrant {
  resource: string;
  action: string;
}

export interface RoleRecord {
  /** The slug, for a system role. */
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** `admin` and `user`: fixed in code and not editable. */
  isSystem: boolean;
  voided: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  permissions: RolePermission[];
}

export type EffectivePermissions = Record<string, string[]>;

export type RoleFormData = z.infer<typeof RoleSchema>;

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
  updatedBy?: string;
  voided: boolean;
}

export type SystemSettingFormData = z.infer<typeof SystemSettingSchema>;
