import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { UserTypeSelectionModal } from "@/components/legal-deposit/UserTypeSelectionModal";

export default function BooksDeposit() {
  const [showForm, setShowForm] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<"editeur" | "imprimeur" | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartDeclaration = () => {
    setShowUserTypeModal(true);
  };

  const handleUserTypeSelect = (type: "editeur" | "imprimeur") => {
    setSelectedUserType(type);
    setShowUserTypeModal(false);
    
    if (user) {
      setShowForm(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowForm(true);
  };

  if (showForm) {
    return <LegalDepositDeclaration depositType="monographie" onClose={() => setShowForm(false)} />;
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 mb-4">
              <Book className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Dépôt Légal - Livres
            </h1>
            <p className="text-xl text-muted-foreground">
              Formulaire de déclaration pour les livres et publications imprimées
            </p>
          </div>

          {/* Informations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Documents concernés</CardTitle>
              <CardDescription>
                Types de documents acceptés pour cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Livres imprimés (fiction, essais, manuels, etc.)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">E-books</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Thèses et mémoires</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Ouvrages scolaires et universitaires</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Beaux-livres et expositions</p>
              </div>
            </CardContent>
          </Card>

          {/* Bouton d'action */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleStartDeclaration}
              className="px-8"
            >
              <Book className="h-5 w-5 mr-2" />
              Commencer la déclaration
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Modal de sélection du type d'utilisateur */}
      <UserTypeSelectionModal
        open={showUserTypeModal}
        onOpenChange={setShowUserTypeModal}
        onSelectType={handleUserTypeSelect}
      />

      {/* Modal d'authentification */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
        title="Connexion requise"
        description={`Veuillez vous connecter ou créer un compte ${selectedUserType === "imprimeur" ? "imprimeur" : "éditeur"} pour effectuer un dépôt légal.`}
      />
    </div>
  );
}
