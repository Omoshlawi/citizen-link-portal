import { z } from 'zod';
import { SubmissionMethod } from '../types';

export const GrantStaffOperationSchema = z.object({
  userId: z.string().nonempty('Please select a staff member'),
  stationId: z.string().uuid('Please select a station'),
  operationTypeIds: z.array(z.string().uuid()).min(1, 'Select at least one operation type'),
});

// ── New operation form ────────────────────────────────────────────────────────

/**
 * Schema factory — accepts the currently selected operation type so that
 * conditional required rules are enforced by Zod rather than ad-hoc checks.
 *
 * Conditional rules:
 *   requiresCounterpartStation → counterpartStationId required  (e.g. TRANSFER_OUT, TRANSFER_IN, REQUISITION)
 *   requiresNotes              → notes required                  (e.g. DISPOSAL)
 */
export const makeNewOperationSchema = (opType?: {
  code?: string;
  requiresNotes?: boolean;
  requiresCounterpartStation?: boolean;
  requiresTargetArea?: boolean;
}) =>
  z
    .object({
      operationTypeId: z.string().min(1, 'Select an operation type'),
      foundCaseIds: z.array(z.string()).min(1, 'Select at least one document'),
      stationId: z.string().nullable().optional(),
      counterpartStationId: z.string().nullable().optional(),
      responsiblePersonId: z.string().nullable().optional(),
      notes: z.string().optional().nullable(),
      targetArea: z.string().optional(),
      // RECEIPT-specific filter fields (only used in the UI to populate foundCaseIds)
      receiptSubmissionMethod: z
        .enum([SubmissionMethod.STATION_DROPOFF, SubmissionMethod.AGENT_PICKUP])
        .nullable()
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (opType?.requiresCounterpartStation && !data.counterpartStationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Counterpart station is required for this operation type',
          path: ['counterpartStationId'],
        });
      }
      if (opType?.requiresTargetArea && !data.targetArea?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Target area is required for this operation type',
          path: ['targetArea'],
        });
      }
      if (opType?.requiresNotes && !data.notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Notes are required for this operation type',
          path: ['notes'],
        });
      }
    });

export type NewOperationFormData = z.infer<ReturnType<typeof makeNewOperationSchema>>;

// ── Station form ──────────────────────────────────────────────────────────────

const optionalText = z.string().trim().max(255, 'Too long').optional();

// The input holds partial text like "-" or "1." while typing, so convert only on submit.
const coordinate = (min: number, max: number) =>
  z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((value) => (value === '' || value == null ? null : Number(value)))
    .pipe(
      z
        .number({ invalid_type_error: 'Enter a number' })
        .min(min, `Must be between ${min} and ${max}`)
        .max(max, `Must be between ${min} and ${max}`)
        .nullable()
    );

/** Mirrors the backend `PickUpStationSchema`; `country`/`addressLocaleCode` come from region config. */
export const StationSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(50, 'Too long'),
  name: z.string().trim().min(1, 'Name is required').max(255, 'Too long'),
  phoneNumber: optionalText,
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
  level1: z.string().min(1, 'This field is required'),
  level2: optionalText,
  level3: optionalText,
  address1: z.string().trim().min(1, 'Address is required').max(255, 'Too long'),
  address2: optionalText,
  landmark: optionalText,
  postalCode: optionalText,
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
});
