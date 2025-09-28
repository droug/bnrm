import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Download, 
  Send,
  UserCheck,
  Edit,
  Filter,
  Plus,
  BookOpen,
  Newspaper,
  Database,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DepositRequest {
  id: string;
  deposit_number?: string;
  submitter_id: string;
  deposit_type: 'monographie' | 'periodique' | 'audiovisuel' | 'numerique';
  status: 'submitted' | 'validated' | 'rejected' | 'processed' | 'acknowledged';
  submission_date: string;
  acknowledgment_date?: string;
  metadata: {
    declarant?: {
      name: string;
      type: 'editeur' | 'imprimeur' | 'auteur';
      organization: string;
      address: string;
      phone: string;
      email: string;
    };
    publication?: {
      title: string;
      author: string;
      isbn_issn?: string;
      publication_date: string;
      language: string;
      pages: number;
      format: string;
      edition: string;
    };
    validation?: {
      validator_id?: string;
      validation_date?: string;
      comments?: string;
      rejection_reason?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

interface DepositForm {
  deposit_type: 'monographie' | 'periodique' | 'audiovisuel' | 'numerique';
  declarant: {
    name: string;
    type: 'editeur' | 'imprimeur' | 'auteur';
    organization: string;
    address: string;
    phone: string;
    email: string;
  };
  publication: {
    title: string;
    author: string;
    isbn_issn?: string;
    publication_date: string;
    language: string;
    pages: number;
    format: string;
    edition: string;
  };
  documents: string[];
}

export const BNRMRequestManager = () => {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState<DepositForm>({
    deposit_type: 'monographie',
    declarant: {
      name: '',
      type: 'editeur',
      organization: '',
      address: '',
      phone: '',
      email: ''
    },
    publication: {
      title: '',
      author: '',
      isbn_issn: '',
      publication_date: '',
      language: 'fr',
      pages: 0,
      format: '',
      edition: ''
    },
    documents: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data as DepositRequest[] || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewRequest = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposits")
        .insert([{
          deposit_type: newRequestForm.deposit_type,
          status: 'submitted',
          submitter_id: (await supabase.auth.getUser()).data.user?.id,
          content_id: crypto.randomUUID(),
          metadata: {
            declarant: newRequestForm.declarant,
            publication: newRequestForm.publication,
            documents: newRequestForm.documents
          }
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchRequests();
      setIsNewRequestOpen(false);
      setNewRequestForm({
        deposit_type: 'monographie',
        declarant: {
          name: '',
          type: 'editeur',
          organization: '',
          address: '',
          phone: '',
          email: ''
        },
        publication: {
          title: '',
          author: '',
          isbn_issn: '',
          publication_date: '',
          language: 'fr',
          pages: 0,
          format: '',
          edition: ''
        },
        documents: []
      });
      
      toast({
        title: "Succès",
        description: "Nouvelle demande créée avec succès",
      });
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, comments?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'acknowledged') {
        updateData.acknowledgment_date = new Date().toISOString();
      }

      // Add validation metadata
      if (comments || newStatus === 'validated' || newStatus === 'rejected') {
        const currentRequest = requests.find(r => r.id === requestId);
        updateData.metadata = {
          ...currentRequest?.metadata,
          validation: {
            validator_id: (await supabase.auth.getUser()).data.user?.id,
            validation_date: new Date().toISOString(),
            comments: comments,
            rejection_reason: newStatus === 'rejected' ? comments : undefined
          }
        };
      }

      const { error } = await supabase
        .from("legal_deposits")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      await fetchRequests();
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      validated: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: CheckCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      acknowledged: { color: "bg-purple-100 text-purple-800", label: "Accusé", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDepositTypeIcon = (type: string) => {
    switch (type) {
      case 'monographie': return BookOpen;
      case 'periodique': return Newspaper;
      case 'audiovisuel': return Database;
      case 'numerique': return Archive;
      default: return FileText;
    }
  };

  const getDepositTypeLabel = (type: string) => {
    const labels = {
      monographie: 'Monographie',
      periodique: 'Périodique',
      audiovisuel: 'Audiovisuel',
      numerique: 'Numérique'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.metadata?.publication?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.metadata?.declarant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.deposit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.deposit_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Demandes de Dépôt Légal</h2>
          <p className="text-muted-foreground">
            Gérer les demandes de dépôt légal selon les types de supports
          </p>
        </div>
        
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle demande de dépôt légal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Type de dépôt */}
              <div className="space-y-2">
                <Label htmlFor="deposit_type">Type de support</Label>
                <Select 
                  value={newRequestForm.deposit_type} 
                  onValueChange={(value: any) => setNewRequestForm(prev => ({ ...prev, deposit_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monographie">Monographie</SelectItem>
                    <SelectItem value="periodique">Périodique</SelectItem>
                    <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                    <SelectItem value="numerique">Numérique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informations du déclarant */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations du déclarant</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="declarant_name">Nom complet</Label>
                    <Input
                      id="declarant_name"
                      value={newRequestForm.declarant.name}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, name: e.target.value }
                      }))}
                      placeholder="Nom du déclarant"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="declarant_type">Qualité</Label>
                    <Select 
                      value={newRequestForm.declarant.type} 
                      onValueChange={(value: any) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editeur">Éditeur</SelectItem>
                        <SelectItem value="imprimeur">Imprimeur</SelectItem>
                        <SelectItem value="auteur">Auteur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organisation</Label>
                    <Input
                      id="organization"
                      value={newRequestForm.declarant.organization}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, organization: e.target.value }
                      }))}
                      placeholder="Nom de l'organisation"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newRequestForm.declarant.phone}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, phone: e.target.value }
                      }))}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRequestForm.declarant.email}
                    onChange={(e) => setNewRequestForm(prev => ({
                      ...prev,
                      declarant: { ...prev.declarant, email: e.target.value }
                    }))}
                    placeholder="Adresse email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea
                    id="address"
                    value={newRequestForm.declarant.address}
                    onChange={(e) => setNewRequestForm(prev => ({
                      ...prev,
                      declarant: { ...prev.declarant, address: e.target.value }
                    }))}
                    placeholder="Adresse complète du déclarant"
                    rows={3}
                  />
                </div>
              </div>

              {/* Informations de la publication */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de la publication</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publication_title">Titre de la publication</Label>
                    <Input
                      id="publication_title"
                      value={newRequestForm.publication.title}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, title: e.target.value }
                      }))}
                      placeholder="Titre complet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Auteur</Label>
                    <Input
                      id="author"
                      value={newRequestForm.publication.author}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, author: e.target.value }
                      }))}
                      placeholder="Nom de l'auteur"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn_issn">ISBN/ISSN (si disponible)</Label>
                    <Input
                      id="isbn_issn"
                      value={newRequestForm.publication.isbn_issn}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, isbn_issn: e.target.value }
                      }))}
                      placeholder="ISBN ou ISSN"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="publication_date">Date de publication</Label>
                    <Input
                      id="publication_date"
                      type="date"
                      value={newRequestForm.publication.publication_date}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, publication_date: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select 
                      value={newRequestForm.publication.language} 
                      onValueChange={(value) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, language: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">Arabe</SelectItem>
                        <SelectItem value="ber">Amazigh</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pages">Nombre de pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={newRequestForm.publication.pages}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, pages: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="Nombre de pages"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input
                      id="format"
                      value={newRequestForm.publication.format}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, format: e.target.value }
                      }))}
                      placeholder="Format (ex: 21x29.7cm)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edition">Édition</Label>
                    <Input
                      id="edition"
                      value={newRequestForm.publication.edition}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, edition: e.target.value }
                      }))}
                      placeholder="Numéro d'édition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createNewRequest}>
                  <Send className="w-4 h-4 mr-2" />
                  Créer la demande
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, déclarant ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="submitted">Soumis</SelectItem>
            <SelectItem value="validated">Validé</SelectItem>
            <SelectItem value="processed">Traité</SelectItem>
            <SelectItem value="acknowledged">Accusé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="monographie">Monographie</SelectItem>
            <SelectItem value="periodique">Périodique</SelectItem>
            <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
            <SelectItem value="numerique">Numérique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des demandes ({filteredRequests.length})</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Dépôt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Déclarant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const TypeIcon = getDepositTypeIcon(request.deposit_type);
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.deposit_number || "En attente"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{getDepositTypeLabel(request.deposit_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.metadata?.publication?.title || "Sans titre"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.metadata?.declarant?.name || "Non spécifié"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.metadata?.declarant?.organization}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.submission_date), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {request.status === 'submitted' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'validated')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'rejected', 'Demande incomplète')}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la demande - {selectedRequest?.deposit_number || "N° en attente"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informations du déclarant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Nom:</strong> {selectedRequest.metadata?.declarant?.name}
                      </div>
                      <div>
                        <strong>Qualité:</strong> {selectedRequest.metadata?.declarant?.type}
                      </div>
                      <div>
                        <strong>Organisation:</strong> {selectedRequest.metadata?.declarant?.organization}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedRequest.metadata?.declarant?.email}
                      </div>
                      <div>
                        <strong>Téléphone:</strong> {selectedRequest.metadata?.declarant?.phone}
                      </div>
                      <div>
                        <strong>Adresse:</strong> {selectedRequest.metadata?.declarant?.address}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informations de la publication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Titre:</strong> {selectedRequest.metadata?.publication?.title}
                      </div>
                      <div>
                        <strong>Auteur:</strong> {selectedRequest.metadata?.publication?.author}
                      </div>
                      <div>
                        <strong>ISBN/ISSN:</strong> {selectedRequest.metadata?.publication?.isbn_issn || "Non attribué"}
                      </div>
                      <div>
                        <strong>Date de publication:</strong> {selectedRequest.metadata?.publication?.publication_date}
                      </div>
                      <div>
                        <strong>Langue:</strong> {selectedRequest.metadata?.publication?.language}
                      </div>
                      <div>
                        <strong>Pages:</strong> {selectedRequest.metadata?.publication?.pages}
                      </div>
                      <div>
                        <strong>Format:</strong> {selectedRequest.metadata?.publication?.format}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="validation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Statut de validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Statut actuel:</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    
                    {selectedRequest.metadata?.validation && (
                      <div className="space-y-2">
                        <div>
                          <strong>Validé le:</strong> {selectedRequest.metadata.validation.validation_date && format(new Date(selectedRequest.metadata.validation.validation_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </div>
                        {selectedRequest.metadata.validation.comments && (
                          <div>
                            <strong>Commentaires:</strong> {selectedRequest.metadata.validation.comments}
                          </div>
                        )}
                        {selectedRequest.metadata.validation.rejection_reason && (
                          <div>
                            <strong>Raison du rejet:</strong> {selectedRequest.metadata.validation.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedRequest.status === 'submitted' && (
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Actions de validation</h4>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, 'validated');
                              setIsDetailsOpen(false);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valider la demande
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, 'rejected', 'Demande incomplète');
                              setIsDetailsOpen(false);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeter la demande
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="workflow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progression du workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Demande soumise</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(selectedRequest.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'validated' || selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'validated' || selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'validated' || selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Validation de la demande</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedRequest.metadata?.validation?.validation_date ? 
                              format(new Date(selectedRequest.metadata.validation.validation_date), "dd/MM/yyyy HH:mm", { locale: fr }) :
                              "En attente"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'processed' || selectedRequest.status === 'acknowledged' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Attribution des numéros</div>
                          <div className="text-sm text-muted-foreground">En attente</div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'acknowledged' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'acknowledged' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'acknowledged' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Accusé de réception envoyé</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedRequest.acknowledgment_date ? 
                              format(new Date(selectedRequest.acknowledgment_date), "dd/MM/yyyy HH:mm", { locale: fr }) :
                              "En attente"
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};