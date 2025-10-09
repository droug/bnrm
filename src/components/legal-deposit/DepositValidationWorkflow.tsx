import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Clock, FileText, Download, AlertCircle, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";

interface DepositRequest {
  id: string;
  request_number: string;
  title: string;
  subtitle: string;
  support_type: string;
  status: string;
  created_at: string;
  validation_dlbn_status?: string;
  validation_dlbn_date?: string;
  validation_dlbn_by?: string;
  validation_dlbn_comments?: string;
  validation_abn_status?: string;
  validation_abn_date?: string;
  validation_abn_by?: string;
  validation_abn_comments?: string;
  committee_validation_status?: string;
  committee_validation_date?: string;
  committee_validation_by?: string;
  committee_validation_comments?: string;
  initiator?: {
    first_name: string;
    last_name: string;
  };
}

export function DepositValidationWorkflow() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, activeTab]);

  const fetchRequests = async () => {
    if (!user) return;

    let query = supabase
      .from("legal_deposit_requests")
      .select(`
        id,
        request_number,
        title,
        subtitle,
        support_type,
        status,
        created_at,
        validation_dlbn_status,
        validation_dlbn_date,
        validation_dlbn_by,
        validation_dlbn_comments,
        validation_abn_status,
        validation_abn_date,
        validation_abn_by,
        validation_abn_comments,
        committee_validation_status,
        committee_validation_date,
        committee_validation_by,
        committee_validation_comments,
        initiator:profiles!initiator_id (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (activeTab === "pending") {
      query = query.in("status", ["soumis", "en_attente_validation_b", "en_attente_comite_validation"]);
    } else if (activeTab === "validated") {
      query = query.in("status", ["valide_par_b", "valide_par_comite"]);
    } else if (activeTab === "rejected") {
      query = query.in("status", ["rejete", "rejete_par_b", "rejete_par_comite"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    setRequests(data as any || []);
  };

  const getValidationStep = (request: DepositRequest): number => {
    if (request.committee_validation_status === "approved") return 3;
    if (request.validation_abn_status === "approved") return 2;
    if (request.validation_dlbn_status === "approved") return 1;
    return 0;
  };

  const getCurrentValidator = (request: DepositRequest): string => {
    const step = getValidationStep(request);
    switch (step) {
      case 0:
        return "Service DLBN";
      case 1:
        return "Département ABN";
      case 2:
        return "Comité de Validation";
      default:
        return "Validé";
    }
  };

  const handleValidation = async (
    requestId: string,
    validationType: "dlbn" | "abn" | "committee",
    status: "approved" | "rejected"
  ) => {
    setIsLoading(true);

    try {
      const updateData: any = {
        [`validation_${validationType}_status`]: status,
        [`validation_${validationType}_date`]: new Date().toISOString(),
        [`validation_${validationType}_by`]: user!.id,
        [`validation_${validationType}_comments`]: comments || null,
      };

      // Mettre à jour le statut global
      if (status === "rejected") {
        if (validationType === "dlbn") {
          updateData.status = "rejete_par_b";
        } else if (validationType === "committee") {
          updateData.status = "rejete_par_comite";
        } else {
          updateData.status = "rejete";
        }
      } else {
        // Progression vers l'étape suivante
        if (validationType === "dlbn") {
          updateData.status = "en_attente_comite_validation";
        } else if (validationType === "committee") {
          updateData.status = "valide_par_comite";
        }
      }

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Générer le document approprié
      if (status === "approved" && validationType === "dlbn") {
        await generateValidationForm(selectedRequest!);
      } else if (status === "rejected") {
        await generateRejectionLetter(selectedRequest!);
      }

      toast({
        title: "Succès",
        description: `Demande ${status === "approved" ? "approuvée" : "rejetée"} avec succès`,
      });

      setSelectedRequest(null);
      setComments("");
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating validation:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateValidationForm = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("Formulaire Canevas de Validation", 105, 30, { align: "center" });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Informations de la demande
    doc.setFontSize(12);
    doc.text("Numéro de demande:", 20, 50);
    doc.setFont(undefined, "bold");
    doc.text(request.request_number, 80, 50);
    
    doc.setFont(undefined, "normal");
    doc.text("Date de validation:", 20, 60);
    doc.setFont(undefined, "bold");
    doc.text(format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr }), 80, 60);
    
    // Détails de la publication
    doc.setFont(undefined, "normal");
    doc.setFontSize(14);
    doc.text("Détails de la Publication", 20, 75);
    doc.setLineWidth(0.3);
    doc.line(20, 77, 100, 77);
    
    doc.setFontSize(11);
    doc.text("Titre:", 20, 85);
    doc.text(request.title, 20, 92);
    
    if (request.subtitle) {
      doc.text("Sous-titre:", 20, 100);
      doc.text(request.subtitle, 20, 107);
    }
    
    doc.text("Type de support:", 20, 115);
    doc.text(request.support_type, 20, 122);
    
    // Validation DLBN
    doc.setFontSize(14);
    doc.text("Validation Service DLBN", 20, 140);
    doc.line(20, 142, 100, 142);
    
    doc.setFontSize(11);
    doc.text("Statut: APPROUVÉ", 20, 150);
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, 20, 157);
    
    // Pied de page
    doc.setFontSize(9);
    doc.text("Ce document certifie la conformité de la demande de dépôt légal.", 105, 280, { align: "center" });
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 287, { align: "center" });
    
    // Télécharger le PDF
    doc.save(`Validation_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const generateRejectionLetter = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    // En-tête officiel
    doc.setFontSize(20);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Service du Dépôt Légal", 105, 28, { align: "center" });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Date et référence
    doc.setFontSize(11);
    doc.text(`Rabat, le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, 140, 45);
    doc.text(`Réf: ${request.request_number}`, 20, 55);
    
    // Objet
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Objet: Notification de rejet de demande de dépôt légal", 20, 70);
    
    // Corps de la lettre
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    
    const bodyText = [
      "Madame, Monsieur,",
      "",
      "Nous accusons réception de votre demande de dépôt légal référencée ci-dessus,",
      `concernant la publication intitulée "${request.title}".`,
      "",
      "Après examen approfondi de votre dossier, nous regrettons de vous informer que",
      "votre demande ne peut être acceptée en l'état pour les raisons suivantes:",
      "",
      comments || "Non-conformité aux exigences du dépôt légal.",
      "",
      "Nous vous invitons à prendre connaissance de nos recommandations et à soumettre",
      "une nouvelle demande conforme aux dispositions légales en vigueur.",
      "",
      "Pour toute information complémentaire, vous pouvez contacter notre service",
      "au numéro suivant: +212 5XX XX XX XX",
      "",
      "Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.",
    ];
    
    let yPos = 85;
    bodyText.forEach((line) => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });
    
    // Signature
    doc.setFont(undefined, "bold");
    doc.text("Le Directeur du Service du Dépôt Légal", 105, 240, { align: "center" });
    
    // Pied de page
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text("Bibliothèque Nationale du Royaume du Maroc - Av. Ibn Batouta, Rabat", 105, 280, { align: "center" });
    doc.text("Tél: +212 5XX XX XX XX | Email: depot.legal@bnrm.ma", 105, 287, { align: "center" });
    
    // Télécharger le PDF
    doc.save(`Rejet_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      soumis: { label: "Soumis", variant: "secondary" },
      en_attente_validation_b: { label: "Validation BNRM", variant: "default" },
      en_attente_comite_validation: { label: "Validation Comité", variant: "default" },
      valide_par_b: { label: "Validé BNRM", variant: "default" },
      valide_par_comite: { label: "Validé", variant: "default" },
      rejete: { label: "Rejeté", variant: "destructive" },
      rejete_par_b: { label: "Rejeté BNRM", variant: "destructive" },
      rejete_par_comite: { label: "Rejeté Comité", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const renderWorkflowSteps = (request: DepositRequest) => {
    const steps = [
      {
        name: "Service DLBN",
        status: request.validation_dlbn_status,
        date: request.validation_dlbn_date,
      },
      {
        name: "Département ABN",
        status: request.validation_abn_status,
        date: request.validation_abn_date,
      },
      {
        name: "Comité de Validation",
        status: request.committee_validation_status,
        date: request.committee_validation_date,
      },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === "approved"
                    ? "bg-green-500 text-white"
                    : step.status === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.status === "approved" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : step.status === "rejected" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs mt-2 text-center font-medium">{step.name}</p>
              {step.date && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(step.date), "dd/MM/yyyy")}
                </p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  step.status === "approved" ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5" />
            Workflow de Validation des Demandes
          </CardTitle>
          <CardDescription>
            Validation multi-étapes: Service DLBN → Département ABN → Comité de Validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">En Attente</TabsTrigger>
              <TabsTrigger value="validated">Validées</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande dans cette catégorie</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Demande</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Support</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Étape Actuelle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.request_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.title}</div>
                            {request.subtitle && (
                              <div className="text-sm text-muted-foreground">
                                {request.subtitle}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.support_type}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCurrentValidator(request)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Examiner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validation de la Demande de Dépôt Légal</DialogTitle>
            <DialogDescription>
              N° {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {renderWorkflowSteps(selectedRequest)}

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Détails de la Publication</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Titre:</span>
                    <p className="mt-1">{selectedRequest.title}</p>
                  </div>
                  {selectedRequest.subtitle && (
                    <div>
                      <span className="font-medium">Sous-titre:</span>
                      <p className="mt-1">{selectedRequest.subtitle}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Type de support:</span>
                    <p className="mt-1">{selectedRequest.support_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Statut actuel:</span>
                    <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
                  </div>
                </div>
              </div>

              {/* Historique des validations */}
              {(selectedRequest.validation_dlbn_status ||
                selectedRequest.validation_abn_status ||
                selectedRequest.committee_validation_status) && (
                <div>
                  <h3 className="font-semibold mb-3">Historique des Validations</h3>
                  <div className="space-y-3">
                    {selectedRequest.validation_dlbn_status && (
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={selectedRequest.validation_dlbn_status === "approved" ? "default" : "destructive"}>
                            Service DLBN - {selectedRequest.validation_dlbn_status === "approved" ? "Approuvé" : "Rejeté"}
                          </Badge>
                          {selectedRequest.validation_dlbn_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.validation_dlbn_date), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.validation_dlbn_comments && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.validation_dlbn_comments}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRequest.validation_abn_status && (
                      <div className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={selectedRequest.validation_abn_status === "approved" ? "default" : "destructive"}>
                            Département ABN - {selectedRequest.validation_abn_status === "approved" ? "Approuvé" : "Rejeté"}
                          </Badge>
                          {selectedRequest.validation_abn_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.validation_abn_date), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.validation_abn_comments && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.validation_abn_comments}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRequest.committee_validation_status && (
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={selectedRequest.committee_validation_status === "approved" ? "default" : "destructive"}>
                            Comité - {selectedRequest.committee_validation_status === "approved" ? "Approuvé" : "Rejeté"}
                          </Badge>
                          {selectedRequest.committee_validation_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.committee_validation_date), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.committee_validation_comments && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.committee_validation_comments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedRequest.status.includes("valide") && !selectedRequest.status.includes("rejete") && (
                <>
                  <div>
                    <Label htmlFor="comments">
                      Commentaires de Validation {selectedRequest.status === "rejected" && "(Motif de rejet)"}
                    </Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Ajoutez vos commentaires..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null);
                        setComments("");
                      }}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const validationType =
                          getValidationStep(selectedRequest) === 0
                            ? "dlbn"
                            : getValidationStep(selectedRequest) === 1
                            ? "abn"
                            : "committee";
                        handleValidation(selectedRequest.id, validationType, "rejected");
                      }}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter (Générer Lettre)
                    </Button>
                    <Button
                      onClick={() => {
                        const validationType =
                          getValidationStep(selectedRequest) === 0
                            ? "dlbn"
                            : getValidationStep(selectedRequest) === 1
                            ? "abn"
                            : "committee";
                        handleValidation(selectedRequest.id, validationType, "approved");
                      }}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver {getValidationStep(selectedRequest) === 0 && "(Générer Canevas)"}
                    </Button>
                  </div>
                </>
              )}

              {(selectedRequest.status.includes("valide") || selectedRequest.status.includes("rejete")) && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Fermer
                  </Button>
                  {selectedRequest.status === "validated" && (
                    <Button onClick={() => generateValidationForm(selectedRequest)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Canevas
                    </Button>
                  )}
                  {selectedRequest.status === "rejected" && (
                    <Button variant="destructive" onClick={() => generateRejectionLetter(selectedRequest)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Lettre de Rejet
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
