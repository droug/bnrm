import { z } from "zod";

export const visitGuidedSchema = z.object({
  slotId: z.string().uuid("Veuillez sélectionner un créneau"),
  nom: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  telephone: z.string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro de téléphone marocain invalide"),
  organisme: z.string()
    .max(200, "Le nom de l'organisme ne peut pas dépasser 200 caractères")
    .optional(),
  nbVisiteurs: z.number()
    .int("Le nombre doit être un entier")
    .min(1, "Au moins 1 visiteur requis")
    .max(100, "Maximum 100 visiteurs"),
  langue: z.enum(["arabe", "français", "anglais", "amazighe"], {
    errorMap: () => ({ message: "Veuillez sélectionner une langue" }),
  }),
  commentaire: z.string()
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .optional(),
  confirmation: z.boolean().refine((val) => val === true, {
    message: "Vous devez confirmer votre participation",
  }),
});

export type VisitGuidedFormData = z.infer<typeof visitGuidedSchema>;
