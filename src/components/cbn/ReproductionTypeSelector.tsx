import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [confirmationType, setConfirmationType] = useState<"digital" | "paper">("digital");
  const { toast } = useToast();

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
    console.log(`Routing to ${confirmationType === "digital" ? "Bibliothèque Numérique" : "Service Support BNRM"}`);
  };

  if (isReproductionDisabled) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground text-center">
          ⚠️ La reproduction n'est pas autorisée pour ce document.
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
            <Select value={receptionMode} onValueChange={setReceptionMode}>
              <SelectTrigger id="reception-mode">
                <SelectValue placeholder="Sélectionner le mode de réception" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Par e-mail</SelectItem>
                <SelectItem value="download">À télécharger</SelectItem>
                <SelectItem value="support">Sous support (CD, USB, Carte SD, Autre)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {receptionMode === "support" && (
            <div className="space-y-2 animate-in fade-in-50 duration-300">
              <Label htmlFor="physical-support">Type de support physique *</Label>
              <Select value={physicalSupport} onValueChange={setPhysicalSupport}>
                <SelectTrigger id="physical-support">
                  <SelectValue placeholder="Sélectionner le support" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cd">CD</SelectItem>
                  <SelectItem value="usb">Clé USB</SelectItem>
                  <SelectItem value="sd">Carte SD</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>

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
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Sélectionner le format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="a3">A3</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-mode">Mode de récupération *</Label>
            <Select value={recoveryMode} onValueChange={setRecoveryMode}>
              <SelectTrigger id="recovery-mode">
                <SelectValue placeholder="Sélectionner le mode de récupération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">Retrait sur place</SelectItem>
                <SelectItem value="postal">Envoi postal</SelectItem>
              </SelectContent>
            </Select>
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
              {confirmationType === "digital" 
                ? "Confirmation - Reproduction numérique" 
                : "Confirmation - Reproduction papier"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationType === "digital" 
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
