import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/cultural-activities/shared/PageHeader";
import { Settings, Save, Mail, FileText, Clock, HardDrive, Building, Calendar, BookOpen, Library } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettings {
  max_file_size_mb: number;
  session_duration_minutes: number;
  institution_name: string;
  institution_short_name: string;
  legal_notice: string;
  email_sender: string;
  email_signature: string;
  email_default_subject: string;
  // Paramètres du portail principal
  maintenance_mode: boolean;
  max_upload_size_mb: number;
  allowed_file_types: string;
  // Paramètres Activités Culturelles
  ac_max_booking_days_advance: number;
  ac_cancellation_deadline_hours: number;
  // Paramètres Manuscrits
  manuscripts_watermark_opacity: number;
  manuscripts_download_enabled: boolean;
  // Paramètres Bibliothèque Numérique
  library_loan_duration_days: number;
  library_max_simultaneous_loans: number;
}

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthorized, loading: authLoading } = useCulturalActivitiesAuth();
  
  const [settings, setSettings] = useState<SystemSettings>({
    max_file_size_mb: 10,
    session_duration_minutes: 30,
    institution_name: "Bibliothèque Nationale du Royaume du Maroc",
    institution_short_name: "BNRM",
    legal_notice: "",
    email_sender: "noreply@bnrm.ma",
    email_signature: "L'équipe de la Bibliothèque Nationale du Royaume du Maroc",
    email_default_subject: "BNRM - Activités Culturelles",
    maintenance_mode: false,
    max_upload_size_mb: 50,
    allowed_file_types: "pdf,jpg,jpeg,png,doc,docx",
    ac_max_booking_days_advance: 90,
    ac_cancellation_deadline_hours: 48,
    manuscripts_watermark_opacity: 0.3,
    manuscripts_download_enabled: false,
    library_loan_duration_days: 14,
    library_max_simultaneous_loans: 3
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      loadSettings();
    }
  }, [isAuthorized]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load settings from bnrm_parametres table
      const { data, error } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .in("parametre", [
          "system_max_file_size_mb",
          "system_session_duration_minutes",
          "institution_name",
          "institution_short_name",
          "legal_notice",
          "email_sender",
          "email_signature",
          "email_default_subject",
          "system_maintenance_mode",
          "system_max_upload_size_mb",
          "system_allowed_file_types",
          "ac_max_booking_days_advance",
          "ac_cancellation_deadline_hours",
          "manuscripts_watermark_opacity",
          "manuscripts_download_enabled",
          "library_loan_duration_days",
          "library_max_simultaneous_loans"
        ]);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings: Partial<SystemSettings> = {};
        data.forEach(param => {
          switch (param.parametre) {
            case "system_max_file_size_mb":
              loadedSettings.max_file_size_mb = parseFloat(param.valeur);
              break;
            case "system_session_duration_minutes":
              loadedSettings.session_duration_minutes = parseInt(param.valeur);
              break;
            case "institution_name":
              loadedSettings.institution_name = param.valeur;
              break;
            case "institution_short_name":
              loadedSettings.institution_short_name = param.valeur;
              break;
            case "legal_notice":
              loadedSettings.legal_notice = param.valeur;
              break;
            case "email_sender":
              loadedSettings.email_sender = param.valeur;
              break;
            case "email_signature":
              loadedSettings.email_signature = param.valeur;
              break;
            case "email_default_subject":
              loadedSettings.email_default_subject = param.valeur;
              break;
            case "system_maintenance_mode":
              loadedSettings.maintenance_mode = param.valeur === "true";
              break;
            case "system_max_upload_size_mb":
              loadedSettings.max_upload_size_mb = parseFloat(param.valeur);
              break;
            case "system_allowed_file_types":
              loadedSettings.allowed_file_types = param.valeur;
              break;
            case "ac_max_booking_days_advance":
              loadedSettings.ac_max_booking_days_advance = parseInt(param.valeur);
              break;
            case "ac_cancellation_deadline_hours":
              loadedSettings.ac_cancellation_deadline_hours = parseInt(param.valeur);
              break;
            case "manuscripts_watermark_opacity":
              loadedSettings.manuscripts_watermark_opacity = parseFloat(param.valeur);
              break;
            case "manuscripts_download_enabled":
              loadedSettings.manuscripts_download_enabled = param.valeur === "true";
              break;
            case "library_loan_duration_days":
              loadedSettings.library_loan_duration_days = parseInt(param.valeur);
              break;
            case "library_max_simultaneous_loans":
              loadedSettings.library_max_simultaneous_loans = parseInt(param.valeur);
              break;
          }
        });
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (paramName: string, value: string | number) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: paramName,
          valeur: String(value),
          commentaire: `Paramètre système - ${new Date().toISOString()}`
        }, {
          onConflict: "parametre"
        });

      if (error) throw error;
      
      toast.success("Paramètre enregistré");
    } catch (error: any) {
      console.error("Error saving setting:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = async (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // Map field names to database parameter names
    const paramMap: Record<keyof SystemSettings, string> = {
      max_file_size_mb: "system_max_file_size_mb",
      session_duration_minutes: "system_session_duration_minutes",
      institution_name: "institution_name",
      institution_short_name: "institution_short_name",
      legal_notice: "legal_notice",
      email_sender: "email_sender",
      email_signature: "email_signature",
      email_default_subject: "email_default_subject",
      maintenance_mode: "system_maintenance_mode",
      max_upload_size_mb: "system_max_upload_size_mb",
      allowed_file_types: "system_allowed_file_types",
      ac_max_booking_days_advance: "ac_max_booking_days_advance",
      ac_cancellation_deadline_hours: "ac_cancellation_deadline_hours",
      manuscripts_watermark_opacity: "manuscripts_watermark_opacity",
      manuscripts_download_enabled: "manuscripts_download_enabled",
      library_loan_duration_days: "library_loan_duration_days",
      library_max_simultaneous_loans: "library_max_simultaneous_loans"
    };
    
    // Auto-save after a short delay
    setTimeout(() => {
      saveSetting(paramMap[field], value);
    }, 1000);
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <PageHeader
          title="Règles et variables système"
          description="Configuration des paramètres globaux de toutes les plateformes"
          icon={<Settings className="h-7 w-7" />}
          backTo="/admin"
        />

        <div className="grid gap-6 max-w-4xl">
          {/* General Portal Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres généraux du portail
              </CardTitle>
              <CardDescription>
                Configuration globale applicable à toutes les plateformes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">
                  Taille maximale de téléchargement (MB)
                </Label>
                <Input
                  id="maxUploadSize"
                  type="number"
                  min="1"
                  max="200"
                  value={settings.max_upload_size_mb}
                  onChange={(e) => handleInputChange("max_upload_size_mb", parseFloat(e.target.value))}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">
                  Types de fichiers autorisés
                </Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowed_file_types}
                  onChange={(e) => handleInputChange("allowed_file_types", e.target.value)}
                  disabled={saving}
                  placeholder="pdf,jpg,jpeg,png,doc,docx"
                />
                <p className="text-xs text-muted-foreground">
                  Extensions séparées par des virgules
                </p>
              </div>
              
              <Button
                onClick={async () => {
                  await saveSetting("system_maintenance_mode", String(!settings.maintenance_mode));
                  setSettings(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }));
                }}
                variant={settings.maintenance_mode ? "destructive" : "outline"}
                disabled={saving}
              >
                {settings.maintenance_mode ? "Désactiver" : "Activer"} le mode maintenance
              </Button>
            </CardContent>
          </Card>

          {/* File and Session Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Paramètres techniques
              </CardTitle>
              <CardDescription>
                Configuration des limites système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">
                  Taille maximale des fichiers (MB)
                </Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_file_size_mb}
                  onChange={(e) => handleInputChange("max_file_size_mb", parseFloat(e.target.value))}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Limite de taille pour les fichiers téléchargés
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDuration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée des sessions (minutes)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.session_duration_minutes}
                  onChange={(e) => handleInputChange("session_duration_minutes", parseInt(e.target.value))}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Durée d'inactivité avant déconnexion automatique
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Noms institutionnels
              </CardTitle>
              <CardDescription>
                Identité de l'institution dans les documents et communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">
                  Nom complet de l'institution
                </Label>
                <Input
                  id="institutionName"
                  value={settings.institution_name}
                  onChange={(e) => handleInputChange("institution_name", e.target.value)}
                  disabled={saving}
                  placeholder="Bibliothèque Nationale du Royaume du Maroc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionShortName">
                  Nom court / Acronyme
                </Label>
                <Input
                  id="institutionShortName"
                  value={settings.institution_short_name}
                  onChange={(e) => handleInputChange("institution_short_name", e.target.value)}
                  disabled={saving}
                  placeholder="BNRM"
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mentions légales
              </CardTitle>
              <CardDescription>
                Texte affiché dans les documents officiels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="legalNotice">
                  Contenu des mentions légales
                </Label>
                <Textarea
                  id="legalNotice"
                  value={settings.legal_notice}
                  onChange={(e) => handleInputChange("legal_notice", e.target.value)}
                  disabled={saving}
                  rows={6}
                  placeholder="Mentions légales de l'institution..."
                />
                <p className="text-xs text-muted-foreground">
                  Ce texte sera inclus dans les documents générés
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuration des emails automatiques
              </CardTitle>
              <CardDescription>
                Paramètres par défaut pour les communications par email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailSender">
                  Adresse d'expédition
                </Label>
                <Input
                  id="emailSender"
                  type="email"
                  value={settings.email_sender}
                  onChange={(e) => handleInputChange("email_sender", e.target.value)}
                  disabled={saving}
                  placeholder="noreply@bnrm.ma"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">
                  Objet par défaut
                </Label>
                <Input
                  id="emailSubject"
                  value={settings.email_default_subject}
                  onChange={(e) => handleInputChange("email_default_subject", e.target.value)}
                  disabled={saving}
                  placeholder="BNRM - Activités Culturelles"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSignature">
                  Signature
                </Label>
                <Textarea
                  id="emailSignature"
                  value={settings.email_signature}
                  onChange={(e) => handleInputChange("email_signature", e.target.value)}
                  disabled={saving}
                  rows={4}
                  placeholder="Cordialement,&#10;L'équipe de la Bibliothèque Nationale du Royaume du Maroc"
                />
                <p className="text-xs text-muted-foreground">
                  Signature ajoutée automatiquement aux emails
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cultural Activities Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paramètres Activités Culturelles
              </CardTitle>
              <CardDescription>
                Configuration spécifique aux réservations et activités culturelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxBookingDays">
                  Délai maximum de réservation (jours)
                </Label>
                <Input
                  id="maxBookingDays"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.ac_max_booking_days_advance}
                  onChange={(e) => handleInputChange("ac_max_booking_days_advance", parseInt(e.target.value))}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Combien de jours à l'avance peut-on réserver
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationDeadline">
                  Délai d'annulation (heures)
                </Label>
                <Input
                  id="cancellationDeadline"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.ac_cancellation_deadline_hours}
                  onChange={(e) => handleInputChange("ac_cancellation_deadline_hours", parseInt(e.target.value))}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Nombre d'heures avant l'événement pour pouvoir annuler
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manuscripts Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Paramètres Manuscrits
              </CardTitle>
              <CardDescription>
                Configuration de la plateforme des manuscrits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watermarkOpacity">
                  Opacité du filigrane (0.1 - 1.0)
                </Label>
                <Input
                  id="watermarkOpacity"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.manuscripts_watermark_opacity}
                  onChange={(e) => handleInputChange("manuscripts_watermark_opacity", parseFloat(e.target.value))}
                  disabled={saving}
                />
              </div>

              <Button
                onClick={async () => {
                  await saveSetting("manuscripts_download_enabled", String(!settings.manuscripts_download_enabled));
                  setSettings(prev => ({ ...prev, manuscripts_download_enabled: !prev.manuscripts_download_enabled }));
                }}
                variant={settings.manuscripts_download_enabled ? "default" : "outline"}
                disabled={saving}
              >
                {settings.manuscripts_download_enabled ? "Désactiver" : "Activer"} le téléchargement
              </Button>
            </CardContent>
          </Card>

          {/* Digital Library Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Paramètres Bibliothèque Numérique
              </CardTitle>
              <CardDescription>
                Configuration des prêts et emprunts numériques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanDuration">
                  Durée de prêt (jours)
                </Label>
                <Input
                  id="loanDuration"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.library_loan_duration_days}
                  onChange={(e) => handleInputChange("library_loan_duration_days", parseInt(e.target.value))}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoans">
                  Nombre maximum de prêts simultanés
                </Label>
                <Input
                  id="maxLoans"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.library_max_simultaneous_loans}
                  onChange={(e) => handleInputChange("library_max_simultaneous_loans", parseInt(e.target.value))}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status indicator */}
          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Enregistrement en cours...</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SystemSettingsPage;
