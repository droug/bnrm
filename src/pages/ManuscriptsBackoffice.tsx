import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, BarChart3, Settings, Shield, Eye, Image, BookOpen, Sparkles, FileImage, ShieldCheck, CalendarClock, UploadCloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ManuscriptsBackoffice() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  // Fetch manuscripts count
  const { data: manuscripts } = useQuery({
    queryKey: ['manuscripts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('manuscripts')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count;
    }
  });

  // Fetch users count
  const { data: users } = useQuery({
    queryKey: ['manuscript-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('manuscript_platform_users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count;
    }
  });

  const menuCards = [
    {
      icon: BarChart3,
      title: "Tableau de bord",
      description: "Vue d'ensemble des statistiques et activités de la plateforme",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/dashboard'),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: BookOpen,
      title: "Gestion des manuscrits",
      description: "Ajout, modification et suppression des manuscrits numérisés",
      count: manuscripts || 0,
      action: () => navigate('/admin/manuscripts-backoffice/documents'),
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Gestion des utilisateurs",
      description: "Création et gestion des comptes utilisateurs de la plateforme",
      count: users || 0,
      action: () => navigate('/admin/manuscripts-backoffice/users'),
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: BarChart3,
      title: "Statistiques et analyses",
      description: "Rapports détaillés d'utilisation et statistiques avancées",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/analytics'),
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Sparkles,
      title: "Expositions virtuelles",
      description: "Création et gestion des expositions de manuscrits",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/exhibitions'),
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: FileText,
      title: "Rapports",
      description: "Génération et export de rapports PDF personnalisés",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/reports'),
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: ShieldCheck,
      title: "Contrôle d'accès",
      description: "Gestion des niveaux d'accès et permissions",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/access'),
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Settings,
      title: "Paramètres",
      description: "Configuration de la plateforme et options avancées",
      count: null,
      action: () => navigate('/admin/manuscripts-backoffice/settings'),
      gradient: "from-cyan-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-moroccan font-bold mb-3 bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
              Gestion Manuscrits Numérisés
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestion complète des manuscrits numérisés avec suivi et analyses
            </p>
          </div>
        </div>

        {/* Cards Menu */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {menuCards.map((card) => (
            <Card 
              key={card.title} 
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40"
              onClick={card.action}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-7 w-7 text-white" />
                  </div>
                  {card.count !== null && (
                    <Badge 
                      variant="secondary" 
                      className="text-lg px-4 py-1.5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                    >
                      {card.count}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm mt-2 leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}