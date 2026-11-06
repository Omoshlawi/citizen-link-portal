import { z } from 'zod';

export const AddressComponentSchema = z.object({
  type: z.string(),
  value: z.string(),
});

export const CaseDocumentFieldSchema = z.object({
  documentId: z.string().uuid().optional(),
  fieldName: z.string().min(1, 'Required'),
  fieldValue: z.string().min(1, 'Required'),
});

export const CaseDocumentSchema = z.object({
  serialNumber: z.string().optional(),
  documentNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  issuer: z.string().optional(),
  surname: z.string().min(1, 'Surname required').optional(),
  givenNames: z.string().min(1, 'GivenNames required').optional(),
  dateOfBirth: z.coerce.date().optional(),
  placeOfBirth: z.string().optional(),
  placeOfIssue: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional(),
  note: z.string().optional(),
  typeId: z.string().min(1, 'Type required'),
  issuanceDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  images: z.string().array().max(2).optional(),
  additionalFields: CaseDocumentFieldSchema.omit({ documentId: true }).array().optional(),
  photoPresent: z.boolean().optional(),
  fingerprintPresent: z.boolean().optional(),
  signaturePresent: z.boolean().optional(),
  addressRaw: z.string().optional(),
  addressCountry: z.string().optional(),
  addressComponents: AddressComponentSchema.array().optional(),
});

export const DocumentFieldSchema = z.object({
  documentId: z.string().uuid(),
  fieldName: z.string().min(1, 'Required'),
  fieldValue: z.string().min(1, 'Required'),
});

const CaseLocationSchema = z.object({
  level1: z.string().trim().min(1, 'Required'),
  level2: z.string().trim().nullish(),
  level3: z.string().trim().nullish(),
  place: z.string().trim().max(500).nullish(),
});

export const DocumentCaseSchema = z.object({
  documentId: z.string().min(1),
  ...CaseLocationSchema.shape,
  description: z.string().optional(),
  eventDate: z.coerce.date(),
  tags: z.string().min(1).array().optional(),
  status: z.enum([
    'ACTIVE',
    'MATCHED',
    'RETURNED',
    'EXPIRED',
    'CLAIMED',
    'PENDING_VERIFICATION',
    'ARCHIVED',
  ]),
});

const FoundDocumentCaseBaseSchema = z.object({
  typeId: z.string().uuid(),
  ...CaseLocationSchema.shape,
  eventDate: z.coerce.date(),
  tags: z.string().min(1).array().optional(),
  description: z.string().optional(),
  images: z.string().array().max(2),
  submissionMethod: z.enum(['DROPOFF', 'PICKUP']).optional(),
  pickupStationId: z.string().uuid().optional(),
  collectionAddressId: z.string().uuid().optional(),
  scheduledPickupAt: z.string().datetime({ offset: true }).optional(),
});

/** A walk-in document logged by staff at their active station. */
export const StationIntakeSchema = FoundDocumentCaseBaseSchema.pick({
  typeId: true,
  place: true,
  eventDate: true,
  tags: true,
  description: true,
  images: true,
});

/** Editing a case's details; the document type and images aren't part of this form. */
export const UpdateCaseDetailsSchema = FoundDocumentCaseBaseSchema.pick({
  level1: true,
  level2: true,
  level3: true,
  place: true,
  eventDate: true,
  tags: true,
  description: true,
});

export const FoundDocumentCaseSchema = FoundDocumentCaseBaseSchema.superRefine((data, ctx) => {
  if (data.submissionMethod === 'DROPOFF' && !data.pickupStationId) {
    ctx.addIssue({
      code: 'custom',
      path: ['pickupStationId'],
      message: 'A partner station is required for drop-off submission',
    });
  }
  if (data.submissionMethod === 'PICKUP') {
    if (!data.collectionAddressId) {
      ctx.addIssue({
        code: 'custom',
        path: ['collectionAddressId'],
        message: 'A collection address is required for agent pickup',
      });
    }
    if (!data.scheduledPickupAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduledPickupAt'],
        message: 'A scheduled pickup date and time is required for agent pickup',
      });
    }
  }
});

export const LostDocumentCaseSchema = FoundDocumentCaseBaseSchema.omit({
  images: true,
}).extend(CaseDocumentSchema.omit({ images: true }).shape);
