import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Camera, FileText, Printer, Download } from "lucide-react";
import { z } from "zod";

interface ReproductionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  documentAuthor: string;
  documentCote: string;
}

const reproductionSchema = z.object({
  reproductionType: z.enum(["photocopie", "photographie", "numerisation", "microfilm"]),
  format: z.string().min(1, "Le format est requis"),
  pages: z.string().min(1, "Les pages sont requises"),
  quantity: z.number().min(1, "La quantité doit être au moins 1").max(10, "Maximum 10 exemplaires"),
  deliveryMethod: z.enum(["sur_place", "par_courrier", "par_email"]),
  urgency: z.enum(["normale", "urgente"]),
  comments: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions"
  })
});

export function ReproductionRequestDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentAuthor,
  documentCote
}: ReproductionRequestDialogProps) {
  const [reproductionType, setReproductionType] = useState<string>("photocopie");
  const [format, setFormat] = useState<string>("");
  const [pages, setPages] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("sur_place");
  const [urgency, setUrgency] = useState<string>("normale");
  const [comments, setComments] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);

  const reproductionTypes = [
    { value: "photocopie", label: "Photocopie noir & blanc", icon: Printer, price: "0.50 DH/page" },
    { value: "photographie", label: "Photographie numérique", icon: Camera, price: "5 DH/photo" },
    { value: "numerisation", label: "Numérisation haute résolution", icon: Download, price: "10 DH/page" },
    { value: "microfilm", label: "Reproduction microfilm", icon: FileText, price: "Sur devis" }
  ];

  const formatOptions = {
    photocopie: ["A4", "A3", "Legal"],
    photographie: ["JPEG", "PNG", "TIFF"],
    numerisation: ["PDF", "TIFF", "JPEG"],
    microfilm: ["Microfilm 35mm", "Microfiche"]
  };

  const handleSubmit = async () => {
    try {
      // Validation
      const validationResult = reproductionSchema.safeParse({
        reproductionType,
        format,
        pages,
        quantity,
        deliveryMethod,
        urgency,
        comments,
        acceptTerms
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error("Erreur de validation", {
          description: firstError.message
        });
        return;
      }

      setIsSubmitting(true);

      // Simuler l'envoi de la demande
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Intégrer avec Supabase pour enregistrer la demande
      /*
      const { error } = await supabase
        .from("reproduction_requests")
        .insert({
          document_id: documentId,
          reproduction_type: reproductionType,
          format,
          pages,
          quantity,
          delivery_method: deliveryMethod,
          urgency,
          comments,
          status: "pending"
        });

      if (error) throw error;
      */

      toast.success("Demande de reproduction envoyée", {
        description: "Vous recevrez une confirmation par email dans les 24h"
      });

      // Réinitialiser le formulaire
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'envoi de votre demande"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReproductionType("photocopie");
    setFormat("");
    setPages("");
    setQuantity(1);
    setDeliveryMethod("sur_place");
    setUrgency("normale");
    setComments("");
    setAcceptTerms(false);
  };

  const calculateEstimatedCost = () => {
    const pageCount = pages.split(/[,-]/).length;
    let unitCost = 0;

    switch (reproductionType) {
      case "photocopie":
        unitCost = 0.5;
        break;
      case "photographie":
        unitCost = 5;
        break;
      case "numerisation":
        unitCost = 10;
        break;
      default:
        return "Sur devis";
    }

    const total = pageCount * quantity * unitCost;
    const urgencyFee = urgency === "urgente" ? total * 0.5 : 0;
    const grandTotal = total + urgencyFee;

    return `${grandTotal.toFixed(2)} DH`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Demande de reproduction
          </DialogTitle>
          <DialogDescription>
            Formulaire de demande de reproduction pour : <strong>{documentTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations du document */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Document sélectionné</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Titre :</strong> {documentTitle}</p>
              <p><strong>Auteur :</strong> {documentAuthor}</p>
              <p><strong>Cote :</strong> {documentCote}</p>
            </div>
          </div>

          {/* Type de reproduction */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type de reproduction *</Label>
            <RadioGroup value={reproductionType} onValueChange={setReproductionType}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reproductionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label
                        htmlFor={type.value}
                        className="flex-1 flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.price}</div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Format */}
          <div className="space-y-2 relative">
            <Label htmlFor="format" className="text-base font-semibold">Format *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFormatOpen(!isFormatOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span className={format ? "text-foreground" : "text-muted-foreground"}>
                  {format || "Sélectionner un format"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isFormatOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFormatOpen && (
                <div className="absolute z-50 w-full mt-1 border border-input bg-background rounded-md shadow-lg">
                  {formatOptions[reproductionType as keyof typeof formatOptions]?.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setFormat(fmt);
                        setIsFormatOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-md last:rounded-b-md"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pages à reproduire */}
          <div className="space-y-2">
            <Label htmlFor="pages" className="text-base font-semibold">Pages à reproduire *</Label>
            <Input
              id="pages"
              placeholder="Ex: 1-10, 15, 20-25"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Indiquez les numéros de pages séparés par des virgules ou des tirets pour les plages
            </p>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-semibold">Nombre d'exemplaires *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Mode de livraison */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Mode de livraison *</Label>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sur_place" id="sur_place" />
                  <Label htmlFor="sur_place" className="cursor-pointer">
                    Retrait sur place (gratuit)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="par_courrier" id="par_courrier" />
                  <Label htmlFor="par_courrier" className="cursor-pointer">
                    Envoi par courrier postal (+20 DH)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="par_email" id="par_email" />
                  <Label htmlFor="par_email" className="cursor-pointer">
                    Envoi par email (gratuit, fichiers numériques uniquement)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Urgence */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Délai de traitement *</Label>
            <RadioGroup value={urgency} onValueChange={setUrgency}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normale" id="normale" />
                  <Label htmlFor="normale" className="cursor-pointer">
                    Normale (7-10 jours ouvrables)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgente" id="urgente" />
                  <Label htmlFor="urgente" className="cursor-pointer">
                    Urgente (2-3 jours ouvrables, +50% du tarif)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Commentaires */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-base font-semibold">Commentaires ou instructions spéciales</Label>
            <Textarea
              id="comments"
              placeholder="Ajoutez des informations supplémentaires si nécessaire..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{comments.length}/500 caractères</p>
          </div>

          {/* Estimation du coût */}
          {pages && format && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Estimation du coût :</span>
                <span className="text-xl font-bold text-primary">{calculateEstimatedCost()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Tarif estimatif, le montant final sera confirmé après validation de votre demande
              </p>
            </div>
          )}

          {/* Conditions */}
          <div className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
              J'accepte les conditions de reproduction et je m'engage à respecter les droits d'auteur.
              Je comprends que certaines reproductions peuvent être refusées pour des raisons légales ou de conservation.
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!acceptTerms || !format || !pages || isSubmitting}
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
