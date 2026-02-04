import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  FileText, 
  CreditCard,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  X,
  ExternalLink,
  BookOpen,
  User,
  Mail,
  Calendar,
  FileImage,
  Printer,
  Download,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

interface ReproductionItem {
  id: string;
  title: string;
  reference: string | null;
  formats: string[];
  pages_specification: string | null;
  color_mode: string | null;
  resolution_dpi: number | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  unified_document_id: string | null;
  document_source_id: string | null;
  document_source_type: string | null;
}

interface DocumentInfo {
  id: string;
  title: string;
  author: string | null;
  document_type: string | null;
  cbn_document_id: string;
  cover_image_url: string | null;
  pdf_url: string | null;
}

interface ReproductionRequest {
  id: string;
  request_number: string;
  user_id: string;
  status: string;
  reproduction_modality: string;
  submitted_at: string;
  user_notes: string;
  internal_notes: string;
  service_validation_notes: string;
  manager_validation_notes: string;
  rejection_reason: string;
  payment_method: string;
  payment_amount: number;
  payment_status: string;
  paid_at: string;
  user_email?: string;
  user_name?: string;
}

interface Props {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReproductionDetailsSheet({ requestId, open, onOpenChange }: Props) {
  const [request, setRequest] = useState<ReproductionRequest | null>(null);
  const [items, setItems] = useState<ReproductionItem[]>([]);
  const [documents, setDocuments] = useState<Record<string, DocumentInfo>>({});
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string } | null>(null);
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

      // Fetch user info from request data if available
      if (requestData.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", requestData.user_id)
          .single();
        
        if (profileData) {
          setUserInfo({ 
            email: "", 
            full_name: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim()
          });
        }
      }

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from("reproduction_items")
        .select("*")
        .eq("request_id", requestId);

      if (itemsError) throw itemsError;
      
      // Map to our interface
      const mappedItems: ReproductionItem[] = (itemsData || []).map(item => ({
        id: item.id,
        title: item.title,
        reference: item.reference,
        formats: item.formats || [],
        pages_specification: item.pages_specification,
        color_mode: item.color_mode,
        resolution_dpi: item.resolution_dpi,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        unified_document_id: item.unified_document_id,
        document_source_id: item.document_source_id,
        document_source_type: item.document_source_type,
      }));
      setItems(mappedItems);

      // Fetch document details for each item
      const documentIds = [...new Set(mappedItems.map(i => i.unified_document_id || i.document_source_id).filter(Boolean))] as string[];
      if (documentIds.length > 0) {
        const { data: docsData } = await supabase
          .from("digital_library_documents")
          .select("id, title, author, document_type, cbn_document_id, cover_image_url, pdf_url")
          .in("id", documentIds);
        
        if (docsData) {
          const docsMap: Record<string, DocumentInfo> = {};
          docsData.forEach(doc => {
            docsMap[doc.id] = doc;
          });
          setDocuments(docsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "PPP à HH:mm", { locale: fr });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; variant: any; label: string }> = {
      brouillon: { icon: FileText, variant: "secondary", label: "Brouillon" },
      soumise: { icon: Clock, variant: "default", label: "Soumise" },
      en_validation_service: { icon: Clock, variant: "default", label: "En validation service" },
      en_validation_responsable: { icon: Clock, variant: "default", label: "En validation responsable" },
      en_attente_paiement: { icon: DollarSign, variant: "warning", label: "En attente paiement" },
      paiement_recu: { icon: CreditCard, variant: "default", label: "Paiement reçu" },
      en_traitement: { icon: Printer, variant: "default", label: "En reproduction" },
      terminee: { icon: CheckCircle2, variant: "success", label: "Terminée" },
      refusee: { icon: XCircle, variant: "destructive", label: "Refusée" },
    };

    const config = statusConfig[status] || statusConfig.soumise;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1.5 px-3 py-1">
        <Icon className="h-4 w-4" />
        {config.label}
      </Badge>
    );
  };

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, string> = {
      papier: "Reproduction papier",
      numerique_mail: "Numérique par email",
      numerique_espace: "Numérique - Espace personnel",
      support_physique: "Support physique (CD/DVD/USB)",
    };
    return labels[modality] || modality;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      online: "Paiement en ligne (Stripe)",
      virement: "Virement bancaire",
      sur_place: "Paiement sur place",
      carte_bancaire: "Carte bancaire",
      especes: "Espèces",
      cheque: "Chèque",
    };
    return labels[method] || method;
  };

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      pdf: "PDF",
      jpeg: "JPEG",
      tiff: "TIFF",
      papier: "Papier",
    };
    return labels[format] || format;
  };

  const getColorModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      couleur: "Couleur",
      noir_blanc: "Noir et blanc",
      niveaux_gris: "Niveaux de gris",
    };
    return labels[mode] || mode;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-xl md:max-w-2xl p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                Détails de la demande
              </SheetTitle>
              {request && (
                <SheetDescription className="mt-1 font-mono">
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
                <p className="text-muted-foreground text-sm">Chargement...</p>
              </div>
            </div>
          ) : !request ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">Demande introuvable</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Status et date */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {getStatusBadge(request.status)}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(request.submitted_at)}
                </span>
              </div>

              {/* Informations du demandeur */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Demandeur
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  {userInfo?.full_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{userInfo.full_name}</span>
                    </div>
                  )}
                  {userInfo?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${userInfo.email}`} className="text-primary hover:underline">
                        {userInfo.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modalité */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Modalité de reproduction
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium">{getModalityLabel(request.reproduction_modality)}</p>
                </div>
              </div>

              {/* Documents à reproduire */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Documents à reproduire ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const docId = item.unified_document_id || item.document_source_id;
                    const doc = docId ? documents[docId] : null;
                    return (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="flex gap-4 p-4">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-20 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                            {doc?.cover_image_url ? (
                              <img 
                                src={doc.cover_image_url} 
                                alt={doc.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Document info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {item.title || doc?.title || "Document"}
                            </h4>
                            {doc?.author && (
                              <p className="text-xs text-muted-foreground mt-0.5">{doc.author}</p>
                            )}
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              Réf: {item.reference || doc?.cbn_document_id || "-"}
                            </p>
                            
                            {/* Document link - PROMINENT */}
                            {doc && (
                              <Link 
                                to={`/bibliotheque-numerique/document/${doc.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-sm font-medium"
                              >
                                <BookOpen className="h-4 w-4" />
                                Ouvrir le document
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        {/* Item details */}
                        <div className="bg-muted/30 px-4 py-3 border-t">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Format(s):</span>
                              <span className="ml-1 font-medium">{item.formats?.join(", ") || "-"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pages:</span>
                              <span className="ml-1 font-medium">{item.pages_specification || "Toutes"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Couleur:</span>
                              <span className="ml-1 font-medium">{getColorModeLabel(item.color_mode) || "-"}</span>
                            </div>
                            {item.resolution_dpi && (
                              <div>
                                <span className="text-muted-foreground">Résolution:</span>
                                <span className="ml-1 font-medium">{item.resolution_dpi} DPI</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Quantité:</span>
                              <span className="ml-1 font-medium">{item.quantity || 1}</span>
                            </div>
                          </div>
                          
                          {/* Pricing */}
                          {(item.unit_price || item.total_price) && (
                            <div className="mt-3 pt-2 border-t border-muted flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {item.unit_price ? `${item.unit_price} DH/unité` : ""}
                              </span>
                              <span className="text-sm font-bold text-primary">
                                {item.total_price || 0} DH
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes du demandeur */}
              {request.user_notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Notes du demandeur
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{request.user_notes}</p>
                  </div>
                </div>
              )}

              {/* Validations */}
              {(request.service_validation_notes || request.manager_validation_notes || request.rejection_reason) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-4 w-4" />
                      Validations
                    </h3>
                    <div className="space-y-3">
                      {request.service_validation_notes && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <label className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                            Notes validation service
                          </label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{request.service_validation_notes}</p>
                        </div>
                      )}

                      {request.manager_validation_notes && (
                        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                          <label className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                            Notes du responsable
                          </label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{request.manager_validation_notes}</p>
                        </div>
                      )}

                      {request.rejection_reason && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <label className="text-xs font-medium text-destructive uppercase tracking-wide">
                            Raison du refus
                          </label>
                          <p className="text-sm mt-1">{request.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Paiement */}
              {request.payment_amount && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4" />
                      Paiement
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Montant total</span>
                        <span className="text-lg font-bold">{request.payment_amount} DH</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Statut</span>
                        <Badge variant={request.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {request.payment_status === 'paid' ? "Payé" : "En attente"}
                        </Badge>
                      </div>

                      {request.payment_method && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Méthode</span>
                          <span className="text-sm">{getPaymentMethodLabel(request.payment_method)}</span>
                        </div>
                      )}

                      {request.paid_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Date de paiement</span>
                          <span className="text-sm">{formatDate(request.paid_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
