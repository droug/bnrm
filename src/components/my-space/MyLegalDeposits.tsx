import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Clock, BookOpen, CheckCircle, AlertCircle, Edit, Eye, Award, XCircle, History, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface LegalDepositRequest {
  id: string;
  request_number: string;
  title: string;
  author_name: string | null;
  support_type: string;
  monograph_type?: string;
  status: string;
  created_at: string;
  submission_date: string | null;
  dl_number: string | null;
  rejection_reason?: string | null;
  validation_comments?: string | null;
  metadata?: any;
}

export function MyLegalDeposits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<LegalDepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<LegalDepositRequest | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [expandedDeposits, setExpandedDeposits] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedDeposits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      fetchDeposits();
    }
  }, [user]);

  const fetchDeposits = async () => {
    if (!user) return;

    try {
      // Chercher l'ID professionnel dans professional_registry OU professional_registration_requests
      let professionalId: string | null = null;

      // 1. Chercher dans professional_registry
      const { data: registryData } = await supabase
        .from('professional_registry')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (registryData) {
        professionalId = registryData.id;
        console.log('[MyLegalDeposits] Found in professional_registry:', professionalId);
      } else {
        // 2. Chercher dans professional_registration_requests (demandes approuvées)
        const { data: requestData } = await supabase
          .from('professional_registration_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        if (requestData) {
          professionalId = requestData.id;
          console.log('[MyLegalDeposits] Found in professional_registration_requests:', professionalId);
        }
      }

      // Fetch deposits as initiator (by professional ID or directly by user ID for admin-created drafts)
      let initiatorDeposits: LegalDepositRequest[] = [];
      const initiatorIds = new Set<string>();
      
      // Fetch by professional ID
      if (professionalId) {
        const { data, error } = await supabase
          .from('legal_deposit_requests')
          .select('*')
          .eq('initiator_id', professionalId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          initiatorDeposits = data;
          data.forEach(d => initiatorIds.add(d.id));
        }
      }

      // Also fetch deposits where initiator_id = user.id (admin or fallback drafts)
      if (user.id !== professionalId) {
        const { data: userIdDeposits } = await supabase
          .from('legal_deposit_requests')
          .select('*')
          .eq('initiator_id', user.id)
          .order('created_at', { ascending: false });

        if (userIdDeposits) {
          const newDeposits = userIdDeposits.filter(d => !initiatorIds.has(d.id));
          initiatorDeposits = [...initiatorDeposits, ...newDeposits];
          newDeposits.forEach(d => initiatorIds.add(d.id));
        }
      }

      // Fetch deposits where user is a party (e.g., printer, editor invited)
      const { data: partyData } = await supabase
        .from('legal_deposit_parties')
        .select('request_id')
        .eq('user_id', user.id);

      let partyDeposits: LegalDepositRequest[] = [];
      if (partyData && partyData.length > 0) {
        const partyRequestIds = partyData.map(p => p.request_id).filter(Boolean);
        // Exclude ones already fetched as initiator
        const uniquePartyIds = partyRequestIds.filter(id => !initiatorIds.has(id));

        if (uniquePartyIds.length > 0) {
          const { data: partyDepositsData, error: partyError } = await supabase
            .from('legal_deposit_requests')
            .select('*')
            .in('id', uniquePartyIds)
            .order('created_at', { ascending: false });

          if (!partyError && partyDepositsData) {
            partyDeposits = partyDepositsData;
          }
        }
      }

      const allDeposits = [...initiatorDeposits, ...partyDeposits]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('[MyLegalDeposits] Total deposits (initiator + party):', allDeposits.length);
      setDeposits(allDeposits);
    } catch (error) {
      console.error('Error fetching legal deposits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dépôts légaux",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      brouillon: { label: "Brouillon", variant: "outline", icon: <Edit className="h-3 w-3" /> },
      soumis: { label: "Soumis", variant: "default", icon: <Clock className="h-3 w-3" /> },
      en_attente_validation_b: { label: "En validation", variant: "default", icon: <Clock className="h-3 w-3" /> },
      valide_par_b: { label: "Validé", variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
      rejete_par_b: { label: "Rejeté", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      en_attente_comite_validation: { label: "En attente comité", variant: "default", icon: <Clock className="h-3 w-3" /> },
      valide_par_comite: { label: "Validé par comité", variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
      rejete_par_comite: { label: "Rejeté par comité", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      attribue: { label: "Numéro DL attribué", variant: "secondary", icon: <Award className="h-3 w-3" /> },
      rejete: { label: "Rejeté", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
      termine: { label: "Terminé", variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || { label: status, variant: "outline" as const, icon: null };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewDetails = (deposit: LegalDepositRequest) => {
    setSelectedDeposit(deposit);
    setShowDetailsSheet(true);
  };

  const handleEditDraft = (deposit: LegalDepositRequest) => {
    // Navigation vers le formulaire de dépôt légal avec l'ID du brouillon
    const depositType = deposit.metadata?.depositType || 'monographie';
    const routeMap: Record<string, string> = {
      'monographie': '/depot-legal/livres',
      'periodique': '/depot-legal/periodiques',
      'bd_logiciels': '/depot-legal/audiovisuel',
      'collections_specialisees': '/depot-legal/collections-specialisees'
    };
    const route = routeMap[depositType] || '/depot-legal/livres';
    navigate(`${route}?edit=${deposit.id}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dépôts légaux</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mes dépôts légaux</CardTitle>
          <CardDescription>
            Suivez l'état de vos demandes de dépôt légal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {deposits.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun dépôt légal pour le moment</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/')}
                >
                  Faire une demande de dépôt légal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <Card key={deposit.id} className={`hover:shadow-md transition-shadow ${deposit.status === 'brouillon' ? 'border-amber-400 bg-amber-50/50 border-2' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Bandeau brouillon */}
                        {deposit.status === 'brouillon' && (
                          <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Edit className="h-5 w-5 text-amber-700 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-amber-900">Brouillon en cours</p>
                                <p className="text-xs text-amber-700">Cette demande n'est pas encore soumise. Cliquez pour la compléter.</p>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleEditDraft(deposit)} className="flex-shrink-0">
                              <Edit className="h-4 w-4 mr-1" />
                              Terminer la demande
                            </Button>
                          </div>
                        )}
                        {/* En-tête avec titre et statut */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{deposit.title}</h3>
                            {deposit.author_name && (
                              <p className="text-sm text-muted-foreground">{deposit.author_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Demande N° {deposit.request_number}
                            </p>
                          </div>
                          {getStatusBadge(deposit.status)}
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {deposit.support_type || "Non spécifié"}
                            </Badge>
                            {deposit.metadata?.depositType && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {deposit.metadata.depositType === 'monographie' ? 'Livres' :
                                 deposit.metadata.depositType === 'periodique' ? 'Périodiques' :
                                 deposit.metadata.depositType === 'bd_logiciels' ? 'Audio-visuel & Logiciels' :
                                 deposit.metadata.depositType === 'collections_specialisees' ? 'Collections Spécialisées' :
                                 deposit.metadata.depositType}
                              </Badge>
                            )}
                            {deposit.dl_number && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                DL: {deposit.dl_number}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Créé le {formatDate(deposit.created_at)}
                          </span>
                          {deposit.submission_date && (
                            <span>
                              Soumis le {formatDate(deposit.submission_date)}
                            </span>
                          )}
                        </div>

                        {/* Numéro DL attribué */}
                        {deposit.status === 'attribue' && deposit.dl_number && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                            <div className="flex items-start gap-2">
                              <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-900 text-sm mb-1">
                                  Numéro de dépôt légal attribué
                                </h4>
                                <p className="text-sm text-green-800">
                                  Votre numéro DL: <span className="font-bold">{deposit.dl_number}</span>
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  Conservez précieusement ce numéro pour vos publications
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message de rejet */}
                        {(deposit.status === 'rejete_par_b' || deposit.status === 'rejete_par_comite' || deposit.status === 'rejete') && deposit.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-red-900 text-sm mb-1">
                                  Demande rejetée
                                </h4>
                                <p className="text-sm text-red-800">
                                  {deposit.rejection_reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Commentaires de validation */}
                        {deposit.validation_comments && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <div className="flex items-start gap-2">
                              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                                  Commentaires de validation
                                </h4>
                                <p className="text-sm text-blue-800">
                                  {deposit.validation_comments}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions selon le statut */}
                        <div className="flex gap-2 pt-2 border-t">
                          {deposit.status === 'brouillon' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                className="flex-1"
                                onClick={() => handleEditDraft(deposit)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Reprendre l'édition
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className={deposit.status === 'brouillon' ? '' : 'flex-1'}
                            onClick={() => handleViewDetails(deposit)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpand(deposit.id)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            {expandedDeposits.has(deposit.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Timeline des opérations */}
                        <Collapsible open={expandedDeposits.has(deposit.id)}>
                          <CollapsibleContent className="pt-3 mt-3 border-t">
                            <ActivityTimeline 
                              resourceType="legal_deposit" 
                              resourceId={deposit.id} 
                              compact 
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sheet latéral pour les détails */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails du dépôt légal</SheetTitle>
            <SheetDescription>
              Demande N° {selectedDeposit?.request_number}
            </SheetDescription>
          </SheetHeader>
          {selectedDeposit && (
            <div className="space-y-6 py-6">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Statut</span>
                {getStatusBadge(selectedDeposit.status)}
              </div>

              <Separator />

              {/* Informations générales */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Informations générales</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Titre</span>
                    <p className="font-medium">{selectedDeposit.title}</p>
                  </div>
                  {selectedDeposit.author_name && (
                    <div>
                      <span className="text-sm text-muted-foreground">Auteur</span>
                      <p className="font-medium">{selectedDeposit.author_name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Type de support</span>
                    <p className="font-medium">{selectedDeposit.support_type}</p>
                  </div>
                  {selectedDeposit.metadata?.depositType && (
                    <div>
                      <span className="text-sm text-muted-foreground">Type de dépôt</span>
                      <p className="font-medium">
                        {selectedDeposit.metadata.depositType === 'monographie' ? 'Livres' :
                         selectedDeposit.metadata.depositType === 'periodique' ? 'Périodiques' :
                         selectedDeposit.metadata.depositType === 'bd_logiciels' ? 'Audio-visuel & Logiciels' :
                         selectedDeposit.metadata.depositType === 'collections_specialisees' ? 'Collections Spécialisées' :
                         selectedDeposit.metadata.depositType}
                      </p>
                    </div>
                  )}
                  {selectedDeposit.dl_number && (
                    <div>
                      <span className="text-sm text-muted-foreground">Numéro DL</span>
                      <p className="font-medium text-lg">{selectedDeposit.dl_number}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Éditeur */}
              {selectedDeposit.metadata?.editor?.name && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">Éditeur</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Nom</span>
                        <p className="font-medium">{selectedDeposit.metadata.editor.name}</p>
                      </div>
                      {selectedDeposit.metadata.editor.email && (
                        <div>
                          <span className="text-sm text-muted-foreground">Email</span>
                          <p className="font-medium">{selectedDeposit.metadata.editor.email}</p>
                        </div>
                      )}
                      {selectedDeposit.metadata.editor.country && (
                        <div>
                          <span className="text-sm text-muted-foreground">Pays</span>
                          <p className="font-medium">{selectedDeposit.metadata.editor.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Imprimeur */}
              {selectedDeposit.metadata?.printer?.name && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">Imprimeur</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Nom</span>
                        <p className="font-medium">{selectedDeposit.metadata.printer.name}</p>
                      </div>
                      {selectedDeposit.metadata.printer.email && (
                        <div>
                          <span className="text-sm text-muted-foreground">Email</span>
                          <p className="font-medium">{selectedDeposit.metadata.printer.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Dates</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Date de création</span>
                    <p className="font-medium">{formatDate(selectedDeposit.created_at)}</p>
                  </div>
                  {selectedDeposit.submission_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Date de soumission</span>
                      <p className="font-medium">{formatDate(selectedDeposit.submission_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Numéro DL attribué */}
              {selectedDeposit.status === 'attribue' && selectedDeposit.dl_number && (
                <>
                  <Separator />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm mb-1">Numéro de dépôt légal attribué</h4>
                        <p className="text-sm text-green-800">
                          Votre numéro DL: <span className="font-bold">{selectedDeposit.dl_number}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Rejet */}
              {(selectedDeposit.status === 'rejete_par_b' || selectedDeposit.status === 'rejete_par_comite' || selectedDeposit.status === 'rejete') && selectedDeposit.rejection_reason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base text-destructive">Motif de rejet</h4>
                    <p className="text-sm bg-destructive/10 p-3 rounded">{selectedDeposit.rejection_reason}</p>
                  </div>
                </>
              )}

              {/* Commentaires */}
              {selectedDeposit.validation_comments && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Commentaires de validation</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedDeposit.validation_comments}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Historique */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Historique des opérations</h4>
                <ActivityTimeline 
                  resourceType="legal_deposit" 
                  resourceId={selectedDeposit.id} 
                  compact 
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
