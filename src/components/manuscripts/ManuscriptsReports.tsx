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
import logoHeader from "@/assets/logo-header-report.png";

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

  const generatePDFReport = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Fonction pour nettoyer le texte et gérer les caractères arabes
    const cleanText = (text: string): string => {
      if (!text) return "";
      
      // Détecter les caractères arabes (plage Unicode 0600-06FF)
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      
      if (hasArabic) {
        // Pour les caractères arabes, retourner une translittération ou indication
        return "[Texte en arabe - voir version numérique]";
      }
      
      // Nettoyer les caractères spéciaux et problématiques
      return text
        .replace(/[^\x00-\x7F]/g, (char) => {
          // Conserver les caractères accentués français courants
          const accents: Record<string, string> = {
            'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'î': 'i', 'ï': 'i', 'í': 'i',
            'ô': 'o', 'ö': 'o', 'ó': 'o',
            'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
            'ç': 'c', 'ñ': 'n',
            'À': 'A', 'Â': 'A', 'Ä': 'A', 'Á': 'A',
            'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
            'Î': 'I', 'Ï': 'I', 'Í': 'I',
            'Ô': 'O', 'Ö': 'O', 'Ó': 'O',
            'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ú': 'U',
            'Ç': 'C', 'Ñ': 'N'
          };
          return accents[char] || char;
        });
    };
    
    // Fonction pour ajouter l'en-tête professionnel sur chaque page
    const addHeader = () => {
      // Logo en haut
      const img = new Image();
      img.src = logoHeader;
      doc.addImage(img, 'PNG', 15, 10, 180, 30);
      
      // Ligne de séparation
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(15, 45, pageWidth - 15, 45);
    };
    
    // Ajouter l'en-tête de la première page
    addHeader();
    
    let yPos = 55;
    
    // Titre du rapport
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.setFont('helvetica', 'bold');
    doc.text("RAPPORT STATISTIQUE", pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.text("MANUSCRITS NUMERISES", pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Informations du rapport
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date de generation: ${format(new Date(), "dd/MM/yyyy")}`, 20, yPos);
    yPos += 7;
    doc.text(`Type de rapport: ${reportTypes.find(r => r.id === reportType)?.title || reportType}`, 20, yPos);
    yPos += 12;
    
    // Section Filtres appliqués
    if (dateFrom || dateTo || filterLanguage !== "all" || filterPeriod !== "all") {
      doc.setFillColor(240, 248, 255);
      doc.rect(15, yPos - 5, pageWidth - 30, 
        (dateFrom ? 7 : 0) + (dateTo ? 7 : 0) + (filterLanguage !== "all" ? 7 : 0) + (filterPeriod !== "all" ? 7 : 0) + 10, 
        'F');
      
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text("Filtres appliques:", 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      
      if (dateFrom) {
        doc.text(`- Periode du: ${format(dateFrom, "dd/MM/yyyy")}`, 25, yPos);
        yPos += 7;
      }
      if (dateTo) {
        doc.text(`- au: ${format(dateTo, "dd/MM/yyyy")}`, 25, yPos);
        yPos += 7;
      }
      if (filterLanguage !== "all") {
        const langMap: Record<string, string> = {
          "arabic": "Arabe",
          "french": "Francais",
          "berber": "Amazighe",
          "latin": "Latin"
        };
        doc.text(`- Langue: ${langMap[filterLanguage] || filterLanguage}`, 25, yPos);
        yPos += 7;
      }
      if (filterPeriod !== "all") {
        const periodMap: Record<string, string> = {
          "medieval": "Medievale",
          "modern": "Moderne",
          "contemporary": "Contemporaine"
        };
        doc.text(`- Periode: ${periodMap[filterPeriod] || filterPeriod}`, 25, yPos);
        yPos += 7;
      }
      yPos += 8;
    }
    
    // Section Statistiques principales
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.setFont('helvetica', 'bold');
    doc.text("STATISTIQUES PRINCIPALES", 20, yPos);
    yPos += 10;
    
    // Boîtes de statistiques
    const stats = [
      { label: "Total des manuscrits", value: manuscripts?.length || 0 },
      { label: "Langues differentes", value: new Set(manuscripts?.map(m => m.language)).size || 0 },
      { label: "Periodes historiques", value: new Set(manuscripts?.map(m => m.period).filter(Boolean)).size || 0 },
      { label: "Nouveaux ce mois", value: manuscripts?.filter(m => {
        const created = new Date(m.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0 }
    ];
    
    stats.forEach((stat, index) => {
      const boxX = 20 + (index % 2) * 90;
      const boxY = yPos + Math.floor(index / 2) * 25;
      
      // Boîte avec bordure
      doc.setDrawColor(41, 128, 185);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(boxX, boxY, 85, 20, 2, 2, 'FD');
      
      // Valeur
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text(String(stat.value), boxX + 42.5, boxY + 8, { align: 'center' });
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, boxX + 42.5, boxY + 16, { align: 'center' });
    });
    
    yPos += 60;
    
    // Liste détaillée des manuscrits
    if (manuscripts && manuscripts.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text("LISTE DES MANUSCRITS", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      
      // Note pour les textes arabes
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Note: Les titres en arabe sont indiques par [Texte en arabe]", 20, yPos);
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      manuscripts.slice(0, 20).forEach((manuscript, index) => {
        // Nouvelle page si nécessaire
        if (yPos > pageHeight - 30) {
          doc.addPage();
          addHeader();
          yPos = 55;
        }
        
        // Fond alterné pour lisibilité
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(15, yPos - 4, pageWidth - 30, 12, 'F');
        }
        
        // Titre nettoyé
        doc.setFont('helvetica', 'bold');
        const title = cleanText(manuscript.title || "Sans titre");
        const titleText = `${index + 1}. ${title}`;
        doc.text(titleText, 20, yPos);
        yPos += 5;
        
        // Détails nettoyés
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const author = cleanText(manuscript.author || "N/A");
        const language = manuscript.language || "N/A";
        const period = cleanText(manuscript.period || "N/A");
        const details = `    Auteur: ${author} | Langue: ${language} | Periode: ${period}`;
        doc.text(details, 20, yPos);
        yPos += 8;
        
        doc.setTextColor(60, 60, 60);
      });
    }
    
    // Pied de page avec numérotation
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} / ${totalPages} - Genere le ${format(new Date(), "dd/MM/yyyy")}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`rapport-manuscrits-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Rapport PDF genere avec succes");
  };

  const generateExcelReport = () => {
    // Générer un CSV avec encodage UTF-8 et BOM pour Excel
    const headers = ["ID", "Titre", "Auteur", "Langue", "Période", "Matériau", "Genre", "Cote", "Niveau d'accès", "Date de création"];
    const rows = manuscripts?.map(m => [
      m.id,
      m.title || "Sans titre",
      m.author || "N/A",
      m.language || "N/A",
      m.period || "N/A",
      m.material || "N/A",
      m.genre || "N/A",
      m.cote || "N/A",
      m.access_level || "N/A",
      format(new Date(m.created_at), "PPP", { locale: fr })
    ]) || [];
    
    // Ajouter BOM UTF-8 pour Excel
    let csvContent = "\uFEFF";
    csvContent += headers.join(";") + "\n";
    rows.forEach(row => {
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";") + "\n";
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
                    <SelectItem value="berber">Amazighe</SelectItem>
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
