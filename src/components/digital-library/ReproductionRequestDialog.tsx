import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
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
import { PortalSelect } from "@/components/ui/portal-select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Schéma de validation
const reproductionRequestSchema = z.object({
  userName: z.string().min(2, "Le nom est requis"),
  userEmail: z.string().email("Email invalide"),
  documentTitle: z.string().min(2, "Le titre du document est requis"),
  documentCote: z.string().optional(),
  reproductionType: z.string().min(1, "Sélectionnez un type de reproduction"),
  deliveryMethod: z.string().min(1, "Sélectionnez un mode de réception"),
  deliveryMethodOther: z.string().optional(),
  quantity: z.number().min(1, "La quantité doit être au moins 1").max(100, "Maximum 100 pages"),
  purpose: z.string().min(1, "Précisez l'usage prévu"),
  urgentRequest: z.boolean().default(false),
  comments: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => {
  if (data.deliveryMethod === "autre" && (!data.deliveryMethodOther || data.deliveryMethodOther.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le mode de réception",
  path: ["deliveryMethodOther"],
});

type ReproductionRequestFormData = z.infer<typeof reproductionRequestSchema>;

interface ReproductionRequestDialogProps {
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

const REPRODUCTION_TYPES = [
  { value: "numerique_mail", label: "Copie numérique par email (PDF)" },
  { value: "numerique_espace", label: "Copie numérique (espace personnel)" },
  { value: "papier", label: "Impression papier" },
  { value: "support_physique", label: "Reproduction sur support physique" },
];


const DELIVERY_METHOD_OPTIONS = [
  { value: "telecharger_espace", label: "À télécharger sur Mon espace" },
  { value: "support_cd", label: "Retrait sur place sous support CD" },
  { value: "autre", label: "Autre" },
];

const PURPOSE_OPTIONS = [
  { value: "recherche", label: "Recherche académique" },
  { value: "publication", label: "Publication scientifique" },
  { value: "exposition", label: "Exposition / Événement culturel" },
  { value: "personnel", label: "Usage personnel" },
  { value: "autre", label: "Autre (préciser en commentaire)" },
];

export function ReproductionRequestDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentCote,
  userProfile,
}: ReproductionRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReproductionRequestFormData>({
    resolver: zodResolver(reproductionRequestSchema),
    defaultValues: {
      documentTitle: documentTitle || "",
      documentCote: documentCote || "",
      reproductionType: "",
      deliveryMethod: "",
      deliveryMethodOther: "",
      quantity: 1,
      purpose: "",
      urgentRequest: false,
      userName: `${userProfile.firstName} ${userProfile.lastName}`,
      userEmail: userProfile.email,
      comments: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: ReproductionRequestFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour faire une demande de reproduction");
        return;
      }

      // Générer un numéro de demande unique
      const requestNumber = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const insertData = {
        user_id: user.id,
        request_number: requestNumber,
        reproduction_modality: data.reproductionType as "numerique_espace" | "numerique_mail" | "papier" | "support_physique",
        status: "brouillon" as const,
        user_notes: data.comments || null,
        metadata: {
          document_id: documentId || null,
          document_title: data.documentTitle,
          document_cote: data.documentCote || null,
          reproduction_type: data.reproductionType,
          delivery_method: data.deliveryMethod,
          delivery_method_other: data.deliveryMethod === "autre" ? data.deliveryMethodOther : null,
          quantity: data.quantity,
          purpose: data.purpose,
          urgent_request: data.urgentRequest,
          user_name: data.userName,
          user_email: data.userEmail,
        },
      };

      const { error } = await supabase
        .from("reproduction_requests")
        .insert([insertData]);

      if (error) throw error;

      toast.success(
        "Votre demande de reproduction a bien été transmise. Vous recevrez un devis par e-mail."
      );
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting reproduction request:", error);
      toast.error("Erreur lors de la soumission de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollableDialog open={isOpen} onOpenChange={onClose}>
      <ScrollableDialogContent className="sm:max-w-[650px]">
        <ScrollableDialogHeader>
          <ScrollableDialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-gold-bn-primary" />
            Demande de Reproduction
          </ScrollableDialogTitle>
          <ScrollableDialogDescription>
            Demandez une reproduction de documents patrimoniaux pour vos recherches ou projets
          </ScrollableDialogDescription>
        </ScrollableDialogHeader>

        <ScrollableDialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations demandeur */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informations du demandeur
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom et prénom</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-background" />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Document concerné */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Document à reproduire
                </h4>
                
                <FormField
                  control={form.control}
                  name="documentTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du document *</FormLabel>
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
                          placeholder="Ex: MS-1234, LIVRE-5678"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Options de reproduction */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Options de reproduction</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reproductionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de reproduction *</FormLabel>
                        <PortalSelect 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner..."
                          options={REPRODUCTION_TYPES}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode de réception *</FormLabel>
                        <PortalSelect 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner..."
                          options={DELIVERY_METHOD_OPTIONS}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("deliveryMethod") === "autre" && (
                  <FormField
                    control={form.control}
                    name="deliveryMethodOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Précisez le mode de réception *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Envoi postal, retrait sur place..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de pages *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>Maximum 100 pages par demande</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage prévu *</FormLabel>
                        <PortalSelect 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner..."
                          options={PURPOSE_OPTIONS}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="urgentRequest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-amber-50/50 dark:bg-amber-950/20">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Demande urgente
                        </FormLabel>
                        <FormDescription>
                          Des frais supplémentaires peuvent s'appliquer pour les demandes urgentes
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Commentaires */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaires ou précisions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Précisez les pages concernées, les détails spécifiques, etc."
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditions d'utilisation */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        J'accepte les conditions d'utilisation *
                      </FormLabel>
                      <FormDescription>
                        Je m'engage à respecter les droits d'auteur et à mentionner la source (BNRM) pour toute utilisation publique
                      </FormDescription>
                    </div>
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
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="bg-gold-bn-primary hover:bg-gold-bn-primary/90"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </ScrollableDialog>
  );
}
