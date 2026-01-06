import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, Database, Eye, CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, Building, MapPin } from "lucide-react";
import { PaginationControls } from "@/components/manuscripts/PaginationControls";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function GestionAdhesions() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"catalogue" | "reseau">("catalogue");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAdhesion, setSelectedAdhesion] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<"cbm_adhesions_catalogue" | "cbm_adhesions_reseau">("cbm_adhesions_catalogue");
  const [rejectionReason, setRejectionReason] = useState("");
  
  // État local pour les modifications des adhésions
  const [localCatalogueData, setLocalCatalogueData] = useState<any[]>([]);
  const [localReseauData, setLocalReseauData] = useState<any[]>([]);
  
  // États pour la pagination
  const [cataloguePage, setCataloguePage] = useState(1);
  const [reseauPage, setReseauPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Récupérer les demandes d'adhésion au catalogue
  const { data: catalogueAdhesions, refetch: refetchCatalogue } = useQuery({
    queryKey: ["cbm-adhesions-catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbm_adhesions_catalogue')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des adhésions catalogue:', error);
        throw error;
      }
      
      setLocalCatalogueData(data || []);
      return data || [];
    }
  });

  // Récupérer les demandes d'adhésion au réseau
  const { data: reseauAdhesions, refetch: refetchReseau } = useQuery({
    queryKey: ["cbm-adhesions-reseau"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbm_adhesions_reseau')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des adhésions réseau:', error);
        throw error;
      }
      
      setLocalReseauData(data || []);
      return data || [];
    }
  });

  // Pagination pour le catalogue
  const paginatedCatalogueAdhesions = useMemo(() => {
    if (!catalogueAdhesions) return [];
    const startIndex = (cataloguePage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return catalogueAdhesions.slice(startIndex, endIndex);
  }, [catalogueAdhesions, cataloguePage, perPage]);

  // Pagination pour le réseau
  const paginatedReseauAdhesions = useMemo(() => {
    if (!reseauAdhesions) return [];
    const startIndex = (reseauPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return reseauAdhesions.slice(startIndex, endIndex);
  }, [reseauAdhesions, reseauPage, perPage]);

  const catalogueTotalPages = Math.ceil((catalogueAdhesions?.length || 0) / perPage);
  const reseauTotalPages = Math.ceil((reseauAdhesions?.length || 0) / perPage);

  const getStatusBadge = (statut: string) => {
    const statusMap = {
      en_attente: { label: "En attente", variant: "outline" as const, icon: Clock },
      en_validation: { label: "En validation", variant: "secondary" as const, icon: AlertCircle },
      approuve: { label: "Approuvé", variant: "default" as const, icon: CheckCircle },
      rejete: { label: "Rejeté", variant: "destructive" as const, icon: XCircle }
    };
    
    const status = statusMap[statut as keyof typeof statusMap] || statusMap.en_attente;
    const IconComponent = status.icon;
    
    return (
      <Badge variant={status.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {status.label}
      </Badge>
    );
  };

  const handleApprove = async (id: string, table: "cbm_adhesions_catalogue" | "cbm_adhesions_reseau") => {
    try {
      // Get adhesion data for email
      const { data: adhesionData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(table)
        .update({ statut: 'en_validation' })
        .eq('id', id);
      
      if (error) throw error;

      // Send email notification
      if (adhesionData?.email) {
        const requestType = table === "cbm_adhesions_catalogue" ? "cbm_adhesion_catalogue" : "cbm_adhesion_reseau";
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: requestType,
            request_id: id,
            notification_type: 'en_validation',
            recipient_email: adhesionData.email
          }
        });
      }

      toast({
        title: "Demande envoyée en validation",
        description: "Le comité de pilotage a été notifié pour valider cette demande.",
      });

      if (table === "cbm_adhesions_catalogue") {
        await refetchCatalogue();
      } else {
        await refetchReseau();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedAdhesion || !rejectionReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un motif de refus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(selectedTable)
        .update({ 
          statut: 'rejete',
          motif_refus: rejectionReason
        })
        .eq('id', selectedAdhesion.id);
      
      if (error) throw error;

      // Send email notification
      if (selectedAdhesion.email) {
        const requestType = selectedTable === "cbm_adhesions_catalogue" ? "cbm_adhesion_catalogue" : "cbm_adhesion_reseau";
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: requestType,
            request_id: selectedAdhesion.id,
            notification_type: 'rejected',
            recipient_email: selectedAdhesion.email,
            additional_data: { reason: rejectionReason }
          }
        });
      }

      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée avec succès.",
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedAdhesion(null);

      if (selectedTable === "cbm_adhesions_catalogue") {
        await refetchCatalogue();
      } else {
        await refetchReseau();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleValidateByCommittee = async (id: string, table: "cbm_adhesions_catalogue" | "cbm_adhesions_reseau") => {
    try {
      // Get adhesion data for email
      const { data: adhesionData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(table)
        .update({ statut: 'approuve' })
        .eq('id', id);
      
      if (error) throw error;

      // Send email notification
      if (adhesionData?.email) {
        const requestType = table === "cbm_adhesions_catalogue" ? "cbm_adhesion_catalogue" : "cbm_adhesion_reseau";
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: requestType,
            request_id: id,
            notification_type: 'approved',
            recipient_email: adhesionData.email
          }
        });
      }

      toast({
        title: "Demande validée",
        description: "La demande a été approuvée par le comité de pilotage.",
      });

      if (table === "cbm_adhesions_catalogue") {
        await refetchCatalogue();
      } else {
        await refetchReseau();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderAdhesionCard = (adhesion: any, type: "catalogue" | "reseau") => {
    const tableName: "cbm_adhesions_catalogue" | "cbm_adhesions_reseau" = 
      type === "catalogue" ? "cbm_adhesions_catalogue" : "cbm_adhesions_reseau";
    
    return (
      <Card key={adhesion.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{adhesion.nom_bibliotheque}</CardTitle>
              <CardDescription className="mt-1">
                {adhesion.type_bibliotheque} - {adhesion.tutelle}
              </CardDescription>
            </div>
            {getStatusBadge(adhesion.statut || "en_attente")}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Région</p>
              <p className="text-foreground">{adhesion.region}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Ville</p>
              <p className="text-foreground">{adhesion.ville}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{adhesion.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Téléphone</p>
              <p className="text-foreground">{adhesion.telephone}</p>
            </div>
            {type === "catalogue" && adhesion.sigb && (
              <div>
                <p className="font-medium text-muted-foreground">SIGB</p>
                <p className="text-foreground">{adhesion.sigb}</p>
              </div>
            )}
            {type === "reseau" && (
              <>
                <div>
                  <p className="font-medium text-muted-foreground">Recensement</p>
                  <p className="text-foreground">{adhesion.moyens_recensement}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Informatisation</p>
                  <p className="text-foreground">{adhesion.en_cours_informatisation}</p>
                </div>
              </>
            )}
            <div>
              <p className="font-medium text-muted-foreground">Nb Documents</p>
              <p className="text-foreground">{adhesion.nombre_documents?.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Date demande</p>
              <p className="text-foreground">
                {new Date(adhesion.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedAdhesion(adhesion);
                setSelectedTable(tableName);
                setShowDetailsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Détails
            </Button>
            {adhesion.statut === "en_attente" && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  className="flex-1"
                  onClick={() => handleApprove(adhesion.id, tableName)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedAdhesion(adhesion);
                    setSelectedTable(tableName);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </>
            )}
            {adhesion.statut === "en_validation" && (
              <Button 
                size="sm" 
                variant="default"
                className="flex-1"
                onClick={() => handleValidateByCommittee(adhesion.id, tableName)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider (Comité)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Gestion Demandes Adhérants
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Consulter et traiter les demandes d'adhésion
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-2 border-cbm-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adhésions Catalogue</CardTitle>
              <Database className="h-4 w-4 text-cbm-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{catalogueAdhesions?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {catalogueAdhesions?.filter(a => a.statut === "en_attente").length || 0} en attente
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cbm-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adhésions Réseau</CardTitle>
              <Users className="h-4 w-4 text-cbm-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reseauAdhesions?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {reseauAdhesions?.filter(a => a.statut === "en_attente").length || 0} en attente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="catalogue">Catalogue Collectif</TabsTrigger>
            <TabsTrigger value="reseau">Réseau Bibliothèques</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogue" className="space-y-6">
            {catalogueAdhesions && catalogueAdhesions.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginatedCatalogueAdhesions.map((adhesion) => renderAdhesionCard(adhesion, "catalogue"))}
                </div>
                <PaginationControls
                  currentPage={cataloguePage}
                  totalPages={catalogueTotalPages}
                  resultsPerPage={perPage}
                  totalResults={catalogueAdhesions.length}
                  onPageChange={setCataloguePage}
                  onResultsPerPageChange={(value) => {
                    setPerPage(value);
                    setCataloguePage(1);
                  }}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucune demande d'adhésion au catalogue collectif
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reseau" className="space-y-6">
            {reseauAdhesions && reseauAdhesions.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginatedReseauAdhesions.map((adhesion) => renderAdhesionCard(adhesion, "reseau"))}
                </div>
                <PaginationControls
                  currentPage={reseauPage}
                  totalPages={reseauTotalPages}
                  resultsPerPage={perPage}
                  totalResults={reseauAdhesions.length}
                  onPageChange={setReseauPage}
                  onResultsPerPageChange={(value) => {
                    setPerPage(value);
                    setReseauPage(1);
                  }}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucune demande d'adhésion au réseau des bibliothèques
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />

      {/* Dialog de refus */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande d'adhésion</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus. Cette information sera communiquée au demandeur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motif du refus</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Saisissez le motif du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason("");
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Détails de la demande d'adhésion</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdhesion && (
            <div className="space-y-6 py-4">
              {/* Statut */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-semibold">Statut actuel:</span>
                {getStatusBadge(selectedAdhesion.statut || "en_attente")}
              </div>

              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Building className="h-4 w-4" />
                      <span>Nom de la bibliothèque</span>
                    </div>
                    <p className="font-medium">{selectedAdhesion.nom_bibliotheque}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Type</p>
                    <p className="font-medium">{selectedAdhesion.type_bibliotheque}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Tutelle</p>
                    <p className="font-medium">{selectedAdhesion.tutelle}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Directeur</p>
                    <p className="font-medium">{selectedAdhesion.directeur || "Non renseigné"}</p>
                  </div>
                  {selectedAdhesion.adresse && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-muted-foreground text-sm">Adresse</p>
                      <p className="font-medium">{selectedAdhesion.adresse}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>Localisation</span>
                    </div>
                    <p className="font-medium">{selectedAdhesion.ville}, {selectedAdhesion.region}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-muted-foreground text-sm">Lien Google Maps</p>
                    {selectedAdhesion.url_maps ? (
                      <div className="space-y-1">
                        <a 
                          href={selectedAdhesion.url_maps} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          Ouvrir dans Google Maps
                        </a>
                        <p className="text-xs text-muted-foreground break-all">{selectedAdhesion.url_maps}</p>
                      </div>
                    ) : (
                      <p className="font-medium text-muted-foreground">Non renseigné</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordonnées et Personnes de contact */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Coordonnées et Personnes de contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{selectedAdhesion.email}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone</span>
                    </div>
                    <p className="font-medium">{selectedAdhesion.telephone}</p>
                  </div>
                  {selectedAdhesion.referent_technique && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Référent Technique</p>
                      <p className="font-medium">{selectedAdhesion.referent_technique}</p>
                    </div>
                  )}
                  {selectedAdhesion.responsable_catalogage && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Responsable Catalogage</p>
                      <p className="font-medium">{selectedAdhesion.responsable_catalogage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations spécifiques */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Informations spécifiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTable === "cbm_adhesions_catalogue" && (
                    <>
                      {selectedAdhesion.sigb && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-sm">SIGB utilisé</p>
                          <p className="font-medium">{selectedAdhesion.sigb}</p>
                        </div>
                      )}
                      {selectedAdhesion.normes_catalogage && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-sm">Normes de Catalogage</p>
                          <p className="font-medium">{selectedAdhesion.normes_catalogage}</p>
                        </div>
                      )}
                      {selectedAdhesion.url_catalogue && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-sm">URL du Catalogue</p>
                          <a 
                            href={selectedAdhesion.url_catalogue} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline break-all"
                          >
                            Accéder au catalogue
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {selectedTable === "cbm_adhesions_reseau" && (
                    <>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm">Moyens de recensement</p>
                        <p className="font-medium">{selectedAdhesion.moyens_recensement}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm">Informatisation</p>
                        <p className="font-medium">{selectedAdhesion.en_cours_informatisation}</p>
                      </div>
                    </>
                  )}
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Nombre de documents</p>
                    <p className="font-medium text-lg">{selectedAdhesion.nombre_documents?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Date de demande</p>
                    <p className="font-medium">
                      {new Date(selectedAdhesion.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engagements */}
              {selectedTable === "cbm_adhesions_catalogue" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Engagements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedAdhesion.engagement_charte ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="text-sm">Engagement à respecter la Charte du Réseau CBM</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAdhesion.engagement_partage_donnees ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="text-sm">Acceptation du partage des métadonnées bibliographiques</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nature Fond documentaire et Volumétrie */}
              {selectedTable === "cbm_adhesions_catalogue" && selectedAdhesion.volumetrie && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Nature Fond documentaire et Volumétrie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedAdhesion.volumetrie).map(([type, quantite]) => {
                      const qty = parseInt(quantite as string) || 0;
                      if (qty > 0) {
                        return (
                          <div key={type} className="space-y-1 p-3 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground text-sm">{type}</p>
                            <p className="font-medium text-lg">{qty.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">Total volumétrie</p>
                    <p className="font-semibold text-xl text-primary">
                      {Object.values(selectedAdhesion.volumetrie as Record<string, string>)
                        .reduce((sum: number, val: string) => sum + (parseInt(val) || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Motif de refus si rejeté */}
              {selectedAdhesion.statut === "rejete" && selectedAdhesion.motif_refus && (
                <div className="space-y-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h3 className="font-semibold text-destructive flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Motif du refus
                  </h3>
                  <p className="text-sm">{selectedAdhesion.motif_refus}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
