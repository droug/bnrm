import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { bookReservationSchema, type BookReservationFormData } from "@/schemas/bookReservationSchema";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Library, Building2, CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BookReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  documentAuthor?: string;
  documentYear?: string;
  supportType?: string;
  supportStatus: "numerise" | "non_numerise" | "libre_acces";
  isFreeAccess?: boolean;
  allowPhysicalConsultation?: boolean;
  onReserve?: () => void;
}

const USER_TYPES = [
  { value: "etudiant", label: "Étudiant" },
  { value: "chercheur", label: "Chercheur" },
  { value: "enseignant", label: "Enseignant" },
  { value: "journaliste", label: "Journaliste" },
  { value: "autre", label: "Autre" },
];

export function BookReservationDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentAuthor,
  documentYear,
  supportType = "Livre",
  supportStatus,
  isFreeAccess = false,
  allowPhysicalConsultation = true,
  onReserve,
}: BookReservationDialogProps) {
  const { user, profile } = useAuth();
  const { userRole, isAuthenticated, isAdmin, isLibrarian } = useAccessControl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhysicalWarning, setShowPhysicalWarning] = useState(false);

  const form = useForm<BookReservationFormData>({
    resolver: zodResolver(bookReservationSchema),
    defaultValues: {
      documentId,
      documentTitle,
      documentAuthor: documentAuthor || "",
      documentYear: documentYear || "",
      supportType,
      supportStatus,
      isFreeAccess,
      allowPhysicalConsultation,
      requestPhysical: false,
      userName: profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : "",
      userEmail: user?.email || "",
      userPhone: profile?.phone || "",
      userType: "",
      motif: "",
      comments: "",
    },
  });

  const requestPhysical = form.watch("requestPhysical");

  useEffect(() => {
    if (requestPhysical && !allowPhysicalConsultation) {
      setShowPhysicalWarning(true);
    } else {
      setShowPhysicalWarning(false);
    }
  }, [requestPhysical, allowPhysicalConsultation]);

  // Fonction pour déterminer le routage
  const determineRouting = (data: BookReservationFormData): {
    routedTo: "bibliotheque_numerique" | "responsable_support";
    message: string;
  } => {
    if (data.isFreeAccess) {
      return {
        routedTo: "bibliotheque_numerique",
        message: "Document libre d'accès - redirection vers la Bibliothèque Numérique",
      };
    }

    if (data.supportStatus === "numerise") {
      if (data.requestPhysical) {
        if (!data.allowPhysicalConsultation) {
          throw new Error("La consultation physique n'est pas autorisée pour ce document");
        }
        return {
          routedTo: "responsable_support",
          message: "Demande de consultation physique - routée vers le Responsable Support",
        };
      }
      return {
        routedTo: "bibliotheque_numerique",
        message: "Document numérisé - routé vers la Bibliothèque Numérique",
      };
    }

    return {
      routedTo: "responsable_support",
      message: "Document non numérisé - routé vers le Responsable Support",
    };
  };

  const onSubmit = async (data: BookReservationFormData) => {
    setIsSubmitting(true);

    try {
      // Vérification de la consultation physique
      if (data.requestPhysical && !data.allowPhysicalConsultation) {
        toast.error("La consultation physique n'est pas autorisée pour ce document");
        setIsSubmitting(false);
        return;
      }

      // Déterminer le routage
      const routing = determineRouting(data);

      // Préparer les données pour l'insertion
      const reservationData = {
        user_id: user?.id || null,
        document_id: data.documentId,
        document_title: data.documentTitle,
        document_author: data.documentAuthor || null,
        document_year: data.documentYear || null,
        support_type: data.supportType,
        support_status: data.supportStatus,
        is_free_access: data.isFreeAccess,
        request_physical: data.requestPhysical,
        allow_physical_consultation: data.allowPhysicalConsultation,
        routed_to: routing.routedTo,
        statut: "soumise",
        requested_date: data.requestedDate ? data.requestedDate.toISOString().split('T')[0] : null,
        motif: data.motif || null,
        user_name: data.userName,
        user_email: data.userEmail,
        user_phone: data.userPhone || null,
        user_type: data.userType || null,
        comments: data.comments || null,
      };

      const { error } = await supabase
        .from("reservations_ouvrages")
        .insert([reservationData]);

      if (error) throw error;

      toast.success("Réservation soumise avec succès", {
        description: routing.message,
      });

      onReserve?.();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Erreur lors de la soumission de la réservation:", error);
      toast.error("Erreur lors de la soumission", {
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si c'est libre accès, la logique est gérée dans NoticeDetaillee
  // On n'empêche pas les admins de voir le formulaire pour tests

  const getStatusBadge = () => {
    if (supportStatus === "libre_acces") {
      return (
        <div className="flex items-center gap-2 text-success">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">Libre accès</span>
        </div>
      );
    }
    if (supportStatus === "numerise") {
      return (
        <div className="flex items-center gap-2 text-primary">
          <Library className="h-4 w-4" />
          <span className="font-medium">Numérisé - Accès restreint</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-warning">
        <Building2 className="h-4 w-4" />
        <span className="font-medium">Non numérisé - Consultation physique</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Réserver un Ouvrage
          </DialogTitle>
          <DialogDescription>
            Complétez ce formulaire pour réserver l'accès à cet ouvrage
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Statut du document */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Statut du document</h3>
                      <p className="text-sm text-muted-foreground">
                        {documentTitle}
                      </p>
                    </div>
                    {getStatusBadge()}
                  </div>
                  {documentAuthor && (
                    <p className="text-sm text-muted-foreground">
                      Auteur: {documentAuthor}
                    </p>
                  )}
                  {documentYear && (
                    <p className="text-sm text-muted-foreground">
                      Année: {documentYear}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Consultation physique */}
            {supportStatus !== "libre_acces" && (
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="requestPhysical"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-semibold">
                            Demande de consultation physique
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Souhaitez-vous consulter le document sur place?
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {showPhysicalWarning && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="text-sm text-destructive">
                        <p className="font-medium">Consultation physique non autorisée</p>
                        <p>Ce document ne peut pas être consulté physiquement. Veuillez accéder à la version numérique.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informations personnelles */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold mb-3">Vos informations</h3>
                
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Votre nom et prénom" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="votre@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+212 6XX XXX XXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAuthenticated && (
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de demandeur</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre profil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USER_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Détails de la demande */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold mb-3">Détails de la demande</h3>

                <FormField
                  control={form.control}
                  name="requestedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date souhaitée de consultation</FormLabel>
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
                                <span>Sélectionnez une date</span>
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
                            disabled={(date) => date < new Date()}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de la demande</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Recherche, étude, documentation, etc."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaires additionnels</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informations complémentaires..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || showPhysicalWarning}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
