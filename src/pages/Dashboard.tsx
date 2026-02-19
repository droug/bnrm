import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, Clock, Library, LogOut, Settings, Cog, ArrowLeft, CheckCircle, XCircle, AlertCircle, TrendingUp, Award, BarChart3, Eye, Download, Archive, Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManuscriptsDashboard } from "@/components/manuscripts/ManuscriptsDashboard";
import { PortalAnalyticsKPICard } from "@/components/dashboard/PortalAnalyticsKPICard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import logoBnrm from "@/assets/logo-bnrm-officiel-new.png";

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [cpsStats, setCpsStats] = useState({
    totalRequests: 0,
    pendingValidation: 0,
    validated: 0,
    rejected: 0,
    inProgress: 0,
    completed: 0,
    avgProcessingTime: 0,
    validationRate: 0,
    dlNumbersAssigned: 0,
    isbnAssigned: 0,
    issnAssigned: 0,
    ismnAssigned: 0,
    monographs: 0,
    periodicals: 0,
    specialCollections: 0,
    bdLogiciels: 0
  });

  const [reservationStats, setReservationStats] = useState({
    totalReservations: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  });

  const [accessRequestStats, setAccessRequestStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [subscriptionStats, setSubscriptionStats] = useState({
    totalSubscriptions: 0,
    active: 0,
    expired: 0,
    pending: 0
  });

  useEffect(() => {
    if (user && profile) {
      fetchCpsStats();
      fetchAccessRequestStats();
    }
  }, [user, profile]);

  const fetchCpsStats = async () => {
    try {
      // Récupérer toutes les demandes de dépôt légal
      const { data: requests, error } = await supabase
        .from('legal_deposit_requests')
        .select('*');

      if (error) throw error;

      const total = requests?.length || 0;
      const pending = requests?.filter(r => r.status === 'en_attente_validation_b' || r.status === 'soumis').length || 0;
      const validated = requests?.filter(r => r.status === 'valide_par_b' || r.status === 'attribue' || r.status === 'receptionne').length || 0;
      const rejected = requests?.filter(r => r.status === 'rejete' || r.status === 'rejete_par_b' || r.status === 'rejete_par_comite').length || 0;
      const inProgress = requests?.filter(r => r.status === 'en_cours').length || 0;
      const completed = requests?.filter(r => r.status === 'attribue' || r.status === 'receptionne').length || 0;

      // Calculer le taux de validation
      const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;

      // Calculer le temps de traitement moyen (en jours)
      const completedRequests = requests?.filter(r => r.attribution_date && r.submission_date) || [];
      let avgProcessingTime = 0;
      if (completedRequests.length > 0) {
        const totalDays = completedRequests.reduce((sum, req) => {
          const submitted = new Date(req.submission_date!);
          const attributed = new Date(req.attribution_date!);
          const days = Math.floor((attributed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        avgProcessingTime = Math.round(totalDays / completedRequests.length);
      }

      // Compter les numéros attribués
      const dlAssigned = requests?.filter(r => r.dl_number).length || 0;
      const isbnAssigned = requests?.filter(r => r.isbn_assigned || r.isbn).length || 0;
      const issnAssigned = requests?.filter(r => r.issn_assigned || r.issn).length || 0;
      const ismnAssigned = requests?.filter(r => r.ismn_assigned || r.ismn).length || 0;

      // Statistiques par type
      const monographs = requests?.filter(r => r.monograph_type === 'livres').length || 0;
      const periodicals = requests?.filter(r => r.monograph_type === 'periodiques').length || 0;
      const specialCollections = requests?.filter(r => r.monograph_type === 'beaux_livres').length || 0;
      const bdLogiciels = requests?.filter(r => r.monograph_type === 'musique').length || 0;

      setCpsStats({
        totalRequests: total,
        pendingValidation: pending,
        validated,
        rejected,
        inProgress,
        completed,
        avgProcessingTime,
        validationRate,
        dlNumbersAssigned: dlAssigned,
        isbnAssigned,
        issnAssigned,
        ismnAssigned,
        monographs,
        periodicals,
        specialCollections,
        bdLogiciels
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques CPS:', error);
    }
  };


  const fetchAccessRequestStats = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('access_requests')
        .select('*');

      if (error) throw error;

      const total = requests?.length || 0;
      const pending = requests?.filter(r => r.status === 'pending').length || 0;
      const approved = requests?.filter(r => r.status === 'approved').length || 0;
      const rejected = requests?.filter(r => r.status === 'rejected').length || 0;

      setAccessRequestStats({ totalRequests: total, pending, approved, rejected });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de demandes d\'accès:', error);
    }
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
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="bg-white rounded-xl px-2 py-1 shadow-sm border border-border/30">
                <img src={logoBnrm} alt="Logo BNRM" className="h-10 w-auto object-contain" />
              </div>
              <span className="text-xl font-bold">Portail BNRM</span>
            </Link>
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
      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble des statistiques et indicateurs du portail BNRM
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

        {/* Section 1: Tableau de Bord KPI Portail - Audience, eWallet, Bibliothèque Numérique */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tableau de Bord - Indicateurs Globaux</h2>
              <p className="text-sm text-muted-foreground">Audience, eWallet & Bibliothèque Numérique</p>
            </div>
          </div>
          <PortalAnalyticsKPICard platform="portail" />
        </section>

        {/* Section 2: Statistiques par Service (Accordéon) */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/50">
              <TrendingUp className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Statistiques par Service</h2>
              <p className="text-sm text-muted-foreground">Dépôt légal, Manuscrits, Réservations et Abonnements</p>
            </div>
          </div>
        <Accordion type="multiple" defaultValue={["depot-legal"]} className="space-y-4">
          {/* Dépôt Légal */}
          <AccordionItem value="depot-legal" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Indicateurs - Dépôt Légal</h2>
                  <p className="text-sm text-muted-foreground">Statistiques des déclarations et attributions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                {/* Statistiques Globales */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Statistiques Globales</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes les demandes de dépôt légal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{cpsStats.pendingValidation}</div>
                <p className="text-xs text-muted-foreground">
                  En attente de validation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validées</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{cpsStats.validated}</div>
                <p className="text-xs text-muted-foreground">
                  Demandes validées avec succès
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{cpsStats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  Demandes rejetées
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance & KPI */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Performance & KPI</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Taux de Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{cpsStats.validationRate}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pourcentage de demandes validées
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Temps Moyen de Traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{cpsStats.avgProcessingTime} j</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Délai moyen d'attribution
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Demandes Complétées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{cpsStats.completed}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Numéros attribués et réceptionnés
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attribution des Numéros */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Attribution des Numéros</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DL Attribués</CardTitle>
                <Badge className="bg-blue-500">DL</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.dlNumbersAssigned}</div>
                <p className="text-xs text-muted-foreground">
                  Numéros de dépôt légal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ISBN Attribués</CardTitle>
                <Badge className="bg-green-500">ISBN</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.isbnAssigned}</div>
                <p className="text-xs text-muted-foreground">
                  International Standard Book Number
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ISSN Attribués</CardTitle>
                <Badge className="bg-orange-500">ISSN</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.issnAssigned}</div>
                <p className="text-xs text-muted-foreground">
                  International Standard Serial Number
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ISMN Attribués</CardTitle>
                <Badge className="bg-purple-500">ISMN</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.ismnAssigned}</div>
                <p className="text-xs text-muted-foreground">
                  International Standard Music Number
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Répartition par Type de Publication */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Répartition par Type de Publication</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Monographies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.monographs}</div>
                <p className="text-xs text-muted-foreground">
                  Livres et ouvrages
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Périodiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.periodicals}</div>
                <p className="text-xs text-muted-foreground">
                  Revues et publications périodiques
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Collections Spécialisées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.specialCollections}</div>
                <p className="text-xs text-muted-foreground">
                  Cartes, affiches, atlas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium">BD & Logiciels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cpsStats.bdLogiciels}</div>
                <p className="text-xs text-muted-foreground">
                  Bases de données et logiciels
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Manuscrits */}
          <AccordionItem value="manuscrits" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold/10">
                  <BookOpen className="h-5 w-5 text-gold" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Plateforme Manuscrits</h2>
                  <p className="text-sm text-muted-foreground">Statistiques des manuscrits et collections</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4">
                <ManuscriptsDashboard />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Réservations */}
          <AccordionItem value="reservations" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Réservations</h2>
                  <p className="text-sm text-muted-foreground">Statistiques des réservations d'ouvrages et espaces</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reservationStats.totalReservations}</div>
                      <p className="text-xs text-muted-foreground">Toutes les réservations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{reservationStats.pending}</div>
                      <p className="text-xs text-muted-foreground">En attente de confirmation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{reservationStats.confirmed}</div>
                      <p className="text-xs text-muted-foreground">Réservations confirmées</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Annulées</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{reservationStats.cancelled}</div>
                      <p className="text-xs text-muted-foreground">Réservations annulées</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Demandes d'Accès aux Manuscrits */}
          <AccordionItem value="access-requests" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Demandes d'Accès</h2>
                  <p className="text-sm text-muted-foreground">Statistiques des demandes d'accès aux manuscrits</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accessRequestStats.totalRequests}</div>
                      <p className="text-xs text-muted-foreground">Toutes les demandes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{accessRequestStats.pending}</div>
                      <p className="text-xs text-muted-foreground">En attente de traitement</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{accessRequestStats.approved}</div>
                      <p className="text-xs text-muted-foreground">Demandes approuvées</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{accessRequestStats.rejected}</div>
                      <p className="text-xs text-muted-foreground">Demandes rejetées</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Abonnements */}
          <AccordionItem value="subscriptions" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Library className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Abonnements</h2>
                  <p className="text-sm text-muted-foreground">Statistiques des abonnements et adhésions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Abonnements</CardTitle>
                      <Library className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{subscriptionStats.totalSubscriptions}</div>
                      <p className="text-xs text-muted-foreground">Tous les abonnements</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Actifs</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{subscriptionStats.active}</div>
                      <p className="text-xs text-muted-foreground">Abonnements actifs</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Expirés</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{subscriptionStats.expired}</div>
                      <p className="text-xs text-muted-foreground">Abonnements expirés</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{subscriptionStats.pending}</div>
                      <p className="text-xs text-muted-foreground">En attente de validation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </section>

      </main>
      </div>
    </WatermarkContainer>
  );
}