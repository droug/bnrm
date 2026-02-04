import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Save, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentGatewayConfig {
  cmi: {
    enabled: boolean;
    merchant_id: string;
    store_key: string;
    api_endpoint: string;
    callback_url: string;
    test_mode: boolean;
  };
  stripe: {
    enabled: boolean;
    publishable_key: string;
    secret_key: string;
    webhook_secret: string;
    test_mode: boolean;
  };
}

const defaultConfig: PaymentGatewayConfig = {
  cmi: {
    enabled: false,
    merchant_id: "",
    store_key: "",
    api_endpoint: "https://testpayment.cmi.co.ma/fim/est3Dgate",
    callback_url: "",
    test_mode: true,
  },
  stripe: {
    enabled: false,
    publishable_key: "",
    secret_key: "",
    webhook_secret: "",
    test_mode: true,
  },
};

export default function PaymentGatewaySettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [config, setConfig] = useState<PaymentGatewayConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("bnrm_parametres")
        .select("valeur")
        .eq("parametre", "payment_gateway_config")
        .single();

      if (data?.valeur) {
        setConfig(JSON.parse(data.valeur));
      }
    } catch (error) {
      console.log("No existing config found, using defaults");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "payment_gateway_config",
          valeur: JSON.stringify(config),
          commentaire: "Configuration des passerelles de paiement électronique",
          updated_at: new Date().toISOString(),
        }, { onConflict: "parametre" });

      if (error) throw error;

      toast({
        title: "Configuration enregistrée",
        description: "Les paramètres de paiement ont été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCmiConfig = (field: keyof PaymentGatewayConfig["cmi"], value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      cmi: { ...prev.cmi, [field]: value },
    }));
  };

  const updateStripeConfig = (field: keyof PaymentGatewayConfig["stripe"], value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      stripe: { ...prev.stripe, [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Paiement Électronique
            </h1>
            <p className="text-muted-foreground">
              Configuration des passerelles de paiement CMI et Stripe
            </p>
          </div>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <Tabs defaultValue="cmi" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cmi" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            CMI
            {config.cmi.enabled && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                Actif
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe
            {config.stripe.enabled && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                Actif
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* CMI Configuration */}
        <TabsContent value="cmi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Centre Monétique Interbancaire (CMI)</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cmi-enabled">Activer CMI</Label>
                  <Switch
                    id="cmi-enabled"
                    checked={config.cmi.enabled}
                    onCheckedChange={(checked) => updateCmiConfig("enabled", checked)}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                Passerelle de paiement interbancaire marocaine pour les cartes bancaires locales et internationales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {config.cmi.test_mode ? (
                  <>
                    <TestTube className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Mode Test activé - Les transactions ne seront pas réelles</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Mode Production - Les transactions seront réelles</span>
                  </>
                )}
                <Switch
                  className="ml-auto"
                  checked={config.cmi.test_mode}
                  onCheckedChange={(checked) => updateCmiConfig("test_mode", checked)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cmi-merchant-id">Merchant ID (Identifiant Marchand)</Label>
                  <Input
                    id="cmi-merchant-id"
                    placeholder="Votre identifiant marchand CMI"
                    value={config.cmi.merchant_id}
                    onChange={(e) => updateCmiConfig("merchant_id", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmi-store-key">Store Key (Clé de magasin)</Label>
                  <div className="relative">
                    <Input
                      id="cmi-store-key"
                      type={showSecrets["cmi-store-key"] ? "text" : "password"}
                      placeholder="Votre clé secrète CMI"
                      value={config.cmi.store_key}
                      onChange={(e) => updateCmiConfig("store_key", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => toggleSecret("cmi-store-key")}
                    >
                      {showSecrets["cmi-store-key"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmi-endpoint">Endpoint API</Label>
                  <Input
                    id="cmi-endpoint"
                    placeholder="URL de l'API CMI"
                    value={config.cmi.api_endpoint}
                    onChange={(e) => updateCmiConfig("api_endpoint", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Test: https://testpayment.cmi.co.ma/fim/est3Dgate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmi-callback">URL de Callback</Label>
                  <Input
                    id="cmi-callback"
                    placeholder="URL de retour après paiement"
                    value={config.cmi.callback_url}
                    onChange={(e) => updateCmiConfig("callback_url", e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Documentation CMI</h4>
                <p className="text-sm text-blue-800">
                  Pour obtenir vos identifiants CMI, contactez le Centre Monétique Interbancaire ou votre banque partenaire.
                  Les credentials de test sont fournis lors de l'inscription au programme marchand.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stripe Configuration */}
        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Stripe</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor="stripe-enabled">Activer Stripe</Label>
                  <Switch
                    id="stripe-enabled"
                    checked={config.stripe.enabled}
                    onCheckedChange={(checked) => updateStripeConfig("enabled", checked)}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                Passerelle de paiement internationale pour les cartes bancaires et autres méthodes de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {config.stripe.test_mode ? (
                  <>
                    <TestTube className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Mode Test activé - Utilisez les clés de test Stripe</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Mode Production - Les transactions seront réelles</span>
                  </>
                )}
                <Switch
                  className="ml-auto"
                  checked={config.stripe.test_mode}
                  onCheckedChange={(checked) => updateStripeConfig("test_mode", checked)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stripe-pk">Clé Publique (Publishable Key)</Label>
                  <Input
                    id="stripe-pk"
                    placeholder="pk_test_... ou pk_live_..."
                    value={config.stripe.publishable_key}
                    onChange={(e) => updateStripeConfig("publishable_key", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-sk">Clé Secrète (Secret Key)</Label>
                  <div className="relative">
                    <Input
                      id="stripe-sk"
                      type={showSecrets["stripe-sk"] ? "text" : "password"}
                      placeholder="sk_test_... ou sk_live_..."
                      value={config.stripe.secret_key}
                      onChange={(e) => updateStripeConfig("secret_key", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => toggleSecret("stripe-sk")}
                    >
                      {showSecrets["stripe-sk"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <div className="relative">
                    <Input
                      id="stripe-webhook"
                      type={showSecrets["stripe-webhook"] ? "text" : "password"}
                      placeholder="whsec_..."
                      value={config.stripe.webhook_secret}
                      onChange={(e) => updateStripeConfig("webhook_secret", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => toggleSecret("stripe-webhook")}
                    >
                      {showSecrets["stripe-webhook"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Documentation Stripe</h4>
                <p className="text-sm text-purple-800">
                  Obtenez vos clés API depuis le{" "}
                  <a 
                    href="https://dashboard.stripe.com/apikeys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Dashboard Stripe
                  </a>
                  . Utilisez les clés de test (préfixe pk_test_ et sk_test_) pour le développement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">CMI</p>
                <div className="flex items-center gap-2">
                  {config.cmi.enabled ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        Activé ({config.cmi.test_mode ? "Test" : "Production"})
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Désactivé</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Stripe</p>
                <div className="flex items-center gap-2">
                  {config.stripe.enabled ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        Activé ({config.stripe.test_mode ? "Test" : "Production"})
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Désactivé</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
