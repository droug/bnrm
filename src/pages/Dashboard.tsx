import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, Clock, Library, User, Settings, LogOut, Shield } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const [stats, setStats] = useState({
    totalManuscripts: 0,
    totalCollections: 0,
    pendingRequests: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    const [manuscriptsRes, collectionsRes, requestsRes, usersRes] = await Promise.all([
      supabase.from('manuscripts').select('id', { count: 'exact', head: true }),
      supabase.from('collections').select('id', { count: 'exact', head: true }),
      supabase.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      totalManuscripts: manuscriptsRes.count || 0,
      totalCollections: collectionsRes.count || 0,
      pendingRequests: requestsRes.count || 0,
      totalUsers: usersRes.count || 0
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Portail BNRM</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
              <Badge variant={getRoleBadgeVariant(profile?.role)}>
                {getRoleLabel(profile?.role)}
              </Badge>
            </div>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            <PermissionGuard permission="users.view">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/users'}>
                <Shield className="h-4 w-4" />
              </Button>
            </PermissionGuard>
            
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue, {profile?.first_name} !
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez et consultez les ressources de la Bibliothèque Nationale du Royaume du Maroc
          </p>
          
          {!profile?.is_approved && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Compte en attente d'approbation
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Votre compte est en cours de vérification par nos équipes. Vous recevrez une notification une fois approuvé.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manuscrits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalManuscripts}</div>
              <p className="text-xs text-muted-foreground">
                Total des manuscrits disponibles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCollections}</div>
              <p className="text-xs text-muted-foreground">
                Collections organisées
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                En attente de traitement
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Comptes enregistrés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Consulter les manuscrits</span>
              </CardTitle>
              <CardDescription>
                Parcourez notre collection de manuscrits historiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/manuscripts'}>
                Accéder aux manuscrits
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Faire une demande</span>
              </CardTitle>
              <CardDescription>
                Demander l'accès à un manuscrit ou une reproduction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/access-request'}>
                Nouvelle demande
              </Button>
            </CardContent>
          </Card>
          
          
          <PermissionGuard permission="manuscripts.create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Gestion de contenu</span>
                </CardTitle>
                <CardDescription>
                  Créer et gérer actualités, événements et expositions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/content'}>
                  Gérer le contenu
                </Button>
              </CardContent>
            </Card>
          </PermissionGuard>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Mon profil</span>
              </CardTitle>
              <CardDescription>
                Gérer mes informations personnelles et préférences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/profile'}>
                Modifier le profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}