import { z } from 'zod';
import { resolveReportSchema } from './utils/validation';

export enum ChatReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
}

export enum ChatReportReason {
  HARMFUL = 'HARMFUL',
  OFFENSIVE = 'OFFENSIVE',
  INACCURATE = 'INACCURATE',
  PRIVACY = 'PRIVACY',
  OTHER = 'OTHER',
}

export interface ChatReportReviewer {
  id: string;
  name: string;
}

export interface ChatTranscriptMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface ChatReport {
  id: string;
  sessionId: string;
  /** Null when the report was filed mid-conversation, before ids were known. */
  messageId: string | null;
  reason: ChatReportReason;
  /** Free text the reporter optionally added. */
  details: string | null;
  /** The reply exactly as the reporter saw it. Authoritative — the message may since be gone. */
  content: string;
  status: ChatReportStatus;
  reviewedAt: string | null;
  reviewedBy: ChatReportReviewer | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface ChatReportDetail extends ChatReport {
  transcript: ChatTranscriptMessage[];
}

export type ResolveReportFormData = z.infer<typeof resolveReportSchema>;
