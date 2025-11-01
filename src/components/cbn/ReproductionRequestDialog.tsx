import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/ui/simple-select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { FileText, Loader2, BookOpen, Calendar, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface ReproductionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    author: string;
    cote: string;
    year: string;
    supportType?: string;
    type?: string;
  };
}

export function ReproductionRequestDialog({ isOpen, onClose, document }: ReproductionRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manuscriptData, setManuscriptData] = useState<any>(null);
  const [loadingManuscript, setLoadingManuscript] = useState(false);
  
  // Pour les manuscrits avec tirage papier, forcer A4
  const isManuscript = document.type === "Manuscrit" || document.supportType === "Manuscrit";
  
  // Charger les données du manuscrit si c'est un manuscrit
  useEffect(() => {
    const loadManuscriptData = async () => {
      if (!isManuscript || !document.id) return;
      
      setLoadingManuscript(true);
      try {
        // Essayer d'abord de trouver le manuscrit par cbn_document_id
        let { data, error } = await supabase
          .from('manuscripts')
          .select('*')
          .eq('cbn_document_id', document.id)
          .maybeSingle();
        
        // Si pas trouvé, chercher par cote
        if (!data && document.cote) {
          const result = await supabase
            .from('manuscripts')
            .select('*')
            .eq('cote', document.cote)
            .maybeSingle();
          data = result.data;
          error = result.error;
        }
        
        if (error) {
          console.error('Erreur chargement manuscrit:', error);
        } else if (data) {
          setManuscriptData(data);
          console.log('📜 Données manuscrit chargées:', data);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoadingManuscript(false);
      }
    };
    
    loadManuscriptData();
  }, [isManuscript, document.id, document.cote]);
  
  const [formData, setFormData] = useState({
    // Informations du demandeur (pré-remplies depuis le compte adhérent)
    lastName: "Nom Adhérent",
    firstName: "Prénom Adhérent",
    
    // Type de reproduction
    reproductionType: document.supportType === "Microfilm" ? "microfilm" : "numerique", // numerique, papier, microfilm
    format: document.supportType === "Microfilm" ? "35mm" : "pdf", // pdf, jpeg, tiff pour numérique | A4, A3 pour papier | 35mm, 16mm, microfiche pour microfilm
    quality: "haute", // standard, haute
    deliveryMode: "email", // email, telechargement, sous_support
    supportType: "cd", // cd, usb, ssd, autre
    numberOfCopies: "1", // pour papier
    paperFormat: "A4", // A4, A3, autre pour papier (forcé à A4 pour manuscrits)
    displayMode: "couleur", // couleur, noir_blanc
    
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

  // Forcer A4 pour les manuscrits en tirage papier
  useEffect(() => {
    if (isManuscript && formData.reproductionType === "papier" && formData.paperFormat !== "A4") {
      setFormData(prev => ({ ...prev, paperFormat: "A4" }));
    }
  }, [formData.reproductionType, isManuscript, formData.paperFormat]);

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
            {isManuscript && (
              <Badge variant="default" className="ml-2">
                📜 Manuscrit
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Document : <span className="font-semibold text-foreground">{document.title}</span>
            <br />
            Auteur : {document.author} • Cote : {document.cote}
            {document.supportType === "Microfilm" && (
              <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                📼 Microfilm
              </span>
            )}
            {isManuscript && manuscriptData && (
              <div className="mt-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                  ℹ️ Données enrichies depuis la plateforme Manuscrits
                </span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du demandeur */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations du demandeur</h3>
            <p className="text-sm text-muted-foreground">
              Informations récupérées depuis votre compte adhérent
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  disabled
                  value={formData.lastName}
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  disabled
                  value={formData.firstName}
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>


          {/* Informations du manuscrit - Section enrichie */}
          {isManuscript && manuscriptData && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Détails du Manuscrit
                </CardTitle>
                <CardDescription>
                  Informations provenant de la plateforme Manuscrits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {manuscriptData.language && (
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Langue
                      </Label>
                      <Badge variant="secondary" className="font-normal">
                        {manuscriptData.language}
                      </Badge>
                    </div>
                  )}
                  
                  {manuscriptData.period && (
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Période
                      </Label>
                      <Badge variant="secondary" className="font-normal">
                        {manuscriptData.period}
                      </Badge>
                    </div>
                  )}
                  
                  {manuscriptData.material && (
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        Support
                      </Label>
                      <Badge variant="secondary" className="font-normal">
                        {manuscriptData.material}
                      </Badge>
                    </div>
                  )}
                  
                  {manuscriptData.dimensions && (
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">Dimensions</Label>
                      <Badge variant="secondary" className="font-normal">
                        {manuscriptData.dimensions}
                      </Badge>
                    </div>
                  )}
                </div>

                {manuscriptData.inventory_number && (
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Numéro d'inventaire</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {manuscriptData.inventory_number}
                    </p>
                  </div>
                )}
                
                {manuscriptData.description && (
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground">
                      {manuscriptData.description}
                    </p>
                  </div>
                )}

                {manuscriptData.condition_notes && (
                  <div className="space-y-1 pt-2 border-t">
                    <Label className="text-sm font-semibold">État de conservation</Label>
                    <p className="text-sm text-muted-foreground">
                      {manuscriptData.condition_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isManuscript && loadingManuscript && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement des détails du manuscrit...</span>
                </div>
              </CardContent>
            </Card>
          )}


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
                  <Label htmlFor="papier" className="cursor-pointer">Tirage papier</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="microfilm" id="microfilm" />
                  <Label htmlFor="microfilm" className="cursor-pointer">Duplicata Microfilm</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.reproductionType === "numerique" && (
                <div>
                  <Label htmlFor="format">Format</Label>
                  <SimpleSelect
                    value={formData.format}
                    onChange={(value) => setFormData({ ...formData, format: value })}
                    options={[
                      { value: "pdf", label: "PDF" },
                      { value: "jpeg", label: "JPEG" },
                      { value: "tiff", label: "TIFF" }
                    ]}
                  />
                </div>
              )}
            </div>

            {formData.reproductionType === "numerique" && (
              <>
                <div>
                  <Label htmlFor="deliveryMode">Mode de réception *</Label>
                  <SimpleSelect
                    id="deliveryMode"
                    value={formData.deliveryMode}
                    onChange={(value) => setFormData({ ...formData, deliveryMode: value })}
                    options={[
                      { value: "email", label: "Par E-mail" },
                      { value: "telechargement", label: "À télécharger" },
                      { value: "sous_support", label: "Sous support" },
                      { value: "retrait", label: "Retrait sur place (BNRM)" },
                      { value: "autre", label: "Autre" }
                    ]}
                  />
                </div>

                {formData.deliveryMode === "sous_support" && (
                  <div>
                    <Label htmlFor="supportType">Type de support *</Label>
                    <SimpleSelect
                      id="supportType"
                      value={formData.supportType}
                      onChange={(value) => setFormData({ ...formData, supportType: value })}
                      options={[
                        { value: "cd", label: "CD" },
                        { value: "usb", label: "USB" },
                        { value: "ssd", label: "Carte SD" },
                        { value: "autre", label: "Autre" }
                      ]}
                    />
                  </div>
                )}
              </>
            )}

            {formData.reproductionType === "papier" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numberOfCopies">Nombre de copies demandées *</Label>
                    <Input
                      id="numberOfCopies"
                      type="number"
                      min="1"
                      value={formData.numberOfCopies}
                      onChange={(e) => setFormData({ ...formData, numberOfCopies: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paperFormat">Format *</Label>
                    <SimpleSelect
                      id="paperFormat"
                      value={formData.paperFormat}
                      onChange={(value) => setFormData({ ...formData, paperFormat: value })}
                      options={[
                        { value: "A4", label: "A4" },
                        { value: "A3", label: "A3" },
                        { value: "autre", label: "Autre" }
                      ]}
                      disabled={document.type === "Manuscrit" || document.supportType === "Manuscrit"}
                      className={document.type === "Manuscrit" || document.supportType === "Manuscrit" ? "bg-muted cursor-not-allowed" : ""}
                    />
                    {(document.type === "Manuscrit" || document.supportType === "Manuscrit") && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pour les manuscrits, seul le format A4 est disponible
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="displayMode">Affichage *</Label>
                  <SimpleSelect
                    id="displayMode"
                    value={formData.displayMode}
                    onChange={(value) => setFormData({ ...formData, displayMode: value })}
                    options={[
                      { value: "couleur", label: "Couleur" },
                      { value: "noir_blanc", label: "Noir et Blanc" }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Étendue de la reproduction */}
          {formData.reproductionType !== "microfilm" && (
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
          )}

          {/* Usage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Usage prévu</h3>
            
            <div>
              <Label htmlFor="usageType">Type d'usage *</Label>
              <SimpleSelect
                value={formData.usageType}
                onChange={(value) => setFormData({ ...formData, usageType: value })}
                options={[
                  { value: "personnel", label: "Usage personnel" },
                  { value: "recherche", label: "Recherche académique" },
                  { value: "enseignement", label: "Enseignement" },
                  { value: "commercial", label: "Usage commercial" },
                  { value: "autre", label: "Autre" }
                ]}
              />
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
            <h4 className="font-semibold mb-3">💰 Tarification estimative</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type de reproduction :</span>
                <span className="font-medium">
                  {formData.reproductionType === "numerique" && "Numérique"}
                  {formData.reproductionType === "papier" && "Papier"}
                  {formData.reproductionType === "microfilm" && "Microfilm"}
                </span>
              </div>
              {formData.reproductionType === "microfilm" && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                  <p className="text-xs text-amber-900 font-medium">
                    ⚠️ Les reproductions sur microfilm nécessitent un équipement spécialisé. 
                    Tarif sur devis selon le nombre de bobines et la résolution demandée.
                  </p>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Qualité :</span>
                <span>
                  {formData.quality === "standard" && "Standard"}
                  {formData.quality === "haute" && "Haute qualité"}
                  {formData.quality === "tres_haute" && "Très haute qualité"}
                </span>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Les liens de téléchargement des documents seront valables pendant 2 mois.
              </div>
            </div>
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
