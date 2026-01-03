import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserTypeSelectionModal } from "@/components/legal-deposit/UserTypeSelectionModal";
import { AuthChoiceModal } from "@/components/legal-deposit/AuthChoiceModal";

export default function PeriodicalsDeposit() {
  const [showForm, setShowForm] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<"editeur" | "imprimeur">("editeur");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartDeclaration = () => {
    setShowUserTypeModal(true);
  };

  const handleUserTypeSelect = (type: "editeur" | "imprimeur") => {
    setShowUserTypeModal(false);
    setSelectedUserType(type);
    
    if (user) {
      setShowForm(true);
    } else {
      setShowAuthChoiceModal(true);
    }
  };

  // Mapper le type sélectionné vers le format attendu par LegalDepositDeclaration
  const mappedUserType = selectedUserType === "editeur" ? "editor" : "printer";

  if (showForm) {
    return (
      <LegalDepositDeclaration 
        depositType="periodique" 
        onClose={() => setShowForm(false)}
        initialUserType={mappedUserType}
      />
    );
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 mb-4">
              <Newspaper className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Dépôt Légal - Périodiques
            </h1>
            <p className="text-xl text-muted-foreground">
              Formulaire de déclaration pour les journaux, magazines et revues
            </p>
          </div>

          {/* Informations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Documents concernés</CardTitle>
              <CardDescription>
                Types de publications acceptés pour cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Journaux quotidiens et hebdomadaires</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Magazines et revues mensuelles</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Revues scientifiques et académiques</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Bulletins et newsletters</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">Annuaires et publications périodiques</p>
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
              <Newspaper className="h-5 w-5 mr-2" />
              Commencer la déclaration
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Modale de sélection du type de déclarant */}
      <UserTypeSelectionModal
        open={showUserTypeModal}
        onOpenChange={setShowUserTypeModal}
        onSelectType={handleUserTypeSelect}
      />

      {/* Modale de choix d'authentification */}
      <AuthChoiceModal
        open={showAuthChoiceModal}
        onOpenChange={setShowAuthChoiceModal}
        userType={selectedUserType}
        redirectPath="/depot-legal/periodiques"
      />
    </div>
  );
}
