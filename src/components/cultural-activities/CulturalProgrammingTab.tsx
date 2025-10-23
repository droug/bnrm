import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import { addBNRMHeader, addBNRMFooter } from "@/lib/pdfHeaderUtils";

interface CulturalProposal {
  id: string;
  proposal_number: string;
  requester_name: string;
  requester_email: string;
  activity_type: string;
  title: string;
  description: string;
  proposed_date: string;
  proposed_time: string;
  duration_hours: number;
  expected_attendees: number;
  space_requirements: string;
  equipment_needs: string;
  budget_estimate: number;
  status: string;
  committee_comments: string;
  committee_signature: string;
  signed_by: string;
  signed_at: string;
  reviewed_by: string;
  reviewed_at: string;
  validation_notes: string;
  created_at: string;
}

type SortField = 'proposal_number' | 'requester_name' | 'activity_type' | 'proposed_date' | 'status';
type SortOrder = 'asc' | 'desc';

export const CulturalProgrammingTab = () => {
  const [proposals, setProposals] = useState<CulturalProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<CulturalProposal | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [validateDialog, setValidateDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [committeeComments, setCommitteeComments] = useState("");
  const [committeeSignature, setCommitteeSignature] = useState("");
  const [validationNotes, setValidationNotes] = useState("");
  const [sortField, setSortField] = useState<SortField>('proposal_number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
  }, [sortField, sortOrder]);

  const fetchProposals = async () => {
    try {
      let query = supabase
        .from("cultural_program_proposals")
        .select("*");

      // Appliquer le tri
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propositions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleValidate = async () => {
    if (!selectedProposal) return;

    if (!committeeSignature.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez saisir votre signature",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("cultural_program_proposals")
        .update({
          status: "valide",
          committee_comments: committeeComments,
          committee_signature: committeeSignature,
          signed_by: user?.id,
          signed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          validation_notes: validationNotes,
        })
        .eq("id", selectedProposal.id);

      if (error) throw error;

      toast({
        title: "Proposition validée",
        description: "La proposition a été validée avec succès",
      });

      fetchProposals();
      closeDialogs();
    } catch (error) {
      console.error("Error validating proposal:", error);
      toast({
        title: "Erreur",
        description: "Impossible de valider la proposition",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedProposal || !validationNotes.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez indiquer le motif du rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("cultural_program_proposals")
        .update({
          status: "rejete",
          validation_notes: validationNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedProposal.id);

      if (error) throw error;

      toast({
        title: "Proposition rejetée",
        description: "La proposition a été rejetée",
      });

      fetchProposals();
      closeDialogs();
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la proposition",
        variant: "destructive",
      });
    }
  };

  const generateProposalPDF = async () => {
    if (!selectedProposal) return;

    const doc = new jsPDF();
    
    try {
      const startY = await addBNRMHeader(doc);
      let currentY = startY + 10;

      // Titre
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("FICHE DE PROPOSITION D'ACTIVITÉ CULTURELLE", 105, currentY, { align: 'center' });
      currentY += 15;

      // Numéro de proposition
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`N° de proposition : ${selectedProposal.proposal_number}`, 20, currentY);
      currentY += 7;
      doc.text(`Date de soumission : ${format(new Date(selectedProposal.created_at), 'dd/MM/yyyy', { locale: fr })}`, 20, currentY);
      currentY += 15;

      // Informations du demandeur
      doc.setFont("helvetica", "bold");
      doc.text("INFORMATIONS DU DEMANDEUR", 20, currentY);
      currentY += 7;
      
      doc.setFont("helvetica", "normal");
      doc.text(`Nom : ${selectedProposal.requester_name}`, 20, currentY);
      currentY += 7;
      doc.text(`Email : ${selectedProposal.requester_email}`, 20, currentY);
      currentY += 15;

      // Détails de l'activité
      doc.setFont("helvetica", "bold");
      doc.text("DÉTAILS DE L'ACTIVITÉ", 20, currentY);
      currentY += 7;
      
      doc.setFont("helvetica", "normal");
      doc.text(`Type : ${selectedProposal.activity_type}`, 20, currentY);
      currentY += 7;
      doc.text(`Titre : ${selectedProposal.title}`, 20, currentY);
      currentY += 7;
      
      if (selectedProposal.description) {
        doc.text("Description :", 20, currentY);
        currentY += 5;
        const descLines = doc.splitTextToSize(selectedProposal.description, 170);
        doc.text(descLines, 20, currentY);
        currentY += descLines.length * 7 + 5;
      }

      doc.text(`Date proposée : ${format(new Date(selectedProposal.proposed_date), 'dd/MM/yyyy', { locale: fr })}`, 20, currentY);
      currentY += 7;
      if (selectedProposal.proposed_time) {
        doc.text(`Heure : ${selectedProposal.proposed_time}`, 20, currentY);
        currentY += 7;
      }
      if (selectedProposal.duration_hours) {
        doc.text(`Durée : ${selectedProposal.duration_hours} heures`, 20, currentY);
        currentY += 7;
      }
      if (selectedProposal.expected_attendees) {
        doc.text(`Participants attendus : ${selectedProposal.expected_attendees}`, 20, currentY);
        currentY += 7;
      }
      currentY += 8;

      // Besoins logistiques
      if (selectedProposal.space_requirements || selectedProposal.equipment_needs) {
        doc.setFont("helvetica", "bold");
        doc.text("BESOINS LOGISTIQUES", 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "normal");
        
        if (selectedProposal.space_requirements) {
          doc.text("Espace : " + selectedProposal.space_requirements, 20, currentY);
          currentY += 7;
        }
        if (selectedProposal.equipment_needs) {
          doc.text("Équipement : " + selectedProposal.equipment_needs, 20, currentY);
          currentY += 7;
        }
        currentY += 8;
      }

      // Budget
      if (selectedProposal.budget_estimate) {
        doc.setFont("helvetica", "bold");
        doc.text("BUDGET ESTIMÉ", 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "normal");
        doc.text(`${selectedProposal.budget_estimate.toLocaleString('fr-MA')} MAD`, 20, currentY);
        currentY += 15;
      }

      // Commentaires du comité
      if (selectedProposal.committee_comments) {
        doc.setFont("helvetica", "bold");
        doc.text("AVIS DU COMITÉ", 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "normal");
        const commentLines = doc.splitTextToSize(selectedProposal.committee_comments, 170);
        doc.text(commentLines, 20, currentY);
        currentY += commentLines.length * 7 + 10;
      }

      // Signature
      if (selectedProposal.committee_signature) {
        doc.setFont("helvetica", "bold");
        doc.text("Signature du responsable DAC :", 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "italic");
        doc.text(selectedProposal.committee_signature, 20, currentY);
        currentY += 7;
        if (selectedProposal.signed_at) {
          doc.setFont("helvetica", "normal");
          doc.text(`Date : ${format(new Date(selectedProposal.signed_at), 'dd/MM/yyyy', { locale: fr })}`, 20, currentY);
        }
      }

      // Pied de page
      addBNRMFooter(doc, 1);

      // Télécharger
      doc.save(`Proposition_${selectedProposal.proposal_number.replace(/\//g, '_')}.pdf`);

      toast({
        title: "PDF généré",
        description: "La fiche de proposition a été téléchargée",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const closeDialogs = () => {
    setViewDialog(false);
    setValidateDialog(false);
    setRejectDialog(false);
    setSelectedProposal(null);
    setCommitteeComments("");
    setCommitteeSignature("");
    setValidationNotes("");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      valide: { label: "Validé", className: "bg-green-100 text-green-800" },
      rejete: { label: "Rejeté", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('proposal_number')}>
                    <div className="flex items-center gap-2">
                      N°
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('requester_name')}>
                    <div className="flex items-center gap-2">
                      Demandeur
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('activity_type')}>
                    <div className="flex items-center gap-2">
                      Type d'activité
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Titre</TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('proposed_date')}>
                    <div className="flex items-center gap-2">
                      Date proposée
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Statut
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune proposition de programmation culturelle
                    </TableCell>
                  </TableRow>
                ) : (
                  proposals.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {proposal.proposal_number}
                      </TableCell>
                      <TableCell>{proposal.requester_name}</TableCell>
                      <TableCell>{proposal.activity_type}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {proposal.title}
                      </TableCell>
                      <TableCell>
                        {format(new Date(proposal.proposed_date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {proposal.status === 'en_attente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setCommitteeComments(proposal.committee_comments || "");
                                  setValidateDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {proposal.status === 'valide' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProposal(proposal);
                                generateProposalPDF();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la proposition</DialogTitle>
            <DialogDescription>
              Proposition n° {selectedProposal?.proposal_number}
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Demandeur</Label>
                  <p>{selectedProposal.requester_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedProposal.requester_email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Type d'activité</Label>
                  <p>{selectedProposal.activity_type}</p>
                </div>
                <div>
                  <Label className="font-semibold">Date proposée</Label>
                  <p>{format(new Date(selectedProposal.proposed_date), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                {selectedProposal.proposed_time && (
                  <div>
                    <Label className="font-semibold">Heure</Label>
                    <p>{selectedProposal.proposed_time}</p>
                  </div>
                )}
                {selectedProposal.duration_hours && (
                  <div>
                    <Label className="font-semibold">Durée</Label>
                    <p>{selectedProposal.duration_hours} heures</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="font-semibold">Titre</Label>
                <p>{selectedProposal.title}</p>
              </div>

              {selectedProposal.description && (
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.description}</p>
                </div>
              )}

              {selectedProposal.expected_attendees && (
                <div>
                  <Label className="font-semibold">Participants attendus</Label>
                  <p>{selectedProposal.expected_attendees}</p>
                </div>
              )}

              {selectedProposal.space_requirements && (
                <div>
                  <Label className="font-semibold">Besoins en espace</Label>
                  <p>{selectedProposal.space_requirements}</p>
                </div>
              )}

              {selectedProposal.equipment_needs && (
                <div>
                  <Label className="font-semibold">Besoins en équipement</Label>
                  <p>{selectedProposal.equipment_needs}</p>
                </div>
              )}

              {selectedProposal.budget_estimate && (
                <div>
                  <Label className="font-semibold">Budget estimé</Label>
                  <p>{selectedProposal.budget_estimate.toLocaleString('fr-MA')} MAD</p>
                </div>
              )}

              {selectedProposal.committee_comments && (
                <div>
                  <Label className="font-semibold">Commentaires du comité</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.committee_comments}</p>
                </div>
              )}

              {selectedProposal.committee_signature && (
                <div>
                  <Label className="font-semibold">Signature</Label>
                  <p className="italic">{selectedProposal.committee_signature}</p>
                  {selectedProposal.signed_at && (
                    <p className="text-sm text-muted-foreground">
                      Signé le {format(new Date(selectedProposal.signed_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              )}

              {selectedProposal.validation_notes && (
                <div>
                  <Label className="font-semibold">Notes de validation</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.validation_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validate Dialog */}
      <Dialog open={validateDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Valider la proposition</DialogTitle>
            <DialogDescription>
              Proposition n° {selectedProposal?.proposal_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Commentaires du comité</Label>
              <Textarea
                value={committeeComments}
                onChange={(e) => setCommitteeComments(e.target.value)}
                placeholder="Avis et recommandations du comité..."
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Signature numérique du responsable DAC *</Label>
              <Input
                value={committeeSignature}
                onChange={(e) => setCommitteeSignature(e.target.value)}
                placeholder="Votre nom complet"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Notes de validation (optionnel)</Label>
              <Textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Annuler</Button>
            <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700">
              Valider la proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la proposition</DialogTitle>
            <DialogDescription>
              Proposition n° {selectedProposal?.proposal_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motif du rejet *</Label>
              <Textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Veuillez indiquer le motif du rejet..."
                rows={4}
                className="mt-2"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Annuler</Button>
            <Button onClick={handleReject} variant="destructive">
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};