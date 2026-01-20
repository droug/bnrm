import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserTypeSelectionModal } from "@/components/legal-deposit/UserTypeSelectionModal";
import { AuthChoiceModal } from "@/components/legal-deposit/AuthChoiceModal";
import { LegalDepositHeader } from "@/components/legal-deposit/LegalDepositHeader";
import { LegalDepositInfoCard } from "@/components/legal-deposit/LegalDepositInfoCard";
import { WatermarkContainer } from "@/components/ui/watermark";

export default function SpecializedCollectionsDeposit() {
  const [showForm, setShowForm] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<"editeur" | "imprimeur">("editeur");
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

  const mappedUserType = selectedUserType === "editeur" ? "editor" : "printer";

  if (showForm) {
    return <LegalDepositDeclaration depositType="collections_specialisees" onClose={() => setShowForm(false)} initialUserType={mappedUserType} />;
  }

  const documents = [
    "Cartes géographiques et atlas",
    "Partitions musicales et œuvres musicales",
    "Documents patrimoniaux et historiques",
    "Collections artistiques et beaux-livres",
    "Archives et fonds documentaires spécialisés"
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
              title="Dépôt Légal - Collections Spécialisées"
              subtitle="Formulaire de déclaration pour les collections spécialisées et documents rares"
              icon={FolderOpen}
              iconColorClass="text-orange-600"
              iconBgClass="bg-orange-100 dark:bg-orange-950"
              warningText="Pour accéder au formulaire de demande de dépôt légal, il est obligatoire de disposer d'un compte Éditeur et d'un compte Imprimeur"
            />

            <div className="grid gap-6">
              <LegalDepositInfoCard
                documents={documents}
                icon={FolderOpen}
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
          redirectPath="/depot-legal/collections-specialisees"
        />
      </div>
    </WatermarkContainer>
  );
}