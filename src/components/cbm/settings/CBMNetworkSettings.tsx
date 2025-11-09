import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Network, 
  Users, 
  Shield, 
  Database, 
  Bell,
  Save,
  Globe,
  Mail,
  Phone
} from "lucide-react";

export function CBMNetworkSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // États pour la configuration générale
  const [networkName, setNetworkName] = useState("Catalogue Bibliographique Marocain");
  const [networkCode, setNetworkCode] = useState("CBM");
  const [networkDescription, setNetworkDescription] = useState(
    "Réseau national des bibliothèques du Maroc"
  );
  const [contactEmail, setContactEmail] = useState("contact@cbm.ma");
  const [contactPhone, setContactPhone] = useState("+212 5 37 XX XX XX");
  const [websiteUrl, setWebsiteUrl] = useState("https://cbm.bnrm.ma");

  // États pour les paramètres membres
  const [autoApproval, setAutoApproval] = useState(false);
  const [requireValidation, setRequireValidation] = useState(true);
  const [maxPendingRequests, setMaxPendingRequests] = useState("50");
  const [membershipDuration, setMembershipDuration] = useState("12");

  // États pour la sécurité
  const [enableMFA, setEnableMFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordComplexity, setPasswordComplexity] = useState("medium");
  const [enableAuditLog, setEnableAuditLog] = useState(true);

  // États pour les notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [notifyNewAdhesion, setNotifyNewAdhesion] = useState(true);
  const [notifyNewFormation, setNotifyNewFormation] = useState(true);

  const handleSaveGeneral = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres généraux ont été mis à jour avec succès.",
    });
  };

  const handleSaveMembers = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres des membres ont été mis à jour avec succès.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de sécurité ont été mis à jour avec succès.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de notifications ont été mis à jour avec succès.",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
          Configuration Réseau CBM
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez les paramètres et la configuration du réseau des bibliothèques
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Membres</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Informations du Réseau
              </CardTitle>
              <CardDescription>
                Paramètres généraux du réseau CBM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="networkName">Nom du réseau</Label>
                  <Input
                    id="networkName"
                    value={networkName}
                    onChange={(e) => setNetworkName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="networkCode">Code du réseau</Label>
                  <Input
                    id="networkCode"
                    value={networkCode}
                    onChange={(e) => setNetworkCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={networkDescription}
                  onChange={(e) => setNetworkDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email de contact
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Site web
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Membres */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Membres
              </CardTitle>
              <CardDescription>
                Configuration des adhésions et des membres du réseau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApproval">Approbation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Approuver automatiquement les nouvelles demandes d'adhésion
                    </p>
                  </div>
                  <Switch
                    id="autoApproval"
                    checked={autoApproval}
                    onCheckedChange={setAutoApproval}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireValidation">Validation requise</Label>
                    <p className="text-sm text-muted-foreground">
                      Nécessite une validation manuelle pour les adhésions
                    </p>
                  </div>
                  <Switch
                    id="requireValidation"
                    checked={requireValidation}
                    onCheckedChange={setRequireValidation}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxPending">Demandes en attente (max)</Label>
                  <Input
                    id="maxPending"
                    type="number"
                    value={maxPendingRequests}
                    onChange={(e) => setMaxPendingRequests(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée d'adhésion (mois)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={membershipDuration}
                    onChange={(e) => setMembershipDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveMembers} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité et Authentification
              </CardTitle>
              <CardDescription>
                Configuration de la sécurité du réseau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="mfa">Authentification multi-facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la double authentification pour tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="mfa"
                    checked={enableMFA}
                    onCheckedChange={setEnableMFA}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit">Journal d'audit</Label>
                    <p className="text-sm text-muted-foreground">
                      Enregistrer toutes les actions importantes
                    </p>
                  </div>
                  <Switch
                    id="audit"
                    checked={enableAuditLog}
                    onCheckedChange={setEnableAuditLog}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout de session (minutes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complexité du mot de passe</Label>
                  <CustomSelect
                    value={passwordComplexity}
                    onValueChange={setPasswordComplexity}
                    options={[
                      { value: "low", label: "Faible" },
                      { value: "medium", label: "Moyenne" },
                      { value: "high", label: "Élevée" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Paramètres de Notifications
              </CardTitle>
              <CardDescription>
                Configuration des alertes et notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotif">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par email
                    </p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotif">Notifications par SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par SMS
                    </p>
                  </div>
                  <Switch
                    id="smsNotif"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifAdhesion">Nouvelles adhésions</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié des nouvelles demandes d'adhésion
                    </p>
                  </div>
                  <Switch
                    id="notifAdhesion"
                    checked={notifyNewAdhesion}
                    onCheckedChange={setNotifyNewAdhesion}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifFormation">Nouvelles formations</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié des nouvelles demandes de formation
                    </p>
                  </div>
                  <Switch
                    id="notifFormation"
                    checked={notifyNewFormation}
                    onCheckedChange={setNotifyNewFormation}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
