import { z } from "zod";

export const bookReservationSchema = z.object({
  documentId: z.string().min(1, "L'identifiant du document est requis"),
  documentTitle: z.string().min(1, "Le titre de l'ouvrage est requis"),
  documentAuthor: z.string().optional(),
  documentYear: z.string().optional(),
  supportType: z.string().min(1, "Le type de support est requis"),
  supportStatus: z.enum(["numerise", "non_numerise", "libre_acces"], {
    required_error: "Le statut du support est requis",
  }),
  isFreeAccess: z.boolean().default(false),
  allowPhysicalConsultation: z.boolean().default(true),
  requestedDate: z.date().optional(),
  motif: z.string().optional(),
  userName: z.string().min(1, "Le nom est requis"),
  userEmail: z.string().email("Email invalide"),
  userPhone: z.string().optional(),
  userType: z.string().optional(),
  comments: z.string().optional(),
  isStudentPFE: z.boolean().default(false),
  pfeProofFile: z.instanceof(File).optional(),
  pfeTheme: z.string().optional(),
});

export type BookReservationFormData = z.infer<typeof bookReservationSchema>;
