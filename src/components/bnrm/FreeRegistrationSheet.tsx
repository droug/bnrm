import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  Gift,
  CheckCircle,
  Upload,
  FileText,
  User,
  Phone,
  Mail,
  CreditCard,
  UserPlus,
  Info,
} from "lucide-react";
import { MOROCCO_REGIONS, CITIES_BY_REGION } from "@/data/moroccoRegions";
import { SimpleListSelect } from "@/components/ui/simple-list-select";

interface BNRMService {
  id_service: string;
  nom_service: string;
  description: string | null;
  public_cible: string | null;
  reference_legale: string | null;
  is_free: boolean | null;
}

interface FreeRegistrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BNRMService;
}

// Pièces jointes requises selon le type d'inscription gratuite
function getRequiredDocuments(serviceId: string): { label: string; description: string; required: boolean }[] {
  const base = [
    { label: "Copie CNIE", description: "Copie recto-verso de la Carte Nationale d'Identité Électronique", required: true },
    { label: "Photo d'identité", description: "Photo récente au format numérique (JPG, PNG)", required: true },
  ];

  switch (serviceId) {
    case "SL-HON":
      return [
        ...base,
        { label: "Document justificatif", description: "Document prouvant l'honorabilité ou la distinction accordée", required: true },
      ];
    case "SL-RET":
      return [
        ...base,
        { label: "Attestation de retraite BNRM", description: "Attestation ou décision de mise à la retraite délivrée par la BNRM", required: true },
      ];
    case "SL-ENF":
      return [
        ...base,
        { label: "Acte de naissance", description: "Acte de naissance du demandeur", required: true },
        { label: "Attestation de travail du parent", description: "Attestation de travail du parent employé à la BNRM", required: true },
      ];
    case "SL-PASS":
      return [
        ...base,
      ];
    case "SL-PBS":
      return [
        ...base,
        { label: "Justificatif de situation", description: "Carte d'invalidité ou attestation médicale officielle reconnaissant le besoin spécifique", required: true },
      ];
    default:
      return base;
  }
}

export function FreeRegistrationSheet({ open, onOpenChange, service }: FreeRegistrationSheetProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cnie: "",
    email: "",
    phone: "",
    region: "",
    ville: "",
    address: "",
    additionalInfo: "",
  });

  const requiredDocs = getRequiredDocuments(service.id_service);

  // Pre-fill from profile
  useEffect(() => {
    if (!open) {
      setIsSuccess(false);
      setPassword("");
      setConfirmPassword("");
      setUploadedFiles({});
      return;
    }
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
      }));
    } else if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [open, profile, user]);

  const handleFileChange = (docLabel: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [docLabel]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required docs
    const missingDocs = requiredDocs.filter(
      (doc) => doc.required && !uploadedFiles[doc.label]
    );
    if (missingDocs.length > 0) {
      toast({
        title: "Pièces jointes manquantes",
        description: `Veuillez joindre : ${missingDocs.map((d) => d.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        // Validate password
        if (!password || password.length < 6) {
          toast({ title: "Mot de passe requis", description: "Minimum 6 caractères.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Upload documents first (to temp storage)
        const uploadedPaths: Record<string, string> = {};
        for (const [label, file] of Object.entries(uploadedFiles)) {
          if (file) {
            const ext = file.name.split(".").pop();
            const path = `free-registrations/temp/${Date.now()}-${label.replace(/\s+/g, "-")}.${ext}`;
            const { error: uploadErr } = await supabase.storage
              .from("documents")
              .upload(path, file, { upsert: true });
            if (!uploadErr) uploadedPaths[label] = path;
          }
        }

        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          "signup-and-subscribe",
          {
            body: {
              email: formData.email,
              password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              cnie: formData.cnie,
              region: formData.region,
              ville: formData.ville,
              address: formData.address,
              additionalInfo: formData.additionalInfo,
              serviceId: service.id_service,
              tariffId: null,
              isFreeService: true,
              selectedTariffInfo: "Inscription gratuite",
              isPageBasedService: false,
              attachments: uploadedPaths,
            },
          }
        );

        if (fnError || fnData?.error) {
          throw new Error(fnError?.message || fnData?.error || "Erreur lors de la création du compte");
        }

        setIsSuccess(true);
        return;
      }

      // Logged-in user: upload docs and insert directly
      const uploadedPaths: Record<string, string> = {};
      for (const [label, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const ext = file.name.split(".").pop();
          const path = `free-registrations/${user.id}/${service.id_service}/${Date.now()}-${label.replace(/\s+/g, "-")}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("documents")
            .upload(path, file, { upsert: true });
          if (!uploadErr) uploadedPaths[label] = path;
        }
      }

      const { error: regError } = await supabase.from("service_registrations").insert({
        user_id: user.id,
        service_id: service.id_service,
        tariff_id: null,
        status: "active",
        is_paid: true,
        registration_data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          cnie: formData.cnie,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          ville: formData.ville,
          address: formData.address,
          additionalInfo: formData.additionalInfo,
          formuleType: "Inscription gratuite",
          attachments: uploadedPaths,
        },
      });

      if (regError) throw regError;

      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <SheetTitle>Demande d'inscription gratuite</SheetTitle>
          </div>
          <SheetDescription>
            <Badge className="bg-primary/10 text-primary border-0 mb-2">Gratuit — Décision 2025</Badge>
            <div className="font-semibold text-foreground text-base">{service.nom_service}</div>
            {service.description && (
              <div className="text-sm mt-1">{service.description}</div>
            )}
          </SheetDescription>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-bold">Demande envoyée avec succès !</h3>
            <p className="text-muted-foreground max-w-xs">
              Votre demande d'inscription gratuite a été enregistrée. L'administration vous contactera pour confirmer votre accès.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">

            {/* Info box */}
            <div className="bg-muted/40 border rounded-lg p-4 flex gap-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                {service.reference_legale && (
                  <p className="mb-1"><strong>Référence :</strong> {service.reference_legale}</p>
                )}
                {service.public_cible && (
                  <p><strong>Salles accessibles :</strong> {service.public_cible}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Informations personnelles
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fs-firstName">Prénom *</Label>
                  <Input
                    id="fs-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    disabled={!!profile?.first_name && !!user}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fs-lastName">Nom *</Label>
                  <Input
                    id="fs-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={!!profile?.last_name && !!user}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fs-cnie" className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> N° CNIE *
                </Label>
                <Input
                  id="fs-cnie"
                  value={formData.cnie}
                  onChange={(e) => setFormData({ ...formData, cnie: e.target.value })}
                  placeholder="Numéro de Carte Nationale d'Identité Électronique"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fs-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email *
                </Label>
                <Input
                  id="fs-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!user?.email}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fs-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Téléphone *
                </Label>
                <Input
                  id="fs-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Account creation fields for non-logged users */}
              {!user && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Création de compte
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Un compte sera automatiquement créé pour suivre votre inscription.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="fs-password">Mot de passe *</Label>
                    <Input
                      id="fs-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fs-confirm-password">Confirmer le mot de passe *</Label>
                    <Input
                      id="fs-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez votre mot de passe"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}
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
                <Label htmlFor="fs-address">Adresse</Label>
                <Input
                  id="fs-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>
            </div>

            <Separator />

            {/* Pièces jointes */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Pièces jointes à fournir
              </h3>
              <p className="text-xs text-muted-foreground">
                Les documents marqués d'un * sont obligatoires. Formats acceptés : PDF, JPG, PNG (max 5 Mo)
              </p>

              <div className="space-y-3">
                {requiredDocs.map((doc) => (
                  <div key={doc.label} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Label className="text-sm font-medium">
                          {doc.label} {doc.required && <span className="text-destructive">*</span>}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                      </div>
                      {uploadedFiles[doc.label] && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          Ajouté
                        </Badge>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="flex-1 border border-dashed rounded-md px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {uploadedFiles[doc.label]
                            ? uploadedFiles[doc.label]!.name
                            : "Cliquer pour sélectionner un fichier"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(doc.label, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Informations complémentaires */}
            <div className="space-y-1.5">
              <Label htmlFor="fs-info">Informations complémentaires</Label>
              <Textarea
                id="fs-info"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Précisez toute information pertinente pour votre demande..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Soumettre ma demande
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
