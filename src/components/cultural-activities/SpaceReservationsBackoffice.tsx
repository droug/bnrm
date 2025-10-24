import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  generateConfirmationLetter as generateConfirmationPDF, 
  generateContract as generateContractPDF, 
  generateInvoice as generateInvoicePDF, 
  generateInventoryReport as generateInventoryPDF 
} from "@/utils/culturalSpacePdfGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import { CustomSelect } from "@/components/ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Download,
  Mail,
  GitBranch,
  ArrowRight,
  Clock,
  Archive
} from "lucide-react";
import { BookingWorkflowProcessor } from "./BookingWorkflowProcessor";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Booking {
  id: string;
  organization_name: string;
  organization_type: string;
  space_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  event_title: string;
  event_description: string;
  participants_count: number;
  total_amount: number;
  rejection_reason: string | null;
  admin_notes: string | null;
  duration_type: string;
  cultural_spaces?: {
    name: string;
  };
}

const SpaceReservationsBackoffice = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'view' | null;
  }>({ open: false, type: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterSpace, setFilterSpace] = useState<string>("all");
  const [filterOrgType, setFilterOrgType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [validationConfirmDialog, setValidationConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpaces();
    fetchBookings();
  }, [filterSpace, filterOrgType, filterStatus, filterPeriod]);

  const fetchSpaces = async () => {
    const { data } = await supabase
      .from("cultural_spaces")
      .select("*")
      .eq("is_active", true);
    
    if (data) setSpaces(data);
  };

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          cultural_spaces(name)
        `)
        .order("created_at", { ascending: false });

      if (filterSpace !== "all") {
        query = query.eq("space_id", filterSpace);
      }

      if (filterOrgType !== "all") {
        query = query.eq("organization_type", filterOrgType);
      }

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      if (filterPeriod !== "all") {
        const now = new Date();
        let startDate = new Date();
        
        switch (filterPeriod) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Si pas de données, afficher des exemples
      if (!data || data.length === 0) {
        const exampleBookings: Booking[] = [
          {
            id: "245-EXEMPLE-001",
            organization_name: "Association Culturelle Atlas",
            organization_type: "public",
            space_id: "space-1",
            start_date: "2025-11-12T09:00:00Z",
            end_date: "2025-11-13T18:00:00Z",
            status: "en_attente",
            created_at: "2025-10-15T10:30:00Z",
            contact_person: "Ahmed Benali",
            contact_email: "a.benali@atlas-culture.ma",
            contact_phone: "+212 6 12 34 56 78",
            event_title: "Conférence sur le patrimoine marocain",
            event_description: "Une conférence internationale sur la préservation du patrimoine culturel marocain avec des experts nationaux et internationaux.",
            participants_count: 150,
            total_amount: 5000,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "journee_complete",
            cultural_spaces: {
              name: "Salle de Conférence Principale"
            }
          },
          {
            id: "246-EXEMPLE-002",
            organization_name: "Fondation Mohammed VI",
            organization_type: "public",
            space_id: "space-2",
            start_date: "2025-11-20T14:00:00Z",
            end_date: "2025-11-20T18:00:00Z",
            status: "en_attente",
            created_at: "2025-10-18T14:20:00Z",
            contact_person: "Fatima Zahra Alami",
            contact_email: "fz.alami@fondation.ma",
            contact_phone: "+212 5 37 12 34 56",
            event_title: "Exposition d'art contemporain",
            event_description: "Exposition d'œuvres d'artistes marocains contemporains.",
            participants_count: 80,
            total_amount: 2500,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "demi_journee",
            cultural_spaces: {
              name: "Galerie d'exposition"
            }
          },
          {
            id: "247-EXEMPLE-003",
            organization_name: "Club Littéraire Rabat",
            organization_type: "association",
            space_id: "space-1",
            start_date: "2025-11-25T10:00:00Z",
            end_date: "2025-11-25T13:00:00Z",
            status: "en_attente",
            created_at: "2025-10-20T09:15:00Z",
            contact_person: "Karim Benjelloun",
            contact_email: "k.benjelloun@clr.ma",
            contact_phone: "+212 6 98 76 54 32",
            event_title: "Rencontre avec un écrivain",
            event_description: "Séance de dédicace et discussion avec un auteur primé.",
            participants_count: 50,
            total_amount: 1200,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "demi_journee",
            cultural_spaces: {
              name: "Salle de Conférence Principale"
            }
          },
          {
            id: "248-EXEMPLE-004",
            organization_name: "Institut Français de Rabat",
            organization_type: "international",
            space_id: "space-3",
            start_date: "2025-12-05T09:00:00Z",
            end_date: "2025-12-05T17:00:00Z",
            status: "en_attente",
            created_at: "2025-10-22T16:45:00Z",
            contact_person: "Sophie Martin",
            contact_email: "s.martin@if-maroc.ma",
            contact_phone: "+212 5 37 89 12 34",
            event_title: "Journée de la francophonie",
            event_description: "Célébration de la journée internationale de la francophonie avec projections et débats.",
            participants_count: 120,
            total_amount: 3800,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "journee_complete",
            cultural_spaces: {
              name: "Auditorium"
            }
          },
          {
            id: "249-EXEMPLE-005",
            organization_name: "Société Tech Innovations",
            organization_type: "prive",
            space_id: "space-2",
            start_date: "2025-11-15T09:00:00Z",
            end_date: "2025-11-15T12:00:00Z",
            status: "en_attente",
            created_at: "2025-10-10T11:20:00Z",
            contact_person: "Youssef Tazi",
            contact_email: "y.tazi@techinnovations.ma",
            contact_phone: "+212 6 55 44 33 22",
            event_title: "Lancement de produit technologique",
            event_description: "Présentation d'un nouveau produit technologique à la presse.",
            participants_count: 40,
            total_amount: 1800,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "demi_journee",
            cultural_spaces: {
              name: "Galerie d'exposition"
            }
          },
          {
            id: "250-EXEMPLE-006",
            organization_name: "Université Mohammed V",
            organization_type: "public",
            space_id: "space-1",
            start_date: "2025-12-10T14:00:00Z",
            end_date: "2025-12-11T17:00:00Z",
            status: "en_attente",
            created_at: "2025-10-25T08:30:00Z",
            contact_person: "Dr. Amina El Mansouri",
            contact_email: "a.elmansouri@um5.ac.ma",
            contact_phone: "+212 5 37 77 88 99",
            event_title: "Colloque scientifique - Histoire du livre au Maroc",
            event_description: "Colloque académique sur l'histoire du livre et des bibliothèques au Maroc.",
            participants_count: 200,
            total_amount: 6500,
            rejection_reason: null,
            admin_notes: null,
            duration_type: "journee_complete",
            cultural_spaces: {
              name: "Salle de Conférence Principale"
            }
          }
        ];
        
        setBookings(exampleBookings);
      } else {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "validee",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // Générer les documents
      await generateConfirmationLetter();
      await sendNotificationEmail('approval');

      toast({
        title: "Demande validée",
        description: "La réservation a été validée avec succès. Documents générés et email envoyé.",
      });

      fetchBookings();
      closeDialog();
    } catch (error) {
      console.error("Error approving booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de valider la demande",
        variant: "destructive",
      });
    }
  };

  const handleVerificationInProgress = async () => {
    if (!selectedBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "verification_en_cours",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: "La demande est maintenant en vérification.",
      });

      fetchBookings();
      closeDialog();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (!selectedBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "archivee",
          reviewed_at: new Date().toISOString(),
          admin_notes: (selectedBooking.admin_notes || "") + "\n[Archivée sans suite le " + new Date().toLocaleDateString('fr-FR') + "]"
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast({
        title: "Demande archivée",
        description: "La demande a été archivée sans suite.",
      });

      fetchBookings();
      closeDialog();
    } catch (error) {
      console.error("Error archiving booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la demande",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez indiquer le motif du rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "rejetee",
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      await sendNotificationEmail('rejection');

      toast({
        title: "Demande rejetée",
        description: "La réservation a été rejetée. Email de notification envoyé.",
      });

      fetchBookings();
      closeDialog();
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive",
      });
    }
  };

  const generateConfirmationLetter = async () => {
    if (!selectedBooking) return;

    try {
      const space = {
        name: selectedBooking.cultural_spaces?.name || "Espace non spécifié",
        capacity: selectedBooking.participants_count,
        description: selectedBooking.event_description,
        location: ""
      };

      const bookingData = {
        id: selectedBooking.id,
        booking_number: selectedBooking.id.substring(0, 8).toUpperCase(),
        organization_name: selectedBooking.organization_name,
        organization_type: selectedBooking.organization_type,
        contact_person: selectedBooking.contact_person,
        phone: selectedBooking.contact_phone,
        email: selectedBooking.contact_email,
        activity_type: selectedBooking.event_title,
        activity_description: selectedBooking.event_description,
        start_date: selectedBooking.start_date,
        end_date: selectedBooking.end_date,
        duration_type: selectedBooking.duration_type,
        expected_attendees: selectedBooking.participants_count,
        special_requirements: selectedBooking.admin_notes || "",
        total_amount: selectedBooking.total_amount,
        status: selectedBooking.status,
        space_id: selectedBooking.space_id
      };

      await generateConfirmationPDF(bookingData, space);
      
      toast({
        title: "Document généré",
        description: "Lettre de confirmation générée en PDF avec succès",
      });
    } catch (error) {
      console.error("Error generating confirmation letter:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la lettre de confirmation",
        variant: "destructive",
      });
    }
  };

  const generateContract = async () => {
    if (!selectedBooking) return;

    try {
      const space = {
        name: selectedBooking.cultural_spaces?.name || "Espace non spécifié",
        capacity: selectedBooking.participants_count,
        description: selectedBooking.event_description,
        location: ""
      };

      const bookingData = {
        id: selectedBooking.id,
        booking_number: selectedBooking.id.substring(0, 8).toUpperCase(),
        organization_name: selectedBooking.organization_name,
        organization_type: selectedBooking.organization_type,
        contact_person: selectedBooking.contact_person,
        phone: selectedBooking.contact_phone,
        email: selectedBooking.contact_email,
        activity_type: selectedBooking.event_title,
        activity_description: selectedBooking.event_description,
        start_date: selectedBooking.start_date,
        end_date: selectedBooking.end_date,
        duration_type: selectedBooking.duration_type,
        expected_attendees: selectedBooking.participants_count,
        special_requirements: selectedBooking.admin_notes || "",
        total_amount: selectedBooking.total_amount,
        status: selectedBooking.status,
        space_id: selectedBooking.space_id
      };

      await generateContractPDF(bookingData, space);
      
      toast({
        title: "Document généré",
        description: "Contrat généré en PDF avec succès",
      });
    } catch (error) {
      console.error("Error generating contract:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le contrat",
        variant: "destructive",
      });
    }
  };

  const generateInvoice = async () => {
    if (!selectedBooking) return;

    try {
      const space = {
        name: selectedBooking.cultural_spaces?.name || "Espace non spécifié",
        capacity: selectedBooking.participants_count,
        description: selectedBooking.event_description,
        location: ""
      };

      const bookingData = {
        id: selectedBooking.id,
        booking_number: selectedBooking.id.substring(0, 8).toUpperCase(),
        organization_name: selectedBooking.organization_name,
        organization_type: selectedBooking.organization_type,
        contact_person: selectedBooking.contact_person,
        phone: selectedBooking.contact_phone,
        email: selectedBooking.contact_email,
        activity_type: selectedBooking.event_title,
        activity_description: selectedBooking.event_description,
        start_date: selectedBooking.start_date,
        end_date: selectedBooking.end_date,
        duration_type: selectedBooking.duration_type,
        expected_attendees: selectedBooking.participants_count,
        special_requirements: selectedBooking.admin_notes || "",
        total_amount: selectedBooking.total_amount,
        status: selectedBooking.status,
        space_id: selectedBooking.space_id
      };

      await generateInvoicePDF(bookingData, space);
      
      toast({
        title: "Document généré",
        description: "Facture générée en PDF avec succès",
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture",
        variant: "destructive",
      });
    }
  };

  const generateInventory = async () => {
    if (!selectedBooking) return;

    try {
      const space = {
        name: selectedBooking.cultural_spaces?.name || "Espace non spécifié",
        capacity: selectedBooking.participants_count,
        description: selectedBooking.event_description,
        location: ""
      };

      const bookingData = {
        id: selectedBooking.id,
        booking_number: selectedBooking.id.substring(0, 8).toUpperCase(),
        organization_name: selectedBooking.organization_name,
        organization_type: selectedBooking.organization_type,
        contact_person: selectedBooking.contact_person,
        phone: selectedBooking.contact_phone,
        email: selectedBooking.contact_email,
        activity_type: selectedBooking.event_title,
        activity_description: selectedBooking.event_description,
        start_date: selectedBooking.start_date,
        end_date: selectedBooking.end_date,
        duration_type: selectedBooking.duration_type,
        expected_attendees: selectedBooking.participants_count,
        special_requirements: selectedBooking.admin_notes || "",
        total_amount: selectedBooking.total_amount,
        status: selectedBooking.status,
        space_id: selectedBooking.space_id
      };

      await generateInventoryPDF(bookingData, space);
      
      toast({
        title: "Document généré",
        description: "État des lieux généré en PDF avec succès",
      });
    } catch (error) {
      console.error("Error generating inventory:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'état des lieux",
        variant: "destructive",
      });
    }
  };

  const downloadDocument = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendNotificationEmail = async (type: 'approval' | 'rejection') => {
    if (!selectedBooking) return;
    
    try {
      const notificationType = type === 'approval' ? 'booking_approval' : 'booking_rejection';
      
      const { error } = await supabase.functions.invoke('send-cultural-activity-notification', {
        body: {
          type: notificationType,
          recipient_email: selectedBooking.contact_email,
          recipient_name: selectedBooking.contact_person,
          data: {
            space_name: selectedBooking.cultural_spaces?.name,
            organization_name: selectedBooking.organization_name,
            start_date: format(new Date(selectedBooking.start_date), 'dd/MM/yyyy à HH:mm', { locale: fr }),
            end_date: format(new Date(selectedBooking.end_date), 'dd/MM/yyyy à HH:mm', { locale: fr }),
            booking_id: selectedBooking.id.substring(0, 8).toUpperCase(),
            rejection_reason: type === 'rejection' ? rejectionReason : undefined
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: `Un email de ${type === 'approval' ? 'confirmation' : 'notification'} a été envoyé à ${selectedBooking.contact_email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur d'envoi",
        description: "L'email n'a pas pu être envoyé, mais l'action a été enregistrée",
        variant: "destructive"
      });
    }
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      verification_en_cours: { label: "Vérification en cours", className: "bg-blue-100 text-blue-800" },
      validee: { label: "Validée", className: "bg-green-100 text-green-800" },
      rejetee: { label: "Rejetée", className: "bg-red-100 text-red-800" },
      annulee: { label: "Annulée", className: "bg-gray-100 text-gray-800" },
      archivee: { label: "Archivée sans suite", className: "bg-gray-200 text-gray-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Gestion des réservations d'espaces</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <CustomSelect
              value={filterSpace}
              onValueChange={setFilterSpace}
              options={[
                { value: "all", label: "Tous les espaces" },
                ...spaces.map(space => ({
                  value: space.id,
                  label: space.name
                }))
              ]}
              placeholder="Filtrer par espace"
            />

            <CustomSelect
              value={filterOrgType}
              onValueChange={setFilterOrgType}
              options={[
                { value: "all", label: "Tous les types" },
                { value: "public", label: "Public" },
                { value: "prive", label: "Privé" },
                { value: "association", label: "Association" },
                { value: "international", label: "International" },
              ]}
              placeholder="Type d'organisme"
            />

            <CustomSelect
              value={filterStatus}
              onValueChange={setFilterStatus}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "en_attente", label: "En attente" },
                { value: "verification_en_cours", label: "Vérification en cours" },
                { value: "validee", label: "Validée" },
                { value: "rejetee", label: "Rejetée" },
                { value: "archivee", label: "Archivée sans suite" },
              ]}
              placeholder="Statut"
            />

            <CustomSelect
              value={filterPeriod}
              onValueChange={setFilterPeriod}
              options={[
                { value: "all", label: "Toutes les périodes" },
                { value: "week", label: "Dernière semaine" },
                { value: "month", label: "Dernier mois" },
                { value: "quarter", label: "Dernier trimestre" },
              ]}
              placeholder="Période"
            />
          </div>

          {/* Tableau */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>N°</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Espace</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Type organisme</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucune réservation
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking, index) => (
                    <TableRow key={booking.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {booking.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.organization_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.contact_person}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.cultural_spaces?.name}</TableCell>
                      <TableCell>
                        {format(new Date(booking.start_date), 'dd/MM/yyyy', { locale: fr })}
                        {' - '}
                        {format(new Date(booking.end_date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="capitalize">{booking.organization_type}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionDialog({ open: true, type: 'view' });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionDialog({ open: true, type: 'approve' });
                            }}
                            title="Traiter la demande"
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Processor */}
      <BookingWorkflowProcessor
        booking={selectedBooking}
        open={actionDialog.open && actionDialog.type === 'approve'}
        onClose={closeDialog}
        onSuccess={fetchBookings}
      />

      {/* Dialog de traitement (workflow) */}
      <Dialog open={false} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <GitBranch className="h-6 w-6 text-primary" />
              Traitement de la demande
            </DialogTitle>
            <DialogDescription>
              Workflow de validation et traitement de la demande de réservation
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-4">
              {/* Informations de la demande */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">N° Réservation:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Demandeur:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.organization_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Espace:</span>
                    <span className="ml-2">{selectedBooking.cultural_spaces?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Statut actuel:</span>
                    <span className="ml-2">{getStatusBadge(selectedBooking.status)}</span>
                  </div>
                </div>
              </div>

              {/* Workflow visuel */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Étapes du workflow
                </h3>

                {/* Étape 1: Soumission */}
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">E01 - Soumission de la demande</h4>
                    <p className="text-sm text-green-800">Demande soumise par {selectedBooking.contact_person}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {format(new Date(selectedBooking.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Nouvelle étape: Décision du directeur - Envoyer pour Avis */}
                <div 
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    selectedBooking.status === 'en_attente' 
                      ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' 
                      : 'bg-green-50 border-green-200'
                  }`}
                  onClick={() => {
                    if (selectedBooking.status === 'en_attente') {
                      setValidationConfirmDialog(true);
                    }
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      selectedBooking.status === 'en_attente'
                        ? 'bg-purple-500 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {selectedBooking.status === 'en_attente' ? '2' : '✓'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      selectedBooking.status === 'en_attente' ? 'text-purple-900' : 'text-green-900'
                    }`}>
                      Décision du directeur : Envoyer pour Avis
                    </h4>
                    <p className={`text-sm ${
                      selectedBooking.status === 'en_attente' ? 'text-purple-800' : 'text-green-800'
                    }`}>
                      {selectedBooking.status === 'en_attente' 
                        ? 'Cliquez pour prendre une décision'
                        : 'Le directeur a décidé de l\'orientation du dossier'}
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">✓ Validée</span>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">✗ Refusée</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">⏸ Vérification en cours</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Étape 2: Examen préliminaire */}
                <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                  selectedBooking.status === 'en_attente' 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      selectedBooking.status === 'en_attente'
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      selectedBooking.status === 'en_attente' ? 'text-gray-700' : 'text-yellow-900'
                    }`}>
                      E02 - Examen préliminaire (DAC)
                    </h4>
                    <p className={`text-sm ${
                      selectedBooking.status === 'en_attente' ? 'text-gray-600' : 'text-yellow-800'
                    }`}>
                      Vérification de la complétude du dossier après décision
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Étape 3: Validation directionnelle */}
                <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                  selectedBooking.status === 'verification_en_cours'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      selectedBooking.status === 'verification_en_cours'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {selectedBooking.status === 'verification_en_cours' ? <Clock className="h-5 w-5" /> : '4'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      selectedBooking.status === 'verification_en_cours'
                        ? 'text-blue-900'
                        : 'text-gray-700'
                    }`}>
                      E03 - Validation directionnelle
                    </h4>
                    <p className={`text-sm ${
                      selectedBooking.status === 'verification_en_cours'
                        ? 'text-blue-800'
                        : 'text-gray-600'
                    }`}>
                      {selectedBooking.status === 'verification_en_cours' 
                        ? 'Dossier en attente d\'analyse approfondie'
                        : 'Décision finale du directeur'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions disponibles */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Actions disponibles</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedBooking.status === 'en_attente' && (
                    <>
                      <Button 
                        onClick={handleApprove} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Accepter la demande</div>
                              <div className="text-xs opacity-90">Génération de la lettre de confirmation et du contrat</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>
                      
                      <Button 
                        onClick={handleVerificationInProgress} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Mettre en vérification</div>
                              <div className="text-xs opacity-90">Pour les dossiers sensibles nécessitant une analyse</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>

                      <Button 
                        onClick={() => {
                          closeDialog();
                          setActionDialog({ open: true, type: 'reject' });
                        }}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Refuser la demande</div>
                              <div className="text-xs opacity-90">Envoi de la lettre de refus motivée</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>
                    </>
                  )}

                  {selectedBooking.status === 'verification_en_cours' && (
                    <>
                      <Button 
                        onClick={handleApprove} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Accepter après vérification</div>
                              <div className="text-xs opacity-90">Reprendre le flux normal de validation</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>

                      <Button 
                        onClick={() => {
                          closeDialog();
                          setActionDialog({ open: true, type: 'reject' });
                        }}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Refuser après vérification</div>
                              <div className="text-xs opacity-90">Rejet motivé ou administratif</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>

                      <Button 
                        onClick={handleArchive} 
                        variant="outline"
                        className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 h-auto py-4"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Archive className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">Archiver sans suite</div>
                              <div className="text-xs opacity-90">Pas de retour public, conservation interne</div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de validation */}
      <Dialog open={validationConfirmDialog} onOpenChange={setValidationConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Décision du directeur</DialogTitle>
            <DialogDescription>
              Confirmez-vous la validation de cette demande pour passer à l'étape suivante ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-muted-foreground">N° Réservation:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Demandeur:</span>
                    <span className="ml-2 font-semibold">{selectedBooking.organization_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Événement:</span>
                    <span className="ml-2">{selectedBooking.event_title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setValidationConfirmDialog(false);
                setActionDialog({ open: true, type: 'reject' });
              }}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser
            </Button>
            <Button
              onClick={() => {
                setValidationConfirmDialog(false);
                handleApprove();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer la validation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={actionDialog.open && actionDialog.type === 'reject'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motif du rejet *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez la raison du rejet..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button onClick={handleReject} variant="destructive">
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={actionDialog.open && actionDialog.type === 'view'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">N° de réservation</Label>
                  <p className="font-semibold">{selectedBooking.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Informations de l'organisme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nom de l'organisme</Label>
                    <p>{selectedBooking.organization_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="capitalize">{selectedBooking.organization_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contact</Label>
                    <p>{selectedBooking.contact_person}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedBooking.contact_email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p>{selectedBooking.contact_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Détails de l'événement</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground">Titre</Label>
                    <p>{selectedBooking.event_title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedBooking.event_description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Espace</Label>
                      <p>{selectedBooking.cultural_spaces?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Nombre de participants</Label>
                      <p>{selectedBooking.participants_count}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date de début</Label>
                      <p>{format(new Date(selectedBooking.start_date), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date de fin</Label>
                      <p>{format(new Date(selectedBooking.end_date), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type de durée</Label>
                      <p>{selectedBooking.duration_type === 'journee_complete' ? 'Journée complète' : 'Demi-journée'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Montant total</Label>
                      <p className="font-semibold">{selectedBooking.total_amount} MAD</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.rejection_reason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <Label className="text-red-800">Motif du rejet</Label>
                  <p className="text-red-700 text-sm mt-1">{selectedBooking.rejection_reason}</p>
                </div>
              )}

              {selectedBooking.admin_notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-blue-800">Notes administratives</Label>
                  <p className="text-blue-700 text-sm mt-1">{selectedBooking.admin_notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button onClick={generateConfirmationLetter} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Lettre de confirmation
                </Button>
                <Button onClick={generateContract} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Contrat
                </Button>
                <Button onClick={generateInvoice} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Facture
                </Button>
                <Button onClick={generateInventory} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  État des lieux
                </Button>
                <Button 
                  onClick={() => sendNotificationEmail(selectedBooking.status === 'validee' ? 'approval' : 'rejection')} 
                  variant="outline" 
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpaceReservationsBackoffice;
