import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Building2, Plus } from 'lucide-react';
import { PartnerCollectionForm } from './PartnerCollectionForm';

interface Collection {
  id: string;
  institution_name: string;
  legal_representative: string | null;
  description: string;
  is_approved: boolean;
  created_at: string;
}

export function PartnerCollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_collections')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      console.error('Erreur chargement collections:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approuvée
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        En attente
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Mes Collections
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <PartnerCollectionForm 
              onSuccess={() => {
                setDialogOpen(false);
                loadCollections();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collections Partenaires</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : collections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune collection. Créez votre première collection pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Représentant légal</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.institution_name}</TableCell>
                    <TableCell>{collection.legal_representative || "Non spécifié"}</TableCell>
                    <TableCell className="max-w-md truncate">{collection.description}</TableCell>
                    <TableCell>{getStatusBadge(collection.is_approved)}</TableCell>
                    <TableCell>{new Date(collection.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}