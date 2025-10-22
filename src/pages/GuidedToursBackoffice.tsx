import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Users, FileText, CheckCircle, XCircle, Ban, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GuidedToursBackoffice = () => {
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  // Récupérer tous les créneaux avec leurs réservations
  const { data: slots, isLoading } = useQuery({
    queryKey: ["guided-tours-management", filterDate, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("visits_slots")
        .select("*")
        .order("date", { ascending: true })
        .order("heure", { ascending: true });

      if (filterDate) {
        query = query.eq("date", filterDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Pour chaque créneau, récupérer les réservations
      const slotsWithBookings = await Promise.all(
        (data || []).map(async (slot) => {
          const { data: bookings } = await supabase
            .from("visits_bookings")
            .select("*")
            .eq("slot_id", slot.id)
            .order("created_at", { ascending: false });

          return {
            ...slot,
            bookings: bookings || [],
          };
        })
      );

      // Filtrer par statut si nécessaire
      if (filterStatus !== "all") {
        return slotsWithBookings.filter((slot) => slot.statut === filterStatus);
      }

      return slotsWithBookings;
    },
  });

  // Mutation pour mettre à jour le statut d'une réservation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      newStatus,
    }: {
      bookingId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from("visits_bookings")
        .update({ statut: newStatus, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guided-tours-management"] });
      toast.success("Statut de la réservation mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  // Mutation pour clôturer un créneau
  const closeSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from("visits_slots")
        .update({ statut: "cloture" })
        .eq("id", slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guided-tours-management"] });
      toast.success("Créneau clôturé");
    },
    onError: () => {
      toast.error("Erreur lors de la clôture");
    },
  });

  // Générer un PDF récapitulatif
  const handleExportPDF = (slot: any) => {
    const doc = new jsPDF();

    // En-tête
    doc.setFillColor(0, 43, 69);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(24);
    doc.setTextColor(212, 175, 55);
    doc.text("BNRM", 105, 15, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("Gestion des Visites Guidées", 105, 25, { align: "center" });

    doc.setFontSize(12);
    doc.text(
      `Rapport du ${format(new Date(slot.date), "dd MMMM yyyy", { locale: fr })}`,
      105,
      35,
      { align: "center" }
    );

    // Informations du créneau
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    let yPos = 55;

    doc.text(`Heure : ${slot.heure.substring(0, 5)}`, 20, yPos);
    yPos += 8;
    doc.text(`Langue : ${slot.langue}`, 20, yPos);
    yPos += 8;
    doc.text(`Capacité maximale : ${slot.capacite_max} visiteurs`, 20, yPos);
    yPos += 8;
    doc.text(`Réservations actuelles : ${slot.reservations_actuelles}`, 20, yPos);
    yPos += 8;
    doc.text(
      `Places restantes : ${slot.capacite_max - slot.reservations_actuelles}`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(`Statut : ${slot.statut}`, 20, yPos);

    // Tableau des réservations
    if (slot.bookings && slot.bookings.length > 0) {
      yPos += 10;

      const tableData = slot.bookings.map((booking: any) => [
        booking.nom,
        booking.email,
        booking.telephone,
        booking.nb_visiteurs,
        booking.statut,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Nom", "Email", "Téléphone", "Visiteurs", "Statut"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [255, 255, 255],
        },
      });
    }

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm")}`,
      105,
      280,
      { align: "center" }
    );

    doc.save(
      `visites-guidees-${format(new Date(slot.date), "yyyy-MM-dd")}-${slot.heure.substring(0, 5)}.pdf`
    );

    toast.success("PDF téléchargé avec succès");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmee: "bg-green-100 text-green-800 border-green-300",
      annulee: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getSlotStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      disponible: "bg-green-100 text-green-800",
      complet: "bg-orange-100 text-orange-800",
      cloture: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#002B45] mb-2">
            Gestion des Visites Guidées
          </h1>
          <p className="text-[#002B45]/70 font-light">
            Gérez les créneaux et les réservations de visites guidées
          </p>
        </div>

        {/* Filtres */}
        <Card className="mb-6 border-[#D4AF37]/30">
          <CardHeader>
            <CardTitle className="text-lg font-light text-[#002B45]">
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-light text-[#002B45]/70 mb-2 block">
                  Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D4AF37]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-sm font-light text-[#002B45]/70 mb-2 block">
                  Statut du créneau
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-[#D4AF37]/30">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="complet">Complet</SelectItem>
                    <SelectItem value="cloture">Clôturé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des créneaux */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {slots?.map((slot: any) => (
              <Card
                key={slot.id}
                className="border-[#D4AF37]/30 overflow-hidden"
              >
                <CardHeader className="bg-white/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-6 w-6 text-[#D4AF37]" />
                      <div>
                        <CardTitle className="text-xl font-light text-[#002B45]">
                          {format(new Date(slot.date), "EEEE dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-2 text-sm text-[#002B45]/70">
                            <Clock className="h-4 w-4" />
                            {slot.heure.substring(0, 5)}
                          </span>
                          <span className="text-sm text-[#002B45]/70 capitalize">
                            {slot.langue}
                          </span>
                          <Badge className={getSlotStatusColor(slot.statut)}>
                            {slot.statut}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-[#002B45]/50 font-light">
                          Capacité
                        </div>
                        <div className="text-2xl font-light text-[#002B45]">
                          {slot.reservations_actuelles}/{slot.capacite_max}
                        </div>
                        <div className="text-xs text-[#002B45]/50 font-light">
                          {slot.capacite_max - slot.reservations_actuelles} restants
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportPDF(slot)}
                          className="border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        {slot.statut !== "cloture" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => closeSlotMutation.mutate(slot.id)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Clôturer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {slot.bookings && slot.bookings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead className="text-center">
                            <Users className="h-4 w-4 inline mr-1" />
                            Visiteurs
                          </TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {slot.bookings.map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              {booking.nom}
                            </TableCell>
                            <TableCell>{booking.email}</TableCell>
                            <TableCell>{booking.telephone}</TableCell>
                            <TableCell className="text-center">
                              {booking.nb_visiteurs}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.statut)}>
                                {booking.statut}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {booking.statut === "en_attente" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateBookingStatusMutation.mutate({
                                          bookingId: booking.id,
                                          newStatus: "confirmee",
                                        })
                                      }
                                      className="text-green-600 border-green-300 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Valider
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateBookingStatusMutation.mutate({
                                          bookingId: booking.id,
                                          newStatus: "annulee",
                                        })
                                      }
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Annuler
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-[#002B45]/50">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-light">Aucune réservation pour ce créneau</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {slots?.length === 0 && (
              <Card className="p-12 text-center border-[#D4AF37]/30">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-[#002B45]/30" />
                <p className="text-lg text-[#002B45]/50 font-light">
                  Aucun créneau trouvé avec les filtres sélectionnés
                </p>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GuidedToursBackoffice;
