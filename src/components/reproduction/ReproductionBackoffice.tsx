import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, FileText, DollarSign, Eye } from "lucide-react";
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
}

export function ReproductionBackoffice() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReproductionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReproductionRequest | null>(null);
  const [validationNotes, setValidationNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("reproduction_requests")
        .select("*")
        .in("status", ["soumise", "en_validation_service", "en_validation_responsable"])
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

      // Create notification
      await supabase.from("reproduction_notifications").insert({
        request_id: requestId,
        recipient_id: selectedRequest?.user_id,
        notification_type: approve ? "approval" : "rejection",
        title: approve
          ? language === "ar" ? "تمت الموافقة على طلبك" : "Votre demande est approuvée"
          : language === "ar" ? "تم رفض طلبك" : "Votre demande est refusée",
        message: validationNotes,
      } as any);

      toast.success(
        approve
          ? language === "ar" ? "تمت الموافقة النهائية" : "Approbation finale effectuée"
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

      <Tabs defaultValue="service" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="service" className="gap-2">
            <Clock className="h-4 w-4" />
            {language === "ar" ? "تحقق الخدمة" : "Validation Service"}
            {pendingService.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingService.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manager" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {language === "ar" ? "موافقة المسؤول" : "Approbation Responsable"}
            {pendingManager.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingManager.length}</Badge>
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
                      onClick={() => navigate(`/reproduction/details/${request.id}`)}
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
                } else {
                  handleManagerApproval(selectedRequest.id, dialogAction === "approve");
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
    </div>
  );
}
