import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Globe, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AccountSettings() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState({
    email: true,
    newContent: true,
    loanReminders: true,
    newsletter: false,
  });
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    researchField: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (profile) {
      setProfileData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user.email || "",
        institution: profile.institution || "",
        researchField: profile.research_field || "",
      });
    }
  }, [user, profile, navigate]);

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          institution: profileData.institution,
          research_field: profileData.researchField,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "La modification du mot de passe sera bientôt disponible",
    });
  };

  if (!user) return null;

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Paramètres du compte</h1>
          <p className="text-lg text-muted-foreground">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Globe className="h-4 w-4" />
              Préférences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Votre prénom" 
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Votre nom" 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={profileData.email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input 
                    id="institution" 
                    placeholder="Université, école, etc." 
                    value={profileData.institution}
                    onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research">Domaine de recherche</Label>
                  <Input 
                    id="research" 
                    placeholder="Histoire, littérature, etc." 
                    value={profileData.researchField}
                    onChange={(e) => setProfileData({ ...profileData, researchField: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveProfile}>Enregistrer les modifications</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe et sécurité</CardTitle>
                <CardDescription>Gérez votre mot de passe et paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input id="confirmPassword" type="password" />
                </div>

                <Button onClick={handleChangePassword}>Changer le mot de passe</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être informé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifs">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des emails de notification</p>
                  </div>
                  <Switch
                    id="emailNotifs"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newContent">Nouveaux contenus</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les nouveaux documents
                    </p>
                  </div>
                  <Switch
                    id="newContent"
                    checked={notifications.newContent}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newContent: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loanReminders">Rappels d'emprunt</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications avant expiration d'emprunt
                    </p>
                  </div>
                  <Switch
                    id="loanReminders"
                    checked={notifications.loanReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, loanReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir la newsletter mensuelle
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newsletter: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Préférences d'interface</CardTitle>
                <CardDescription>Personnalisez votre expérience de lecture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Langue de l'interface</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="amz">ⵜⴰⵎⴰⵣⵉⵖⵜ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "light" ? (
                      <Sun className="h-5 w-5 text-primary" />
                    ) : (
                      <Moon className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <Label>Thème d'affichage</Label>
                      <p className="text-sm text-muted-foreground">Mode clair ou sombre</p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Résultats par page</Label>
                  <Select defaultValue="20">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
