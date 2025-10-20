import { z } from "zod";

export const reservationRequestSchema = z.object({
  documentId: z.string().uuid(),
  documentTitle: z.string().min(1, "Le titre du document est requis"),
  documentCote: z.string().optional(),
  userName: z.string().min(1, "Le nom est requis"),
  userEmail: z.string().email("Email invalide"),
  requestedDate: z.date({
    required_error: "La date de réservation est requise",
  }),
  requestedTime: z.string().min(1, "L'heure est requise"),
  comments: z.string().optional(),
});

export type ReservationRequestFormData = z.infer<typeof reservationRequestSchema>;
