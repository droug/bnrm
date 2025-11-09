import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookPlus, Eye, Check, X, Search, Filter, RefreshCw } from "lucide-react";

interface LegalDepositPublication {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  publication_date?: string;
  cover_url?: string;
  document_type: string;
  status: string;
  created_at: string;
  kitab_status?: 'pending' | 'approved' | 'rejected';
}

export function KitabNewPublicationsManager() {
  const { toast } = useToast();
  const [publications, setPublications] = useState<LegalDepositPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPublication, setSelectedPublication] = useState<LegalDepositPublication | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    try {
      // Récupérer uniquement les dépôts légaux avec validation finale (attribue)
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('*')
        .eq('status', 'attribue')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapper les données
      const mappedData: LegalDepositPublication[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Sans titre',
        author: item.author_name || item.creator_name,
        publisher: item.publisher_name,
        isbn: item.isbn || item.issn,
        publication_date: item.publication_date || item.created_at,
        cover_url: item.cover_image_url,
        document_type: item.deposit_type || 'Document',
        status: item.workflow_status || 'completed',
        created_at: item.created_at,
        kitab_status: item.kitab_status || 'pending',
      }));

      setPublications(mappedData);
    } catch (error) {
      console.error('Error loading publications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les publications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (publication: LegalDepositPublication) => {
    setSelectedPublication(publication);
    setPreviewDialogOpen(true);
  };

  const handleApprove = async (publicationId: string) => {
    try {
      // Utiliser .update() avec un objet Record<string, any> pour contourner le problème de typage temporairement
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({ kitab_status: 'approved' } as any)
        .eq('id', publicationId);

      if (error) throw error;

      toast({
        title: "Publication approuvée",
        description: "La publication a été ajoutée à Kitab avec succès.",
      });

      loadPublications();
    } catch (error) {
      console.error('Error approving publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la publication",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (publicationId: string) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({ kitab_status: 'rejected' } as any)
        .eq('id', publicationId);

      if (error) throw error;

      toast({
        title: "Publication rejetée",
        description: "La publication a été rejetée.",
      });

      loadPublications();
    } catch (error) {
      console.error('Error rejecting publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la publication",
        variant: "destructive",
      });
    }
  };

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.isbn?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === "all" || pub.kitab_status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejeté</Badge>;
      case "pending":
      default:
        return <Badge className="bg-amber-500">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Bouton d'actualisation */}
      <div className="flex justify-end">
        <Button onClick={loadPublications} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">En attente</p>
          <p className="text-3xl font-bold text-amber-600">
            {publications.filter(p => p.kitab_status === 'pending').length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Approuvées</p>
          <p className="text-3xl font-bold text-green-600">
            {publications.filter(p => p.kitab_status === 'approved').length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Rejetées</p>
          <p className="text-3xl font-bold text-red-600">
            {publications.filter(p => p.kitab_status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Tableau des publications */}
      <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Éditeur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>ISBN/ISSN</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredPublications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune publication trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredPublications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell className="font-medium">{pub.title}</TableCell>
                    <TableCell>{pub.author || '-'}</TableCell>
                    <TableCell>{pub.publisher || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pub.document_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{pub.isbn || '-'}</TableCell>
                    <TableCell>
                      {pub.publication_date 
                        ? new Date(pub.publication_date).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(pub.kitab_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(pub)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {pub.kitab_status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(pub.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(pub.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de {filteredPublications.length} publication{filteredPublications.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la Publication</DialogTitle>
            <DialogDescription>
              Détails de la publication du dépôt légal
            </DialogDescription>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-4">
              {/* Couverture */}
              {selectedPublication.cover_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedPublication.cover_url}
                    alt={selectedPublication.title}
                    className="max-h-96 rounded-lg shadow-lg object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Titre</p>
                  <p className="font-medium">{selectedPublication.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auteur</p>
                  <p className="font-medium">{selectedPublication.author || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Éditeur</p>
                  <p className="font-medium">{selectedPublication.publisher || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{selectedPublication.document_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISBN/ISSN</p>
                  <p className="font-mono">{selectedPublication.isbn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de publication</p>
                  <p className="font-medium">
                    {selectedPublication.publication_date
                      ? new Date(selectedPublication.publication_date).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut Kitab</p>
                  {getStatusBadge(selectedPublication.kitab_status)}
                </div>
              </div>

              {/* Actions */}
              {selectedPublication.kitab_status === 'pending' && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleReject(selectedPublication.id);
                      setPreviewDialogOpen(false);
                    }}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedPublication.id);
                      setPreviewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approuver pour Kitab
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
