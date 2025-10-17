import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Building, 
  AlertCircle,
  Download,
  Mail,
  Calendar,
  BookOpen,
  Archive,
  UserPlus
} from "lucide-react";
import { AddPartyDialog } from "@/components/legal-deposit/AddPartyDialog";
import { PartiesListForRequest } from "@/components/legal-deposit/PartiesListForRequest";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LegalDepositRequest {
  id: string;
  request_number: string;
  title: string;
  author_name?: string;
  status: 'brouillon' | 'soumis' | 'en_attente_validation_b' | 'valide_par_b' | 'rejete_par_b' | 'en_cours' | 'attribue' | 'receptionne' | 'rejete' | 'en_attente_comite_validation' | 'valide_par_comite' | 'rejete_par_comite';
  support_type: 'imprime' | 'electronique';
  monograph_type: string;
  submission_date?: string;
  attribution_date?: string;
  dl_number?: string;
  isbn_assigned?: string;
  issn_assigned?: string;
  amazon_link?: string;
  requires_amazon_validation?: boolean;
  metadata?: any;
  initiator?: {
    company_name: string;
    professional_type: string;
    email: string;
  };
  collaborator?: {
    company_name: string;
    professional_type: string;
    email: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  brouillon: { label: "Brouillon", color: "bg-gray-500", icon: FileText },
  soumis: { label: "Soumis", color: "bg-blue-500", icon: Clock },
  en_attente_validation_b: { label: "En attente validation", color: "bg-yellow-500", icon: AlertCircle },
  valide_par_b: { label: "Validé par collaborateur", color: "bg-green-500", icon: CheckCircle },
  rejete_par_b: { label: "Rejeté par collaborateur", color: "bg-red-500", icon: XCircle },
  en_cours: { label: "En cours de traitement", color: "bg-blue-600", icon: Clock },
  attribue: { label: "Numéros attribués", color: "bg-green-600", icon: CheckCircle },
  receptionne: { label: "Réceptionné", color: "bg-green-700", icon: Archive },
  rejete: { label: "Rejeté", color: "bg-red-600", icon: XCircle }
};

export const LegalDepositBackoffice = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LegalDepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LegalDepositRequest | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    professional_type: "",
    support_type: "",
    date_from: "",
    date_to: ""
  });

  // Statistiques pour le tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    total_requests: 0,
    pending_validation: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchRequests();
    fetchDashboardStats();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('legal_deposit_requests')
        .select(`
          *,
          initiator:professional_registry!initiator_id (
            company_name,
            professional_type,
            email
          ),
          collaborator:professional_registry!collaborator_id (
            company_name,
            professional_type,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,request_number.ilike.%${filters.search}%,author_name.ilike.%${filters.search}%`);
      }
      
      if (filters.status && filters.status !== "all") {
        query = query.eq('status', filters.status as any);
      }
      
      if (filters.support_type && filters.support_type !== "all") {
        query = query.eq('support_type', filters.support_type as any);
      }

      // Filtre Amazon
      if (filters.professional_type === "amazon_only") {
        query = query.eq('requires_amazon_validation', true);
      }
      
      if (filters.date_from) {
        query = query.gte('submission_date', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('submission_date', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de dépôt légal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('status');

      if (error) throw error;

      const stats = {
        total_requests: data?.length || 0,
        pending_validation: data?.filter(r => r.status === 'en_attente_validation_b').length || 0,
        in_progress: data?.filter(r => ['en_cours', 'soumis'].includes(r.status)).length || 0,
        completed: data?.filter(r => ['attribue', 'receptionne'].includes(r.status)).length || 0,
        rejected: data?.filter(r => ['rejete', 'rejete_par_b'].includes(r.status)).length || 0
      };

      setDashboardStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, comments?: string) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({ 
          status: newStatus as any,
          ...(newStatus === 'attribue' && { attribution_date: new Date().toISOString() }),
          ...(newStatus === 'receptionne' && { reception_date: new Date().toISOString() })
        })
        .eq('id', requestId);

      if (error) throw error;

      // Enregistrer l'action dans le log d'activité
      await supabase
        .from('deposit_activity_log')
        .insert({
          request_id: requestId,
          user_id: user?.id,
          action_type: 'status_change',
          new_status: newStatus as any,
          details: { comments }
        });

      toast({
        title: "Statut mis à jour",
        description: `La demande a été mise à jour vers "${statusConfig[newStatus]?.label}"`,
      });

      fetchRequests();
      fetchDashboardStats();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const assignNumbers = async (requestId: string, numbers: { dl?: string; isbn?: string; issn?: string; ismn?: string }) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({
          ...numbers,
          status: 'attribue' as any,
          attribution_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Numéros attribués",
        description: "Les numéros ont été attribués avec succès",
      });

      fetchRequests();
      fetchDashboardStats();
    } catch (error) {
      console.error('Erreur lors de l\'attribution des numéros:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'attribuer les numéros",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion du Dépôt Légal</h1>
          <p className="text-muted-foreground">Backoffice conforme au CPS - Workflow de validation à 4 niveaux</p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Tableau de bord - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_requests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente validation</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pending_validation}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.in_progress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.support_type} 
              onValueChange={(value) => setFilters({ ...filters, support_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de support" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les supports</SelectItem>
                <SelectItem value="imprime">Imprimé</SelectItem>
                <SelectItem value="electronique">Électronique</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.professional_type} 
              onValueChange={(value) => setFilters({ ...filters, professional_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type professionnel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="amazon_only">Dépôts Amazon uniquement</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="Date début"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
            
            <Button 
              onClick={() => setFilters({ search: "", status: "all", professional_type: "", support_type: "all", date_from: "", date_to: "" })}
              variant="outline"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de dépôt légal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Demande</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Initiateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date soumission</TableHead>
                <TableHead>Numéros attribués</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Chargement des demandes...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune demande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {request.request_number}
                        {request.requires_amazon_validation && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                            🔗 Amazon
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        {request.author_name && (
                          <p className="text-sm text-muted-foreground">par {request.author_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.initiator?.company_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {request.initiator?.professional_type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="capitalize">
                          {request.support_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground capitalize">
                          {request.monograph_type.replace('_', ' ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${statusConfig[request.status]?.color} text-white`}
                      >
                        {statusConfig[request.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.submission_date ? 
                        new Date(request.submission_date).toLocaleDateString('fr-FR') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {request.dl_number && <Badge variant="secondary">DL: {request.dl_number}</Badge>}
                        {request.isbn_assigned && <Badge variant="secondary">ISBN: {request.isbn_assigned}</Badge>}
                        {request.issn_assigned && <Badge variant="secondary">ISSN: {request.issn_assigned}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Détails de la demande {request.request_number}</DialogTitle>
                            </DialogHeader>
                            {/* Contenu du détail de la demande - à développer */}
                            <RequestDetailsModal request={request} onUpdateStatus={updateRequestStatus} onAssignNumbers={assignNumbers} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour les détails de la demande
const RequestDetailsModal = ({ request, onUpdateStatus, onAssignNumbers }: {
  request: LegalDepositRequest;
  onUpdateStatus: (id: string, status: string, comments?: string) => void;
  onAssignNumbers: (id: string, numbers: any) => void;
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          {/* Amazon Link Display */}
          {request.requires_amazon_validation && request.amazon_link && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-700" />
                <h4 className="font-medium text-yellow-700">Dépôt Amazon - Validation manuelle requise</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Lien Amazon:</span>
                  <a 
                    href={request.amazon_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {request.amazon_link}
                    <Eye className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vérifiez que les informations (Titre, Auteur, ISBN) correspondent à la page Amazon fournie.
                </p>
                {request.metadata?.publisher && (
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="text-xs font-medium mb-1">Éditeur déclaré:</p>
                    <p className="text-sm">{request.metadata.publisher.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informations de base</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Titre:</strong> {request.title}</p>
                <p><strong>Auteur:</strong> {request.author_name || 'Non spécifié'}</p>
                <p><strong>Type de support:</strong> {request.support_type}</p>
                <p><strong>Type de publication:</strong> {request.monograph_type}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Initiateur</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Société:</strong> {request.initiator?.company_name}</p>
                <p><strong>Type:</strong> {request.initiator?.professional_type}</p>
                <p><strong>Email:</strong> {request.initiator?.email}</p>
              </div>
              
              {request.collaborator && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Collaborateur</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Société:</strong> {request.collaborator?.company_name}</p>
                    <p><strong>Type:</strong> {request.collaborator?.professional_type}</p>
                    <p><strong>Email:</strong> {request.collaborator?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Parties impliquées
            </h4>
            <PartiesListForRequest requestId={request.id} />
            <div className="mt-2">
              <AddPartyDialog requestId={request.id} onPartyAdded={() => {}} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="workflow">
          <WorkflowSteps requestId={request.id} currentStatus={request.status} onUpdateStatus={onUpdateStatus} />
        </TabsContent>
        
        <TabsContent value="documents">
          <p className="text-muted-foreground">Documents uploadés pour cette demande...</p>
        </TabsContent>
        
        <TabsContent value="actions">
          <NumberAssignmentForm requestId={request.id} onAssignNumbers={onAssignNumbers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composant placeholder pour les étapes de workflow
const WorkflowSteps = ({ requestId, currentStatus, onUpdateStatus }: {
  requestId: string;
  currentStatus: string;
  onUpdateStatus: (id: string, status: string, comments?: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Workflow de validation (4 gestionnaires)</h4>
      <p className="text-sm text-muted-foreground">
        Statut actuel: <Badge className={statusConfig[currentStatus]?.color}>{statusConfig[currentStatus]?.label}</Badge>
      </p>
      {/* Interface pour gérer les 4 étapes de validation - à développer */}
    </div>
  );
};

// Composant pour l'attribution des numéros
const NumberAssignmentForm = ({ requestId, onAssignNumbers }: {
  requestId: string;
  onAssignNumbers: (id: string, numbers: any) => void;
}) => {
  const [numbers, setNumbers] = useState({
    dl_number: '',
    isbn_assigned: '',
    issn_assigned: '',
    ismn_assigned: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignNumbers(requestId, numbers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-medium">Attribution des numéros</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Numéro DL</label>
          <Input
            value={numbers.dl_number}
            onChange={(e) => setNumbers({ ...numbers, dl_number: e.target.value })}
            placeholder="DL-2024-000001"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ISBN</label>
          <Input
            value={numbers.isbn_assigned}
            onChange={(e) => setNumbers({ ...numbers, isbn_assigned: e.target.value })}
            placeholder="978-9954-..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">ISSN</label>
          <Input
            value={numbers.issn_assigned}
            onChange={(e) => setNumbers({ ...numbers, issn_assigned: e.target.value })}
            placeholder="1234-5678"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ISMN</label>
          <Input
            value={numbers.ismn_assigned}
            onChange={(e) => setNumbers({ ...numbers, ismn_assigned: e.target.value })}
            placeholder="979-0-..."
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Attribuer les numéros
      </Button>
    </form>
  );
};

export default LegalDepositBackoffice;