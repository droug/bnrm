import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  FileText, 
  Download, 
  Eye, 
  CreditCard,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileImage,
  X
} from "lucide-react";
import { format } from "date-fns";
import { fr, arDZ } from "date-fns/locale";
import { Button } from "@/components/ui/button";

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

interface ReproductionDetailsSheetProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReproductionDetailsSheet({ requestId, open, onOpenChange }: ReproductionDetailsSheetProps) {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [request, setRequest] = useState<ReproductionRequest | null>(null);
  const [items, setItems] = useState<ReproductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (requestId && open) {
      fetchRequestDetails();
    }
  }, [requestId, open]);

  const fetchRequestDetails = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    try {
      // Fetch request
      const { data: requestData, error: requestError } = await supabase
        .from("reproduction_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from("reproduction_items")
        .select("*")
        .eq("request_id", requestId);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching request:", error);
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
      <Badge variant={config.variant as any} className="gap-1.5 px-3 py-1">
        <Icon className="h-4 w-4" />
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">
                {language === "ar" ? "تفاصيل الطلب" : "Détails de la demande"}
              </SheetTitle>
              {request && (
                <SheetDescription className="mt-1">
                  {request.request_number}
                </SheetDescription>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">
                  {language === "ar" ? "جاري التحميل..." : "Chargement..."}
                </p>
              </div>
            </div>
          ) : !request ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">
                {language === "ar" ? "الطلب غير موجود" : "Demande introuvable"}
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(request.status)}
                <span className="text-sm text-muted-foreground">
                  {formatDate(request.submitted_at)}
                </span>
              </div>

              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  {language === "ar" ? "معلومات عامة" : "Informations générales"}
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {language === "ar" ? "الطريقة" : "Modalité"}
                    </label>
                    <p className="text-sm font-medium mt-1">{getModalityLabel(request.reproduction_modality)}</p>
                  </div>

                  {request.user_notes && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {language === "ar" ? "ملاحظات المستخدم" : "Notes du demandeur"}
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{request.user_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validations */}
              {(request.service_validation_notes || request.manager_validation_notes || request.rejection_reason) && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4" />
                    {language === "ar" ? "الحالة والتحققات" : "Statut et validations"}
                  </h3>
                  <div className="space-y-3">
                    {request.service_validation_notes && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {language === "ar" ? "ملاحظات الخدمة" : "Notes validation service"}
                        </label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{request.service_validation_notes}</p>
                      </div>
                    )}

                    {request.manager_validation_notes && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {language === "ar" ? "ملاحظات المسؤول" : "Notes du responsable"}
                        </label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{request.manager_validation_notes}</p>
                      </div>
                    )}

                    {request.rejection_reason && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <label className="text-xs font-medium text-destructive uppercase tracking-wide">
                          {language === "ar" ? "سبب الرفض" : "Raison du refus"}
                        </label>
                        <p className="text-sm mt-1">{request.rejection_reason}</p>
                      </div>
                    )}

                    {request.internal_notes && (profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <label className="text-xs font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                          {language === "ar" ? "ملاحظات داخلية" : "Notes internes"}
                        </label>
                        <p className="text-sm mt-1">{request.internal_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paiement */}
              {request.payment_amount && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    {language === "ar" ? "معلومات الدفع" : "Paiement"}
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "المبلغ" : "Montant"}
                      </span>
                      <span className="text-lg font-bold">{request.payment_amount} DH</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "الحالة" : "Statut"}
                      </span>
                      <Badge variant={request.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {request.payment_status === 'paid' 
                          ? (language === "ar" ? "مدفوع" : "Payé")
                          : (language === "ar" ? "في الانتظار" : "En attente")}
                      </Badge>
                    </div>

                    {request.payment_method && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {language === "ar" ? "الطريقة" : "Méthode"}
                        </span>
                        <span className="text-sm">{getPaymentMethodLabel(request.payment_method)}</span>
                      </div>
                    )}

                    {request.paid_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {language === "ar" ? "تاريخ الدفع" : "Date"}
                        </span>
                        <span className="text-sm">{formatDate(request.paid_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Traitement */}
              {(request.processing_started_at || request.processing_completed_at || request.available_at) && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <Package className="h-4 w-4" />
                    {language === "ar" ? "المعالجة" : "Traitement"}
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    {request.processing_started_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "بداية" : "Début"}
                        </span>
                        <span>{formatDate(request.processing_started_at)}</span>
                      </div>
                    )}
                    {request.processing_completed_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "نهاية" : "Fin"}
                        </span>
                        <span>{formatDate(request.processing_completed_at)}</span>
                      </div>
                    )}
                    {request.available_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "متاح منذ" : "Disponible depuis"}
                        </span>
                        <span>{formatDate(request.available_at)}</span>
                      </div>
                    )}
                    {request.expires_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "تنتهي في" : "Expire le"}
                        </span>
                        <span>{formatDate(request.expires_at)}</span>
                      </div>
                    )}
                    {request.download_count > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "التحميلات" : "Téléchargements"}
                        </span>
                        <span className="font-semibold">{request.download_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items à reproduire */}
              {items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <FileImage className="h-4 w-4" />
                    {language === "ar" ? "العناصر المطلوبة" : "Éléments à reproduire"}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            {item.reference && (
                              <p className="text-xs text-muted-foreground">
                                Réf: {item.reference}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>

                        <Separator className="my-2" />

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Formats:</span>
                            <span className="ml-1 font-medium">{item.formats.join(", ").toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="ml-1 font-medium">{item.pages_specification}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mode:</span>
                            <span className="ml-1 font-medium capitalize">{item.color_mode}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Résolution:</span>
                            <span className="ml-1 font-medium">{item.resolution_dpi} DPI</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantité:</span>
                            <span className="ml-1 font-medium">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="ml-1 font-bold">{item.total_price} DH</span>
                          </div>
                        </div>

                        {item.output_files && item.output_files.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {item.output_files.map((file: any, idx: number) => (
                              <Button key={idx} variant="outline" size="sm" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                {file.name || `File ${idx + 1}`}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.supporting_documents && request.supporting_documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    {language === "ar" ? "الوثائق المرفقة" : "Pièces jointes"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {request.supporting_documents.map((doc: any, index: number) => (
                      <div 
                        key={index}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <FileText className="h-6 w-6 mb-1 text-primary" />
                        <p className="text-xs font-medium truncate">{doc.name || `Document ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{doc.type || 'PDF'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
