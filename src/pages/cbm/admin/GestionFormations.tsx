import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Eye, CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, Building, Users, FileText } from "lucide-react";
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

export default function GestionFormations() {
  const { toast } = useToast();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Récupérer les demandes de formation
  const { data: formations, refetch } = useQuery({
    queryKey: ["cbm-demandes-formation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbm_demandes_formation')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des demandes de formation:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Pagination
  const paginatedFormations = useMemo(() => {
    if (!formations) return [];
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return formations.slice(startIndex, endIndex);
  }, [formations, currentPage, perPage]);

  const totalPages = Math.ceil((formations?.length || 0) / perPage);

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

  const getFormationTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      formats_marc: "Formats MARC",
      catalogage: "Catalogage",
      indexation: "Indexation",
      gestion_sigb: "Gestion SIGB",
      services_numeriques: "Services numériques",
      autre: "Autre"
    };
    return typeMap[type] || type;
  };

  const handleApprove = async (id: string) => {
    try {
      // Get formation data for email
      const formation = formations?.find(f => f.id === id);

      const { error } = await supabase
        .from('cbm_demandes_formation')
        .update({ statut: 'en_validation' })
        .eq('id', id);
      
      if (error) throw error;

      // Send email notification
      if (formation?.email) {
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: 'cbm_formation',
            request_id: id,
            notification_type: 'en_validation',
            recipient_email: formation.email
          }
        });
      }

      toast({
        title: "Demande envoyée en validation",
        description: "Le comité de pilotage a été notifié pour valider cette demande.",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedFormation || !rejectionReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un motif de refus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cbm_demandes_formation')
        .update({ 
          statut: 'rejete'
        })
        .eq('id', selectedFormation.id);
      
      if (error) throw error;

      // Send email notification
      if (selectedFormation.email) {
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: 'cbm_formation',
            request_id: selectedFormation.id,
            notification_type: 'rejected',
            recipient_email: selectedFormation.email,
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
      setSelectedFormation(null);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleValidateByCommittee = async (id: string) => {
    try {
      // Get formation data for email
      const formation = formations?.find(f => f.id === id);

      const { error } = await supabase
        .from('cbm_demandes_formation')
        .update({ statut: 'approuve' })
        .eq('id', id);
      
      if (error) throw error;

      // Send email notification
      if (formation?.email) {
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            request_type: 'cbm_formation',
            request_id: id,
            notification_type: 'approved',
            recipient_email: formation.email
          }
        });
      }

      toast({
        title: "Demande validée",
        description: "La demande a été approuvée par le comité de pilotage.",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderFormationCard = (formation: any) => {
    return (
      <Card key={formation.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{formation.nom_organisme || "Non spécifié"}</CardTitle>
              <CardDescription className="mt-1">
                {getFormationTypeLabel(formation.type_formation)}
              </CardDescription>
            </div>
            {getStatusBadge(formation.statut || "en_attente")}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Contact</p>
              <p className="text-foreground">{formation.nom_contact}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Fonction</p>
              <p className="text-foreground">{formation.fonction_contact}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{formation.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Téléphone</p>
              <p className="text-foreground">{formation.telephone}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Participants</p>
              <p className="text-foreground">{formation.nombre_participants} personnes</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Date demande</p>
              <p className="text-foreground">
                {new Date(formation.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {formation.besoins_specifiques && (
            <div className="pt-2 border-t">
              <p className="font-medium text-muted-foreground text-sm">Besoins spécifiques</p>
              <p className="text-foreground text-sm mt-1">{formation.besoins_specifiques}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedFormation(formation);
                setShowDetailsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Détails
            </Button>
            {formation.statut === "en_attente" && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  className="flex-1"
                  onClick={() => handleApprove(formation.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedFormation(formation);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </>
            )}
            {formation.statut === "en_validation" && (
              <Button 
                size="sm" 
                variant="default"
                className="flex-1"
                onClick={() => handleValidateByCommittee(formation.id)}
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/90 to-accent flex items-center justify-center shadow-cbm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Gestion Demandes de Formation
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Consulter et traiter les demandes de formation
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
              <GraduationCap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formations?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Toutes demandes
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formations?.filter(f => f.statut === "en_attente").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                À traiter
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formations?.filter(f => f.statut === "approuve").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Validées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des demandes */}
        {formations && formations.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {paginatedFormations.map((formation) => renderFormationCard(formation))}
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              resultsPerPage={perPage}
              totalResults={formations.length}
              onPageChange={setCurrentPage}
              onResultsPerPageChange={(value) => {
                setPerPage(value);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune demande de formation
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />

      {/* Dialog de refus */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande de formation</DialogTitle>
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande de formation</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>
          {selectedFormation && (
            <div className="space-y-6 py-4">
              {/* Organisme */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations de l'organisme
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Nom</p>
                    <p className="text-foreground">{selectedFormation.nom_organisme || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Type</p>
                    <p className="text-foreground">{selectedFormation.type_organisme}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Nom</p>
                    <p className="text-foreground">{selectedFormation.nom_contact}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Fonction</p>
                    <p className="text-foreground">{selectedFormation.fonction_contact}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Email</p>
                    <p className="text-foreground">{selectedFormation.email}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-foreground">{selectedFormation.telephone}</p>
                  </div>
                </div>
              </div>

              {/* Formation */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formation
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Type</p>
                    <p className="text-foreground">{getFormationTypeLabel(selectedFormation.type_formation)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Nombre de participants</p>
                    <p className="text-foreground">{selectedFormation.nombre_participants} personnes</p>
                  </div>
                </div>
              </div>

              {/* Besoins spécifiques */}
              {selectedFormation.besoins_specifiques && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Besoins spécifiques
                  </h3>
                  <p className="text-sm text-foreground bg-muted p-4 rounded-md">
                    {selectedFormation.besoins_specifiques}
                  </p>
                </div>
              )}

              {/* Fichier participants */}
              {selectedFormation.fichier_participants_path && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Liste des participants
                  </h3>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.storage
                          .from('formations')
                          .download(selectedFormation.fichier_participants_path);
                        
                        if (error) throw error;
                        
                        // Créer un lien de téléchargement
                        const url = URL.createObjectURL(data);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedFormation.fichier_participants_path.split('/').pop() || 'participants.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast({
                          title: "Téléchargement réussi",
                          description: "Le fichier a été téléchargé avec succès.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Erreur",
                          description: error.message || "Impossible de télécharger le fichier",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Télécharger la liste
                  </Button>
                </div>
              )}

              {/* Statut et dates */}
              <div className="space-y-2 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Statut</p>
                    <div className="mt-1">{getStatusBadge(selectedFormation.statut)}</div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Date de demande</p>
                    <p className="text-foreground">
                      {new Date(selectedFormation.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
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
