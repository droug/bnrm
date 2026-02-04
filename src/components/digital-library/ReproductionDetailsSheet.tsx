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
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

interface DocumentInfo {
  id: string;
  title: string;
  author: string | null;
  document_type: string | null;
  cbn_document_id: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
}

interface RequestMetadata {
  document_id?: string;
  document_title?: string;
  document_author?: string;
  document_cote?: string;
  format?: string;
  pages?: string;
  quality?: string;
  reproduction_scope?: string;
  certified_copy?: boolean;
  urgent_request?: boolean;
  estimated_cost?: number;
  delivery_mode?: string;
  usage_type?: string;
}

interface ReproductionRequest {
  id: string;
  request_number: string;
  user_id: string;
  status: string;
  reproduction_modality: string;
  submitted_at: string;
  user_notes: string | null;
  internal_notes: string | null;
  service_validation_notes: string | null;
  manager_validation_notes: string | null;
  rejection_reason: string | null;
  payment_method: string | null;
  payment_amount: number | null;
  payment_status: string | null;
  paid_at: string | null;
  metadata?: RequestMetadata | null;
}

interface Props {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReproductionDetailsSheet({ requestId, open, onOpenChange }: Props) {
  const [request, setRequest] = useState<ReproductionRequest | null>(null);
  const [document, setDocument] = useState<DocumentInfo | null>(null);
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
      
      // Cast metadata safely
      const typedRequest: ReproductionRequest = {
        ...requestData,
        metadata: requestData.metadata as RequestMetadata | null
      };
      setRequest(typedRequest);

      // Fetch user info
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

      // Fetch document from metadata.document_id
      const metadata = requestData.metadata as RequestMetadata | null;
      if (metadata?.document_id) {
        const { data: docData } = await supabase
          .from("digital_library_documents")
          .select("id, title, author, document_type, cbn_document_id, cover_image_url, pdf_url")
          .eq("id", metadata.document_id)
          .single();
        
        if (docData) {
          setDocument(docData);
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

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "-";
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

  const getQualityLabel = (quality: string | null) => {
    if (!quality) return "-";
    const labels: Record<string, string> = {
      standard: "Standard",
      haute: "Haute qualité",
      professionnelle: "Professionnelle",
    };
    return labels[quality] || quality;
  };

  const getScopeLabel = (scope: string | null) => {
    if (!scope) return "-";
    const labels: Record<string, string> = {
      complete: "Document complet",
      partial: "Pages spécifiques",
    };
    return labels[scope] || scope;
  };

  const metadata = request?.metadata;

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

              {/* Document à reproduire - FROM METADATA */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Document à reproduire
                </h3>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-24 h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {document?.cover_image_url ? (
                        <img 
                          src={document.cover_image_url} 
                          alt={document.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Document info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base">
                        {metadata?.document_title || document?.title || "Document"}
                      </h4>
                      {(metadata?.document_author || document?.author) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {metadata?.document_author || document?.author}
                        </p>
                      )}
                      {(metadata?.document_cote || document?.cbn_document_id) && (
                        <p className="text-xs text-muted-foreground font-mono mt-2">
                          Cote: {metadata?.document_cote || document?.cbn_document_id}
                        </p>
                      )}
                      
                      {/* Document link - PROMINENT */}
                      {document && (
                        <Link 
                          to={`/bibliotheque-numerique/document/${document.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors text-sm font-medium shadow-sm"
                        >
                          <BookOpen className="h-4 w-4" />
                          Ouvrir le document
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      
                      {!document && metadata?.document_id && (
                        <Link 
                          to={`/bibliotheque-numerique/document/${metadata.document_id}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors text-sm font-medium shadow-sm"
                        >
                          <BookOpen className="h-4 w-4" />
                          Ouvrir le document
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Item details from metadata */}
                  <div className="bg-muted/30 px-4 py-3 border-t">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <span className="ml-2 font-medium uppercase">{metadata?.format || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pages:</span>
                        <span className="ml-2 font-medium">{metadata?.pages || "Toutes"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Qualité:</span>
                        <span className="ml-2 font-medium">{getQualityLabel(metadata?.quality || null)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Étendue:</span>
                        <span className="ml-2 font-medium">{getScopeLabel(metadata?.reproduction_scope || null)}</span>
                      </div>
                      {metadata?.certified_copy && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Copie certifiée conforme
                          </Badge>
                        </div>
                      )}
                      {metadata?.urgent_request && (
                        <div className="col-span-2">
                          <Badge variant="destructive" className="gap-1">
                            Demande urgente
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
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
                    <h3 className="font-semibold text-base">Notes de validation</h3>
                    
                    {request.service_validation_notes && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Service</p>
                        <p className="text-sm">{request.service_validation_notes}</p>
                      </div>
                    )}
                    
                    {request.manager_validation_notes && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Responsable</p>
                        <p className="text-sm">{request.manager_validation_notes}</p>
                      </div>
                    )}
                    
                    {request.rejection_reason && (
                      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Motif de refus</p>
                        <p className="text-sm">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Paiement */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Paiement
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Montant total</span>
                    <span className="text-xl font-bold text-primary">
                      {request.payment_amount || metadata?.estimated_cost || 0} DH
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={request.payment_status === 'paid' ? 'default' : 'secondary'} className={request.payment_status === 'paid' ? 'bg-green-500 text-white' : ''}>
                      {request.payment_status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                  {request.payment_method && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Méthode</span>
                      <span className="font-medium">{getPaymentMethodLabel(request.payment_method)}</span>
                    </div>
                  )}
                  {request.paid_at && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Date de paiement</span>
                      <span>{formatDate(request.paid_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes internes */}
              {request.internal_notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Notes internes
                  </h3>
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm whitespace-pre-wrap">{request.internal_notes}</p>
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
