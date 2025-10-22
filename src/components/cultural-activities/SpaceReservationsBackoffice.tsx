import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Download,
  Mail
} from "lucide-react";
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
      setBookings(data || []);
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

    const letterContent = `LETTRE DE CONFIRMATION DE RÉSERVATION D'ESPACE\n\n` +
      `Référence: ${selectedBooking.id.substring(0, 8).toUpperCase()}\n` +
      `Date: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}\n\n` +
      `À l'attention de ${selectedBooking.contact_person}\n` +
      `${selectedBooking.organization_name}\n\n` +
      `Madame, Monsieur,\n\n` +
      `Nous avons le plaisir de vous confirmer la réservation de l'espace suivant :\n\n` +
      `Espace : ${selectedBooking.cultural_spaces?.name}\n` +
      `Événement : ${selectedBooking.event_title}\n` +
      `Date de début : ${format(new Date(selectedBooking.start_date), 'dd/MM/yyyy HH:mm', { locale: fr })}\n` +
      `Date de fin : ${format(new Date(selectedBooking.end_date), 'dd/MM/yyyy HH:mm', { locale: fr })}\n` +
      `Nombre de participants : ${selectedBooking.participants_count}\n` +
      `Type de durée : ${selectedBooking.duration_type === 'journee_complete' ? 'Journée complète' : 'Demi-journée'}\n` +
      `Montant total : ${selectedBooking.total_amount} MAD\n\n` +
      `Merci de nous contacter pour finaliser les modalités pratiques.\n\n` +
      `Cordialement,\n` +
      `Le Département des Activités Culturelles\n` +
      `Bibliothèque Nationale du Royaume du Maroc`;

    downloadDocument(letterContent, `confirmation_${selectedBooking.id.substring(0, 8)}.txt`);
  };

  const generateContract = async () => {
    if (!selectedBooking) return;

    const contractContent = `CONTRAT DE RÉSERVATION D'ESPACE CULTUREL\n\n` +
      `Entre :\n` +
      `La Bibliothèque Nationale du Royaume du Maroc (BNRM)\n` +
      `Et :\n` +
      `${selectedBooking.organization_name} (${selectedBooking.organization_type})\n` +
      `Représentée par : ${selectedBooking.contact_person}\n\n` +
      `Article 1 - Objet\n` +
      `Le présent contrat a pour objet la mise à disposition de l'espace "${selectedBooking.cultural_spaces?.name}" pour l'événement "${selectedBooking.event_title}".\n\n` +
      `Article 2 - Durée\n` +
      `Du ${format(new Date(selectedBooking.start_date), 'dd/MM/yyyy HH:mm')} au ${format(new Date(selectedBooking.end_date), 'dd/MM/yyyy HH:mm')}\n\n` +
      `Article 3 - Tarification\n` +
      `Montant total : ${selectedBooking.total_amount} MAD\n\n` +
      `Article 4 - Obligations du locataire\n` +
      `- Respecter les règles de la BNRM\n` +
      `- Maintenir l'espace en bon état\n` +
      `- Respecter les horaires convenus\n\n` +
      `Article 5 - Assurances\n` +
      `Le locataire s'engage à souscrire une assurance responsabilité civile.\n\n` +
      `Fait à Rabat, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}\n\n` +
      `Pour la BNRM                    Pour ${selectedBooking.organization_name}\n\n\n` +
      `_________________                _________________`;

    downloadDocument(contractContent, `contrat_${selectedBooking.id.substring(0, 8)}.txt`);
  };

  const generateInvoice = async () => {
    if (!selectedBooking) return;

    const invoiceContent = `FACTURE\n\n` +
      `Bibliothèque Nationale du Royaume du Maroc\n` +
      `Avenue Al Hadyquiya, Secteur Ryad, Rabat\n\n` +
      `FACTURE N° : ${selectedBooking.id.substring(0, 8).toUpperCase()}\n` +
      `Date : ${format(new Date(), 'dd/MM/yyyy')}\n\n` +
      `Client :\n` +
      `${selectedBooking.organization_name}\n` +
      `Contact : ${selectedBooking.contact_person}\n` +
      `Email : ${selectedBooking.contact_email}\n` +
      `Tél : ${selectedBooking.contact_phone}\n\n` +
      `DÉTAIL DE LA PRESTATION\n` +
      `${'='.repeat(70)}\n` +
      `Description                                    Prix Unitaire    Total\n` +
      `${'='.repeat(70)}\n` +
      `Réservation ${selectedBooking.cultural_spaces?.name}\n` +
      `  Événement : ${selectedBooking.event_title}\n` +
      `  Du ${format(new Date(selectedBooking.start_date), 'dd/MM/yyyy')} au ${format(new Date(selectedBooking.end_date), 'dd/MM/yyyy')}\n` +
      `  Type : ${selectedBooking.duration_type === 'journee_complete' ? 'Journée complète' : 'Demi-journée'}\n` +
      `                                                              ${selectedBooking.total_amount} MAD\n` +
      `${'='.repeat(70)}\n\n` +
      `TOTAL TTC : ${selectedBooking.total_amount} MAD\n\n` +
      `Modalités de paiement : À régler avant l'événement\n` +
      `Coordonnées bancaires disponibles sur demande`;

    downloadDocument(invoiceContent, `facture_${selectedBooking.id.substring(0, 8)}.txt`);
  };

  const generateInventory = async () => {
    if (!selectedBooking) return;

    const inventoryContent = `ÉTAT DES LIEUX\n\n` +
      `Espace : ${selectedBooking.cultural_spaces?.name}\n` +
      `Événement : ${selectedBooking.event_title}\n` +
      `Organisation : ${selectedBooking.organization_name}\n` +
      `Date : ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n\n` +
      `ÉTAT DES LIEUX D'ENTRÉE\n` +
      `${'='.repeat(70)}\n\n` +
      `☐ Sol en bon état\n` +
      `☐ Murs en bon état\n` +
      `☐ Éclairage fonctionnel\n` +
      `☐ Système audio fonctionnel\n` +
      `☐ Chaises en bon état (nombre : ___)\n` +
      `☐ Tables en bon état (nombre : ___)\n` +
      `☐ Scène en bon état\n` +
      `☐ Système de projection fonctionnel\n\n` +
      `Observations complémentaires :\n` +
      `_________________________________________________________________\n` +
      `_________________________________________________________________\n` +
      `_________________________________________________________________\n\n` +
      `Signature du responsable BNRM :              Signature du locataire :\n\n\n` +
      `_________________________                    _________________________\n\n\n` +
      `ÉTAT DES LIEUX DE SORTIE (à compléter après l'événement)\n` +
      `${'='.repeat(70)}\n\n` +
      `☐ Sol en bon état\n` +
      `☐ Murs en bon état\n` +
      `☐ Éclairage fonctionnel\n` +
      `☐ Système audio fonctionnel\n` +
      `☐ Chaises en bon état\n` +
      `☐ Tables en bon état\n` +
      `☐ Scène en bon état\n` +
      `☐ Système de projection fonctionnel\n\n` +
      `Observations complémentaires :\n` +
      `_________________________________________________________________\n` +
      `_________________________________________________________________\n` +
      `_________________________________________________________________\n\n` +
      `Signature du responsable BNRM :              Signature du locataire :\n\n\n` +
      `_________________________                    _________________________`;

    downloadDocument(inventoryContent, `etat_lieux_${selectedBooking.id.substring(0, 8)}.txt`);
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
    // TODO: Implémenter l'envoi d'email via edge function
    console.log(`Sending ${type} email to ${selectedBooking?.contact_email}`);
    
    toast({
      title: "Email envoyé",
      description: `Un email de notification a été envoyé à ${selectedBooking?.contact_email}`,
    });
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      validee: { label: "Validée", className: "bg-green-100 text-green-800" },
      rejetee: { label: "Rejetée", className: "bg-red-100 text-red-800" },
      annulee: { label: "Annulée", className: "bg-gray-100 text-gray-800" },
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
            <Select value={filterSpace} onValueChange={setFilterSpace}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par espace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les espaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterOrgType} onValueChange={setFilterOrgType}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'organisme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="prive">Privé</SelectItem>
                <SelectItem value="association">Association</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="validee">Validée</SelectItem>
                <SelectItem value="rejetee">Rejetée</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="week">Dernière semaine</SelectItem>
                <SelectItem value="month">Dernier mois</SelectItem>
                <SelectItem value="quarter">Dernier trimestre</SelectItem>
              </SelectContent>
            </Select>
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
                          {booking.status === 'en_attente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setActionDialog({ open: true, type: 'approve' });
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setActionDialog({ open: true, type: 'reject' });
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* Dialog de validation */}
      <Dialog open={actionDialog.open && actionDialog.type === 'approve'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la demande</DialogTitle>
            <DialogDescription>
              Souhaitez-vous valider cette demande ? Une lettre de confirmation sera générée et envoyée au demandeur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Valider
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
