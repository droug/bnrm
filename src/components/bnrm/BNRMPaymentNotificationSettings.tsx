import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Save, Loader2, Mail, Smartphone, MonitorSpeaker, Users, FileText, CreditCard, CheckCircle, XCircle, Hash, Package, ClipboardCheck, UserPlus, Settings, AlertTriangle, FileEdit, Eye, RotateCcw, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationChannel {
  email: boolean;
  system: boolean;
  sms: boolean;
  whatsapp: boolean;
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

interface WhatsAppSettings {
  enabled: boolean;
  connected: boolean;
  phone_number: string;
  display_name: string;
  session_id: string;
}

const defaultSMSSettings: SMSSettings = {
  enabled: false,
  provider: 'twilio',
  sender_id: 'BNRM',
  api_key_configured: false,
  test_phone: '',
  country_code: '+212',
};

const defaultWhatsAppSettings: WhatsAppSettings = {
  enabled: false,
  connected: false,
  phone_number: '',
  display_name: 'BNRM',
  session_id: '',
};

interface EmailTemplate {
  subject: string;
  body: string;
}

interface EmailTemplates {
  user_registration: EmailTemplate;
  user_validation: EmailTemplate;
  user_rejection: EmailTemplate;
  password_reset: EmailTemplate;
  deposit_submission: EmailTemplate;
  deposit_validation: EmailTemplate;
  deposit_rejection: EmailTemplate;
  number_attribution: EmailTemplate;
  booking_request: EmailTemplate;
  booking_approval: EmailTemplate;
  booking_rejection: EmailTemplate;
  cbm_adhesion_approval: EmailTemplate;
  cbm_adhesion_rejection: EmailTemplate;
  cbm_formation_approval: EmailTemplate;
}

const defaultEmailTemplates: EmailTemplates = {
  user_registration: {
    subject: "Confirmation de votre inscription - BNRM",
    body: `Bonjour {{nom}},

Nous avons bien reçu votre demande d'inscription sur le portail de la Bibliothèque Nationale du Royaume du Maroc.

Votre demande est en cours d'examen par notre équipe. Vous recevrez une notification dès que votre compte sera validé.

Type de compte demandé : {{type_compte}}
Date de demande : {{date}}

Cordialement,
L'équipe BNRM`
  },
  user_validation: {
    subject: "Votre compte a été validé - BNRM",
    body: `Bonjour {{nom}},

Nous avons le plaisir de vous informer que votre compte a été validé avec succès.

Vous pouvez désormais vous connecter à notre portail et accéder à l'ensemble des services correspondant à votre profil.

Lien de connexion : {{lien_connexion}}

Cordialement,
L'équipe BNRM`
  },
  user_rejection: {
    subject: "Votre demande d'inscription n'a pas été acceptée - BNRM",
    body: `Bonjour {{nom}},

Nous avons examiné votre demande d'inscription et nous sommes au regret de vous informer qu'elle n'a pas pu être acceptée.

Motif : {{motif_rejet}}

Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez soumettre une nouvelle demande, n'hésitez pas à nous contacter.

Cordialement,
L'équipe BNRM`
  },
  password_reset: {
    subject: "Réinitialisation de votre mot de passe - BNRM",
    body: `Bonjour {{nom}},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
{{lien_reinitialisation}}

Ce lien expire dans 24 heures.

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

Cordialement,
L'équipe BNRM`
  },
  deposit_submission: {
    subject: "Confirmation de dépôt légal - BNRM",
    body: `Bonjour {{nom}},

Votre demande de dépôt légal a été enregistrée avec succès.

Référence : {{reference}}
Titre de l'œuvre : {{titre}}
Type : {{type_depot}}
Date de soumission : {{date}}

Votre demande sera examinée dans les plus brefs délais.

Cordialement,
L'équipe Dépôt Légal - BNRM`
  },
  deposit_validation: {
    subject: "Votre dépôt légal a été validé - BNRM",
    body: `Bonjour {{nom}},

Nous avons le plaisir de vous informer que votre dépôt légal a été validé.

Référence : {{reference}}
Titre : {{titre}}
Numéro attribué : {{numero}}

Vous pouvez consulter les détails dans votre espace personnel.

Cordialement,
L'équipe Dépôt Légal - BNRM`
  },
  deposit_rejection: {
    subject: "Votre dépôt légal nécessite des corrections - BNRM",
    body: `Bonjour {{nom}},

Votre demande de dépôt légal nécessite des corrections.

Référence : {{reference}}
Titre : {{titre}}

Observations : {{motif_rejet}}

Veuillez apporter les corrections nécessaires et soumettre à nouveau votre demande.

Cordialement,
L'équipe Dépôt Légal - BNRM`
  },
  number_attribution: {
    subject: "Attribution de numéro ISBN/ISSN - BNRM",
    body: `Bonjour {{nom}},

Un numéro a été attribué à votre publication.

Titre : {{titre}}
Type : {{type_numero}}
Numéro attribué : {{numero}}

Ce numéro est définitif et doit figurer sur tous les exemplaires de votre publication.

Cordialement,
L'équipe Dépôt Légal - BNRM`
  },
  booking_request: {
    subject: "Confirmation de demande de réservation - BNRM",
    body: `Bonjour {{nom}},

Votre demande de réservation a été enregistrée.

Espace : {{espace}}
Date : {{date_debut}} au {{date_fin}}
Événement : {{evenement}}
Participants : {{participants}}

Votre demande sera examinée et vous recevrez une confirmation sous 48h.

Cordialement,
L'équipe BNRM`
  },
  booking_approval: {
    subject: "Votre réservation est confirmée - BNRM",
    body: `Bonjour {{nom}},

Nous avons le plaisir de confirmer votre réservation.

Espace : {{espace}}
Date : {{date_debut}} au {{date_fin}}
Événement : {{evenement}}

Montant total : {{montant}} MAD

Veuillez vous présenter 30 minutes avant l'heure prévue.

Cordialement,
L'équipe BNRM`
  },
  booking_rejection: {
    subject: "Votre demande de réservation n'a pas été acceptée - BNRM",
    body: `Bonjour {{nom}},

Nous sommes au regret de vous informer que votre demande de réservation n'a pas pu être acceptée.

Espace demandé : {{espace}}
Date : {{date_debut}} au {{date_fin}}

Motif : {{motif_rejet}}

N'hésitez pas à soumettre une nouvelle demande pour d'autres dates.

Cordialement,
L'équipe BNRM`
  },
  cbm_adhesion_approval: {
    subject: "Votre adhésion au CBM est approuvée - BNRM",
    body: `Bonjour {{nom}},

Nous avons le plaisir de vous informer que votre demande d'adhésion au Catalogue Bibliographique Marocain a été approuvée.

Bibliothèque : {{bibliotheque}}
Type d'adhésion : {{type_adhesion}}

Vous pouvez maintenant accéder aux services du CBM depuis votre espace.

Cordialement,
L'équipe CBM - BNRM`
  },
  cbm_adhesion_rejection: {
    subject: "Votre demande d'adhésion au CBM - BNRM",
    body: `Bonjour {{nom}},

Votre demande d'adhésion au Catalogue Bibliographique Marocain n'a pas pu être acceptée.

Bibliothèque : {{bibliotheque}}
Motif : {{motif_rejet}}

N'hésitez pas à nous contacter pour plus d'informations.

Cordialement,
L'équipe CBM - BNRM`
  },
  cbm_formation_approval: {
    subject: "Votre demande de formation CBM est acceptée - BNRM",
    body: `Bonjour {{nom}},

Votre demande de formation a été acceptée.

Type de formation : {{type_formation}}
Organisme : {{organisme}}
Nombre de participants : {{participants}}

Notre équipe vous contactera prochainement pour planifier les sessions.

Cordialement,
L'équipe CBM - BNRM`
  }
};

const defaultChannels: NotificationChannel = {
  email: true,
  system: true,
  sms: false,
  whatsapp: false,
};

const defaultNotificationSettings: NotificationSettings = {
  // Inscriptions
  user_registration: { enabled: true, channels: { ...defaultChannels } },
  user_validation: { enabled: true, channels: { ...defaultChannels } },
  user_rejection: { enabled: true, channels: { ...defaultChannels } },
  password_reset: { enabled: true, channels: { email: true, system: false, sms: false, whatsapp: false } },
  
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
  system_maintenance: { enabled: true, channels: { email: true, system: true, sms: false, whatsapp: false } },
  new_content_published: { enabled: true, channels: { ...defaultChannels } },
};

interface NotificationItemProps {
  id: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ReactNode;
  config: NotificationConfig;
  onChange: (id: keyof NotificationSettings, config: NotificationConfig) => void;
  templateKey?: keyof EmailTemplates;
  onEditTemplate?: (key: keyof EmailTemplates) => void;
}

function NotificationItem({ id, label, description, icon, config, onChange, templateKey, onEditTemplate }: NotificationItemProps) {
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
          
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-whatsapp`}
              checked={config.channels.whatsapp}
              onCheckedChange={(checked) => handleChannelChange("whatsapp", checked === true)}
            />
            <Label htmlFor={`${id}-whatsapp`} className="text-xs flex items-center gap-1 cursor-pointer">
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </Label>
          </div>
          
          {templateKey && onEditTemplate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-xs"
              onClick={() => onEditTemplate(templateKey)}
            >
              <FileEdit className="h-3 w-3 mr-1" />
              Modifier le texte
            </Button>
          )}
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
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(defaultWhatsAppSettings);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates>(defaultEmailTemplates);
  const [editingTemplate, setEditingTemplate] = useState<{ key: keyof EmailTemplates; template: EmailTemplate } | null>(null);

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

      // Fetch WhatsApp settings
      const { data: whatsappData, error: whatsappError } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "whatsapp_notification_settings");

      if (!whatsappError && whatsappData && whatsappData.length > 0) {
        const savedWhatsappSettings = JSON.parse(whatsappData[0].valeur);
        setWhatsappSettings({ ...defaultWhatsAppSettings, ...savedWhatsappSettings });
      }

      // Fetch email templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "email_templates");

      if (!templatesError && templatesData && templatesData.length > 0) {
        const savedTemplates = JSON.parse(templatesData[0].valeur);
        setEmailTemplates({ ...defaultEmailTemplates, ...savedTemplates });
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

      // Save WhatsApp settings
      const { error: whatsappError } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "whatsapp_notification_settings",
          valeur: JSON.stringify(whatsappSettings),
          commentaire: "Paramètres WhatsApp Business",
        }, {
          onConflict: "parametre"
        });

      if (whatsappError) throw whatsappError;

      // Save email templates
      const { error: templatesError } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "email_templates",
          valeur: JSON.stringify(emailTemplates),
          commentaire: "Templates email des notifications",
        }, {
          onConflict: "parametre"
        });

      if (templatesError) throw templatesError;

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

  const handleWhatsappSettingsChange = (field: keyof WhatsAppSettings, value: any) => {
    setWhatsappSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTemplate = (key: keyof EmailTemplates) => {
    setEditingTemplate({ key, template: { ...emailTemplates[key] } });
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setEmailTemplates(prev => ({
        ...prev,
        [editingTemplate.key]: editingTemplate.template
      }));
      setEditingTemplate(null);
      toast({
        title: "Template modifié",
        description: "N'oubliez pas d'enregistrer les paramètres pour sauvegarder les modifications.",
      });
    }
  };

  const handleResetTemplate = (key: keyof EmailTemplates) => {
    setEmailTemplates(prev => ({
      ...prev,
      [key]: defaultEmailTemplates[key]
    }));
    toast({
      title: "Template réinitialisé",
      description: "Le template a été restauré à sa valeur par défaut.",
    });
  };

  const templateLabels: Record<keyof EmailTemplates, string> = {
    user_registration: "Inscription reçue",
    user_validation: "Compte validé",
    user_rejection: "Inscription rejetée",
    password_reset: "Réinitialisation mot de passe",
    deposit_submission: "Dépôt légal soumis",
    deposit_validation: "Dépôt légal validé",
    deposit_rejection: "Dépôt légal rejeté",
    number_attribution: "Attribution numéro ISBN/ISSN",
    booking_request: "Réservation demandée",
    booking_approval: "Réservation approuvée",
    booking_rejection: "Réservation rejetée",
    cbm_adhesion_approval: "Adhésion CBM approuvée",
    cbm_adhesion_rejection: "Adhésion CBM rejetée",
    cbm_formation_approval: "Formation CBM approuvée",
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
        
        {/* Info: lien vers la configuration SMTP */}
        <Alert className="mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <span className="font-medium">Configuration du serveur SMTP :</span>{" "}
            Les notifications par email utilisent la configuration définie dans{" "}
            <Link 
              to="/admin/settings" 
              className="inline-flex items-center gap-1 font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
            >
              Paramètres système → Configuration Notification Mail
              <ExternalLink className="h-3 w-3" />
            </Link>
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        {/* Dialog pour éditer un template */}
        <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Modifier le template email
              </DialogTitle>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sujet de l'email</Label>
                  <Input
                    value={editingTemplate.template.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, subject: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Corps du message</Label>
                  <Textarea
                    value={editingTemplate.template.body}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, body: e.target.value }
                    })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Variables disponibles :</strong> Utilisez la syntaxe {"{{variable}}"} pour insérer des valeurs dynamiques.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Exemples : {"{{nom}}"}, {"{{email}}"}, {"{{date}}"}, {"{{reference}}"}, {"{{titre}}"}, {"{{motif_rejet}}"}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Appliquer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
              Config SMS/WhatsApp
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
                templateKey="user_registration"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="user_validation"
                label="Validation de compte"
                description="Notifier l'utilisateur lorsque son compte est validé"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.user_validation}
                onChange={handleNotificationChange}
                templateKey="user_validation"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="user_rejection"
                label="Rejet d'inscription"
                description="Notifier l'utilisateur lorsque son inscription est rejetée"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.user_rejection}
                onChange={handleNotificationChange}
                templateKey="user_rejection"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="password_reset"
                label="Réinitialisation de mot de passe"
                description="Envoyer un email de réinitialisation de mot de passe"
                icon={<Mail className="h-4 w-4 text-blue-600" />}
                config={settings.password_reset}
                onChange={handleNotificationChange}
                templateKey="password_reset"
                onEditTemplate={handleEditTemplate}
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
                templateKey="deposit_submission"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="deposit_validation"
                label="Validation de dépôt"
                description="Notifier le déposant lorsque son dépôt est validé"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.deposit_validation}
                onChange={handleNotificationChange}
                templateKey="deposit_validation"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="deposit_rejection"
                label="Rejet de dépôt"
                description="Notifier le déposant en cas de rejet de son dépôt"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.deposit_rejection}
                onChange={handleNotificationChange}
                templateKey="deposit_rejection"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="number_attribution"
                label="Attribution de numéro"
                description="Notifier lors de l'attribution d'un numéro ISBN/ISSN"
                icon={<Hash className="h-4 w-4 text-blue-600" />}
                config={settings.number_attribution}
                onChange={handleNotificationChange}
                templateKey="number_attribution"
                onEditTemplate={handleEditTemplate}
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
                templateKey="booking_request"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="booking_approval"
                label="Approbation de réservation"
                description="Notifier le demandeur lorsque sa réservation est approuvée"
                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                config={settings.booking_approval}
                onChange={handleNotificationChange}
                templateKey="booking_approval"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="booking_rejection"
                label="Rejet de réservation"
                description="Notifier le demandeur lorsque sa réservation est rejetée"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                config={settings.booking_rejection}
                onChange={handleNotificationChange}
                templateKey="booking_rejection"
                onEditTemplate={handleEditTemplate}
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
                templateKey="cbm_adhesion_approval"
                onEditTemplate={handleEditTemplate}
              />
              <NotificationItem
                id="cbm_formation_request"
                label="Demande de formation"
                description="Notifier les administrateurs lors d'une nouvelle demande de formation"
                icon={<ClipboardCheck className="h-4 w-4 text-blue-600" />}
                config={settings.cbm_formation_request}
                onChange={handleNotificationChange}
                templateKey="cbm_formation_approval"
                onEditTemplate={handleEditTemplate}
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

          {/* Configuration SMS / WhatsApp */}
          <TabsContent value="sms" className="space-y-6">
            {/* ===== Section SMS ===== */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Configuration SMS
            </h3>
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
                    </div>
                  </div>

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
                        Max 11 caractères alphanumériques
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
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Configuration API SMS</Label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Clé API {smsSettings.provider.charAt(0).toUpperCase() + smsSettings.provider.slice(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          {smsSettings.api_key_configured 
                            ? "✓ Configurée dans les secrets Supabase" 
                            : "⚠ Non configurée"}
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
                      <p><strong>Variables requises :</strong></p>
                      {smsSettings.provider === 'twilio' && <p>• TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN</p>}
                      {smsSettings.provider === 'infobip' && <p>• INFOBIP_API_KEY, INFOBIP_BASE_URL</p>}
                      {smsSettings.provider === 'orange' && <p>• ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET</p>}
                      {smsSettings.provider === 'custom' && <p>• SMS_API_URL, SMS_API_KEY</p>}
                    </div>
                  </div>

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

            <Separator className="my-6" />

            {/* ===== Section WhatsApp ===== */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Configuration WhatsApp
            </h3>
            <div className="space-y-6">
              {/* Activation globale WhatsApp */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Activer les notifications WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Permet l'envoi de messages WhatsApp pour les notifications configurées
                    </p>
                  </div>
                </div>
                <Switch
                  checked={whatsappSettings.enabled}
                  onCheckedChange={(checked) => handleWhatsappSettingsChange('enabled', checked)}
                />
              </div>

              {!whatsappSettings.enabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Les notifications WhatsApp sont désactivées. Activez-les pour configurer la connexion ci-dessous.
                  </AlertDescription>
                </Alert>
              )}

              {whatsappSettings.enabled && (
                <div className="space-y-6">
                  {/* QR Code de connexion */}
                  <div className="p-6 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Connecter WhatsApp</h4>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Scannez le QR code ci-dessous avec votre téléphone pour lier votre compte WhatsApp Business
                        </p>
                      </div>

                      {/* QR Code généré */}
                      <div className="relative p-4 bg-white rounded-2xl shadow-lg border">
                        <div className="w-64 h-64 flex items-center justify-center">
                          {whatsappSettings.connected ? (
                            <div className="flex flex-col items-center gap-3">
                              <CheckCircle className="h-16 w-16 text-green-500" />
                              <p className="text-sm font-medium text-green-700">Connecté</p>
                            </div>
                          ) : (
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                                `whatsapp-bnrm-session:${whatsappSettings.session_id || 'bnrm-' + Date.now()}`
                              )}&format=svg&ecc=M`}
                              alt="QR Code WhatsApp"
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="text-sm text-muted-foreground space-y-2 max-w-sm">
                        <p className="font-medium text-foreground">Comment scanner :</p>
                        <ol className="list-decimal list-inside space-y-1 text-left">
                          <li>Ouvrez <span className="font-medium">WhatsApp</span> sur votre téléphone</li>
                          <li>Allez dans <span className="font-medium">Paramètres → Appareils liés</span></li>
                          <li>Appuyez sur <span className="font-medium">Lier un appareil</span></li>
                          <li>Scannez ce QR code avec votre caméra</li>
                        </ol>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex items-center gap-3 pt-2">
                        {whatsappSettings.connected ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              handleWhatsappSettingsChange('connected', false);
                              handleWhatsappSettingsChange('session_id', '');
                              toast({
                                title: "WhatsApp déconnecté",
                                description: "La session WhatsApp a été déconnectée.",
                              });
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Déconnecter
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              handleWhatsappSettingsChange('session_id', 'bnrm-' + Date.now());
                              toast({
                                title: "QR Code régénéré",
                                description: "Un nouveau QR code a été généré. Scannez-le avec WhatsApp.",
                              });
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Régénérer le QR Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statut de connexion */}
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${whatsappSettings.connected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {whatsappSettings.connected ? 'WhatsApp connecté' : 'En attente de connexion'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {whatsappSettings.connected 
                              ? `Nom : ${whatsappSettings.display_name || 'BNRM'}` 
                              : 'Scannez le QR code pour connecter votre compte'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nom d'affichage */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-display-name">Nom d'affichage</Label>
                      <Input
                        id="whatsapp-display-name"
                        value={whatsappSettings.display_name}
                        onChange={(e) => handleWhatsappSettingsChange('display_name', e.target.value)}
                        placeholder="BNRM"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nom affiché dans les conversations WhatsApp
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone">Numéro WhatsApp</Label>
                      <Input
                        id="whatsapp-phone"
                        value={whatsappSettings.phone_number}
                        onChange={(e) => handleWhatsappSettingsChange('phone_number', e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                      />
                      <p className="text-xs text-muted-foreground">
                        Numéro associé au compte WhatsApp Business
                      </p>
                    </div>
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
