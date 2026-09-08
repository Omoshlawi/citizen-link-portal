import { z } from 'zod';

export const resolveReportSchema = z.object({
  status: z.enum(['REVIEWED', 'DISMISSED'], {
    message: 'Choose an outcome',
  }),
  resolutionNote: z.string().max(1000, 'Keep the note under 1000 characters').optional(),
});
