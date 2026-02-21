import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, UserCheck, LogIn, UserPlus, ArrowRight } from "lucide-react";

interface ReproductionUserTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  documentTitle?: string;
}

export function ReproductionUserTypeModal({
  open,
  onOpenChange,
  onProceed,
  documentTitle,
}: ReproductionUserTypeModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"institution" | "adherent" | null>(null);

  const handleSelectType = (type: "institution" | "adherent") => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleClose = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleLogin = () => {
    handleClose();
    navigate("/auth-BN?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
  };

  const handleSignup = () => {
    handleClose();
    navigate("/abonnements?platform=bn");
  };

  const handleProceedAsInstitution = () => {
    handleClose();
    onProceed();
  };

  const handleProceedAsAdherent = () => {
    handleClose();
    onProceed();
  };

  // Step 1: Choose user type
  if (!selectedType) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">
              Demande de reproduction
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {documentTitle
                ? `Pour le document : "${documentTitle}"`
                : "Veuillez indiquer votre profil pour continuer"}
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-center text-muted-foreground mb-2">
            Êtes-vous une institution ou un adhérent ?
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-16"
              onClick={() => handleSelectType("institution")}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Institution</div>
                <div className="text-xs text-muted-foreground">
                  Bibliothèque, université, centre de recherche...
                </div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-16"
              onClick={() => handleSelectType("adherent")}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Adhérent / Particulier</div>
                <div className="text-xs text-muted-foreground">
                  Chercheur, étudiant, particulier...
                </div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-muted-foreground"
              onClick={handleClose}
            >
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2a: Institution → proceed directly
  if (selectedType === "institution") {
    // Institutions can proceed directly (may or may not be logged in)
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">
              Demande institutionnelle
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Vous allez remplir une demande en tant qu'institution
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleProceedAsInstitution}
            >
              <ArrowRight className="h-4 w-4" />
              Continuer vers le formulaire
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleBack}
            >
              ← Retour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2b: Adhérent → check auth status
  if (selectedType === "adherent") {
    // If logged in, proceed directly
    if (user) {
      // Auto-proceed
      handleProceedAsAdherent();
      return null;
    }

    // Not logged in → show login/signup options
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">
              Connexion requise
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pour effectuer une demande de reproduction en tant qu'adhérent, veuillez vous connecter ou créer un compte.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-14"
              onClick={handleLogin}
            >
              <LogIn className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Se connecter</div>
                <div className="text-xs text-muted-foreground">
                  J'ai déjà un compte adhérent
                </div>
              </div>
            </Button>

            <Button
              size="lg"
              className="w-full justify-start gap-3 h-14"
              onClick={handleSignup}
            >
              <UserPlus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Créer un compte</div>
                <div className="text-xs opacity-80">
                  Je souhaite devenir adhérent
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-muted-foreground"
              onClick={handleBack}
            >
              ← Retour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
