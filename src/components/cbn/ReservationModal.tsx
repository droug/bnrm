import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Schéma de validation Zod pour la sécurité
const reservationSchema = z.object({
  guestName: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .optional()
    .or(z.literal("")),
  guestEmail: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" })
    .optional()
    .or(z.literal("")),
  guestPhone: z.string()
    .trim()
    .regex(/^(\+212|0)[5-7]\d{8}$/, { message: "Numéro de téléphone marocain invalide" })
    .optional()
    .or(z.literal("")),
  motif: z.string()
    .trim()
    .min(5, { message: "Le motif doit contenir au moins 5 caractères" })
    .max(200, { message: "Le motif ne peut pas dépasser 200 caractères" }),
  comments: z.string()
    .trim()
    .max(1000, { message: "Les commentaires ne peuvent pas dépasser 1000 caractères" })
    .optional()
    .or(z.literal("")),
});

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    author: string;
    support_type: string;
    support_status: string;
    is_free_access: boolean;
    allow_physical_consultation: boolean;
  };
}

export default function ReservationModal({ open, onOpenChange, document }: ReservationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<'numerique' | 'physique'>('numerique');
  const [requestedDate, setRequestedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Formulaire simplifié pour utilisateurs non connectés
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  // Champs communs
  const [motif, setMotif] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client avec Zod
    try {
      const validationData = {
        guestName: user ? "" : guestName,
        guestEmail: user ? "" : guestEmail,
        guestPhone: user ? "" : guestPhone,
        motif,
        comments
      };

      const validatedData = reservationSchema.parse(validationData);

      // Validation supplémentaire pour utilisateurs non connectés
      if (!user) {
        if (!validatedData.guestName || !validatedData.guestEmail) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return;
        }
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
        return;
      }
    }

    setLoading(true);

    try {
      // Déterminer le routage
      let routedTo = "bibliotheque_numerique";
      
      if (document.support_status === 'non_numerise') {
        routedTo = "responsable_support";
      } else if (requestType === 'physique') {
        if (!document.allow_physical_consultation) {
          toast.error("La consultation physique n'est pas autorisée pour ce document");
          setLoading(false);
          return;
        }
        routedTo = "responsable_support";
      }

      const reservationData = {
        document_id: document.id,
        document_title: document.title,
        document_author: document.author,
        support_type: document.support_type,
        support_status: document.support_status,
        is_free_access: document.is_free_access,
        request_physical: requestType === 'physique',
        allow_physical_consultation: document.allow_physical_consultation,
        routed_to: routedTo,
        statut: 'soumise',
        requested_date: requestedDate?.toISOString().split('T')[0],
        motif,
        user_name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() : guestName,
        user_email: user?.email || guestEmail,
        user_phone: user?.user_metadata?.phone || guestPhone,
        user_type: user ? (user.user_metadata?.role || 'public_user') : 'guest',
        comments,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('reservations_ouvrages')
        .insert([reservationData]);

      if (error) throw error;

      toast.success("Votre demande de réservation a été envoyée avec succès");
      onOpenChange(false);
      
      // Réinitialiser le formulaire
      setRequestType('numerique');
      setRequestedDate(undefined);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setMotif("");
      setComments("");
    } catch (error: any) {
      console.error("Erreur lors de la création de la réservation:", error);
      toast.error("Erreur lors de l'envoi de votre demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Réserver un ouvrage</DialogTitle>
          <DialogDescription>
            Demande de réservation pour : <span className="font-semibold text-foreground">{document.title}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations utilisateur (si non connecté) */}
          {!user && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-sm">Vos coordonnées</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nom complet *</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Téléphone</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Type de demande */}
          {document.support_status === 'numerise' && document.allow_physical_consultation && (
            <div className="space-y-3">
              <Label>Type de consultation souhaitée</Label>
              <RadioGroup value={requestType} onValueChange={(value) => setRequestType(value as 'numerique' | 'physique')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numerique" id="numerique" />
                  <Label htmlFor="numerique" className="font-normal cursor-pointer">
                    Consultation numérique (en ligne)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physique" id="physique" />
                  <Label htmlFor="physique" className="font-normal cursor-pointer">
                    Consultation physique (sur place)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Date souhaitée */}
          <div className="space-y-2 relative">
            <Label>Date de consultation souhaitée</Label>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !requestedDate && "text-muted-foreground"
              )}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {requestedDate ? format(requestedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
            
            {showCalendar && (
              <div className="relative w-full border rounded-lg p-3 bg-popover shadow-lg">
                <Calendar
                  mode="single"
                  selected={requestedDate}
                  onSelect={(date) => {
                    setRequestedDate(date);
                    setShowCalendar(false);
                  }}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto mx-auto"
                />
              </div>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="motif">Motif de la demande *</Label>
            <Input
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Recherche académique, étude personnelle, etc."
              required
            />
          </div>

          {/* Commentaires */}
          <div className="space-y-2">
            <Label htmlFor="comments">Commentaires additionnels</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Informations complémentaires sur votre demande..."
              rows={3}
            />
          </div>

          {/* Informations de routage */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Traitement de votre demande :</strong><br />
              {document.support_status === 'non_numerise' ? (
                "Cette demande sera traitée par le Responsable Support"
              ) : requestType === 'physique' ? (
                "Cette demande de consultation sur place sera traitée par le Responsable Support"
              ) : (
                "Cette demande sera traitée par la Bibliothèque Numérique"
              )}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
