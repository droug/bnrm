import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  Eye,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProgramContribution {
  id: string;
  nom_complet: string;
  type_activite: string;
  titre: string;
  statut: string;
  created_at: string;
  email: string;
  telephone: string;
  description: string;
  date_proposee: string;
  heure_proposee: string;
  duree_minutes: number;
  espace_souhaite: string;
  public_cible: string;
  langue: string;
  objectifs: string;
  numero_reference: string;
  commentaires_comite: string | null;
}

const ProgramContributionsBackoffice = () => {
  const [contributions, setContributions] = useState<ProgramContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<ProgramContribution | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'request_info' | 'view' | null;
  }>({ open: false, type: null });
  const [rejectReason, setRejectReason] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingComments, setEditingComments] = useState<string | null>(null);
  const [commentsText, setCommentsText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchContributions();
  }, [filterStatus]);

  const fetchContributions = async () => {
    try {
      let query = supabase
        .from("program_contributions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("statut", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propositions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComments = async (contributionId: string) => {
    const { error } = await supabase
      .from("program_contributions")
      .update({ commentaires_comite: commentsText })
      .eq("id", contributionId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les commentaires",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Commentaires sauvegardés",
      description: "Les commentaires du comité ont été mis à jour",
    });

    setEditingComments(null);
    fetchContributions();
  };

  const handleApprove = async () => {
    if (!selectedContribution) return;

    try {
      const { error } = await supabase
        .from("program_contributions")
        .update({ 
          statut: "acceptee",
          date_examen: new Date().toISOString()
        })
        .eq("id", selectedContribution.id);

      if (error) throw error;

      toast({
        title: "Proposition acceptée",
        description: "La proposition a été acceptée avec succès",
      });

      fetchContributions();
      closeDialog();
    } catch (error) {
      console.error("Error approving contribution:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la proposition",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedContribution || !rejectReason.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez indiquer le motif du refus",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("program_contributions")
        .update({ 
          statut: "rejetee",
          motif_refus: rejectReason,
          date_examen: new Date().toISOString()
        })
        .eq("id", selectedContribution.id);

      if (error) throw error;

      toast({
        title: "Proposition refusée",
        description: "La proposition a été refusée",
      });

      fetchContributions();
      closeDialog();
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting contribution:", error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser la proposition",
        variant: "destructive",
      });
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedContribution || !requestInfoMessage.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez saisir le message à envoyer",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("program_contributions")
        .update({ 
          statut: "info_demandee",
          message_info: requestInfoMessage
        })
        .eq("id", selectedContribution.id);

      if (error) throw error;

      toast({
        title: "Informations demandées",
        description: "Un email a été envoyé au demandeur",
      });

      fetchContributions();
      closeDialog();
      setRequestInfoMessage("");
    } catch (error) {
      console.error("Error requesting info:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'informations",
        variant: "destructive",
      });
    }
  };

  const generateLetter = async (type: 'approval' | 'rejection') => {
    if (!selectedContribution) return;

    const letterContent = type === 'approval'
      ? `LETTRE D'ACCEPTATION DE PROPOSITION D'ACTIVITÉ CULTURELLE\n\n` +
        `Date: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}\n\n` +
        `Madame, Monsieur ${selectedContribution.nom_complet},\n\n` +
        `Nous avons le plaisir de vous informer que votre proposition d'activité culturelle a été retenue.\n\n` +
        `Titre: ${selectedContribution.titre}\n` +
        `Type: ${selectedContribution.type_activite}\n` +
        `Date proposée: ${format(new Date(selectedContribution.date_proposee), 'dd/MM/yyyy', { locale: fr })}\n` +
        `Référence: ${selectedContribution.numero_reference}\n\n` +
        `Nous vous contacterons prochainement pour finaliser les détails organisationnels.\n\n` +
        `Cordialement,\n` +
        `Le Département des Activités Culturelles\n` +
        `Bibliothèque Nationale du Royaume du Maroc`
      : `LETTRE DE REFUS DE PROPOSITION D'ACTIVITÉ CULTURELLE\n\n` +
        `Date: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}\n\n` +
        `Madame, Monsieur ${selectedContribution.nom_complet},\n\n` +
        `Nous accusons réception de votre proposition d'activité intitulée "${selectedContribution.titre}".\n\n` +
        `Malheureusement, nous ne pouvons donner suite à votre demande pour la raison suivante:\n\n` +
        `${rejectReason}\n\n` +
        `Nous vous remercions de l'intérêt que vous portez à la programmation culturelle de la BNRM et vous encourageons à nous soumettre d'autres propositions.\n\n` +
        `Cordialement,\n` +
        `Le Département des Activités Culturelles\n` +
        `Bibliothèque Nationale du Royaume du Maroc`;

    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lettre_${type}_${selectedContribution.titre.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Lettre générée",
      description: "La lettre a été téléchargée avec succès",
    });
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedContribution(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      en_evaluation: { label: "En évaluation", className: "bg-blue-100 text-blue-800" },
      acceptee: { label: "Acceptée", className: "bg-green-100 text-green-800" },
      rejetee: { label: "Rejetée", className: "bg-red-100 text-red-800" },
      info_demandee: { label: "Info demandée", className: "bg-orange-100 text-orange-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Segoe_UI','Noto_Sans',sans-serif]">
      <Card className="rounded-2xl border-[#333333]/10 shadow-lg bg-white">
        <CardHeader className="border-b border-[#333333]/10 bg-gradient-to-r from-[#FAF9F5] to-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-[#333333]">
              Gestion des propositions de programmation
            </CardTitle>
            <CustomSelect
              value={filterStatus}
              onValueChange={setFilterStatus}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "en_attente", label: "En attente" },
                { value: "en_evaluation", label: "En évaluation" },
                { value: "acceptee", label: "Acceptée" },
                { value: "rejetee", label: "Rejetée" },
              ]}
              placeholder="Filtrer par statut"
              className="w-[200px]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl border border-[#333333]/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAF9F5]">
                  <TableHead className="text-[#333333] font-semibold">Demandeur</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Type</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Titre</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Date proposée</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Statut</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Commentaires</TableHead>
                  <TableHead className="text-[#333333] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[#333333]/60 py-8">
                      Aucune proposition de programmation
                    </TableCell>
                  </TableRow>
                ) : (
                  contributions.map((contribution) => (
                    <TableRow key={contribution.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                      <TableCell className="font-medium text-[#333333]">
                        {contribution.nom_complet}
                      </TableCell>
                      <TableCell className="text-[#333333]/80 capitalize">
                        {contribution.type_activite.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-[#333333]/80 max-w-[250px] truncate">
                        {contribution.titre}
                      </TableCell>
                      <TableCell className="text-[#333333]/80">
                        {format(new Date(contribution.date_proposee), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(contribution.statut)}</TableCell>
                      <TableCell>
                        {editingComments === contribution.id ? (
                          <div className="flex items-center gap-2">
                            <Textarea
                              value={commentsText}
                              onChange={(e) => setCommentsText(e.target.value)}
                              placeholder="Commentaires du comité..."
                              className="min-h-[60px] text-sm rounded-xl"
                            />
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveComments(contribution.id)}
                                className="shrink-0 rounded-xl"
                              >
                                Sauvegarder
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingComments(null)}
                                className="shrink-0 rounded-xl"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[#333333]/70 max-w-[150px] truncate">
                              {contribution.commentaires_comite || "Aucun commentaire"}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingComments(contribution.id);
                                setCommentsText(contribution.commentaires_comite || "");
                              }}
                              className="rounded-xl"
                            >
                              Éditer
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-[#333333]/20 hover:bg-[#FAF9F5] transition-all duration-300"
                            onClick={() => {
                              setSelectedContribution(contribution);
                              setActionDialog({ open: true, type: 'view' });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {contribution.statut === 'en_attente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300"
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setActionDialog({ open: true, type: 'approve' });
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setActionDialog({ open: true, type: 'request_info' });
                                }}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setActionDialog({ open: true, type: 'reject' });
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'view'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#333333]">Détails de la proposition</DialogTitle>
          </DialogHeader>
          {selectedContribution && (
            <div className="space-y-4 text-[#333333]">
              <div className="bg-[#D4AF37]/10 p-4 rounded-xl text-center">
                <p className="text-sm text-[#333333]/70">Référence</p>
                <p className="text-lg font-bold text-[#D4AF37]">{selectedContribution.numero_reference}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#333333]/70">Demandeur</Label>
                  <p className="font-semibold">{selectedContribution.nom_complet}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Email</Label>
                  <p className="font-semibold">{selectedContribution.email}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Téléphone</Label>
                  <p className="font-semibold">{selectedContribution.telephone}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Type d'activité</Label>
                  <p className="font-semibold capitalize">{selectedContribution.type_activite.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Titre de l'activité</Label>
                <p className="font-semibold text-lg">{selectedContribution.titre}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedContribution.description}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Objectifs</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedContribution.objectifs}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#333333]/70">Public cible</Label>
                  <p className="font-semibold capitalize">{selectedContribution.public_cible.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Langue</Label>
                  <p className="font-semibold capitalize">{selectedContribution.langue}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Date proposée</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedContribution.date_proposee), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Heure</Label>
                  <p className="font-semibold">{selectedContribution.heure_proposee}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Durée</Label>
                  <p className="font-semibold">{selectedContribution.duree_minutes} minutes</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Espace souhaité</Label>
                  <p className="font-semibold capitalize">{selectedContribution.espace_souhaite.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'approve'} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Accepter la proposition</DialogTitle>
            <DialogDescription>
              Confirmez-vous l'acceptation de cette proposition d'activité ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="rounded-xl border-[#333333]/20"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accepter
            </Button>
            <Button 
              variant="outline"
              onClick={() => generateLetter('approval')}
              className="rounded-xl border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Générer lettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'request_info'} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Demander des informations complémentaires</DialogTitle>
            <DialogDescription>
              Indiquez les informations que vous souhaitez obtenir du demandeur.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={requestInfoMessage}
            onChange={(e) => setRequestInfoMessage(e.target.value)}
            placeholder="Veuillez préciser..."
            className="min-h-[150px] rounded-xl border-[#333333]/20"
          />
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="rounded-xl border-[#333333]/20"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleRequestInfo}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Info className="mr-2 h-4 w-4" />
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'reject'} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Refuser la proposition</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus de cette proposition.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du refus..."
            className="min-h-[150px] rounded-xl border-[#333333]/20"
          />
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="rounded-xl border-[#333333]/20"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Refuser
            </Button>
            <Button 
              variant="outline"
              onClick={() => generateLetter('rejection')}
              className="rounded-xl border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              disabled={!rejectReason.trim()}
            >
              <Download className="mr-2 h-4 w-4" />
              Générer lettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramContributionsBackoffice;
