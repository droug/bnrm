import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Archive, 
  CheckCircle, 
  FileCheck, 
  Calendar, 
  Hash,
  Download,
  Search,
  Plus,
  Eye,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LegalDeposit {
  id: string;
  content_id: string;
  deposit_number: string;
  submission_date: string;
  acknowledgment_date?: string;
  status: 'submitted' | 'acknowledged' | 'processed' | 'archived' | 'rejected';
  deposit_type: 'mandatory' | 'voluntary' | 'special';
  submitter_id: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  content: {
    title: string;
    content_type: string;
    author_id: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface Content {
  id: string;
  title: string;
  content_type: string;
  status: string;
}

export default function LegalDepositManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [deposits, setDeposits] = useState<LegalDeposit[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState("");
  const [depositType, setDepositType] = useState<'mandatory' | 'voluntary' | 'special'>('mandatory');

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'librarian')) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch legal deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('legal_deposits')
        .select(`
          *,
          content (id, title, content_type, author_id),
          profiles:submitter_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;
      setDeposits((depositsData as any) || []);

      // Fetch available content for deposit
      const { data: contentsData, error: contentsError } = await supabase
        .from('content')
        .select('id, title, content_type, status')
        .eq('status', 'published')
        .order('title');

      if (contentsError) throw contentsError;
      setContents(contentsData || []);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des dépôts légaux",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLegalDeposit = async () => {
    if (!selectedContent) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un contenu",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate deposit number
      const { data: depositNumber, error: numberError } = await supabase
        .rpc('generate_deposit_number');

      if (numberError) throw numberError;

      // Create deposit
      const { error } = await supabase
        .from('legal_deposits')
        .insert({
          content_id: selectedContent,
          deposit_number: depositNumber,
          deposit_type: depositType,
          submitter_id: user?.id,
          status: 'submitted'
        });

      if (error) throw error;

      toast({
        title: "Dépôt légal créé",
        description: `Numéro de dépôt: ${depositNumber}`,
      });

      setShowCreateDialog(false);
      setSelectedContent("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le dépôt légal",
        variant: "destructive",
      });
    }
  };

  const updateDepositStatus = async (depositId: string, newStatus: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'acknowledged') {
        updates.acknowledgment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('legal_deposits')
        .update(updates)
        .eq('id', depositId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le dépôt légal est maintenant ${getStatusLabel(newStatus)}`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      submitted: { variant: 'secondary' as const, label: 'Soumis' },
      acknowledged: { variant: 'default' as const, label: 'Accusé de réception' },
      processed: { variant: 'default' as const, label: 'Traité' },
      archived: { variant: 'outline' as const, label: 'Archivé' },
      rejected: { variant: 'destructive' as const, label: 'Rejeté' }
    };
    
    const { variant, label } = config[status as keyof typeof config] || config.submitted;
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      submitted: 'soumis',
      acknowledged: 'accusé de réception',
      processed: 'traité',
      archived: 'archivé',
      rejected: 'rejeté'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      mandatory: 'Obligatoire',
      voluntary: 'Volontaire',
      special: 'Spécial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      mandatory: { variant: 'destructive' as const, label: 'Obligatoire' },
      voluntary: { variant: 'secondary' as const, label: 'Volontaire' },
      special: { variant: 'default' as const, label: 'Spécial' }
    };
    
    const { variant, label } = config[type as keyof typeof config] || config.mandatory;
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.deposit_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
    const matchesType = typeFilter === "all" || deposit.deposit_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDepositStats = () => {
    return {
      total: deposits.length,
      submitted: deposits.filter(d => d.status === 'submitted').length,
      processed: deposits.filter(d => d.status === 'processed').length,
      archived: deposits.filter(d => d.status === 'archived').length,
      byType: {
        mandatory: deposits.filter(d => d.deposit_type === 'mandatory').length,
        voluntary: deposits.filter(d => d.deposit_type === 'voluntary').length,
        special: deposits.filter(d => d.deposit_type === 'special').length,
      }
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getDepositStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Archive className="h-6 w-6 text-primary" />
            Gestion des Dépôts Légaux
          </h2>
          <p className="text-muted-foreground">
            Suivi et gestion des dépôts légaux officiels
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Dépôt
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Soumis</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Traités</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Archivés</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou numéro de dépôt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="acknowledged">Accusé de réception</SelectItem>
                <SelectItem value="processed">Traités</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="mandatory">Obligatoire</SelectItem>
                <SelectItem value="voluntary">Volontaire</SelectItem>
                <SelectItem value="special">Spécial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des dépôts */}
      <Card>
        <CardHeader>
          <CardTitle>Dépôts Légaux</CardTitle>
          <CardDescription>
            {filteredDeposits.length} dépôt(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro de Dépôt</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Soumis par</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono text-sm">{deposit.deposit_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deposit.content.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {deposit.content.content_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(deposit.deposit_type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(deposit.status)}
                    </TableCell>
                    <TableCell>
                      {deposit.profiles.first_name} {deposit.profiles.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(deposit.submission_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        {deposit.status === 'submitted' && (
                          <Select
                            value={deposit.status}
                            onValueChange={(value) => updateDepositStatus(deposit.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acknowledged">Accusé réception</SelectItem>
                              <SelectItem value="processed">Traiter</SelectItem>
                              <SelectItem value="rejected">Rejeter</SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* Dialog de création */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nouveau Dépôt Légal</AlertDialogTitle>
            <AlertDialogDescription>
              Créer un nouveau dépôt légal pour un contenu publié
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Contenu à déposer</Label>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contenu" />
                </SelectTrigger>
                <SelectContent>
                  {contents.map((content) => (
                    <SelectItem key={content.id} value={content.id}>
                      {content.title} ({content.content_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Type de dépôt</Label>
              <Select value={depositType} onValueChange={(value: any) => setDepositType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory">Obligatoire</SelectItem>
                  <SelectItem value="voluntary">Volontaire</SelectItem>
                  <SelectItem value="special">Spécial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={createLegalDeposit}
              disabled={!selectedContent}
            >
              Créer le Dépôt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}