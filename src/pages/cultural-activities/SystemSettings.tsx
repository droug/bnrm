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
import { Settings, Save, Mail, FileText, Clock, HardDrive, Building } from "lucide-react";
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
    email_default_subject: "BNRM - Activités Culturelles"
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
          "email_default_subject"
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
      email_default_subject: "email_default_subject"
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
          description="Configuration des paramètres globaux de la plateforme"
          icon={<Settings className="h-7 w-7" />}
          backTo="/admin/activites-culturelles"
        />

        <div className="grid gap-6 max-w-4xl">
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
