import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  Download,
  XCircle,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface VisitSlot {
  id: string;
  date: string;
  heure: string;
  langue: string;
  capacite_max: number;
  reservations_actuelles: number;
  statut: string;
  created_at: string;
}

interface VisitBooking {
  id: string;
  slot_id: string;
  nom: string;
  email: string;
  telephone: string;
  organisme: string | null;
  nb_visiteurs: number;
  langue: string;
  statut: string;
}

const GuidedToursBackoffice = () => {
  const [slots, setSlots] = useState<VisitSlot[]>([]);
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<VisitSlot | null>(null);
  const [closeDialog, setCloseDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, [viewMode]);

  const fetchSlots = async () => {
    try {
      // Toujours afficher les exemples (12 créneaux)
      const exampleSlots: VisitSlot[] = [
          {
            id: "slot-001",
            date: "2025-11-14",
            heure: "10:00:00",
            langue: "Français",
            capacite_max: 25,
            reservations_actuelles: 23,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-002",
            date: "2025-11-14",
            heure: "14:00:00",
            langue: "Arabe",
            capacite_max: 30,
            reservations_actuelles: 30,
            statut: "complet",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-003",
            date: "2025-11-15",
            heure: "10:00:00",
            langue: "Anglais",
            capacite_max: 20,
            reservations_actuelles: 12,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-004",
            date: "2025-11-15",
            heure: "15:00:00",
            langue: "Français",
            capacite_max: 25,
            reservations_actuelles: 18,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-005",
            date: "2025-11-16",
            heure: "11:00:00",
            langue: "Espagnol",
            capacite_max: 15,
            reservations_actuelles: 15,
            statut: "complet",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-006",
            date: "2025-11-18",
            heure: "10:00:00",
            langue: "Français",
            capacite_max: 25,
            reservations_actuelles: 0,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-007",
            date: "2025-11-20",
            heure: "14:00:00",
            langue: "Arabe",
            capacite_max: 30,
            reservations_actuelles: 8,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-008",
            date: "2025-11-21",
            heure: "10:00:00",
            langue: "Français",
            capacite_max: 25,
            reservations_actuelles: 25,
            statut: "terminee",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-009",
            date: "2025-11-22",
            heure: "09:30:00",
            langue: "Français",
            capacite_max: 20,
            reservations_actuelles: 14,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-010",
            date: "2025-11-25",
            heure: "14:30:00",
            langue: "Anglais",
            capacite_max: 15,
            reservations_actuelles: 6,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-011",
            date: "2025-11-26",
            heure: "10:00:00",
            langue: "Français",
            capacite_max: 25,
            reservations_actuelles: 19,
            statut: "disponible",
            created_at: new Date().toISOString()
          },
          {
            id: "slot-012",
            date: "2025-11-28",
            heure: "15:00:00",
            langue: "Arabe",
            capacite_max: 30,
            reservations_actuelles: 22,
            statut: "disponible",
            created_at: new Date().toISOString()
          }
        ];
      setSlots(exampleSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux de visite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      // Toujours afficher les exemples (12 réservations)
      const exampleBookings: VisitBooking[] = [
          {
            id: "booking-001",
            slot_id: "slot-001",
            nom: "Ahmed Bennani",
            email: "a.bennani@exemple.ma",
            telephone: "+212 6 12 34 56 78",
            organisme: "Lycée Ibn Khaldoun",
            nb_visiteurs: 15,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-002",
            slot_id: "slot-001",
            nom: "Fatima Zahra El Amrani",
            email: "fz.amrani@exemple.ma",
            telephone: "+212 6 98 76 54 32",
            organisme: null,
            nb_visiteurs: 4,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-003",
            slot_id: "slot-001",
            nom: "Mohammed Tazi",
            email: "m.tazi@exemple.ma",
            telephone: "+212 6 55 44 33 22",
            organisme: "Association culturelle Rabat",
            nb_visiteurs: 4,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-004",
            slot_id: "slot-002",
            nom: "Karim Benjelloun",
            email: "k.benjelloun@exemple.ma",
            telephone: "+212 6 11 22 33 44",
            organisme: "Université Mohammed V",
            nb_visiteurs: 30,
            langue: "Arabe",
            statut: "confirmee"
          },
          {
            id: "booking-005",
            slot_id: "slot-003",
            nom: "Sarah Johnson",
            email: "s.johnson@exemple.com",
            telephone: "+1 555 123 4567",
            organisme: "American School of Rabat",
            nb_visiteurs: 12,
            langue: "Anglais",
            statut: "confirmee"
          },
          {
            id: "booking-006",
            slot_id: "slot-004",
            nom: "Youssef Alami",
            email: "y.alami@exemple.ma",
            telephone: "+212 6 77 88 99 00",
            organisme: "École Supérieure de Commerce",
            nb_visiteurs: 18,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-007",
            slot_id: "slot-005",
            nom: "Maria Garcia",
            email: "m.garcia@exemple.es",
            telephone: "+34 600 111 222",
            organisme: "Instituto Cervantes",
            nb_visiteurs: 15,
            langue: "Espagnol",
            statut: "confirmee"
          },
          {
            id: "booking-008",
            slot_id: "slot-007",
            nom: "Hassan Idrissi",
            email: "h.idrissi@exemple.ma",
            telephone: "+212 6 33 44 55 66",
            organisme: null,
            nb_visiteurs: 3,
            langue: "Arabe",
            statut: "en_attente"
          },
          {
            id: "booking-009",
            slot_id: "slot-009",
            nom: "Laila Cherif",
            email: "l.cherif@exemple.ma",
            telephone: "+212 6 99 00 11 22",
            organisme: "Lycée Descartes",
            nb_visiteurs: 14,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-010",
            slot_id: "slot-010",
            nom: "David Smith",
            email: "d.smith@exemple.com",
            telephone: "+44 7700 900123",
            organisme: null,
            nb_visiteurs: 2,
            langue: "Anglais",
            statut: "confirmee"
          },
          {
            id: "booking-011",
            slot_id: "slot-011",
            nom: "Amina Benali",
            email: "a.benali@exemple.ma",
            telephone: "+212 6 44 55 66 77",
            organisme: "Centre Culturel Mohamed VI",
            nb_visiteurs: 19,
            langue: "Français",
            statut: "confirmee"
          },
          {
            id: "booking-012",
            slot_id: "slot-012",
            nom: "Omar Sefrioui",
            email: "o.sefrioui@exemple.ma",
            telephone: "+212 6 22 33 44 55",
            organisme: "Université Al Akhawayn",
            nb_visiteurs: 22,
            langue: "Arabe",
            statut: "en_attente"
          }
        ];
      setBookings(exampleBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };


  const handleCloseSlot = async () => {
    if (!selectedSlot) return;

    try {
      const { error } = await supabase
        .from("visits_slots")
        .update({ statut: "terminee" })
        .eq("id", selectedSlot.id);

      if (error) throw error;

      toast({
        title: "Visite clôturée",
        description: "Le créneau de visite a été marqué comme terminé",
      });

      fetchSlots();
      setCloseDialog(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error closing slot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de clôturer le créneau",
        variant: "destructive",
      });
    }
  };

  const handleCancelSlot = async (slot: VisitSlot) => {
    try {
      // Marquer le créneau comme annulé
      const { error: slotError } = await supabase
        .from("visits_slots")
        .update({ statut: "annulee" })
        .eq("id", slot.id);

      if (slotError) throw slotError;

      // Annuler toutes les réservations
      const { error: bookingsError } = await supabase
        .from("visits_bookings")
        .update({ statut: "annulee" })
        .eq("slot_id", slot.id);

      if (bookingsError) throw bookingsError;

      // Envoyer des emails de notification à tous les participants
      const slotBookings = bookings.filter(b => b.slot_id === slot.id);
      
      for (const booking of slotBookings) {
        try {
          await supabase.functions.invoke('send-cultural-activity-notification', {
            body: {
              type: 'visit_cancellation',
              recipient_email: booking.email,
              recipient_name: booking.nom,
              data: {
                visit_date: format(new Date(slot.date), 'dd MMMM yyyy', { locale: fr }),
                visit_time: slot.heure.substring(0, 5),
                visit_language: slot.langue,
                nb_visiteurs: booking.nb_visiteurs,
                cancellation_reason: "Suite à des circonstances imprévues, nous sommes contraints d'annuler cette visite."
              }
            }
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${booking.email}:`, emailError);
        }
      }

      toast({
        title: "Visite annulée",
        description: `Le créneau a été annulé et ${slotBookings.length} participants ont été notifiés par email`,
      });

      fetchSlots();
      fetchBookings();
    } catch (error) {
      console.error("Error canceling slot:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le créneau",
        variant: "destructive",
      });
    }
  };

  const exportSlotToCSV = (slot: VisitSlot) => {
    const slotBookings = bookings.filter(b => b.slot_id === slot.id);
    if (slotBookings.length === 0) {
      toast({
        title: "Aucun visiteur",
        description: "Ce créneau n'a pas de réservations",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Organisme', 'Nombre de visiteurs', 'Statut'],
      ...slotBookings.map(b => [
        b.nom,
        b.email,
        b.telephone,
        b.organisme || 'Individuel',
        b.nb_visiteurs.toString(),
        b.statut
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visiteurs_${format(new Date(slot.date), 'yyyy-MM-dd')}_${slot.heure}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "La liste des visiteurs a été exportée en CSV",
    });
  };

  const exportSlotToPDF = (slot: VisitSlot) => {
    const slotBookings = bookings.filter(b => b.slot_id === slot.id);
    if (slotBookings.length === 0) {
      toast({
        title: "Aucun visiteur",
        description: "Ce créneau n'a pas de réservations",
        variant: "destructive",
      });
      return;
    }

    const pdfContent = `LISTE DES VISITEURS - VISITE GUIDÉE\n\n` +
      `Date: ${format(new Date(slot.date), 'dd MMMM yyyy', { locale: fr })}\n` +
      `Heure: ${slot.heure.substring(0, 5)}\n` +
      `Langue: ${slot.langue}\n` +
      `Capacité: ${slot.capacite_max}\n` +
      `Réservations: ${slot.reservations_actuelles}\n\n` +
      `${'='.repeat(80)}\n\n` +
      `LISTE DES PARTICIPANTS\n\n` +
      slotBookings.map((b, index) => 
        `${index + 1}. ${b.nom}\n` +
        `   Email: ${b.email}\n` +
        `   Téléphone: ${b.telephone}\n` +
        `   Organisme: ${b.organisme || 'Individuel'}\n` +
        `   Nombre de visiteurs: ${b.nb_visiteurs}\n` +
        `   Statut: ${b.statut}\n\n`
      ).join('') +
      `${'='.repeat(80)}\n\n` +
      `TOTAL: ${slotBookings.reduce((sum, b) => sum + b.nb_visiteurs, 0)} visiteurs\n` +
      `\nDocument généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}\n` +
      `Bibliothèque Nationale du Royaume du Maroc`;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visiteurs_${format(new Date(slot.date), 'yyyy-MM-dd')}_${slot.heure}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "La liste des visiteurs a été exportée",
    });
  };

  const exportAllToCSV = () => {
    if (slots.length === 0) {
      toast({
        title: "Aucun créneau",
        description: "Il n'y a aucun créneau à exporter",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Date', 'Heure', 'Langue', 'Capacité', 'Réservés', 'Restants', 'Statut'],
      ...slots.map(s => [
        format(new Date(s.date), 'dd/MM/yyyy', { locale: fr }),
        s.heure.substring(0, 5),
        s.langue,
        s.capacite_max.toString(),
        s.reservations_actuelles.toString(),
        (s.capacite_max - s.reservations_actuelles).toString(),
        s.statut
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visites_guidees_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${slots.length} créneaux exportés en CSV`,
    });
  };

  const exportAllToPDF = async () => {
    if (slots.length === 0) {
      toast({
        title: "Aucun créneau",
        description: "Il n'y a aucun créneau à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Ajouter l'en-tête BNRM
      const yAfterHeader = await addBNRMHeader(doc);
      let yPos = yAfterHeader + 10;
      
      // Titre
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTE DES VISITES GUIDÉES', 105, yPos, { align: 'center' });
      yPos += 10;
      
      // Date d'export
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date d'export: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 105, yPos, { align: 'center' });
      yPos += 15;
      
      // Tableau des créneaux
      const tableData = slots.map(slot => [
        format(new Date(slot.date), 'dd/MM/yyyy', { locale: fr }),
        slot.heure.substring(0, 5),
        slot.langue,
        slot.capacite_max.toString(),
        slot.reservations_actuelles.toString(),
        (slot.capacite_max - slot.reservations_actuelles).toString(),
        slot.statut === 'disponible' ? 'Ouverte' : 
        slot.statut === 'complet' ? 'Complète' :
        slot.statut === 'terminee' ? 'Terminée' : 'Annulée'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Heure', 'Langue', 'Capacité', 'Réservés', 'Restants', 'Statut']],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, left: 15, right: 15 },
      });
      
      // Statistiques
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
      yPos = finalY + 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STATISTIQUES', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total de créneaux: ${slots.length}`, 20, yPos);
      yPos += 6;
      doc.text(`Total places disponibles: ${slots.reduce((sum, s) => sum + s.capacite_max, 0)}`, 20, yPos);
      yPos += 6;
      doc.text(`Total réservations: ${slots.reduce((sum, s) => sum + s.reservations_actuelles, 0)}`, 20, yPos);
      
      // Ajouter le pied de page
      await addBNRMFooter(doc, 1);
      
      // Télécharger le PDF
      doc.save(`visites_guidees_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Export réussi",
        description: `${slots.length} créneaux exportés en PDF`,
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      disponible: { label: "Ouverte", className: "bg-green-100 text-green-800" },
      complet: { label: "Complète", className: "bg-orange-100 text-orange-800" },
      terminee: { label: "Terminée", className: "bg-gray-100 text-gray-800" },
      annulee: { label: "Annulée", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.disponible;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calcul de la pagination
  const totalPages = Math.ceil(slots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSlots = slots.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-light">Gestion des visites guidées</CardTitle>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Vue par jour</SelectItem>
                <SelectItem value="week">Vue par semaine</SelectItem>
                <SelectItem value="month">Vue par mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Boutons d'export global */}
          <div className="flex justify-end gap-2 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={exportAllToCSV}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter tous les créneaux en CSV</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={exportAllToPDF}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter tous les créneaux en PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Réservés</TableHead>
                  <TableHead>Restants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSlots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Aucun créneau de visite
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSlots.map((slot) => (
                    <TableRow key={slot.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {format(new Date(slot.date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{slot.heure.substring(0, 5)}</TableCell>
                      <TableCell>{slot.langue}</TableCell>
                      <TableCell>{slot.capacite_max}</TableCell>
                      <TableCell>
                        <span className="font-medium">{slot.reservations_actuelles}</span>
                      </TableCell>
                      <TableCell>
                        <span className={slot.capacite_max - slot.reservations_actuelles === 0 ? 'text-red-600 font-medium' : ''}>
                          {slot.capacite_max - slot.reservations_actuelles}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(slot.statut)}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <div className="flex justify-end gap-2">
                            {slot.statut === 'disponible' && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => {
                                        setSelectedSlot(slot);
                                        setCloseDialog(true);
                                      }}
                                    >
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Clôturer cette visite</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                      onClick={() => handleCancelSlot(slot)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Annuler cette visite et notifier les participants</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {slots.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(endIndex, slots.length)} sur {slots.length} créneaux
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Dialog de clôture */}
      <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clôturer la visite</DialogTitle>
            <DialogDescription>
              Souhaitez-vous marquer cette visite comme terminée ?
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-2">
              <p><strong>Date:</strong> {format(new Date(selectedSlot.date), 'dd/MM/yyyy', { locale: fr })}</p>
              <p><strong>Heure:</strong> {selectedSlot.heure.substring(0, 5)}</p>
              <p><strong>Langue:</strong> {selectedSlot.langue}</p>
              <p><strong>Participants:</strong> {selectedSlot.reservations_actuelles}/{selectedSlot.capacite_max}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialog(false)}>Annuler</Button>
            <Button onClick={handleCloseSlot} className="bg-green-600 hover:bg-green-700">
              Confirmer la clôture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuidedToursBackoffice;
