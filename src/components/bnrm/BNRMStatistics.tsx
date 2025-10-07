import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

interface StatusLevel {
  main: string;
  sub: string;
  count: number;
  color: string;
}

interface StatsData {
  totalRequests: number;
  byStatus: Record<string, number>;
  byStatusTwoLevels: StatusLevel[];
  byType: Record<string, number>;
  averageProcessingTime: number;
  requestsOverTime: Array<{ date: string; count: number }>;
  monthlyTrends: Array<{ month: string; submitted: number; processed: number }>;
  editionForecasts: Array<{ year: number; count: number }>;
  byAuthorNationality: Record<string, number>;
  byAuthorGender: Record<string, number>;
  secondaryAuthors: number;
  duplicatesDetected: number;
  reciprocalValidations: Array<{ 
    editor: string; 
    printer: string; 
    validated: boolean;
    date: string;
  }>;
}

export const BNRMStatistics = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState<StatsData>({
    totalRequests: 58,
    byStatus: {
      'soumis': 5,
      'valide_par_b': 1,
      'receptionne': 1,
      'traite': 1
    },
    byStatusTwoLevels: [
      // Niveau 1: En cours
      { main: 'En cours', sub: 'Soumis', count: 12, color: '#3B82F6' },
      { main: 'En cours', sub: 'En révision', count: 8, color: '#60A5FA' },
      { main: 'En cours', sub: 'En traitement', count: 5, color: '#93C5FD' },
      
      // Niveau 1: Attente
      { main: 'Attente', sub: 'Attente validation', count: 7, color: '#F59E0B' },
      { main: 'Attente', sub: 'Attente documents', count: 4, color: '#FBBF24' },
      { main: 'Attente', sub: 'Attente paiement', count: 3, color: '#FCD34D' },
      
      // Niveau 1: Validé
      { main: 'Validé', sub: 'Validé BNRM', count: 6, color: '#10B981' },
      { main: 'Validé', sub: 'Validé éditeur', count: 4, color: '#34D399' },
      
      // Niveau 1: Attribué
      { main: 'Attribué', sub: 'ISBN attribué', count: 5, color: '#8B5CF6' },
      { main: 'Attribué', sub: 'ISSN attribué', count: 2, color: '#A78BFA' },
      { main: 'Attribué', sub: 'DL attribué', count: 1, color: '#C4B5FD' },
      
      // Niveau 1: Rejeté
      { main: 'Rejeté', sub: 'Non conforme', count: 1, color: '#EF4444' }
    ],
    byType: {
      'monographie': 24,
      'periodique': 15,
      'audiovisuel': 11,
      'numerique': 8
    },
    averageProcessingTime: 3.5,
    requestsOverTime: [
      { date: '2025-01-10', count: 1 },
      { date: '2025-01-15', count: 2 },
      { date: '2025-01-18', count: 1 },
      { date: '2025-01-19', count: 1 },
      { date: '2025-01-20', count: 3 }
    ],
    monthlyTrends: [
      { month: 'Nov 2024', submitted: 12, processed: 10 },
      { month: 'Déc 2024', submitted: 15, processed: 14 },
      { month: 'Jan 2025', submitted: 58, processed: 35 }
    ],
    editionForecasts: [
      { year: 2023, count: 45 },
      { year: 2024, count: 67 },
      { year: 2025, count: 52 }
    ],
    byAuthorNationality: {
      'Maroc': 42,
      'France': 8,
      'Algérie': 5,
      'Tunisie': 3
    },
    byAuthorGender: {
      'Masculin': 35,
      'Féminin': 23
    },
    secondaryAuthors: 12,
    duplicatesDetected: 3,
    reciprocalValidations: [
      { editor: 'Maison d\'édition Al Madariss', printer: 'Imprimerie Nationale', validated: true, date: '2025-01-15' },
      { editor: 'Éditions du Maroc', printer: 'Print House', validated: true, date: '2025-01-18' },
      { editor: 'Dar Al Kotob', printer: 'Imprimerie Moderne', validated: false, date: '2025-01-20' }
    ]
  });

  const COLORS = {
    soumis: '#3B82F6',
    valide_par_b: '#F59E0B',
    receptionne: '#8B5CF6',
    traite: '#10B981',
    rejete_par_b: '#EF4444'
  };

  const TYPE_COLORS = {
    monographie: '#6366F1',
    periodique: '#EC4899',
    audiovisuel: '#F59E0B',
    numerique: '#10B981'
  };

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name === 'soumis' ? 'Soumis' :
          name === 'valide_par_b' ? 'Validé' :
          name === 'receptionne' ? 'Réceptionné' :
          name === 'traite' ? 'Traité' : 'Rejeté',
    value,
    color: COLORS[name as keyof typeof COLORS]
  }));

  const typeData = Object.entries(stats.byType).map(([name, value]) => ({
    name: name === 'monographie' ? 'Monographie' :
          name === 'periodique' ? 'Périodique' :
          name === 'audiovisuel' ? 'Audiovisuel' : 'Numérique',
    value,
    color: TYPE_COLORS[name as keyof typeof TYPE_COLORS]
  }));

  const exportStatistics = () => {
    const csvContent = [
      ['Type de statistique', 'Valeur'],
      ['Demandes totales', stats.totalRequests],
      ['Temps moyen de traitement (jours)', stats.averageProcessingTime],
      ['Auteurs secondaires', stats.secondaryAuthors],
      ['Doublons détectés', stats.duplicatesDetected],
      [''],
      ['Répartition par statut (2 niveaux)'],
      ['Statut principal', 'Sous-statut', 'Nombre'],
      ...stats.byStatusTwoLevels.map(s => [s.main, s.sub, s.count]),
      [''],
      ['Répartition par statut'],
      ...statusData.map(s => [`Statut: ${s.name}`, s.value]),
      [''],
      ['Répartition par type'],
      ...typeData.map(t => [`Type: ${t.name}`, t.value]),
      [''],
      ['Prévisions d\'édition par an'],
      ...stats.editionForecasts.map(f => [`Année ${f.year}`, f.count]),
      [''],
      ['Nationalité des auteurs'],
      ...Object.entries(stats.byAuthorNationality).map(([nat, count]) => [nat, count]),
      [''],
      ['Genre des auteurs'],
      ...Object.entries(stats.byAuthorGender).map(([genre, count]) => [genre, count]),
      [''],
      ['Validations réciproques éditeur-imprimeur'],
      ['Éditeur', 'Imprimeur', 'Statut', 'Date'],
      ...stats.reciprocalValidations.map(v => [
        v.editor, 
        v.printer, 
        v.validated ? 'Validé' : 'En attente',
        format(new Date(v.date), 'dd/MM/yyyy')
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques-bnrm-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filtres et contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistiques du dépôt légal
            </span>
            <Button onClick={exportStatistics} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
          <CardDescription>
            Analyse et suivi des demandes de dépôt légal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">3 derniers mois</SelectItem>
                  <SelectItem value="365">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="monographie">Monographie</SelectItem>
                <SelectItem value="periodique">Périodique</SelectItem>
                <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                <SelectItem value="numerique">Numérique</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="soumis">Soumis</SelectItem>
                <SelectItem value="valide_par_b">Validé</SelectItem>
                <SelectItem value="receptionne">Réceptionné</SelectItem>
                <SelectItem value="traite">Traité</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des demandes</p>
                <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold mt-2">{stats.byStatus['soumis'] || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Traités</p>
                <p className="text-3xl font-bold mt-2">{stats.byStatus['traite'] || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
                <p className="text-3xl font-bold mt-2">{stats.averageProcessingTime}j</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auteurs secondaires</p>
                <p className="text-3xl font-bold mt-2">{stats.secondaryAuthors}</p>
              </div>
              <FileText className="w-10 h-10 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doublons détectés</p>
                <p className="text-3xl font-bold mt-2">{stats.duplicatesDetected}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut - 2 niveaux */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition par statut (2 niveaux)</CardTitle>
            <CardDescription>Distribution détaillée des demandes selon leur statut principal et secondaire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['En cours', 'Attente', 'Validé', 'Attribué', 'Rejeté'].map(mainStatus => {
                const subStatuses = stats.byStatusTwoLevels.filter(s => s.main === mainStatus);
                const total = subStatuses.reduce((acc, s) => acc + s.count, 0);
                
                return (
                  <div key={mainStatus} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <h4 className="font-semibold">{mainStatus}</h4>
                      <Badge variant="secondary">{total}</Badge>
                    </div>
                    <div className="space-y-1">
                      {subStatuses.map((status, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 rounded border"
                          style={{ borderLeftColor: status.color, borderLeftWidth: '3px' }}
                        >
                          <span className="text-sm">{status.sub}</span>
                          <span className="text-sm font-medium">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byStatusTwoLevels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sub" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Nombre de demandes">
                    {stats.byStatusTwoLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Distribution des demandes selon le type de document</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution temporelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des dépôts</CardTitle>
            <CardDescription>Nombre de demandes soumises par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.requestsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Demandes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendances mensuelles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendances mensuelles</CardTitle>
            <CardDescription>Comparaison soumissions vs traitement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="submitted" fill="#3B82F6" name="Soumises" />
                <Bar dataKey="processed" fill="#10B981" name="Traitées" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prévisions d'édition par an */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisions d'édition</CardTitle>
            <CardDescription>Nombre de publications prévues par année</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.editionForecasts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Prévisions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nationalité des auteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Nationalité des auteurs</CardTitle>
            <CardDescription>Répartition géographique</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.byAuthorNationality).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.byAuthorNationality).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre des auteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Genre des auteurs</CardTitle>
            <CardDescription>Répartition par genre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.byAuthorGender).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#EC4899" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Validations réciproques */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Validations réciproques éditeur-imprimeur</CardTitle>
            <CardDescription>Suivi des validations croisées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.reciprocalValidations.map((validation, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{validation.editor} ↔ {validation.printer}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(validation.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant={validation.validated ? "default" : "secondary"}>
                    {validation.validated ? 'Validé' : 'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résumé textuel */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Taux de traitement</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {Math.round((stats.byStatus['traite'] / stats.totalRequests) * 100)}%
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Type le plus demandé</p>
              <p className="text-2xl font-bold">Monographie</p>
              <p className="text-sm text-muted-foreground">50% des demandes</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Temps de réponse moyen</p>
              <p className="text-2xl font-bold">{stats.averageProcessingTime} jours</p>
              <p className="text-sm text-muted-foreground">Objectif: 5 jours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
