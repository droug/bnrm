import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Calendar as CalendarIconLucide } from "lucide-react";
import { toast } from "sonner";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import {
  ScrollableDialog,
  ScrollableDialogContent,
  ScrollableDialogDescription,
  ScrollableDialogHeader,
  ScrollableDialogTitle,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from "@/components/ui/scrollable-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { reservationRequestSchema, type ReservationRequestFormData } from "@/schemas/reservationRequestSchema";

interface ReservationRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentTitle?: string;
  documentCote?: string;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Heures disponibles de 9h à 17h
const AVAILABLE_HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

export function ReservationRequestDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentCote,
  userProfile,
}: ReservationRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationRequestFormData>({
    resolver: zodResolver(reservationRequestSchema),
    defaultValues: {
      documentId: documentId || "",
      documentTitle: documentTitle || "",
      documentCote: documentCote || "",
      userName: `${userProfile.firstName} ${userProfile.lastName}`,
      userEmail: userProfile.email,
      requestedDate: undefined,
      requestedTime: "",
      comments: "",
    },
  });

  // Permettre au formulaire de fonctionner même sans document préalablement sélectionné

  const onSubmit = async (data: ReservationRequestFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour faire une réservation");
        return;
      }

      const { error } = await supabase
        .from("reservations_requests")
        .insert({
          user_id: user.id,
          document_id: data.documentId,
          document_title: data.documentTitle,
          document_cote: data.documentCote || null,
          document_status: "numerise", // Par défaut pour la bibliothèque numérique
          user_name: data.userName,
          user_email: data.userEmail,
          requested_date: format(data.requestedDate, "yyyy-MM-dd"),
          requested_time: data.requestedTime,
          comments: data.comments || null,
          status: "en_attente",
        });

      if (error) throw error;

      toast.success(
        "Votre demande de réservation a bien été transmise. Vous serez notifié par e-mail."
      );
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Erreur lors de la soumission de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollableDialog open={isOpen} onOpenChange={onClose}>
      <ScrollableDialogContent className="sm:max-w-[600px]">
        <ScrollableDialogHeader>
          <ScrollableDialogTitle className="flex items-center gap-2">
            <CalendarIconLucide className="h-5 w-5" />
            Demande de Réservation
          </ScrollableDialogTitle>
          <ScrollableDialogDescription>
            Remplissez le formulaire pour réserver ce document pour consultation sur place
          </ScrollableDialogDescription>
        </ScrollableDialogHeader>

        <ScrollableDialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom et prénom */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom et prénom</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Titre du document */}
              <FormField
                control={form.control}
                name="documentTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du document</FormLabel>
                    <FormControl>
                      <TitleAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Rechercher un titre de document..."
                        className={documentTitle ? "pointer-events-none opacity-60" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cote du document - facultatif */}
              <FormField
                control={form.control}
                name="documentCote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cote du document (facultatif)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!!documentCote} 
                        className={documentCote ? "bg-muted" : ""}
                        placeholder="Entrez la cote du document si connue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date souhaitée */}
              <FormField
                control={form.control}
                name="requestedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date souhaitée de réservation</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Sélectionnez la date à laquelle vous souhaitez consulter le document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Heure souhaitée */}
              <FormField
                control={form.control}
                name="requestedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure souhaitée</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Horaires d'ouverture : 09:00 - 17:00
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Commentaires */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaire (facultatif)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ajoutez un commentaire ou des informations complémentaires..."
                        className="resize-none"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </ScrollableDialog>
  );
}
