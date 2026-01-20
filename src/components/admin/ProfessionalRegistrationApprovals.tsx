import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, FileText, Eye } from 'lucide-react';

interface RegistrationRequest {
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
}

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  verification_status: string;
}

export function ProfessionalRegistrationApprovals() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('professional_registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

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
    const { data, error } = await supabase
      .from('professional_registration_documents')
      .select('*')
      .eq('user_id', requests.find(r => r.id === requestId)?.user_id || '');

    if (!error && data) {
      setDocuments(data);
    }
  };

  const handleViewRequest = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    loadDocuments(request.id);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('approve-professional', {
        body: {
          request_id: selectedRequest.id,
          professional_type: selectedRequest.professional_type
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'Demande approuvée',
          description: 'Le compte professionnel a été créé et un email de notification a été envoyé'
        });
        setSelectedRequest(null);
        loadRequests();
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'approuver la demande',
        variant: 'destructive'
      });
    }

    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) {
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
      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée'
      });
      setSelectedRequest(null);
      setRejectionReason('');
      loadRequests();
    }

    setLoading(false);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validation des inscriptions professionnelles</CardTitle>
          <CardDescription>
            Approuvez ou rejetez les demandes de création de compte professionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>N° Dépôt</TableHead>
                  <TableHead>CNDP</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucune demande en attente
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{getProfessionalTypeLabel(request.professional_type)}</TableCell>
                      <TableCell className="font-medium">{request.company_name}</TableCell>
                      <TableCell className="font-mono text-sm">{request.verified_deposit_number}</TableCell>
                      <TableCell>
                        {request.cndp_acceptance ? (
                          <Badge variant="secondary">Accepté</Badge>
                        ) : (
                          <Badge variant="destructive">Non accepté</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Examiner
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la demande</SheetTitle>
          </SheetHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <p>{selectedRequest.cndp_acceptance ? '✅ Accepté' : '❌ Non accepté'}</p>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Documents fournis</Label>
                <div className="mt-2 space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
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

              <div className="space-y-2">
                <Label htmlFor="rejection">Raison du refus (si applicable)</Label>
                <Textarea
                  id="rejection"
                  placeholder="Saisissez la raison du refus..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading || !rejectionReason}
                  className="flex-1"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
