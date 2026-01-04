import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogDescription } from "@/components/ui/custom-portal-dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReproductionAuthChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
  documentTitle?: string;
}

export const ReproductionAuthChoiceModal = ({ 
  open, 
  onOpenChange, 
  documentId,
  documentTitle
}: ReproductionAuthChoiceModalProps) => {
  const navigate = useNavigate();

  const redirectPath = documentId 
    ? `/demande-reproduction?documentId=${encodeURIComponent(documentId)}${documentTitle ? `&documentTitle=${encodeURIComponent(documentTitle)}` : ''}`
    : '/demande-reproduction';

  const handleLogin = () => {
    onOpenChange(false);
    navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleSignup = () => {
    onOpenChange(false);
    navigate(`/signup?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-md p-6">
        <CustomDialogHeader className="text-center pb-4">
          <CustomDialogTitle className="text-xl font-semibold">
            Accès requis
          </CustomDialogTitle>
          <CustomDialogDescription className="text-muted-foreground">
            Pour effectuer une demande de reproduction, veuillez vous connecter ou créer un compte.
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
              <div className="text-xs opacity-80">Nouveau compte utilisateur</div>
            </div>
          </Button>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
};
