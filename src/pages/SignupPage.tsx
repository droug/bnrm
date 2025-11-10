import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Printer, Users, PenTool, Truck, Clapperboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditorSignupForm from "@/components/EditorSignupForm";
import PrinterSignupForm from "@/components/PrinterSignupForm";
import AuthorSignupForm from "@/components/AuthorSignupForm";
import DistributorSignupForm from "@/components/DistributorSignupForm";
import ProducerSignupForm from "@/components/ProducerSignupForm";
import { WatermarkContainer } from "@/components/ui/watermark";

const SignupPage = () => {
  const [selectedType, setSelectedType] = useState<string>("");
  const navigate = useNavigate();

  const renderTypeSelection = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choisir le type de compte</h1>
        <p className="text-muted-foreground">
          Sélectionnez le type de compte qui correspond à votre activité
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Compte auteur */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary"
          onClick={() => setSelectedType("author")}
        >
          <CardHeader className="text-center">
            <PenTool className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <CardTitle>Compte Auteur</CardTitle>
            <CardDescription>
              Pour les auteurs et écrivains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Publication d'œuvres littéraires</li>
              <li>• Gestion des droits d'auteur</li>
              <li>• Promotion de vos créations</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Créer un compte auteur
            </Button>
          </CardContent>
        </Card>

        {/* Compte distributeur */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-muted"
          onClick={() => setSelectedType("distributor")}
        >
          <CardHeader className="text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Compte Distributeur</CardTitle>
            <CardDescription>
              Pour les distributeurs et diffuseurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Distribution d'ouvrages</li>
              <li>• Gestion de réseau commercial</li>
              <li>• Logistique et stockage</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Créer un compte distributeur
            </Button>
          </CardContent>
        </Card>

        {/* Compte producteur */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
          onClick={() => setSelectedType("producer")}
        >
          <CardHeader className="text-center">
            <Clapperboard className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Compte Producteur</CardTitle>
            <CardDescription>
              Pour les producteurs de contenus éditoriaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Production audiovisuelle et multimédia</li>
              <li>• Dépôt légal de productions</li>
              <li>• Services dédiés aux producteurs</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Créer un compte producteur
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
                  {selectedType === "editor" && "Inscription Éditeur"}
                  {selectedType === "printer" && "Inscription Imprimeur"}
                  {selectedType === "author" && "Inscription Auteur"}
                  {selectedType === "distributor" && "Inscription Distributeur"}
                  {selectedType === "producer" && "Inscription Producteur"}
                </h1>
              </div>

              {selectedType === "editor" && <EditorSignupForm />}
              {selectedType === "printer" && <PrinterSignupForm />}
              {selectedType === "author" && <AuthorSignupForm />}
              {selectedType === "distributor" && <DistributorSignupForm />}
              {selectedType === "producer" && <ProducerSignupForm />}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </WatermarkContainer>
  );
};

export default SignupPage;