import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Library, Users, TrendingUp, Globe, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function CatalogueStatistics() {
  // Données simulées - à remplacer par des vraies données de Supabase
  const stats = {
    totalNotices: 125450,
    totalLibraries: 42,
    totalContributors: 156,
    monthlyGrowth: 8.5,
    lastUpdate: "2025-01-15",
    recentAdds: 1247
  };

  const noticesByType = [
    { type: "Livres", count: 85000 },
    { type: "Périodiques", count: 25000 },
    { type: "Documents audio", count: 8450 },
    { type: "Documents vidéo", count: 4500 },
    { type: "Cartes et plans", count: 2500 },
  ];

  const noticesByLanguage = [
    { name: "Arabe", value: 65000, color: "#8B4513" },
    { name: "Français", value: 45000, color: "#D2691E" },
    { name: "Anglais", value: 10000, color: "#CD853F" },
    { name: "Espagnol", value: 3450, color: "#DEB887" },
    { name: "Autres", value: 2000, color: "#F4A460" },
  ];

  const contributionsByLibrary = [
    { library: "BN Rabat", notices: 45000 },
    { library: "BU Hassan II", notices: 25000 },
    { library: "BM Casablanca", notices: 18000 },
    { library: "BU Ibn Tofail", notices: 12000 },
    { library: "Autres", notices: 25450 },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cbm-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <BookOpen className="h-4 w-4 text-cbm-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-primary">{stats.totalNotices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentAdds.toLocaleString()} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-cbm-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bibliothèques</CardTitle>
            <Library className="h-4 w-4 text-cbm-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-secondary">{stats.totalLibraries}</div>
            <p className="text-xs text-muted-foreground">
              Membres actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-cbm-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributeurs</CardTitle>
            <Users className="h-4 w-4 text-cbm-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-accent">{stats.totalContributors}</div>
            <p className="text-xs text-muted-foreground">
              Catalogueurs actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notices par type */}
        <Card>
          <CardHeader>
            <CardTitle>Notices par Type</CardTitle>
            <CardDescription>Répartition des notices dans le catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Notices",
                  color: "hsl(var(--cbm-primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={noticesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--cbm-primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Notices par langue */}
        <Card>
          <CardHeader>
            <CardTitle>Notices par Langue</CardTitle>
            <CardDescription>Distribution linguistique du catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Notices",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={noticesByLanguage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {noticesByLanguage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Contributions par bibliothèque */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contributions par Bibliothèque</CardTitle>
            <CardDescription>Top contributeurs au catalogue collectif</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                notices: {
                  label: "Notices",
                  color: "hsl(var(--cbm-secondary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionsByLibrary} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="library" type="category" width={150} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="notices" fill="hsl(var(--cbm-secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Informations complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du Catalogue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-cbm-primary" />
            <div>
              <p className="text-sm font-medium">Dernière mise à jour</p>
              <p className="text-2xl font-bold">{stats.lastUpdate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Globe className="h-8 w-8 text-cbm-secondary" />
            <div>
              <p className="text-sm font-medium">Couverture nationale</p>
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-cbm-accent" />
            <div>
              <p className="text-sm font-medium">Taux de croissance annuel</p>
              <p className="text-2xl font-bold">+12.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
