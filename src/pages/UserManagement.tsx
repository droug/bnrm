import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Users, CheckCircle, XCircle, Clock, Settings, User, Mail, Phone, Building, Calendar, UserCheck, UserX, Edit, ArrowLeft, Home, Trash, UserPlus, Search as SearchIcon, ChevronRight, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/simple-select";
import { useSystemRoles } from "@/hooks/useSystemRoles";
import SubscriptionPlansManager from "@/components/SubscriptionPlansManager";
import AddInternalUserDialog from "@/components/AddInternalUserDialog";
import { EditUserDialog } from "@/components/EditUserDialog";
import { UserCategoryTable } from "@/components/admin/UserCategoryTable";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminBackOfficeHeader } from "@/components/admin/AdminBackOfficeHeader";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  institution: string;
  research_field: string;
  role: string;
  all_roles?: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  account_status?: string;
  subscription_type?: string;
  partner_organization?: string;
  research_specialization?: string[];
  access_level_details?: any;
  profile_preferences?: any;
  email?: string;
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

interface SystemRoleData {
  role_code: string;
  role_name: string;
  role_category: string;
  description: string;
  permissions: string[];
  limits: Record<string, any>;
  is_active: boolean;
}

const CATEGORY_TO_TAB: Record<string, string> = {
  administration: 'internal',
  internal: 'internal',
  professional: 'professional',
  user: 'subscriber',
};

interface NavigationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  bgColor: string;
}

export default function UserManagement() {
  const { user, profile, loading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useSecureRoles();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { availableRoles, grantRole: grantSystemRole, isAdmin: currentUserIsAdmin } = useSystemRoles();
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("internal");
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [systemRolesData, setSystemRolesData] = useState<SystemRoleData[]>([]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchSystemRoles();
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchSystemRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('system_roles')
        .select('*')
        .eq('is_active', true)
        .order('role_code');
      if (error) throw error;
      setSystemRolesData((data || []).map((r: any) => ({
        role_code: r.role_code,
        role_name: r.role_name,
        role_category: r.role_category || 'user',
        description: r.description || '',
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        limits: r.limits || {},
        is_active: r.is_active,
      })));
    } catch (e) {
      console.error('Failed to fetch system_roles', e);
    }
  };

  const rolePermissions = useMemo(() => {
    const map: Record<string, { name: string; description: string; permissions: string[]; maxRequests: number; accessLevel: string }> = {};
    for (const r of systemRolesData) {
      map[r.role_code] = {
        name: r.role_name,
        description: r.description,
        permissions: r.permissions,
        maxRequests: r.limits?.maxRequests ?? 0,
        accessLevel: r.role_category,
      };
    }
    return map;
  }, [systemRolesData]);

  const rolesByCategory = useMemo(() => {
    const internal: string[] = [];
    const professional: string[] = [];
    const subscriber: string[] = [];
    for (const r of systemRolesData) {
      const tab = CATEGORY_TO_TAB[r.role_category] || 'subscriber';
      if (tab === 'internal') internal.push(r.role_code);
      else if (tab === 'professional') professional.push(r.role_code);
      else subscriber.push(r.role_code);
    }
    return { internal, professional, subscriber };
  }, [systemRolesData]);

  const fetchData = async () => {
    try {
      let profilesData: any[] = [];
      const { data: rpcData, error: usersError } = await supabase.rpc("get_admin_users_with_email");

      if (usersError) {
        console.error("RPC get_admin_users_with_email failed", usersError);
        const { data: fallbackProfiles, error: fallbackError } = await supabase
          .from("profiles")
          .select("*")
          .order("updated_at", { ascending: false });
        if (fallbackError) throw fallbackError;
        profilesData = (fallbackProfiles || []).map((p: any) => ({ ...p, email: null }));
        toast({
          title: "Avertissement",
          description: "Chargement en mode dégradé (emails indisponibles).",
        });
      } else {
        profilesData = (rpcData as any[]) || [];
      }

      setUsers(profilesData || []);

      const { data: requestsData, error: requestsError } = await supabase
        .from("access_requests")
        .select(`*, manuscripts:manuscript_id (title, author), profiles:user_id (first_name, last_name, institution)`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      setPendingRequests((requestsData as any) || []);
    } catch (error: any) {
      console.error("UserManagement fetchData failed", error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRoleCode: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Non authentifié");

      const userProfile = users.find(u => u.id === userId);
      if (!userProfile) throw new Error("Utilisateur introuvable");

      if (newRoleCode === 'admin') {
        await supabase.from('user_system_roles').delete().eq('user_id', userProfile.user_id);
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: userProfile.user_id, role: 'admin', granted_by: currentUser.id,
        });
        if (roleError) throw roleError;
      } else {
        const systemRole = availableRoles.find(r => r.role_code === newRoleCode);
        if (!systemRole) throw new Error(`Rôle système introuvable: ${newRoleCode}`);

        await supabase.from('user_roles').delete().eq('user_id', userProfile.user_id).eq('role', 'admin');
        await supabase.from('user_system_roles').delete().eq('user_id', userProfile.user_id);
        const { error: roleError } = await supabase.from('user_system_roles').insert({
          user_id: userProfile.user_id, role_id: systemRole.id, granted_by: currentUser.id,
        });
        if (roleError) throw roleError;
      }

      toast({ title: "Rôle mis à jour", description: "Le rôle de l'utilisateur a été modifié avec succès" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Impossible de mettre à jour le rôle", variant: "destructive" });
    }
  };

  const updateUserApproval = async (userId: string, isApproved: boolean) => {
    try {
      const userProfile = users.find(u => u.id === userId);
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;

      if (userProfile) {
        const { data: authData } = await supabase.auth.admin.getUserById(userProfile.user_id);
        const userEmail = authData?.user?.email;
        if (userEmail) {
          await supabase.functions.invoke('send-registration-email', {
            body: {
              email_type: isApproved ? 'account_validated' : 'account_rejected',
              recipient_email: userEmail,
              recipient_name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Utilisateur',
              user_type: userProfile.role || 'visitor'
            }
          });
        }
      }

      toast({
        title: isApproved ? "Utilisateur approuvé" : "Approbation révoquée",
        description: `L'utilisateur a été ${isApproved ? 'approuvé' : 'désapprouvé'} avec succès`,
      });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de modifier l'approbation", variant: "destructive" });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ status, approved_by: profile?.id, updated_at: new Date().toISOString() })
        .eq('id', requestId);
      if (error) throw error;
      toast({ title: "Demande mise à jour", description: `La demande a été ${status === 'approved' ? 'approuvée' : 'rejetée'}` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la demande", variant: "destructive" });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const response = await supabase.functions.invoke('user-service', {
        body: {
          action: 'delete_professional',
          user_id: userId,
          deleted_reason: 'Suppression depuis la gestion des utilisateurs',
        },
      });

      if (response.error) throw response.error;
      if (response.data && !response.data.success) {
        throw new Error(response.data.error || "Échec de la suppression");
      }

      toast({ title: "Utilisateur supprimé", description: "L'utilisateur et toutes ses données liées ont été supprimés avec succès" });
      fetchData();
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast({ title: "Erreur", description: error.message || "Impossible de supprimer l'utilisateur", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'librarian': return 'default' as const;
      case 'partner': return 'default' as const;
      case 'subscriber': return 'secondary' as const;
      case 'researcher': return 'secondary' as const;
      case 'public_user': return 'outline' as const;
      case 'visitor': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading || rolesLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const INTERNAL_ROLES = rolesByCategory.internal;
  const PROFESSIONAL_ROLES = rolesByCategory.professional;
  const SUBSCRIBER_ROLES = rolesByCategory.subscriber;

  const hasRoleInCategory = (userProfile: Profile, categoryRoles: string[]) => {
    if (userProfile.all_roles && userProfile.all_roles.length > 0) {
      return userProfile.all_roles.some(role => categoryRoles.includes(role));
    }
    return categoryRoles.includes(userProfile.role);
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const internalUsers = filteredUsers.filter(u => hasRoleInCategory(u, INTERNAL_ROLES));
  const professionalUsers = filteredUsers.filter(u => hasRoleInCategory(u, PROFESSIONAL_ROLES));
  const subscriberUsers = filteredUsers.filter(u => 
    hasRoleInCategory(u, SUBSCRIBER_ROLES) && 
    !hasRoleInCategory(u, INTERNAL_ROLES) && 
    !hasRoleInCategory(u, PROFESSIONAL_ROLES)
  );

  // Navigation items matching depot-legal style
  const managementItems: NavigationItem[] = [
    {
      id: "internal",
      label: "Utilisateurs Internes",
      description: "Administrateurs, bibliothécaires, direction",
      icon: Shield,
      count: internalUsers.length,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      id: "professionals",
      label: "Professionnels",
      description: "Éditeurs, imprimeurs, producteurs",
      icon: Building,
      count: professionalUsers.length,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
      id: "subscribers",
      label: "Abonnés & Usagers",
      description: "Chercheurs, abonnés, grand public",
      icon: Users,
      count: subscriberUsers.length,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
    },
  ];

  const settingsItems: NavigationItem[] = [
    {
      id: "permissions",
      label: "Permissions",
      description: "Gestion des rôles et droits",
      icon: Settings,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
    },
    {
      id: "plans",
      label: "Plans d'abonnement",
      description: "Configuration des plans",
      icon: UserPlus,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
    {
      id: "requests",
      label: "Demandes d'accès",
      description: "Demandes en attente",
      icon: Clock,
      count: pendingRequests.length,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    },
  ];

  const renderNavItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={cn(
          "w-full p-4 rounded-xl border text-left transition-all duration-200",
          isActive
            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
            : `border-transparent ${item.bgColor}`
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-primary text-primary-foreground" : item.color + " bg-white"
          )}>
            <item.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {item.label}
              </span>
              {item.count !== undefined && item.count > 0 && (
                <Badge variant={isActive ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                  {item.count}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate hidden md:block">
              {item.description}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isActive && "text-primary transform translate-x-1"
          )} />
        </div>
      </button>
    );
  };

  // Stats
  const statsItems = [
    { label: "Total utilisateurs", value: users.length, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Approuvés", value: users.filter(u => u.is_approved).length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
    { label: "En attente", value: users.filter(u => !u.is_approved).length, icon: Clock, color: "text-amber-600 bg-amber-100" },
    { label: "Internes", value: internalUsers.length, icon: Shield, color: "text-purple-600 bg-purple-100" },
    { label: "Demandes d'accès", value: pendingRequests.length, icon: FileText, color: "text-red-600 bg-red-100" },
  ];

  const userTableProps = {
    rolePermissions,
    availableRoleOptions: [
      { value: 'admin', label: 'Administrateur' },
      ...availableRoles.map(role => ({ value: role.role_code, label: role.role_name }))
    ],
    onEditUser: (u: Profile) => { setEditingUser(u); setShowEditDialog(true); },
    onUpdateRole: updateUserRole,
    onUpdateApproval: updateUserApproval,
    onDeleteUser: deleteUser,
    getRoleBadgeVariant,
    formatDate,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'internal':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Utilisateurs Internes
                </h2>
                <p className="text-sm text-muted-foreground">Personnel BNRM : administrateurs, bibliothécaires, direction, comptabilité</p>
              </div>
              <AddInternalUserDialog onUserAdded={fetchData} />
            </div>
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <UserCategoryTable users={internalUsers} {...userTableProps} emptyMessage="Aucun utilisateur interne trouvé" />
          </div>
        );
      case 'professionals':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Comptes Professionnels
              </h2>
              <p className="text-sm text-muted-foreground">Éditeurs, imprimeurs, producteurs et distributeurs inscrits pour le dépôt légal</p>
            </div>
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <UserCategoryTable users={professionalUsers} {...userTableProps} emptyMessage="Aucun compte professionnel trouvé" />
          </div>
        );
      case 'subscribers':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Abonnés & Usagers
              </h2>
              <p className="text-sm text-muted-foreground">Chercheurs, abonnés premium, partenaires institutionnels et grand public</p>
            </div>
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <UserCategoryTable users={subscriberUsers} {...userTableProps} emptyMessage="Aucun abonné trouvé" />
          </div>
        );
      case 'permissions':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Gestion des Permissions
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(rolePermissions).map(([roleKey, roleData]) => (
                <Card key={roleKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{roleData.name}</span>
                      <Badge variant={getRoleBadgeVariant(roleKey)}>{roleKey}</Badge>
                    </CardTitle>
                    <CardDescription>{roleData.description}</CardDescription>
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
          </div>
        );
      case 'plans':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Plans d'abonnement
              </h2>
            </div>
            <SubscriptionPlansManager />
          </div>
        );
      case 'requests':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Demandes d'Accès en Attente
              </h2>
              <p className="text-sm text-muted-foreground">Gérez les demandes d'accès aux manuscrits</p>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Aucune demande en attente</h3>
                <p className="text-muted-foreground">Toutes les demandes ont été traitées.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{request.manuscripts?.title}</h4>
                        <p className="text-sm text-muted-foreground">par {request.manuscripts?.author}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Demandeur: {request.profiles?.first_name} {request.profiles?.last_name}</span>
                          {request.profiles?.institution && <span>({request.profiles.institution})</span>}
                        </div>
                      </div>
                      <Badge variant="secondary">{request.request_type}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><strong>Objet:</strong> {request.purpose}</p>
                      <p className="text-sm"><strong>Date demandée:</strong> {formatDate(request.requested_date)}</p>
                      {request.notes && <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Approuver
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                            <AlertDialogDescription>Êtes-vous sûr de vouloir approuver cette demande d'accès ?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => updateRequestStatus(request.id, 'approved')}>Approuver</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Rejeter
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                            <AlertDialogDescription>Êtes-vous sûr de vouloir rejeter cette demande d'accès ?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => updateRequestStatus(request.id, 'rejected')}>Rejeter</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <WatermarkContainer 
      watermarkProps={{ text: "BNRM - Gestion des Utilisateurs", variant: "subtle", position: "pattern", opacity: 0.02 }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50/30 overflow-x-hidden">
        {/* Header standardisé */}
        <AdminHeader 
          title="Gestion des Utilisateurs"
          badgeText="Administration"
          subtitle="Administrer les comptes utilisateurs, rôles et approbations"
          backPath="/admin/settings"
        />

        {/* Main Content */}
        <main className="container py-8">
          <div className="space-y-6">
            {/* Header inspiré du back-office */}
            <AdminBackOfficeHeader 
              title="Gestion des Utilisateurs"
              subtitle="Administration des comptes et permissions utilisateurs"
              badgeText="Administration"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statsItems.map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-all duration-200 cursor-default group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Layout en grille: Navigation sidebar + Contenu */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              {/* Sidebar Navigation */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Catégories d'utilisateurs
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Gestion par type de compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {managementItems.map(renderNavItem)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Configuration
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Permissions et plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {settingsItems.map(renderNavItem)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="min-w-0">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    {renderContent()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Dialogue de modification d'utilisateur */}
        <EditUserDialog
          user={editingUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUserUpdated={fetchData}
        />
      </div>
    </WatermarkContainer>
  );
}
