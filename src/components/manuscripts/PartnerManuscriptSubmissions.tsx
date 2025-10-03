import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Check, X, Eye } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

interface ManuscriptSubmission {
  id: string;
  collection_id: string | null;
  title: string;
  author: string | null;
  description: string | null;
  language: string;
  period: string | null;
  material: string | null;
  dimensions: string | null;
  inventory_number: string | null;
  submission_status: string;
  created_at: string;
  submitted_by: string;
  partner_collections?: {
    institution_name: string;
    institution_code: string;
  };
}

export function PartnerManuscriptSubmissions() {
  const [submissions, setSubmissions] = useState<ManuscriptSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ManuscriptSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_manuscript_submissions')
        .select(`
          *,
          partner_collections (
            institution_name,
            institution_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Erreur chargement soumissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les soumissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('partner_manuscript_submissions')
        .update({ submission_status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La soumission a été ${newStatus === 'approved' ? 'approuvée' : 'rejetée'}`,
      });

      loadSubmissions();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Soumissions de Manuscrits Partenaires
        </CardTitle>
        <CardDescription>
          Gérez les manuscrits soumis par les institutions partenaires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune soumission de manuscrit
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.title}</TableCell>
                  <TableCell>{submission.author || 'N/A'}</TableCell>
                  <TableCell>
                    {submission.partner_collections?.institution_name || 'N/A'}
                  </TableCell>
                  <TableCell>{submission.language}</TableCell>
                  <TableCell>{getStatusBadge(submission.submission_status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{submission.title}</DialogTitle>
                            <DialogDescription>
                              Détails de la soumission du manuscrit
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Titre</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.title}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Auteur</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.author || 'Non spécifié'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Langue</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.language}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Période</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.period || 'Non spécifiée'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Matériau</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.material || 'Non spécifié'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Dimensions</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.dimensions || 'Non spécifiées'}
                                </p>
                              </div>
                              {submission.inventory_number && (
                                <div>
                                  <label className="text-sm font-medium">N° Inventaire</label>
                                  <p className="text-sm text-muted-foreground">
                                    {submission.inventory_number}
                                  </p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium">Institution</label>
                                <p className="text-sm text-muted-foreground">
                                  {submission.partner_collections?.institution_name}
                                  {' '}
                                  <code className="text-xs bg-muted px-1 rounded">
                                    {submission.partner_collections?.institution_code}
                                  </code>
                                </p>
                              </div>
                            </div>
                            
                            {submission.description && (
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {submission.description}
                                </p>
                              </div>
                            )}
                            
                            {submission.submission_status === 'pending' && (
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                  className="flex-1"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approuver
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Rejeter
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {submission.submission_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(submission.id, 'approved')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                          >
                            <X className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}
