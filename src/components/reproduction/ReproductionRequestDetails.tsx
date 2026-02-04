import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  CreditCard,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileImage,
  GitBranch
} from "lucide-react";
import { format } from "date-fns";
import { fr, arDZ } from "date-fns/locale";
import { WorkflowSteps, getStepRoleInfo } from "./WorkflowSteps";

interface ReproductionItem {
  id: string;
  title: string;
  reference: string;
  formats: string[];
  pages_specification: string;
  color_mode: string;
  resolution_dpi: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  output_files: any;
}

interface ReproductionRequest {
  id: string;
  request_number: string;
  user_id: string;
  status: string;
  reproduction_modality: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  user_notes: string;
  internal_notes: string;
  service_validation_notes: string;
  manager_validation_notes: string;
  rejection_reason: string;
  payment_method: string;
  payment_amount: number;
  payment_status: string;
  paid_at: string;
  processing_started_at: string;
  processing_completed_at: string;
  available_at: string;
  expires_at: string;
  download_count: number;
  supporting_documents: any;
  metadata: any;
}

export function ReproductionRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [request, setRequest] = useState<ReproductionRequest | null>(null);
  const [items, setItems] = useState<ReproductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      // Fetch request
      const { data: requestData, error: requestError } = await supabase
        .from("reproduction_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (requestError) throw requestError;

      // Check access rights
      if (requestData.user_id !== user?.id && profile?.role !== 'admin' && profile?.role !== 'librarian') {
        toast.error(language === "ar" ? "ليس لديك صلاحية للوصول" : "Accès non autorisé");
        navigate("/reproduction");
        return;
      }

      setRequest(requestData);

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from("reproduction_items")
        .select("*")
        .eq("request_id", id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error(language === "ar" ? "خطأ في تحميل التفاصيل" : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "PPP à HH:mm", { locale: language === "ar" ? arDZ : fr });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; variant: any; label: string; labelAr: string }> = {
      brouillon: { icon: FileText, variant: "secondary", label: "Brouillon", labelAr: "مسودة" },
      soumise: { icon: Clock, variant: "default", label: "Soumise", labelAr: "مقدمة" },
      en_validation_service: { icon: Clock, variant: "default", label: "En validation service", labelAr: "قيد التحقق" },
      en_validation_responsable: { icon: Clock, variant: "default", label: "En validation responsable", labelAr: "في انتظار موافقة المسؤول" },
      en_attente_paiement: { icon: DollarSign, variant: "warning", label: "En attente paiement", labelAr: "في انتظار الدفع" },
      en_traitement: { icon: Package, variant: "default", label: "En traitement", labelAr: "قيد المعالجة" },
      terminee: { icon: CheckCircle2, variant: "success", label: "Terminée", labelAr: "مكتملة" },
      refusee: { icon: XCircle, variant: "destructive", label: "Refusée", labelAr: "مرفوضة" },
    };

    const config = statusConfig[status] || statusConfig.soumise;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-2 text-base px-4 py-2">
        <Icon className="h-5 w-5" />
        {language === "ar" ? config.labelAr : config.label}
      </Badge>
    );
  };

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, { fr: string; ar: string }> = {
      papier: { fr: "Reproduction papier", ar: "استنساخ ورقي" },
      numerique_mail: { fr: "Numérique par email", ar: "رقمي عبر البريد الإلكتروني" },
      numerique_espace: { fr: "Numérique - Espace personnel", ar: "رقمي - المساحة الشخصية" },
      support_physique: { fr: "Support physique (CD/DVD/USB)", ar: "دعم مادي" },
    };
    return language === "ar" ? labels[modality]?.ar : labels[modality]?.fr;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, { fr: string; ar: string }> = {
      carte_bancaire: { fr: "Carte bancaire", ar: "بطاقة بنكية" },
      virement: { fr: "Virement", ar: "تحويل بنكي" },
      especes: { fr: "Espèces", ar: "نقداً" },
      cheque: { fr: "Chèque", ar: "شيك" },
    };
    return language === "ar" ? labels[method]?.ar : labels[method]?.fr;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">
          {language === "ar" ? "الطلب غير موجود" : "Demande introuvable"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "ar" ? "رجوع" : "Retour"}
        </Button>
        {getStatusBadge(request.status)}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {language === "ar" ? "طلب استنساخ رقم" : "Demande de reproduction n°"} {request.request_number}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar" ? "تم الإنشاء في" : "Créée le"} {formatDate(request.created_at)}
        </p>
      </div>

      {/* Workflow Steps Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {language === "ar" ? "مراحل المعالجة" : "Progression du traitement"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkflowSteps currentStatus={request.status} />
          {request.status !== 'terminee' && request.status !== 'refusee' && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "الخطوة الحالية في انتظار:" : "Étape actuelle en attente de:"}{" "}
                <span className="font-semibold text-foreground">
                  {getStepRoleInfo(request.status, language).canValidate}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "معلومات عامة" : "Informations générales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "ar" ? "الطريقة" : "Modalité de reproduction"}
              </label>
              <p className="text-base font-semibold">{getModalityLabel(request.reproduction_modality)}</p>
            </div>

            {request.submitted_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "تاريخ التقديم" : "Date de soumission"}
                </label>
                <p className="text-base">{formatDate(request.submitted_at)}</p>
              </div>
            )}

            {request.user_notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "ملاحظات المستخدم" : "Notes de l'utilisateur"}
                </label>
                <p className="text-base whitespace-pre-wrap">{request.user_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statut et validations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {language === "ar" ? "الحالة والتحققات" : "Statut et validations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.service_validation_notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "ملاحظات الخدمة" : "Notes de validation service"}
                </label>
                <p className="text-base whitespace-pre-wrap">{request.service_validation_notes}</p>
              </div>
            )}

            {request.manager_validation_notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "ملاحظات المسؤول" : "Notes du responsable"}
                </label>
                <p className="text-base whitespace-pre-wrap">{request.manager_validation_notes}</p>
              </div>
            )}

            {request.rejection_reason && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <label className="text-sm font-medium text-destructive">
                  {language === "ar" ? "سبب الرفض" : "Raison du refus"}
                </label>
                <p className="text-base mt-1">{request.rejection_reason}</p>
              </div>
            )}

            {request.internal_notes && (profile?.role === 'admin' || profile?.role === 'librarian') && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <label className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  {language === "ar" ? "ملاحظات داخلية" : "Notes internes"}
                </label>
                <p className="text-base mt-1">{request.internal_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiement */}
        {request.payment_amount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {language === "ar" ? "معلومات الدفع" : "Informations de paiement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "المبلغ" : "Montant"}
                </label>
                <p className="text-2xl font-bold">{request.payment_amount} DH</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "حالة الدفع" : "Statut du paiement"}
                </label>
                <p className="text-base">
                  <Badge variant={request.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {request.payment_status === 'paid' 
                      ? (language === "ar" ? "مدفوع" : "Payé")
                      : (language === "ar" ? "في الانتظار" : "En attente")}
                  </Badge>
                </p>
              </div>

              {request.payment_method && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "ar" ? "طريقة الدفع" : "Méthode de paiement"}
                  </label>
                  <p className="text-base">{getPaymentMethodLabel(request.payment_method)}</p>
                </div>
              )}

              {request.paid_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "ar" ? "تاريخ الدفع" : "Date de paiement"}
                  </label>
                  <p className="text-base">{formatDate(request.paid_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Traitement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {language === "ar" ? "معلومات المعالجة" : "Informations de traitement"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.processing_started_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "بدأت المعالجة" : "Traitement débuté"}
                </label>
                <p className="text-base">{formatDate(request.processing_started_at)}</p>
              </div>
            )}

            {request.processing_completed_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "اكتملت المعالجة" : "Traitement terminé"}
                </label>
                <p className="text-base">{formatDate(request.processing_completed_at)}</p>
              </div>
            )}

            {request.available_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "متاح منذ" : "Disponible depuis"}
                </label>
                <p className="text-base">{formatDate(request.available_at)}</p>
              </div>
            )}

            {request.expires_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "تنتهي الصلاحية في" : "Expire le"}
                </label>
                <p className="text-base">{formatDate(request.expires_at)}</p>
              </div>
            )}

            {request.download_count > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "عدد التحميلات" : "Nombre de téléchargements"}
                </label>
                <p className="text-base font-semibold">{request.download_count}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items à reproduire */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              {language === "ar" ? "العناصر المطلوب استنساخها" : "Éléments à reproduire"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      {item.reference && (
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "المرجع:" : "Réf:"} {item.reference}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {language === "ar" ? "عنصر" : "Item"} #{index + 1}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التنسيقات:" : "Formats:"}
                      </span>
                      <p className="font-medium">{item.formats.join(", ").toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الصفحات:" : "Pages:"}
                      </span>
                      <p className="font-medium">{item.pages_specification}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الوضع:" : "Mode:"}
                      </span>
                      <p className="font-medium capitalize">{item.color_mode}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الدقة:" : "Résolution:"}
                      </span>
                      <p className="font-medium">{item.resolution_dpi} DPI</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الكمية:" : "Quantité:"}
                      </span>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "السعر الوحدوي:" : "Prix unitaire:"}
                      </span>
                      <p className="font-medium">{item.unit_price} DH</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "السعر الإجمالي:" : "Prix total:"}
                      </span>
                      <p className="font-bold text-lg">{item.total_price} DH</p>
                    </div>
                  </div>

                  {item.output_files && item.output_files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        {language === "ar" ? "الملفات المنتجة:" : "Fichiers produits:"}
                      </p>
                      <div className="flex gap-2">
                        {item.output_files.map((file: any, idx: number) => (
                          <Button key={idx} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            {file.name || `File ${idx + 1}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pièces jointes */}
      {request.supporting_documents && request.supporting_documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "الوثائق المرفقة" : "Pièces jointes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {request.supporting_documents.map((doc: any, index: number) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                >
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm font-medium truncate">{doc.name || `Document ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{doc.type || 'PDF'}</p>
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    {language === "ar" ? "عرض" : "Voir"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {request.status === 'terminee' && (
          <Button size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {language === "ar" ? "تحميل الملفات" : "Télécharger les fichiers"}
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => window.print()}>
          {language === "ar" ? "طباعة" : "Imprimer"}
        </Button>
      </div>
    </div>
  );
}