import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Save, Loader2, Mail, Smartphone, MonitorSpeaker, Users, FileText, CreditCard, CheckCircle, XCircle, Hash, Package, ClipboardCheck, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "global_notification_settings");

      if (error) throw error;

      if (data && data.length > 0) {
        const savedSettings = JSON.parse(data[0].valeur);
        setSettings({ ...defaultNotificationSettings, ...savedSettings });
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
          <TabsList className="grid w-full grid-cols-5">
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
