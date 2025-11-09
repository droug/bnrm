import { useState, useEffect, useRef } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { bookReservationSchema, type BookReservationFormData } from "@/schemas/bookReservationSchema";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Library, Building2, CalendarIcon, AlertCircle, ChevronDown } from "lucide-react";
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
  const [showUserTypeList, setShowUserTypeList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const userTypeRef = useRef<HTMLDivElement>(null);

  // Charger les dates désactivées au montage du composant
  useEffect(() => {
    if (isOpen && documentId) {
      fetchDisabledDates();
    }
  }, [isOpen, documentId]);

  const fetchDisabledDates = async () => {
    try {
      setIsLoadingDates(true);
      const dates: Date[] = [];

      // 1. Récupérer les dates déjà réservées pour ce document
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations_ouvrages")
        .select("requested_date")
        .eq("document_id", documentId)
        .in("statut", ["soumise", "en_cours", "validee"]) // Ne pas inclure les réservations refusées ou archivées
        .not("requested_date", "is", null);

      if (reservationsError) {
        console.error("Erreur lors du chargement des réservations:", reservationsError);
      } else if (reservations) {
        reservations.forEach((reservation) => {
          if (reservation.requested_date) {
            dates.push(new Date(reservation.requested_date));
          }
        });
      }

      // 2. Récupérer les périodes d'indisponibilité depuis le SIGB
      const { data: metadata, error: metadataError } = await supabase
        .from("catalog_metadata")
        .select("custom_fields")
        .eq("source_record_id", documentId)
        .maybeSingle();

      if (metadataError) {
        console.error("Erreur lors du chargement des métadonnées SIGB:", metadataError);
      } else if (metadata?.custom_fields) {
        // Type casting pour accéder aux données SIGB
        const customFields = metadata.custom_fields as Record<string, any>;
        const sigbData = customFields.original_data as Record<string, any> | undefined;
        
        if (sigbData) {
          // Vérifier si le SIGB indique des périodes d'indisponibilité
          // Format attendu: sigbData.unavailableDates = ["2025-01-15", "2025-01-16", ...]
          // ou sigbData.status = "emprunte" / "restauration" / "reliure"
          if (sigbData.unavailableDates && Array.isArray(sigbData.unavailableDates)) {
            sigbData.unavailableDates.forEach((dateStr: string) => {
              dates.push(new Date(dateStr));
            });
          }

          // Si le document est dans un statut non disponible (emprunté, restauration, etc.)
          // on peut désactiver toutes les dates futures jusqu'à une date de retour
          if (sigbData.status && ["emprunte", "restauration", "reliure"].includes(sigbData.status)) {
            // Si une date de retour est disponible
            if (sigbData.returnDate || sigbData.availableFrom) {
              const returnDate = new Date(sigbData.returnDate || sigbData.availableFrom);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Désactiver toutes les dates entre aujourd'hui et la date de retour
              for (let d = new Date(today); d < returnDate; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
              }
            }
          }
        }
      }

      setDisabledDates(dates);
    } catch (error) {
      console.error("Erreur lors du chargement des dates désactivées:", error);
    } finally {
      setIsLoadingDates(false);
    }
  };

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
      comments: "",
      isStudentPFE: false,
      pfeTheme: "",
    },
  });

  const requestPhysical = form.watch("requestPhysical");
  const selectedUserType = form.watch("userType");
  const isStudentPFE = form.watch("isStudentPFE");
  
  // Vérifier si le document est un manuscrit
  const isManuscript = supportType?.toLowerCase().includes("manuscrit");

  useEffect(() => {
    if (requestPhysical && !allowPhysicalConsultation) {
      setShowPhysicalWarning(true);
    } else {
      setShowPhysicalWarning(false);
    }
  }, [requestPhysical, allowPhysicalConsultation]);

  // Fermer la liste si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userTypeRef.current && !userTypeRef.current.contains(event.target as Node)) {
        setShowUserTypeList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          message: "Demande de consultation sur place - routée vers le Responsable Support",
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

      // Vérification pour les manuscrits et étudiants PFE
      if (isManuscript && data.userType === "etudiant") {
        if (!data.isStudentPFE) {
          toast.error("Exception requise", {
            description: "Les manuscrits sont réservés aux chercheurs. Les étudiants doivent avoir un PFE pour faire une demande d'exception.",
          });
          setIsSubmitting(false);
          return;
        }
        if (!data.pfeTheme || !data.pfeProofFile) {
          toast.error("Preuve requise", {
            description: "Veuillez fournir le thème de votre PFE et une preuve justificative.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Déterminer le routage
      const routing = determineRouting(data);

      // Upload du fichier de preuve PFE si présent
      let pfeProofUrl = null;
      if (data.pfeProofFile && data.isStudentPFE) {
        const fileExt = data.pfeProofFile.name.split('.').pop();
        const fileName = `${user?.id || 'guest'}_${Date.now()}.${fileExt}`;
        const filePath = `pfe-proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, data.pfeProofFile);

        if (uploadError) {
          console.error('Error uploading PFE proof:', uploadError);
          toast.error("Erreur lors de l'upload de la preuve", {
            description: "Veuillez réessayer ou contacter le support",
          });
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        pfeProofUrl = urlData.publicUrl;
      }

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
        motif: data.comments || null,
        user_name: data.userName,
        user_email: data.userEmail,
        user_phone: data.userPhone || null,
        user_type: data.userType || null,
        comments: data.comments || null,
        is_student_pfe: data.isStudentPFE || false,
        pfe_theme: data.pfeTheme || null,
        pfe_proof_url: pfeProofUrl,
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
                            Demande de consultation sur place
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
                        <Input 
                          {...field} 
                          placeholder="Votre nom et prénom"
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Information récupérée depuis votre compte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <FormItem className="flex flex-col relative">
                      <FormLabel>Date souhaitée de consultation</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          onClick={() => setShowCalendar(!showCalendar)}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionnez une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                      
                      {showCalendar && (
                        <div className="relative w-full border rounded-lg p-3 bg-popover shadow-lg mt-2">
                          {isLoadingDates ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-muted-foreground">Chargement des disponibilités...</div>
                            </div>
                          ) : (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setShowCalendar(false);
                              }}
                              disabled={(date) => {
                                // Désactiver les dates passées
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (date < today) return true;

                                // Désactiver les dates réservées ou indisponibles
                                return disabledDates.some((disabledDate) => {
                                  const d = new Date(disabledDate);
                                  d.setHours(0, 0, 0, 0);
                                  return d.getTime() === date.getTime();
                                });
                              }}
                              locale={fr}
                              className="pointer-events-auto mx-auto"
                            />
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informations additionnels</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informations complémentaires..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Exception PFE pour manuscrits */}
            {isManuscript && selectedUserType === "etudiant" && (
              <Card className="border-primary/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary">Exception pour les étudiants</p>
                      <p className="text-muted-foreground mt-1">
                        Les manuscrits sont généralement réservés aux chercheurs. Si vous avez un Projet de Fin d'Études (PFE), vous pouvez faire une demande d'exception en fournissant une preuve justificative.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="isStudentPFE"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-semibold">
                            J'ai un Projet de Fin d'Études (PFE)
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Cochez cette case si vous souhaitez demander une exception
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

                  {isStudentPFE && (
                    <div className="space-y-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="pfeTheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thème du PFE *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Intitulé de votre projet de fin d'études" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pfeProofFile"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Preuve justificative *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                className="cursor-pointer"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Document attestant de votre PFE (attestation, page de garde, sujet validé, etc.)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
