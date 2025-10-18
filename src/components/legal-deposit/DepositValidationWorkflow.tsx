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
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';

interface DepositRequest {
  id: string;
  request_number: string;
  title: string;
  subtitle: string;
  support_type: string;
  status: string;
  author_name: string;
  created_at: string;
  validated_by_service?: string;
  service_validated_at?: string;
  service_validation_notes?: string;
  validated_by_department?: string;
  department_validated_at?: string;
  department_validation_notes?: string;
  validated_by_committee?: string;
  committee_validated_at?: string;
  committee_validation_notes?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
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
        author_name,
        created_at,
        validated_by_service,
        service_validated_at,
        service_validation_notes,
        validated_by_department,
        department_validated_at,
        department_validation_notes,
        validated_by_committee,
        committee_validated_at,
        committee_validation_notes,
        rejected_by,
        rejected_at,
        rejection_reason
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
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive"
      });
      // Utiliser des exemples de données pour démonstration
      setRequests(getExampleRequests());
      return;
    }

    // Si des données réelles existent, les utiliser, sinon utiliser les exemples
    if (data && data.length > 0) {
      setRequests(data as any);
    } else {
      setRequests(getExampleRequests());
    }
  };

  const getExampleRequests = (): DepositRequest[] => {
    const baseDate = new Date();
    
    if (activeTab === "pending") {
      return [
        {
          id: "example-1",
          request_number: "DL-2025-000123",
          title: "Histoire du Maroc Contemporain",
          subtitle: "Tome 1: Les Fondations",
          support_type: "Livre",
          status: "soumis",
          author_name: "Dr. Ahmed Benjelloun",
          created_at: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-2",
          request_number: "DL-2025-000089",
          title: "Revue Marocaine des Sciences Économiques",
          subtitle: "Volume 12 - Numéro 3",
          support_type: "Périodique",
          status: "en_attente_validation_b",
          author_name: "Prof. Fatima El Mansouri",
          created_at: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-3",
          request_number: "DL-2025-000156",
          title: "Documentaire: Les Cités Impériales du Maroc",
          subtitle: "",
          support_type: "Film/Vidéo",
          status: "en_attente_comite_validation",
          author_name: "Karim Tazi Productions",
          created_at: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } else if (activeTab === "validated") {
      return [
        {
          id: "example-4",
          request_number: "DL-2025-000045",
          title: "Patrimoine Architectural Marocain",
          subtitle: "Guide Illustré",
          support_type: "Livre",
          status: "valide_par_comite",
          author_name: "Architectes Associés",
          created_at: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_committee: "committee-user-id",
          committee_validated_at: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-5",
          request_number: "DL-2025-000012",
          title: "Atlas Linguistique du Maroc",
          subtitle: "Édition 2025",
          support_type: "Atlas",
          status: "valide_par_comite",
          author_name: "Institut National des Langues",
          created_at: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_committee: "committee-user-id",
          committee_validated_at: new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } else if (activeTab === "rejected") {
      return [
        {
          id: "example-6",
          request_number: "DL-2025-000078",
          title: "Publication Incomplète",
          subtitle: "",
          support_type: "Livre",
          status: "rejete_par_b",
          author_name: "Auteur Anonyme",
          created_at: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          rejected_by: "dept-user-id",
          rejected_at: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          rejection_reason: "Dossier incomplet : ISBN manquant, page de garde non conforme",
        },
      ];
    }
    
    return [];
  };

  const getValidationStep = (request: DepositRequest): number => {
    if (request.validated_by_committee) return 3;
    if (request.validated_by_department) return 2;
    if (request.validated_by_service) return 1;
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
    validationType: "service" | "department" | "committee",
    status: "approved" | "rejected"
  ) => {
    setIsLoading(true);

    try {
      const updateData: any = {};

      if (status === "approved") {
        if (validationType === "service") {
          updateData.validated_by_service = user!.id;
          updateData.service_validated_at = new Date().toISOString();
          updateData.service_validation_notes = comments || null;
          updateData.status = "en_attente_validation_b";
        } else if (validationType === "department") {
          updateData.validated_by_department = user!.id;
          updateData.department_validated_at = new Date().toISOString();
          updateData.department_validation_notes = comments || null;
          updateData.status = "en_attente_comite_validation";
        } else if (validationType === "committee") {
          updateData.validated_by_committee = user!.id;
          updateData.committee_validated_at = new Date().toISOString();
          updateData.committee_validation_notes = comments || null;
          updateData.status = "valide_par_comite";
        }
      } else {
        updateData.rejected_by = user!.id;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = comments || null;
        
        if (validationType === "service") {
          updateData.status = "rejete_par_b";
        } else if (validationType === "committee") {
          updateData.status = "rejete_par_comite";
        } else {
          updateData.status = "rejete";
        }
      }

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Générer le document approprié
      if (status === "approved" && validationType === "service") {
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
    
    // En-tête officiel BNRM
    let yPos = await addBNRMHeader(doc);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.text("Formulaire Canevas de Validation", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text("Numéro de demande:", 20, yPos);
    doc.setFont(undefined, "bold");
    doc.text(request.request_number, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, "normal");
    doc.text("Date de validation:", 20, yPos);
    doc.setFont(undefined, "bold");
    doc.text(format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr }), 80, yPos);
    yPos += 15;
    
    doc.setFont(undefined, "normal");
    doc.setFontSize(14);
    doc.text("Détails de la Publication", 20, yPos);
    yPos += 2;
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 100, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.text("Titre:", 20, yPos);
    yPos += 7;
    doc.text(request.title, 20, yPos);
    yPos += 8;
    
    if (request.subtitle) {
      doc.text("Sous-titre:", 20, yPos);
      yPos += 7;
      doc.text(request.subtitle, 20, yPos);
      yPos += 8;
    }
    
    doc.text("Type de support:", 20, yPos);
    yPos += 7;
    doc.text(request.support_type, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(14);
    doc.text("Validation Service DLBN", 20, yPos);
    yPos += 2;
    doc.line(20, yPos, 100, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.text("Statut: APPROUVÉ", 20, yPos);
    yPos += 7;
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
    
    doc.setFontSize(9);
    doc.text("Ce document certifie la conformité de la demande de dépôt légal.", 105, 280, { align: "center" });
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 287, { align: "center" });
    
    doc.save(`Validation_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const generateRejectionLetter = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    // En-tête officiel BNRM
    let yPos = await addBNRMHeader(doc);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.text("Service du Dépôt Légal", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(`Rabat, le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, 140, yPos);
    yPos += 5;
    doc.text(`Réf: ${request.request_number}`, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Objet: Notification de rejet de demande de dépôt légal", 20, 70);
    
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
    
    let yPosBody = 85;
    bodyText.forEach((line) => {
      doc.text(line, 20, yPosBody);
      yPosBody += 7;
    });
    
    doc.setFont(undefined, "bold");
    doc.text("Le Directeur du Service du Dépôt Légal", 105, 240, { align: "center" });
    
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text("Bibliothèque Nationale du Royaume du Maroc - Av. Ibn Batouta, Rabat", 105, 280, { align: "center" });
    doc.text("Tél: +212 5XX XX XX XX | Email: depot.legal@bnrm.ma", 105, 287, { align: "center" });
    
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
        validated: !!request.validated_by_service,
        date: request.service_validated_at,
      },
      {
        name: "Département ABN",
        validated: !!request.validated_by_department,
        date: request.department_validated_at,
      },
      {
        name: "Comité de Validation",
        validated: !!request.validated_by_committee,
        date: request.committee_validated_at,
      },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.validated
                    ? "bg-green-500 text-white"
                    : request.rejected_by
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.validated ? (
                  <CheckCircle className="h-5 w-5" />
                ) : request.rejected_by ? (
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
                  step.validated ? "bg-green-500" : "bg-gray-300"
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
              {(selectedRequest.validated_by_service ||
                selectedRequest.validated_by_department ||
                selectedRequest.validated_by_committee ||
                selectedRequest.rejected_by) && (
                <div>
                  <h3 className="font-semibold mb-3">Historique des Validations</h3>
                  <div className="space-y-3">
                    {selectedRequest.validated_by_service && (
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Service DLBN - Approuvé
                          </Badge>
                          {selectedRequest.service_validated_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.service_validated_at), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.service_validation_notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.service_validation_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRequest.validated_by_department && (
                      <div className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Département ABN - Approuvé
                          </Badge>
                          {selectedRequest.department_validated_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.department_validated_at), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.department_validation_notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.department_validation_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRequest.validated_by_committee && (
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Comité de Validation - Approuvé
                          </Badge>
                          {selectedRequest.committee_validated_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.committee_validated_at), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.committee_validation_notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.committee_validation_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRequest.rejected_by && (
                      <div className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            Demande Rejetée
                          </Badge>
                          {selectedRequest.rejected_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(selectedRequest.rejected_at), "dd/MM/yyyy à HH:mm")}
                            </span>
                          )}
                        </div>
                        {selectedRequest.rejection_reason && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {selectedRequest.rejection_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formulaire de validation */}
              {!selectedRequest.rejected_by && (
                <div>
                  <Label htmlFor="comments">Commentaires / Motif</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Ajouter des commentaires ou le motif de rejet..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              )}

              {/* Actions de validation */}
              {!selectedRequest.rejected_by && (
                <div className="flex gap-3 justify-end">
                  {!selectedRequest.validated_by_service && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleValidation(selectedRequest.id, "service", "rejected")}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter (DLBN)
                      </Button>
                      <Button
                        onClick={() => handleValidation(selectedRequest.id, "service", "approved")}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver (DLBN)
                      </Button>
                    </>
                  )}

                  {selectedRequest.validated_by_service && !selectedRequest.validated_by_department && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleValidation(selectedRequest.id, "department", "rejected")}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter (ABN)
                      </Button>
                      <Button
                        onClick={() => handleValidation(selectedRequest.id, "department", "approved")}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver (ABN)
                      </Button>
                    </>
                  )}

                  {selectedRequest.validated_by_department && !selectedRequest.validated_by_committee && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleValidation(selectedRequest.id, "committee", "rejected")}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter (Comité)
                      </Button>
                      <Button
                        onClick={() => handleValidation(selectedRequest.id, "committee", "approved")}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver (Comité)
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Boutons de génération de documents */}
              {selectedRequest.validated_by_service && (
                <div className="flex gap-3 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => generateValidationForm(selectedRequest)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger Formulaire de Validation
                  </Button>
                </div>
              )}

              {selectedRequest.rejected_by && (
                <div className="flex gap-3 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => generateRejectionLetter(selectedRequest)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger Lettre de Rejet
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