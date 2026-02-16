import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, FileText, DollarSign, Eye, Calculator, CreditCard, Building, MapPin, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr, arDZ } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReproductionDetailsSheet } from "./ReproductionDetailsSheet";
import { WorkflowSteps } from "./WorkflowSteps";
import { ReproductionPaymentSettingsCard } from "./ReproductionPaymentSettingsCard";

interface ReproductionRequest {
  id: string;
  request_number: string;
  user_id: string;
  status: string;
  reproduction_modality: string;
  submitted_at: string;
  user_notes: string;
  service_validation_notes: string | null;
  manager_validation_notes: string | null;
  rejection_reason: string | null;
  payment_amount: number | null;
  paid_at?: string | null;
}

export function ReproductionBackoffice() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [requests, setRequests] = useState<ReproductionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReproductionRequest | null>(null);
  const [validationNotes, setValidationNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve");
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("reproduction_requests")
        .select("*")
        .in("status", ["soumise", "en_validation_service", "en_validation_responsable", "en_attente_paiement", "paiement_recu", "en_traitement"] as any[])
        .order("submitted_at", { ascending: true });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(language === "ar" ? "خطأ في تحميل الطلبات" : "Erreur lors du chargement");
    }
  };

  const handleServiceValidation = async (requestId: string, approve: boolean) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reproduction_requests")
        .update({
          status: approve ? "en_validation_responsable" : "refusee",
          service_validator_id: user?.id,
          service_validated_at: new Date().toISOString(),
          service_validation_notes: validationNotes,
          rejection_reason: approve ? null : validationNotes,
          rejected_by: approve ? null : user?.id,
          rejected_at: approve ? null : new Date().toISOString(),
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      // Create notification
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: selectedRequest?.user_id,
        notification_type: approve ? "validation_service" : "rejection",
        title: approve
          ? language === "ar" ? "تم التحقق من طلبك" : "Votre demande a été validée"
          : language === "ar" ? "تم رفض طلبك" : "Votre demande a été refusée",
        message: validationNotes,
      } as any);

      toast.success(
        approve
          ? language === "ar" ? "تم الموافقة على الطلب" : "Demande approuvée"
          : language === "ar" ? "تم رفض الطلب" : "Demande refusée"
      );

      setShowDialog(false);
      setValidationNotes("");
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error(language === "ar" ? "خطأ في معالجة الطلب" : "Erreur lors du traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManagerApproval = async (requestId: string, approve: boolean) => {
    setIsProcessing(true);
    try {
      // Récupérer les détails de la demande pour le paiement
      const { data: requestDetails, error: fetchError } = await supabase
        .from("reproduction_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;
      
      // Tenter de récupérer l'email depuis la demande (sinon, l'Edge Function fera le lookup via auth.users)
      const userEmail =
        (requestDetails as any)?.contact_email ||
        (requestDetails as any)?.metadata?.email ||
        (requestDetails as any)?.metadata?.user_email;

      const { error } = await supabase
        .from("reproduction_requests")
        .update({
          status: approve ? "en_attente_paiement" : "refusee",
          manager_validator_id: user?.id,
          manager_validated_at: new Date().toISOString(),
          manager_validation_notes: validationNotes,
          rejection_reason: approve ? null : validationNotes,
          rejected_by: approve ? null : user?.id,
          rejected_at: approve ? null : new Date().toISOString(),
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      let paymentUrl: string | null = null;

      // Si approuvé, générer le lien de paiement et envoyer l'email avec le lien
      if (approve && requestDetails?.payment_amount && requestDetails?.user_id) {
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
            'generate-reproduction-payment-link',
            {
              body: {
                requestId: requestId,
                amount: requestDetails.payment_amount,
                requestNumber: requestDetails.request_number,
                userEmail: userEmail,
                userId: requestDetails.user_id,
                description: `Reproduction de documents - ${requestDetails.request_number}`,
              },
            }
          );

          if (paymentError) {
            console.error("Erreur génération lien paiement:", paymentError);
            toast.warning(
              language === "ar" 
                ? "تمت الموافقة ولكن فشل إنشاء رابط الدفع" 
                : "Approuvé mais échec de génération du lien de paiement"
            );
          } else {
            paymentUrl = paymentData?.paymentUrl;
            console.log("Lien de paiement généré:", paymentUrl);
          }
        } catch (paymentLinkError) {
          console.error("Erreur lors de la génération du lien de paiement:", paymentLinkError);
        }
      }

      // Envoyer la notification par email avec le lien de paiement
      if (approve && requestDetails?.user_id) {
        try {
          await supabase.functions.invoke('send-reproduction-notification', {
            body: {
              requestId: requestId,
              recipientEmail: userEmail,
              recipientId: requestDetails.user_id,
              notificationType: 'payment_pending',
              requestNumber: requestDetails.request_number,
              documentTitle: (requestDetails as any).metadata?.documentTitle || 'Document demandé',
              estimatedCost: requestDetails.payment_amount,
              paymentLink: paymentUrl,
              paymentMethod: 'all', // Afficher toutes les options de paiement
            },
          });
          console.log("Email de notification avec lien de paiement envoyé");
        } catch (emailError) {
          console.error("Erreur envoi email:", emailError);
        }
      } else if (approve && !requestDetails?.user_id) {
        toast.error(language === "ar" ? "معرف المستخدم غير متوفر" : "Utilisateur de la demande introuvable");
      }

      // Create notification in database
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: selectedRequest?.user_id,
        notification_type: approve ? "approval" : "rejection",
        title: approve
          ? language === "ar" ? "تمت الموافقة على طلبك" : "Votre demande est approuvée"
          : language === "ar" ? "تم رفض طلبك" : "Votre demande est refusée",
        message: validationNotes,
      } as any);

      // Create in-app notification with payment link
      if (approve && selectedRequest?.user_id) {
        await supabase.from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: 'payment',
          title: language === "ar" ? "دفع معلق" : "Paiement en attente",
          message: language === "ar" 
            ? "طلب النسخ الخاص بك قد تمت الموافقة عليه. يرجى المتابعة بالدفع."
            : "Votre demande de reproduction a été approuvée. Veuillez procéder au paiement.",
          is_read: false,
          link: '/my-space?tab=payments',
          related_url: '/my-space?tab=payments',
          priority: 3,
          category: 'payment',
          module: 'reproduction',
        });
      }

      toast.success(
        approve
          ? language === "ar" ? "تمت الموافقة النهائية مع إرسال رابط الدفع" : "Approbation effectuée - Lien de paiement envoyé"
          : language === "ar" ? "تم الرفض" : "Refus effectué"
      );

      setShowDialog(false);
      setValidationNotes("");
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error(language === "ar" ? "خطأ في المعالجة" : "Erreur de traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmer la réception du paiement (virement ou sur place)
  const handlePaymentConfirmation = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reproduction_requests")
        .update({
          status: "paiement_recu",
          paid_at: new Date().toISOString(),
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      // Create notification
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: selectedRequest?.user_id,
        notification_type: "payment_received",
        title: language === "ar" ? "تم استلام الدفع" : "Paiement reçu",
        message: language === "ar" ? "تم تأكيد استلام الدفع الخاص بك" : "Votre paiement a été confirmé",
      } as any);

      // Create in-app notification with payment link
      if (selectedRequest?.user_id) {
        await supabase.from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: 'payment',
          title: language === "ar" ? "تم استلام الدفع" : "Paiement confirmé",
          message: language === "ar" 
            ? "تم تأكيد استلام الدفع الخاص بك. يمكنك مراجعة التفاصيل في مساحتك الشخصية."
            : "Votre paiement a été confirmé. Consultez les détails dans votre espace personnel.",
          is_read: false,
          link: '/my-space?tab=payments',
          related_url: '/my-space?tab=payments',
          priority: 3,
          category: 'payment',
          module: 'reproduction',
        });
      }

      toast.success(language === "ar" ? "تم تأكيد الدفع" : "Paiement confirmé");

      setShowDialog(false);
      setValidationNotes("");
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast.error(language === "ar" ? "خطأ في تأكيد الدفع" : "Erreur lors de la confirmation du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountingApproval = async (requestId: string, approve: boolean) => {
    setIsProcessing(true);
    try {
      const requestDetails = selectedRequest;
      
      const { error } = await supabase
        .from("reproduction_requests")
        .update({
          status: approve ? "en_traitement" : "refusee",
          accounting_validator_id: user?.id,
          accounting_validated_at: new Date().toISOString(),
          accounting_validation_notes: validationNotes,
          rejection_reason: approve ? null : validationNotes,
          rejected_by: approve ? null : user?.id,
          rejected_at: approve ? null : new Date().toISOString(),
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      // Envoyer l'email de notification comptabilité
      if (approve && requestDetails?.user_id) {
        try {
          // Résoudre l'email utilisateur
          const userEmail =
            (requestDetails as any)?.contact_email ||
            (requestDetails as any)?.metadata?.email ||
            (requestDetails as any)?.metadata?.user_email;

          await supabase.functions.invoke('send-reproduction-notification', {
            body: {
              requestId: requestId,
              recipientEmail: userEmail,
              recipientId: requestDetails.user_id,
              notificationType: 'accounting_validated',
              requestNumber: requestDetails.request_number,
              documentTitle: (requestDetails as any).metadata?.documentTitle || 'Document demandé',
            },
          });
          console.log("Email notification comptabilité envoyé");
        } catch (emailError) {
          console.error("Erreur envoi email comptabilité:", emailError);
        }
      }

      // Create notification in database
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: selectedRequest?.user_id,
        notification_type: approve ? "comptabilite_approved" : "rejection",
        title: approve
          ? language === "ar" ? "تم التحقق من الدفع - قيد الاستنساخ" : "Paiement validé - Reproduction en cours"
          : language === "ar" ? "تم رفض طلبك" : "Votre demande a été refusée",
        message: validationNotes,
      } as any);

      toast.success(
        approve
          ? language === "ar" ? "تم التحقق من الدفع - الطلب قيد الاستنساخ" : "Paiement validé - En cours de reproduction"
          : language === "ar" ? "تم الرفض" : "Demande refusée"
      );

      setShowDialog(false);
      setValidationNotes("");
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error(language === "ar" ? "خطأ في المعالجة" : "Erreur de traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReproductionComplete = async (requestId: string) => {
    setIsProcessing(true);
    try {
      // Récupérer les détails de la demande pour l'email
      const { data: requestDetails, error: fetchError } = await supabase
        .from("reproduction_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      const userEmail =
        (requestDetails as any)?.contact_email ||
        (requestDetails as any)?.metadata?.email ||
        (requestDetails as any)?.metadata?.user_email;

      const { error } = await supabase
        .from("reproduction_requests")
        .update({
          status: "terminee",
          reproduction_completed_at: new Date().toISOString(),
          reproduction_completed_by: user?.id,
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      // Envoyer l'email "Votre reproduction est prête" avec la modalité
      if (requestDetails?.user_id) {
        try {
          await supabase.functions.invoke('send-reproduction-notification', {
            body: {
              requestId: requestId,
              recipientEmail: userEmail,
              recipientId: requestDetails.user_id,
              notificationType: 'ready_for_pickup',
              requestNumber: requestDetails.request_number,
              documentTitle: (requestDetails as any).metadata?.documentTitle || 'Document demandé',
              reproductionModality: requestDetails.reproduction_modality,
            },
          });
          console.log("Email 'reproduction prête' envoyé");
        } catch (emailError) {
          console.error("Erreur envoi email:", emailError);
        }
      }

      // Create notification in database
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: requestDetails?.user_id,
        notification_type: "ready_for_pickup",
        title: language === "ar" ? "نسختك جاهزة للاستلام" : "Votre reproduction est prête",
        message: language === "ar" 
          ? "يمكنك الآن استلام المستندات المستنسخة" 
          : "Vous pouvez venir récupérer vos documents reproduits",
      } as any);

      toast.success(
        language === "ar" 
          ? "تم الانتهاء من الاستنساخ - تم إرسال الإشعار" 
          : "Reproduction terminée - Notification envoyée"
      );

      setShowDialog(false);
      setValidationNotes("");
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error completing reproduction:", error);
      toast.error(language === "ar" ? "خطأ في إتمام الاستنساخ" : "Erreur lors de la finalisation");
    } finally {
      setIsProcessing(false);
    }
  };

  const openValidationDialog = (request: ReproductionRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setDialogAction(action);
    setShowDialog(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "PPP", { locale: language === "ar" ? arDZ : fr });
  };

  const pendingService = requests.filter(r => r.status === "soumise" || r.status === "en_validation_service");
  const pendingManager = requests.filter(r => r.status === "en_validation_responsable");
  const pendingPayment = requests.filter(r => r.status === "en_attente_paiement");
  const pendingAccounting = requests.filter(r => r.status === "paiement_recu");
  const pendingReproduction = requests.filter(r => r.status === "en_traitement");

  // Helper pour obtenir le mode de paiement
  const getPaymentMethod = (request: ReproductionRequest) => {
    const metadata = (request as any).metadata;
    return metadata?.paymentMethod || metadata?.reception_mode || "online";
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "virement":
      case "bank_transfer":
        return { icon: Building, label: language === "ar" ? "تحويل بنكي" : "Virement", color: "bg-blue-100 text-blue-800" };
      case "sur_place":
      case "on_site":
        return { icon: MapPin, label: language === "ar" ? "في الموقع" : "Sur place", color: "bg-amber-100 text-amber-800" };
      default:
        return { icon: CreditCard, label: language === "ar" ? "عبر الإنترنت" : "En ligne", color: "bg-green-100 text-green-800" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "إدارة طلبات الاستنساخ" : "Gestion des demandes de reproduction"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar" ? "التحقق والموافقة على الطلبات" : "Validation et approbation des demandes"}
        </p>
      </div>

      <div className="mb-6">
        <ReproductionPaymentSettingsCard />
      </div>

      <Tabs defaultValue="service" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="service" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "ar" ? "تحقق الخدمة" : "Validation Service"}</span>
            <span className="sm:hidden">{language === "ar" ? "الخدمة" : "Service"}</span>
            {pendingService.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingService.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manager" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "ar" ? "موافقة المسؤول" : "Approbation Responsable"}</span>
            <span className="sm:hidden">{language === "ar" ? "المسؤول" : "Responsable"}</span>
            {pendingManager.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingManager.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "ar" ? "تأكيد الدفع" : "Confirmation Paiement"}</span>
            <span className="sm:hidden">{language === "ar" ? "الدفع" : "Paiement"}</span>
            {pendingPayment.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingPayment.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accounting" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "ar" ? "التحقق المحاسبي" : "Validation Comptabilité"}</span>
            <span className="sm:hidden">{language === "ar" ? "المحاسبة" : "Comptabilité"}</span>
            {pendingAccounting.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingAccounting.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reproduction" className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "ar" ? "الاستنساخ" : "Reproduction"}</span>
            <span className="sm:hidden">{language === "ar" ? "نسخ" : "Repro"}</span>
            {pendingReproduction.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingReproduction.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="service" className="space-y-4 mt-6">
          {pendingService.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد طلبات قيد الانتظار" : "Aucune demande en attente"}
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingService.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.request_number}</CardTitle>
                      <CardDescription>
                        {language === "ar" ? "مقدمة في" : "Soumise le"} {formatDate(request.submitted_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {language === "ar" ? "جديدة" : "Nouvelle"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <WorkflowSteps currentStatus={request.status} className="mb-6" />
                  {request.user_notes && (
                    <div>
                      <h4 className="font-medium mb-2">
                        {language === "ar" ? "ملاحظات المستخدم:" : "Notes du demandeur:"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{request.user_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setDetailsSheetOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === "ar" ? "عرض التفاصيل" : "Voir détails"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => openValidationDialog(request, "approve")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "الموافقة" : "Valider"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openValidationDialog(request, "reject")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "رفض" : "Refuser"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="manager" className="space-y-4 mt-6">
          {pendingManager.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد طلبات تنتظر الموافقة" : "Aucune demande en attente d'approbation"}
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingManager.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.request_number}</CardTitle>
                      <CardDescription>
                        {language === "ar" ? "تم التحقق من قبل الخدمة" : "Validée par le service"}
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      {language === "ar" ? "تنتظر الموافقة" : "En attente"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <WorkflowSteps currentStatus={request.status} className="mb-6" />
                  {request.service_validation_notes && (
                    <div>
                      <h4 className="font-medium mb-2">
                        {language === "ar" ? "ملاحظات الخدمة:" : "Notes du service:"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{request.service_validation_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setDetailsSheetOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === "ar" ? "عرض التفاصيل" : "Voir détails"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => openValidationDialog(request, "approve")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "الموافقة النهائية" : "Approuver"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openValidationDialog(request, "reject")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "رفض" : "Refuser"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Onglet Confirmation Paiement - pour virement et sur place */}
        <TabsContent value="payment" className="space-y-4 mt-6">
          {pendingPayment.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد مدفوعات في انتظار التأكيد" : "Aucun paiement en attente de confirmation"}
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingPayment.map((request) => {
              const paymentMethod = getPaymentMethod(request);
              const methodBadge = getPaymentMethodBadge(paymentMethod);
              const MethodIcon = methodBadge.icon;
              
              return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{request.request_number}</CardTitle>
                        <CardDescription>
                          {language === "ar" ? "في انتظار الدفع منذ" : "En attente de paiement depuis le"} {formatDate(request.submitted_at)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={methodBadge.color}>
                          <MethodIcon className="h-3 w-3 mr-1" />
                          {methodBadge.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <WorkflowSteps currentStatus={request.status} className="mb-6" />
                    {request.payment_amount && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">
                          {language === "ar" ? "المبلغ المستحق:" : "Montant dû:"}
                        </h4>
                        <p className="text-lg font-bold text-primary">
                          {request.payment_amount.toFixed(2)} MAD
                        </p>
                      </div>
                    )}
                    {request.manager_validation_notes && (
                      <div>
                        <h4 className="font-medium mb-2">
                          {language === "ar" ? "ملاحظات المسؤول:" : "Notes du responsable:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">{request.manager_validation_notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequestId(request.id);
                          setDetailsSheetOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {language === "ar" ? "عرض التفاصيل" : "Voir détails"}
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          setSelectedRequest(request);
                          handlePaymentConfirmation(request.id);
                        }}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {language === "ar" ? "تأكيد استلام الدفع" : "Confirmer réception du paiement"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4 mt-6">
          {pendingAccounting.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد مدفوعات تنتظر التحقق" : "Aucun paiement en attente de validation"}
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAccounting.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.request_number}</CardTitle>
                      <CardDescription>
                        {language === "ar" ? "تم الدفع في" : "Payée le"} {formatDate(request.paid_at || request.submitted_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {language === "ar" ? "مدفوعة" : "Payée"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <WorkflowSteps currentStatus={request.status} className="mb-6" />
                  {request.payment_amount && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">
                        {language === "ar" ? "معلومات الدفع:" : "Informations de paiement:"}
                      </h4>
                      <p className="text-lg font-bold text-primary">
                        {request.payment_amount.toFixed(2)} MAD
                      </p>
                    </div>
                  )}
                  {request.manager_validation_notes && (
                    <div>
                      <h4 className="font-medium mb-2">
                        {language === "ar" ? "ملاحظات المسؤول:" : "Notes du responsable:"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{request.manager_validation_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setDetailsSheetOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === "ar" ? "عرض التفاصيل" : "Voir détails"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => openValidationDialog(request, "approve")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "تأكيد الدفع" : "Confirmer le paiement"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openValidationDialog(request, "reject")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "رفض" : "Rejeter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Onglet Reproduction - pour la réalisation des reproductions */}
        <TabsContent value="reproduction" className="space-y-4 mt-6">
          {pendingReproduction.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Printer className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد عمليات استنساخ في الانتظار" : "Aucune reproduction en attente"}
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReproduction.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.request_number}</CardTitle>
                      <CardDescription>
                        {language === "ar" ? "في انتظار الاستنساخ" : "En attente de reproduction"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/50 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400">
                      <Printer className="h-3 w-3 mr-1" />
                      {language === "ar" ? "قيد الاستنساخ" : "À reproduire"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <WorkflowSteps currentStatus={request.status} className="mb-6" />
                  {request.payment_amount && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">
                        {language === "ar" ? "المبلغ المدفوع:" : "Montant payé:"}
                      </h4>
                      <p className="text-lg font-bold text-green-600">
                        {request.payment_amount.toFixed(2)} MAD ✓
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setDetailsSheetOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === "ar" ? "عرض التفاصيل" : "Voir détails"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedRequest(request);
                        handleReproductionComplete(request.id);
                      }}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === "ar" ? "الاستنساخ جاهز" : "Reproduction terminée"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve"
                ? language === "ar" ? "تأكيد الموافقة" : "Confirmer l'approbation"
                : language === "ar" ? "تأكيد الرفض" : "Confirmer le refus"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar"
                ? "أضف ملاحظاتك حول هذا القرار"
                : "Ajoutez vos remarques concernant cette décision"}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={validationNotes}
            onChange={(e) => setValidationNotes(e.target.value)}
            placeholder={language === "ar" ? "ملاحظاتك..." : "Vos remarques..."}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {language === "ar" ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              onClick={() => {
                if (!selectedRequest) return;
                if (selectedRequest.status === "soumise" || selectedRequest.status === "en_validation_service") {
                  handleServiceValidation(selectedRequest.id, dialogAction === "approve");
                } else if (selectedRequest.status === "en_validation_responsable") {
                  handleManagerApproval(selectedRequest.id, dialogAction === "approve");
                } else if (selectedRequest.status === "paiement_recu") {
                  handleAccountingApproval(selectedRequest.id, dialogAction === "approve");
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing
                ? language === "ar" ? "جاري المعالجة..." : "Traitement..."
                : language === "ar" ? "تأكيد" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReproductionDetailsSheet
        requestId={selectedRequestId}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
      />
    </div>
  );
}
