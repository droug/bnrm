import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Monitor, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UserProfileDialog() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    newsletter: true
  });
  
  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "fr",
    timezone: "Africa/Casablanca",
    itemsPerPage: "20"
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Gérez vos préférences et paramètres de compte</span>
          </DialogTitle>
          <DialogDescription>
            Personnalisez votre expérience utilisateur et gérez vos paramètres de sécurité
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Affichage</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" defaultValue={profile?.first_name} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" defaultValue={profile?.last_name} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" defaultValue={profile?.institution} />
                </div>
                <div>
                  <Label htmlFor="researchField">Domaine de recherche</Label>
                  <Input id="researchField" defaultValue={profile?.research_field} />
                </div>
                <Button>Sauvegarder les modifications</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir les notifications importantes par email</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">Recevoir les notifications dans le navigateur</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Recevoir les notifications urgentes par SMS</p>
                  </div>
                  <Switch 
                    checked={notifications.sms} 
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Newsletter</Label>
                    <p className="text-sm text-muted-foreground">Recevoir la newsletter mensuelle</p>
                  </div>
                  <Switch 
                    checked={notifications.newsletter} 
                    onCheckedChange={(checked) => setNotifications({...notifications, newsletter: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences d'affichage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Thème</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Langue</Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fuseau horaire</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => setPreferences({...preferences, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Éléments par page</Label>
                  <Select value={preferences.itemsPerPage} onValueChange={(value) => setPreferences({...preferences, itemsPerPage: value})}>
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

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">Dernière modification: il y a 30 jours</p>
                    </div>
                    <Button variant="outline" size="sm">Modifier</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Authentification à deux facteurs</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">2FA désactivée</p>
                      <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <Button variant="outline" size="sm">Activer</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sessions actives</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Session actuelle</p>
                        <p className="text-sm text-muted-foreground">Chrome sur Windows • Casablanca, Maroc</p>
                      </div>
                      <span className="text-sm text-green-600">Actuelle</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}