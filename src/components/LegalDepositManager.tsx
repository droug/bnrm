import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import logigrammeImage from "@/assets/logigramme-depot-legal.png";

interface LegalDeposit {
  id: string;
  deposit_number: string;
  content_id: string;
  submitter_id: string;
  deposit_type: string;
  status: string;
  submission_date: string;
  acknowledgment_date?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DepositRequest {
  id: string;
  declarant_name: string;
  publication_title: string;
  publication_type: 'monographie' | 'periodique';
  isbn_issn?: string;
  status: 'pending' | 'validated' | 'rejected' | 'processed';
  submission_date: string;
  documents_deposited: boolean;
  dl_number?: string;
  metadata: any;
}

const LegalDepositManager = () => {
  const [deposits, setDeposits] = useState<LegalDeposit[]>([]);
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDeposit, setSelectedDeposit] = useState<LegalDeposit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dépôts légaux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (depositId: string, newStatus: string, metadata?: any) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'acknowledged') {
        updateData.acknowledgment_date = new Date().toISOString();
      }
      
      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from("legal_deposits")
        .update(updateData)
        .eq("id", depositId);

      if (error) throw error;

      await fetchDeposits();
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating deposit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const generateDepositNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_deposit_number');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating deposit number:", error);
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      validated: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: AlertCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      acknowledged: { color: "bg-purple-100 text-purple-800", label: "Accusé", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      monographie: { color: "bg-emerald-100 text-emerald-800", label: "Monographie" },
      periodique: { color: "bg-orange-100 text-orange-800", label: "Périodique" },
      document: { color: "bg-gray-100 text-gray-800", label: "Document" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.document;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch = 
      deposit.deposit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.deposit_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
    const matchesType = typeFilter === "all" || deposit.deposit_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des dépôts légaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Dépôt Légal</h2>
          <p className="text-muted-foreground">
            Système de gestion des demandes et procédures de dépôt légal BNRM
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="process">Processus</TabsTrigger>
          <TabsTrigger value="deposits">Dépôts</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Demandes de Dépôt Légal
              </CardTitle>
              <CardDescription>
                Gestion des demandes selon le processus E0-E1 (Réception et traitement)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par numéro de dépôt, type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="monographie">Monographie</SelectItem>
                    <SelectItem value="periodique">Périodique</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Dépôt</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead>Date d'accusé</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.map((deposit) => (
                      <TableRow key={deposit.id}>
                        <TableCell className="font-medium">
                          {deposit.deposit_number || "En attente"}
                        </TableCell>
                        <TableCell>{getTypeBadge(deposit.deposit_type)}</TableCell>
                        <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                        <TableCell>
                          {format(new Date(deposit.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {deposit.acknowledgment_date 
                            ? format(new Date(deposit.acknowledgment_date), "dd/MM/yyyy HH:mm", { locale: fr })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDeposit(deposit)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Détails du dépôt {selectedDeposit?.deposit_number}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedDeposit && (
                                  <DepositDetails 
                                    deposit={selectedDeposit} 
                                    onStatusUpdate={updateDepositStatus}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {deposit.status === 'submitted' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'validated')}
                              >
                                Valider
                              </Button>
                            )}
                            
                            {deposit.status === 'validated' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'processed')}
                              >
                                Traiter
                              </Button>
                            )}
                            
                            {deposit.status === 'processed' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'acknowledged')}
                              >
                                Accusé
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logigramme du Processus de Dépôt Légal</CardTitle>
              <CardDescription>
                Processus complet de gestion du dépôt légal selon la procédure BNRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <img 
                  src={logigrammeImage} 
                  alt="Logigramme du processus de dépôt légal"
                  className="max-w-full h-auto mx-auto border rounded-lg shadow-sm"
                />
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Étapes du processus :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">E0: Réception de la Demande</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Vérification et validation des demandes des déclarants
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">E1: Traitement de la Demande</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Saisie système et validation du contenu
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">E2: Attribution N° DL</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Attribution ISBN/ISSN et numéro de dépôt légal
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">E4-E8: Gestion Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Réception, vérification et classement
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Dépôts</CardTitle>
              <CardDescription>
                Consultation de tous les dépôts légaux traités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{deposits.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">En attente</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'submitted').length}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Traités</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'processed').length}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Accusés</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'acknowledged').length}
                          </p>
                        </div>
                        <Download className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques du Dépôt Légal</CardTitle>
              <CardDescription>
                Analyse et métriques des dépôts légaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Module de statistiques en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composant pour les détails d'un dépôt
const DepositDetails = ({ 
  deposit, 
  onStatusUpdate 
}: { 
  deposit: LegalDeposit;
  onStatusUpdate: (id: string, status: string, metadata?: any) => void;
}) => {
  const [comments, setComments] = useState("");
  const [isbnIssn, setIsbnIssn] = useState("");

  const handleAttributeNumber = async () => {
    const newMetadata = {
      ...deposit.metadata,
      isbn_issn: isbnIssn,
      attribution_date: new Date().toISOString(),
      comments
    };
    
    await onStatusUpdate(deposit.id, 'processed', newMetadata);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      validated: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: AlertCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      acknowledged: { color: "bg-purple-100 text-purple-800", label: "Accusé", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Numéro de dépôt</Label>
          <p className="text-sm">{deposit.deposit_number || "En attente d'attribution"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <p className="text-sm">{deposit.deposit_type}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Statut actuel</Label>
          <div className="mt-1">{getStatusBadge(deposit.status)}</div>
        </div>
        <div>
          <Label className="text-sm font-medium">Date de soumission</Label>
          <p className="text-sm">
            {format(new Date(deposit.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      {deposit.status === 'validated' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Attribution ISBN/ISSN</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="isbn-issn">Numéro ISBN/ISSN</Label>
              <Input
                id="isbn-issn"
                value={isbnIssn}
                onChange={(e) => setIsbnIssn(e.target.value)}
                placeholder="Saisir le numéro ISBN ou ISSN"
              />
            </div>
            <div>
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Commentaires optionnels"
                rows={3}
              />
            </div>
            <Button onClick={handleAttributeNumber} className="w-full">
              Attribuer le numéro et traiter
            </Button>
          </div>
        </div>
      )}

      {deposit.metadata && Object.keys(deposit.metadata).length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Métadonnées</h3>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
            {JSON.stringify(deposit.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LegalDepositManager;