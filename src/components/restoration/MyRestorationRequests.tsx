import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Package, Wrench, Download, Check, X, Upload, Trash2, CreditCard, Building, Coins, History, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateQuoteDocument } from "@/lib/restorationPdfGenerator";
import { ActivityTimeline } from "@/components/my-space/ActivityTimeline";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { AttachmentsSection } from "@/components/my-space/AttachmentsSection";

interface RestorationRequest {
  id: string;
  request_number: string;
  manuscript_title: string;
  manuscript_cote: string;
  damage_description: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  quote_amount?: number;
  estimated_duration?: number;
  restoration_report?: string;
  signed_quote_url?: string;
  payment_method?: string;
  authorization_document_url?: string | null;
  diagnosis_document_url?: string | null;
  diagnosis_photos_before?: string[] | null;
  quote_document_url?: string | null;
  invoice_document_url?: string | null;
  restoration_report_document_url?: string | null;
  restoration_photos_after?: string[] | null;
  reception_document_url?: string | null;
  return_document_url?: string | null;
}

export function MyRestorationRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestorationRequest | null>(null);
  const [signedQuoteFile, setSignedQuoteFile] = useState<File | null>(null);
  const [isUploadingQuote, setIsUploadingQuote] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Record<string, string>>({});
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [detailsRequest, setDetailsRequest] = useState<RestorationRequest | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-restoration-requests', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[MyRestorationRequests] No user logged in');
        return [];
      }
      
      console.log('[MyRestorationRequests] Fetching requests for user:', user.id);
      
      const { data, error } = await supabase
        .from('restoration_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[MyRestorationRequests] Error fetching requests:', error);
        throw error;
      }
      
      console.log('[MyRestorationRequests] Fetched requests:', data);
      return data as RestorationRequest[];
    },
    enabled: !!user
  });

  // Télécharger le devis PDF
  const handleDownloadQuote = async (request: RestorationRequest) => {
    setIsGeneratingPdf(true);
    try {
      await generateQuoteDocument(request);
      toast({
        title: "Devis téléchargé",
        description: "Le devis a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le devis.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Uploader le devis signé
  const handleUploadSignedQuote = async (requestId: string, file: File) => {
    setIsUploadingQuote(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${requestId}/signed-quote-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('restoration-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('restoration-documents')
        .getPublicUrl(fileName);
      
      // Mettre à jour la demande avec l'URL du devis signé
      const { error: updateError } = await supabase
        .from('restoration_requests')
        .update({
          signed_quote_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Devis signé uploadé",
        description: "Votre devis signé a été envoyé avec succès.",
      });
      
      setSignedQuoteFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user?.id] });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingQuote(false);
    }
  };

  // Mutation pour accepter le devis (sans paiement à cette étape)
  const acceptQuote = useMutation({
    mutationFn: async (request: RestorationRequest) => {
      // Mettre à jour le statut vers devis_accepte (l'admin devra démarrer la restauration manuellement)
      const { error } = await supabase
        .from('restoration_requests')
        .update({
          status: 'devis_accepte',
          quote_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
      if (error) throw error;

      // Envoyer la notification d'acceptation
      try {
        await supabase.functions.invoke('send-restoration-notification', {
          body: {
            requestId: request.id,
            recipientEmail: user?.email,
            recipientId: user?.id,
            notificationType: 'quote_accepted',
            requestNumber: request.request_number,
            manuscriptTitle: request.manuscript_title,
            quoteAmount: request.quote_amount
          }
        });
      } catch (emailError) {
        console.error('Erreur notification email:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user?.id] });
      toast({
        title: "Devis accepté",
        description: "La restauration va démarrer. Le paiement vous sera demandé après la fin de la restauration.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter le devis.",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  // Mutation pour effectuer le paiement (après restauration terminée)
  const processPayment = useMutation({
    mutationFn: async ({ request, paymentMethod }: { request: RestorationRequest, paymentMethod: string }) => {
      if (paymentMethod === 'en_ligne') {
        // Générer le lien de paiement Stripe
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'create-restoration-payment',
          {
            body: {
              requestId: request.id,
              quoteAmount: request.quote_amount,
              requestNumber: request.request_number,
              manuscriptTitle: request.manuscript_title
            }
          }
        );

        if (paymentError) {
          console.error('Erreur création paiement:', paymentError);
          throw new Error('Impossible de créer le lien de paiement');
        }

        return { paymentUrl: paymentData?.url, paymentMethod };
      } else if (paymentMethod === 'virement_en_ligne') {
        // Rediriger vers la page d'instructions de virement bancaire
        const { error } = await supabase
          .from('restoration_requests')
          .update({
            payment_method: paymentMethod,
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (error) throw error;
        
        return { redirectUrl: `/bank-transfer-instructions?requestId=${request.id}&amount=${request.quote_amount}&requestNumber=${request.request_number}`, paymentMethod };
      } else {
        // Pour les autres méthodes, enregistrer la méthode choisie
        const { error } = await supabase
          .from('restoration_requests')
          .update({
            payment_method: paymentMethod,
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (error) throw error;
        
        return { paymentMethod };
      }
    },
    onSuccess: (data, variables) => {
      if (data?.paymentUrl) {
        // Ouvrir le lien de paiement dans un nouvel onglet pour paiement en ligne
        window.open(data.paymentUrl, '_blank');
        toast({
          title: "Lien de paiement généré",
          description: "Le lien de paiement s'ouvre dans un nouvel onglet.",
        });
      } else if (data?.redirectUrl) {
        // Rediriger vers la page d'instructions de virement
        window.location.href = data.redirectUrl;
      } else {
        // Afficher un message pour les autres méthodes
        const methodLabels: Record<string, string> = {
          'virement': 'Virement bancaire',
          'virement_en_ligne': 'Virement bancaire en ligne',
          'carte_guichet': 'Carte au guichet',
          'espece': 'Espèce',
          'cheque': 'Chèque'
        };
        
        toast({
          title: "Méthode de paiement enregistrée",
          description: `Vous avez choisi de payer par ${methodLabels[data.paymentMethod] || data.paymentMethod}. Un agent vous contactera pour finaliser le paiement.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user?.id] });
      // Réinitialiser la sélection
      setSelectedPaymentMethod(prev => {
        const newState = { ...prev };
        delete newState[variables.request.id];
        return newState;
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande de paiement.",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  // Mutation pour refuser le devis
  const rejectQuote = useMutation({
    mutationFn: async ({ request, reason }: { request: RestorationRequest; reason: string }) => {
      const { error } = await supabase
        .from('restoration_requests')
        .update({
          status: 'devis_refuse',
          quote_rejected_at: new Date().toISOString(),
          quote_rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
      if (error) throw error;

      // Envoyer la notification
      try {
        await supabase.functions.invoke('send-restoration-notification', {
          body: {
            requestId: request.id,
            recipientEmail: user?.email,
            recipientId: user?.id,
            notificationType: 'quote_rejected',
            requestNumber: request.request_number,
            manuscriptTitle: request.manuscript_title,
            additionalInfo: reason
          }
        });
      } catch (emailError) {
        console.error('Erreur notification email:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user?.id] });
      setShowRejectionDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
      toast({
        title: "Devis refusé",
        description: "Le devis a été refusé. Votre demande a été clôturée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de refuser le devis.",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  // Subscribe to real-time updates for restoration requests
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-restoration-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restoration_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Restoration request change detected:', payload);
          // Refresh requests when any change occurs
          queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      'soumise': { label: 'En attente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      'autorisee': { label: 'Autorisée', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'refusee_direction': { label: 'Refusée', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      'diagnostic_en_cours': { label: 'Diagnostic en cours', variant: 'default', icon: <FileText className="h-3 w-3" /> },
      'devis_en_attente': { label: 'Devis en attente', variant: 'secondary', icon: <DollarSign className="h-3 w-3" /> },
      'devis_refuse': { label: 'Devis refusé', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      'paiement_en_attente': { label: 'Paiement en attente', variant: 'secondary', icon: <DollarSign className="h-3 w-3" /> },
      'paiement_valide': { label: 'Paiement validé', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'restauration_en_cours': { label: 'Restauration en cours', variant: 'default', icon: <Wrench className="h-3 w-3" /> },
      'terminee': { label: 'Terminée', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'cloturee': { label: 'Clôturée', variant: 'outline', icon: <Package className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (level: string) => {
    const colors = {
      'faible': 'bg-green-100 text-green-800',
      'moyenne': 'bg-yellow-100 text-yellow-800',
      'haute': 'bg-orange-100 text-orange-800',
      'critique': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes demandes de restauration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes demandes de restauration</CardTitle>
      </CardHeader>
      <CardContent>
        {!requests || requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Vous n'avez aucune demande de restauration pour le moment
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">
                            {request.manuscript_title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Cote: {request.manuscript_cote}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Demande N° {request.request_number}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency_level)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Soumise le {format(new Date(request.submitted_at), "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>

                      {request.quote_amount && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">Montant: {request.quote_amount} DH</span>
                        </div>
                      )}

                      {request.estimated_duration && (
                        <div className="text-sm text-muted-foreground">
                          Durée estimée: {request.estimated_duration} jours
                        </div>
                      )}

                      {/* Message pour demande autorisée - dépôt requis */}
                      {request.status === 'autorisee' && (
                        <div className="space-y-3 pt-2 border-t">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 mb-2">Dépôt de l'œuvre requis</h4>
                                <p className="text-sm text-blue-800 mb-3">
                                  Votre demande a été autorisée. Vous devez maintenant déposer l'œuvre à la BNRM pour qu'un diagnostic approfondi soit réalisé par notre équipe de restauration.
                                </p>
                                <div className="bg-white rounded p-3 mb-3">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Informations pratiques :</p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>Horaires :</strong> Du lundi au vendredi, de 9h à 17h</li>
                                    <li>• <strong>Lieu :</strong> Service de restauration - BNRM</li>
                                    <li>• <strong>À apporter :</strong> Votre pièce d'identité et ce numéro de demande</li>
                                  </ul>
                                </div>
                                <p className="text-xs text-blue-700">
                                  Le diagnostic nous permettra d'établir un devis détaillé des travaux nécessaires.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions pour devis en attente */}
                      {request.status === 'devis_en_attente' && (
                        <div className="space-y-3 pt-2 border-t">
                          {request.quote_amount ? (
                            <>
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                                <div className="flex items-start gap-3">
                                  <FileText className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-amber-900 mb-1">Devis disponible</h4>
                                    <p className="text-sm text-amber-800">
                                      Veuillez télécharger le devis, le signer et le renvoyer avant de confirmer.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Bouton pour télécharger le devis */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full"
                                onClick={() => handleDownloadQuote(request)}
                                disabled={isGeneratingPdf}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {isGeneratingPdf ? 'Génération...' : 'Télécharger le devis'}
                              </Button>

                              {/* Upload du devis signé */}
                              <div className="space-y-2">
                                <Label htmlFor={`signed-quote-${request.id}`} className="text-sm font-semibold">
                                  Uploader le devis signé <span className="text-destructive">*</span>
                                </Label>
                                {request.signed_quote_url ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-sm text-green-800 flex-1">Devis signé reçu</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          // Réinitialiser pour permettre un nouvel upload
                                          supabase
                                            .from('restoration_requests')
                                            .update({ signed_quote_url: null })
                                            .eq('id', request.id)
                                            .then(() => {
                                              queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user?.id] });
                                              toast({
                                                title: "Document supprimé",
                                                description: "Vous pouvez maintenant uploader un nouveau document.",
                                              });
                                            });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <Input
                                      id={`signed-quote-${request.id}`}
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          if (file.size > 10 * 1024 * 1024) {
                                            toast({
                                              title: "Erreur",
                                              description: "La taille du fichier ne doit pas dépasser 10 MB.",
                                              variant: "destructive"
                                            });
                                            return;
                                          }
                                          setSignedQuoteFile(file);
                                          setSelectedRequest(request);
                                        }
                                      }}
                                      className="flex-1"
                                    />
                                    {signedQuoteFile && selectedRequest?.id === request.id && (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUploadSignedQuote(request.id, signedQuoteFile)}
                                        disabled={isUploadingQuote}
                                      >
                                        <Upload className="h-4 w-4 mr-1" />
                                        {isUploadingQuote ? 'Upload...' : 'Envoyer'}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Boutons d'acceptation/refus */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => acceptQuote.mutate(request)}
                                  disabled={acceptQuote.isPending || !request.signed_quote_url}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirmer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectionDialog(true);
                                  }}
                                  disabled={rejectQuote.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </div>

                              {!request.signed_quote_url && (
                                <p className="text-xs text-muted-foreground text-center">
                                  Le bouton "Confirmer" sera activé après l'envoi du devis signé
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Le devis est en cours de préparation. Vous recevrez une notification dès qu'il sera disponible.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Section paiement - après restauration terminée */}
                      {request.status === 'paiement_en_attente' && (
                        <div className="space-y-3 pt-2 border-t">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 mb-2">Restauration terminée - Paiement requis</h4>
                                <p className="text-sm text-blue-800 mb-3">
                                  La restauration de votre manuscrit est terminée. Veuillez choisir votre méthode de paiement pour récupérer votre œuvre.
                                </p>
                                {request.quote_amount && (
                                  <div className="bg-white rounded p-3 mb-3">
                                    <p className="text-sm font-semibold text-gray-700">Montant à payer : {request.quote_amount} DH</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Sélection de la méthode de paiement */}
                          {!selectedPaymentMethod[request.id] ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Choisissez votre modalité de paiement :</p>
                              <div className="grid grid-cols-1 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'en_ligne' }))}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Paiement en ligne
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'virement' }))}
                                >
                                  <Building className="h-4 w-4 mr-2" />
                                  Virement bancaire
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'virement_en_ligne' }))}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Virement bancaire en ligne
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'carte_guichet' }))}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Carte au guichet sur place
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'espece' }))}
                                >
                                  <Coins className="h-4 w-4 mr-2" />
                                  Espèce
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedPaymentMethod(prev => ({ ...prev, [request.id]: 'cheque' }))}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Chèque
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm text-green-800">
                                  Méthode sélectionnée : <span className="font-semibold">
                                    {selectedPaymentMethod[request.id] === 'en_ligne' && 'Paiement en ligne'}
                                    {selectedPaymentMethod[request.id] === 'virement' && 'Virement bancaire'}
                                    {selectedPaymentMethod[request.id] === 'virement_en_ligne' && 'Virement bancaire en ligne'}
                                    {selectedPaymentMethod[request.id] === 'carte_guichet' && 'Carte au guichet'}
                                    {selectedPaymentMethod[request.id] === 'espece' && 'Espèce'}
                                    {selectedPaymentMethod[request.id] === 'cheque' && 'Chèque'}
                                  </span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => processPayment.mutate({ request, paymentMethod: selectedPaymentMethod[request.id] })}
                                  disabled={processPayment.isPending}
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  {processPayment.isPending ? 'Traitement...' : 'Confirmer'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPaymentMethod(prev => {
                                    const newState = { ...prev };
                                    delete newState[request.id];
                                    return newState;
                                  })}
                                  disabled={processPayment.isPending}
                                >
                                  Modifier
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setDetailsRequest(request);
                          setShowDetailsSheet(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </Button>
                    </div>

                    {/* Timeline des opérations */}
                    <div className="pt-3 border-t">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(request.id)}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Historique des opérations
                        </span>
                        {expandedRequests.has(request.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Collapsible open={expandedRequests.has(request.id)}>
                        <CollapsibleContent className="pt-2">
                          <ActivityTimeline 
                            resourceType="restoration" 
                            resourceId={request.id} 
                            compact 
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Dialog de refus du devis */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser le devis</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du refus du devis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection_reason">Raison du refus</Label>
                <Textarea
                  id="rejection_reason"
                  placeholder="Ex: Le montant est trop élevé, je souhaite obtenir d'autres devis..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason("");
                    setSelectedRequest(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (selectedRequest && rejectionReason.trim()) {
                      rejectQuote.mutate({ 
                        request: selectedRequest, 
                        reason: rejectionReason 
                      });
                    }
                  }}
                  disabled={!rejectionReason.trim() || rejectQuote.isPending}
                >
                  Confirmer le refus
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      {/* Sheet latéral pour les détails */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la demande</SheetTitle>
            <SheetDescription>
              Demande N° {detailsRequest?.request_number}
            </SheetDescription>
          </SheetHeader>
          {detailsRequest && (
            <div className="space-y-6 py-6">
              {/* Statut et urgence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(detailsRequest.status)}
                  {getUrgencyBadge(detailsRequest.urgency_level)}
                </div>
              </div>

              <Separator />

              {/* Manuscrit */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Manuscrit</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Titre</span>
                    <p className="font-medium">{detailsRequest.manuscript_title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Cote</span>
                    <p className="font-medium">{detailsRequest.manuscript_cote}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description des dommages */}
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Description des dommages</h4>
                <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{detailsRequest.damage_description}</p>
              </div>

              <Separator />

              {/* Devis */}
              {detailsRequest.quote_amount && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">Devis</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Montant</span>
                        <p className="font-medium text-lg">{detailsRequest.quote_amount} DH</p>
                      </div>
                      {detailsRequest.estimated_duration && (
                        <div>
                          <span className="text-sm text-muted-foreground">Durée estimée</span>
                          <p className="font-medium">{detailsRequest.estimated_duration} jours</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Paiement */}
              {detailsRequest.payment_method && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Modalité de paiement</h4>
                    <Badge variant="outline" className="text-sm">
                      {detailsRequest.payment_method === 'en_ligne' && 'Paiement en ligne'}
                      {detailsRequest.payment_method === 'virement' && 'Virement bancaire'}
                      {detailsRequest.payment_method === 'virement_en_ligne' && 'Virement bancaire en ligne'}
                      {detailsRequest.payment_method === 'carte_guichet' && 'Carte au guichet sur place'}
                      {detailsRequest.payment_method === 'espece' && 'Espèce'}
                      {detailsRequest.payment_method === 'cheque' && 'Chèque'}
                    </Badge>
                  </div>
                  <Separator />
                </>
              )}

              {/* Rapport */}
              {detailsRequest.restoration_report && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Rapport de restauration</h4>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                      {detailsRequest.restoration_report}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Dates</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Date de soumission</span>
                    <p className="font-medium">{format(new Date(detailsRequest.submitted_at), "d MMMM yyyy", { locale: fr })}</p>
                  </div>
                </div>
              </div>

              {/* Pièces jointes */}
              <AttachmentsSection
                attachments={[
                  { label: "Document d'autorisation", url: detailsRequest.authorization_document_url },
                  { label: "Document de diagnostic", url: detailsRequest.diagnosis_document_url },
                  ...(detailsRequest.diagnosis_photos_before || []).map((url: string, i: number) => ({
                    label: `Photo avant restauration ${i + 1}`,
                    url,
                  })),
                  { label: "Document du devis", url: detailsRequest.quote_document_url },
                  { label: "Devis signé", url: detailsRequest.signed_quote_url },
                  { label: "Facture", url: detailsRequest.invoice_document_url },
                  { label: "Rapport de restauration (document)", url: detailsRequest.restoration_report_document_url },
                  ...(detailsRequest.restoration_photos_after || []).map((url: string, i: number) => ({
                    label: `Photo après restauration ${i + 1}`,
                    url,
                  })),
                  { label: "Document de réception", url: detailsRequest.reception_document_url },
                  { label: "Document de restitution", url: detailsRequest.return_document_url },
                ]}
              />

              <Separator />

              {/* Historique */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Historique des opérations</h4>
                <ActivityTimeline 
                  resourceType="restoration" 
                  resourceId={detailsRequest.id} 
                  compact 
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
