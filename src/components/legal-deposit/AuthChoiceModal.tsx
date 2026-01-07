import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogDescription } from "@/components/ui/custom-portal-dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: "editeur" | "imprimeur" | "producteur";
  redirectPath: string;
}

export const AuthChoiceModal = ({ 
  open, 
  onOpenChange, 
  userType,
  redirectPath 
}: AuthChoiceModalProps) => {
  const navigate = useNavigate();
  const signupType = userType === "editeur" ? "editor" : userType === "producteur" ? "producer" : "printer";

  const handleLogin = () => {
    onOpenChange(false);
    navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleSignup = () => {
    onOpenChange(false);
    navigate(`/signup?type=${signupType}&redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-md p-6">
        {/* Bouton X en haut à droite */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <CustomDialogHeader className="text-center pb-4">
          <CustomDialogTitle className="text-xl font-semibold">
            Accès requis
          </CustomDialogTitle>
          <CustomDialogDescription className="text-muted-foreground">
            Pour effectuer une déclaration de dépôt légal, veuillez vous connecter ou créer un compte.
          </CustomDialogDescription>
        </CustomDialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full justify-start gap-3 h-14"
            onClick={handleLogin}
          >
            <LogIn className="h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="font-medium">Se connecter</div>
              <div className="text-xs text-muted-foreground">J'ai déjà un compte</div>
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
                {userType === "editeur" ? "Compte Éditeur" : userType === "producteur" ? "Compte Producteur" : "Compte Imprimeur"}
              </div>
            </div>
          </Button>
        </div>

        {/* Bouton Annuler en bas */}
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleClose}
          >
            Annuler
          </Button>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
};