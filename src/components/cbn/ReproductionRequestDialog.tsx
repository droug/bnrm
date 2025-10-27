import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";

interface ReproductionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    author: string;
    cote: string;
    year: string;
  };
}

export function ReproductionRequestDialog({ isOpen, onClose, document }: ReproductionRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Informations du demandeur
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Maroc",
    
    // Type de reproduction
    reproductionType: "numerique", // numerique, papier, microfilm
    format: "pdf", // pdf, jpeg, tiff pour numérique | A4, A3 pour papier
    quality: "standard", // standard, haute
    
    // Détails de la reproduction
    reproductionScope: "partielle", // complete, partielle
    pages: "",
    sections: "",
    
    // Usage
    usageType: "personnel", // personnel, recherche, commercial, enseignement
    usageDescription: "",
    
    // Livraison
    deliveryMethod: "email", // email, courrier, retrait
    deliveryAddress: "",
    
    // Options
    urgentRequest: false,
    certifiedCopy: false,
    
    // Accord
    termsAccepted: false,
    copyrightAcknowledged: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted || !formData.copyrightAcknowledged) {
      toast.error("Veuillez accepter les conditions et le respect du droit d'auteur");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Demande de reproduction envoyée", {
        description: "Vous recevrez une confirmation par email sous 48h avec le devis."
      });
      
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Demande de Reproduction
          </DialogTitle>
          <DialogDescription>
            Document : <span className="font-semibold text-foreground">{document.title}</span>
            <br />
            Auteur : {document.author} • Cote : {document.cote}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du demandeur */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations du demandeur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Type de reproduction */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Type de reproduction</h3>
            
            <div>
              <Label>Support souhaité *</Label>
              <RadioGroup
                value={formData.reproductionType}
                onValueChange={(value) => setFormData({ ...formData, reproductionType: value })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numerique" id="numerique" />
                  <Label htmlFor="numerique" className="cursor-pointer">Numérique</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="papier" id="papier" />
                  <Label htmlFor="papier" className="cursor-pointer">Papier</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="microfilm" id="microfilm" />
                  <Label htmlFor="microfilm" className="cursor-pointer">Microfilm</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.reproductionType === "numerique" ? (
                      <>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="tiff">TIFF</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="format_original">Format original</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quality">Qualité</Label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => setFormData({ ...formData, quality: value })}
                >
                  <SelectTrigger id="quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (150 DPI)</SelectItem>
                    <SelectItem value="haute">Haute qualité (300 DPI)</SelectItem>
                    <SelectItem value="tres_haute">Très haute qualité (600 DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Étendue de la reproduction */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Étendue de la reproduction</h3>
            
            <RadioGroup
              value={formData.reproductionScope}
              onValueChange={(value) => setFormData({ ...formData, reproductionScope: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complete" id="complete" />
                <Label htmlFor="complete" className="cursor-pointer">Document complet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partielle" id="partielle" />
                <Label htmlFor="partielle" className="cursor-pointer">Reproduction partielle</Label>
              </div>
            </RadioGroup>

            {formData.reproductionScope === "partielle" && (
              <div className="space-y-4 ml-6">
                <div>
                  <Label htmlFor="pages">Pages (ex: 10-25, 45, 67-89)</Label>
                  <Input
                    id="pages"
                    placeholder="Ex: 10-25, 45, 67-89"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sections">Sections / Chapitres</Label>
                  <Textarea
                    id="sections"
                    placeholder="Précisez les sections ou chapitres souhaités"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Usage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Usage prévu</h3>
            
            <div>
              <Label htmlFor="usageType">Type d'usage *</Label>
              <Select
                value={formData.usageType}
                onValueChange={(value) => setFormData({ ...formData, usageType: value })}
              >
                <SelectTrigger id="usageType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personnel">Usage personnel</SelectItem>
                  <SelectItem value="recherche">Recherche académique</SelectItem>
                  <SelectItem value="enseignement">Enseignement</SelectItem>
                  <SelectItem value="commercial">Usage commercial (licence requise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="usageDescription">Description de l'usage</Label>
              <Textarea
                id="usageDescription"
                placeholder="Décrivez brièvement l'utilisation prévue du document"
                value={formData.usageDescription}
                onChange={(e) => setFormData({ ...formData, usageDescription: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Livraison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Mode de livraison</h3>
            
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => setFormData({ ...formData, deliveryMethod: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email_delivery" />
                <Label htmlFor="email_delivery" className="cursor-pointer">Par email (gratuit)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="courrier" id="courrier" />
                <Label htmlFor="courrier" className="cursor-pointer">Par courrier postal (frais supplémentaires)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retrait" id="retrait" />
                <Label htmlFor="retrait" className="cursor-pointer">Retrait sur place (BNRM)</Label>
              </div>
            </RadioGroup>

            {formData.deliveryMethod === "courrier" && (
              <div className="ml-6">
                <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
                <Textarea
                  id="deliveryAddress"
                  required
                  placeholder="Adresse complète de livraison"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Options supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Options supplémentaires</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgentRequest"
                  checked={formData.urgentRequest}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, urgentRequest: checked as boolean })
                  }
                />
                <Label htmlFor="urgentRequest" className="cursor-pointer">
                  Demande urgente (traitement prioritaire - frais supplémentaires)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certifiedCopy"
                  checked={formData.certifiedCopy}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, certifiedCopy: checked as boolean })
                  }
                />
                <Label htmlFor="certifiedCopy" className="cursor-pointer">
                  Copie certifiée conforme (frais supplémentaires)
                </Label>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Conditions et autorisations</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, termsAccepted: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="termsAccepted" className="cursor-pointer text-sm">
                  J'accepte les conditions générales de reproduction de la BNRM et m'engage à payer les frais indiqués dans le devis
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="copyrightAcknowledged"
                  checked={formData.copyrightAcknowledged}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, copyrightAcknowledged: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="copyrightAcknowledged" className="cursor-pointer text-sm">
                  Je reconnais respecter les droits d'auteur et utiliser cette reproduction conformément à la législation en vigueur
                </Label>
              </div>
            </div>
          </div>

          {/* Informations tarifaires */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2">ℹ️ Informations tarifaires</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Un devis vous sera envoyé par email sous 48h ouvrées</li>
              <li>• Les tarifs varient selon le type, le format et la qualité de reproduction</li>
              <li>• Le paiement se fait avant la livraison</li>
              <li>• Délai de traitement : 5-10 jours ouvrés (hors demandes urgentes)</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
