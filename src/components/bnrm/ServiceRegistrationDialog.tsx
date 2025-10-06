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
import { PaymentDialog } from "./PaymentDialog";

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
  condition_tarif: string | null;
  periode_validite: string;
  is_active: boolean | null;
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
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [availableTariffs, setAvailableTariffs] = useState<BNRMTariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<BNRMTariff | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    institution: "",
    additionalInfo: "",
  });

  // Services facturés au nombre de pages
  const pageBasedServices = [
    "Impression papier NB",
    "Numérisation documents rares",
    "Impression papier couleur"
  ];
  
  const isPageBasedService = pageBasedServices.includes(service.nom_service);

  
  // Charger les tarifs disponibles pour ce service
  useEffect(() => {
    const loadTariffs = async () => {
      const { data, error } = await supabase
        .from("bnrm_tarifs")
        .select("*")
        .eq("id_service", service.id_service)
        .eq("is_active", true);
      
      if (!error && data) {
        setAvailableTariffs(data);
        if (tariff) {
          setSelectedTariff(tariff);
        } else if (data.length > 0) {
          setSelectedTariff(data[0]);
        }
      }
    };
    
    if (open) {
      loadTariffs();
    }
  }, [open, service.id_service, tariff]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        phone: profile.phone || "",
        institution: profile.institution || "",
      }));
    }
  }, [profile]);

  const isFreeService = !selectedTariff;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== ServiceRegistrationDialog: handleSubmit called ===");
    console.log("Service:", service.nom_service);
    console.log("Is page-based service:", isPageBasedService);
    console.log("Page count:", pageCount);
    console.log("Form data:", formData);
    console.log("Tariff:", tariff);

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
      console.log("=== Starting registration process ===");
      
      // Pour les services d'abonnement uniquement, vérifier si l'utilisateur est déjà inscrit
      if (!isPageBasedService && !isFreeService) {
        console.log("Checking for existing subscription...");
        const { data: existingRegistration, error: checkError } = await supabase
          .from("service_registrations")
          .select("*")
          .eq("user_id", user.id)
          .eq("service_id", service.id_service)
          .eq("is_paid", true)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking existing registration:", checkError);
          throw checkError;
        }

        console.log("Existing registration:", existingRegistration);

        if (existingRegistration) {
          console.log("User already has active subscription");
          toast({
            title: "Déjà inscrit",
            description: "Vous avez déjà un abonnement actif pour ce service",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const registrationData = {
        user_id: user.id,
        service_id: service.id_service,
        tariff_id: selectedTariff?.id_tarif || null,
        status: isFreeService ? "active" : "pending",
        is_paid: isFreeService,
        registration_data: {
          phone: formData.phone,
          address: formData.address,
          institution: formData.institution,
          additionalInfo: formData.additionalInfo,
          ...(isPageBasedService && { pageCount }),
        },
      };

      console.log("Creating registration with data:", registrationData);

      const { data: registration, error: regError } = await supabase
        .from("service_registrations")
        .insert(registrationData)
        .select()
        .single();

      if (regError) {
        console.error("Registration error:", regError);
        throw regError;
      }

      console.log("Registration created:", registration);
      setRegistrationId(registration.id);

      // Si le service est payant
      if (!isFreeService && selectedTariff) {
        console.log("Service is paid, setting up payment...");
        // Pour les services facturés au nombre de pages, pas besoin de créer un abonnement
        if (!isPageBasedService) {
          console.log("Creating subscription for non-page-based service");
          const startDate = new Date();
          const endDate = subscriptionType === "monthly" 
            ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

          const { error: subError } = await supabase
            .from("service_subscriptions")
            .insert({
              user_id: user.id,
              service_id: service.id_service,
              tariff_id: selectedTariff.id_tarif,
              subscription_type: subscriptionType,
              status: "pending_payment",
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              amount: selectedTariff.montant,
              currency: selectedTariff.devise,
              payment_status: "pending",
            });

          if (subError) throw subError;
        }

        // Afficher les options de paiement
        console.log("Showing payment options");
        setShowPaymentOptions(true);
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à ce service gratuit",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("=== Error during registration ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      console.log("=== Registration process ended ===");
      setIsLoading(false);
    }
  };

  const handlePayLater = () => {
    toast({
      title: "Paiement différé",
      description: "Vous recevrez des notifications pour effectuer le paiement.",
    });
    onOpenChange(false);
  };

  const handlePayNow = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentOptions(false);
    setShowPaymentDialog(false);
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {showPaymentOptions ? "Options de paiement" : `Inscription au service : ${service.nom_service}`}
          </DialogTitle>
          <DialogDescription>
            {showPaymentOptions 
              ? "Choisissez votre mode de paiement"
              : isFreeService 
                ? "Complétez le formulaire pour vous inscrire à ce service gratuit"
                : "Complétez le formulaire et choisissez votre type d'abonnement"}
          </DialogDescription>
        </DialogHeader>

        {showPaymentOptions ? (
          <div className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Montant à payer:</span>
                <span className="text-2xl font-bold text-primary">
                  {selectedTariff && (isPageBasedService
                    ? `${selectedTariff.montant * pageCount} ${selectedTariff.devise}`
                    : subscriptionType === "monthly" 
                      ? `${selectedTariff.montant} ${selectedTariff.devise} / mois`
                      : `${selectedTariff.montant * 12} ${selectedTariff.devise} / an`)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {isPageBasedService 
                  ? `${pageCount} page(s) × ${selectedTariff?.montant} ${selectedTariff?.devise} = ${(selectedTariff?.montant || 0) * pageCount} ${selectedTariff?.devise}`
                  : `Type d'abonnement: ${subscriptionType === "monthly" ? "Mensuel" : "Annuel"}`}
              </div>
            </div>

            <div className="grid gap-4">
              <Button 
                onClick={handlePayNow}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  "Payer maintenant"
                )}
              </Button>

              <Button 
                onClick={handlePayLater}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Payer plus tard
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Paiement différé :</strong> Si vous choisissez de payer plus tard, 
                vous recevrez des notifications de rappel selon les paramètres définis par l'administration. 
                Votre abonnement sera activé dès réception du paiement.
              </p>
            </div>
          </div>
        ) : (
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

          {!isFreeService && availableTariffs.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              {/* Sélection du tarif si plusieurs disponibles */}
              {availableTariffs.length > 1 && (
                <div className="space-y-3">
                  <Label>Choisissez votre formule</Label>
                  <RadioGroup 
                    value={selectedTariff?.id_tarif} 
                    onValueChange={(value) => {
                      const tariff = availableTariffs.find(t => t.id_tarif === value);
                      if (tariff) setSelectedTariff(tariff);
                    }}
                  >
                    {availableTariffs.map((tariff) => (
                      <div key={tariff.id_tarif} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={tariff.id_tarif} id={tariff.id_tarif} />
                        <Label htmlFor={tariff.id_tarif} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{tariff.condition_tarif}</div>
                              {tariff.periode_validite && (
                                <div className="text-sm text-muted-foreground">
                                  Validité: {tariff.periode_validite}
                                </div>
                              )}
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {tariff.montant} {tariff.devise}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {selectedTariff && isPageBasedService ? (
                <>
                  <Label htmlFor="pageCount">Nombre de pages *</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    min="1"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prix unitaire:</span>
                      <span className="text-sm">{selectedTariff.montant} {selectedTariff.devise} / page</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary">
                        {selectedTariff.montant * pageCount} {selectedTariff.devise}
                      </span>
                    </div>
                  </div>
                </>
              ) : selectedTariff && !isPageBasedService && availableTariffs.length === 1 ? (
                <>
                  <Label>Type d'abonnement</Label>
                  <RadioGroup value={subscriptionType} onValueChange={(value: any) => setSubscriptionType(value)}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Abonnement mensuel</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTariff.montant} {selectedTariff.devise} / mois
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="annual" id="annual" />
                      <Label htmlFor="annual" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Abonnement annuel</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTariff.montant * 12} {selectedTariff.devise} / an (économisez 2 mois)
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
                </>
              ) : null}
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
        )}
      </DialogContent>

      {/* Dialogue de paiement */}
      {selectedTariff && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={isPageBasedService ? selectedTariff.montant * pageCount : selectedTariff.montant}
          currency={selectedTariff.devise}
          subscriptionType={subscriptionType}
          serviceName={service.nom_service}
          serviceId={service.id_service}
          tariffId={selectedTariff.id_tarif}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Dialog>
  );
}
