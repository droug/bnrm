import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle, XCircle, Loader2, Eye, EyeOff, Server, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  from: string;
  encryption: "none" | "tls" | "ssl";
  enabled: boolean;
}

export function SmtpConfigCard() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SmtpConfig>({
    host: "",
    port: "587",
    user: "",
    password: "",
    from: "",
    encryption: "tls",
    enabled: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("smtp_config_display");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          host: parsed.host || "",
          port: parsed.port || "587",
          user: parsed.user || "",
          from: parsed.from || "",
          encryption: parsed.encryption || "tls",
          enabled: parsed.enabled !== false
        }));
      } catch (e) {
        console.error("Error loading SMTP config:", e);
      }
    }
  }, []);

  const handleSave = () => {
    // Sauvegarder uniquement les infos non sensibles pour l'affichage
    localStorage.setItem("smtp_config_display", JSON.stringify({
      host: config.host,
      port: config.port,
      user: config.user,
      from: config.from,
      encryption: config.encryption,
      enabled: config.enabled
    }));

    toast({
      title: "Configuration enregistrée",
      description: "Les paramètres SMTP ont été sauvegardés. Note: Les secrets (mot de passe) sont gérés via Supabase.",
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
                {config.enabled ? (
                  <Badge variant="default" className="bg-green-500">Actif</Badge>
                ) : (
                  <Badge variant="secondary">Inactif</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configurer le serveur SMTP pour l'envoi des notifications par email
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
          {/* Alerte d'information */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-300">Configuration des secrets</p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Les identifiants SMTP sensibles (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM) 
                sont configurés via les secrets Supabase pour des raisons de sécurité.
              </p>
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
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Serveur SMTP */}
            <div className="space-y-2">
              <Label htmlFor="smtp-host" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Serveur SMTP
              </Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={config.host}
                onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Select 
                value={config.port} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, port: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le port" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 (SMTP standard)</SelectItem>
                  <SelectItem value="465">465 (SSL/TLS)</SelectItem>
                  <SelectItem value="587">587 (STARTTLS)</SelectItem>
                  <SelectItem value="2525">2525 (Alternatif)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chiffrement */}
            <div className="space-y-2">
              <Label htmlFor="smtp-encryption" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Chiffrement
              </Label>
              <Select 
                value={config.encryption} 
                onValueChange={(value: "none" | "tls" | "ssl") => setConfig(prev => ({ ...prev, encryption: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de chiffrement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="tls">TLS/STARTTLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="smtp-user">Nom d'utilisateur</Label>
              <Input
                id="smtp-user"
                placeholder="user@example.com"
                value={config.user}
                onChange={(e) => setConfig(prev => ({ ...prev, user: e.target.value }))}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={config.password}
                  onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configuré via le secret SMTP_PASSWORD dans Supabase
              </p>
            </div>

            {/* Adresse d'expédition */}
            <div className="space-y-2">
              <Label htmlFor="smtp-from">Adresse d'expédition</Label>
              <Input
                id="smtp-from"
                placeholder="noreply@bnrm.ma"
                value={config.from}
                onChange={(e) => setConfig(prev => ({ ...prev, from: e.target.value }))}
              />
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

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer la configuration
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
