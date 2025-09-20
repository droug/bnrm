import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building, GraduationCap, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    institution: profile?.institution || "",
    research_field: profile?.research_field || "",
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await updateProfile(formData);
      if (!error) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'librarian': return 'default';
      case 'researcher': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'librarian': return 'Bibliothécaire';
      case 'researcher': return 'Chercheur';
      default: return 'Visiteur';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            Mon Profil
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="space-y-6">
          {/* Informations du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Informations du compte
              </CardTitle>
              <CardDescription>
                Statut et informations de base de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Rôle</span>
                </div>
                <Badge variant={getRoleBadgeVariant(profile?.role)}>
                  {getRoleLabel(profile?.role)}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Statut d'approbation</span>
                </div>
                <Badge variant={profile?.is_approved ? "default" : "secondary"}>
                  {profile?.is_approved ? "Approuvé" : "En attente"}
                </Badge>
              </div>

              {!profile?.is_approved && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Votre compte est en cours de vérification. Vous recevrez une notification une fois approuvé.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de profil */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et professionnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+212 ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      className="pl-10"
                      placeholder="Université, organisation..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research_field">Domaine de recherche</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Textarea
                      id="research_field"
                      value={formData.research_field}
                      onChange={(e) => handleInputChange('research_field', e.target.value)}
                      className="pl-10 min-h-[80px]"
                      placeholder="Décrivez votre domaine de recherche ou d'intérêt..."
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}