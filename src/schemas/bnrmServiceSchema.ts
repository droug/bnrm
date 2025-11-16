import { z } from 'zod';

// Service registration schema
export const serviceRegistrationSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  lastName: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide').min(1, 'L\'email est obligatoire'),
  phone: z.string().min(1, 'Le téléphone est obligatoire'),
  cnie: z.string().optional(),
  address: z.string().optional(),
  institution: z.string().optional(),
  additionalInfo: z.string().optional(),
});

// Box reservation schema
export const boxReservationSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  lastName: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide').min(1, 'L\'email est obligatoire'),
  phone: z.string().min(1, 'Le téléphone est obligatoire'),
  boxNumber: z.string().optional(),
  startDate: z.date({
    required_error: 'La date de début est obligatoire',
  }),
  endDate: z.date({
    required_error: 'La date de fin est obligatoire',
  }),
  purpose: z.string().min(10, 'Veuillez décrire brièvement le motif (minimum 10 caractères)'),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate']
  }
);

// BNRM service creation/edit schema
export const bnrmServiceSchema = z.object({
  id_service: z.string().min(1, 'L\'ID du service est obligatoire'),
  categorie: z.string().min(1, 'La catégorie est obligatoire'),
  nom_service: z.string().min(1, 'Le nom du service est obligatoire'),
  description: z.string().min(1, 'La description est obligatoire'),
  public_cible: z.string().min(1, 'Le public cible est obligatoire'),
  reference_legale: z.string().min(1, 'La référence légale est obligatoire'),
});

// BNRM tariff schema
export const bnrmTariffSchema = z.object({
  id_tarif: z.string().min(1, 'L\'ID du tarif est obligatoire'),
  montant: z.number().min(0, 'Le montant doit être positif'),
  devise: z.string().min(1, 'La devise est obligatoire'),
  condition_tarif: z.string().optional(),
  periode_validite: z.string().min(1, 'La période de validité est obligatoire'),
  is_active: z.boolean(),
});

export type ServiceRegistrationFormData = z.infer<typeof serviceRegistrationSchema>;
export type BoxReservationFormData = z.infer<typeof boxReservationSchema>;
export type BNRMServiceFormData = z.infer<typeof bnrmServiceSchema>;
export type BNRMTariffFormData = z.infer<typeof bnrmTariffSchema>;
