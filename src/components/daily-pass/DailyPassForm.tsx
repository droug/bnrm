import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { BasicDropdown } from "@/components/ui/basic-dropdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  profileType: z.enum(["chercheur", "chercheur_retraite", "etudiant_3eme", "etudiant_autre", "professionnel", "autre"], {
    required_error: "Veuillez sélectionner votre profil",
  }),
  firstName: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(100),
  lastName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(10, "Numéro de téléphone invalide").max(20),
  institution: z.string().trim().min(2, "L'établissement est requis").max(200),
  researchSubject: z.string().trim().optional(),
  studyLevel: z.string().trim().optional(),
  justification: z.string().trim().max(500, "Maximum 500 caractères").optional(),
  justificationFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyPassFormProps {
  onClose: () => void;
}

export function DailyPassForm({ onClose }: DailyPassFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      institution: "",
      researchSubject: "",
      studyLevel: "",
      justification: "",
    },
  });

  const profileType = form.watch("profileType");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
      });
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Format de fichier invalide",
        description: "Formats acceptés : PDF, JPG, PNG",
      });
      return;
    }

    setUploadedFile(file);
    form.setValue("justificationFile", file);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // TODO: Implémenter la logique de soumission
      // 1. Upload du fichier vers Supabase Storage
      // 2. Création de la demande dans la base de données
      // 3. Vérification de l'éligibilité (1 fois par an)
      
      console.log("Form data:", data);
      console.log("Uploaded file:", uploadedFile);

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Demande envoyée",
        description: "Votre demande de pass journalier a été soumise avec succès",
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Demande de Pass Journalier
        </CardTitle>
        <CardDescription>
          Accès gratuit limité à une fois par an. Veuillez remplir tous les champs requis.
          <br />
          * Reproduction selon la politique interne de la BNRM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type de profil */}
            <FormField
              control={form.control}
              name="profileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de profil *</FormLabel>
                  <FormControl>
                    <BasicDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionnez votre profil"
                      options={[
                        { value: "chercheur", label: "Chercheur" },
                        { value: "chercheur_retraite", label: "Chercheur retraité" },
                        { value: "etudiant_3eme", label: "Étudiant 3ème année (PFE)" },
                        { value: "etudiant_autre", label: "Étudiant (autre niveau)" },
                        { value: "professionnel", label: "Professionnel" },
                        { value: "autre", label: "Autre" },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 6XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Établissement */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Établissement / Institution *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de votre établissement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Champs conditionnels selon le profil */}
            {profileType === "chercheur" && (
              <FormField
                control={form.control}
                name="researchSubject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet de recherche *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de votre recherche" {...field} />
                    </FormControl>
                    <FormDescription>
                      Veuillez fournir un document officiel justifiant votre sujet de recherche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {profileType === "etudiant_3eme" && (
              <FormField
                control={form.control}
                name="studyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filière et année d'étude *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Master Informatique, 3ème année" {...field} />
                    </FormControl>
                    <FormDescription>
                      Veuillez fournir un document justifiant votre PFE (Projet de Fin d'Étude)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Justification supplémentaire */}
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification de la demande</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Expliquez brièvement pourquoi vous souhaitez accéder aux ressources..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 500 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload du document justificatif */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document justificatif
              </FormLabel>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {uploadedFile ? (
                      <>
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Cliquez pour uploader ou glissez votre document
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG ou PNG (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              <FormDescription>
                Vous pouvez joindre un document justificatif si nécessaire (attestation, carte d'étudiant, etc.)
              </FormDescription>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
