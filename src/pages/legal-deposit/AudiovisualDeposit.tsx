import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";
import { Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProducerTypeSelectionModal } from "@/components/legal-deposit/ProducerTypeSelectionModal";
import { AuthChoiceModal } from "@/components/legal-deposit/AuthChoiceModal";
import { LegalDepositHeader } from "@/components/legal-deposit/LegalDepositHeader";
import { LegalDepositInfoCard } from "@/components/legal-deposit/LegalDepositInfoCard";
import { WatermarkContainer } from "@/components/ui/watermark";

export default function AudiovisualDeposit() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [showForm, setShowForm] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (editId && user) {
      setShowForm(true);
    }
  }, [editId, user]);

  const handleStartDeclaration = () => {
    setShowUserTypeModal(true);
  };

  const handleUserTypeSelect = (type: "producteur") => {
    setShowUserTypeModal(false);
    
    if (user) {
      setShowForm(true);
    } else {
      setShowAuthChoiceModal(true);
    }
  };

  if (showForm) {
    return (
      <LegalDepositDeclaration 
        depositType="bd_logiciels" 
        onClose={() => setShowForm(false)}
        initialUserType={editId ? "producer" : "producer"}
        editId={editId}
      />
    );
  }

  const documents = [
    "Enregistrements sonores (CD, vinyles, fichiers audio)",
    "Films, documentaires et vidéos",
    "Logiciels et applications informatiques",
    "Jeux vidéo et contenus multimédia",
    "Contenus audiovisuels en ligne"
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
              title="Dépôt Légal - Audiovisuel & Logiciels"
              subtitle="Formulaire de déclaration pour les contenus audiovisuels et logiciels"
              icon={Video}
              iconColorClass="text-purple-600"
              iconBgClass="bg-purple-100 dark:bg-purple-950"
              warningText="Pour accéder au formulaire de demande de dépôt légal, il est obligatoire de disposer d'un compte Producteur"
            />

            <div className="grid gap-6">
              <LegalDepositInfoCard
                documents={documents}
                icon={Video}
                buttonLabel="Commencer la déclaration"
                onStartDeclaration={handleStartDeclaration}
              />
            </div>
          </div>
        </main>
        
        <Footer />

        <ProducerTypeSelectionModal
          open={showUserTypeModal}
          onOpenChange={setShowUserTypeModal}
          onSelectType={handleUserTypeSelect}
        />

        <AuthChoiceModal
          open={showAuthChoiceModal}
          onOpenChange={setShowAuthChoiceModal}
          userType="editeur"
          redirectPath="/depot-legal/audiovisuel"
        />
      </div>
    </WatermarkContainer>
  );
}
