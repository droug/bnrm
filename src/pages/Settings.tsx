import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Key,
  Mail,
  Smartphone
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";

const SettingsPage = () => {
  const { language, setLanguage } = useLanguage();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    newsletter: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: language,
    timezone: 'Africa/Casablanca',
    itemsPerPage: 20
  });

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Settings - Configuration", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Paramètres</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 p-6 bg-gradient-primary rounded-lg text-primary-foreground shadow-moroccan">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-primary-foreground/80">
                    Gérez vos préférences et paramètres de compte
                  </p>
                </div>
              </div>

              {/* Settings Tabs */}
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Affichage
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sécurité
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Modifiez vos informations de base et préférences de contact
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input 
                            id="firstName" 
                            defaultValue={profile?.first_name || ""} 
                            className="border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input 
                            id="lastName" 
                            defaultValue={profile?.last_name || ""} 
                            className="border-border focus:border-primary"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input 
                          id="institution" 
                          defaultValue={profile?.institution || ""} 
                          placeholder="Université, Centre de recherche..."
                          className="border-border focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="researchField">Domaine de recherche</Label>
                        <Input 
                          id="researchField" 
                          defaultValue={profile?.research_field || ""} 
                          placeholder="Histoire, Littérature, Sciences..."
                          className="border-border focus:border-primary"
                        />
                      </div>

                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer les modifications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Préférences de notifications</CardTitle>
                      <CardDescription>
                        Choisissez comment vous souhaitez être informé des activités
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="email-notifications" className="text-base font-medium">
                                Notifications par email
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Recevez des mises à jour importantes par email
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notifications.email}
                            onCheckedChange={(checked) => 
                              setNotifications(prev => ({ ...prev, email: checked }))
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-accent" />
                            <div>
                              <Label htmlFor="push-notifications" className="text-base font-medium">
                                Notifications push
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Notifications instantanées sur votre navigateur
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={notifications.push}
                            onCheckedChange={(checked) => 
                              setNotifications(prev => ({ ...prev, push: checked }))
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-highlight" />
                            <div>
                              <Label htmlFor="sms-notifications" className="text-base font-medium">
                                Notifications SMS
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Messages importants sur votre téléphone
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={notifications.sms}
                            onCheckedChange={(checked) => 
                              setNotifications(prev => ({ ...prev, sms: checked }))
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gold" />
                            <div>
                              <Label htmlFor="newsletter" className="text-base font-medium">
                                Newsletter BNRM
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Actualités, événements et nouvelles collections
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="newsletter"
                            checked={notifications.newsletter}
                            onCheckedChange={(checked) => 
                              setNotifications(prev => ({ ...prev, newsletter: checked }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Préférences d'affichage</CardTitle>
                      <CardDescription>
                        Personnalisez l'apparence et le comportement de l'interface
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Thème</Label>
                          <Select 
                            value={preferences.theme} 
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">
                                <div className="flex items-center">
                                  <Sun className="h-4 w-4 mr-2" />
                                  Clair
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center">
                                  <Moon className="h-4 w-4 mr-2" />
                                  Sombre
                                </div>
                              </SelectItem>
                              <SelectItem value="system">
                                <div className="flex items-center">
                                  <Monitor className="h-4 w-4 mr-2" />
                                  Système
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Langue</Label>
                          <Select 
                            value={language} 
                            onValueChange={setLanguage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Français
                                </div>
                              </SelectItem>
                              <SelectItem value="ar">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  العربية
                                </div>
                              </SelectItem>
                              <SelectItem value="ber">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  ⵜⴰⵎⴰⵣⵉⵖⵜ
                                </div>
                              </SelectItem>
                              <SelectItem value="en">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  English
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Fuseau horaire</Label>
                          <Select 
                            value={preferences.timezone} 
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Africa/Casablanca">Maroc (GMT+1)</SelectItem>
                              <SelectItem value="Europe/Paris">France (GMT+1)</SelectItem>
                              <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Éléments par page</Label>
                          <Select 
                            value={preferences.itemsPerPage.toString()} 
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 éléments</SelectItem>
                              <SelectItem value="20">20 éléments</SelectItem>
                              <SelectItem value="50">50 éléments</SelectItem>
                              <SelectItem value="100">100 éléments</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Sécurité du compte</CardTitle>
                      <CardDescription>
                        Gérez la sécurité et l'accès à votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Key className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">Mot de passe</h4>
                              <p className="text-sm text-muted-foreground">
                                Dernière modification il y a 30 jours
                              </p>
                            </div>
                          </div>
                          <Button variant="outline">
                            Modifier
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-accent" />
                            <div>
                              <h4 className="font-medium">Authentification à deux facteurs</h4>
                              <p className="text-sm text-muted-foreground">
                                Sécurisez votre compte avec une couche supplémentaire
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Désactivé</Badge>
                            <Button variant="outline">
                              Activer
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-highlight" />
                            <div>
                              <h4 className="font-medium">Sessions actives</h4>
                              <p className="text-sm text-muted-foreground">
                                Gérez les appareils connectés à votre compte
                              </p>
                            </div>
                          </div>
                          <Button variant="outline">
                            Voir les sessions
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
};

export default SettingsPage;