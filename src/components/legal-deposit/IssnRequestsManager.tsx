import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle, Search, Filter, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface IssnRequest {
  id: string;
  requestNumber: string;
  title: string;
  discipline: string;
  language: string;
  country: string;
  publisher: string;
  support: string;
  frequency: string;
  contactAddress: string;
  status: "en_attente" | "validee" | "refusee";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export default function IssnRequestsManager() {
  const [requests, setRequests] = useState<IssnRequest[]>([
    {
      id: "1",
      requestNumber: "ISSN-2025-000001",
      title: "Revue Marocaine de Littérature",
      discipline: "Littérature",
      language: "Français",
      country: "Maroc",
      publisher: "Éditions Al-Maarifa",
      support: "mixte",
      frequency: "trimestrielle",
      contactAddress: "123 Rue Mohamed V, Rabat",
      status: "en_attente",
      submittedAt: new Date("2025-01-15"),
    },
    {
      id: "2",
      requestNumber: "ISSN-2025-000002",
      title: "Journal des Sciences Économiques",
      discipline: "Économie",
      language: "Arabe",
      country: "Maroc",
      publisher: "Publications Universitaires",
      support: "papier",
      frequency: "mensuelle",
      contactAddress: "456 Avenue Hassan II, Casablanca",
      status: "validee",
      submittedAt: new Date("2025-01-10"),
      reviewedAt: new Date("2025-01-12"),
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supportFilter, setSupportFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<IssnRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getStatusBadge = (status: IssnRequest["status"]) => {
    const variants = {
      en_attente: { label: "En attente", className: "bg-[#FFF8E1] text-[#F57C00] hover:bg-[#FFF8E1]" },
      validee: { label: "Validée", className: "bg-[#E7F5EC] text-[#2E7D32] hover:bg-[#E7F5EC]" },
      refusee: { label: "Refusée", className: "bg-[#FDEAEA] text-[#C62828] hover:bg-[#FDEAEA]" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getSupportLabel = (support: string) => {
    const labels = {
      papier: "Papier",
      en_ligne: "En ligne",
      mixte: "Mixte",
    };
    return labels[support as keyof typeof labels] || support;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      hebdomadaire: "Hebdomadaire",
      mensuelle: "Mensuelle",
      trimestrielle: "Trimestrielle",
      annuelle: "Annuelle",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSupport = supportFilter === "all" || request.support === supportFilter;
    const matchesSearch = 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSupport && matchesSearch;
  });

  const handleValidate = (request: IssnRequest) => {
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { ...r, status: "validee", reviewedAt: new Date() }
        : r
    ));
    toast.success(`Demande ${request.requestNumber} validée avec succès`);
    // TODO: Envoyer un email de notification au déclarant
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Veuillez saisir un motif de refus");
      return;
    }

    setRequests(requests.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: "refusee", reviewedAt: new Date(), rejectionReason }
        : r
    ));
    toast.success(`Demande ${selectedRequest.requestNumber} refusée`);
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    setSelectedRequest(null);
    // TODO: Envoyer un email de notification au déclarant avec le motif
  };

  const openRejectDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const openDetailsDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des demandes ISSN</CardTitle>
          <CardDescription>
            Gérez les demandes d'ISSN pour les publications périodiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, n° de demande ou éditeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={supportFilter} onValueChange={setSupportFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Support" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les supports</SelectItem>
                  <SelectItem value="papier">Papier</SelectItem>
                  <SelectItem value="en_ligne">En ligne</SelectItem>
                  <SelectItem value="mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#FFF8E1] border-[#F57C00]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#F57C00]">
                  {requests.filter(r => r.status === "en_attente").length}
                </div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="bg-[#E7F5EC] border-[#2E7D32]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#2E7D32]">
                  {requests.filter(r => r.status === "validee").length}
                </div>
                <div className="text-sm text-muted-foreground">Validées</div>
              </CardContent>
            </Card>
            <Card className="bg-[#FDEAEA] border-[#C62828]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#C62828]">
                  {requests.filter(r => r.status === "refusee").length}
                </div>
                <div className="text-sm text-muted-foreground">Refusées</div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des demandes */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="bg-[#DCE6F6]">
                <TableRow>
                  <TableHead className="text-[#2E2E2E]">N° de demande</TableHead>
                  <TableHead className="text-[#2E2E2E]">Titre de la publication</TableHead>
                  <TableHead className="text-[#2E2E2E]">Type de support</TableHead>
                  <TableHead className="text-[#2E2E2E]">Date de soumission</TableHead>
                  <TableHead className="text-[#2E2E2E]">Statut</TableHead>
                  <TableHead className="text-[#2E2E2E] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.requestNumber}</TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{getSupportLabel(request.support)}</TableCell>
                      <TableCell>{format(request.submittedAt, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "en_attente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleValidate(request)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRejectDialog(request)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Dialog de détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la demande ISSN</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande {selectedRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Titre</Label>
                  <p className="font-medium">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Discipline</Label>
                  <p className="font-medium">{selectedRequest.discipline}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Langue</Label>
                  <p className="font-medium">{selectedRequest.language}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Pays</Label>
                  <p className="font-medium">{selectedRequest.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Éditeur</Label>
                  <p className="font-medium">{selectedRequest.publisher}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Support</Label>
                  <p className="font-medium">{getSupportLabel(selectedRequest.support)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fréquence</Label>
                  <p className="font-medium">{getFrequencyLabel(selectedRequest.frequency)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Adresse de contact</Label>
                <p className="font-medium">{selectedRequest.contactAddress}</p>
              </div>
              {selectedRequest.rejectionReason && (
                <div>
                  <Label className="text-muted-foreground">Motif de refus</Label>
                  <p className="font-medium text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de refus */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande ISSN</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus pour la demande {selectedRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motif du refus <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Saisir le motif détaillé du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
