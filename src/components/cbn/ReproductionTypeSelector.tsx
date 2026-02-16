import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Printer, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ReproductionTypeSelectorProps {
  documentStatus: string;
  documentType: string;
}

export function ReproductionTypeSelector({ 
  documentStatus,
  documentType 
}: ReproductionTypeSelectorProps) {
  const [reproductionType, setReproductionType] = useState<"digital" | "paper" | null>(null);
  const [receptionMode, setReceptionMode] = useState<string>("");
  const [physicalSupport, setPhysicalSupport] = useState<string>("");
  const [otherSupport, setOtherSupport] = useState<string>("");
  const [copies, setCopies] = useState<string>("1");
  const [format, setFormat] = useState<string>("");
  const [recoveryMode, setRecoveryMode] = useState<string>("");
  const [postalAddress, setPostalAddress] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"digital" | "paper" | "microfilm">("digital");
  const { toast } = useToast();

  // Vérifier si c'est un microfilm
  const isMicrofilm = documentType === "Microfilm";
  
  // Vérifier si la reproduction est autorisée
  const isReproductionDisabled = documentStatus === "Non numérisé";
  const isRestrictedAccess = false; // À connecter avec les vraies données

  const handleSubmitDigital = () => {
    if (!receptionMode) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un mode de réception",
        variant: "destructive",
      });
      return;
    }

    if (receptionMode === "support" && !physicalSupport) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un type de support physique",
        variant: "destructive",
      });
      return;
    }

    if (physicalSupport === "autre" && !otherSupport) {
      toast({
        title: "Champ requis",
        description: "Veuillez préciser le type de support",
        variant: "destructive",
      });
      return;
    }

    setConfirmationType("digital");
    setShowConfirmDialog(true);
  };

  const handleSubmitPaper = () => {
    if (!format) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un format",
        variant: "destructive",
      });
      return;
    }

    if (!recoveryMode) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un mode de récupération",
        variant: "destructive",
      });
      return;
    }

    if (recoveryMode === "postal" && !postalAddress) {
      toast({
        title: "Champ requis",
        description: "Veuillez fournir une adresse postale",
        variant: "destructive",
      });
      return;
    }

    setConfirmationType("paper");
    setShowConfirmDialog(true);
  };

  const handleSubmitMicrofilm = () => {
    if (!copies || parseInt(copies) < 1) {
      toast({
        title: "Champ requis",
        description: "Veuillez indiquer le nombre de copies",
        variant: "destructive",
      });
      return;
    }

    if (!recoveryMode) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un mode de récupération",
        variant: "destructive",
      });
      return;
    }

    if (recoveryMode === "postal" && !postalAddress) {
      toast({
        title: "Champ requis",
        description: "Veuillez fournir une adresse postale",
        variant: "destructive",
      });
      return;
    }

    setConfirmationType("microfilm");
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    
    toast({
      title: "Demande enregistrée",
      description: "Votre demande de reproduction a été enregistrée avec succès.",
    });

    // Réinitialiser le formulaire
    setReproductionType(null);
    setReceptionMode("");
    setPhysicalSupport("");
    setOtherSupport("");
    setCopies("1");
    setFormat("");
    setRecoveryMode("");
    setPostalAddress("");
    
    // TODO: Redirection vers le back-office approprié selon le type
    const routingMessage = confirmationType === "microfilm" 
      ? "Service Microfilms BNRM" 
      : confirmationType === "digital" 
      ? "Bibliothèque Numérique" 
      : "Service Support BNRM";
    console.log(`Routing to ${routingMessage}`);
  };

  if (isReproductionDisabled) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground text-center">
          ⚠️ La reproduction n'est pas autorisée pour ce document.
          <br />
          <span className="text-xs italic mt-1 block">
            Dans des cas exceptionnels, une demande peut être faite avec l'autorisation de l'auteur.
          </span>
        </p>
      </div>
    );
  }

  if (isRestrictedAccess) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground text-center">
          🔒 Reproduction soumise à autorisation spéciale.
        </p>
      </div>
    );
  }

  // Interface spéciale pour les microfilms
  if (isMicrofilm) {
    return (
      <div className="p-4 bg-[#F9F9F9] dark:bg-muted/20 rounded-lg border border-border space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">🎞️ Reproduction sur Microfilm</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Les documents microfilms ne peuvent être reproduits que sur support microfilm uniquement.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
          <p className="text-sm text-muted-foreground">
            ℹ️ Les microfilms ne peuvent être reproduits que sur support microfilm
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="microfilm-copies">Nombre de copies demandées *</Label>
            <Input
              id="microfilm-copies"
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="microfilm-recovery">Mode de récupération *</Label>
            <SimpleSelect
              id="microfilm-recovery"
              value={recoveryMode}
              onChange={setRecoveryMode}
              placeholder="Sélectionner le mode de récupération"
              options={[
                { value: "onsite", label: "Retrait sur place" },
                { value: "postal", label: "Envoi postal" },
              ]}
            />
          </div>

          {recoveryMode === "postal" && (
            <div className="space-y-2 animate-in fade-in-50 duration-300">
              <Label htmlFor="microfilm-address">Adresse postale *</Label>
              <Textarea
                id="microfilm-address"
                placeholder="Entrez votre adresse postale complète"
                value={postalAddress}
                onChange={(e) => setPostalAddress(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleSubmitMicrofilm}
          >
            🎞️ Soumettre la demande de reproduction microfilm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#F9F9F9] dark:bg-muted/20 rounded-lg border border-border space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">📄 Type de reproduction</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                <strong>Reproduction numérique :</strong> Fichier PDF envoyé par email ou sur support<br />
                <strong>Reproduction papier :</strong> Impression physique à récupérer sur place ou par courrier
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <RadioGroup value={reproductionType || ""} onValueChange={(value) => setReproductionType(value as "digital" | "paper")}>
        <div className="flex gap-4">
          <div 
            className={`flex items-center space-x-2 flex-1 p-3 rounded-md border-2 cursor-pointer transition-all ${
              reproductionType === "digital" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setReproductionType("digital")}
          >
            <RadioGroupItem value="digital" id="digital" />
            <Label htmlFor="digital" className="cursor-pointer flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Reproduction numérique
            </Label>
          </div>

          <div 
            className={`flex items-center space-x-2 flex-1 p-3 rounded-md border-2 cursor-pointer transition-all ${
              reproductionType === "paper" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setReproductionType("paper")}
          >
            <RadioGroupItem value="paper" id="paper" />
            <Label htmlFor="paper" className="cursor-pointer flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Reproduction papier
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* Options pour reproduction numérique */}
      {reproductionType === "digital" && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="reception-mode">Mode de réception *</Label>
            <SimpleSelect
              id="reception-mode"
              value={receptionMode}
              onChange={setReceptionMode}
              placeholder="Sélectionner le mode de réception"
              options={[
                { value: "email", label: "Par e-mail" },
                { value: "download", label: "À télécharger sur Mon espace" },
                { value: "support", label: "Retrait sur place sous support (CD, USB, Carte SD, Autre)" },
              ]}
            />
            {receptionMode && (
              <p className="text-xs text-muted-foreground italic">
                {receptionMode === "email" && "Un lien de téléchargement vous sera envoyé par e-mail après validation du paiement."}
                {receptionMode === "download" && "Le document sera disponible dans votre espace personnel « Mon espace » pour téléchargement."}
                {receptionMode === "support" && "Un e-mail de notification vous sera envoyé lorsque le support sera prêt et disponible pour retrait sur place."}
              </p>
            )}
          </div>

          {receptionMode === "support" && (
            <div className="space-y-2 animate-in fade-in-50 duration-300">
              <Label htmlFor="physical-support">Type de support physique *</Label>
              <SimpleSelect
                id="physical-support"
                value={physicalSupport}
                onChange={setPhysicalSupport}
                placeholder="Sélectionner le support"
                options={[
                  { value: "cd", label: "CD" },
                  { value: "usb", label: "Clé USB" },
                  { value: "sd", label: "Carte SD" },
                  { value: "autre", label: "Autre" },
                ]}
              />

              {physicalSupport === "autre" && (
                <Input
                  placeholder="Précisez le type de support"
                  value={otherSupport}
                  onChange={(e) => setOtherSupport(e.target.value)}
                  className="animate-in fade-in-50 duration-300"
                />
              )}
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleSubmitDigital}
          >
            <Mail className="h-4 w-4 mr-2" />
            Soumettre la demande numérique
          </Button>
        </div>
      )}

      {/* Options pour reproduction papier */}
      {reproductionType === "paper" && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="copies">Nombre de copies demandées *</Label>
            <Input
              id="copies"
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format *</Label>
            <SimpleSelect
              id="format"
              value={format}
              onChange={setFormat}
              placeholder="Sélectionner le format"
              options={[
                { value: "a4", label: "A4" },
                { value: "a3", label: "A3" },
                { value: "autre", label: "Autre" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-mode">Mode de récupération *</Label>
            <SimpleSelect
              id="recovery-mode"
              value={recoveryMode}
              onChange={setRecoveryMode}
              placeholder="Sélectionner le mode de récupération"
              options={[
                { value: "onsite", label: "Retrait sur place" },
                { value: "postal", label: "Envoi postal" },
              ]}
            />
          </div>

          {recoveryMode === "postal" && (
            <div className="space-y-2 animate-in fade-in-50 duration-300">
              <Label htmlFor="postal-address">Adresse postale *</Label>
              <Textarea
                id="postal-address"
                placeholder="Entrez votre adresse postale complète"
                value={postalAddress}
                onChange={(e) => setPostalAddress(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleSubmitPaper}
          >
            <Printer className="h-4 w-4 mr-2" />
            Soumettre la demande papier
          </Button>
        </div>
      )}

      {/* Dialog de confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationType === "microfilm" 
                ? "Confirmation - Reproduction sur Microfilm"
                : confirmationType === "digital" 
                ? "Confirmation - Reproduction numérique" 
                : "Confirmation - Reproduction papier"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationType === "microfilm"
                ? "Votre demande de reproduction sur microfilm sera transmise au Service Microfilms de la BNRM."
                : confirmationType === "digital" 
                ? "Votre demande de reproduction numérique sera transmise au service de la Bibliothèque Numérique." 
                : "Votre demande sera traitée par le Service Support de la BNRM."}
              <br /><br />
              Un e-mail récapitulatif vous sera envoyé une fois la demande confirmée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
