import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Clock, FileText, Download, AlertCircle, CheckCheck, Archive, GitBranch, Info, Search, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { DuplicateDetectionAlert } from "./DuplicateDetectionAlert";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';
import { LegalDepositDetailsView } from "@/components/legal-deposit/LegalDepositDetailsView";
import { InlineSelect } from "@/components/ui/inline-select";

interface DepositRequest {
  id: string;
  request_number: string;
  title: string;
  subtitle: string;
  support_type: string;
  monograph_type?: string;
  status: string;
  author_name: string;
  created_at: string;
  metadata?: any;
  documents_urls?: any;
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
  // Champs de confirmation
  confirmation_status?: string;
  editor_confirmed?: boolean;
  printer_confirmed?: boolean;
  // Champs d'arbitrage
  arbitration_requested?: boolean;
  arbitration_requested_at?: string;
  arbitration_status?: string;
  arbitration_reason?: string;
}

export function DepositValidationWorkflow() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [allRequests, setAllRequests] = useState<DepositRequest[]>([]); // Pour les statistiques
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [viewDetailsRequest, setViewDetailsRequest] = useState<DepositRequest | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCommitteeConfirmModal, setShowCommitteeConfirmModal] = useState(false);
  const [showArbitrationModal, setShowArbitrationModal] = useState(false);
  const [arbitrationReason, setArbitrationReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingRejection, setPendingRejection] = useState<{
    requestId: string;
    validationType: "service" | "department" | "committee";
  } | null>(null);
  
  // États pour les champs éditables
  const [editTitle, setEditTitle] = useState("");
  const [editPrinter, setEditPrinter] = useState("");
  const [editPageCount, setEditPageCount] = useState("");
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupport, setSelectedSupport] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fonction pour détecter les doublons par titre
  const findDuplicatesByTitle = (request: DepositRequest): DepositRequest[] => {
    return requests.filter(
      req => req.id !== request.id && 
      req.title.toLowerCase().trim() === request.title.toLowerCase().trim()
    );
  };

  // Charger toutes les demandes pour les statistiques au montage
  useEffect(() => {
    if (user) {
      fetchAllRequests();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
    setCurrentPage(1); // Réinitialiser la page lors du changement d'onglet
  }, [user, activeTab]);

  const fetchAllRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("legal_deposit_requests")
      .select(`
        id,
        request_number,
        title,
        subtitle,
        support_type,
        monograph_type,
        status,
        author_name,
        created_at,
        metadata,
        documents_urls,
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
        rejection_reason,
        confirmation_status,
        editor_confirmed,
        printer_confirmed,
        arbitration_requested,
        arbitration_requested_at,
        arbitration_status,
        arbitration_reason
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAllRequests(data as any);
    }
  };

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
        monograph_type,
        status,
        author_name,
        created_at,
        metadata,
        documents_urls,
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
        rejection_reason,
        confirmation_status,
        editor_confirmed,
        printer_confirmed,
        arbitration_requested,
        arbitration_requested_at,
        arbitration_status,
        arbitration_reason
      `)
      .order("created_at", { ascending: false });

    if (activeTab === "pending") {
      // Demandes en attente de validation:
      // 1. Status en cours de traitement (brouillon, soumis, en_attente_validation_b, en_cours)
      // 2. Exclure les statuts finaux (attribue, rejete, etc.)
      // 3. Exclure les demandes déjà validées par le département ABN
      // 4. Exclure les demandes en attente de confirmation réciproque (pending_confirmation)
      query = query
        .not('status', 'in', '(attribue,valide_par_b,rejete,rejete_par_b,rejete_par_comite)')
        .is('validated_by_department', null)
        .or('confirmation_status.is.null,confirmation_status.eq.confirmed,confirmation_status.eq.not_required')
        .neq('confirmation_status', 'pending_confirmation');
    } else if (activeTab === "validated") {
      // Demandes validées: status attribue OU validated_by_department non null
      query = query.or('status.eq.attribue,validated_by_department.not.is.null');
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
      setRequests(getExampleRequests());
      return;
    }

    if (data && data.length > 0) {
      setRequests(data as any);
    } else {
      setRequests([]);
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
          metadata: {
            author_type: "physique",
            author_firstname: "Ahmed",
            author_lastname: "Benjelloun",
            publisher_name: "Éditions Al Manar",
          },
        },
        {
          id: "example-1-duplicate",
          request_number: "DL-2025-000124",
          title: "Histoire du Maroc Contemporain",
          subtitle: "Tome 1: Les Fondations",
          support_type: "Livre",
          status: "soumis",
          author_name: "Éditions Al Manar",
          created_at: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            author_type: "morale",
            publisher_name: "Éditions Al Manar",
          },
        },
        {
          id: "example-1-duplicate-2",
          request_number: "DL-2025-000125",
          title: "Histoire du Maroc Contemporain",
          subtitle: "Tome 1: Les Fondations",
          support_type: "Livre",
          status: "soumis",
          author_name: "Imprimerie Nationale",
          created_at: new Date(baseDate.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            printer_name: "Imprimerie Nationale",
            publisher_name: "Éditions Al Manar",
          },
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
          support_type: "Audio-visuel",
          status: "en_attente_comite_validation",
          author_name: "Karim Tazi Productions",
          created_at: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-7",
          request_number: "DL-2025-000201",
          title: "Les Traditions Culinaires Marocaines",
          subtitle: "Volume 2",
          support_type: "Livre",
          status: "soumis",
          author_name: "Chef Hassan Alaoui",
          created_at: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-8",
          request_number: "DL-2025-000202",
          title: "Base de Données Botaniques du Maroc",
          subtitle: "",
          support_type: "Base de données",
          status: "soumis",
          author_name: "Institut Scientifique",
          created_at: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-9",
          request_number: "DL-2025-000203",
          title: "Logiciel de Gestion Bibliothécaire",
          subtitle: "Version 3.0",
          support_type: "Logiciel",
          status: "en_attente_validation_b",
          author_name: "TechSoft Maroc",
          created_at: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-10",
          request_number: "DL-2025-000204",
          title: "Manuscrits Andalous du 15ème siècle",
          subtitle: "Collection Royale",
          support_type: "Collections spéciales",
          status: "soumis",
          author_name: "Bibliothèque Royale",
          created_at: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-11",
          request_number: "DL-2025-000205",
          title: "Revue d'Architecture Moderne",
          subtitle: "N° 45",
          support_type: "Périodique",
          status: "en_attente_comite_validation",
          author_name: "Ordre des Architectes",
          created_at: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-12",
          request_number: "DL-2025-000206",
          title: "Atlas Géographique du Royaume",
          subtitle: "Édition Spéciale",
          support_type: "Livre",
          status: "soumis",
          author_name: "Institut Cartographique",
          created_at: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-13",
          request_number: "DL-2025-000207",
          title: "Encyclopédie de la Musique Andalouse",
          subtitle: "Tome 3",
          support_type: "Audio-visuel",
          status: "en_attente_validation_b",
          author_name: "Conservatoire National",
          created_at: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-14",
          request_number: "DL-2025-000208",
          title: "Dictionnaire Amazighe-Français",
          subtitle: "Volume 1: A-M",
          support_type: "Livre",
          status: "soumis",
          author_name: "Institut Royal de la Culture Amazighe",
          created_at: new Date(baseDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "example-15",
          request_number: "DL-2025-000209",
          title: "Collection Numérique d'Art Contemporain",
          subtitle: "",
          support_type: "Collections spéciales",
          status: "en_attente_comite_validation",
          author_name: "Musée Mohammed VI",
          created_at: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_service: "service-user-id",
          service_validated_at: new Date(baseDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          validated_by_department: "dept-user-id",
          department_validated_at: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
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
          support_type: "Livre",
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
    if (request.validated_by_department) return 2;
    // Les demandes approuvées par arbitrage ont déjà reçu l'approbation du comité via le validateur
    if (request.validated_by_committee || request.arbitration_status === 'approved') return 1;
    return 0;
  };

  const getCurrentValidator = (request: DepositRequest): string => {
    const step = getValidationStep(request);
    switch (step) {
      case 0:
        return "Comité de Validation";
      case 1:
        return "Département ABN";
      default:
        return "Validé";
    }
  };

  const handleValidation = async (
    requestId: string,
    validationType: "service" | "department" | "committee",
    status: "approved" | "rejected",
    customRejectionReason?: string
  ) => {
    setIsLoading(true);

    try {
      // Pour les exemples, simuler une mise à jour
      if (requestId.startsWith("example-")) {
        // Mise à jour locale pour les exemples
        const updatedRequests = requests.map(req => {
          if (req.id === requestId) {
            const updatedRequest = { ...req };
            
            if (status === "approved") {
              if (validationType === "committee") {
                updatedRequest.validated_by_committee = user!.id;
                updatedRequest.committee_validated_at = new Date().toISOString();
                updatedRequest.committee_validation_notes = comments || null;
                updatedRequest.status = "en_attente_validation_b";
              } else if (validationType === "department") {
                updatedRequest.validated_by_department = user!.id;
                updatedRequest.department_validated_at = new Date().toISOString();
                updatedRequest.department_validation_notes = comments || null;
                updatedRequest.status = "valide_par_b";
              }
            } else {
              updatedRequest.rejected_by = user!.id;
              updatedRequest.rejected_at = new Date().toISOString();
              updatedRequest.rejection_reason = customRejectionReason || comments || null;
              
              if (validationType === "committee") {
                updatedRequest.status = "rejete_par_comite";
              } else if (validationType === "department") {
                updatedRequest.status = "rejete_par_b";
              } else {
                updatedRequest.status = "rejete";
              }
            }
            
            return updatedRequest;
          }
          return req;
        });
        
        setRequests(updatedRequests);
        
        // Générer le document approprié selon le type d'approbation (seulement pour le rejet)
        if (status === "rejected") {
          await generateRejectionLetter(selectedRequest!);
        }
        // Note: Pour l'approbation du comité, pas de document généré - juste une confirmation
        
        toast({
          title: "Succès",
          description: `Demande ${status === "approved" ? "approuvée" : "rejetée"} avec succès (données d'exemple)`,
        });
        
        setSelectedRequest(null);
        setComments("");
        return;
      }
      
      // Pour les vraies données, utiliser Supabase
      const updateData: any = {};

      if (status === "approved") {
        if (validationType === "committee") {
          updateData.validated_by_committee = user!.id;
          updateData.committee_validated_at = new Date().toISOString();
          updateData.committee_validation_notes = comments || null;
          updateData.status = "en_attente_validation_b";
        } else if (validationType === "department") {
          updateData.validated_by_department = user!.id;
          updateData.department_validated_at = new Date().toISOString();
          updateData.department_validation_notes = comments || null;
          updateData.status = "attribue";
        }
      } else {
        updateData.rejected_by = user!.id;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = customRejectionReason || comments || null;
        
        if (validationType === "committee") {
          updateData.status = "rejete_par_comite";
        } else if (validationType === "department") {
          updateData.status = "rejete_par_b";
        } else {
          updateData.status = "rejete";
        }
      }

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Envoyer une notification d'attribution si validation finale (department)
      let emailNotificationStatus = "";
      if (status === "approved" && validationType === "department") {
        try {
          const { data: notifResult, error: notifError } = await supabase.functions.invoke('notify-deposit-attribution', {
            body: { requestId }
          });
          
          if (notifError) {
            console.error("Error sending attribution notification:", notifError);
            emailNotificationStatus = " (Erreur envoi notification)";
          } else if (notifResult?.emailSent) {
            emailNotificationStatus = ` - Email envoyé à ${notifResult.recipient}`;
          } else if (notifResult?.error) {
            console.warn("Email not sent:", notifResult.error);
            emailNotificationStatus = ` - Email non envoyé: ${notifResult.message || 'Domaine non vérifié'}`;
          } else {
            emailNotificationStatus = " - Notification enregistrée";
          }
        } catch (notifError) {
          console.error("Error invoking notify-deposit-attribution:", notifError);
          emailNotificationStatus = " (Erreur technique notification)";
        }
      }

      // Générer le document approprié selon le type d'approbation (seulement pour le rejet)
      if (status === "rejected") {
        await generateRejectionLetter(selectedRequest!);
      }
      // Note: Pour l'approbation du comité, pas de document généré - juste une confirmation

      toast({
        title: "Succès",
        description: `Demande ${status === "approved" ? "approuvée" : "rejetée"} avec succès${emailNotificationStatus}`,
      });

      setSelectedRequest(null);
      setComments("");
      setRejectionReason("");
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

  const saveFieldCorrections = async (requestId: string) => {
    try {
      const currentRequest = requests.find(r => r.id === requestId);
      if (!currentRequest) return;

      const updatedMetadata = {
        ...currentRequest.metadata,
        printer_name: editPrinter,
        page_count: editPageCount ? parseInt(editPageCount) : null,
        customFields: {
          ...currentRequest.metadata?.customFields,
          printer_name: editPrinter,
          page_count: editPageCount ? parseInt(editPageCount) : null,
        }
      };

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update({
          title: editTitle,
          metadata: updatedMetadata,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Corrections enregistrées",
        description: "Les modifications ont été sauvegardées",
      });

      // Mettre à jour l'état local
      setRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { ...r, title: editTitle, metadata: updatedMetadata }
          : r
      ));
      
      // Mettre à jour selectedRequest aussi
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
          title: editTitle,
          metadata: updatedMetadata,
        });
      }
    } catch (error: any) {
      console.error("Error saving corrections:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les corrections",
        variant: "destructive",
      });
    }
  };

  const openRejectionModal = (
    requestId: string,
    validationType: "service" | "department" | "committee"
  ) => {
    setPendingRejection({ requestId, validationType });
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez saisir un motif de rejet",
        variant: "destructive"
      });
      return;
    }

    if (pendingRejection) {
      await handleValidation(
        pendingRejection.requestId,
        pendingRejection.validationType,
        "rejected",
        rejectionReason
      );
      setShowRejectionModal(false);
      setPendingRejection(null);
      setRejectionReason("");
    }
  };

  const handleArbitrationSubmit = async () => {
    if (!arbitrationReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez saisir un motif pour l'arbitrage",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRequest || !user) return;

    setIsLoading(true);

    try {
      // Récupérer le nom de l'utilisateur depuis le profil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      const requestedByName = profileData 
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || user.email || "Utilisateur"
        : user.email || "Utilisateur";

      // Appeler l'Edge Function pour envoyer les notifications
      const { data, error } = await supabase.functions.invoke("send-arbitration-notification", {
        body: {
          request_id: selectedRequest.id,
          reason: arbitrationReason,
          requested_by_name: requestedByName
        }
      });

      if (error) throw error;

      toast({
        title: "Arbitrage demandé",
        description: `La demande d'arbitrage a été envoyée à ${data.validators_notified || 1} validateur(s)`,
      });

      setShowArbitrationModal(false);
      setArbitrationReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error("Error requesting arbitration:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la demande d'arbitrage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPending = async (requestId: string) => {
    setIsLoading(true);

    try {
      // Pour les exemples, simuler une mise à jour
      if (requestId.startsWith("example-")) {
        const updatedRequests = requests.map(req => {
          if (req.id === requestId) {
            return { ...req, status: "en_cours" };
          }
          return req;
        });
        setRequests(updatedRequests);
        
        toast({
          title: "Demande mise en attente",
          description: "Le statut de la demande a été mis à jour (données d'exemple)",
        });
        
        setSelectedRequest(null);
        return;
      }

      // Pour les vraies données, utiliser Supabase
      const { error } = await supabase
        .from("legal_deposit_requests")
        .update({ status: "en_cours" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Demande mise en attente",
        description: "Le statut de la demande a été mis à jour vers 'En cours'",
      });

      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add request details to PDF
  const addRequestDetailsToPDF = (doc: jsPDF, request: DepositRequest, startY: number): number => {
    let yPos = startY;
    const metadata = request.metadata || {};
    const customFields = metadata.customFields || {};
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    const checkNewPage = (neededSpace: number = 25) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
    };

    const addSection = (title: string) => {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(title, margin, yPos);
      yPos += 2;
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, margin + 80, yPos);
      yPos += 8;
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    };

    const addField = (label: string, value: string | undefined | null) => {
      if (!value) return;
      checkNewPage();
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, margin, yPos);
      doc.setFont(undefined, "normal");
      const splitText = doc.splitTextToSize(value, maxWidth - 50);
      doc.text(splitText, margin + 50, yPos);
      yPos += 6 * Math.max(1, splitText.length);
    };

    // Informations générales
    addSection("Informations Générales");
    addField("N° Demande", request.request_number);
    addField("Date de soumission", format(new Date(request.created_at), "dd/MM/yyyy à HH:mm", { locale: fr }));
    addField("Type de support", request.support_type);
    if (request.monograph_type) addField("Type de monographie", request.monograph_type);

    // Publication
    addSection("Identification de la Publication");
    addField("Titre", request.title);
    if (request.subtitle) addField("Sous-titre", request.subtitle);
    addField("Auteur", request.author_name);
    if (customFields.author_nationality) addField("Nationalité", customFields.author_nationality);
    if (customFields.author_gender) addField("Genre", customFields.author_gender);
    if (metadata.author_type) addField("Type d'auteur", metadata.author_type === 'physique' ? 'Personne physique' : 'Personne morale');
    if (customFields.author_region) addField("Région", customFields.author_region);
    if (customFields.author_city) addField("Ville", customFields.author_city);
    if (customFields.publication_type) addField("Type de publication", customFields.publication_type);
    if (customFields.publication_discipline) addField("Discipline", customFields.publication_discipline);
    if (customFields.publication_language) addField("Langue", customFields.publication_language);
    if (customFields.publication_pages) addField("Nombre de pages", customFields.publication_pages);
    if (customFields.publication_isbn) addField("ISBN", customFields.publication_isbn);
    if (customFields.publication_issn) addField("ISSN", customFields.publication_issn);
    if (customFields.publication_year) addField("Année de publication", customFields.publication_year);
    if (customFields.publication_edition) addField("Édition", customFields.publication_edition);

    // Éditeur
    if (metadata.publisher_name || customFields.publisher_name) {
      addSection("Identification de l'Éditeur");
      addField("Éditeur", metadata.publisher_name || customFields.publisher_name);
      if (customFields.publisher_type) addField("Type d'éditeur", customFields.publisher_type);
      if (customFields.publisher_address) addField("Adresse", customFields.publisher_address);
      if (customFields.publisher_city) addField("Ville", customFields.publisher_city);
      if (customFields.publication_date) addField("Date de publication prévue", customFields.publication_date);
    }

    // Imprimeur
    if (metadata.printer_name || customFields.printer_name) {
      addSection("Identification de l'Imprimeur");
      addField("Imprimerie", metadata.printer_name || customFields.printer_name);
      if (customFields.printer_tirage) addField("Nombre de tirage", customFields.printer_tirage);
    }

    // Distributeur (pour audiovisuel/logiciels)
    if (customFields.distributor_name) {
      addSection("Identification du Distributeur");
      addField("Distributeur", customFields.distributor_name);
      if (customFields.distributor_tirage) addField("Nombre de tirage", customFields.distributor_tirage);
    }

    // Producteur (pour audiovisuel)
    if (customFields.producer_name) {
      addSection("Identification du Producteur");
      addField("Producteur", customFields.producer_name);
    }

    // Champs personnalisés supplémentaires
    const displayedFields = [
      'author_nationality', 'author_gender', 'author_region', 'author_city',
      'publication_type', 'publication_discipline', 'publication_language', 
      'publication_pages', 'publication_isbn', 'publication_issn', 'publication_year',
      'publication_edition', 'publisher_name', 'publisher_type', 'publisher_address',
      'publisher_city', 'publication_date', 'printer_name', 'printer_tirage',
      'distributor_name', 'distributor_tirage', 'producer_name'
    ];

    const otherFields = Object.entries(customFields).filter(
      ([key, value]) => !displayedFields.includes(key) && value
    );

    if (otherFields.length > 0) {
      addSection("Informations Complémentaires");
      otherFields.forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        addField(label, value as string);
      });
    }

    return yPos;
  };

  const generateValidationFormDLBN = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    let yPos = await addBNRMHeader(doc);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("ATTESTATION DE VALIDATION - SERVICE DLBN", 105, yPos, { align: "center" });
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Direction de la Légalisation et de la Bibliographie Nationale", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Rabat, le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, 140, yPos);
    yPos += 15;

    // Ajouter tous les détails
    yPos = addRequestDetailsToPDF(doc, request, yPos);

    // Section validation
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 102, 51);
    doc.text("DÉCISION: VALIDÉ PAR LE SERVICE DLBN", 20, yPos);
    yPos += 8;
    
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date de validation: ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, yPos);
    yPos += 6;
    if (comments) {
      doc.text(`Observations: ${comments}`, 20, yPos);
    }
    
    addBNRMFooter(doc, doc.getNumberOfPages());
    doc.save(`Validation_DLBN_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const generateAccuseReception = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    let yPos = await addBNRMHeader(doc);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 102, 51);
    doc.text("ACCUSÉ DE RÉCEPTION", 105, yPos, { align: "center" });
    yPos += 8;
    
    doc.setFontSize(12);
    doc.text("Demande de Dépôt Légal", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`Rabat, le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, 140, yPos);
    yPos += 15;

    // Référence de la demande
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Référence de la demande:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(request.request_number || "N/A", 75, yPos);
    yPos += 8;

    doc.setFont(undefined, "bold");
    doc.text("Date de dépôt:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(format(new Date(request.created_at), "dd MMMM yyyy", { locale: fr }), 75, yPos);
    yPos += 15;

    // Corps du texte
    doc.setFontSize(11);
    const introText = "La Bibliothèque Nationale du Royaume du Maroc accuse réception de votre demande de dépôt légal concernant l'ouvrage suivant:";
    const introLines = doc.splitTextToSize(introText, 170);
    doc.text(introLines, 20, yPos);
    yPos += introLines.length * 6 + 10;

    // Détails de l'ouvrage
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 35, "F");
    
    doc.setFont(undefined, "bold");
    doc.text("Titre:", 25, yPos);
    doc.setFont(undefined, "normal");
    const titleLines = doc.splitTextToSize(request.title || "N/A", 130);
    doc.text(titleLines, 55, yPos);
    yPos += titleLines.length * 5 + 5;

    doc.setFont(undefined, "bold");
    doc.text("Auteur:", 25, yPos);
    doc.setFont(undefined, "normal");
    doc.text(request.author_name || "N/A", 55, yPos);
    yPos += 8;

    doc.setFont(undefined, "bold");
    doc.text("Support:", 25, yPos);
    doc.setFont(undefined, "normal");
    doc.text(request.support_type || "N/A", 55, yPos);
    yPos += 15;

    // Message de confirmation
    yPos += 5;
    doc.setFontSize(11);
    const confirmText = "Votre demande a été enregistrée et validée par nos services. Ce document constitue un accusé de réception officiel de votre dépôt légal.";
    const confirmLines = doc.splitTextToSize(confirmText, 170);
    doc.text(confirmLines, 20, yPos);
    yPos += confirmLines.length * 6 + 10;

    // Numéro de dépôt légal
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 102, 51);
    doc.text("N° de Dépôt Légal attribué:", 20, yPos);
    doc.text(request.request_number || "En cours d'attribution", 85, yPos);
    yPos += 15;

    // Date de validation
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Date de validation: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
    yPos += 15;

    // Signature
    doc.setFontSize(10);
    doc.text("Le Directeur de la Bibliothèque Nationale", 120, yPos);
    yPos += 5;
    doc.text("du Royaume du Maroc", 135, yPos);
    
    addBNRMFooter(doc, doc.getNumberOfPages());
    doc.save(`Accuse_Reception_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const generateValidationFormComite = async (request: DepositRequest) => {
    const doc = new jsPDF();
    
    let yPos = await addBNRMHeader(doc);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("ATTESTATION DE VALIDATION - COMITÉ", 105, yPos, { align: "center" });
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Comité de Validation du Dépôt Légal", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Rabat, le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, 140, yPos);
    yPos += 15;

    // Ajouter tous les détails
    yPos = addRequestDetailsToPDF(doc, request, yPos);

    // Section validation
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("DÉCISION: VALIDÉ PAR LE COMITÉ DE VALIDATION", 20, yPos);
    yPos += 8;
    
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date de validation: ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, yPos);
    yPos += 6;
    if (comments) {
      doc.text(`Observations du comité: ${comments}`, 20, yPos);
    }
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Cette demande sera transmise au Département ABN pour validation finale.", 20, yPos);
    
    addBNRMFooter(doc, doc.getNumberOfPages());
    doc.save(`Validation_Comite_${request.request_number}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  // Fonction générique pour compatibilité
  const generateValidationForm = async (request: DepositRequest, validationType?: string) => {
    if (validationType === "department") {
      await generateAccuseReception(request);
    } else if (validationType === "committee") {
      await generateValidationFormComite(request);
    } else {
      await generateValidationFormDLBN(request);
    }
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

  const getStatusBadge = (status: string, request?: DepositRequest) => {
    // Déterminer le statut affiché en fonction de l'étape du workflow
    let displayStatus = status;
    
    if (request) {
      // Si rejeté
      if (request.rejected_by || ['rejete', 'rejete_par_b', 'rejete_par_comite'].includes(status)) {
        displayStatus = 'rejete';
      }
      // Si validé par ABN (attribué)
      else if (request.validated_by_department || ['valide_par_b', 'attribue'].includes(status)) {
        displayStatus = 'attribue';
      }
      // Si validé par comité mais pas encore par ABN (en attente)
      else if (request.validated_by_committee && !request.validated_by_department) {
        displayStatus = 'en_attente';
      }
      // Si en cours de traitement
      else if (status === 'en_cours') {
        displayStatus = 'en_cours';
      }
      // Si pas encore approuvé par le comité (soumis)
      else if (!request.validated_by_committee) {
        displayStatus = 'soumis';
      }
    }
    
    const statusConfig: any = {
      brouillon: { label: "Soumise", variant: "secondary" },
      soumis: { label: "Soumise", variant: "secondary" },
      en_cours: { label: "En cours", variant: "default" },
      en_attente: { label: "En attente", variant: "outline" },
      en_attente_validation_b: { label: "En attente", variant: "outline" },
      rejete: { label: "Rejetée", variant: "destructive" },
      rejete_par_comite: { label: "Rejetée", variant: "destructive" },
      rejete_par_b: { label: "Rejetée", variant: "destructive" },
      valide_par_b: { label: "Attribuée", variant: "default" },
      attribue: { label: "Attribuée", variant: "default" },
    };

    const config = statusConfig[displayStatus] || { label: displayStatus, variant: "secondary" };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const renderWorkflowSteps = (request: DepositRequest) => {
    const steps = [
      {
        name: "Comité de Validation",
        validated: !!request.validated_by_committee,
        date: request.committee_validated_at,
      },
      {
        name: "Département ABN",
        validated: !!request.validated_by_department,
        date: request.department_validated_at,
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
            Validation en 2 étapes: Comité de Validation → Département ABN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">En Attente</TabsTrigger>
              <TabsTrigger value="validated">Validées</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Filtres */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Recherche</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="N°, titre, auteur..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="support">Type de support</Label>
                    <InlineSelect
                      value={selectedSupport}
                      onChange={(value) => {
                        setSelectedSupport(value);
                        setCurrentPage(1);
                      }}
                      placeholder="Tous les supports"
                      options={[
                        { value: "all", label: "Tous" },
                        { value: "Livre", label: "Livre" },
                        { value: "Périodique", label: "Périodique" },
                        { value: "Base de données", label: "Base de données" },
                        { value: "Logiciel", label: "Logiciel" },
                        { value: "Collections spéciales", label: "Collections spéciales" },
                        { value: "Audio-visuel", label: "Audio-visuel" },
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Date début</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Date fin</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                
                {(searchTerm || selectedSupport !== "all" || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSupport("all");
                      setDateFrom("");
                      setDateTo("");
                      setCurrentPage(1);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>

              {(() => {
                // Filtrer les demandes
                let filteredRequests = requests.filter((request) => {
                  // Filtre de recherche
                  const searchMatch = !searchTerm || 
                    request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.author_name.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  // Filtre de support
                  const supportMatch = selectedSupport === "all" || request.support_type === selectedSupport;
                  
                  // Filtre de date
                  const requestDate = new Date(request.created_at);
                  const dateFromMatch = !dateFrom || requestDate >= new Date(dateFrom);
                  const dateToMatch = !dateTo || requestDate <= new Date(dateTo + "T23:59:59");
                  
                  return searchMatch && supportMatch && dateFromMatch && dateToMatch;
                });

                // Pagination
                const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

                return (
                  <>
                    {filteredRequests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune demande trouvée</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 text-sm text-muted-foreground">
                          {filteredRequests.length} demande(s) trouvée(s)
                        </div>
                        <div className="overflow-hidden">
                        <Table className="w-full table-fixed">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Titre</TableHead>
                              <TableHead className="w-[12%]">Support</TableHead>
                              <TableHead className="w-[15%]">Statut</TableHead>
                              <TableHead className="w-[13%]">Date</TableHead>
                              <TableHead className="w-[20%]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="truncate">
                                  <div className="truncate">
                                    <div className="font-medium truncate">{request.title}</div>
                                    {request.subtitle && (
                                      <div className="text-sm text-muted-foreground truncate">
                                        {request.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{request.support_type}</TableCell>
                                <TableCell>{getStatusBadge(request.status, request)}</TableCell>
                                <TableCell>
                                  {format(new Date(request.created_at), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setEditTitle(request.title || "");
                                        // Récupérer le nom de l'imprimeur depuis metadata.printer.name ou autres sources
                                        const printerName = request.metadata?.printer?.name || 
                                                           request.metadata?.printer_name || 
                                                           request.metadata?.customFields?.printer_name || "";
                                        setEditPrinter(printerName);
                                        setEditPageCount(request.metadata?.page_count?.toString() || request.metadata?.customFields?.page_count?.toString() || "");
                                      }}
                                    >
                                      <GitBranch className="h-4 w-4 mr-2" />
                                      Examiner
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setViewDetailsRequest(request);
                                        setIsViewDetailsOpen(true);
                                      }}
                                      title="Voir les détails"
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                    {activeTab === "validated" && request.validated_by_department && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => generateAccuseReception(request)}
                                        title="Télécharger l'accusé de réception"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Page {currentPage} sur {totalPages}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Précédent
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Suivant
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </TabsContent>

            {/* Onglet Statistiques */}
            <TabsContent value="statistics" className="mt-6">
              <div className="space-y-6">
                {/* Statistiques par statut */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Soumise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-800">
                        {allRequests.filter(r => 
                          ['brouillon', 'soumis'].includes(r.status) && !r.validated_by_committee
                        ).length}
                      </div>
                      <p className="text-xs text-blue-600">demandes en attente de traitement</p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-yellow-700">En cours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-800">
                        {allRequests.filter(r => r.status === 'en_cours').length}
                      </div>
                      <p className="text-xs text-yellow-600">demandes en cours de traitement</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-700">En attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-800">
                        {allRequests.filter(r => 
                          ['en_attente', 'en_attente_validation_b'].includes(r.status) || 
                          (r.validated_by_committee && !r.validated_by_department && !r.rejected_by)
                        ).length}
                      </div>
                      <p className="text-xs text-orange-600">en attente de validation ABN</p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-700">Rejetée</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-800">
                        {allRequests.filter(r => 
                          ['rejete', 'rejete_par_b', 'rejete_par_comite'].includes(r.status)
                        ).length}
                      </div>
                      <p className="text-xs text-red-600">demandes rejetées</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Attribuée</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-800">
                        {allRequests.filter(r => 
                          ['valide_par_b', 'attribue'].includes(r.status)
                        ).length}
                      </div>
                      <p className="text-xs text-green-600">numéros attribués</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistiques par type de support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Répartition par type de support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Livre', 'Périodique', 'Audio-visuel', 'Collections spéciales', 'Base de données', 'Logiciel'].map(supportType => {
                        const count = allRequests.filter(r => r.support_type === supportType).length;
                        if (count === 0) return null;
                        return (
                          <div key={supportType} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm font-medium">{supportType}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Total général */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Résumé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="text-lg font-medium">Total des demandes</span>
                      <span className="text-3xl font-bold">{allRequests.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Interface de validation (Sheet plein écran) */}
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent className="w-full sm:max-w-5xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              Validation de la Demande de Dépôt Légal
              <Badge variant="outline">{selectedRequest?.request_number}</Badge>
            </SheetTitle>
            <SheetDescription>
              Examiner et valider la demande de dépôt légal
            </SheetDescription>
          </SheetHeader>
          
          {selectedRequest && (
            <div className="space-y-6 mt-6">
              {/* Alerte de détection de doublons */}
              <DuplicateDetectionAlert 
                currentRequest={selectedRequest}
                duplicates={findDuplicatesByTitle(selectedRequest)}
              />
              
              {/* Étapes du workflow */}
              {renderWorkflowSteps(selectedRequest)}

              {/* Statut de confirmation Éditeur/Imprimeur */}
              {selectedRequest.confirmation_status && selectedRequest.confirmation_status !== 'not_required' && (
                <Card className={`${
                  selectedRequest.confirmation_status === 'confirmed' 
                    ? 'border-green-500/50 bg-green-50' 
                    : 'border-orange-500/50 bg-orange-50'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {selectedRequest.confirmation_status === 'confirmed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      Statut de confirmation réciproque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={selectedRequest.editor_confirmed ? "default" : "secondary"} 
                             className={selectedRequest.editor_confirmed ? "bg-green-600" : ""}>
                        {selectedRequest.editor_confirmed 
                          ? "✓ Demande confirmée par l'Éditeur" 
                          : "En attente de confirmation Éditeur"}
                      </Badge>
                      <Badge variant={selectedRequest.printer_confirmed ? "default" : "secondary"}
                             className={selectedRequest.printer_confirmed ? "bg-green-600" : ""}>
                        {selectedRequest.printer_confirmed 
                          ? "✓ Demande confirmée par l'Imprimeur" 
                          : "En attente de confirmation Imprimeur"}
                      </Badge>
                    </div>
                    {selectedRequest.confirmation_status === 'pending_confirmation' && (
                      <p className="text-sm text-orange-700 mt-2">
                        ⚠️ Le workflow de validation est bloqué jusqu'à ce que les deux parties aient confirmé la demande.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Section des champs modifiables */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Corrections administratives
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => saveFieldCorrections(selectedRequest.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enregistrer les corrections
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-title" className="text-sm font-medium">Titre *</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1"
                        placeholder="Titre de la publication"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pages" className="text-sm font-medium">Nombre de pages</Label>
                      <Input
                        id="edit-pages"
                        type="number"
                        value={editPageCount}
                        onChange={(e) => setEditPageCount(e.target.value)}
                        className="mt-1"
                        placeholder="Ex: 250"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="edit-printer" className="text-sm font-medium">Imprimeur</Label>
                      <Input
                        id="edit-printer"
                        value={editPrinter}
                        onChange={(e) => setEditPrinter(e.target.value)}
                        className="mt-1"
                        placeholder="Nom de l'imprimeur"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Toutes les informations de la demande via LegalDepositDetailsView */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Détails complets de la demande
                </h3>
                <LegalDepositDetailsView request={selectedRequest} />
              </div>

              {/* Historique des validations */}
              {(selectedRequest.validated_by_service ||
                selectedRequest.validated_by_department ||
                selectedRequest.validated_by_committee ||
                selectedRequest.rejected_by) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Historique des Validations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                  </CardContent>
                </Card>
              )}

              {/* Formulaire de validation */}
              {!selectedRequest.rejected_by && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Commentaires / Motif</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Ajouter des commentaires ou le motif de rejet..."
                      rows={4}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Actions de validation - Sticky footer */}
              <div className="sticky bottom-0 bg-background border-t pt-4 pb-2 -mx-6 px-6">
                {/* Vérifier si la confirmation réciproque est requise mais pas encore complète */}
                {(() => {
                  const confirmationRequired = selectedRequest.confirmation_status === 'pending_confirmation';
                  const isConfirmed = selectedRequest.confirmation_status === 'confirmed' || 
                                     selectedRequest.confirmation_status === 'not_required' ||
                                     !selectedRequest.confirmation_status;
                  
                  if (confirmationRequired && !isConfirmed) {
                    return (
                      <div className="flex items-center gap-3 justify-center py-2 text-orange-600 bg-orange-50 rounded-lg border border-orange-200 mb-3">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Le workflow de validation est bloqué - En attente de la confirmation de 
                          {!selectedRequest.editor_confirmed && !selectedRequest.printer_confirmed && " l'Éditeur et de l'Imprimeur"}
                          {!selectedRequest.editor_confirmed && selectedRequest.printer_confirmed && " l'Éditeur"}
                          {selectedRequest.editor_confirmed && !selectedRequest.printer_confirmed && " l'Imprimeur"}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {!selectedRequest.rejected_by && (
                  <div className="flex flex-wrap gap-3 justify-end">
                    {/* Bouton Arbitrage - disponible pour toutes les demandes non validées par le département */}
                    {!selectedRequest.validated_by_department && !selectedRequest.arbitration_requested && (
                      <Button
                        variant="outline"
                        onClick={() => setShowArbitrationModal(true)}
                        disabled={isLoading}
                        className="border-amber-500 text-amber-600 hover:bg-amber-50"
                      >
                        <Scale className="h-4 w-4 mr-2" />
                        Arbitrage
                      </Button>
                    )}

                    {/* Badge si arbitrage en cours */}
                    {selectedRequest.arbitration_requested && selectedRequest.arbitration_status === 'pending' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 flex items-center">
                        <Scale className="h-3 w-3 mr-1" />
                        Arbitrage en cours
                      </Badge>
                    )}

                    {/* Boutons pour les demandes non validées par le comité ET non approuvées par arbitrage */}
                    {!selectedRequest.validated_by_committee && selectedRequest.arbitration_status !== 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleSetPending(selectedRequest.id)}
                          disabled={isLoading}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mettre en attente
                        </Button>
                        <Button
                          onClick={() => setShowCommitteeConfirmModal(true)}
                          disabled={isLoading || selectedRequest.confirmation_status === 'pending_confirmation'}
                          title={selectedRequest.confirmation_status === 'pending_confirmation' 
                            ? "En attente de confirmation réciproque" 
                            : "Approuver par le Comité"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver (Comité)
                        </Button>
                      </>
                    )}

                    {/* Boutons ABN: pour les demandes validées par comité OU approuvées par arbitrage (le validateur a joué le rôle du comité) */}
                    {(selectedRequest.validated_by_committee || selectedRequest.arbitration_status === 'approved') && !selectedRequest.validated_by_department && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowPendingModal(true)}
                          disabled={isLoading}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mettre en attente
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => openRejectionModal(selectedRequest.id, "department")}
                          disabled={isLoading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter (ABN)
                        </Button>
                        <Button
                          onClick={() => handleValidation(selectedRequest.id, "department", "approved")}
                          disabled={isLoading || selectedRequest.confirmation_status === 'pending_confirmation'}
                          title={selectedRequest.confirmation_status === 'pending_confirmation' 
                            ? "En attente de confirmation réciproque" 
                            : "Approuver par le Département ABN"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver (ABN)
                        </Button>
                      </>
                    )}

                    {/* Bouton de génération de l'accusé de réception - uniquement après validation ABN */}
                    {selectedRequest.validated_by_department && (
                      <Button
                        variant="outline"
                        onClick={() => generateAccuseReception(selectedRequest)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Accusé de Réception
                      </Button>
                    )}
                  </div>
                )}

                {selectedRequest.rejected_by && (
                  <div className="flex gap-3 justify-end">
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* View-Only Details Sheet */}
      <Sheet open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Détails de la demande - {viewDetailsRequest?.request_number}
            </SheetTitle>
            <SheetDescription>
              Consultation en lecture seule des informations de la demande
            </SheetDescription>
          </SheetHeader>
          
          {viewDetailsRequest && (
            <>
              <LegalDepositDetailsView request={viewDetailsRequest} />
              
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modale "En attente de traitement" */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mettre en attente</DialogTitle>
            <DialogDescription>
              Voulez-vous mettre cette demande en attente ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              La demande sera mise en attente avec le statut "En cours" et pourra être traitée ultérieurement.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPendingModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={async () => {
                if (selectedRequest) {
                  await handleSetPending(selectedRequest.id);
                }
                setShowPendingModal(false);
              }}
              disabled={isLoading}
            >
              <Clock className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de rejet avec motif obligatoire */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Rejet de la demande
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet de cette demande
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Motif du rejet <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Dossier incomplet, ISBN manquant, documents non conformes..."
                className="min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Ce motif sera communiqué au demandeur et enregistré dans l'historique.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionModal(false);
                setPendingRejection(null);
                setRejectionReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectionSubmit}
              disabled={isLoading || !rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirmer le rejet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de confirmation d'approbation Comité */}
      <Dialog open={showCommitteeConfirmModal} onOpenChange={setShowCommitteeConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              Confirmation d'approbation
            </DialogTitle>
            <DialogDescription>
              Confirmer l'approbation par le Comité de Validation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Demande concernée :</p>
              <p className="text-sm text-muted-foreground">
                N° {selectedRequest?.request_number}
              </p>
              <p className="text-sm font-medium mt-2">{selectedRequest?.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir approuver cette demande ? Elle sera transmise au Département ABN pour validation finale.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCommitteeConfirmModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setShowCommitteeConfirmModal(false);
                if (selectedRequest) {
                  handleValidation(selectedRequest.id, "committee", "approved");
                }
              }}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'approbation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale d'arbitrage */}
      <Dialog open={showArbitrationModal} onOpenChange={setShowArbitrationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Scale className="h-5 w-5" />
              Demande d'Arbitrage
            </DialogTitle>
            <DialogDescription>
              Soumettre cette demande à un Validateur pour arbitrage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm font-medium mb-2 text-amber-800">Demande concernée :</p>
              <p className="text-sm text-amber-700">
                N° {selectedRequest?.request_number}
              </p>
              <p className="text-sm font-medium mt-1 text-amber-900">{selectedRequest?.title}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arbitration-reason">
                Motif de l'arbitrage <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="arbitration-reason"
                value={arbitrationReason}
                onChange={(e) => setArbitrationReason(e.target.value)}
                placeholder="Décrivez la raison pour laquelle cette demande nécessite un arbitrage..."
                className="min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Cette demande sera transmise à un Validateur qui pourra l'approuver ou la rejeter.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowArbitrationModal(false);
                setArbitrationReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleArbitrationSubmit}
              disabled={isLoading || !arbitrationReason.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Scale className="h-4 w-4 mr-2" />
              Envoyer pour arbitrage
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}