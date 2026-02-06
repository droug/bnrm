import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WatermarkContainer } from "@/components/ui/watermark";
import { RolePermissionsMatrix } from "@/components/roles/RolePermissionsMatrix";
import { RoleCreator } from "@/components/roles/RoleCreator";
import { PermissionSearch } from "@/components/roles/PermissionSearch";
import { RolesList } from "@/components/roles/RolesList";
import { ModulesManagement } from "@/components/roles/ModulesManagement";
import { ServicesManagement } from "@/components/roles/ServicesManagement";
import { SystemDataInitializer } from "@/components/roles/SystemDataInitializer";
import { RoleTransitionsMatrix } from "@/components/roles/RoleTransitionsMatrix";
import { PermissionsManagement } from "@/components/roles/PermissionsManagement";
import { 
  Shield, 
  Users, 
  Search,
  ChevronRight,
  Library,
  BookOpen,
  Calendar,
  Archive,
  FileText,
  Database,
  Box,
  Home,
  Layers,
  GitBranch,
  Lock,
  Puzzle,
  Settings,
  Zap,
  Key,
  UserCheck,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Header from "@/components/Header";

// Module tabs configuration
const tabs = [
  { 
    id: "initializer", 
    label: "Initialisation", 
    icon: Zap, 
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-600/5",
    description: "Initialiser les données système"
  },
  { 
    id: "matrix", 
    label: "Matrice Permissions", 
    icon: Layers, 
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500/20 to-blue-600/5",
    description: "Vue matricielle des permissions"
  },
  { 
    id: "transitions", 
    label: "Transitions", 
    icon: GitBranch, 
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-500/20 to-purple-600/5",
    description: "Workflow des changements de rôle"
  },
  { 
    id: "permissions", 
    label: "Permissions", 
    icon: Lock, 
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    description: "Gestion des permissions"
  },
  { 
    id: "roles", 
    label: "Rôles", 
    icon: UserCheck, 
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    description: "Liste et configuration des rôles"
  },
  { 
    id: "modules", 
    label: "Modules", 
    icon: Puzzle, 
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-600/5",
    description: "Modules système"
  },
  { 
    id: "services", 
    label: "Services", 
    icon: Settings, 
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    description: "Services et fonctionnalités"
  },
  { 
    id: "search", 
    label: "Recherche", 
    icon: Search, 
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    gradient: "from-slate-500/20 to-slate-600/5",
    description: "Recherche de permissions"
  },
];

// Platform filter configuration
const platforms = [
  { id: "all", name: "Toutes", icon: Shield, color: "bg-primary", textColor: "text-primary" },
  { id: "bnrm", name: "Portail BNRM", icon: Library, color: "bg-blue-500", textColor: "text-blue-500" },
  { id: "digital_library", name: "Bibliothèque Numérique", icon: BookOpen, color: "bg-green-500", textColor: "text-green-500" },
  { id: "manuscripts", name: "Manuscrits", icon: FileText, color: "bg-amber-500", textColor: "text-amber-500" },
  { id: "cbm", name: "CBM", icon: Archive, color: "bg-purple-500", textColor: "text-purple-500" },
  { id: "kitab", name: "Kitab", icon: BookOpen, color: "bg-rose-500", textColor: "text-rose-500" },
  { id: "cultural", name: "Activités Culturelles", icon: Calendar, color: "bg-cyan-500", textColor: "text-cyan-500" },
  { id: "vexpo360", name: "VExpo360", icon: Box, color: "bg-violet-500", textColor: "text-violet-500" },
  { id: "cbn", name: "CBN", icon: Database, color: "bg-teal-500", textColor: "text-teal-500" }
];

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary",
  description 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color?: string;
  description?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    primary: { bg: "bg-primary/5", text: "text-primary", iconBg: "bg-primary/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-500", iconBg: "bg-blue-500/10" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-500", iconBg: "bg-emerald-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-500", iconBg: "bg-amber-500/10" },
    purple: { bg: "bg-purple-500/5", text: "text-purple-500", iconBg: "bg-purple-500/10" },
    rose: { bg: "bg-rose-500/5", text: "text-rose-500", iconBg: "bg-rose-500/10" },
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-none shadow-sm hover:shadow-md transition-all duration-300", classes.bg)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", classes.iconBg)}>
              <Icon className={cn("h-5 w-5", classes.text)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RolesManagement() {
  const { user, profile, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("matrix");

  // Nombre de rôles enum définis dans le système (17 rôles)
  const ENUM_ROLES_COUNT = 17;
  
  // Fetch stats from available tables
  const { data: stats } = useQuery({
    queryKey: ['roles-management-stats'],
    queryFn: async () => {
      const [systemRoles, profiles, activityTypes] = await Promise.all([
        supabase.from('system_roles').select('id, is_active', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('activity_types').select('id, is_active', { count: 'exact' }),
      ]);

      // Total roles = 17 enum roles + dynamic system roles
      const dynamicRolesCount = systemRoles.count || 0;
      const totalRoles = ENUM_ROLES_COUNT + dynamicRolesCount;
      const activeSystemRoles = systemRoles.data?.filter(r => r.is_active).length || 0;

      return {
        roles: {
          total: totalRoles,
          active: ENUM_ROLES_COUNT + activeSystemRoles,
        },
        permissions: 45, // Permission count (static for now)
        modules: {
          total: activityTypes.count || 0,
          active: activityTypes.data?.filter(m => m.is_active).length || 0,
        },
        users: profiles.count || 0,
      };
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-2xl bg-primary/10 animate-pulse">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const activeTabData = tabs.find(t => t.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "initializer":
        return <SystemDataInitializer />;
      case "matrix":
        return <RolePermissionsMatrix searchQuery={searchQuery} selectedPlatform={selectedPlatform} />;
      case "transitions":
        return <RoleTransitionsMatrix selectedPlatform={selectedPlatform} />;
      case "permissions":
        return <PermissionsManagement />;
      case "roles":
        return <RolesList />;
      case "modules":
        return <ModulesManagement />;
      case "services":
        return <ServicesManagement />;
      case "search":
        return <PermissionSearch searchQuery={searchQuery} />;
      default:
        return null;
    }
  };

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Gestion des Rôles", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        
        <main className="container mx-auto px-4 py-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
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
                  <BreadcrumbLink asChild>
                    <Link to="/admin/settings">Administration</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Rôles & Habilitations</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          <div className="space-y-6">
            {/* Modern Header with Gradient */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg overflow-hidden">
                <CardHeader className="pb-6 relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />
                  
                  <div className="flex flex-col md:flex-row md:items-start gap-4 relative z-10">
                    <motion.div 
                      className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Shield className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                          Gestion des Rôles et Habilitations
                        </CardTitle>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {profile?.first_name} {profile?.last_name}
                        </Badge>
                      </div>
                      <CardDescription className="text-base max-w-2xl">
                        Administration centralisée des permissions, rôles et modules sur toutes les plateformes BNRM
                      </CardDescription>
                    </div>
                    <RoleCreator />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
                    <StatCard 
                      title="Rôles" 
                      value={stats?.roles.total || 0}
                      icon={UserCheck}
                      color="blue"
                      description={`${stats?.roles.active || 0} actifs`}
                    />
                    <StatCard 
                      title="Permissions" 
                      value={stats?.permissions || 0}
                      icon={Key}
                      color="green"
                    />
                    <StatCard 
                      title="Modules" 
                      value={stats?.modules.total || 0}
                      icon={Puzzle}
                      color="purple"
                      description={`${stats?.modules.active || 0} actifs`}
                    />
                    <StatCard 
                      title="Utilisateurs" 
                      value={stats?.users || 0}
                      icon={Users}
                      color="amber"
                    />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Platform Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Filtrer par plateforme
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isActive = selectedPlatform === platform.id;
                      return (
                        <motion.button
                          key={platform.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            isActive
                              ? `${platform.color} text-white shadow-md`
                              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {platform.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un rôle, permission ou module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </motion.div>

            {/* Main Content Area with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              {/* Sidebar Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="sticky top-6 border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Modules de gestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        
                        return (
                          <motion.button
                            key={tab.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                              isActive
                                ? cn("bg-gradient-to-r", tab.gradient, tab.borderColor, "border shadow-sm")
                                : "hover:bg-muted/50"
                            )}
                          >
                            <div className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isActive ? tab.bgColor : "bg-muted/50"
                            )}>
                              <Icon className={cn("h-4 w-4", isActive ? tab.color : "text-muted-foreground")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={cn(
                                "block text-sm font-medium truncate",
                                isActive ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {tab.label}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate">
                                {tab.description}
                              </span>
                            </div>
                            {isActive && (
                              <ChevronRight className={cn("h-4 w-4 flex-shrink-0", tab.color)} />
                            )}
                          </motion.button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Content Area */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Active Tab Header */}
                    {activeTabData && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", activeTabData.bgColor)}>
                            <activeTabData.icon className={cn("h-5 w-5", activeTabData.color)} />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">{activeTabData.label}</h2>
                            <p className="text-sm text-muted-foreground">{activeTabData.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}
