import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, X } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MOROCCO_REGIONS, CITIES_BY_REGION } from "@/data/moroccoRegions";
import { SimpleListSelect } from "@/components/ui/simple-list-select";

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "annual">("monthly");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [availableTariffs, setAvailableTariffs] = useState<BNRMTariff[]>([]);
  const [autoSubmitPending, setAutoSubmitPending] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<BNRMTariff | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cnie: "",
    email: "",
    phone: "",
    region: "",
    ville: "",
    address: "",
    institution: "",
    additionalInfo: "",
  });
  
  // Pour les reproductions
  const [showManuscriptList, setShowManuscriptList] = useState(false);
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const manuscriptListRef = useRef<HTMLDivElement>(null);
  
  // Services facturés au nombre de pages et nécessitant sélection de document
  const pageBasedServices = [
    "Impression papier NB",
    "Numérisation documents rares",
    "Impression papier couleur"
  ];
  
  const isPageBasedService = pageBasedServices.includes(service.nom_service);
  const isReproductionService = service.categorie === "Reproduction";

  
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

  
  // Charger les manuscrits pour recherche (services de reproduction)
  useEffect(() => {
    const loadManuscripts = async () => {
      if (!isReproductionService || !open) return;
      
      const { data, error } = await supabase
        .from("manuscripts")
        .select("id, title, author, cote, inventory_number")
        .limit(50);
      
      if (!error && data) {
        setManuscripts(data);
      }
    };
    
    loadManuscripts();
  }, [open, isReproductionService]);

  // Fermer la liste au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (manuscriptListRef.current && !manuscriptListRef.current.contains(event.target as Node)) {
        setShowManuscriptList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Try to restore form data from sessionStorage (after login redirect)
    const pendingData = sessionStorage.getItem('pendingSubscription');
    if (pendingData && open && user) {
      try {
        const parsed = JSON.parse(pendingData);
        if (parsed.formData) {
          setFormData(prev => ({
            ...prev,
            ...parsed.formData,
            // Override email with authenticated user's email if available
            email: user?.email || parsed.formData.email || "",
          }));
          if (parsed.subscriptionType) setSubscriptionType(parsed.subscriptionType);
          if (parsed.pageCount) setPageCount(parsed.pageCount);
          // Clear after restoring
          sessionStorage.removeItem('pendingSubscription');
          // Trigger auto-submit after state updates
          setAutoSubmitPending(true);
          return; // Don't overwrite with profile data
        }
      } catch {
        sessionStorage.removeItem('pendingSubscription');
      }
    }

    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        institution: profile.institution || "",
      }));
    } else if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [profile, user, open]);

  // Auto-submit after restoring pending data from sessionStorage
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (autoSubmitPending && user && open) {
      setAutoSubmitPending(false);
      // Use a small delay to ensure state is fully updated, then submit the form
      const timer = setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSubmitPending, user, open]);

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
      // Save form data to sessionStorage so it can be restored after login
      sessionStorage.setItem('pendingSubscription', JSON.stringify({
        serviceId: service.id_service,
        formData,
        subscriptionType,
        pageCount,
        selectedTariffId: selectedTariff?.id_tarif,
      }));
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour finaliser votre inscription. Vos données seront conservées.",
      });
      navigate(`/auth?redirect=${encodeURIComponent('/abonnements?platform=portal')}`);
      onOpenChange(false);
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          cnie: formData.cnie,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          ville: formData.ville,
          address: formData.address,
          institution: formData.institution,
          additionalInfo: formData.additionalInfo,
          formuleType: selectedTariff 
            ? `${selectedTariff.condition_tarif || "Non spécifié"} ${selectedTariff.periode_validite ? `Validité: ${selectedTariff.periode_validite}` : ""}`
            : "Non spécifié",
          ...(isPageBasedService && { pageCount }),
          ...(selectedManuscript && { 
            manuscriptId: selectedManuscript.id,
            manuscriptTitle: selectedManuscript.title,
            manuscriptCote: selectedManuscript.cote
          }),
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

  // No auth gate - form is accessible to everyone

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
              : user 
                ? "Vérifiez vos informations et complétez le formulaire"
                : "Veuillez vous connecter ou créer un compte pour continuer"}
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
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Informations personnelles */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-sm">Informations personnelles</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    disabled={!!profile?.first_name && !!user}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={!!profile?.last_name && !!user}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cnie">N° CNIE *</Label>
                <Input
                  id="cnie"
                  value={formData.cnie}
                  onChange={(e) => setFormData({ ...formData, cnie: e.target.value })}
                  placeholder="Numéro de Carte Nationale d'Identité Électronique"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!user?.email}
                />
              </div>

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
            </div>

            {/* Localisation */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-sm">Localisation</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="region">Région *</Label>
                <SimpleListSelect
                  value={formData.region}
                  onChange={(value) => {
                    setFormData({ ...formData, region: value, ville: "" });
                  }}
                  options={[...MOROCCO_REGIONS]}
                  placeholder="Sélectionner une région"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ville">Ville *</Label>
                <SimpleListSelect
                  value={formData.ville}
                  onChange={(value) => setFormData({ ...formData, ville: value })}
                  options={formData.region ? CITIES_BY_REGION[formData.region] || [] : []}
                  placeholder={formData.region ? "Sélectionner une ville" : "Sélectionner d'abord une région"}
                  disabled={!formData.region}
                  required
                />
              </div>
            </div>

            {/* Sélection de document pour reproduction */}
            {isReproductionService && (
              <div className="grid gap-2">
                <Label>Document à reproduire *</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par titre, cote, auteur..."
                      value={selectedManuscript ? `${selectedManuscript.title} - ${selectedManuscript.cote || selectedManuscript.inventory_number}` : searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowManuscriptList(true);
                        if (selectedManuscript) setSelectedManuscript(null);
                      }}
                      onFocus={() => setShowManuscriptList(true)}
                      className="pl-9 pr-9"
                    />
                    {selectedManuscript && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedManuscript(null);
                          setSearchQuery("");
                        }}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {showManuscriptList && !selectedManuscript && (
                    <div 
                      ref={manuscriptListRef}
                      className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[200px] overflow-auto"
                    >
                      {manuscripts
                        .filter(m => 
                          searchQuery === "" ||
                          m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.cote?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.inventory_number?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((manuscript) => (
                          <button
                            key={manuscript.id}
                            type="button"
                            onClick={() => {
                              setSelectedManuscript(manuscript);
                              setSearchQuery("");
                              setShowManuscriptList(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{manuscript.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {manuscript.author && `${manuscript.author} - `}
                                {manuscript.cote || manuscript.inventory_number}
                              </span>
                            </div>
                          </button>
                        ))}
                      {manuscripts.filter(m => 
                        searchQuery === "" ||
                        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.cote?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.inventory_number?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          Aucun document trouvé.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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
