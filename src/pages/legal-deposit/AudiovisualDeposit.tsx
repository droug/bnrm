import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AudiovisualDeposit() {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  if (showForm) {
    return <LegalDepositDeclaration depositType="bd_logiciels" onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <Button
            variant="ghost"
            onClick={() => navigate("/depot-legal")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux types de dépôt
          </Button>

          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 mb-4">
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Dépôt Légal - Audio-visuel & Logiciels
            </h1>
            <p className="text-xl text-muted-foreground">
              Formulaire de déclaration pour les documents audiovisuels et logiciels
            </p>
          </div>

          {/* Informations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Documents concernés</CardTitle>
              <CardDescription>
                Types de contenus acceptés pour cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Enregistrements sonores (CD, vinyles, fichiers audio)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Films, documentaires et vidéos</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Logiciels et applications informatiques</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Jeux vidéo et contenus multimédia</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Contenus audiovisuels en ligne</p>
              </div>
            </CardContent>
          </Card>

          {/* Bouton d'action */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              className="px-8"
            >
              <Video className="h-5 w-5 mr-2" />
              Commencer la déclaration
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
