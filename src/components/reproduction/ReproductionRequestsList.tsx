import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Eye, Download, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr, arDZ } from "date-fns/locale";

interface ReproductionRequest {
  id: string;
  request_number: string;
  status: string;
  reproduction_modality: string;
  submitted_at: string;
  created_at: string;
  payment_amount: number;
  payment_status: string;
  available_at: string | null;
  expires_at: string | null;
}

export function ReproductionRequestsList() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReproductionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("reproduction_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(language === "ar" ? "خطأ في تحميل الطلبات" : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; variant: any; label: string; labelAr: string }> = {
      brouillon: { icon: FileText, variant: "secondary", label: "Brouillon", labelAr: "مسودة" },
      soumise: { icon: Clock, variant: "default", label: "Soumise", labelAr: "مقدمة" },
      en_validation_service: { icon: Clock, variant: "default", label: "En validation", labelAr: "قيد التحقق" },
      approuvee: { icon: CheckCircle, variant: "success", label: "Approuvée", labelAr: "موافق عليها" },
      refusee: { icon: XCircle, variant: "destructive", label: "Refusée", labelAr: "مرفوضة" },
      en_attente_paiement: { icon: AlertCircle, variant: "warning", label: "En attente paiement", labelAr: "في انتظار الدفع" },
      en_traitement: { icon: Clock, variant: "default", label: "En traitement", labelAr: "قيد المعالجة" },
      terminee: { icon: CheckCircle, variant: "success", label: "Terminée", labelAr: "مكتملة" },
      disponible: { icon: Download, variant: "success", label: "Disponible", labelAr: "متاحة" },
      expiree: { icon: XCircle, variant: "secondary", label: "Expirée", labelAr: "منتهية الصلاحية" },
    };

    const config = statusConfig[status] || statusConfig.soumise;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {language === "ar" ? config.labelAr : config.label}
      </Badge>
    );
  };

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, { fr: string; ar: string }> = {
      papier: { fr: "Papier", ar: "ورقي" },
      numerique_mail: { fr: "Email", ar: "البريد الإلكتروني" },
      numerique_espace: { fr: "Espace personnel", ar: "المساحة الشخصية" },
      support_physique: { fr: "Support physique", ar: "دعم مادي" },
    };
    return language === "ar" ? labels[modality]?.ar : labels[modality]?.fr;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP", { locale: language === "ar" ? arDZ : fr });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === "ar" ? "طلبات الاستنساخ" : "Mes demandes de reproduction"}
          </h2>
          <p className="text-muted-foreground">
            {language === "ar" ? "تتبع جميع طلباتك" : "Suivez toutes vos demandes"}
          </p>
        </div>
        <Button onClick={() => navigate("/reproduction/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "طلب جديد" : "Nouvelle demande"}
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "ar" ? "لا توجد طلبات بعد" : "Aucune demande pour le moment"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === "ar"
                ? "ابدأ بإنشاء طلب استنساخ جديد"
                : "Commencez par créer une nouvelle demande de reproduction"}
            </p>
            <Button onClick={() => navigate("/reproduction/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء طلب" : "Créer une demande"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {language === "ar" ? "طلب رقم" : "Demande n°"} {request.request_number}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "تم الإرسال في" : "Soumise le"}{" "}
                      {formatDate(request.submitted_at || request.created_at)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الطريقة:" : "Modalité:"}
                    </span>
                    <p className="font-medium">{getModalityLabel(request.reproduction_modality)}</p>
                  </div>
                  {request.payment_amount && (
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "المبلغ:" : "Montant:"}
                      </span>
                      <p className="font-medium">{request.payment_amount} DH</p>
                    </div>
                  )}
                  {request.available_at && (
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "متاح حتى:" : "Disponible jusqu'au:"}
                      </span>
                      <p className="font-medium">{formatDate(request.expires_at || request.available_at)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/reproduction/${request.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {language === "ar" ? "عرض" : "Voir détails"}
                  </Button>
                  {request.status === "disponible" && (
                    <Button size="sm" variant="default">
                      <Download className="h-4 w-4 mr-2" />
                      {language === "ar" ? "تحميل" : "Télécharger"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
