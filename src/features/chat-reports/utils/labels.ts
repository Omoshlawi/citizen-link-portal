import { ChatReportReason } from '../types';

/**
 * The wording the citizen actually chose in the app
 * (citizen-link-app/lib/locales/en.json → chat.report.reasons). Reviewers should
 * read the same sentence the reporter picked, not a raw enum value.
 */
export const REASON_LABEL: Record<ChatReportReason, string> = {
  [ChatReportReason.INACCURATE]: 'It is inaccurate or misleading',
  [ChatReportReason.HARMFUL]: 'It is harmful or unsafe advice',
  [ChatReportReason.OFFENSIVE]: 'It is offensive or inappropriate',
  [ChatReportReason.PRIVACY]: 'It exposed personal information',
  [ChatReportReason.OTHER]: 'Something else',
};

/** Compact form for table cells, where the full sentence is too long. */
export const REASON_SHORT: Record<ChatReportReason, string> = {
  [ChatReportReason.INACCURATE]: 'Inaccurate',
  [ChatReportReason.HARMFUL]: 'Harmful',
  [ChatReportReason.OFFENSIVE]: 'Offensive',
  [ChatReportReason.PRIVACY]: 'Privacy',
  [ChatReportReason.OTHER]: 'Other',
};

/** Harmful and privacy reports carry real-world risk; surface that in the list. */
export const REASON_COLOR: Record<ChatReportReason, string> = {
  [ChatReportReason.HARMFUL]: 'red',
  [ChatReportReason.PRIVACY]: 'orange',
  [ChatReportReason.OFFENSIVE]: 'orange',
  [ChatReportReason.INACCURATE]: 'civicGold',
  [ChatReportReason.OTHER]: 'gray',
};

export const REASON_OPTIONS = Object.values(ChatReportReason).map((value) => ({
  value,
  label: REASON_SHORT[value],
}));
