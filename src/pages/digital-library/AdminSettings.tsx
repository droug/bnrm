import { useState, useEffect } from "react";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useSecureRoles();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    // Connecteurs
    cbmEnabled: true,
    cbmApiUrl: "https://cbm.bnrm.ma/api",
    manuscriptsEnabled: true,
    manuscriptsApiUrl: "https://manuscripts.bnrm.ma/api",
    kitabEnabled: true,
    kitabApiUrl: "https://kitab.bnrm.ma/api",
    
    // OAI-PMH
    oaiEnabled: true,
    oaiBaseUrl: "https://oai.bnrm.ma",
    oaiSetSpec: "digital-library",
    oaiMetadataPrefix: "oai_dc",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    notificationEmail: "notifications@bnrm.ma",
    
    // Listes dynamiques
    documentsPerPage: "20",
    autoSuggestions: true,
    searchHistory: true,
  });

  const handleSave = async (section: string) => {
    try {
      toast({
        title: "Paramètres enregistrés",
        description: `Configuration ${section} mise à jour avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      });
    }
  };

  if (rolesLoading) {
    return (
      <AdminPageWrapper
        title="Paramètres techniques"
        description="Configuration des connecteurs, notifications et listes dynamiques"
        icon="mdi:cog-outline"
        iconColor="text-gray-600"
        iconBgColor="bg-gray-500/10"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <SEOHead
        title="Paramètres techniques - Administration BN"
        description="Configuration des connecteurs, notifications et listes dynamiques"
        noindex={true}
      />
      <AdminPageWrapper
        title="Paramètres techniques"
        description="Configuration des connecteurs, notifications et listes dynamiques de la bibliothèque numérique"
        icon="mdi:cog-outline"
        iconColor="text-gray-600"
        iconBgColor="bg-gray-500/10"
      >
        <Tabs defaultValue="connectors" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="connectors" className="gap-2">
              <Icon icon="mdi:link-variant" className="h-4 w-4" />
              Connecteurs
            </TabsTrigger>
            <TabsTrigger value="oai" className="gap-2">
              <Icon icon="mdi:database-outline" className="h-4 w-4" />
              OAI-PMH
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Icon icon="mdi:bell-outline" className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <Icon icon="mdi:format-list-bulleted" className="h-4 w-4" />
              Listes dynamiques
            </TabsTrigger>
          </TabsList>

          {/* Connecteurs Tab */}
          <TabsContent value="connectors">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
                <CardTitle>Connecteurs externes</CardTitle>
                <CardDescription>
                  Configuration des connexions avec CBM, Manuscrits et Kitab
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* CBM Connector */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Connecteur CBM</h3>
                      <p className="text-sm text-muted-foreground">
                        Consortium des Bibliothèques Marocaines
                      </p>
                    </div>
                    <Switch
                      checked={settings.cbmEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, cbmEnabled: checked })
                      }
                    />
                  </div>
                  {settings.cbmEnabled && (
                    <div className="space-y-2">
                      <Label>URL de l'API CBM</Label>
                      <Input
                        value={settings.cbmApiUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, cbmApiUrl: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Manuscripts Connector */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Connecteur Manuscrits</h3>
                      <p className="text-sm text-muted-foreground">
                        Plateforme des manuscrits
                      </p>
                    </div>
                    <Switch
                      checked={settings.manuscriptsEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, manuscriptsEnabled: checked })
                      }
                    />
                  </div>
                  {settings.manuscriptsEnabled && (
                    <div className="space-y-2">
                      <Label>URL de l'API Manuscrits</Label>
                      <Input
                        value={settings.manuscriptsApiUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, manuscriptsApiUrl: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Kitab Connector */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Connecteur Kitab</h3>
                      <p className="text-sm text-muted-foreground">
                        Plateforme du livre marocain
                      </p>
                    </div>
                    <Switch
                      checked={settings.kitabEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, kitabEnabled: checked })
                      }
                    />
                  </div>
                  {settings.kitabEnabled && (
                    <div className="space-y-2">
                      <Label>URL de l'API Kitab</Label>
                      <Input
                        value={settings.kitabApiUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, kitabApiUrl: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                <Button onClick={() => handleSave("connecteurs")} className="bg-bn-blue-primary hover:bg-bn-blue-dark">
                  <Icon icon="mdi:content-save-outline" className="h-4 w-4 mr-2" />
                  Enregistrer les connecteurs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OAI-PMH Tab */}
          <TabsContent value="oai">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
                <CardTitle>Configuration OAI-PMH</CardTitle>
                <CardDescription>
                  Paramètres pour la moisson et l'exposition des métadonnées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Activer OAI-PMH</h3>
                    <p className="text-sm text-muted-foreground">
                      Permettre la moisson des métadonnées
                    </p>
                  </div>
                  <Switch
                    checked={settings.oaiEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, oaiEnabled: checked })
                    }
                  />
                </div>

                {settings.oaiEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>URL de base OAI-PMH</Label>
                      <Input
                        value={settings.oaiBaseUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, oaiBaseUrl: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Exemple: https://oai.bnrm.ma
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Set Spec</Label>
                      <Input
                        value={settings.oaiSetSpec}
                        onChange={(e) =>
                          setSettings({ ...settings, oaiSetSpec: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Identifiant du set pour le filtrage
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Préfixe de métadonnées</Label>
                      <Select
                        value={settings.oaiMetadataPrefix}
                        onValueChange={(value) =>
                          setSettings({ ...settings, oaiMetadataPrefix: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oai_dc">Dublin Core (oai_dc)</SelectItem>
                          <SelectItem value="marc21">MARC21</SelectItem>
                          <SelectItem value="mods">MODS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button onClick={() => handleSave("OAI-PMH")} className="bg-bn-blue-primary hover:bg-bn-blue-dark">
                  <Icon icon="mdi:content-save-outline" className="h-4 w-4 mr-2" />
                  Enregistrer la configuration OAI
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
                <CardTitle>Paramètres de notification</CardTitle>
                <CardDescription>
                  Configurer les alertes et notifications système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Notifications par email</h3>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications par email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                {settings.emailNotifications && (
                  <div className="space-y-2">
                    <Label>Email de notification</Label>
                    <Input
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, notificationEmail: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Notifications SMS</h3>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des alertes par SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, smsNotifications: checked })
                    }
                  />
                </div>

                <Button onClick={() => handleSave("notifications")} className="bg-bn-blue-primary hover:bg-bn-blue-dark">
                  <Icon icon="mdi:content-save-outline" className="h-4 w-4 mr-2" />
                  Enregistrer les notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Lists Tab */}
          <TabsContent value="lists">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
                <CardTitle>Listes dynamiques</CardTitle>
                <CardDescription>
                  Configuration des listes et suggestions automatiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>Documents par page</Label>
                  <Select
                    value={settings.documentsPerPage}
                    onValueChange={(value) =>
                      setSettings({ ...settings, documentsPerPage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Auto-suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Activer les suggestions automatiques de recherche
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSuggestions}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoSuggestions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Historique de recherche</h3>
                    <p className="text-sm text-muted-foreground">
                      Sauvegarder l'historique des recherches
                    </p>
                  </div>
                  <Switch
                    checked={settings.searchHistory}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, searchHistory: checked })
                    }
                  />
                </div>

                <div className="p-4 border rounded-lg bg-accent/20">
                  <h3 className="font-semibold mb-2">Gestion des listes système</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gérer les listes de valeurs utilisées dans l'application (langues, types de documents, etc.)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/system-lists")}
                  >
                    Accéder aux listes système
                  </Button>
                </div>

                <Button onClick={() => handleSave("listes dynamiques")} className="bg-bn-blue-primary hover:bg-bn-blue-dark">
                  <Icon icon="mdi:content-save-outline" className="h-4 w-4 mr-2" />
                  Enregistrer les paramètres
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminPageWrapper>
    </>
  );
}
