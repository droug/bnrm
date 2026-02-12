import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollableDialog, ScrollableDialogContent, ScrollableDialogDescription, ScrollableDialogHeader, ScrollableDialogTitle, ScrollableDialogTrigger, ScrollableDialogBody } from "@/components/ui/scrollable-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Mail, FileText, Calendar, Send, Settings, AlertCircle, CheckCircle, Clock, XCircle, X, Undo2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';
import { SearchPagination } from "@/components/ui/search-pagination";

interface EditorialMonitoringItem {
  id: string;
  dlNumber: string;
  title: string;
  author: string;
  publisher: string;
  attributionDate: string;
  daysElapsed: number;
  status: 'pending' | 'reminded_20' | 'reminded_40' | 'claim_sent' | 'received' | 'rejected';
  lastAction: string;
  nextAction: string;
  nextActionDate: string;
  rejectionReason?: string;
}

interface NotificationSettings {
  reminder20Enabled: boolean;
  reminder40Enabled: boolean;
  claimEnabled: boolean;
  reminder20Days: number;
  reminder40Days: number;
  claimDays: number;
  emailTemplate20: string;
  emailTemplate40: string;
  autoSend: boolean;
}

export default function BNRMEditorialMonitoring() {
  const [items, setItems] = useState<EditorialMonitoringItem[]>([
    {
      id: "1",
      dlNumber: "DL-2025-001234",
      title: "Histoire du Maroc Contemporain",
      author: "Ahmed Bennani",
      publisher: "Editions Marocaines",
      attributionDate: "2025-09-15",
      daysElapsed: 23,
      status: "reminded_20",
      lastAction: "Rappel 20j envoyé",
      nextAction: "Rappel 40j",
      nextActionDate: "2025-10-25"
    },
    {
      id: "2",
      dlNumber: "DL-2025-001189",
      title: "La Littérature Amazigh",
      author: "Fatima Ouali",
      publisher: "Dar El Kitab",
      attributionDate: "2025-08-20",
      daysElapsed: 48,
      status: "reminded_40",
      lastAction: "Rappel 40j envoyé",
      nextAction: "Lettre réclamation",
      nextActionDate: "2025-10-20"
    },
    {
      id: "3",
      dlNumber: "DL-2025-001298",
      title: "Économie et Développement",
      author: "Mohamed Alaoui",
      publisher: "Presses Universitaires",
      attributionDate: "2025-07-10",
      daysElapsed: 88,
      status: "claim_sent",
      lastAction: "Lettre réclamation envoyée",
      nextAction: "Suivi juridique",
      nextActionDate: "2025-10-15"
    },
    {
      id: "4",
      dlNumber: "DL-2025-001156",
      title: "Guide Pratique du Marketing Digital",
      author: "Karim Benjelloun",
      publisher: "Editions Modernes",
      attributionDate: "2025-06-15",
      daysElapsed: 115,
      status: "rejected",
      lastAction: "Demande rejetée",
      nextAction: "N/A",
      nextActionDate: "",
      rejectionReason: "Documents incomplets : absence de justificatif du statut d'éditeur et informations ISBN manquantes dans la déclaration initiale."
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    reminder20Enabled: true,
    reminder40Enabled: true,
    claimEnabled: true,
    reminder20Days: 20,
    reminder40Days: 40,
    claimDays: 60,
    emailTemplate20: "Rappel du dépôt légal après 20 jours",
    emailTemplate40: "Rappel du dépôt légal après 40 jours",
    autoSend: false
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [confirmCancelRejectOpen, setConfirmCancelRejectOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditorialMonitoringItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const allColumns = [
    { key: "dlNumber", label: "N° DL" },
    { key: "title", label: "Titre" },
    { key: "author", label: "Auteur" },
    { key: "publisher", label: "Éditeur" },
    { key: "attribution", label: "Attribution" },
    { key: "daysElapsed", label: "Jours écoulés" },
    { key: "status", label: "Statut" },
    { key: "lastAction", label: "Dernière action" },
    { key: "nextAction", label: "Prochaine action" },
    { key: "actions", label: "Actions" },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => 
    Object.fromEntries(allColumns.map(c => [c.key, true]))
  );

  const toggleColumn = (key: string) => {
    // Don't allow hiding "actions" column
    if (key === "actions") return;
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isColumnVisible = (key: string) => visibleColumns[key] !== false;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
      reminded_20: { label: "Rappel 20j", variant: "default" as const, icon: Bell },
      reminded_40: { label: "Rappel 40j", variant: "default" as const, icon: AlertCircle },
      claim_sent: { label: "Réclamation", variant: "destructive" as const, icon: Mail },
      received: { label: "Reçu", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rejeté", variant: "destructive" as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const generateClaimLetter = async (item: EditorialMonitoringItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // En-tête officiel BNRM
    const headerY = await addBNRMHeader(doc);

    // Informations de l'expéditeur (à gauche)
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Royaume du Maroc", 15, 50);
    doc.text("Ministère de la Jeunesse, de la Culture", 15, 55);
    doc.text("et de la Communication", 15, 60);
    doc.text("Département de la Culture", 15, 65);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 15, 72);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Avenue Ibn Battouta, BP 1003", 15, 77);
    doc.text("Rabat - Agdal, Maroc", 15, 82);
    doc.text("Tél: +212 (0)5 37 77 18 74", 15, 87);

    // Date et référence (à droite)
    const today = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Rabat, le ${today}`, pageWidth - 15, 50, { align: 'right' });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text(`Réf: BNRM/ABN/DL/${item.dlNumber}`, pageWidth - 15, 58, { align: 'right' });

    // Cadre pour le destinataire
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, 95, 90, 25, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("À l'attention de", 20, 102);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(item.publisher, 20, 108);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Concernant: "${item.title}"`, 20, 114);

    // Objet de la lettre - encadré
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(15, 130, pageWidth - 15, 130);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text("OBJET : RÉCLAMATION - DÉPÔT LÉGAL", pageWidth / 2, 138, { align: 'center' });
    doc.line(15, 143, pageWidth - 15, 143);

    // Corps de la lettre avec formatage amélioré
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    
    let yPos = 155;
    const lineHeight = 6;
    const marginLeft = 15;
    const marginRight = 15;
    const maxWidth = pageWidth - marginLeft - marginRight;

    // Salutation
    doc.text("Madame, Monsieur,", marginLeft, yPos);
    yPos += lineHeight * 1.5;

    // Paragraphe 1 - Contexte
    const para1 = `Nous accusons réception de votre déclaration de dépôt légal portant le numéro ${item.dlNumber}, concernant l'ouvrage intitulé "${item.title}" de ${item.author}, pour lequel un numéro de dépôt légal vous a été attribué en date du ${new Date(item.attributionDate).toLocaleDateString('fr-FR')}.`;
    const para1Lines = doc.splitTextToSize(para1, maxWidth);
    doc.text(para1Lines, marginLeft, yPos);
    yPos += para1Lines.length * lineHeight + 4;

    // Paragraphe 2 - Constat
    doc.setFont(undefined, 'bold');
    const para2 = "Conformément aux dispositions de la loi n° 67-99 relative au dépôt légal et de ses textes d'application, nous constatons avec regret que les exemplaires réglementaires n'ont pas été déposés à la Bibliothèque Nationale dans les délais légalement impartis.";
    const para2Lines = doc.splitTextToSize(para2, maxWidth);
    doc.text(para2Lines, marginLeft, yPos);
    doc.setFont(undefined, 'normal');
    yPos += para2Lines.length * lineHeight + 4;

    // Paragraphe 3 - Rappels précédents
    const para3 = `Malgré nos rappels successifs en date des ${new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')} et ${new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}, aucun exemplaire n'a été reçu à ce jour par nos services.`;
    const para3Lines = doc.splitTextToSize(para3, maxWidth);
    doc.text(para3Lines, marginLeft, yPos);
    yPos += para3Lines.length * lineHeight + 4;

    // Encadré avec demande - fond coloré
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPos - 2, maxWidth, 20, 2, 2, 'FD');
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    const para4 = "Par conséquent, nous vous prions instamment de bien vouloir régulariser votre situation en déposant les exemplaires requis dans un délai maximum de QUINZE (15) jours à compter de la réception de la présente lettre.";
    const para4Lines = doc.splitTextToSize(para4, maxWidth - 4);
    doc.text(para4Lines, marginLeft + 2, yPos + 4);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    yPos += 24;

    // Paragraphe 5 - Conséquences
    doc.setFont(undefined, 'italic');
    const para5 = "À défaut de régularisation dans les délais impartis, nous nous verrons dans l'obligation de transmettre votre dossier au Service des Affaires Juridiques pour les suites légales appropriées, conformément aux sanctions prévues par la loi.";
    const para5Lines = doc.splitTextToSize(para5, maxWidth);
    doc.text(para5Lines, marginLeft, yPos);
    doc.setFont(undefined, 'normal');
    yPos += para5Lines.length * lineHeight + 6;

    // Formule de politesse
    const closing = "Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.";
    const closingLines = doc.splitTextToSize(closing, maxWidth);
    doc.text(closingLines, marginLeft, yPos);
    yPos += closingLines.length * lineHeight + 10;

    // Signature
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    doc.text("Le Chef du Département", pageWidth - 15, yPos, { align: 'right' });
    doc.text("Agence Bibliographique Nationale", pageWidth - 15, yPos + 6, { align: 'right' });
    
    // Cachet (simulé)
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.circle(pageWidth - 35, yPos + 18, 12, 'S');
    doc.setFontSize(7);
    doc.text("BNRM", pageWidth - 35, yPos + 17, { align: 'center' });
    doc.text("ABN", pageWidth - 35, yPos + 20, { align: 'center' });

    // Ligne de séparation footer
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

    // Footer avec informations de contact
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Bibliothèque Nationale du Royaume du Maroc - Avenue Ibn Battouta, BP 1003, Rabat-Agdal", pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text("Tél: +212 (0)5 37 77 18 74 | Fax: +212 (0)5 37 77 19 79 | Email: contact@bnrm.ma | www.bnrm.ma", pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFont(undefined, 'italic');
    doc.setFontSize(6);
    doc.text("Document généré automatiquement par le système de gestion du dépôt légal - Ne nécessite pas de signature manuscrite", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Reclamation_DL_${item.dlNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Lettre de réclamation générée avec succès");
  };

  const generateRejectionLetter = async (item: EditorialMonitoringItem, reason: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // En-tête officiel BNRM
    const headerYReject = await addBNRMHeader(doc);

    // Informations de l'expéditeur
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Royaume du Maroc", 15, 50);
    doc.text("Ministère de la Jeunesse, de la Culture", 15, 55);
    doc.text("et de la Communication", 15, 60);
    doc.text("Département de la Culture", 15, 65);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 15, 72);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Avenue Ibn Battouta, BP 1003", 15, 77);
    doc.text("Rabat - Agdal, Maroc", 15, 82);
    doc.text("Tél: +212 (0)5 37 77 18 74", 15, 87);

    // Date et référence
    const today = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Rabat, le ${today}`, pageWidth - 15, 50, { align: 'right' });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text(`Réf: BNRM/ABN/DL/${item.dlNumber}`, pageWidth - 15, 58, { align: 'right' });

    // Cadre pour le destinataire
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, 95, 90, 25, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("À l'attention de", 20, 102);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(item.publisher, 20, 108);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Concernant: "${item.title}"`, 20, 114);

    // Objet de la lettre - encadré
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(15, 130, pageWidth - 15, 130);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text("OBJET : REJET DE LA DEMANDE DE DÉPÔT LÉGAL", pageWidth / 2, 138, { align: 'center' });
    doc.line(15, 143, pageWidth - 15, 143);

    // Corps de la lettre
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    
    let yPosReject = 155;
    const lineHeight = 6;
    const marginLeft = 15;
    const marginRight = 15;
    const maxWidth = pageWidth - marginLeft - marginRight;

    // Salutation
    doc.text("Madame, Monsieur,", marginLeft, yPosReject);
    yPosReject += lineHeight * 1.5;

    // Paragraphe 1 - Accusé de réception
    const para1 = `Nous accusons réception de votre demande de dépôt légal portant le numéro ${item.dlNumber}, concernant l'ouvrage intitulé "${item.title}" de ${item.author}, reçue en date du ${new Date(item.attributionDate).toLocaleDateString('fr-FR')}.`;
    const para1Lines = doc.splitTextToSize(para1, maxWidth);
    doc.text(para1Lines, marginLeft, yPosReject);
    yPosReject += para1Lines.length * lineHeight + 4;

    // Paragraphe 2 - Analyse et décision
    const para2 = "Après examen attentif de votre demande par nos services compétents, nous avons le regret de vous informer que celle-ci ne peut être validée pour les raisons suivantes :";
    const para2Lines = doc.splitTextToSize(para2, maxWidth);
    doc.text(para2Lines, marginLeft, yPosReject);
    yPosReject += para2Lines.length * lineHeight + 4;

    // Encadré avec motif de rejet
    doc.setFillColor(255, 240, 240);
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPosReject - 2, maxWidth, 25, 2, 2, 'FD');
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.setFontSize(9);
    doc.text("MOTIF(S) DE REJET :", marginLeft + 2, yPosReject + 4);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    const reasonLines = doc.splitTextToSize(reason, maxWidth - 4);
    doc.text(reasonLines, marginLeft + 2, yPosReject + 10);
    yPosReject += 29;

    // Paragraphe 3 - Conformité légale
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const para3 = "Cette décision a été prise en conformité avec les dispositions de la loi n° 67-99 relative au dépôt légal et de ses textes d'application, notamment les articles régissant les conditions et critères d'attribution du numéro de dépôt légal.";
    const para3Lines = doc.splitTextToSize(para3, maxWidth);
    doc.text(para3Lines, marginLeft, yPosReject);
    yPosReject += para3Lines.length * lineHeight + 6;

    // Encadré avec recours possible
    doc.setFillColor(240, 248, 255);
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPosReject - 2, maxWidth, 22, 2, 2, 'FD');
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(9);
    doc.text("POSSIBILITÉ DE RECOURS :", marginLeft + 2, yPosReject + 4);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    const recours = "Vous disposez d'un délai de 30 jours à compter de la réception de cette lettre pour soumet une nouvelle demande rectifiée, accompagnée des documents et justificatifs requis.";
    const recoursLines = doc.splitTextToSize(recours, maxWidth - 4);
    doc.text(recoursLines, marginLeft + 2, yPosReject + 10);
    yPosReject += 26;

    // Paragraphe 4 - Assistance
    const para4 = "Nos services restent à votre disposition pour toute information complémentaire ou assistance dans la préparation d'une nouvelle demande conforme aux exigences réglementaires.";
    const para4Lines = doc.splitTextToSize(para4, maxWidth);
    doc.text(para4Lines, marginLeft, yPosReject);
    yPosReject += para4Lines.length * lineHeight + 6;

    // Formule de politesse
    const closing = "Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.";
    const closingLines = doc.splitTextToSize(closing, maxWidth);
    doc.text(closingLines, marginLeft, yPosReject);
    yPosReject += closingLines.length * lineHeight + 10;

    // Signature
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    doc.text("Le Chef du Département", pageWidth - 15, yPosReject, { align: 'right' });
    doc.text("Agence Bibliographique Nationale", pageWidth - 15, yPosReject + 6, { align: 'right' });
    
    // Cachet (simulé)
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.circle(pageWidth - 35, yPosReject + 18, 12, 'S');
    doc.setFontSize(7);
    doc.text("BNRM", pageWidth - 35, yPosReject + 17, { align: 'center' });
    doc.text("ABN", pageWidth - 35, yPosReject + 20, { align: 'center' });

    // Ligne de séparation footer
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

    // Footer
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Bibliothèque Nationale du Royaume du Maroc - Avenue Ibn Battouta, BP 1003, Rabat-Agdal", pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text("Tél: +212 (0)5 37 77 18 74 | Fax: +212 (0)5 37 77 19 79 | Email: contact@bnrm.ma | www.bnrm.ma", pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFont(undefined, 'italic');
    doc.setFontSize(6);
    doc.text("Document généré automatiquement par le système de gestion du dépôt légal - Ne nécessite pas de signature manuscrite", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Rejet_DL_${item.dlNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Lettre de rejet générée avec succès");
  };

  const sendReminder = (item: EditorialMonitoringItem, type: '20' | '40') => {
    toast.success(`Rappel ${type} jours envoyé pour ${item.dlNumber}`);
    // Update item status
    const newStatus = type === '20' ? 'reminded_20' : 'reminded_40';
    setItems(items.map(i => 
      i.id === item.id 
        ? { ...i, status: newStatus as any, lastAction: `Rappel ${type}j envoyé` }
        : i
    ));
  };

  const handleRejectClick = () => {
    console.log("handleRejectClick appelé, raison:", rejectionReason);
    if (!rejectionReason.trim()) {
      toast.error("Veuillez saisir un motif de rejet");
      return;
    }
    // Ouvrir la fenêtre de confirmation
    console.log("Ouverture de la confirmation");
    setConfirmRejectOpen(true);
  };

  const handleRejectConfirm = () => {
    console.log("handleRejectConfirm appelé");
    if (!selectedItem || !rejectionReason.trim()) {
      console.log("Erreur: item ou raison manquant");
      return;
    }

    console.log("Génération de la lettre de rejet pour:", selectedItem.dlNumber);
    generateRejectionLetter(selectedItem, rejectionReason);
    
    setItems(items.map(i => 
      i.id === selectedItem.id 
        ? { ...i, status: 'rejected' as any, lastAction: 'Demande rejetée', rejectionReason }
        : i
    ));
    
    setConfirmRejectOpen(false);
    setRejectDialogOpen(false);
    setRejectionReason("");
    setSelectedItem(null);
  };

  const handleCancelReject = () => {
    if (!selectedItem) {
      return;
    }

    setItems(items.map(i => 
      i.id === selectedItem.id 
        ? { 
            ...i, 
            status: 'pending' as any, 
            lastAction: 'Rejet annulé - En attente de traitement',
            rejectionReason: undefined,
            nextAction: 'Rappel 20j',
            nextActionDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        : i
    ));
    
    toast.success("Le rejet a été annulé. La demande est réactivée.");
    setConfirmCancelRejectOpen(false);
    setSelectedItem(null);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.dlNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Veille Éditoriale</h2>
          <p className="text-muted-foreground">
            Suivi des publications non déposées après attribution du numéro DL
          </p>
        </div>
        <ScrollableDialog>
          <ScrollableDialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </ScrollableDialogTrigger>
          <ScrollableDialogContent className="max-w-2xl">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Paramètres de la Veille Éditoriale</ScrollableDialogTitle>
              <ScrollableDialogDescription>
                Configuration des notifications et rappels automatiques
              </ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rappel à 20 jours</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer un rappel après 20 jours
                      </p>
                    </div>
                    <Switch
                      checked={settings.reminder20Enabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, reminder20Enabled: checked })
                      }
                    />
                  </div>

                  {settings.reminder20Enabled && (
                    <div className="space-y-2 pl-4">
                      <Label>Nombre de jours</Label>
                      <Input
                        type="number"
                        value={settings.reminder20Days}
                        onChange={(e) =>
                          setSettings({ ...settings, reminder20Days: parseInt(e.target.value) })
                        }
                      />
                      <Label>Modèle d'email</Label>
                      <Textarea
                        value={settings.emailTemplate20}
                        onChange={(e) =>
                          setSettings({ ...settings, emailTemplate20: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rappel à 40 jours</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer un rappel après 40 jours
                      </p>
                    </div>
                    <Switch
                      checked={settings.reminder40Enabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, reminder40Enabled: checked })
                      }
                    />
                  </div>

                  {settings.reminder40Enabled && (
                    <div className="space-y-2 pl-4">
                      <Label>Nombre de jours</Label>
                      <Input
                        type="number"
                        value={settings.reminder40Days}
                        onChange={(e) =>
                          setSettings({ ...settings, reminder40Days: parseInt(e.target.value) })
                        }
                      />
                      <Label>Modèle d'email</Label>
                      <Textarea
                        value={settings.emailTemplate40}
                        onChange={(e) =>
                          setSettings({ ...settings, emailTemplate40: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lettre de réclamation</Label>
                      <p className="text-sm text-muted-foreground">
                        Générer après 2 mois (60 jours)
                      </p>
                    </div>
                    <Switch
                      checked={settings.claimEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, claimEnabled: checked })
                      }
                    />
                  </div>

                  {settings.claimEnabled && (
                    <div className="space-y-2 pl-4">
                      <Label>Nombre de jours</Label>
                      <Input
                        type="number"
                        value={settings.claimDays}
                        onChange={(e) =>
                          setSettings({ ...settings, claimDays: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label>Envoi automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer automatiquement les rappels et réclamations
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSend}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoSend: checked })
                    }
                  />
                </div>
              </div>
            </ScrollableDialogBody>
          </ScrollableDialogContent>
        </ScrollableDialog>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="h-11">
          <TabsTrigger value="monitoring" className="text-base font-medium">Suivi</TabsTrigger>
          <TabsTrigger value="statistics" className="text-base font-medium">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications en attente de dépôt</CardTitle>
              <CardDescription>
                Liste des publications ayant reçu un numéro DL mais dont les exemplaires n'ont pas été déposés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par numéro DL, titre, auteur ou éditeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="reminded_20">Rappel 20j</SelectItem>
                    <SelectItem value="reminded_40">Rappel 40j</SelectItem>
                    <SelectItem value="claim_sent">Réclamation</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                    <SelectItem value="received">Reçu</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0" title="Colonnes à afficher">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 bg-popover z-50">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm mb-2">Colonnes visibles</h4>
                      {allColumns.filter(c => c.key !== "actions").map((col) => (
                        <label key={col.key} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-muted cursor-pointer text-sm">
                          <Checkbox
                            checked={isColumnVisible(col.key)}
                            onCheckedChange={() => toggleColumn(col.key)}
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isColumnVisible("dlNumber") && <TableHead>N° DL</TableHead>}
                      {isColumnVisible("title") && <TableHead>Titre</TableHead>}
                      {isColumnVisible("author") && <TableHead>Auteur</TableHead>}
                      {isColumnVisible("publisher") && <TableHead>Éditeur</TableHead>}
                      {isColumnVisible("attribution") && <TableHead>Attribution</TableHead>}
                      {isColumnVisible("daysElapsed") && <TableHead>Jours écoulés</TableHead>}
                      {isColumnVisible("status") && <TableHead>Statut</TableHead>}
                      {isColumnVisible("lastAction") && <TableHead>Dernière action</TableHead>}
                      {isColumnVisible("nextAction") && <TableHead>Prochaine action</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow key={item.id}>
                        {isColumnVisible("dlNumber") && <TableCell className="font-medium">{item.dlNumber}</TableCell>}
                        {isColumnVisible("title") && <TableCell>{item.title}</TableCell>}
                        {isColumnVisible("author") && <TableCell>{item.author}</TableCell>}
                        {isColumnVisible("publisher") && <TableCell>{item.publisher}</TableCell>}
                        {isColumnVisible("attribution") && <TableCell>{new Date(item.attributionDate).toLocaleDateString('fr-FR')}</TableCell>}
                        {isColumnVisible("daysElapsed") && (
                          <TableCell>
                            <Badge variant={item.daysElapsed > 60 ? "destructive" : item.daysElapsed > 40 ? "default" : "secondary"}>
                              {item.daysElapsed}j
                            </Badge>
                          </TableCell>
                        )}
                        {isColumnVisible("status") && <TableCell>{getStatusBadge(item.status)}</TableCell>}
                        {isColumnVisible("lastAction") && <TableCell className="text-sm text-muted-foreground">{item.lastAction}</TableCell>}
                        {isColumnVisible("nextAction") && (
                          <TableCell>
                            <div className="text-sm">
                              <div>{item.nextAction}</div>
                              <div className="text-muted-foreground text-xs">{new Date(item.nextActionDate).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.daysElapsed >= 20 && item.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminder(item, '20')}
                              >
                                <Bell className="h-3 w-3 mr-1" />
                                Rappel 20j
                              </Button>
                            )}
                            {item.daysElapsed >= 40 && item.status === 'reminded_20' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminder(item, '40')}
                              >
                                <Bell className="h-3 w-3 mr-1" />
                                Rappel 40j
                              </Button>
                            )}
                            {item.daysElapsed >= 60 && ['reminded_40', 'claim_sent'].includes(item.status) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => generateClaimLetter(item)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Réclamation
                              </Button>
                            )}
                            {!['received', 'rejected'].includes(item.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  console.log("Bouton Rejeter cliqué pour:", item);
                                  setSelectedItem(item);
                                  setRejectDialogOpen(true);
                                  console.log("Dialog ouvert:", true);
                                }}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeter
                              </Button>
                            )}
                            {item.status === 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setConfirmCancelRejectOpen(true);
                                }}
                              >
                                <Undo2 className="h-3 w-3 mr-1" />
                                Annuler le rejet
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total en attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status !== 'received').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rappels 20j</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'reminded_20').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rappels 40j</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'reminded_40').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réclamations</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'claim_sent').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(open) => {
        console.log("Dialog state change:", open);
        setRejectDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rejeter la demande de dépôt légal</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <>
                  N° DL: <strong>{selectedItem.dlNumber}</strong> - {selectedItem.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motif du rejet *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Veuillez saisir le(s) motif(s) de rejet détaillé(s)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Ce motif sera inclus dans la lettre de rejet officielle envoyée au déclarant.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Exemples de motifs courants
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Documents incomplets ou non conformes aux exigences réglementaires</li>
                <li>Informations manquantes ou erronées dans la déclaration</li>
                <li>Non-respect des critères d'éligibilité au dépôt légal</li>
                <li>Format ou support non conforme aux spécifications techniques</li>
                <li>Absence de justificatifs requis (statut éditeur, autorisation, etc.)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                  setSelectedItem(null);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectClick}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmer le rejet de la demande
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir rejeter définitivement cette demande de dépôt légal ?
              </p>
              {selectedItem && (
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <div className="text-sm">
                    <span className="font-semibold">N° DL:</span> {selectedItem.dlNumber}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Titre:</span> {selectedItem.title}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Éditeur:</span> {selectedItem.publisher}
                  </div>
                </div>
              )}
              <p className="text-destructive font-semibold">
                Cette action générera automatiquement une lettre de rejet officielle et ne pourra pas être annulée.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer le rejet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Rejection Confirmation Dialog */}
      <AlertDialog open={confirmCancelRejectOpen} onOpenChange={setConfirmCancelRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-blue-600" />
              Annuler le rejet de la demande
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir annuler le rejet de cette demande ?
              </p>
              {selectedItem && (
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <div className="text-sm">
                    <span className="font-semibold">N° DL:</span> {selectedItem.dlNumber}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Titre:</span> {selectedItem.title}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Éditeur:</span> {selectedItem.publisher}
                  </div>
                  {selectedItem.rejectionReason && (
                    <div className="text-sm mt-2 pt-2 border-t">
                      <span className="font-semibold">Motif du rejet initial:</span>
                      <p className="text-xs text-muted-foreground mt-1">{selectedItem.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
              <p className="text-blue-600 font-semibold">
                La demande sera réactivée et passera au statut "En attente" pour un nouveau traitement.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReject}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirmer l'annulation du rejet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
