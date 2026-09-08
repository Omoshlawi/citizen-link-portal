import { z } from 'zod';
import { ChatReportStatus } from '../types';

export const resolveReportSchema = z.object({
  // Terminal states only — a resolved report never goes back to PENDING.
  status: z.enum([ChatReportStatus.REVIEWED, ChatReportStatus.DISMISSED], {
    message: 'Choose an outcome',
  }),
  resolutionNote: z.string().max(1000, 'Keep the note under 1000 characters').optional(),
});
