import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BibliothequeAutocomplete } from "@/components/ui/bibliotheque-autocomplete";
import { FileUpload } from "@/components/ui/file-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SimpleSelect } from "@/components/ui/simple-select";
import { ArrowLeft, GraduationCap, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateParticipantsTemplate } from "@/utils/generateParticipantsTemplate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CBMDemandeFormation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [bibliotheque, setBibliotheque] = useState("");
  const [bibliothequeId, setBibliothequeId] = useState<string | undefined>();
  const [bibliothequeType, setBibliothequeType] = useState<string | undefined>();
  const [participantsFile, setParticipantsFile] = useState<File | null>(null);
  const [besoinsSpecifiques, setBesoinsSpecifiques] = useState("");
  const [typeFormation, setTypeFormation] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingFormData(formData);
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (!pendingFormData) return;
    
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      // Upload du fichier participants si présent
      let fichierParticipantsPath = null;
      if (participantsFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${participantsFile.name}`;
        const filePath = `participants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("formations")
          .upload(filePath, participantsFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Erreur lors de l'upload du fichier");
        }

        fichierParticipantsPath = filePath;
      }
      
      const { error } = await supabase
        .from("cbm_demandes_formation")
        .insert({
          nom_organisme: bibliotheque,
          type_organisme: bibliothequeType || "autre",
          nom_contact: pendingFormData.get("nom_contact") as string,
          fonction_contact: pendingFormData.get("fonction_contact") as string,
          email: pendingFormData.get("email") as string,
          telephone: pendingFormData.get("telephone") as string,
          type_formation: typeFormation,
          nombre_participants: parseInt(pendingFormData.get("nombre_participants") as string),
          besoins_specifiques: besoinsSpecifiques,
          fichier_participants_path: fichierParticipantsPath,
          statut: "en_attente"
        });

      if (error) throw error;

      toast.success("Demande de formation envoyée avec succès");
      setBibliotheque("");
      setBibliothequeId(undefined);
      setBibliothequeType(undefined);
      setParticipantsFile(null);
      setBesoinsSpecifiques("");
      setTypeFormation("");
      setPendingFormData(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await generateParticipantsTemplate();
      toast.success("Canevas téléchargé avec succès");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Erreur lors du téléchargement du canevas");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <Link to="/cbm" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au portail CBM
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Demande de Formation
            </h1>
            <p className="text-lg text-muted-foreground">
              Sollicitez une formation adaptée aux besoins de votre établissement
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulaire de Demande</CardTitle>
              <CardDescription>
                Veuillez remplir tous les champs pour soumettre votre demande de formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organisme */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Organisme
                  </h3>
                  
                  <div className="space-y-2">
                    <BibliothequeAutocomplete
                      value={bibliotheque}
                      onChange={(value, id, type) => {
                        setBibliotheque(value);
                        setBibliothequeId(id);
                        setBibliothequeType(type);
                      }}
                      label="Bibliothèque *"
                      placeholder="Rechercher votre bibliothèque..."
                    />
                    {!bibliotheque && (
                      <p className="text-xs text-muted-foreground">
                        Commencez à taper pour rechercher parmi les bibliothèques adhérentes
                      </p>
                    )}
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Informations de contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom_contact">Nom du contact *</Label>
                      <Input
                        id="nom_contact"
                        name="nom_contact"
                        required
                        placeholder="Nom et prénom"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fonction_contact">Fonction *</Label>
                      <Input
                        id="fonction_contact"
                        name="fonction_contact"
                        required
                        placeholder="Votre fonction"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="email@exemple.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone *</Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        required
                        placeholder="+212 6XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Détails de la formation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Détails de la formation souhaitée
                  </h3>
                  
                  <SimpleSelect
                    label="Type de formation"
                    placeholder="Sélectionnez le type de formation"
                    value={typeFormation}
                    onChange={setTypeFormation}
                    required
                    options={[
                      { value: "catalogage_normes", label: "Catalogage (Normes)" },
                      { value: "classification_indexation", label: "Classification - indexation" },
                      { value: "chaine_documentaire", label: "Chaine documentaire" },
                      { value: "cotation", label: "Cotation" },
                      { value: "formats_marc", label: "Formats MARC - UNIMARC" },
                      { value: "systeme_gestion", label: "Système de gestion de bibliothèque" },
                      { value: "recherche_documentaire", label: "Recherche documentaire" },
                      { value: "numerisation", label: "Numérisation et archivage" },
                      { value: "gestion_collections", label: "Gestion des collections" },
                      { value: "accueil_usagers", label: "Accueil et services aux usagers" },
                      { value: "autre", label: "Autre" },
                    ]}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="nombre_participants">Nombre de participants *</Label>
                    <Input
                      id="nombre_participants"
                      name="nombre_participants"
                      type="number"
                      min="1"
                      required
                      placeholder="Nombre estimé"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="participants-file">Liste des participants</Label>
                    <FileUpload
                      label=""
                      accept=".xlsx,.xls,.csv"
                      maxSize={5}
                      value={participantsFile}
                      onChange={setParticipantsFile}
                      onDownloadTemplate={handleDownloadTemplate}
                      templateLabel="Télécharger le canevas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Téléchargez le canevas, remplissez-le avec les informations des participants, puis importez-le ici
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="besoins_specifiques">Besoins spécifiques</Label>
                    <RichTextEditor
                      value={besoinsSpecifiques}
                      onChange={setBesoinsSpecifiques}
                      placeholder="Décrivez vos besoins spécifiques et objectifs de formation..."
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Confirmer l'envoi de la demande
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Vous êtes sur le point d'envoyer une demande de formation avec les informations suivantes :</p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <p><strong>Bibliothèque :</strong> {bibliotheque || "Non renseignée"}</p>
                <p><strong>Type de formation :</strong> {typeFormation ? 
                  typeFormation === "catalogage_normes" ? "Catalogage (Normes)" :
                  typeFormation === "classification_indexation" ? "Classification - indexation" :
                  typeFormation === "chaine_documentaire" ? "Chaine documentaire" :
                  typeFormation === "cotation" ? "Cotation" :
                  typeFormation === "formats_marc" ? "Formats MARC - UNIMARC" :
                  typeFormation === "systeme_gestion" ? "Système de gestion de bibliothèque" :
                  typeFormation === "recherche_documentaire" ? "Recherche documentaire" :
                  typeFormation === "numerisation" ? "Numérisation et archivage" :
                  typeFormation === "gestion_collections" ? "Gestion des collections" :
                  typeFormation === "accueil_usagers" ? "Accueil et services aux usagers" :
                  "Autre" : "Non renseigné"}</p>
                <p><strong>Nombre de participants :</strong> {pendingFormData?.get("nombre_participants")?.toString() || "Non renseigné"}</p>
              </div>
              <p className="text-foreground pt-2">Voulez-vous confirmer l'envoi de cette demande ?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Confirmer l'envoi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
      <GlobalAccessibilityTools />
    </div>
  );
}
