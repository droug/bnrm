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
import { ArrowLeft, GraduationCap, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateParticipantsTemplate } from "@/utils/generateParticipantsTemplate";

export default function CBMDemandeFormation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bibliotheque, setBibliotheque] = useState("");
  const [bibliothequeId, setBibliothequeId] = useState<string | undefined>();
  const [bibliothequeType, setBibliothequeType] = useState<string | undefined>();
  const [participantsFile, setParticipantsFile] = useState<File | null>(null);
  const [besoinsSpecifiques, setBesoinsSpecifiques] = useState("");
  const [typeFormation, setTypeFormation] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload du fichier participants si présent
      let fichierParticipantsPath = null;
      if (participantsFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${participantsFile.name}`;
        const filePath = `participants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cbm-formation-files")
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
          nom_contact: formData.get("nom_contact") as string,
          fonction_contact: formData.get("fonction_contact") as string,
          email: formData.get("email") as string,
          telephone: formData.get("telephone") as string,
          type_formation: typeFormation,
          nombre_participants: parseInt(formData.get("nombre_participants") as string),
          besoins_specifiques: besoinsSpecifiques,
          fichier_participants_path: fichierParticipantsPath,
          statut: "en_attente"
        });

      if (error) throw error;

      toast.success("Demande de formation envoyée avec succès");
      (e.target as HTMLFormElement).reset();
      setBibliotheque("");
      setBibliothequeId(undefined);
      setBibliothequeType(undefined);
      setParticipantsFile(null);
      setBesoinsSpecifiques("");
      setTypeFormation("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateParticipantsTemplate();
    toast.success("Canevas téléchargé avec succès");
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
      
      <Footer />
      <GlobalAccessibilityTools />
    </div>
  );
}
