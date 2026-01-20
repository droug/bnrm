import { z } from 'zod';

// Base schema for author identification
const authorIdentificationSchema = z.object({
  authorType: z.enum(['physique', 'morale'], {
    required_error: 'Le type d\'auteur est obligatoire'
  }),
  authorName: z.string().min(1, 'Le nom est obligatoire'),
  pseudonym: z.string().optional(),
  phone: z.string().optional(), // Legacy field kept for compatibility
  phoneFixed: z.string().optional(),
  phoneMobile: z.string().optional(),
  email: z.string().email('Email invalide').min(1, 'L\'email est obligatoire'),
  region: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
}).and(
  z.discriminatedUnion('authorType', [
    z.object({
      authorType: z.literal('physique'),
      gender: z.enum(['homme', 'femme'], {
        required_error: 'Le genre est obligatoire pour une personne physique'
      }),
      birthDate: z.string().min(1, 'La date de naissance est obligatoire pour une personne physique'),
      nationality: z.string().min(1, 'La nationalité est obligatoire pour une personne physique'),
      declarationNature: z.string().optional(),
    }),
    z.object({
      authorType: z.literal('morale'),
      acronym: z.string().optional(),
      status: z.enum(['etatique', 'non-etatique'], {
        required_error: 'Le statut est obligatoire pour une personne morale'
      }),
    })
  ])
);

// Base schema for publication identification
const publicationIdentificationBaseSchema = z.object({
  publicationType: z.string().min(1, 'Le type de publication est obligatoire'),
  title: z.string().min(1, 'Le titre est obligatoire'),
  subtitle: z.string().optional(),
  languages: z.array(z.string()).min(1, 'Au moins une langue est requise'),
  discipline: z.string().min(1, 'La discipline est obligatoire'),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  publicationPlace: z.string().optional(),
  pageCount: z.number().min(1, 'Le nombre de pages est obligatoire').optional(),
});

// Schema with conditional required documents based on publication type
const publicationIdentificationSchema = publicationIdentificationBaseSchema.refine(
  (data) => {
    // Additional validation will be handled in form-level logic
    return true;
  },
  {
    message: 'Validation de publication personnalisée'
  }
);

// Publisher identification schema
const publisherIdentificationSchema = z.object({
  publisherId: z.string().min(1, 'L\'éditeur est obligatoire'),
  publisherName: z.string().min(1, 'Le nom de l\'éditeur est obligatoire'),
  publicationDate: z.string().min(1, 'La date de parution est obligatoire'),
  // Amazon-specific validation handled separately
  amazonLink: z.string().url('URL invalide').optional(),
});

// Printer identification schema
const printerIdentificationSchema = z.object({
  printerId: z.string().optional(),
  printerName: z.string().optional(),
  printerCountry: z.string().optional(),
  printerCity: z.string().optional(),
  printerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  printerPhone: z.string().optional(),
});

// Documents schema - will be validated conditionally
const documentsSchema = z.object({
  cover: z.instanceof(File).optional(),
  summary: z.instanceof(File).optional(),
  cin: z.instanceof(File).optional(),
  courtDecision: z.instanceof(File).optional(),
  thesisRecommendation: z.instanceof(File).optional(),
  quranAuthorization: z.instanceof(File).optional(),
});

// Complete monograph deposit schema
export const monographDepositSchema = z.object({
  author: authorIdentificationSchema,
  publication: publicationIdentificationSchema,
  publisher: publisherIdentificationSchema,
  printer: printerIdentificationSchema,
  documents: documentsSchema,
  acceptedPrivacy: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter la politique de confidentialité'
  }),
}).refine(
  (data) => {
    // Thesis requires recommendation document
    if (data.publication.publicationType === 'these' && !data.documents.thesisRecommendation) {
      return false;
    }
    // Quran requires authorization
    if (data.publication.publicationType === 'coran' && !data.documents.quranAuthorization) {
      return false;
    }
    // Amazon requires link
    if (data.publisher.publisherName.toLowerCase().includes('amazon') && !data.publisher.amazonLink) {
      return false;
    }
    return true;
  },
  {
    message: 'Documents obligatoires manquants selon le type de publication',
    path: ['documents']
  }
);

// Periodical deposit schema
export const periodicalDepositSchema = z.object({
  isPeriodic: z.enum(['oui', 'non'], {
    required_error: 'Indiquez si c\'est une publication périodique'
  }),
  hasIssn: z.boolean(),
  issn: z.string().optional(),
  author: authorIdentificationSchema,
  publication: publicationIdentificationBaseSchema.extend({
    frequency: z.string().optional(),
    issueNumber: z.string().optional(),
  }),
  publisher: publisherIdentificationSchema,
  documents: documentsSchema,
  acceptedPrivacy: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter la politique de confidentialité'
  }),
});

// ISSN request schema
export const issnRequestSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  discipline: z.string().min(1, 'La discipline est obligatoire'),
  language: z.string().min(1, 'La langue est obligatoire'),
  country: z.string().min(1, 'Le pays est obligatoire'),
  publisher: z.string().min(1, 'L\'éditeur est obligatoire'),
  support: z.string().min(1, 'Le support est obligatoire'),
  frequency: z.string().min(1, 'La périodicité est obligatoire'),
  contactAddress: z.string().min(1, 'L\'adresse de contact est obligatoire'),
  justificationFile: z.instanceof(File).optional(),
});

// Database/Software deposit schema
export const databaseDepositSchema = z.object({
  author: authorIdentificationSchema,
  publication: publicationIdentificationBaseSchema,
  producer: z.object({
    producerId: z.string().optional(),
    producerName: z.string().optional(),
  }),
  distributor: z.object({
    distributorId: z.string().optional(),
    distributorName: z.string().optional(),
  }),
  documents: documentsSchema,
  acceptedPrivacy: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter la politique de confidentialité'
  }),
});

// Type exports
export type MonographDepositFormData = z.infer<typeof monographDepositSchema>;
export type PeriodicalDepositFormData = z.infer<typeof periodicalDepositSchema>;
export type IssnRequestFormData = z.infer<typeof issnRequestSchema>;
export type DatabaseDepositFormData = z.infer<typeof databaseDepositSchema>;
