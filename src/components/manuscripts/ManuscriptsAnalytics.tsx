import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Eye, Download, TrendingUp, FileText } from "lucide-react";

export function ManuscriptsAnalytics() {
  const [stats, setStats] = useState({
    totalManuscripts: 0,
    publicManuscripts: 0,
    restrictedManuscripts: 0,
    confidentialManuscripts: 0,
    availableManuscripts: 0,
    inDigitization: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: manuscripts, error } = await supabase
        .from('manuscripts')
        .select('access_level, status');

      if (error) throw error;

      const total = manuscripts?.length || 0;
      const publicCount = manuscripts?.filter(m => m.access_level === 'public').length || 0;
      const restrictedCount = manuscripts?.filter(m => m.access_level === 'restricted').length || 0;
      const confidentialCount = manuscripts?.filter(m => m.access_level === 'confidential').length || 0;
      const availableCount = manuscripts?.filter(m => m.status === 'available').length || 0;
      const digitizationCount = manuscripts?.filter(m => m.status === 'digitization').length || 0;

      setStats({
        totalManuscripts: total,
        publicManuscripts: publicCount,
        restrictedManuscripts: restrictedCount,
        confidentialManuscripts: confidentialCount,
        availableManuscripts: availableCount,
        inDigitization: digitizationCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: "Total Manuscrits",
      value: stats.totalManuscripts,
      icon: FileText,
      description: "Nombre total de manuscrits",
      color: "text-blue-600"
    },
    {
      title: "Manuscrits Publics",
      value: stats.publicManuscripts,
      icon: Eye,
      description: "Accessibles à tous",
      color: "text-green-600"
    },
    {
      title: "Accès Restreint",
      value: stats.restrictedManuscripts,
      icon: Users,
      description: "Adhérents uniquement",
      color: "text-orange-600"
    },
    {
      title: "Confidentiels",
      value: stats.confidentialManuscripts,
      icon: BarChart3,
      description: "Admin/Bibliothécaire",
      color: "text-red-600"
    },
    {
      title: "Disponibles",
      value: stats.availableManuscripts,
      icon: TrendingUp,
      description: "Consultables immédiatement",
      color: "text-emerald-600"
    },
    {
      title: "En Numérisation",
      value: stats.inDigitization,
      icon: Download,
      description: "En cours de traitement",
      color: "text-purple-600"
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques de la Plateforme
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des manuscrits numérisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution par Langue</CardTitle>
          <CardDescription>
            Répartition des manuscrits selon leur langue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Graphique à venir...</p>
        </CardContent>
      </Card>
    </div>
  );
}
