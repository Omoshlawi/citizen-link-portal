import { z } from 'zod';
import { Address } from '@/features/addresses/types';
import { FoundDocumentCase } from '@/features/cases/types';
import { GrantStaffOperationSchema } from '../utils/validation';

export type GrantStaffOperationFormData = z.infer<typeof GrantStaffOperationSchema>;

// ── Enums ─────────────────────────────────────────────────────────────────────
export enum SubmissionMethod {
  STATION_DROPOFF = "STATION_DROPOFF",
  AGENT_PICKUP = "AGENT_PICKUP",
}

export enum CustodyStatus {
  WITH_FINDER = 'WITH_FINDER',
  IN_CUSTODY = 'IN_CUSTODY',
  IN_TRANSIT = 'IN_TRANSIT',
  HANDED_OVER = 'HANDED_OVER',
  DISPOSED = 'DISPOSED',
}

export enum DocumentOperationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum DocumentOperationItemStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum DocumentOperationTypeCode {
  RECEIPT = 'RECEIPT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  REQUISITION = 'REQUISITION',
  HANDOVER = 'HANDOVER',
  DISPOSAL = 'DISPOSAL',
  RETURN = 'RETURN',
}
// ── Core types ────────────────────────────────────────────────────────────────

export interface DocumentOperationType {
  id: string;
  code: DocumentOperationTypeCode;
  prefix: string;
  name: string;
  description?: string | null;
  requiresCounterpartStation: boolean;
  requiresNotes: boolean;
  isHighPrivilege: boolean;
  isFinalOperation: boolean;
  requiresTargetArea: boolean;
  requiresItemAddresses: boolean;
  metadata?: Record<string, unknown> | null;
  voided: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StationOperationType {
  id: string;
  stationId: string;
  operationTypeId: string;
  operationType?: DocumentOperationType;
  isEnabled: boolean;
  voided: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffOperationScope {
  id: string;
  userId: string;
  stationId: string;
  operationTypeId: string;
  grantedById: string;
  user?: { id: string; name: string };
  station?: { id: string; name: string; code: string };
  operationType?: DocumentOperationType;
  grantedBy?: { id: string; name: string };
  voided: boolean;
  voidedAt?: string | null;
  voidedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  address1: string;
  address2?: string | null;
  landmark?: string | null;
  level1: string;
  level2?: string | null;
  level3?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  formatted?: string | null;
  voided: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentOperationItem {
  id: string;
  operationId: string;
  foundCaseId: string;
  foundCase?: FoundDocumentCase | null;
  status: DocumentOperationItemStatus;
  custodyStatusBefore?: CustodyStatus | null;
  custodyStatusAfter?: CustodyStatus | null;
  userAddressId?: string | null;
  userAddress?: Address | null;
  notes?: string | null;
  createdAt: string;
}

/** Set on operations the system recorded itself when a handover code was confirmed. */
export interface DocumentOperationMetadata {
  source?: 'EXCHANGE';
  exchangeId?: string;
  exchangeNumber?: string;
  direction?: string;
  method?: string;
}

export interface DocumentOperation {
  id: string;
  operationNumber: string;
  operationTypeId: string;
  operationType?: DocumentOperationType;
  status: DocumentOperationStatus;
  stationId?: string | null;
  station?: { id: string; name: string; code: string } | null;
  counterpartStationId?: string | null;
  counterpartStation?: { id: string; name: string; code: string } | null;
  createdById: string;
  createdBy?: { id: string; name: string } | null;
  responsiblePersonId?: string | null;
  responsiblePerson?: { id: string; name: string } | null;
  notes?: string | null;
  targetArea?: string | null;
  metadata?: DocumentOperationMetadata | null;
  completedAt?: string | null;
  items: DocumentOperationItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Form payloads ────────────────────────────────────────────────────────────��

export interface CreateOperationPayload {
  operationTypeId: string;
  foundCaseIds: string[];
  stationId?: string;
  counterpartStationId?: string;
  responsiblePersonId?: string | null;
  notes?: string;
  targetArea?: string;
}

export interface UpdateOperationPayload {
  stationId?: string | null;
  counterpartStationId?: string | null;
  responsiblePersonId?: string | null;
  notes?: string | null;
  targetArea?: string | null;
}

// ── Staff grant grouping ──────────────────────────────────────────────────────

export type StationGroup = {
  stationId: string;
  station?: StaffOperationScope['station'];
  operations: StaffOperationScope[];
};

export type GroupedStaffGrant = {
  userId: string;
  user?: StaffOperationScope['user'];
  stations: StationGroup[];
  totalOperations: number;
  latestGrantedAt: string;
};
