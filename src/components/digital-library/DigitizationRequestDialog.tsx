import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  digitizationRequestSchema, 
  type DigitizationRequestFormData,
  USAGE_TYPES
} from "@/schemas/digitizationRequestSchema";

interface DigitizationRequestDialogProps {
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

export function DigitizationRequestDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle = "",
  documentCote = "",
  userProfile,
}: DigitizationRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DigitizationRequestFormData>({
    resolver: zodResolver(digitizationRequestSchema),
    defaultValues: {
      documentId,
      documentTitle,
      documentCote,
      userName: `${userProfile.firstName} ${userProfile.lastName}`,
      userEmail: userProfile.email,
      pagesCount: 1,
      justification: "",
      usageType: "research",
      copyrightAgreement: false,
    },
  });

  const onSubmit = async (data: DigitizationRequestFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour faire une demande");
        return;
      }

      let attachmentUrl = null;

      // Upload du fichier si présent
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('digitization-attachments')
          .upload(fileName, selectedFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Erreur lors de l'upload du fichier");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('digitization-attachments')
          .getPublicUrl(fileName);

        attachmentUrl = publicUrl;
      }

      // Insertion de la demande
      const { error } = await supabase
        .from("digitization_requests")
        .insert({
          user_id: user.id,
          document_id: data.documentId || null,
          document_title: data.documentTitle,
          document_cote: data.documentCote || null,
          user_name: data.userName,
          user_email: data.userEmail,
          pages_count: data.pagesCount,
          justification: data.justification,
          usage_type: data.usageType,
          attachment_url: attachmentUrl,
          copyright_agreement: data.copyrightAgreement,
          status: "en_attente",
        });

      if (error) throw error;

      toast.success(
        "Votre demande a été transmise pour examen. Vous serez notifié par e-mail."
      );
      
      form.reset();
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Error submitting digitization request:", error);
      toast.error("Erreur lors de la soumission de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("attachmentFile", file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demande de Numérisation
          </DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour demander la numérisation d'un document
          </DialogDescription>
        </DialogHeader>

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
                  <FormLabel>Titre du document *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entrez le titre du document" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cote du document */}
            <FormField
              control={form.control}
              name="documentCote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cote du document (si connue)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: MS-2024-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre de pages */}
            <FormField
              control={form.control}
              name="pagesCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de pages à numériser *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="1000"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>Maximum 1000 pages</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Justification */}
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification de la demande *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Expliquez pourquoi vous avez besoin de numériser ce document..."
                      className="resize-none min-h-[100px]"
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 20 caractères, maximum 2000 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type d'utilisation */}
            <FormField
              control={form.control}
              name="usageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'utilisation *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type d'utilisation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(USAGE_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pièce jointe */}
            <FormField
              control={form.control}
              name="attachmentFile"
              render={() => (
                <FormItem>
                  <FormLabel>Pièce jointe (facultatif)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    PDF ou image (JPEG, PNG) - Maximum 10MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accord droits d'auteur */}
            <FormField
              control={form.control}
              name="copyrightAgreement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Je m'engage à respecter les droits d'auteur et d'usage *
                    </FormLabel>
                    <FormDescription>
                      Vous certifiez que l'utilisation de ce document respectera les droits d'auteur
                      et la propriété intellectuelle
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
