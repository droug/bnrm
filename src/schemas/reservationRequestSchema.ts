import { z } from "zod";

export const reservationRequestSchema = z.object({
  documentId: z.string().optional(),
  documentTitle: z.string().min(1, "Le titre du document est requis"),
  documentCote: z.string().optional(),
  documentStatus: z.enum(["numerise", "physique", "en_cours_numerisation"], {
    required_error: "Le statut du document est requis",
  }),
  userName: z.string().min(1, "Le nom est requis"),
  userEmail: z.string().email("Email invalide"),
  requestedDate: z.date({
    required_error: "La date de réservation est requise",
  }),
  requestedTime: z.string().min(1, "L'heure est requise"),
  comments: z.string().optional(),
});

export type ReservationRequestFormData = z.infer<typeof reservationRequestSchema>;
