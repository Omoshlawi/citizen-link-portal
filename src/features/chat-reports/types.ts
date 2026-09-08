import { z } from 'zod';
import { resolveReportSchema } from './utils/validation';

export enum ChatReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
}

// Order matches the app's reason picker so both surfaces read the same way.
export enum ChatReportReason {
  INACCURATE = 'INACCURATE',
  HARMFUL = 'HARMFUL',
  OFFENSIVE = 'OFFENSIVE',
  PRIVACY = 'PRIVACY',
  OTHER = 'OTHER',
}

/** Mirrors the Prisma `ChatMessageRole` enum. */
export enum ChatMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export interface ChatReportReviewer {
  id: string;
  name: string;
}

export interface ChatTranscriptMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

/**
 * A citizen's report of an AI reply.
 *
 * There is intentionally no reporter field: moderation is anonymous, so the API
 * does not return `user`. Do not add one — that is a policy decision, not an
 * oversight. The anonymity is partial though, since the reporter is always the
 * session owner and the detail view shows their conversation.
 */
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
