import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface BNRMService {
  id_service: string;
  nom_service: string;
  description: string;
  categorie: string;
}

interface BNRMTariff {
  id_tarif: string;
  id_service: string;
  montant: number;
  devise: string;
  periode_validite: string;
}

interface ServiceRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BNRMService;
  tariff?: BNRMTariff;
}

export function ServiceRegistrationDialog({ 
  open, 
  onOpenChange, 
  service, 
  tariff 
}: ServiceRegistrationDialogProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "annual">("monthly");
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    institution: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        phone: profile.phone || "",
        institution: profile.institution || "",
      }));
    }
  }, [profile]);

  const isFreeService = !tariff;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour vous inscrire à ce service",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Vérifier si l'utilisateur est déjà inscrit
      const { data: existingRegistration } = await supabase
        .from("service_registrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_id", service.id_service)
        .single();

      if (existingRegistration) {
        toast({
          title: "Déjà inscrit",
          description: "Vous êtes déjà inscrit à ce service",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const registrationData = {
        user_id: user.id,
        service_id: service.id_service,
        tariff_id: tariff?.id_tarif || null,
        status: isFreeService ? "active" : "pending",
        is_paid: isFreeService,
        registration_data: {
          phone: formData.phone,
          address: formData.address,
          institution: formData.institution,
          additionalInfo: formData.additionalInfo,
        },
      };

      const { data: registration, error: regError } = await supabase
        .from("service_registrations")
        .insert(registrationData)
        .select()
        .single();

      if (regError) throw regError;

      // Si le service est payant, créer un abonnement
      if (!isFreeService && tariff) {
        const startDate = new Date();
        const endDate = subscriptionType === "monthly" 
          ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        const { error: subError } = await supabase
          .from("service_subscriptions")
          .insert({
            user_id: user.id,
            service_id: service.id_service,
            tariff_id: tariff.id_tarif,
            subscription_type: subscriptionType,
            status: "pending_payment",
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            amount: tariff.montant,
            currency: tariff.devise,
            payment_status: "pending",
          });

        if (subError) throw subError;

        toast({
          title: "Inscription enregistrée",
          description: "Votre inscription a été enregistrée. Vous recevrez des notifications pour effectuer le paiement.",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à ce service gratuit",
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentification requise</DialogTitle>
            <DialogDescription>
              Veuillez vous connecter ou créer un compte pour vous inscrire à ce service.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => window.location.href = "/auth"}>
            Se connecter / S'inscrire
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscription au service : {service.nom_service}</DialogTitle>
          <DialogDescription>
            {isFreeService 
              ? "Complétez le formulaire pour vous inscrire à ce service gratuit"
              : "Complétez le formulaire et choisissez votre type d'abonnement"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="additionalInfo">Informations complémentaires</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Précisez toute information pertinente pour ce service..."
                rows={4}
              />
            </div>
          </div>

          {!isFreeService && tariff && (
            <div className="space-y-4 border-t pt-4">
              <Label>Type d'abonnement</Label>
              <RadioGroup value={subscriptionType} onValueChange={(value: any) => setSubscriptionType(value)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Abonnement mensuel</div>
                    <div className="text-sm text-muted-foreground">
                      {tariff.montant} {tariff.devise} / mois
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Abonnement annuel</div>
                    <div className="text-sm text-muted-foreground">
                      {tariff.montant * 12} {tariff.devise} / an (économisez 2 mois)
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note :</strong> Vous pouvez payer maintenant ou plus tard. 
                  Vous recevrez des notifications pour effectuer le paiement. 
                  L'abonnement peut être annulé à tout moment, mais restera actif jusqu'à la fin de la période en cours.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                isFreeService ? "S'inscrire" : "S'inscrire et réserver"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
