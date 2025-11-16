import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, MapPin, Users, Calendar, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RentalSpace {
  id: string;
  space_code: string;
  space_name: string;
  space_name_ar: string | null;
  description: string | null;
  capacity: number | null;
  equipment: string[] | null;
  hourly_rate: number | null;
  half_day_rate: number | null;
  full_day_rate: number | null;
  currency: string | null;
  is_active: boolean | null;
  location: string | null;
  rules: string | null;
}

interface RentalRequest {
  id: string;
  request_number: string;
  event_title: string;
  organization_name: string;
  contact_person: string;
  contact_email: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  rental_spaces: RentalSpace | null;
}

export default function RentalManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationNotes, setValidationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "requests") {
        const { data, error } = await supabase
          .from("rental_requests")
          .select(`
            *,
            rental_spaces (*)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } else {
        const { data, error } = await supabase
          .from("rental_spaces")
          .select("*")
          .order("space_code");

        if (error) throw error;
        setSpaces(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const updates: any = {
        status: newStatus,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
      };

      if (validationNotes) {
        updates.validation_notes = validationNotes;
      }

      if (newStatus === "rejected" && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      if (newStatus === "approved") {
        updates.availability_confirmed = true;
        updates.availability_checked_by = (await supabase.auth.getUser()).data.user?.id;
        updates.availability_checked_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("rental_requests")
        .update(updates)
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Demande ${newStatus === "approved" ? "approuvée" : "rejetée"} avec succès`,
      });

      setValidationDialogOpen(false);
      setValidationNotes("");
      setRejectionReason("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
      under_review: { label: "En révision", color: "bg-blue-100 text-blue-800" },
      approved: { label: "Approuvée", color: "bg-green-100 text-green-800" },
      rejected: { label: "Rejetée", color: "bg-red-100 text-red-800" },
      confirmed: { label: "Confirmée", color: "bg-indigo-100 text-indigo-800" },
      cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-800" },
      completed: { label: "Terminée", color: "bg-purple-100 text-purple-800" },
    };

    const variant = variants[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="Gestion des Locations"
        subtitle="Gérer les demandes et espaces locatifs"
        backPath="/admin/settings"
      />

      <div className="container mx-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">Demandes de location</TabsTrigger>
            <TabsTrigger value="spaces">Espaces disponibles</TabsTrigger>
          </TabsList>

          {/* Demandes de location */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="under_review">En révision</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                  <SelectItem value="confirmed">Confirmées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Demandes de location</CardTitle>
                <CardDescription>
                  {filteredRequests.length} demande(s) {statusFilter !== "all" && `(${statusFilter})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Demande</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Espace</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Aucune demande trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.request_number}</TableCell>
                          <TableCell>{request.event_title}</TableCell>
                          <TableCell>{request.organization_name}</TableCell>
                          <TableCell>{request.rental_spaces?.space_name || "-"}</TableCell>
                          <TableCell>
                            {format(new Date(request.start_date), "dd MMM yyyy", { locale: fr })}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setValidationDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Espaces disponibles */}
          <TabsContent value="spaces" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Espaces disponibles</CardTitle>
                  <CardDescription>{spaces.length} espace(s)</CardDescription>
                </div>
                <Button onClick={() => navigate("/admin/settings")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un espace
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaces.map((space) => (
                    <Card key={space.id} className={!space.is_active ? "opacity-60" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{space.space_name}</CardTitle>
                            <CardDescription>{space.space_code}</CardDescription>
                          </div>
                          {!space.is_active && (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Capacité: {space.capacity} personnes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{space.location}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-sm font-medium">Tarifs:</div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {space.hourly_rate && <div>Horaire: {space.hourly_rate} {space.currency}</div>}
                            {space.half_day_rate && <div>Demi-journée: {space.half_day_rate} {space.currency}</div>}
                            {space.full_day_rate && <div>Journée: {space.full_day_rate} {space.currency}</div>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Détails */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>{selectedRequest?.request_number}</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Événement</div>
                    <div className="text-sm text-muted-foreground">{selectedRequest.event_title}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Organisation</div>
                    <div className="text-sm text-muted-foreground">{selectedRequest.organization_name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Contact</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRequest.contact_person}<br />
                      {selectedRequest.contact_email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Dates</div>
                    <div className="text-sm text-muted-foreground">
                      Du {format(new Date(selectedRequest.start_date), "dd/MM/yyyy", { locale: fr })}<br />
                      Au {format(new Date(selectedRequest.end_date), "dd/MM/yyyy", { locale: fr })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Validation */}
        <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valider la demande</DialogTitle>
              <DialogDescription>{selectedRequest?.request_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes de validation</label>
                <Textarea
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Ajoutez vos notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const reason = prompt("Raison du rejet:");
                  if (reason) {
                    setRejectionReason(reason);
                    selectedRequest && handleUpdateStatus(selectedRequest.id, "rejected");
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button
                onClick={() => selectedRequest && handleUpdateStatus(selectedRequest.id, "approved")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
