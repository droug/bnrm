import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { Newspaper } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserTypeSelectionModal } from "@/components/legal-deposit/UserTypeSelectionModal";
import { AuthChoiceModal } from "@/components/legal-deposit/AuthChoiceModal";
import { LegalDepositHeader } from "@/components/legal-deposit/LegalDepositHeader";
import { LegalDepositInfoCard } from "@/components/legal-deposit/LegalDepositInfoCard";
import { WatermarkContainer } from "@/components/ui/watermark";

export default function PeriodicalsDeposit() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [showForm, setShowForm] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<"editeur" | "imprimeur">("editeur");
  const { user } = useAuth();

  useEffect(() => {
    if (editId && user) {
      setShowForm(true);
    }
  }, [editId, user]);

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

  const mappedUserType = selectedUserType === "editeur" ? "editor" : "printer";

  if (showForm) {
    return (
      <LegalDepositDeclaration 
        depositType="periodique" 
        onClose={() => setShowForm(false)}
        initialUserType={editId ? "editor" : mappedUserType}
        editId={editId}
      />
    );
  }

  const documents = [
    "Journaux quotidiens et hebdomadaires",
    "Magazines et revues mensuelles",
    "Revues scientifiques et académiques",
    "Bulletins et newsletters",
    "Annuaires et publications périodiques"
  ];

  return (
    <WatermarkContainer
      watermarkProps={{
        text: "BNRM - Bibliothèque Nationale du Royaume du Maroc",
        variant: "library",
        position: "scattered",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <LegalDepositHeader
              title="Dépôt Légal - Périodiques"
              subtitle="Formulaire de déclaration pour les journaux, magazines et revues"
              icon={Newspaper}
              iconColorClass="text-green-600"
              iconBgClass="bg-green-100 dark:bg-green-950"
              warningText="Pour accéder au formulaire de demande de dépôt légal, il est obligatoire de disposer d'un compte Éditeur et d'un compte Imprimeur"
            />

            <div className="grid gap-6">
              <LegalDepositInfoCard
                documents={documents}
                icon={Newspaper}
                buttonLabel="Commencer la déclaration"
                onStartDeclaration={handleStartDeclaration}
                showReciprocalWarning={true}
              />
            </div>
          </div>
        </main>
        
        <Footer />

        <UserTypeSelectionModal
          open={showUserTypeModal}
          onOpenChange={setShowUserTypeModal}
          onSelectType={handleUserTypeSelect}
        />

        <AuthChoiceModal
          open={showAuthChoiceModal}
          onOpenChange={setShowAuthChoiceModal}
          userType={selectedUserType}
          redirectPath="/depot-legal/periodiques"
        />
      </div>
    </WatermarkContainer>
  );
}
