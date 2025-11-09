import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2, Mail, Phone, Globe, Calendar, User } from "lucide-react";
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

interface PartnerCollection {
  id: string;
  institution_name: string;
  legal_representative: string | null;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  description: string | null;
  website_url: string | null;
  is_approved: boolean;
  created_at: string;
  created_by: string;
}

export function PartnerCollectionsApproval() {
  const [collections, setCollections] = useState<PartnerCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<PartnerCollection | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      console.error('Erreur chargement collections:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collections partenaires",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (collectionId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_collections')
        .update({ is_approved: approve })
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: approve ? "Collection approuvée" : "Collection rejetée",
        description: approve 
          ? "Le partenaire peut maintenant soumettre des manuscrits"
          : "La collection a été rejetée",
      });

      loadCollections();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-500">Approuvée</Badge>
    ) : (
      <Badge variant="secondary">En attente</Badge>
    );
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
          <Building2 className="h-5 w-5" />
          Gestion des Collections Partenaires
        </CardTitle>
        <CardDescription>
          Approuvez ou rejetez les demandes de collaboration des institutions partenaires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date de demande</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune demande de partenariat
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">
                    {collection.institution_name}
                  </TableCell>
                  <TableCell>
                    {collection.legal_representative ? (
                      <span className="text-xs">{collection.legal_representative}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Non spécifié</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {collection.contact_person}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {collection.contact_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(collection.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(collection.is_approved)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCollection(collection)}
                          >
                            Détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Détails de la collection - {collection.institution_name}
                            </DialogTitle>
                            <DialogDescription>
                              Informations complètes sur la demande de partenariat
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Institution</label>
                                <p className="text-sm text-muted-foreground">
                                  {collection.institution_name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Représentant légal</label>
                                <p className="text-sm text-muted-foreground">
                                  {collection.legal_representative || "Non spécifié"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Contact</label>
                                <p className="text-sm text-muted-foreground">
                                  {collection.contact_person}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm text-muted-foreground">
                                  {collection.contact_email}
                                </p>
                              </div>
                              {collection.contact_phone && (
                                <div>
                                  <label className="text-sm font-medium">Téléphone</label>
                                  <p className="text-sm text-muted-foreground">
                                    {collection.contact_phone}
                                  </p>
                                </div>
                              )}
                              {collection.website_url && (
                                <div>
                                  <label className="text-sm font-medium">Site web</label>
                                  <a 
                                    href={collection.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Globe className="h-3 w-3" />
                                    {collection.website_url}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {collection.description && (
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {collection.description}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex gap-2 pt-4">
                              {!collection.is_approved && (
                                <Button
                                  onClick={() => handleApproval(collection.id, true)}
                                  className="flex-1"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approuver
                                </Button>
                              )}
                              {collection.is_approved && (
                                <Button
                                  onClick={() => handleApproval(collection.id, false)}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Révoquer
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!collection.is_approved && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproval(collection.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(collection.id, false)}
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
