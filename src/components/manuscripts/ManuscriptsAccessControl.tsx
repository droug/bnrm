import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ManuscriptsAccessControl() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Types d'abonnements uniquement
  const requestTypes = [
    { value: "all", label: "Tous les types" },
    { value: "free_access", label: "Accès gratuit" },
    { value: "basic_subscription", label: "Abonnement Basique" },
    { value: "premium_subscription", label: "Abonnement Premium" },
    { value: "institutional_subscription", label: "Abonnement Institutionnel" },
  ];

  // Exemples de demandes d'accès gratuits ou avec abonnements
  const accessRequests = [
    {
      id: "1",
      user: "Ahmed Benani",
      email: "ahmed.benani@email.ma",
      type: "free_access",
      typeLabel: "Accès gratuit",
      requestDate: "2025-01-15",
      status: "pending",
      institution: "Université Mohammed V",
      reason: "Recherche académique sur l'histoire marocaine",
    },
    {
      id: "2",
      user: "Fatima El Amrani",
      email: "f.elamrani@email.ma",
      type: "basic_subscription",
      typeLabel: "Abonnement Basique",
      requestDate: "2025-01-14",
      status: "pending",
      institution: "Bibliothèque municipale de Rabat",
      reason: "Consultation régulière des manuscrits pour le public",
    },
    {
      id: "3",
      user: "Hassan Tazi",
      email: "h.tazi@email.ma",
      type: "premium_subscription",
      typeLabel: "Abonnement Premium",
      requestDate: "2025-01-13",
      status: "approved",
      institution: "Institut Royal des Études Islamiques",
      reason: "Recherche approfondie et accès illimité aux collections",
    },
    {
      id: "4",
      user: "Amina Chakir",
      email: "a.chakir@email.ma",
      type: "institutional_subscription",
      typeLabel: "Abonnement Institutionnel",
      requestDate: "2025-01-12",
      status: "pending",
      institution: "Bibliothèque Nationale du Royaume du Maroc",
      reason: "Accès pour l'ensemble du personnel de recherche",
    },
    {
      id: "5",
      user: "Karim Fassi",
      email: "k.fassi@email.ma",
      type: "free_access",
      typeLabel: "Accès gratuit",
      requestDate: "2025-01-11",
      status: "rejected",
      institution: "Étudiant indépendant",
      reason: "Consultation ponctuelle pour mémoire de master",
    },
  ];

  const filteredRequests = selectedType === "all" 
    ? accessRequests 
    : accessRequests.filter(req => req.type === selectedType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleView = (request: any) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleApprove = (requestId: string) => {
    console.log("Approuver la demande:", requestId);
    setIsViewDialogOpen(false);
  };

  const handleReject = (requestId: string) => {
    console.log("Rejeter la demande:", requestId);
    setIsViewDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Demandes d'Accès
          </CardTitle>
          <CardDescription>
            Traiter et gérer les demandes d'accès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtres */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Type de demande</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste des demandes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Liste des demandes ({filteredRequests.length})</h3>
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{request.user}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {request.typeLabel}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Institution:</span> {request.institution}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Demandé le {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualiser
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande d'accès</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Demandeur</label>
                  <p className="text-base font-medium">{selectedRequest.user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type d'accès</label>
                  <p className="text-base">{selectedRequest.typeLabel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution</label>
                  <p className="text-base">{selectedRequest.institution}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de demande</label>
                  <p className="text-base">{new Date(selectedRequest.requestDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Raison de la demande</label>
                <p className="text-base mt-1">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver la demande
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedRequest.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter la demande
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
