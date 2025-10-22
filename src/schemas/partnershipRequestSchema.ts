import { z } from "zod";

const representantSchema = z.object({
  nom_complet: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  fonction: z.string()
    .min(2, "La fonction doit contenir au moins 2 caractères")
    .max(100, "La fonction ne peut pas dépasser 100 caractères"),
  telephone: z.string()
    .regex(/^(\+\d{1,3}|0)[5-7]\d{8}$/, "Numéro de téléphone invalide"),
  email: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  piece_identite_url: z.string().url().optional(),
});

export const partnershipRequestSchema = z.object({
  // Étape 1: Identification
  nom_organisme: z.string()
    .min(2, "Le nom de l'organisme doit contenir au moins 2 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  statut_juridique: z.enum(["association", "organisme_public", "organisme_prive", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un statut juridique" }),
  }),
  nationalite: z.enum(["marocain", "etranger"], {
    errorMap: () => ({ message: "Veuillez sélectionner une nationalité" }),
  }),
  type_organisation: z.enum(["institution", "etablissement", "ong", "entreprise", "collectivite"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type d'organisation" }),
  }),
  description_organisme: z.string().max(1000, "La description ne peut pas dépasser 1000 caractères").optional(),
  telephone: z.string()
    .regex(/^(\+\d{1,3}|0)[5-7]\d{8}$/, "Numéro de téléphone invalide"),
  email_officiel: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  adresse: z.string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(500, "L'adresse ne peut pas dépasser 500 caractères"),
  site_web: z.string().url("URL invalide").optional().or(z.literal("")),
  statut_document_url: z.string().url().optional(),

  // Étape 2: Représentants
  representants: z.array(representantSchema)
    .min(1, "Au moins un représentant doit être ajouté"),

  // Étape 3: Détails du partenariat
  objet_partenariat: z.string()
    .min(5, "L'objet doit contenir au moins 5 caractères")
    .max(200, "L'objet ne peut pas dépasser 200 caractères"),
  description_projet: z.string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(2000, "La description ne peut pas dépasser 2000 caractères"),
  type_partenariat: z.enum(["culturel", "educatif", "evenementiel", "scientifique", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de partenariat" }),
  }),
  date_debut: z.string().min(1, "La date de début est obligatoire"),
  date_fin: z.string().min(1, "La date de fin est obligatoire"),
  lieu_concerne: z.string()
    .max(200, "Le lieu ne peut pas dépasser 200 caractères")
    .optional(),
  programme_url: z.string().url("Le programme est obligatoire").min(1, "Le programme est obligatoire"),
  objectifs: z.string()
    .min(20, "Les objectifs doivent contenir au moins 20 caractères")
    .max(1000, "Les objectifs ne peuvent pas dépasser 1000 caractères"),
  public_cible: z.string()
    .min(10, "Le public cible doit contenir au moins 10 caractères")
    .max(500, "Le public cible ne peut pas dépasser 500 caractères"),
  moyens_organisme: z.string()
    .min(10, "Les moyens apportés doivent contenir au moins 10 caractères")
    .max(1000, "Les moyens ne peuvent pas dépasser 1000 caractères"),
  moyens_bnrm: z.string()
    .min(10, "Les moyens attendus doivent contenir au moins 10 caractères")
    .max(1000, "Les moyens ne peuvent pas dépasser 1000 caractères"),

  // Étape 4: Validation
  confirmation_exactitude: z.boolean().refine((val) => val === true, {
    message: "Vous devez confirmer l'exactitude des informations",
  }),
  confirmation_reglement: z.boolean().refine((val) => val === true, {
    message: "Vous devez prendre connaissance du règlement",
  }),
}).refine((data) => {
  // Validation: le statut est obligatoire si "association"
  if (data.statut_juridique === "association" && !data.statut_document_url) {
    return false;
  }
  return true;
}, {
  message: "Le statut juridique est obligatoire pour les associations",
  path: ["statut_document_url"],
}).refine((data) => {
  // Validation: date fin après date début
  if (data.date_debut && data.date_fin) {
    return new Date(data.date_fin) >= new Date(data.date_debut);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["date_fin"],
});

export type PartnershipRequestFormData = z.infer<typeof partnershipRequestSchema>;
export type RepresentantFormData = z.infer<typeof representantSchema>;
