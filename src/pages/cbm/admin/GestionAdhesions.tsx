import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, Database, Eye, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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
  const [selectedAdhesion, setSelectedAdhesion] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<"cbm_adhesions_catalogue" | "cbm_adhesions_reseau">("cbm_adhesions_catalogue");
  const [rejectionReason, setRejectionReason] = useState("");

  // Récupérer les demandes d'adhésion au catalogue
  const { data: catalogueAdhesions, refetch: refetchCatalogue } = useQuery({
    queryKey: ["cbm-adhesions-catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cbm_adhesions_catalogue")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Récupérer les demandes d'adhésion au réseau
  const { data: reseauAdhesions, refetch: refetchReseau } = useQuery({
    queryKey: ["cbm-adhesions-reseau"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cbm_adhesions_reseau")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

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
      // Mettre le statut en "en_validation" pour attendre la validation du comité
      const { error: updateError } = await supabase
        .from(table)
        .update({ statut: "en_validation" })
        .eq("id", id);

      if (updateError) throw updateError;

      // Notifier le comité de pilotage
      const { error: notifyError } = await supabase.functions.invoke('notify-steering-committee', {
        body: {
          adhesionId: id,
          table: table,
          type: table === "cbm_adhesions_catalogue" ? "catalogue" : "reseau"
        }
      });

      if (notifyError) {
        console.error('Erreur notification:', notifyError);
      }

      toast({
        title: "Demande envoyée en validation",
        description: "Le comité de pilotage a été notifié pour valider cette demande.",
      });

      if (table === "cbm_adhesions_catalogue") {
        refetchCatalogue();
      } else {
        refetchReseau();
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
          statut: "rejete",
          motif_refus: rejectionReason
        })
        .eq("id", selectedAdhesion.id);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée avec succès.",
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedAdhesion(null);

      if (selectedTable === "cbm_adhesions_catalogue") {
        refetchCatalogue();
      } else {
        refetchReseau();
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
      const { error } = await supabase
        .from(table)
        .update({ statut: "approuve" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Demande validée",
        description: "La demande a été approuvée par le comité de pilotage.",
      });

      if (table === "cbm_adhesions_catalogue") {
        refetchCatalogue();
      } else {
        refetchReseau();
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
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
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
              <div className="grid gap-6 md:grid-cols-2">
                {catalogueAdhesions.map((adhesion) => renderAdhesionCard(adhesion, "catalogue"))}
              </div>
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
              <div className="grid gap-6 md:grid-cols-2">
                {reseauAdhesions.map((adhesion) => renderAdhesionCard(adhesion, "reseau"))}
              </div>
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
    </div>
  );
}
