import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Printer, Users, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditorSignupForm from "@/components/EditorSignupForm";
import PrinterSignupForm from "@/components/PrinterSignupForm";
import { WatermarkContainer } from "@/components/ui/watermark";

const SignupPage = () => {
  const [selectedType, setSelectedType] = useState<string>("");

  const renderTypeSelection = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choisir le type de compte</h1>
        <p className="text-muted-foreground">
          Sélectionnez le type de compte qui correspond à votre activité
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compte utilisateur standard */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary"
          onClick={() => window.location.href = '/auth'}
        >
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Compte Utilisateur</CardTitle>
            <CardDescription>
              Pour les chercheurs, étudiants et visiteurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Accès aux collections publiques</li>
              <li>• Demandes de consultation</li>
              <li>• Services de reproduction</li>
            </ul>
            <Button className="w-full mt-4">
              S'inscrire
            </Button>
          </CardContent>
        </Card>

        {/* Compte éditeur */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-accent"
          onClick={() => setSelectedType("editor")}
        >
          <CardHeader className="text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-accent" />
            <CardTitle>Compte Éditeur</CardTitle>
            <CardDescription>
              Pour les maisons d'édition et éditeurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Dépôt légal des publications</li>
              <li>• Suivi des dépôts</li>
              <li>• Services dédiés aux éditeurs</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Créer un compte éditeur
            </Button>
          </CardContent>
        </Card>

        {/* Compte imprimeur */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-highlight"
          onClick={() => setSelectedType("printer")}
        >
          <CardHeader className="text-center">
            <Printer className="h-12 w-12 mx-auto mb-4 text-highlight" />
            <CardTitle>Compte Imprimeur</CardTitle>
            <CardDescription>
              Pour les imprimeries et prestataires d'impression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Dépôt légal des impressions</li>
              <li>• Gestion des partenariats</li>
              <li>• Services aux imprimeurs</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Créer un compte imprimeur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <WatermarkContainer>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {!selectedType ? (
            renderTypeSelection()
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedType("")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <h1 className="text-2xl font-bold">
                  {selectedType === "editor" ? "Inscription Éditeur" : "Inscription Imprimeur"}
                </h1>
              </div>

              {selectedType === "editor" && <EditorSignupForm />}
              {selectedType === "printer" && <PrinterSignupForm />}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </WatermarkContainer>
  );
};

export default SignupPage;