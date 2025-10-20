import { z } from "zod";

// Types d'utilisation autorisés
export const USAGE_TYPES = {
  research: "Recherche",
  study: "Étude",
  publication: "Publication",
  other: "Autre"
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export const digitizationRequestSchema = z.object({
  documentId: z.string().optional(),
  documentTitle: z.string()
    .min(1, "Le titre du document est requis")
    .max(500, "Le titre ne peut pas dépasser 500 caractères"),
  documentCote: z.string()
    .max(100, "La cote ne peut pas dépasser 100 caractères")
    .optional(),
  userName: z.string()
    .min(1, "Le nom est requis")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  userEmail: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  pagesCount: z.number()
    .int("Le nombre de pages doit être un entier")
    .min(1, "Au moins 1 page est requise")
    .max(1000, "Maximum 1000 pages autorisées"),
  justification: z.string()
    .min(20, "La justification doit contenir au moins 20 caractères")
    .max(2000, "La justification ne peut pas dépasser 2000 caractères"),
  usageType: z.enum(["research", "study", "publication", "other"], {
    required_error: "Le type d'utilisation est requis",
  }),
  attachmentFile: z.instanceof(File)
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Le fichier ne doit pas dépasser 10MB")
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "Seuls les fichiers PDF et images (JPEG, PNG) sont acceptés"
    )
    .optional(),
  copyrightAgreement: z.boolean()
    .refine((val) => val === true, {
      message: "Vous devez accepter de respecter les droits d'auteur",
    }),
});

export type DigitizationRequestFormData = z.infer<typeof digitizationRequestSchema>;
