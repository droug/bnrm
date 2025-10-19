import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTestDepositButton } from "@/components/admin/CreateTestDepositButton";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings,
  BarChart3,
  FileText,
  Hash,
  Archive,
  Users,
  Bell,
  Shield,
  BookOpen,
  Database,
  Download,
  Search,
  Globe,
  FileBarChart,
  TrendingUp
} from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { BNRMDashboard } from "@/components/bnrm/BNRMDashboard";
import { BNRMRequestManager } from "@/components/bnrm/BNRMRequestManager";
import { BNRMNumberAttribution } from "@/components/bnrm/BNRMNumberAttribution";
import { BNRMPaymentNotificationSettings } from "@/components/bnrm/BNRMPaymentNotificationSettings";
import { BNRMStatistics } from "@/components/bnrm/BNRMStatistics";
import BNRMEditorialMonitoring from "@/components/bnrm/BNRMEditorialMonitoring";
import { DepositValidationWorkflow } from "@/components/legal-deposit/DepositValidationWorkflow";

export default function BNRMBackOffice() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDepositModal, setSelectedDepositModal] = useState<string | null>(null);
  const [selectedDepositData, setSelectedDepositData] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{type: string, data?: any} | null>(null);
  const [documentForm, setDocumentForm] = useState<{type: string, data?: any} | null>(null);

  // Fonction pour générer le rapport mensuel ISBN
  const generateISBNMonthlyReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport Mensuel - Agence ISBN', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
    doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
    
    // Statistiques globales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Globales', 14, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total ISBN attribués: 1,234', 14, 60);
    doc.text('• Nouveaux éditeurs enregistrés: 45', 14, 67);
    doc.text('• ISBN préfixes attribués: 12', 14, 74);
    doc.text('• Délai moyen de traitement: 2.3 jours', 14, 81);
    
    // Répartition par type de publication
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Type de Publication', 14, 95);
    
    (doc as any).autoTable({
      startY: 100,
      head: [['Type', 'Nombre', 'Pourcentage']],
      body: [
        ['Livres', '856', '69.4%'],
        ['Périodiques', '234', '19.0%'],
        ['E-books', '89', '7.2%'],
        ['Publications multimédias', '55', '4.4%'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Évolution mensuelle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Évolution Mensuelle', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Mois', 'ISBN attribués', 'Variation']],
      body: [
        ['Janvier 2024', '1,089', '+12%'],
        ['Février 2024', '1,156', '+6%'],
        ['Mars 2024', '1,234', '+7%'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save('Rapport_ISBN_Mars_2024.pdf');
    toast({
      title: "Rapport généré",
      description: "Le rapport mensuel ISBN a été téléchargé avec succès",
    });
  };

  // Fonction pour générer le rapport ISSN
  const generateISSNReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport - Centre International ISSN', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
    doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
    
    // Statistiques globales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Globales', 14, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total ISSN attribués: 87', 14, 60);
    doc.text('• Nouvelles publications périodiques: 23', 14, 67);
    doc.text('• ISSN en ligne: 34', 14, 74);
    doc.text('• ISSN imprimés: 53', 14, 81);
    
    // Répartition par domaine
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Domaine', 14, 95);
    
    (doc as any).autoTable({
      startY: 100,
      head: [['Domaine', 'Nombre', 'Pourcentage']],
      body: [
        ['Sciences et Technologies', '28', '32.2%'],
        ['Sciences Humaines', '22', '25.3%'],
        ['Économie et Gestion', '18', '20.7%'],
        ['Arts et Culture', '12', '13.8%'],
        ['Autres', '7', '8.0%'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] }
    });
    
    // Liste des nouvelles publications
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Nouvelles Publications Enregistrées', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Titre', 'ISSN', 'Type', 'Éditeur']],
      body: [
        ['Revue Marocaine de Recherche', '2024-5678', 'Imprimé', 'Éditions Savoir'],
        ['Journal d\'Innovation Tech', '2024-5679', 'En ligne', 'Tech Media'],
        ['Bulletin Économique', '2024-5680', 'Imprimé', 'CERM'],
        ['Cahiers d\'Histoire', '2024-5681', 'Imprimé', 'Publications Hist'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] }
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save('Rapport_ISSN_Mars_2024.pdf');
    toast({
      title: "Rapport généré",
      description: "Le rapport ISSN a été téléchargé avec succès",
    });
  };

  // Fonction pour générer les statistiques par type de dépôt
  const generateDepositTypeStats = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques de Dépôt par Type', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Période: Janvier - Mars 2024', pageWidth / 2, 30, { align: 'center' });
    doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
    
    // Vue d'ensemble
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vue d\'Ensemble', 14, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total dépôts reçus: 2,847', 14, 60);
    doc.text('• Dépôts physiques: 1,823 (64%)', 14, 67);
    doc.text('• Dépôts numériques: 1,024 (36%)', 14, 74);
    doc.text('• Taux de conformité: 94.2%', 14, 81);
    
    // Détail par type de support
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition Détaillée par Type de Support', 14, 95);
    
    (doc as any).autoTable({
      startY: 100,
      head: [['Type de Support', 'Nombre', '%', 'Conformes']],
      body: [
        ['Livres imprimés', '1,456', '51.2%', '1,398'],
        ['E-books (PDF/EPUB)', '567', '19.9%', '543'],
        ['Périodiques', '389', '13.7%', '367'],
        ['Thèses', '234', '8.2%', '228'],
        ['Publications audio', '123', '4.3%', '115'],
        ['Multimédias', '78', '2.7%', '72'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] }
    });
    
    // Évolution trimestrielle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Évolution Trimestrielle', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Mois', 'Physiques', 'Numériques', 'Total']],
      body: [
        ['Janvier 2024', '623', '312', '935'],
        ['Février 2024', '589', '345', '934'],
        ['Mars 2024', '611', '367', '978'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] }
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save('Statistiques_Depot_Type_T1_2024.pdf');
    toast({
      title: "Rapport généré",
      description: "Les statistiques par type ont été téléchargées avec succès",
    });
  };

  // Fonction pour générer le rapport d'activité des éditeurs
  const generatePublishersActivityReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'Activité des Éditeurs', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
    doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
    
    // Synthèse
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Synthèse de l\'Activité', 14, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Éditeurs actifs: 324', 14, 60);
    doc.text('• Nouveaux éditeurs: 45', 14, 67);
    doc.text('• Publications totales: 2,847', 14, 74);
    doc.text('• Moyenne publications/éditeur: 8.8', 14, 81);
    
    // Top 10 éditeurs
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Éditeurs par Volume', 14, 95);
    
    (doc as any).autoTable({
      startY: 100,
      head: [['Rang', 'Éditeur', 'Publications', 'ISBN/ISSN']],
      body: [
        ['1', 'Éditions Savoir', '156', '142'],
        ['2', 'Dar Al Kitab', '134', '128'],
        ['3', 'Maison du Livre', '98', '94'],
        ['4', 'Nouvelles Éditions', '87', '83'],
        ['5', 'Presses Universitaires', '76', '72'],
        ['6', 'Éditions Culturelles', '65', '62'],
        ['7', 'Publications Modernes', '54', '51'],
        ['8', 'Éditions Al Amal', '48', '46'],
        ['9', 'Dar Nachr', '43', '41'],
        ['10', 'Éditions du Progrès', '39', '37'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] }
    });
    
    // Nouveaux éditeurs enregistrés
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Nouveaux Éditeurs Enregistrés', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Éditeur', 'Date', 'Ville', '1ère Publication']],
      body: [
        ['Éditions Horizon', '05/03/2024', 'Casablanca', 'Guide Touristique'],
        ['Dar Al Fikr', '12/03/2024', 'Rabat', 'Essai Philosophique'],
        ['Nouvelles Impressions', '18/03/2024', 'Marrakech', 'Roman'],
        ['Maison Culturelle', '22/03/2024', 'Fès', 'Recueil de Poésie'],
        ['Éditions Al Hadith', '28/03/2024', 'Tanger', 'Étude Historique'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] }
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save('Rapport_Activite_Editeurs_Mars_2024.pdf');
    toast({
      title: "Rapport généré",
      description: "Le rapport d'activité des éditeurs a été téléchargé avec succès",
    });
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

  // Bloquer l'accès aux comptes professionnels
  const professionalRoles = ['editor', 'printer', 'producer'];
  if (!profile?.is_approved || (profile?.role !== 'admin' && profile?.role !== 'librarian') || professionalRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Système de Gestion du Dépôt Légal", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header standardisé */}
        <AdminHeader 
          title="BNRM - Système BNRM"
          badgeText="Système de Gestion du Dépôt Légal"
          subtitle="Interface de gestion complète du dépôt légal BNRM"
        />

        {/* Main Content */}
        <main className="container py-6">
          <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {t('bnrm.backoffice.subtitle')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('bnrm.backoffice.subtitle')}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('reports')}
                  className="hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('bnrm.reports.btn')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('/', '_blank')}
                  className="hover:bg-accent"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('bnrm.publicPortal.btn')}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2 bg-muted">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Tableau de bord</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Demandes en Attente</span>
                </TabsTrigger>
                <TabsTrigger value="attribution" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Hash className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Attributions</span>
                </TabsTrigger>
                <TabsTrigger value="deposits" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Archive className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Dépôts</span>
                </TabsTrigger>
                <TabsTrigger value="editorial-monitoring" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Search className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Veille</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Database className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Rapports</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <BNRMDashboard />
              </TabsContent>

              {/* Request Management Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-end mb-4">
              <CreateTestDepositButton />
            </div>
            <DepositValidationWorkflow />
          </TabsContent>

              {/* Number Attribution Tab */}
              <TabsContent value="attribution" className="space-y-4">
                <BNRMNumberAttribution />
              </TabsContent>

              {/* Document Deposits Tab */}
              <TabsContent value="deposits" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Archive className="h-5 w-5" />
                        <span>Dépôts Physiques</span>
                      </CardTitle>
                      <CardDescription>
                        Réception et traitement des exemplaires papier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">En attente de réception</h4>
                            <div className="text-2xl font-bold text-orange-600">15</div>
                            <p className="text-xs text-muted-foreground">Publications attendues</p>
                          </div>
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Reçus aujourd'hui</h4>
                            <div className="text-2xl font-bold text-green-600">8</div>
                            <p className="text-xs text-muted-foreground">Exemplaires reçus</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setDocumentForm({ type: 'registre_entrees', data: { depositType: 'physique' } })}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Registre des entrées
                  </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setSelectedDepositModal("conformite")}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Vérifier conformité
                          </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setDocumentForm({ type: 'accuse_reception', data: { depositType: 'physique' } })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Générer accusé réception
                  </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Dépôts Numériques</span>
                      </CardTitle>
                      <CardDescription>
                        Gestion des fichiers et métadonnées numériques
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Fichiers en cours</h4>
                            <div className="text-2xl font-bold text-blue-600">23</div>
                            <p className="text-xs text-muted-foreground">En validation technique</p>
                          </div>
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Archivés</h4>
                            <div className="text-2xl font-bold text-purple-600">1,247</div>
                            <p className="text-xs text-muted-foreground">Documents numériques</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setSelectedDepositModal("formats")}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Contrôle formats/tailles
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setSelectedDepositModal("integrite")}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Vérification intégrité
                          </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setConfirmAction({ type: 'archivage_perenne', data: { depositType: 'numerique' } })}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Archivage pérenne
                  </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Suivi des Conformités et Non-Conformités</CardTitle>
                    <CardDescription>
                      Tableau de bord des contrôles qualité des dépôts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">N° Dépôt</th>
                            <th className="text-left p-2">Publication</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Statut</th>
                            <th className="text-left p-2">Date contrôle</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001234</td>
                            <td className="p-2">Guide du développeur React</td>
                            <td className="p-2">Livre</td>
                            <td className="p-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">Conforme</Badge>
                            </td>
                            <td className="p-2">15/03/2024</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDepositData({
                                    number: "DL-2024-001234",
                                    title: "Guide du développeur React",
                                    type: "Livre",
                                    status: "Conforme"
                                  });
                                  setSelectedDepositModal("details");
                                }}
                              >
                                Voir détails
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001235</td>
                            <td className="p-2">Magazine Tech Innovation</td>
                            <td className="p-2">Périodique</td>
                            <td className="p-2">
                              <Badge variant="destructive">Non conforme</Badge>
                            </td>
                            <td className="p-2">14/03/2024</td>
                            <td className="p-2">
                              <Button 
                                 variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setDocumentForm({ 
                                    type: 'correction_demande', 
                                    data: {
                                      numero: "DL-2024-001235",
                                      title: "Magazine Tech Innovation",
                                      type: "Périodique",
                                      status: "Non conforme"
                                    }
                                  });
                                }}
                              >
                                Corriger
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001236</td>
                            <td className="p-2">Atlas historique du Maroc</td>
                            <td className="p-2">Livre</td>
                            <td className="p-2">
                              <Badge variant="secondary">En cours</Badge>
                            </td>
                            <td className="p-2">13/03/2024</td>
                            <td className="p-2">
                              <Button 
                                 variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setConfirmAction({ 
                                    type: 'valider_conformite', 
                                    data: {
                                      numero: "DL-2024-001236",
                                      title: "Atlas historique du Maroc",
                                      type: "Livre",
                                      status: "En cours"
                                    }
                                  });
                                }}
                              >
                                Valider
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-4">
                <BNRMStatistics />
              </TabsContent>

              {/* Editorial Monitoring Tab */}
              <TabsContent value="editorial-monitoring" className="space-y-4">
                <BNRMEditorialMonitoring />
              </TabsContent>

              {/* Payment Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <BNRMPaymentNotificationSettings />
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Rapports Statistiques</span>
                      </CardTitle>
                      <CardDescription>
                        Tableaux de bord interactifs et export de données
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start hover:bg-accent"
                          onClick={generateISBNMonthlyReport}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Rapport mensuel agence ISBN
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start hover:bg-accent"
                          onClick={generateISSNReport}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Rapport centre international ISSN
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start hover:bg-accent"
                          onClick={generateDepositTypeStats}
                        >
                          <FileBarChart className="h-4 w-4 mr-2" />
                          Statistiques de dépôt par type
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start hover:bg-accent"
                          onClick={generatePublishersActivityReport}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Rapport activité éditeurs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span>Filtres Avancés</span>
                      </CardTitle>
                      <CardDescription>
                        Recherche multicritères et exports personnalisés
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par période
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par éditeur
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par type de support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Export Excel personnalisé
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu des statistiques globales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">2,847</div>
                        <div className="text-sm text-muted-foreground">Demandes traitées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">1,234</div>
                        <div className="text-sm text-muted-foreground">ISBN attribués</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">87</div>
                        <div className="text-sm text-muted-foreground">ISSN attribués</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">2.3j</div>
                        <div className="text-sm text-muted-foreground">Délai moyen</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Modales pour les différentes actions */}
        <Dialog open={selectedDepositModal === "registre"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registre des Entrées - Dépôts Physiques</DialogTitle>
              <DialogDescription>
                Consultation et gestion des dépôts physiques reçus
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Date de début</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Entrées récentes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>DL-2024-001234 - Guide du développeur React</span>
                    <Badge>Reçu</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>DL-2024-001235 - Magazine Tech Innovation</span>
                    <Badge variant="secondary">En attente</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Exporter le registre</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "conformite"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vérification de Conformité</DialogTitle>
              <DialogDescription>
                Contrôle de conformité des dépôts physiques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div className="space-y-2">
                <Label>Éléments à vérifier</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check1" />
                    <label htmlFor="check1">Exemplaires complets (nombre requis)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check2" />
                    <label htmlFor="check2">Page de garde conforme</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check3" />
                    <label htmlFor="check3">ISBN/ISSN présent</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check4" />
                    <label htmlFor="check4">Mentions légales complètes</label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Observations</Label>
                <Textarea placeholder="Notes sur la conformité..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button variant="destructive">Non conforme</Button>
                <Button>Conforme</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "accuse"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer Accusé de Réception</DialogTitle>
              <DialogDescription>
                Génération du document d'accusé de réception
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div>
                <Label>Date de réception</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Nombre d'exemplaires reçus</Label>
                <Input type="number" defaultValue="2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button><Download className="h-4 w-4 mr-2" />Générer PDF</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "formats"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Contrôle des Formats et Tailles</DialogTitle>
              <DialogDescription>
                Vérification technique des fichiers numériques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Fichiers en attente de validation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">document_1.pdf</p>
                      <p className="text-sm text-muted-foreground">2.3 MB - PDF/A-1b</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">couverture.jpg</p>
                      <p className="text-sm text-muted-foreground">1.8 MB - JPEG</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">metadata.xml</p>
                      <p className="text-sm text-muted-foreground">45 KB - XML</p>
                    </div>
                    <Badge variant="destructive">Format non supporté</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Valider les fichiers conformes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "integrite"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vérification d'Intégrité</DialogTitle>
              <DialogDescription>
                Contrôle de l'intégrité des fichiers numériques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Calcul checksum MD5</span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vérification signature numérique</span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scan antivirus</span>
                  <Badge className="bg-green-100 text-green-800">Propre</Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Générer rapport d'intégrité</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "archivage"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archivage Pérenne</DialogTitle>
              <DialogDescription>
                Configuration de l'archivage à long terme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div>
                <Label>Format de préservation</Label>
                <select className="w-full border rounded-md p-2">
                  <option>PDF/A-2b</option>
                  <option>TIFF (non compressé)</option>
                  <option>JPEG2000</option>
                </select>
              </div>
              <div>
                <Label>Niveau de redondance</Label>
                <select className="w-full border rounded-md p-2">
                  <option>Triple (recommandé)</option>
                  <option>Double</option>
                  <option>Simple</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button>Lancer l'archivage</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "details"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du Dépôt</DialogTitle>
              <DialogDescription>
                Informations complètes sur le dépôt {selectedDepositData?.number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Numéro de dépôt</Label>
                  <p className="font-medium">{selectedDepositData?.number}</p>
                </div>
                <div>
                  <Label>Titre</Label>
                  <p className="font-medium">{selectedDepositData?.title}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedDepositData?.type}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className="bg-green-100 text-green-800">{selectedDepositData?.status}</Badge>
                </div>
              </div>
              <div>
                <Label>Historique</Label>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dépôt enregistré</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 10:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contrôle de conformité</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 14:20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Validation finale</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 16:45</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AlertDialog pour confirmations */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === 'archivage_perenne' && 'Confirmer l\'archivage pérenne'}
                {confirmAction?.type === 'valider_conformite' && 'Valider la conformité'}
                {confirmAction?.type === 'rejeter_depot' && 'Rejeter le dépôt'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === 'archivage_perenne' && 
                  'Êtes-vous sûr de vouloir procéder à l\'archivage pérenne de ce dépôt numérique ? Cette action est irréversible.'
                }
                {confirmAction?.type === 'valider_conformite' && 
                  `Confirmer la validation de conformité pour le dépôt "${confirmAction.data?.numero}" ?`
                }
                {confirmAction?.type === 'rejeter_depot' && 
                  `Confirmer le rejet du dépôt "${confirmAction.data?.numero}" ? Le déposant sera notifié.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                toast({
                  title: "Action confirmée",
                  description: "L'opération a été effectuée avec succès."
                });
                setConfirmAction(null);
              }}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog pour formulaires de documents */}
        <Dialog open={!!documentForm} onOpenChange={() => setDocumentForm(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {documentForm?.type === 'registre_entrees' && 'Registre des entrées'}
                {documentForm?.type === 'accuse_reception' && 'Accusé de réception'}
                {documentForm?.type === 'correction_demande' && 'Demande de correction'}
                {documentForm?.type === 'rapport_conformite' && 'Rapport de conformité'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations nécessaires pour générer le document
              </DialogDescription>
            </DialogHeader>

            {/* Formulaire Registre des entrées */}
            {documentForm?.type === 'registre_entrees' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date d'entrée</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro d'enregistrement</Label>
                    <Input placeholder="AUTO-GÉNÉRÉ" disabled />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Déposant</Label>
                  <Input placeholder="Nom du déposant" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de document</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="livre">Livre</SelectItem>
                        <SelectItem value="periodique">Périodique</SelectItem>
                        <SelectItem value="these">Thèse</SelectItem>
                        <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'exemplaires</Label>
                    <Input type="number" min="1" defaultValue="2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre de l'œuvre</Label>
                  <Input placeholder="Titre complet" />
                </div>

                <div className="space-y-2">
                  <Label>ISBN/ISSN</Label>
                  <Input placeholder="Ex: 978-3-16-148410-0" />
                </div>

                <div className="space-y-2">
                  <Label>Observations</Label>
                  <Textarea placeholder="Remarques particulières..." rows={3} />
                </div>
              </div>
            )}

            {/* Formulaire Accusé de réception */}
            {documentForm?.type === 'accuse_reception' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinataire</Label>
                  <Input placeholder="Nom du déposant" />
                </div>
                
                <div className="space-y-2">
                  <Label>Adresse email</Label>
                  <Input type="email" placeholder="email@example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de réception</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro de dépôt</Label>
                    <Input placeholder="Ex: DL-2025-001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Documents reçus</Label>
                  <Textarea 
                    placeholder="Liste des documents reçus..."
                    rows={4}
                    defaultValue="- 2 exemplaires du livre&#10;- Formulaire de dépôt légal complété&#10;- Pièce d'identité du déposant"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Format de génération</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">PDF + Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message personnalisé (optionnel)</Label>
                  <Textarea placeholder="Message additionnel..." rows={3} />
                </div>
              </div>
            )}

            {/* Formulaire Demande de correction */}
            {documentForm?.type === 'correction_demande' && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm"><strong>Dépôt :</strong> {documentForm.data?.numero}</p>
                  <p className="text-sm"><strong>Type :</strong> {documentForm.data?.type}</p>
                </div>

                <div className="space-y-2">
                  <Label>Type de non-conformité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exemplaires_manquants">Exemplaires manquants</SelectItem>
                      <SelectItem value="documents_incomplets">Documents incomplets</SelectItem>
                      <SelectItem value="qualite_insuffisante">Qualité insuffisante</SelectItem>
                      <SelectItem value="metadata_incorrectes">Métadonnées incorrectes</SelectItem>
                      <SelectItem value="format_invalide">Format invalide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description détaillée</Label>
                  <Textarea 
                    placeholder="Décrivez précisément les éléments à corriger..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Actions requises</Label>
                  <Textarea 
                    placeholder="Listez les actions à effectuer par le déposant..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Délai de correction (jours)</Label>
                  <Input type="number" min="1" defaultValue="15" />
                </div>

                <div className="space-y-2">
                  <Label>Mode de notification</Label>
                  <Select defaultValue="email">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="courrier">Courrier postal</SelectItem>
                      <SelectItem value="both">Email + Courrier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Formulaire Rapport de conformité */}
            {documentForm?.type === 'rapport_conformite' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Numéro de dépôt</Label>
                  <Input defaultValue={documentForm.data?.numero} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Statut de conformité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conforme">Conforme</SelectItem>
                      <SelectItem value="conforme_reserve">Conforme avec réserves</SelectItem>
                      <SelectItem value="non_conforme">Non conforme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points vérifiés</Label>
                  <Textarea 
                    rows={6}
                    defaultValue="✓ Nombre d'exemplaires règlementaire&#10;✓ Qualité de l'impression&#10;✓ Complétude des métadonnées&#10;✓ Respect des formats&#10;✓ Documentation accompagnatrice"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observations</Label>
                  <Textarea placeholder="Remarques générales..." rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Validé par</Label>
                  <Input placeholder="Nom du validateur" />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDocumentForm(null)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Document généré",
                  description: "Le document a été créé avec succès."
                });
                setDocumentForm(null);
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Générer le document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WatermarkContainer>
  );
}