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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function CBMDemandeFormation() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from("cbm_demandes_formation")
        .insert({
          nom_organisme: formData.get("nom_organisme") as string,
          type_organisme: formData.get("type_organisme") as string,
          nom_contact: formData.get("nom_contact") as string,
          fonction_contact: formData.get("fonction_contact") as string,
          email: formData.get("email") as string,
          telephone: formData.get("telephone") as string,
          type_formation: formData.get("type_formation") as string,
          nombre_participants: parseInt(formData.get("nombre_participants") as string),
          besoins_specifiques: formData.get("besoins_specifiques") as string,
          statut: "en_attente"
        });

      if (error) throw error;

      toast.success("Demande de formation envoyée avec succès");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
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
                {/* Informations de l'organisme */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Informations de l'organisme
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nom_organisme">Nom de l'organisme *</Label>
                    <Input
                      id="nom_organisme"
                      name="nom_organisme"
                      required
                      placeholder="Nom de votre bibliothèque ou institution"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_organisme">Type d'organisme *</Label>
                    <Select name="type_organisme" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bibliotheque_publique">Bibliothèque Publique</SelectItem>
                        <SelectItem value="bibliotheque_universitaire">Bibliothèque Universitaire</SelectItem>
                        <SelectItem value="bibliotheque_specialisee">Bibliothèque Spécialisée</SelectItem>
                        <SelectItem value="centre_documentation">Centre de Documentation</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="type_formation">Type de formation *</Label>
                    <Select name="type_formation" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de formation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="catalogage">Catalogage et classification</SelectItem>
                        <SelectItem value="systeme_gestion">Système de gestion de bibliothèque</SelectItem>
                        <SelectItem value="recherche_documentaire">Recherche documentaire</SelectItem>
                        <SelectItem value="numerisation">Numérisation et archivage</SelectItem>
                        <SelectItem value="gestion_collections">Gestion des collections</SelectItem>
                        <SelectItem value="accueil_usagers">Accueil et services aux usagers</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                    <Label htmlFor="besoins_specifiques">Besoins spécifiques</Label>
                    <Textarea
                      id="besoins_specifiques"
                      name="besoins_specifiques"
                      rows={5}
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
