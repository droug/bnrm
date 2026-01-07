import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, FileText, Eye, Edit, Archive, Trash2, FileDown, FileCheck, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';

interface ProfessionalRequest {
  id: string;
  user_id: string;
  professional_type: string;
  verified_deposit_number: string;
  company_name: string;
  status: string;
  created_at: string;
  invitation_id: string;
  cndp_acceptance: boolean;
  registration_data: any;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  verification_status: string;
}

interface ActivityLog {
  id: string;
  request_id: string;
  action_type: string;
  performed_by: string;
  created_at: string;
  details: any;
  user_email?: string;
}

export function ProfessionalRequestsManager() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ProfessionalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProfessionalRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    let query = supabase
      .from('professional_registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
        variant: 'destructive'
      });
      return;
    }

    setRequests(data || []);
  };

  const loadDocuments = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const { data, error } = await supabase
      .from('professional_registration_documents')
      .select('*')
      .eq('user_id', request.user_id);

    if (!error && data) {
      setDocuments(data);
    }
  };

  const loadActivityLogs = async (requestId: string) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        profiles!activity_logs_user_id_fkey(first_name, last_name)
      `)
      .eq('resource_id', requestId)
      .eq('resource_type', 'professional_request')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivityLogs(data as any);
    }
  };

  const logActivity = async (requestId: string, actionType: string, details: any = {}) => {
    await supabase.rpc('insert_activity_log', {
      p_action: actionType,
      p_resource_type: 'professional_request',
      p_resource_id: requestId,
      p_details: details
    });
  };

  const handleViewRequest = (request: ProfessionalRequest) => {
    setSelectedRequest(request);
    setObservations(request.registration_data?.observations || '');
    loadDocuments(request.id);
    loadActivityLogs(request.id);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setLoading(true);

    const { error } = await supabase.rpc('approve_professional_registration', {
      p_request_id: selectedRequest.id,
      p_role: selectedRequest.professional_type
    });

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      await logActivity(selectedRequest.id, 'approved', {
        professional_type: selectedRequest.professional_type,
        company_name: selectedRequest.company_name
      });

      // Récupérer l'email de l'utilisateur depuis le profil ou les données d'inscription
      const userEmail = selectedRequest.registration_data?.email || 
                       selectedRequest.registration_data?.contact_email;
      
       if (userEmail) {
         // Envoyer l'email de validation avec génération du lien de mot de passe
         const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
           body: {
             email_type: 'account_validated',
             recipient_email: userEmail,
             recipient_name: selectedRequest.registration_data?.contact_name || selectedRequest.company_name,
             user_type: selectedRequest.professional_type,
             user_id: selectedRequest.user_id
           }
         });

         if (emailError) {
           console.error("Erreur envoi email:", emailError);
           toast({
             title: 'Email non envoyé',
             description: `Impossible d'envoyer l'email à ${userEmail} : ${emailError.message || 'Erreur inconnue'}`,
             variant: 'destructive'
           });
         } else {
           toast({
             title: 'Email envoyé',
             description: 'Un email avec le lien de création de mot de passe a été envoyé',
             className: 'bg-blue-50 border-blue-200'
           });
         }
       } else {
         console.warn("Aucun email trouvé pour l'utilisateur");
         toast({
           title: 'Email manquant',
           description: "Aucune adresse email n'est associée à cette demande (email/contact_email).",
           variant: 'destructive'
         });
       }

      toast({
        title: 'Demande approuvée',
        description: 'Le compte professionnel a été créé avec succès',
        className: 'bg-green-50 border-green-200'
      });

      setSelectedRequest(null);
      loadRequests();
    }

    setLoading(false);
  };

  const handleOpenRejectionDialog = () => {
    setShowRejectionDialog(true);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir la raison du refus',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('professional_registration_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      await logActivity(selectedRequest.id, 'rejected', {
        rejection_reason: rejectionReason
      });

      // Envoyer l'email de rejet
      const userEmail = selectedRequest.registration_data?.email || 
                       selectedRequest.registration_data?.contact_email;
      
       if (userEmail) {
         const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
           body: {
             email_type: 'account_rejected',
             recipient_email: userEmail,
             recipient_name: selectedRequest.registration_data?.contact_name || selectedRequest.company_name,
             user_type: selectedRequest.professional_type,
             rejection_reason: rejectionReason
           }
         });

         if (emailError) {
           console.error("Erreur envoi email:", emailError);
           toast({
             title: 'Email non envoyé',
             description: `Impossible d'envoyer l'email à ${userEmail} : ${emailError.message || 'Erreur inconnue'}`,
             variant: 'destructive'
           });
         }
       } else {
         toast({
           title: 'Email manquant',
           description: "Aucune adresse email n'est associée à cette demande (email/contact_email).",
           variant: 'destructive'
         });
       }

      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée et le demandeur a été notifié',
        variant: 'destructive'
      });

      setShowRejectionDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
      loadRequests();
    }

    setLoading(false);
  };

  const handleArchive = async (requestId: string) => {
    const { error } = await supabase
      .from('professional_registration_requests')
      .update({ status: 'archived' })
      .eq('id', requestId);

    if (!error) {
      await logActivity(requestId, 'archived');
      toast({
        title: 'Demande archivée',
        description: 'La demande a été archivée avec succès',
        className: 'bg-slate-50 border-slate-200'
      });
      loadRequests();
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.')) {
      return;
    }

    const { error } = await supabase
      .from('professional_registration_requests')
      .delete()
      .eq('id', requestId);

    if (!error) {
      await logActivity(requestId, 'deleted');
      toast({
        title: 'Demande supprimée',
        description: 'La demande a été supprimée définitivement'
      });
      setSelectedRequest(null);
      loadRequests();
    }
  };

  const generatePDF = async (type: 'approval' | 'rejection' | 'receipt') => {
    if (!selectedRequest) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // En-tête officiel BNRM
    let yPos = await addBNRMHeader(doc);
    yPos += 5;

    // Corps du document
    doc.setTextColor(0, 0, 0);

    // Date et numéro
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`Réf: PROF-${selectedRequest.id.substring(0, 8).toUpperCase()}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 15;

    // Titre du document
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    if (type === 'approval') {
      doc.text('ATTESTATION D\'INSCRIPTION PROFESSIONNELLE', pageWidth / 2, yPos, { align: 'center' });
    } else if (type === 'rejection') {
      doc.text('NOTIFICATION DE REFUS', pageWidth / 2, yPos, { align: 'center' });
    } else {
      doc.text('ACCUSÉ DE RÉCEPTION', pageWidth / 2, yPos, { align: 'center' });
    }
    yPos += 15;

    // Ligne de séparation
    doc.setDrawColor(139, 27, 27);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // Contenu
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    if (type === 'approval') {
      doc.text('La Bibliothèque Nationale du Royaume du Maroc certifie que :', 20, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text(`Entreprise : ${selectedRequest.company_name}`, 25, yPos);
      yPos += 7;
      doc.text(`Type : ${getProfessionalTypeLabel(selectedRequest.professional_type)}`, 25, yPos);
      yPos += 7;
      doc.text(`Numéro de dépôt légal : ${selectedRequest.verified_deposit_number}`, 25, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      doc.text('a été dûment inscrite dans le registre des professionnels du livre', 20, yPos);
      yPos += 7;
      doc.text('et de la documentation au Maroc.', 20, yPos);
      yPos += 15;

      doc.text('Cette inscription lui permet de bénéficier des services dédiés', 20, yPos);
      yPos += 7;
      doc.text('aux professionnels de la chaîne du livre.', 20, yPos);
    } else if (type === 'rejection') {
      doc.text('Nous accusons réception de votre demande d\'inscription professionnelle.', 20, yPos);
      yPos += 10;

      doc.text('Après examen de votre dossier, nous regrettons de vous informer', 20, yPos);
      yPos += 7;
      doc.text('que votre demande n\'a pas pu être acceptée pour le motif suivant :', 20, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'italic');
      const splitText = doc.splitTextToSize(rejectionReason || 'Non spécifié', pageWidth - 50);
      doc.text(splitText, 25, yPos);
      yPos += splitText.length * 7 + 10;

      doc.setFont('helvetica', 'normal');
      doc.text('Vous pouvez soumettre une nouvelle demande après correction.', 20, yPos);
    } else {
      doc.text('La Bibliothèque Nationale du Royaume du Maroc accuse réception', 20, yPos);
      yPos += 7;
      doc.text('de votre demande d\'inscription professionnelle :', 20, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text(`Entreprise : ${selectedRequest.company_name}`, 25, yPos);
      yPos += 7;
      doc.text(`Type : ${getProfessionalTypeLabel(selectedRequest.professional_type)}`, 25, yPos);
      yPos += 7;
      doc.text(`Date de soumission : ${new Date(selectedRequest.created_at).toLocaleDateString('fr-FR')}`, 25, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      doc.text('Votre demande est en cours de traitement.', 20, yPos);
      yPos += 7;
      doc.text('Vous recevrez une notification dès que l\'examen sera terminé.', 20, yPos);
    }

    // Signature
    yPos = pageHeight - 60;
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur de la BNRM', pageWidth - 20, yPos, { align: 'right' });
    yPos += 20;
    doc.setFont('helvetica', 'italic');
    doc.text('(Signature et cachet)', pageWidth - 20, yPos, { align: 'right' });

    // Pied de page
    doc.setFillColor(139, 27, 27);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Document officiel - Bibliothèque Nationale du Royaume du Maroc', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Sauvegarder
    const filename = `BNRM_${type}_${selectedRequest.company_name.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);

    await logActivity(selectedRequest.id, 'document_generated', {
      document_type: type,
      filename
    });

    toast({
      title: 'Document généré',
      description: `Le document a été généré avec succès : ${filename}`,
      className: 'bg-blue-50 border-blue-200'
    });
  };

  const getProfessionalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      editor: 'Éditeur',
      printer: 'Imprimeur',
      producer: 'Producteur',
      distributor: 'Distributeur'
    };
    return labels[type] || type;
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      identity_card: 'Pièce d\'identité',
      professional_certificate: 'Justificatif professionnel',
      business_license: 'Registre de commerce',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'En attente' },
      approved: { variant: 'default', label: 'Validée' },
      rejected: { variant: 'destructive', label: 'Refusée' },
      in_progress: { variant: 'secondary', label: 'En cours' },
      archived: { variant: 'outline', label: 'Archivée' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion complète des demandes professionnelles</CardTitle>
              <CardDescription>
                Suivez, validez et gérez toutes les demandes des professionnels
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Toutes
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                En attente
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
              >
                Validées
              </Button>
              <Button
                variant={statusFilter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('archived')}
              >
                Archivées
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search field */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Demande</TableHead>
                  <TableHead>Nom du professionnel</TableHead>
                  <TableHead>Type de demande</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>N° Dépôt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const filteredRequests = requests.filter(request => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    const email = request.registration_data?.email?.toLowerCase() || '';
                    const contactEmail = request.registration_data?.contact_email?.toLowerCase() || '';
                    const contactName = request.registration_data?.contact_name?.toLowerCase() || '';
                    return (
                      request.company_name?.toLowerCase().includes(query) ||
                      request.professional_type?.toLowerCase().includes(query) ||
                      request.verified_deposit_number?.toLowerCase().includes(query) ||
                      email.includes(query) ||
                      contactEmail.includes(query) ||
                      contactName.includes(query)
                    );
                  });
                  
                  if (filteredRequests.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucune demande'}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">
                        {request.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">{request.company_name}</TableCell>
                      <TableCell>{getProfessionalTypeLabel(request.professional_type)}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="font-mono text-sm">{request.verified_deposit_number}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                            title="Consulter les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(request.id)}
                              title="Archiver"
                              className="text-slate-600 hover:text-slate-800"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la demande professionnelle</SheetTitle>
          </SheetHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="form-card">
                <h3 className="form-section-title">Identification de la demande</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">ID Demande</Label>
                    <p className="font-mono font-medium">{selectedRequest.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type de professionnel</Label>
                    <p className="font-medium">{getProfessionalTypeLabel(selectedRequest.professional_type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entreprise</Label>
                    <p className="font-medium">{selectedRequest.company_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Numéro de dépôt vérifié</Label>
                    <p className="font-mono">{selectedRequest.verified_deposit_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Acceptation CNDP</Label>
                    {selectedRequest.cndp_acceptance ? (
                      <Badge className="bg-green-100 text-green-800">✅ Accepté</Badge>
                    ) : (
                      <Badge variant="destructive">❌ Non accepté</Badge>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut actuel</Label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
              </div>

              {/* Documents fournis */}
              <div className="form-card">
                <h3 className="form-section-title">Documents fournis</h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        Voir
                      </Button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun document</p>
                  )}
                </div>
              </div>

              {/* Observations */}
              <div className="form-card">
                <h3 className="form-section-title">Observations</h3>
                <Textarea
                  placeholder="Notes internes, observations..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>


              {/* Historique d'activité */}
              <div className="form-card">
                <h3 className="form-section-title">Historique d'activité</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm p-2 border-l-2 border-primary/20 pl-3">
                      <div className="flex-1">
                        <p className="font-medium">{log.action_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun historique</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="form-card">
                <h3 className="form-section-title">Actions</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => setShowApprovalDialog(true)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Valider la demande
                      </Button>
                      <Button
                        onClick={handleOpenRejectionDialog}
                        disabled={loading || selectedRequest.status !== 'pending'}
                        className="bg-[#C62828] hover:bg-[#B71C1C] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Refuser la demande
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => generatePDF('receipt')}
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Accusé de réception
                  </Button>

                  {selectedRequest.status === 'approved' && (
                    <Button
                      onClick={() => generatePDF('approval')}
                      variant="outline"
                      className="border-green-200 hover:bg-green-50"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Attestation d'inscription
                    </Button>
                  )}

                  {selectedRequest.status === 'rejected' && (
                    <Button
                      onClick={() => generatePDF('rejection')}
                      variant="outline"
                      className="border-red-200 hover:bg-red-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Lettre de refus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Pop-up Raison du refus */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#C62828] flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Raison du refus de la demande
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Veuillez indiquer la raison du refus <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Saisissez la raison du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
              }}
              disabled={loading}
              className="bg-[#E0E0E0] hover:bg-[#BDBDBD] text-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              {loading ? 'Traitement...' : 'Confirmer le refus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pop-up Confirmation de validation */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Confirmer la validation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Êtes-vous sûr de vouloir valider la demande de <strong>{selectedRequest?.company_name}</strong> ?
              <br /><br />
              Un email de confirmation avec un lien de création de mot de passe sera envoyé à l'adresse : 
              <strong className="block mt-1">{selectedRequest?.registration_data?.email || selectedRequest?.registration_data?.contact_email || 'Non spécifié'}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowApprovalDialog(false);
                handleApprove();
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Traitement...' : 'Confirmer la validation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
