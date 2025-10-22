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
import { 
  Eye,
  CheckCircle,
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
  const [selectedBookings, setSelectedBookings] = useState<VisitBooking[]>([]);
  const [viewDialog, setViewDialog] = useState(false);
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
      const { data, error } = await supabase
        .from("visits_slots")
        .select("*")
        .order("date", { ascending: true })
        .order("heure", { ascending: true });

      if (error) throw error;
      
      // Si pas de données, afficher des exemples
      if (!data || data.length === 0) {
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
      } else {
        setSlots(data);
      }
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
      const { data, error } = await supabase
        .from("visits_bookings")
        .select("*")
        .in("statut", ["en_attente", "confirmee"]);

      if (error) throw error;
      
      // Si pas de données, afficher des exemples
      if (!data || data.length === 0) {
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
          }
        ];
        setBookings(exampleBookings);
      } else {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleViewBookings = (slot: VisitSlot) => {
    const slotBookings = bookings.filter(b => b.slot_id === slot.id);
    setSelectedSlot(slot);
    setSelectedBookings(slotBookings);
    setViewDialog(true);
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

  const exportToCSV = () => {
    if (!selectedSlot || selectedBookings.length === 0) return;

    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Organisme', 'Nombre de visiteurs', 'Statut'],
      ...selectedBookings.map(b => [
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
    link.download = `visiteurs_${format(new Date(selectedSlot.date), 'yyyy-MM-dd')}_${selectedSlot.heure}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "La liste des visiteurs a été exportée en CSV",
    });
  };

  const exportToPDF = () => {
    if (!selectedSlot || selectedBookings.length === 0) return;

    const pdfContent = `LISTE DES VISITEURS - VISITE GUIDÉE\n\n` +
      `Date: ${format(new Date(selectedSlot.date), 'dd MMMM yyyy', { locale: fr })}\n` +
      `Heure: ${selectedSlot.heure.substring(0, 5)}\n` +
      `Langue: ${selectedSlot.langue}\n` +
      `Capacité: ${selectedSlot.capacite_max}\n` +
      `Réservations: ${selectedSlot.reservations_actuelles}\n\n` +
      `${'='.repeat(80)}\n\n` +
      `LISTE DES PARTICIPANTS\n\n` +
      selectedBookings.map((b, index) => 
        `${index + 1}. ${b.nom}\n` +
        `   Email: ${b.email}\n` +
        `   Téléphone: ${b.telephone}\n` +
        `   Organisme: ${b.organisme || 'Individuel'}\n` +
        `   Nombre de visiteurs: ${b.nb_visiteurs}\n` +
        `   Statut: ${b.statut}\n\n`
      ).join('') +
      `${'='.repeat(80)}\n\n` +
      `TOTAL: ${selectedBookings.reduce((sum, b) => sum + b.nb_visiteurs, 0)} visiteurs\n` +
      `\nDocument généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}\n` +
      `Bibliothèque Nationale du Royaume du Maroc`;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visiteurs_${format(new Date(selectedSlot.date), 'yyyy-MM-dd')}_${selectedSlot.heure}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "La liste des visiteurs a été exportée",
    });
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
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBookings(slot)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {slot.statut === 'disponible' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setCloseDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancelSlot(slot)}
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

      {/* Dialog de visualisation */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Liste des participants</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  Visite du {format(new Date(selectedSlot.date), 'dd MMMM yyyy', { locale: fr })} à {selectedSlot.heure.substring(0, 5)} - {selectedSlot.langue}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Capacité totale</p>
                  <p className="text-2xl font-bold">{selectedSlot.capacite_max}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Réservations</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedSlot.reservations_actuelles}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Places restantes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedSlot.capacite_max - selectedSlot.reservations_actuelles}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total visiteurs</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedBookings.reduce((sum, b) => sum + b.nb_visiteurs, 0)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportToPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>Nom</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Organisme</TableHead>
                      <TableHead className="text-center">Visiteurs</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Aucune réservation pour ce créneau
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.nom}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{booking.email}</p>
                              <p className="text-muted-foreground">{booking.telephone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.organisme || 'Individuel'}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.nb_visiteurs}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={booking.statut === 'confirmee' ? 'default' : 'secondary'}>
                              {booking.statut === 'confirmee' ? 'Confirmée' : 'En attente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
