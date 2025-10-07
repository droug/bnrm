import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, Clock, Library, LogOut, Settings, Cog, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import logoBnrm from "@/assets/logo-bnrm.png";

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
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
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Dashboard - Accès Protégé", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <img src={logoBnrm} alt="Logo BNRM" className="h-8 w-auto object-contain" />
              <span className="text-xl font-bold">Portail BNRM</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
              <Badge variant={getRoleBadgeVariant(profile?.role)}>
                {getRoleLabel(profile?.role)}
              </Badge>
            </div>
            
            <UserProfileDialog />
            
            <PermissionGuard permission="users.manage">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')}>
                      <Cog className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Paramétrage</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Administration et Paramétrage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
              <Button className="w-full" onClick={() => navigate('/manuscripts')}>
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
              <Button className="w-full" variant="outline" onClick={() => navigate('/access-request')}>
                Nouvelle demande
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Library className="h-5 w-5" />
                <span>Explorer les collections</span>
              </CardTitle>
              <CardDescription>
                Découvrez nos collections thématiques organisées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate('/collections')}>
                Voir les collections
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Quick Actions */}
        <PermissionGuard permission="requests.manage">
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Actions Administrateur</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Demandes d'accès</span>
                  </CardTitle>
                  <CardDescription>
                    Gérer les demandes d'accès en attente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">En attente</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      {stats.pendingRequests}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                    onClick={() => navigate('/admin/access-requests')}
                  >
                    Gérer les demandes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Gestion utilisateurs</span>
                  </CardTitle>
                  <CardDescription>
                    Administrer les comptes utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      {stats.totalUsers}
                    </Badge>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/users')}>
                    Gérer les utilisateurs
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <span>Administration</span>
                  </CardTitle>
                  <CardDescription>
                    Accéder aux paramètres système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/settings')}>
                    Paramètres admin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionGuard>
      </main>
      </div>
    </WatermarkContainer>
  );
}