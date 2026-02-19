import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, X, UserPlus, CreditCard as CreditCardIcon, User, Phone, Mail } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { useNavigate } from "react-router-dom";
import { MOROCCO_REGIONS, CITIES_BY_REGION } from "@/data/moroccoRegions";
import { SimpleListSelect } from "@/components/ui/simple-list-select";

interface BNRMService {
  id_service: string;
  nom_service: string;
  description: string | null;
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

interface ServiceRegistrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BNRMService;
  tariff?: BNRMTariff | null;
}

export function ServiceRegistrationSheet({
  open,
  onOpenChange,
  service,
  tariff,
}: ServiceRegistrationSheetProps) {
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<BNRMTariff | null>(null);
  const [showManuscriptList, setShowManuscriptList] = useState(false);
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const manuscriptListRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  const pageBasedServices = ["Impression papier NB", "Numérisation documents rares", "Impression papier couleur"];
  const isPageBasedService = pageBasedServices.includes(service.nom_service);
  const isReproductionService = service.categorie === "Reproduction";

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
    if (open) loadTariffs();
  }, [open, service.id_service, tariff]);

  useEffect(() => {
    const loadManuscripts = async () => {
      if (!isReproductionService || !open) return;
      const { data, error } = await supabase
        .from("manuscripts")
        .select("id, title, author, cote, inventory_number")
        .limit(50);
      if (!error && data) setManuscripts(data);
    };
    loadManuscripts();
  }, [open, isReproductionService]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (manuscriptListRef.current && !manuscriptListRef.current.contains(event.target as Node)) {
        setShowManuscriptList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setShowPaymentOptions(false);
      setShowPaymentDialog(false);
      setPassword("");
      setConfirmPassword("");
      return;
    }
    const pendingData = sessionStorage.getItem("pendingSubscription");
    if (pendingData && user) {
      try {
        const parsed = JSON.parse(pendingData);
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...parsed.formData, email: user?.email || parsed.formData.email || "" }));
          if (parsed.subscriptionType) setSubscriptionType(parsed.subscriptionType);
          if (parsed.pageCount) setPageCount(parsed.pageCount);
          sessionStorage.removeItem("pendingSubscription");
          setAutoSubmitPending(true);
          return;
        }
      } catch {
        sessionStorage.removeItem("pendingSubscription");
      }
    }
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        institution: profile.institution || "",
      }));
    } else if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [profile, user, open]);

  useEffect(() => {
    if (autoSubmitPending && user && open) {
      setAutoSubmitPending(false);
      const timer = setTimeout(() => { formRef.current?.requestSubmit(); }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSubmitPending, user, open]);

  const isFreeService = !selectedTariff;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      if (!password || password.length < 6) {
        toast({ title: "Mot de passe requis", description: "Minimum 6 caractères.", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
        return;
      }
      if (!formData.email) {
        toast({ title: "Email requis", description: "Veuillez saisir votre adresse email.", variant: "destructive" });
        return;
      }

      setIsCreatingAccount(true);
      setIsLoading(true);

      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke("signup-and-subscribe", {
          body: {
            email: formData.email,
            password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            institution: formData.institution,
            cnie: formData.cnie,
            region: formData.region,
            ville: formData.ville,
            address: formData.address,
            additionalInfo: formData.additionalInfo,
            serviceId: service.id_service,
            tariffId: selectedTariff?.id_tarif || null,
            isFreeService,
            selectedTariffInfo: selectedTariff
              ? `${selectedTariff.condition_tarif || "Non spécifié"} ${selectedTariff.periode_validite ? `Validité: ${selectedTariff.periode_validite}` : ""}`
              : "Non spécifié",
            isPageBasedService,
            pageCount,
            selectedManuscript: selectedManuscript
              ? { id: selectedManuscript.id, title: selectedManuscript.title, cote: selectedManuscript.cote }
              : null,
          },
        });

        if (fnError || fnData?.error) throw new Error(fnError?.message || fnData?.error || "Erreur");

        toast({ title: "Inscription et abonnement réussis !", description: "Votre compte a été créé et votre demande a été enregistrée." });
        setIsCreatingAccount(false);
        setIsLoading(false);
        onOpenChange(false);
        return;
      } catch (error: any) {
        toast({ title: "Erreur", description: error.message || "Une erreur est survenue", variant: "destructive" });
        setIsLoading(false);
        setIsCreatingAccount(false);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (!isPageBasedService && !isFreeService) {
        const { data: existingRegistration } = await supabase
          .from("service_registrations")
          .select("*")
          .eq("user_id", user.id)
          .eq("service_id", service.id_service)
          .eq("is_paid", true)
          .maybeSingle();

        if (existingRegistration) {
          toast({ title: "Déjà inscrit", description: "Vous avez déjà un abonnement actif pour ce service", variant: "destructive" });
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
          ...(selectedManuscript && { manuscriptId: selectedManuscript.id, manuscriptTitle: selectedManuscript.title, manuscriptCote: selectedManuscript.cote }),
        },
      };

      const { data: registration, error: regError } = await supabase
        .from("service_registrations")
        .insert(registrationData)
        .select()
        .single();

      if (regError) throw regError;
      setRegistrationId(registration.id);

      if (!isFreeService && selectedTariff) {
        if (!isPageBasedService) {
          const startDate = new Date();
          const endDate = subscriptionType === "monthly"
            ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

          const { error: subError } = await supabase.from("service_subscriptions").insert({
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
        setShowPaymentOptions(true);
      } else {
        toast({ title: "Inscription réussie", description: "Vous êtes maintenant inscrit à ce service gratuit" });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayLater = () => {
    toast({ title: "Paiement différé", description: "Vous recevrez des notifications pour effectuer le paiement." });
    onOpenChange(false);
  };

  const handlePayNow = () => setShowPaymentDialog(true);

  const handlePaymentSuccess = () => {
    setShowPaymentOptions(false);
    setShowPaymentDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-primary" />
              <SheetTitle>
                {showPaymentOptions ? "Options de paiement" : `Inscription : ${service.nom_service}`}
              </SheetTitle>
            </div>
            <SheetDescription>
              {showPaymentOptions
                ? "Choisissez votre mode de paiement"
                : user
                ? "Vérifiez vos informations et complétez le formulaire"
                : "Remplissez le formulaire pour créer un compte et vous inscrire"}
            </SheetDescription>
          </SheetHeader>

          {showPaymentOptions ? (
            <div className="space-y-6 pb-6">
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Montant à payer :</span>
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
                    : `Type d'abonnement : ${subscriptionType === "monthly" ? "Mensuel" : "Annuel"}`}
                </div>
              </div>

              <div className="grid gap-4">
                <Button onClick={handlePayNow} disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</> : "Payer maintenant"}
                </Button>
                <Button onClick={handlePayLater} disabled={isLoading} variant="outline" size="lg" className="w-full">
                  Payer plus tard
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Paiement différé :</strong> Vous recevrez des notifications de rappel. Votre abonnement sera activé dès réception du paiement.
                </p>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pb-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" /> Informations personnelles
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sr-firstName">Prénom *</Label>
                    <Input
                      id="sr-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      disabled={!!profile?.first_name && !!user}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sr-lastName">Nom *</Label>
                    <Input
                      id="sr-lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      disabled={!!profile?.last_name && !!user}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sr-cnie">N° CNIE *</Label>
                  <Input
                    id="sr-cnie"
                    value={formData.cnie}
                    onChange={(e) => setFormData({ ...formData, cnie: e.target.value })}
                    placeholder="Numéro de Carte Nationale d'Identité Électronique"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sr-email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email *
                  </Label>
                  <Input
                    id="sr-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!user?.email}
                  />
                </div>

                {!user && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <UserPlus className="h-4 w-4" /> Création de compte
                    </h4>
                    <p className="text-xs text-muted-foreground">Un compte sera automatiquement créé pour suivre votre abonnement.</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="sr-password">Mot de passe *</Label>
                      <Input id="sr-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" required minLength={6} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sr-confirmPassword">Confirmer le mot de passe *</Label>
                      <Input id="sr-confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez votre mot de passe" required minLength={6} />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="sr-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Téléphone *
                  </Label>
                  <Input
                    id="sr-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Localisation */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Localisation</h3>

                <div className="space-y-1.5">
                  <Label>Région *</Label>
                  <SimpleListSelect
                    value={formData.region}
                    onChange={(value) => setFormData({ ...formData, region: value, ville: "" })}
                    options={[...MOROCCO_REGIONS]}
                    placeholder="Sélectionner une région"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Ville *</Label>
                  <SimpleListSelect
                    value={formData.ville}
                    onChange={(value) => setFormData({ ...formData, ville: value })}
                    options={formData.region ? CITIES_BY_REGION[formData.region] || [] : []}
                    placeholder={formData.region ? "Sélectionner une ville" : "Sélectionner d'abord une région"}
                    disabled={!formData.region}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sr-address">Adresse</Label>
                  <Input
                    id="sr-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sr-institution">Institution</Label>
                  <Input
                    id="sr-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
              </div>

              {/* Sélection de document pour reproduction */}
              {isReproductionService && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Document à reproduire *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher par titre, cote, auteur..."
                        value={selectedManuscript ? `${selectedManuscript.title} - ${selectedManuscript.cote || selectedManuscript.inventory_number}` : searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowManuscriptList(true); if (selectedManuscript) setSelectedManuscript(null); }}
                        onFocus={() => setShowManuscriptList(true)}
                        className="pl-9 pr-9"
                      />
                      {selectedManuscript && (
                        <button type="button" onClick={() => { setSelectedManuscript(null); setSearchQuery(""); }} className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {showManuscriptList && !selectedManuscript && (
                        <div ref={manuscriptListRef} className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[200px] overflow-auto">
                          {manuscripts.filter(m =>
                            searchQuery === "" ||
                            m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.cote?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).slice(0, 10).map((manuscript) => (
                            <button key={manuscript.id} type="button" onClick={() => { setSelectedManuscript(manuscript); setSearchQuery(""); setShowManuscriptList(false); }} className="w-full text-left px-4 py-2 hover:bg-muted">
                              <div className="font-medium text-sm">{manuscript.title}</div>
                              <div className="text-xs text-muted-foreground">{manuscript.author && `${manuscript.author} - `}{manuscript.cote || manuscript.inventory_number}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Tarifs */}
              {!isFreeService && availableTariffs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Formule tarifaire</h3>
                  {availableTariffs.length > 1 && (
                    <RadioGroup value={selectedTariff?.id_tarif} onValueChange={(value) => { const t = availableTariffs.find(t => t.id_tarif === value); if (t) setSelectedTariff(t); }}>
                      {availableTariffs.map((t) => (
                        <div key={t.id_tarif} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={t.id_tarif} id={t.id_tarif} />
                          <Label htmlFor={t.id_tarif} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-sm">{t.condition_tarif}</div>
                                {t.periode_validite && <div className="text-xs text-muted-foreground">Validité : {t.periode_validite}</div>}
                              </div>
                              <div className="text-lg font-bold text-primary">{t.montant} {t.devise}</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {selectedTariff && isPageBasedService ? (
                    <div className="space-y-3">
                      <Label htmlFor="sr-pageCount">Nombre de pages *</Label>
                      <Input id="sr-pageCount" type="number" min="1" value={pageCount} onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))} required />
                      <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm">Total :</span>
                        <span className="font-bold text-primary">{selectedTariff.montant * pageCount} {selectedTariff.devise}</span>
                      </div>
                    </div>
                  ) : selectedTariff && !isPageBasedService && availableTariffs.length === 1 ? (
                    <RadioGroup value={subscriptionType} onValueChange={(v: any) => setSubscriptionType(v)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="monthly" id="sr-monthly" />
                        <Label htmlFor="sr-monthly" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-sm">Abonnement mensuel</div>
                          <div className="text-xs text-muted-foreground">{selectedTariff.montant} {selectedTariff.devise} / mois</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="annual" id="sr-annual" />
                        <Label htmlFor="sr-annual" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-sm">Abonnement annuel</div>
                          <div className="text-xs text-muted-foreground">{selectedTariff.montant * 12} {selectedTariff.devise} / an</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  ) : null}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="sr-additionalInfo">Informations complémentaires</Label>
                <Textarea
                  id="sr-additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Précisez toute information pertinente..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isCreatingAccount ? "Création du compte..." : "Inscription..."}</>
                  ) : (
                    !user
                      ? (isCreatingAccount ? "Création du compte..." : "Créer un compte et s'inscrire")
                      : (isFreeService ? "S'inscrire" : "S'inscrire et réserver")
                  )}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

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
    </>
  );
}
