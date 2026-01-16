import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle, XCircle, Loader2, Server, Shield, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Configuration Gmail actuelle (valeurs par défaut fonctionnelles)
const GMAIL_CONFIG = {
  host: "smtp.gmail.com",
  port: "587",
  encryption: "STARTTLS",
  description: "Gmail SMTP avec mot de passe d'application"
};

export function SmtpConfigCard() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Charger l'état d'activation depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("smtp_config_display");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEnabled(parsed.enabled !== false);
      } catch (e) {
        console.error("Error loading SMTP config:", e);
      }
    }
  }, []);

  const handleToggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    localStorage.setItem("smtp_config_display", JSON.stringify({ enabled: checked }));
    toast({
      title: checked ? "Notifications activées" : "Notifications désactivées",
      description: checked 
        ? "Les emails seront envoyés automatiquement." 
        : "Les emails ne seront pas envoyés.",
    });
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email de test.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: {
          email_type: "registration_received",
          recipient_email: testEmail,
          recipient_name: "Test SMTP",
          user_type: "visitor"
        }
      });

      if (error) throw error;

      if (data?.success) {
        setTestResult("success");
        toast({
          title: "Email de test envoyé",
          description: `Un email a été envoyé à ${testEmail} avec succès.`,
        });
      } else {
        throw new Error(data?.error || "Échec de l'envoi");
      }
    } catch (error: any) {
      setTestResult("error");
      toast({
        title: "Échec de l'envoi",
        description: error.message || "Impossible d'envoyer l'email de test.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Configuration Notification Mail
                {enabled ? (
                  <Badge variant="default" className="bg-green-500">Actif</Badge>
                ) : (
                  <Badge variant="secondary">Inactif</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Serveur SMTP configuré pour l'envoi des notifications
              </CardDescription>
            </div>
          </div>
          <Button 
            variant={isExpanded ? "secondary" : "default"}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Masquer' : 'Configurer'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Configuration actuelle */}
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-700 dark:text-green-300">Configuration Gmail active</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Le serveur SMTP est configuré et opérationnel.
                </p>
              </div>
            </div>
          </div>

          {/* Activation */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Activer les notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des emails automatiques lors des événements système
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          {/* Paramètres SMTP actuels (lecture seule) */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Paramètres SMTP actuels
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Serveur SMTP</Label>
                <p className="font-mono text-sm mt-1">{GMAIL_CONFIG.host}</p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Port</Label>
                <p className="font-mono text-sm mt-1">{GMAIL_CONFIG.port}</p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Chiffrement
                </Label>
                <p className="font-mono text-sm mt-1">{GMAIL_CONFIG.encryption}</p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="font-mono text-sm mt-1">{GMAIL_CONFIG.description}</p>
              </div>
            </div>
          </div>

          {/* Alerte secrets */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-medium text-blue-700 dark:text-blue-300">Gestion des secrets</p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Les identifiants SMTP (SMTP_USER, SMTP_PASSWORD, SMTP_FROM) sont configurés de manière sécurisée 
                via les secrets Supabase.
              </p>
              <a 
                href="https://supabase.com/dashboard/project/safeppmznupzqkqmzjzt/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-blue-700 dark:text-blue-300 hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Gérer les secrets Supabase
              </a>
            </div>
          </div>

          {/* Test d'envoi */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Test d'envoi
            </h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="email-test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleTestEmail} 
                disabled={isTesting}
                variant={testResult === "success" ? "default" : testResult === "error" ? "destructive" : "secondary"}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : testResult === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Envoyé !
                  </>
                ) : testResult === "error" ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Échec
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer un test
                  </>
                )}
              </Button>
            </div>
            {testResult === "success" && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Email de test envoyé avec succès. Vérifiez votre boîte de réception.
              </p>
            )}
            {testResult === "error" && (
              <p className="text-sm text-red-600 mt-2">
                ✗ L'envoi a échoué. Vérifiez la configuration SMTP dans les secrets Supabase.
              </p>
            )}
          </div>

          {/* Bouton fermer */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Fermer
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
