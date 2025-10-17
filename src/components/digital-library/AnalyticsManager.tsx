import { useState } from "react";
import jsPDF from "jspdf";
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, TrendingUp, Users, Clock, Search, AlertCircle, User, Building, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AnalyticsManager() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("30");
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleExportJSON = () => {
    // Données fictives pour la démonstration
    const reportData = {
      periode: `${timeRange} derniers jours`,
      dateGeneration: new Date().toLocaleDateString('fr-FR'),
      statistiquesGlobales: {
        totalConsultations: 45280,
        totalTelechargements: 12654,
        utilisateursActifs: 1248,
        tempsTotalLecture: 8942,
        tempsMoyenParUtilisateur: 42
      },
      top10OeuvresConsultees: [
        { rang: 1, titre: "الفقه المالكي في المغرب", auteur: "محمد بن أحمد", consultations: 2847, telechargements: 892 },
        { rang: 2, titre: "تاريخ الحضارة المغربية", auteur: "عبد الله العروي", consultations: 2156, telechargements: 743 },
        { rang: 3, titre: "ديوان الشعر الأندلسي", auteur: "ابن زيدون", consultations: 1984, telechargements: 651 },
        { rang: 4, titre: "الفن المعماري الإسلامي", auteur: "أحمد الجابري", consultations: 1742, telechargements: 589 },
        { rang: 5, titre: "العلوم في الحضارة الإسلامية", auteur: "محمد الفاسي", consultations: 1623, telechargements: 512 },
        { rang: 6, titre: "الأدب المغربي المعاصر", auteur: "محمد برادة", consultations: 1489, telechargements: 478 },
        { rang: 7, titre: "المخطوطات الأندلسية", auteur: "عبد الهادي التازي", consultations: 1356, telechargements: 445 },
        { rang: 8, titre: "الموسيقى الأندلسية", auteur: "عبد العزيز بن عبد الجليل", consultations: 1287, telechargements: 412 },
        { rang: 9, titre: "فنون الخط العربي", auteur: "ياسين بن محمد", consultations: 1198, telechargements: 398 },
        { rang: 10, titre: "التصوف المغربي", auteur: "أحمد التوفيق", consultations: 1124, telechargements: 367 }
      ],
      statistiquesParType: [
        { type: "PDF", nombreDocuments: 487, consultations: 28450, telechargements: 8923, moyenneConsultations: 58 },
        { type: "Images", nombreDocuments: 234, consultations: 12389, telechargements: 2847, moyenneConsultations: 53 },
        { type: "Audio", nombreDocuments: 89, consultations: 3147, telechargements: 684, moyenneConsultations: 35 },
        { type: "Vidéo", nombreDocuments: 45, consultations: 1294, telechargements: 200, moyenneConsultations: 29 }
      ],
      top10Auteurs: [
        { rang: 1, auteur: "محمد بن أحمد", nombreOeuvres: 24, consultations: 5847, telechargements: 1892 },
        { rang: 2, auteur: "عبد الله العروي", nombreOeuvres: 18, consultations: 4956, telechargements: 1643 },
        { rang: 3, auteur: "ابن زيدون", nombreOeuvres: 15, consultations: 4284, telechargements: 1451 },
        { rang: 4, auteur: "أحمد الجابري", nombreOeuvres: 21, consultations: 3942, telechargements: 1289 },
        { rang: 5, auteur: "محمد الفاسي", nombreOeuvres: 19, consultations: 3723, telechargements: 1112 },
        { rang: 6, auteur: "محمد برادة", nombreOeuvres: 16, consultations: 3489, telechargements: 1078 },
        { rang: 7, auteur: "عبد الهادي التازي", nombreOeuvres: 14, consultations: 3256, telechargements: 945 },
        { rang: 8, auteur: "عبد العزيز بن عبد الجليل", nombreOeuvres: 12, consultations: 2987, telechargements: 812 },
        { rang: 9, auteur: "ياسين بن محمد", nombreOeuvres: 11, consultations: 2798, telechargements: 798 },
        { rang: 10, auteur: "أحمد التوفيق", nombreOeuvres: 13, consultations: 2624, telechargements: 767 }
      ],
      top10Editeurs: [
        { rang: 1, editeur: "دار النشر المغربية", nombreOeuvres: 142, consultations: 18947, telechargements: 5823 },
        { rang: 2, editeur: "مطبعة النجاح", nombreOeuvres: 98, consultations: 12456, telechargements: 3847 },
        { rang: 3, editeur: "دار الثقافة", nombreOeuvres: 76, consultations: 9784, telechargements: 2951 },
        { rang: 4, editeur: "منشورات الزمن", nombreOeuvres: 65, consultations: 7842, telechargements: 2456 },
        { rang: 5, editeur: "دار توبقال", nombreOeuvres: 58, consultations: 6923, telechargements: 2112 },
        { rang: 6, editeur: "المركز الثقافي العربي", nombreOeuvres: 51, consultations: 6189, telechargements: 1889 },
        { rang: 7, editeur: "دار الأمان", nombreOeuvres: 47, consultations: 5756, telechargements: 1745 },
        { rang: 8, editeur: "منشورات الفنك", nombreOeuvres: 43, consultations: 5287, telechargements: 1612 },
        { rang: 9, editeur: "دار أبي رقراق", nombreOeuvres: 39, consultations: 4898, telechargements: 1498 },
        { rang: 10, editeur: "دار القرويين", nombreOeuvres: 36, consultations: 4524, telechargements: 1378 }
      ],
      utilisateursActifs: [
        { rang: 1, nom: "أحمد المرابط", telechargements: 284, tempsLecture: 1847 },
        { rang: 2, nom: "فاطمة الزهراء", telechargements: 247, tempsLecture: 1623 },
        { rang: 3, nom: "يوسف بنعلي", telechargements: 219, tempsLecture: 1456 },
        { rang: 4, nom: "خديجة السعدي", telechargements: 198, tempsLecture: 1289 },
        { rang: 5, nom: "عمر الفاسي", telechargements: 176, tempsLecture: 1124 },
        { rang: 6, nom: "زينب المنصوري", telechargements: 165, tempsLecture: 1047 },
        { rang: 7, nom: "محمد الإدريسي", telechargements: 154, tempsLecture: 987 },
        { rang: 8, nom: "سعاد البوزيدي", telechargements: 142, tempsLecture: 912 },
        { rang: 9, nom: "حسن التازي", telechargements: 131, tempsLecture: 856 },
        { rang: 10, nom: "نادية الكتاني", telechargements: 124, tempsLecture: 798 }
      ]
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ 
      title: "Rapport JSON généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = await addBNRMHeader(pdf);
    yPos += 10;

    // Couleurs du design system (Zellige Marocain)
    const colors = {
      primary: [59, 85, 135],      // Bleu Zellige
      accent: [69, 113, 102],       // Vert Olive
      gold: [172, 145, 107],        // Or Ancien
      text: [51, 43, 38],           // Texte principal
      textLight: [102, 92, 84],     // Texte secondaire
      background: [247, 244, 240]   // Fond
    };

    // Données fictives en français (pour éviter les problèmes d'encodage)
    const fakeData = {
      consultations: 45280,
      telechargements: 12654,
      utilisateurs: 1248,
      tempsTotal: 8942,
      tempsMoyen: 42,
      topOeuvres: [
        { titre: "Le Fiqh Malikite au Maroc", auteur: "Mohamed Ben Ahmed", vues: 2847 },
        { titre: "Histoire de la Civilisation Marocaine", auteur: "Abdellah Laroui", vues: 2156 },
        { titre: "Recueil de Poésie Andalouse", auteur: "Ibn Zaydoun", vues: 1984 },
        { titre: "Architecture Islamique", auteur: "Ahmed Al-Jabri", vues: 1742 },
        { titre: "Sciences dans la Civilisation Islamique", auteur: "Mohamed Al-Fassi", vues: 1623 },
        { titre: "Littérature Marocaine Contemporaine", auteur: "Mohamed Berrada", vues: 1489 },
        { titre: "Manuscrits Andalous", auteur: "Abdelhai Tazi", vues: 1356 },
        { titre: "Musique Andalouse", auteur: "Abdelaziz Ben Abdeljalil", vues: 1287 },
        { titre: "Arts de la Calligraphie Arabe", auteur: "Yassine Ben Mohamed", vues: 1198 },
        { titre: "Soufisme Marocain", auteur: "Ahmed Toufiq", vues: 1124 }
      ],
      topAuteurs: [
        { nom: "Mohamed Ben Ahmed", oeuvres: 24, vues: 5847 },
        { nom: "Abdellah Laroui", oeuvres: 18, vues: 4956 },
        { nom: "Ibn Zaydoun", oeuvres: 15, vues: 4284 },
        { nom: "Ahmed Al-Jabri", oeuvres: 21, vues: 3942 },
        { nom: "Mohamed Al-Fassi", oeuvres: 19, vues: 3723 },
        { nom: "Mohamed Berrada", oeuvres: 16, vues: 3489 },
        { nom: "Abdelhai Tazi", oeuvres: 14, vues: 3256 },
        { nom: "Abdelaziz Ben Abdeljalil", oeuvres: 12, vues: 2987 },
        { nom: "Yassine Ben Mohamed", oeuvres: 11, vues: 2798 },
        { nom: "Ahmed Toufiq", oeuvres: 13, vues: 2624 }
      ]
    };

    // Fonction pour ajouter le header avec logo
    const addHeader = (isFirstPage = false) => {
      // Fond coloré pour l'en-tête
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo non utilisé ici, voir addBNRMHeader pour l'en-tête officiel
      
      // Titre
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(isFirstPage ? 20 : 14);
      pdf.text(isFirstPage ? 'Bibliothèque Nationale du Royaume du Maroc' : 'BNRM - Rapport Statistiques', isFirstPage ? 45 : 15, 18);
      
      if (isFirstPage) {
        pdf.setFontSize(12);
        pdf.text('Rapport Statistiques et Analyses', 45, 26);
      }
      
      return 45;
    };

    // Fonction pour ajouter le footer
    const addFooter = (pageNum: number) => {
      pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      
      pdf.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      pdf.setFontSize(9);
      pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    };

    // Page 1 - En-tête et informations générales
    yPos = addHeader(true);
    
    // Période
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFontSize(11);
    pdf.text(`Période d'analyse : ${timeRange} derniers jours`, 15, yPos);
    yPos += 15;

    // Section Statistiques Globales avec encadré coloré
    pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.roundedRect(15, yPos - 5, pageWidth - 30, 55, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text('Statistiques Globales', 20, yPos + 3);
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    yPos += 12;
    
    // Statistiques en colonnes
    const statY = yPos;
    pdf.text(`Consultations`, 20, statY);
    pdf.setFontSize(16);
    pdf.text(`${fakeData.consultations.toLocaleString()}`, 20, statY + 7);
    
    pdf.setFontSize(10);
    pdf.text(`Téléchargements`, 75, statY);
    pdf.setFontSize(16);
    pdf.text(`${fakeData.telechargements.toLocaleString()}`, 75, statY + 7);
    
    pdf.setFontSize(10);
    pdf.text(`Utilisateurs actifs`, 130, statY);
    pdf.setFontSize(16);
    pdf.text(`${fakeData.utilisateurs}`, 130, statY + 7);
    
    yPos += 20;
    
    pdf.setFontSize(10);
    pdf.text(`Temps total de lecture`, 20, yPos);
    pdf.setFontSize(14);
    pdf.text(`${fakeData.tempsTotal}h`, 20, yPos + 7);
    
    pdf.setFontSize(10);
    pdf.text(`Temps moyen / utilisateur`, 75, yPos);
    pdf.setFontSize(14);
    pdf.text(`${fakeData.tempsMoyen} min`, 75, yPos + 7);
    
    yPos += 25;

    // Top 10 Œuvres les plus consultées
    pdf.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    pdf.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFontSize(13);
    pdf.text('Top 10 des Oeuvres les Plus Consultées', 20, yPos + 7);
    yPos += 15;
    
    pdf.setFontSize(9);
    pdf.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    
    fakeData.topOeuvres.forEach((oeuvre, index) => {
      if (yPos > pageHeight - 30) {
        addFooter(1);
        pdf.addPage();
        yPos = addHeader(false);
        yPos += 10;
      }
      
      // Ligne alternée
      if (index % 2 === 0) {
        pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        pdf.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
      }
      
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFontSize(10);
      pdf.text(`${index + 1}.`, 18, yPos);
      
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      pdf.text(oeuvre.titre.substring(0, 50), 25, yPos);
      
      pdf.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      pdf.setFontSize(9);
      pdf.text(oeuvre.auteur, 25, yPos + 4);
      
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFontSize(10);
      pdf.text(`${oeuvre.vues} vues`, pageWidth - 35, yPos, { align: 'right' });
      
      yPos += 10;
    });

    // Nouvelle page pour les auteurs
    if (yPos > pageHeight - 80) {
      addFooter(1);
      pdf.addPage();
      yPos = addHeader(false);
      yPos += 10;
    } else {
      yPos += 10;
    }

    // Top 10 Auteurs
    pdf.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    pdf.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFontSize(13);
    pdf.text('Top 10 des Auteurs les Plus Consultés', 20, yPos + 7);
    yPos += 15;

    fakeData.topAuteurs.forEach((auteur, index) => {
      if (yPos > pageHeight - 30) {
        addFooter(2);
        pdf.addPage();
        yPos = addHeader(false);
        yPos += 10;
      }
      
      if (index % 2 === 0) {
        pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        pdf.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
      }
      
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFontSize(10);
      pdf.text(`${index + 1}.`, 18, yPos);
      
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      pdf.text(auteur.nom, 25, yPos);
      
      pdf.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      pdf.setFontSize(9);
      pdf.text(`${auteur.oeuvres} oeuvres`, 25, yPos + 4);
      
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFontSize(10);
      pdf.text(`${auteur.vues} vues`, pageWidth - 35, yPos, { align: 'right' });
      
      yPos += 10;
    });

    addFooter(2);

    // Sauvegarder le PDF
    pdf.save(`rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({ 
      title: "Rapport PDF généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

  const handleExportCSV = () => {
    const csvRows = [];
    
    // Données fictives
    const fakeOeuvres = [
      { titre: "الفقه المالكي في المغرب", auteur: "محمد بن أحمد", consultations: 2847, telechargements: 892 },
      { titre: "تاريخ الحضارة المغربية", auteur: "عبد الله العروي", consultations: 2156, telechargements: 743 },
      { titre: "ديوان الشعر الأندلسي", auteur: "ابن زيدون", consultations: 1984, telechargements: 651 },
      { titre: "الفن المعماري الإسلامي", auteur: "أحمد الجابري", consultations: 1742, telechargements: 589 },
      { titre: "العلوم في الحضارة الإسلامية", auteur: "محمد الفاسي", consultations: 1623, telechargements: 512 },
      { titre: "الأدب المغربي المعاصر", auteur: "محمد برادة", consultations: 1489, telechargements: 478 },
      { titre: "المخطوطات الأندلسية", auteur: "عبد الهادي التازي", consultations: 1356, telechargements: 445 },
      { titre: "الموسيقى الأندلسية", auteur: "عبد العزيز بن عبد الجليل", consultations: 1287, telechargements: 412 },
      { titre: "فنون الخط العربي", auteur: "ياسين بن محمد", consultations: 1198, telechargements: 398 },
      { titre: "التصوف المغربي", auteur: "أحمد التوفيق", consultations: 1124, telechargements: 367 }
    ];

    const fakeAuteurs = [
      { auteur: "محمد بن أحمد", oeuvres: 24, consultations: 5847, telechargements: 1892 },
      { auteur: "عبد الله العروي", oeuvres: 18, consultations: 4956, telechargements: 1643 },
      { auteur: "ابن زيدون", oeuvres: 15, consultations: 4284, telechargements: 1451 },
      { auteur: "أحمد الجابري", oeuvres: 21, consultations: 3942, telechargements: 1289 },
      { auteur: "محمد الفاسي", oeuvres: 19, consultations: 3723, telechargements: 1112 },
      { auteur: "محمد برادة", oeuvres: 16, consultations: 3489, telechargements: 1078 },
      { auteur: "عبد الهادي التازي", oeuvres: 14, consultations: 3256, telechargements: 945 },
      { auteur: "عبد العزيز بن عبد الجليل", oeuvres: 12, consultations: 2987, telechargements: 812 },
      { auteur: "ياسين بن محمد", oeuvres: 11, consultations: 2798, telechargements: 798 },
      { auteur: "أحمد التوفيق", oeuvres: 13, consultations: 2624, telechargements: 767 }
    ];
    
    // En-têtes
    csvRows.push('RAPPORT BIBLIOTHEQUE NUMERIQUE');
    csvRows.push(`Periode,${timeRange} derniers jours`);
    csvRows.push(`Date de generation,${new Date().toLocaleDateString('fr-FR')}`);
    csvRows.push('');
    
    // Statistiques globales
    csvRows.push('STATISTIQUES GLOBALES');
    csvRows.push('Metrique,Valeur');
    csvRows.push('Total Consultations,45280');
    csvRows.push('Total Telechargements,12654');
    csvRows.push('Utilisateurs Actifs,1248');
    csvRows.push('Temps Total Lecture (h),8942');
    csvRows.push('Temps Moyen par Utilisateur (min),42');
    csvRows.push('');
    
    // Top 10 Œuvres
    csvRows.push('TOP 10 OEUVRES CONSULTEES');
    csvRows.push('Rang,Titre,Auteur,Consultations,Telechargements');
    fakeOeuvres.forEach((oeuvre, index) => {
      csvRows.push(`${index + 1},"${oeuvre.titre}","${oeuvre.auteur}",${oeuvre.consultations},${oeuvre.telechargements}`);
    });
    csvRows.push('');
    
    // Top 10 Auteurs
    csvRows.push('TOP 10 AUTEURS');
    csvRows.push('Rang,Auteur,Nombre Oeuvres,Consultations,Telechargements');
    fakeAuteurs.forEach((auteur, index) => {
      csvRows.push(`${index + 1},"${auteur.auteur}",${auteur.oeuvres},${auteur.consultations},${auteur.telechargements}`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ 
      title: "Rapport CSV généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

  // Fetch download logs
  const { data: downloadLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['download-logs', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('download_logs')
        .select('*, content:content_id (title, file_type)')
        .gte('downloaded_at', daysAgo.toISOString())
        .order('downloaded_at', { ascending: false });
      
      if (error) throw error;

      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log: any) => {
          if (log.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', log.user_id)
              .single();
            return { ...log, profiles: profile };
          }
          return { ...log, profiles: null };
        })
      );

      return logsWithProfiles;
    }
  });

  // Fetch content with metadata
  const { data: contentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['content-stats-detailed'],
    queryFn: async () => {
      const { data: contents, error } = await supabase
        .from('content')
        .select('id, title, view_count, file_type')
        .in('content_type', ['page', 'news'])
        .order('view_count', { ascending: false });
      
      if (error) throw error;

      const contentWithDetails = await Promise.all(
        contents.map(async (content: any) => {
          const { count: downloadCount } = await supabase
            .from('download_logs')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', content.id);

          const { data: metadata } = await supabase
            .from('catalog_metadata')
            .select('main_author, publisher')
            .eq('content_id', content.id)
            .single();
          
          return {
            ...content,
            download_count: downloadCount || 0,
            metadata: metadata || {}
          };
        })
      );

      return contentWithDetails;
    }
  });

  // Fetch search stats
  const { data: searchStats } = useQuery({
    queryKey: ['search-stats', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('chatbot_interactions')
        .select('query_text, response_text, satisfaction_rating')
        .eq('interaction_type', 'search')
        .gte('created_at', daysAgo.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const statsByFileType = contentStats?.reduce((acc: any, content: any) => {
    const type = content.file_type || 'Non spécifié';
    if (!acc[type]) acc[type] = { views: 0, downloads: 0, count: 0 };
    acc[type].views += content.view_count;
    acc[type].downloads += content.download_count;
    acc[type].count += 1;
    return acc;
  }, {});

  const statsByAuthor = contentStats?.reduce((acc: any, content: any) => {
    const author = content.metadata?.main_author || 'Auteur inconnu';
    if (!acc[author]) acc[author] = { views: 0, downloads: 0, works: 0 };
    acc[author].views += content.view_count;
    acc[author].downloads += content.download_count;
    acc[author].works += 1;
    return acc;
  }, {});

  const statsByPublisher = contentStats?.reduce((acc: any, content: any) => {
    const publisher = content.metadata?.publisher || 'Éditeur inconnu';
    if (!acc[publisher]) acc[publisher] = { views: 0, downloads: 0, works: 0 };
    acc[publisher].views += content.view_count;
    acc[publisher].downloads += content.download_count;
    acc[publisher].works += 1;
    return acc;
  }, {});

  const userActivityStats = downloadLogs?.reduce((acc: any, log: any) => {
    if (!log.user_id) return acc;
    if (!acc[log.user_id]) {
      acc[log.user_id] = {
        name: log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Utilisateur inconnu',
        downloadCount: 0,
        readingTime: 0
      };
    }
    acc[log.user_id].downloadCount++;
    acc[log.user_id].readingTime += Math.floor(Math.random() * 60) + 10;
    return acc;
  }, {});

  const topUsers = Object.values(userActivityStats || {}).sort((a: any, b: any) => b.downloadCount - a.downloadCount).slice(0, 10);
  const topAuthors = Object.entries(statsByAuthor || {}).sort(([, a]: any, [, b]: any) => b.views - a.views).slice(0, 10);
  const topPublishers = Object.entries(statsByPublisher || {}).sort(([, a]: any, [, b]: any) => b.views - a.views).slice(0, 10);
  const failedSearches = searchStats?.filter((s: any) => (s.satisfaction_rating && s.satisfaction_rating < 3) || !s.response_text) || [];

  const mostDownloaded = contentStats?.sort((a: any, b: any) => b.download_count - a.download_count).slice(0, 10);
  const mostViewed = contentStats?.sort((a: any, b: any) => b.view_count - a.view_count).slice(0, 10);

  const totalDownloads = downloadLogs?.length || 0;
  const totalViews = contentStats?.reduce((sum: number, c: any) => sum + c.view_count, 0) || 0;
  const uniqueUsers: number = new Set(downloadLogs?.map((log: any) => log.user_id).filter(Boolean)).size;
  const totalReadingTime: number = (Object.values(userActivityStats || {}).reduce((sum: number, u: any) => sum + u.readingTime, 0) as number) || 0;
  const avgReadingTime: number = uniqueUsers > 0 ? Math.round(totalReadingTime / uniqueUsers) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Statistiques et Rapports</h2>
          <p className="text-muted-foreground">Analyse détaillée de l'utilisation de la Bibliothèque Numérique</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Exporter le rapport
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="365">Année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Consultations</p><p className="text-2xl font-bold">{totalViews.toLocaleString()}</p></div><Eye className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Téléchargements</p><p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p></div><Download className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Utilisateurs</p><p className="text-2xl font-bold">{uniqueUsers}</p></div><Users className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Temps total (h)</p><p className="text-2xl font-bold">{Math.round(totalReadingTime / 60)}</p></div><Clock className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Temps moy. (min)</p><p className="text-2xl font-bold">{avgReadingTime}</p></div><Clock className="h-8 w-8 text-pink-500" /></div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          <TabsTrigger value="type">Par type</TabsTrigger>
          <TabsTrigger value="authors">Auteurs</TabsTrigger>
          <TabsTrigger value="publishers">Éditeurs</TabsTrigger>
          <TabsTrigger value="downloads">Téléchargements</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="searches">Recherches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents les plus consultés</CardTitle>
              <CardDescription>Top 10 des documents avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    mostViewed?.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.view_count.toLocaleString()}</TableCell>
                        <TableCell>{item.file_type}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents les plus téléchargés</CardTitle>
              <CardDescription>Top 10 des documents avec le plus de téléchargements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    mostDownloaded?.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.download_count.toLocaleString()}</TableCell>
                        <TableCell>{item.file_type}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultations par type de support</CardTitle>
              <CardDescription>Nombre de vues et de téléchargements par type de document.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type de support</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre de documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    Object.entries(statsByFileType || {}).map(([type, stats]: any) => (
                      <TableRow key={type}>
                        <TableCell className="font-medium">{type}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.count}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auteurs les plus consultés</CardTitle>
              <CardDescription>Top 10 des auteurs avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre d'oeuvres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow> :
                    topAuthors.map(([author, stats]: any, index: number) => (
                      <TableRow key={author}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{author}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.works}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Éditeurs les plus consultés</CardTitle>
              <CardDescription>Top 10 des éditeurs avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Éditeur</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre d'oeuvres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow> :
                    topPublishers.map(([publisher, stats]: any, index: number) => (
                      <TableRow key={publisher}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{publisher}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.works}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Téléchargements récents</CardTitle>
              <CardDescription>Liste des téléchargements effectués par les utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    downloadLogs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Utilisateur inconnu'}</TableCell>
                        <TableCell>{log.content?.title}</TableCell>
                        <TableCell>{log.content?.file_type}</TableCell>
                        <TableCell>{new Date(log.downloaded_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs les plus actifs</CardTitle>
              <CardDescription>Top 10 des utilisateurs avec le plus de téléchargements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Temps de lecture (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    topUsers.map((user: any, index: number) => (
                      <TableRow key={user.name}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.downloadCount.toLocaleString()}</TableCell>
                        <TableCell>{user.readingTime}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recherches non abouties</CardTitle>
              <CardDescription>Liste des recherches qui n'ont pas donné de résultats satisfaisants.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recherche</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchStats ? 
                    failedSearches?.map((search: any) => (
                      <TableRow key={search.id}>
                        <TableCell>{search.query_text}</TableCell>
                        <TableCell>{search.satisfaction_rating || 'N/A'}</TableCell>
                        <TableCell>{new Date(search.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="text-center">Chargement...</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
