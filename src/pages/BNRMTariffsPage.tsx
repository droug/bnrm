import { useAuth } from "@/hooks/useAuth";
import { BNRMTariffs } from "@/components/bnrm/BNRMTariffs";
import { WatermarkContainer } from "@/components/ui/watermark";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BNRMTariffsPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  return (
    <WatermarkContainer>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l'administration</span>
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Tarifs BNRM</h1>
            <p className="text-muted-foreground">
              Gérer les tarifs et services de la Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>
          
          <BNRMTariffs />
        </div>
      </div>
    </WatermarkContainer>
  );
}