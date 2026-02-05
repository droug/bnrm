import { z } from "zod";

export const programContributionSchema = z.object({
  // Étape 1: Demandeur
  nom_complet: z.string().trim().min(1, "Le nom complet est obligatoire").max(200),
  type_demandeur: z.enum(["artiste", "auteur", "intervenant", "association", "institution", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un statut" })
  }),
  email: z.string().email("Email invalide").max(255),
  telephone: z.string().min(1, "Le téléphone est obligatoire").max(20),
  organisme: z.string().max(200).optional(),
  adresse: z.string().max(500).optional(),
  cv_url: z.string().url("URL invalide pour le CV").min(1, "Le CV est obligatoire"),
  statut_juridique_url: z.string().url().optional(),

  // Étape 2: Proposition
  type_activite: z.enum(["conference", "atelier", "exposition", "concert", "lecture", "projection", "debat", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type d'activité" })
  }),
  titre: z.string().trim().min(1, "Le titre est obligatoire").max(300),
  description: z.string().trim().min(1, "La description est obligatoire").max(5000),
  objectifs: z.string().trim().min(1, "Les objectifs sont obligatoires").max(3000),
  public_cible: z.enum(["etudiants", "professionnels", "grand_public", "jeunes", "chercheurs", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un public cible" })
  }),
  langue: z.enum(["arabe", "francais", "anglais", "amazighe", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner une langue" })
  }),
  nb_participants_estime: z.number().int().positive().optional(),
  dossier_projet_url: z.string().url("URL invalide pour le dossier").min(1, "Le dossier de projet est obligatoire"),

  // Étape 3: Logistique
  date_proposee: z.string().min(1, "La date proposée est obligatoire"),
  heure_proposee: z.string().min(1, "L'heure proposée est obligatoire"),
  duree_minutes: z.number().int().positive("La durée doit être positive").min(1, "La durée est obligatoire"),
  moyens_techniques: z.array(z.string()).default([]),
  besoins_specifiques: z.string().max(2000).optional(),
  espace_souhaite: z.enum(["auditorium", "salle_conference", "espace_exposition", "esplanade", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un espace" })
  }),

  // Étape 4: Validation
  certification_exactitude: z.boolean().refine((val) => val === true, {
    message: "Vous devez certifier l'exactitude des informations"
  }),
  consentement_diffusion: z.boolean().refine((val) => val === true, {
    message: "Vous devez consentir à la diffusion de l'activité"
  }),
});

export type ProgramContributionFormData = z.infer<typeof programContributionSchema>;
