import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Save, Loader2, Mail, Smartphone, MonitorSpeaker, Users, FileText, CreditCard, CheckCircle, XCircle, Hash, Package, ClipboardCheck, UserPlus, Settings, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationChannel {
  email: boolean;
  system: boolean;
  sms: boolean;
}

interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel;
}

interface NotificationSettings {
  // Inscriptions
  user_registration: NotificationConfig;
  user_validation: NotificationConfig;
  user_rejection: NotificationConfig;
  password_reset: NotificationConfig;
  
  // Dépôt légal
  deposit_submission: NotificationConfig;
  deposit_validation: NotificationConfig;
  deposit_rejection: NotificationConfig;
  number_attribution: NotificationConfig;
  conformity_check: NotificationConfig;
  physical_receipt: NotificationConfig;
  
  // Réservations espaces
  booking_request: NotificationConfig;
  booking_approval: NotificationConfig;
  booking_rejection: NotificationConfig;
  booking_reminder: NotificationConfig;
  
  // CBM
  cbm_adhesion_request: NotificationConfig;
  cbm_adhesion_approval: NotificationConfig;
  cbm_formation_request: NotificationConfig;
  
  // Général
  system_maintenance: NotificationConfig;
  new_content_published: NotificationConfig;
}

interface SMSSettings {
  enabled: boolean;
  provider: 'twilio' | 'infobip' | 'orange' | 'custom';
  sender_id: string;
  api_key_configured: boolean;
  test_phone: string;
  country_code: string;
}

const defaultSMSSettings: SMSSettings = {
  enabled: false,
  provider: 'twilio',
  sender_id: 'BNRM',
  api_key_configured: false,
  test_phone: '',
  country_code: '+212',
};

const defaultChannels: NotificationChannel = {
  email: true,
  system: true,
  sms: false,
};

const defaultNotificationSettings: NotificationSettings = {
  // Inscriptions
  user_registration: { enabled: true, channels: { ...defaultChannels } },
  user_validation: { enabled: true, channels: { ...defaultChannels } },
  user_rejection: { enabled: true, channels: { ...defaultChannels } },
  password_reset: { enabled: true, channels: { email: true, system: false, sms: false } },
  
  // Dépôt légal
  deposit_submission: { enabled: true, channels: { ...defaultChannels } },
  deposit_validation: { enabled: true, channels: { ...defaultChannels } },
  deposit_rejection: { enabled: true, channels: { ...defaultChannels } },
  number_attribution: { enabled: true, channels: { ...defaultChannels } },
  conformity_check: { enabled: true, channels: { ...defaultChannels } },
  physical_receipt: { enabled: true, channels: { ...defaultChannels } },
  
  // Réservations
  booking_request: { enabled: true, channels: { ...defaultChannels } },
  booking_approval: { enabled: true, channels: { ...defaultChannels } },
  booking_rejection: { enabled: true, channels: { ...defaultChannels } },
  booking_reminder: { enabled: true, channels: { ...defaultChannels } },
  
  // CBM
  cbm_adhesion_request: { enabled: true, channels: { ...defaultChannels } },
  cbm_adhesion_approval: { enabled: true, channels: { ...defaultChannels } },
  cbm_formation_request: { enabled: true, channels: { ...defaultChannels } },
  
  // Général
  system_maintenance: { enabled: true, channels: { email: true, system: true, sms: false } },
  new_content_published: { enabled: true, channels: { ...defaultChannels } },
};

interface NotificationItemProps {
  id: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ReactNode;
  config: NotificationConfig;
  onChange: (id: keyof NotificationSettings, config: NotificationConfig) => void;
}

function NotificationItem({ id, label, description, icon, config, onChange }: NotificationItemProps) {
  const handleEnabledChange = (enabled: boolean) => {
    onChange(id, { ...config, enabled });
  };

  const handleChannelChange = (channel: keyof NotificationChannel, checked: boolean) => {
    onChange(id, {
      ...config,
      channels: { ...config.channels, [channel]: checked },
    });
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>
      
      {config.enabled && (
        <div className="flex items-center gap-6 pt-2 pl-12 border-t mt-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-email`}
              checked={config.channels.email}
              onCheckedChange={(checked) => handleChannelChange("email", checked === true)}
            />
            <Label htmlFor={`${id}-email`} className="text-xs flex items-center gap-1 cursor-pointer">
              <Mail className="h-3 w-3" />
              Email
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-system`}
              checked={config.channels.system}
              onCheckedChange={(checked) => handleChannelChange("system", checked === true)}
            />
            <Label htmlFor={`${id}-system`} className="text-xs flex items-center gap-1 cursor-pointer">
              <MonitorSpeaker className="h-3 w-3" />
              Système
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-sms`}
              checked={config.channels.sms}
              onCheckedChange={(checked) => handleChannelChange("sms", checked === true)}
            />
            <Label htmlFor={`${id}-sms`} className="text-xs flex items-center gap-1 cursor-pointer">
              <Smartphone className="h-3 w-3" />
              SMS
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

export function BNRMPaymentNotificationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [smsSettings, setSmsSettings] = useState<SMSSettings>(defaultSMSSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch notification settings
      const { data, error } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "global_notification_settings");

      if (error) throw error;

      if (data && data.length > 0) {
        const savedSettings = JSON.parse(data[0].valeur);
        setSettings({ ...defaultNotificationSettings, ...savedSettings });
      }

      // Fetch SMS settings
      const { data: smsData, error: smsError } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "sms_notification_settings");

      if (!smsError && smsData && smsData.length > 0) {
        const savedSmsSettings = JSON.parse(smsData[0].valeur);
        setSmsSettings({ ...defaultSMSSettings, ...savedSmsSettings });
      }
    } catch (error: any) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save notification settings
      const { error } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "global_notification_settings",
          valeur: JSON.stringify(settings),
          commentaire: "Paramètres globaux de notifications",
        }, {
          onConflict: "parametre"
        });

      if (error) throw error;

      // Save SMS settings
      const { error: smsError } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "sms_notification_settings",
          valeur: JSON.stringify(smsSettings),
          commentaire: "Paramètres d'abonnement SMS",
        }, {
          onConflict: "parametre"
        });

      if (smsError) throw smsError;

      toast({
        title: "Succès",
        description: "Les paramètres de notifications ont été enregistrés",
      });
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (id: keyof NotificationSettings, config: NotificationConfig) => {
    setSettings((prev) => ({ ...prev, [id]: config }));
  };

  const handleSmsSettingsChange = (field: keyof SMSSettings, value: any) => {
    setSmsSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Paramètres de Notifications
        </CardTitle>
        <CardDescription>
          Configurez les notifications automatiques par canal (Email, Système, SMS) pour toutes les actions du système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inscriptions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="inscriptions" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Inscriptions
            </TabsTrigger>
            <TabsTrigger value="depot" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Dépôt Légal
            </TabsTrigger>
            <TabsTrigger value="reservations" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              Réservations
            </TabsTrigger>
            <TabsTrigger value="cbm" className="text-xs">
              <ClipboardCheck className="h-4 w-4 mr-1" />
              CBM
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs">
              <Bell className="h-4 w-4 mr-1" />
              Général
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">
              <Smartphone className="h-4 w-4 mr-1" />
              Config SMS
            </TabsTrigger>
          </TabsList>

          {/* Inscriptions */}
          <TabsContent value="inscriptions" className="space-y-4">
            <div className="grid gap-4">
              <NotificationItem
                id="user_registration"
                label="Nouvelle inscription"
                description="Notifier les administrateurs lors d'une nouvelle inscription"
                icon={<UserPlus className="h-4 w-4 text-primary" />}
                config={settings.user_registration}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="user_validation"
                label="Validation de compte"
                description="Notifier l'utilisateur lorsque son compte est validé"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.user_validation}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="user_rejection"
                label="Rejet d'inscription"
                description="Notifier l'utilisateur lorsque son inscription est rejetée"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.user_rejection}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="password_reset"
                label="Réinitialisation de mot de passe"
                description="Envoyer un email de réinitialisation de mot de passe"
                icon={<Mail className="h-4 w-4 text-blue-600" />}
                config={settings.password_reset}
                onChange={handleNotificationChange}
              />
            </div>
          </TabsContent>

          {/* Dépôt Légal */}
          <TabsContent value="depot" className="space-y-4">
            <div className="grid gap-4">
              <NotificationItem
                id="deposit_submission"
                label="Soumission de dépôt"
                description="Notifier lors de la soumission d'une nouvelle demande de dépôt légal"
                icon={<FileText className="h-4 w-4 text-primary" />}
                config={settings.deposit_submission}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="deposit_validation"
                label="Validation de dépôt"
                description="Notifier le déposant lorsque son dépôt est validé"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.deposit_validation}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="deposit_rejection"
                label="Rejet de dépôt"
                description="Notifier le déposant en cas de rejet de son dépôt"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.deposit_rejection}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="number_attribution"
                label="Attribution de numéro"
                description="Notifier lors de l'attribution d'un numéro ISBN/ISSN"
                icon={<Hash className="h-4 w-4 text-blue-600" />}
                config={settings.number_attribution}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="conformity_check"
                label="Contrôle de conformité"
                description="Notifier les résultats du contrôle de conformité"
                icon={<ClipboardCheck className="h-4 w-4 text-amber-600" />}
                config={settings.conformity_check}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="physical_receipt"
                label="Réception physique"
                description="Notifier la réception des exemplaires physiques"
                icon={<Package className="h-4 w-4 text-green-600" />}
                config={settings.physical_receipt}
                onChange={handleNotificationChange}
              />
            </div>
          </TabsContent>

          {/* Réservations */}
          <TabsContent value="reservations" className="space-y-4">
            <div className="grid gap-4">
              <NotificationItem
                id="booking_request"
                label="Demande de réservation"
                description="Notifier les administrateurs lors d'une nouvelle demande de réservation"
                icon={<Package className="h-4 w-4 text-primary" />}
                config={settings.booking_request}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="booking_approval"
                label="Approbation de réservation"
                description="Notifier le demandeur lorsque sa réservation est approuvée"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.booking_approval}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="booking_rejection"
                label="Rejet de réservation"
                description="Notifier le demandeur lorsque sa réservation est rejetée"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.booking_rejection}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="booking_reminder"
                label="Rappel de réservation"
                description="Envoyer un rappel avant la date de réservation"
                icon={<Bell className="h-4 w-4 text-amber-600" />}
                config={settings.booking_reminder}
                onChange={handleNotificationChange}
              />
            </div>
          </TabsContent>

          {/* CBM */}
          <TabsContent value="cbm" className="space-y-4">
            <div className="grid gap-4">
              <NotificationItem
                id="cbm_adhesion_request"
                label="Demande d'adhésion CBM"
                description="Notifier les administrateurs lors d'une nouvelle demande d'adhésion"
                icon={<Users className="h-4 w-4 text-primary" />}
                config={settings.cbm_adhesion_request}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="cbm_adhesion_approval"
                label="Approbation d'adhésion"
                description="Notifier la bibliothèque lorsque son adhésion est approuvée"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.cbm_adhesion_approval}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="cbm_formation_request"
                label="Demande de formation"
                description="Notifier les administrateurs lors d'une nouvelle demande de formation"
                icon={<ClipboardCheck className="h-4 w-4 text-blue-600" />}
                config={settings.cbm_formation_request}
                onChange={handleNotificationChange}
              />
            </div>
          </TabsContent>

          {/* Général */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <NotificationItem
                id="system_maintenance"
                label="Maintenance système"
                description="Notifier les utilisateurs des maintenances programmées"
                icon={<MonitorSpeaker className="h-4 w-4 text-amber-600" />}
                config={settings.system_maintenance}
                onChange={handleNotificationChange}
              />
              <NotificationItem
                id="new_content_published"
                label="Nouveau contenu publié"
                description="Notifier lors de la publication de nouveaux contenus (actualités, événements)"
                icon={<FileText className="h-4 w-4 text-primary" />}
                config={settings.new_content_published}
                onChange={handleNotificationChange}
              />
            </div>
          </TabsContent>

          {/* Configuration SMS */}
          <TabsContent value="sms" className="space-y-6">
            <div className="space-y-6">
              {/* Activation globale SMS */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Activer les notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Permet l'envoi de SMS pour les notifications configurées
                    </p>
                  </div>
                </div>
                <Switch
                  checked={smsSettings.enabled}
                  onCheckedChange={(checked) => handleSmsSettingsChange('enabled', checked)}
                />
              </div>

              {!smsSettings.enabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Les notifications SMS sont désactivées. Activez-les pour configurer les paramètres ci-dessous.
                  </AlertDescription>
                </Alert>
              )}

              {smsSettings.enabled && (
                <div className="space-y-6">
                  {/* Fournisseur SMS */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sms-provider">Fournisseur SMS</Label>
                      <Select
                        value={smsSettings.provider}
                        onValueChange={(value) => handleSmsSettingsChange('provider', value)}
                      >
                        <SelectTrigger id="sms-provider">
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="infobip">Infobip</SelectItem>
                          <SelectItem value="orange">Orange Business (Maroc)</SelectItem>
                          <SelectItem value="custom">Personnalisé (API)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Choisissez votre fournisseur de services SMS
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country-code">Indicatif pays par défaut</Label>
                      <Select
                        value={smsSettings.country_code}
                        onValueChange={(value) => handleSmsSettingsChange('country_code', value)}
                      >
                        <SelectTrigger id="country-code">
                          <SelectValue placeholder="Sélectionner l'indicatif" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+212">+212 (Maroc)</SelectItem>
                          <SelectItem value="+33">+33 (France)</SelectItem>
                          <SelectItem value="+34">+34 (Espagne)</SelectItem>
                          <SelectItem value="+1">+1 (USA/Canada)</SelectItem>
                          <SelectItem value="+44">+44 (Royaume-Uni)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Utilisé pour les numéros sans indicatif
                      </p>
                    </div>
                  </div>

                  {/* Identifiant expéditeur */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sender-id">Identifiant expéditeur (Sender ID)</Label>
                      <Input
                        id="sender-id"
                        value={smsSettings.sender_id}
                        onChange={(e) => handleSmsSettingsChange('sender_id', e.target.value)}
                        placeholder="BNRM"
                        maxLength={11}
                      />
                      <p className="text-xs text-muted-foreground">
                        Nom affiché comme expéditeur (max 11 caractères alphanumériques)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-phone">Numéro de test</Label>
                      <Input
                        id="test-phone"
                        value={smsSettings.test_phone}
                        onChange={(e) => handleSmsSettingsChange('test_phone', e.target.value)}
                        placeholder="0612345678"
                      />
                      <p className="text-xs text-muted-foreground">
                        Numéro pour envoyer des SMS de test
                      </p>
                    </div>
                  </div>

                  {/* Configuration API */}
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Configuration API</Label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Clé API {smsSettings.provider.charAt(0).toUpperCase() + smsSettings.provider.slice(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          {smsSettings.api_key_configured 
                            ? "✓ Configurée dans les secrets Supabase" 
                            : "⚠ Non configurée - Les SMS ne seront pas envoyés"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://supabase.com/dashboard/project/safeppmznupzqkqmzjzt/settings/functions" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Configurer les secrets
                        </a>
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Variables requises selon le fournisseur :</strong></p>
                      {smsSettings.provider === 'twilio' && (
                        <p>• TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN</p>
                      )}
                      {smsSettings.provider === 'infobip' && (
                        <p>• INFOBIP_API_KEY, INFOBIP_BASE_URL</p>
                      )}
                      {smsSettings.provider === 'orange' && (
                        <p>• ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET</p>
                      )}
                      {smsSettings.provider === 'custom' && (
                        <p>• SMS_API_URL, SMS_API_KEY</p>
                      )}
                    </div>
                  </div>

                  {/* Bouton de test */}
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      disabled={!smsSettings.test_phone}
                      onClick={() => {
                        toast({
                          title: "SMS de test",
                          description: `Un SMS de test serait envoyé à ${smsSettings.country_code}${smsSettings.test_phone}`,
                        });
                      }}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Envoyer un SMS de test
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Enverra un SMS au numéro de test configuré
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les paramètres
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
