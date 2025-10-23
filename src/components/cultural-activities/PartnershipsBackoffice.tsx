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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  FileText, 
  Eye,
  Mail,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import { addBNRMHeader, addBNRMFooter } from "@/lib/pdfHeaderUtils";

interface Partnership {
  id: string;
  nom_organisme: string;
  type_organisation: string;
  objet_partenariat: string;
  statut: string;
  created_at: string;
  email_officiel: string;
  telephone: string;
  description_projet: string;
  type_partenariat: string;
  date_debut: string;
  date_fin: string;
  objectifs: string;
  public_cible: string;
  moyens_organisme: string;
  moyens_bnrm: string;
  representants: any;
}

const PartnershipsBackoffice = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'request_info' | 'view' | null;
  }>({ open: false, type: null });
  const [rejectReason, setRejectReason] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPartnerships();
  }, [filterStatus]);

  const fetchPartnerships = async () => {
    try {
      let query = supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("statut", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartnerships(data || []);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de partenariat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPartnership) return;

    try {
      const { error } = await supabase
        .from("partnerships")
        .update({ 
          statut: "approuve",
          date_validation: new Date().toISOString()
        })
        .eq("id", selectedPartnership.id);

      if (error) throw error;

      toast({
        title: "Demande approuvée",
        description: "La demande de partenariat a été approuvée avec succès",
      });

      fetchPartnerships();
      closeDialog();
    } catch (error) {
      console.error("Error approving partnership:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPartnership || !rejectReason.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez indiquer le motif du rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("partnerships")
        .update({ 
          statut: "rejete",
          motif_rejet: rejectReason,
          date_rejet: new Date().toISOString()
        })
        .eq("id", selectedPartnership.id);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "La demande de partenariat a été rejetée",
      });

      fetchPartnerships();
      closeDialog();
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting partnership:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive",
      });
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedPartnership || !requestInfoMessage.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez saisir le message à envoyer",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("partnerships")
        .update({ 
          statut: "info_demandee",
          message_info: requestInfoMessage
        })
        .eq("id", selectedPartnership.id);

      if (error) throw error;

      // TODO: Envoyer un email à l'organisme
      
      toast({
        title: "Informations demandées",
        description: "Un email a été envoyé à l'organisme",
      });

      fetchPartnerships();
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
    if (!selectedPartnership) return;

    const doc = new jsPDF();
    
    try {
      // Ajouter l'en-tête BNRM
      const startY = await addBNRMHeader(doc);
      let currentY = startY + 10;

      // Titre du document
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const title = type === 'approval' 
        ? "LETTRE DE CONFIRMATION DE PARTENARIAT"
        : "LETTRE DE REJET DE DEMANDE DE PARTENARIAT";
      doc.text(title, 105, currentY, { align: 'center' });
      currentY += 15;

      // Date
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Rabat, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 20, currentY);
      currentY += 15;

      // Destinataire
      doc.setFont("helvetica", "bold");
      doc.text(`À l'attention de : ${selectedPartnership.nom_organisme}`, 20, currentY);
      currentY += 10;

      // Corps de la lettre
      doc.setFont("helvetica", "normal");
      doc.text("Madame, Monsieur,", 20, currentY);
      currentY += 10;

      const maxWidth = 170;
      
      if (type === 'approval') {
        const text1 = "Nous avons le plaisir de vous informer que votre demande de partenariat avec la Bibliothèque Nationale du Royaume du Maroc a été approuvée.";
        const lines1 = doc.splitTextToSize(text1, maxWidth);
        doc.text(lines1, 20, currentY);
        currentY += lines1.length * 7 + 10;

        // Détails du partenariat
        doc.setFont("helvetica", "bold");
        doc.text("Détails du partenariat :", 20, currentY);
        currentY += 7;
        
        doc.setFont("helvetica", "normal");
        doc.text(`• Organisme : ${selectedPartnership.nom_organisme}`, 20, currentY);
        currentY += 7;
        doc.text(`• Objet : ${selectedPartnership.objet_partenariat}`, 20, currentY);
        currentY += 7;
        doc.text(`• Type : ${selectedPartnership.type_partenariat}`, 20, currentY);
        currentY += 7;
        doc.text(`• Période : du ${format(new Date(selectedPartnership.date_debut), 'dd/MM/yyyy')} au ${format(new Date(selectedPartnership.date_fin), 'dd/MM/yyyy')}`, 20, currentY);
        currentY += 12;

        const text2 = "Nous vous contacterons prochainement pour finaliser les détails de notre collaboration et organiser une réunion de lancement.";
        const lines2 = doc.splitTextToSize(text2, maxWidth);
        doc.text(lines2, 20, currentY);
        currentY += lines2.length * 7;
      } else {
        const text1 = "Nous accusons réception de votre demande de partenariat. Après étude approfondie de votre dossier, nous sommes au regret de vous informer que nous ne pouvons donner suite à votre demande pour la raison suivante :";
        const lines1 = doc.splitTextToSize(text1, maxWidth);
        doc.text(lines1, 20, currentY);
        currentY += lines1.length * 7 + 10;

        doc.setFont("helvetica", "italic");
        const reasonLines = doc.splitTextToSize(rejectReason, maxWidth - 10);
        doc.text(reasonLines, 25, currentY);
        currentY += reasonLines.length * 7 + 10;

        doc.setFont("helvetica", "normal");
        const text2 = "Nous vous remercions de l'intérêt que vous portez à la Bibliothèque Nationale du Royaume du Maroc et restons ouverts à d'autres opportunités de collaboration.";
        const lines2 = doc.splitTextToSize(text2, maxWidth);
        doc.text(lines2, 20, currentY);
        currentY += lines2.length * 7;
      }

      currentY += 15;
      doc.text("Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.", 20, currentY);
      currentY += 15;

      // Signature
      doc.setFont("helvetica", "bold");
      doc.text("Le Directeur de la BNRM", 20, currentY);
      doc.text("Département des Activités Culturelles", 20, currentY + 7);

      // Pied de page
      addBNRMFooter(doc, 1);

      // Télécharger le PDF
      const fileName = `Lettre_${type === 'approval' ? 'Acceptation' : 'Refus'}_Partenariat_${selectedPartnership.nom_organisme.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      toast({
        title: "Lettre générée",
        description: "La lettre PDF a été téléchargée avec succès",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la lettre PDF",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedPartnership(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      approuve: { label: "Approuvé", className: "bg-green-100 text-green-800" },
      rejete: { label: "Rejeté", className: "bg-red-100 text-red-800" },
      info_demandee: { label: "Info demandée", className: "bg-blue-100 text-blue-800" },
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
              Gestion des partenariats
            </CardTitle>
            <CustomSelect
              value={filterStatus}
              onValueChange={setFilterStatus}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "en_attente", label: "En attente" },
                { value: "approuve", label: "Approuvé" },
                { value: "rejete", label: "Rejeté" },
                { value: "info_demandee", label: "Info demandée" },
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
                  <TableHead className="text-[#333333] font-semibold">Nom organisme</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Type</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Objet</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Statut</TableHead>
                  <TableHead className="text-[#333333] font-semibold">Date</TableHead>
                  <TableHead className="text-[#333333] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[#333333]/60 py-8">
                      Aucune demande de partenariat
                    </TableCell>
                  </TableRow>
                ) : (
                  partnerships.map((partnership) => (
                    <TableRow key={partnership.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                      <TableCell className="font-medium text-[#333333]">
                        {partnership.nom_organisme}
                      </TableCell>
                      <TableCell className="text-[#333333]/80">
                        {partnership.type_organisation}
                      </TableCell>
                      <TableCell className="text-[#333333]/80 max-w-[300px] truncate">
                        {partnership.objet_partenariat}
                      </TableCell>
                      <TableCell>{getStatusBadge(partnership.statut)}</TableCell>
                      <TableCell className="text-[#333333]/80">
                        {format(new Date(partnership.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-[#333333]/20 hover:bg-[#FAF9F5] transition-all duration-300"
                            onClick={() => {
                              setSelectedPartnership(partnership);
                              setActionDialog({ open: true, type: 'view' });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {partnership.statut === 'en_attente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300"
                                onClick={() => {
                                  setSelectedPartnership(partnership);
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
                                  setSelectedPartnership(partnership);
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
                                  setSelectedPartnership(partnership);
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
            <DialogTitle className="text-2xl text-[#333333]">Détails du partenariat</DialogTitle>
          </DialogHeader>
          {selectedPartnership && (
            <div className="space-y-4 text-[#333333]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#333333]/70">Nom de l'organisme</Label>
                  <p className="font-semibold">{selectedPartnership.nom_organisme}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Type d'organisation</Label>
                  <p className="font-semibold">{selectedPartnership.type_organisation}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Email</Label>
                  <p className="font-semibold">{selectedPartnership.email_officiel}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Téléphone</Label>
                  <p className="font-semibold">{selectedPartnership.telephone}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Objet du partenariat</Label>
                <p className="font-semibold">{selectedPartnership.objet_partenariat}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Description du projet</Label>
                <p className="text-sm">{selectedPartnership.description_projet}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#333333]/70">Type de partenariat</Label>
                  <p className="font-semibold">{selectedPartnership.type_partenariat}</p>
                </div>
                <div>
                  <Label className="text-[#333333]/70">Période</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedPartnership.date_debut), 'dd/MM/yyyy')} - {format(new Date(selectedPartnership.date_fin), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Objectifs</Label>
                <p className="text-sm">{selectedPartnership.objectifs}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Public cible</Label>
                <p className="text-sm">{selectedPartnership.public_cible}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Moyens de l'organisme</Label>
                <p className="text-sm">{selectedPartnership.moyens_organisme}</p>
              </div>
              
              <div>
                <Label className="text-[#333333]/70">Moyens demandés à la BNRM</Label>
                <p className="text-sm">{selectedPartnership.moyens_bnrm}</p>
              </div>

              {selectedPartnership.representants && selectedPartnership.representants.length > 0 && (
                <div>
                  <Label className="text-[#333333]/70 mb-2 block">Représentants</Label>
                  <div className="space-y-2">
                    {selectedPartnership.representants.map((rep: any, index: number) => (
                      <Card key={index} className="p-3 bg-[#FAF9F5] border-[#333333]/10">
                        <p className="font-semibold">{rep.nom_complet}</p>
                        <p className="text-sm text-[#333333]/70">{rep.fonction}</p>
                        <p className="text-sm text-[#333333]/70">{rep.email} | {rep.telephone}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'approve'} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Valider la demande</DialogTitle>
            <DialogDescription>
              Confirmez-vous l'approbation de cette demande de partenariat ?
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
              Valider
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
              Indiquez les informations que vous souhaitez obtenir de l'organisme.
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
              <Mail className="mr-2 h-4 w-4" />
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionDialog.open && actionDialog.type === 'reject'} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet de cette demande de partenariat.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du rejet..."
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
              Rejeter
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

export default PartnershipsBackoffice;
