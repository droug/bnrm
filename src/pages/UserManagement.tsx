import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Users, CheckCircle, XCircle, Clock, Settings, User, Mail, Phone, Building, Calendar, UserCheck, UserX, Edit, ArrowLeft, Home, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import SubscriptionPlansManager from "@/components/SubscriptionPlansManager";
import AddInternalUserDialog from "@/components/AddInternalUserDialog";
import { EditUserDialog } from "@/components/EditUserDialog";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  institution: string;
  research_field: string;
  role: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  subscription_type?: string;
  partner_organization?: string;
  research_specialization?: string[];
  access_level_details?: any;
  profile_preferences?: any;
}

interface AccessRequest {
  id: string;
  user_id: string;
  manuscript_id: string;
  request_type: string;
  purpose: string;
  requested_date: string;
  status: string;
  notes: string;
  created_at: string;
  manuscripts: {
    title: string;
    author: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    institution: string;
  } | null;
}

const ROLE_PERMISSIONS = {
  public_user: {
    name: 'Grand Public',
    permissions: ['Consultation publique', 'Demandes limitées (5/mois)'],
    description: 'Accès de base aux ressources publiques',
    maxRequests: 5,
    accessLevel: 'basic'
  },
  subscriber: {
    name: 'Abonné Premium',
    permissions: ['Recherche avancée', 'Téléchargements illimités', 'Support prioritaire'],
    description: 'Accès premium avec fonctionnalités avancées',
    maxRequests: 100,
    accessLevel: 'premium'
  },
  researcher: {
    name: 'Chercheur',
    permissions: ['Demandes d\'accès étendues (50/mois)', 'Téléchargement', 'Recherche avancée'],
    description: 'Accès privilégié pour la recherche académique',
    maxRequests: 50,
    accessLevel: 'academic'
  },
  partner: {
    name: 'Partenaire Institutionnel',
    permissions: ['Accès prioritaire (200/mois)', 'Collaboration inter-institutionnelle', 'Projets spéciaux'],
    description: 'Accès privilégié pour les partenaires institutionnels',
    maxRequests: 200,
    accessLevel: 'institutional'
  },
  librarian: {
    name: 'Bibliothécaire',
    permissions: ['Gestion des manuscrits', 'Approbation des demandes', 'Gestion des collections'],
    description: 'Gestion des ressources et approbation des accès',
    maxRequests: 999,
    accessLevel: 'extended'
  },
  admin: {
    name: 'Administrateur',
    permissions: ['Gestion complète', 'Gestion des utilisateurs', 'Approbation des demandes'],
    description: 'Accès complet à toutes les fonctionnalités',
    maxRequests: 999,
    accessLevel: 'full'
  },
  visitor: {
    name: 'Visiteur (Legacy)',
    permissions: ['Consultation publique', 'Demandes basiques'],
    description: 'Ancien rôle - migrer vers Grand Public',
    maxRequests: 5,
    accessLevel: 'basic'
  }
};

export default function UserManagement() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("users");
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch all users - RLS will ensure only admins can see this data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, phone, institution, research_field, role, is_approved, created_at, updated_at, subscription_type, partner_organization, research_specialization, access_level_details, profile_preferences')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch pending access requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('access_requests')
        .select(`
          *,
          manuscripts:manuscript_id (title, author),
          profiles:user_id (first_name, last_name, institution)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setPendingRequests((requestsData as any) || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié avec succès",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  const updateUserApproval = async (userId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: isApproved ? "Utilisateur approuvé" : "Approbation révoquée",
        description: `L'utilisateur a été ${isApproved ? 'approuvé' : 'désapprouvé'} avec succès`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'approbation",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ 
          status, 
          approved_by: profile?.id,
          updated_at: new Date().toISOString() 
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Demande mise à jour",
        description: `La demande a été ${status === 'approved' ? 'approuvée' : 'rejetée'}`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la demande",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'librarian': return 'default';
      case 'partner': return 'default';
      case 'subscriber': return 'secondary';
      case 'researcher': return 'secondary';
      case 'public_user': return 'outline';
      case 'visitor': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Gestion des utilisateurs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Gestion des Droits et Permissions
              </h1>
              <p className="text-muted-foreground mt-2">
                Administration des utilisateurs, rôles et permissions
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Profils & Plans
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Demandes en attente
            </TabsTrigger>
          </TabsList>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestion des Utilisateurs
                    </CardTitle>
                    <CardDescription>
                      Gérez les rôles et approbations des utilisateurs
                    </CardDescription>
                  </div>
                  <AddInternalUserDialog onUserAdded={fetchData} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistiques des utilisateurs internes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Administrateurs</span>
                      </div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {users.filter(u => u.role === 'admin').length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Bibliothécaires</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {users.filter(u => u.role === 'librarian').length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Partenaires</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {users.filter(u => u.role === 'partner').length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Approuvés</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {users.filter(u => u.is_approved).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userProfile) => (
                        <TableRow key={userProfile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {['admin', 'librarian', 'partner'].includes(userProfile.role) && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" title="Utilisateur interne" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {userProfile.first_name} {userProfile.last_name}
                                  {['admin', 'librarian', 'partner'].includes(userProfile.role) && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Interne
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {userProfile.id.slice(0, 8)}...
                                </div>
                                {userProfile.partner_organization && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Partenaire: {userProfile.partner_organization}
                                  </div>
                                )}
                                {userProfile.subscription_type && (
                                  <div className="text-xs text-green-600 font-medium">
                                    Abonnement: {userProfile.subscription_type}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {userProfile.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {userProfile.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {userProfile.institution && (
                              <div className="flex items-center gap-1 text-sm">
                                <Building className="h-3 w-3" />
                                {userProfile.institution}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userProfile.role}
                              onValueChange={(value) => updateUserRole(userProfile.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public_user">Grand Public</SelectItem>
                                <SelectItem value="subscriber">Abonné Premium</SelectItem>
                                <SelectItem value="researcher">Chercheur</SelectItem>
                                <SelectItem value="partner">Partenaire Institutionnel</SelectItem>
                                <SelectItem value="librarian">Bibliothécaire</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                                <SelectItem value="visitor">Visiteur (Legacy)</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userProfile.is_approved ? "default" : "secondary"}>
                              {userProfile.is_approved ? "Approuvé" : "En attente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(userProfile.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {/* Bouton Modifier */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(userProfile);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {/* Boutons Approuver/Révoquer */}
                              {!userProfile.is_approved ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Approuver l'utilisateur</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir approuver cet utilisateur ? Il pourra accéder aux fonctionnalités selon son rôle.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => updateUserApproval(userProfile.id, true)}
                                      >
                                        Approuver
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Révoquer l'approbation</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir révoquer l'approbation de cet utilisateur ? Il perdra l'accès aux fonctionnalités.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => updateUserApproval(userProfile.id, false)}
                                      >
                                        Révoquer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              
                              {/* Bouton Supprimer */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? 
                                      Cette action est irréversible et supprimera toutes les données associées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(userProfile.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des permissions */}
          <TabsContent value="permissions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(ROLE_PERMISSIONS).map(([roleKey, roleData]) => (
                <Card key={roleKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{roleData.name}</span>
                      <Badge variant={getRoleBadgeVariant(roleKey)}>
                        {roleKey}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {roleData.description}
                    </CardDescription>
                  </CardHeader>
                   <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Demandes max/mois:</span>
                          <span className="font-medium">{roleData.maxRequests === 999 ? 'Illimité' : roleData.maxRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Niveau d'accès:</span>
                          <span className="font-medium capitalize">{roleData.accessLevel}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Permissions :</h4>
                        <ul className="space-y-1">
                          {roleData.permissions.map((permission) => (
                            <li key={permission} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profils et Plans d'abonnement */}
          <TabsContent value="plans" className="space-y-6">
            <SubscriptionPlansManager />
          </TabsContent>

          {/* Demandes en attente */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Demandes d'Accès en Attente
                </CardTitle>
                <CardDescription>
                  Gérez les demandes d'accès aux manuscrits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune demande en attente</h3>
                    <p className="text-muted-foreground">
                      Toutes les demandes ont été traitées.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              {request.manuscripts?.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              par {request.manuscripts?.author}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Demandeur: {request.profiles?.first_name} {request.profiles?.last_name}</span>
                              {request.profiles?.institution && (
                                <span>({request.profiles.institution})</span>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">{request.request_type}</Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm"><strong>Objet:</strong> {request.purpose}</p>
                          <p className="text-sm"><strong>Date demandée:</strong> {formatDate(request.requested_date)}</p>
                          {request.notes && (
                            <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Approuver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir approuver cette demande d'accès ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => updateRequestStatus(request.id, 'approved')}
                                >
                                  Approuver
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                Rejeter
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir rejeter cette demande d'accès ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => updateRequestStatus(request.id, 'rejected')}
                                >
                                  Rejeter
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogue de modification d'utilisateur */}
        <EditUserDialog
          user={editingUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUserUpdated={fetchData}
        />
      </main>
    </div>
  );
}