export enum ExchangeDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum ExchangeMethod {
  STATION_DROPOFF = 'STATION_DROPOFF',
  AGENT_PICKUP = 'AGENT_PICKUP',
  OWNER_PICKUP = 'OWNER_PICKUP',
  INHOUSE_DELIVERY = 'INHOUSE_DELIVERY',
  COURIER_DELIVERY = 'COURIER_DELIVERY',
}

export enum ExchangeStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface ExchangeVerification {
  id: string;
  exchangeId: string;
  status: VerificationStatus;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeUser {
  id: string;
  name: string;
}

export interface ExchangeStation {
  id: string;
  name: string;
  code: string;
}

export interface ExchangeAddress {
  id: string;
  address1: string;
  level1: string;
  level2?: string | null;
  level3?: string | null;
}

export enum DeliveryZone {
  LOCAL = 'LOCAL',
  COUNTY = 'COUNTY',
  NATIONAL = 'NATIONAL',
}

export interface DeliveryZoneFee {
  zone: DeliveryZone;
  amount: number;
  currency: string;
}

export interface DeliveryPolicy {
  maxAttempts: number;
  feeNonRefundable: boolean;
  retryFreeUntilAttempt: number;
  fallbackMethod: 'OWNER_PICKUP';
  fees: DeliveryZoneFee[];
}

export interface DocumentExchange {
  id: string;
  exchangeNumber: string;
  direction: ExchangeDirection;
  method: ExchangeMethod;
  status: ExchangeStatus;
  foundCaseId: string;
  claimId?: string | null;
  stationId?: string | null;
  addressId?: string | null;
  scheduledAt: string;
  completedAt?: string | null;
  cancelReason?: string | null;
  cancelledById?: string | null;
  createdById: string;
  completedById?: string | null;
  deliveryZone?: DeliveryZone | null;
  stationSnapshot?: Record<string, string> | null;
  addressSnapshot?: Record<string, string> | null;
  courierProvider?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  verifications?: ExchangeVerification[];
  foundCase?: { custodyStatus: string; currentStationId: string | null } | null;
  station?: ExchangeStation | null;
  address?: ExchangeAddress | null;
  createdBy?: ExchangeUser | null;
  completedBy?: ExchangeUser | null;
  cancelledBy?: ExchangeUser | null;
}

export interface ActiveExchangeState {
  hasActiveExchange: boolean;
  exchangeId?: string;
  exchangeNumber?: string;
  status?: ExchangeStatus;
  scheduledAt?: string;
  expiresAt?: string;
  attempts?: number;
  maxAttempts?: number;
  code?: string;
  /** Station currently holding the document; null when not in custody at a station. */
  holdingStationId?: string | null;
}
