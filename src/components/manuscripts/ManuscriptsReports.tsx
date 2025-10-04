import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, BarChart3, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";

export function ManuscriptsReports() {
  const [reportType, setReportType] = useState("monthly");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Fetch manuscripts for statistics
  const { data: manuscripts } = useQuery({
    queryKey: ['manuscripts-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // En-tête du rapport
    doc.setFontSize(20);
    doc.text("Rapport - Manuscrits Numérisés", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(), "PPP", { locale: fr })}`, 20, 30);
    doc.text(`Type: ${reportTypes.find(r => r.id === reportType)?.title || reportType}`, 20, 37);
    
    // Filtres appliqués
    doc.setFontSize(10);
    doc.text("Filtres appliqués:", 20, 50);
    let yPos = 57;
    
    if (dateFrom) {
      doc.text(`Période du: ${format(dateFrom, "PPP", { locale: fr })}`, 20, yPos);
      yPos += 7;
    }
    if (dateTo) {
      doc.text(`au: ${format(dateTo, "PPP", { locale: fr })}`, 20, yPos);
      yPos += 7;
    }
    if (filterLanguage !== "all") {
      doc.text(`Langue: ${filterLanguage}`, 20, yPos);
      yPos += 7;
    }
    if (filterPeriod !== "all") {
      doc.text(`Période: ${filterPeriod}`, 20, yPos);
      yPos += 7;
    }
    
    yPos += 10;
    
    // Statistiques
    doc.setFontSize(14);
    doc.text("Statistiques", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Total des manuscrits: ${manuscripts?.length || 0}`, 20, yPos);
    yPos += 7;
    doc.text(`Langues différentes: ${new Set(manuscripts?.map(m => m.language)).size || 0}`, 20, yPos);
    yPos += 7;
    doc.text(`Périodes historiques: ${new Set(manuscripts?.map(m => m.period).filter(Boolean)).size || 0}`, 20, yPos);
    yPos += 7;
    
    // Liste des manuscrits (échantillon)
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Échantillon de manuscrits", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    manuscripts?.slice(0, 10).forEach((manuscript, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${manuscript.title || "Sans titre"}`, 20, yPos);
      yPos += 5;
      doc.text(`   Langue: ${manuscript.language || "N/A"} | Période: ${manuscript.period || "N/A"}`, 20, yPos);
      yPos += 8;
    });
    
    doc.save(`rapport-manuscrits-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Rapport PDF généré avec succès");
  };

  const generateExcelReport = () => {
    // Générer un CSV (compatible Excel)
    const headers = ["ID", "Titre", "Auteur", "Langue", "Période", "Date de création"];
    const rows = manuscripts?.map(m => [
      m.id,
      m.title || "Sans titre",
      m.author || "N/A",
      m.language || "N/A",
      m.period || "N/A",
      format(new Date(m.created_at), "PPP", { locale: fr })
    ]) || [];
    
    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport-manuscrits-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Rapport Excel généré avec succès");
  };

  const generateReport = (formatType: string) => {
    if (formatType === 'pdf') {
      generatePDFReport();
    } else if (formatType === 'excel') {
      generateExcelReport();
    }
  };

  const reportTypes = [
    {
      id: 'monthly',
      title: 'Rapport Mensuel',
      description: 'Statistiques mensuelles des manuscrits numérisés',
      icon: CalendarIcon
    },
    {
      id: 'activity',
      title: 'Rapport d\'Activité',
      description: 'Consultations, téléchargements et demandes d\'accès',
      icon: BarChart3
    },
    {
      id: 'catalog',
      title: 'Catalogue Complet',
      description: 'Liste complète des manuscrits avec métadonnées',
      icon: FileText
    },
    {
      id: 'access',
      title: 'Rapport d\'Accès',
      description: 'Demandes d\'accès et statistiques d\'utilisation',
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rapports Statistiques</CardTitle>
          <CardDescription>
            Générez des rapports détaillés sur les manuscrits numérisés et leur utilisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {reportTypes.map((type) => (
              <Card key={type.id} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => generateReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => generateReport('excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtres Avancés</CardTitle>
          </div>
          <CardDescription>
            Personnalisez vos rapports avec des filtres multicritères
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Période</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP", { locale: fr }) : "Date début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP", { locale: fr }) : "Date fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Langue</Label>
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Toutes les langues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les langues</SelectItem>
                    <SelectItem value="arabic">Arabe</SelectItem>
                    <SelectItem value="french">Français</SelectItem>
                    <SelectItem value="berber">Amazigh</SelectItem>
                    <SelectItem value="latin">Latin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="period">Période Historique</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="medieval">Médiévale</SelectItem>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="contemporary">Contemporaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="access">Niveau d'accès</Label>
                <Select>
                  <SelectTrigger id="access">
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="restricted">Restreint</SelectItem>
                    <SelectItem value="confidential">Confidentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Générer le rapport
            </Button>
            <Button variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Manuscrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manuscripts?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents numérisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Langues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(manuscripts?.map(m => m.language)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Langues différentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Périodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(manuscripts?.map(m => m.period).filter(Boolean)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Périodes historiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {manuscripts?.filter(m => {
                const created = new Date(m.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && 
                       created.getFullYear() === now.getFullYear();
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nouveaux manuscrits
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
