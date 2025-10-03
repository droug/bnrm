import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Trash2, Eye, EyeOff, Download, Share2, Mail, AlertCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DigitalLibraryBackoffice() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Fetch digital library documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('content_type', ['page', 'news'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch download restrictions
  const { data: restrictions } = useQuery({
    queryKey: ['download-restrictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('download_restrictions')
        .select('*, content(title)');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch documents with expiring copyright
  const { data: expiringDocs } = useQuery({
    queryKey: ['expiring-copyrights'],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('content_type', ['page', 'news'])
        .not('copyright_expires_at', 'is', null)
        .lte('copyright_expires_at', futureDate.toISOString())
        .order('copyright_expires_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Toggle document visibility
  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ is_visible: !isVisible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Visibilité mise à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier la visibilité", variant: "destructive" });
    }
  });

  // Toggle download
  const toggleDownload = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ download_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Téléchargement mis à jour" });
    }
  });

  // Toggle social sharing
  const toggleSocialShare = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ social_share_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Partage social mis à jour" });
    }
  });

  // Toggle email sharing
  const toggleEmailShare = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ email_share_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Partage par email mis à jour" });
    }
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Document supprimé" });
    }
  });

  // Add download restriction
  const addRestriction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('download_restrictions')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-restrictions'] });
      setShowRestrictDialog(false);
      toast({ title: "Restriction ajoutée" });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Back-office Bibliothèque Numérique</h1>
          <p className="text-muted-foreground">Gestion des documents numérisés</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un document
        </Button>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="copyright">Droits d'auteur</TabsTrigger>
          <TabsTrigger value="bulk">Import en masse</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents numérisés</CardTitle>
              <CardDescription>Gérez vos documents, leurs permissions et leur visibilité</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead>Téléchargement</TableHead>
                      <TableHead>Partage social</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents?.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.file_type || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={doc.is_visible}
                            onCheckedChange={() => toggleVisibility.mutate({ id: doc.id, isVisible: doc.is_visible })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={doc.download_enabled}
                            onCheckedChange={() => toggleDownload.mutate({ id: doc.id, enabled: doc.download_enabled })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={doc.social_share_enabled}
                            onCheckedChange={() => toggleSocialShare.mutate({ id: doc.id, enabled: doc.social_share_enabled })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={doc.email_share_enabled}
                            onCheckedChange={() => toggleEmailShare.mutate({ id: doc.id, enabled: doc.email_share_enabled })}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setShowRestrictDialog(true);
                              }}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteDocument.mutate(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restrictions de téléchargement</CardTitle>
              <CardDescription>Gérez les utilisateurs avec des restrictions d'accès</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Expire le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restrictions?.map((restriction) => (
                    <TableRow key={restriction.id}>
                      <TableCell>{restriction.user_id}</TableCell>
                      <TableCell>{restriction.content?.title || 'Tous les documents'}</TableCell>
                      <TableCell>
                        <Badge variant={restriction.restriction_type === 'abuse' ? 'destructive' : 'secondary'}>
                          {restriction.restriction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{restriction.reason}</TableCell>
                      <TableCell>{restriction.expires_at ? new Date(restriction.expires_at).toLocaleDateString() : 'Permanent'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copyright" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Droits d'auteur</CardTitle>
              <CardDescription>Documents dont les droits arrivent à expiration</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringDocs?.length === 0 ? (
                <p className="text-muted-foreground">Aucune alerte pour le moment</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Expire le</TableHead>
                      <TableHead>Dérogation</TableHead>
                      <TableHead>Jours restants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringDocs?.map((doc) => {
                      const daysLeft = Math.ceil((new Date(doc.copyright_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{new Date(doc.copyright_expires_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={doc.copyright_derogation ? 'default' : 'secondary'}>
                              {doc.copyright_derogation ? 'Oui' : 'Non'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={daysLeft < 30 ? 'destructive' : daysLeft < 60 ? 'secondary' : 'default'}>
                              {daysLeft} jours
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import en masse</CardTitle>
              <CardDescription>Importez plusieurs documents avec leurs métadonnées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Glissez-déposez vos fichiers</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Formats acceptés : CSV, Excel avec métadonnées
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Sélectionner des fichiers
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Format CSV attendu :</p>
                <code className="block bg-muted p-3 rounded">
                  titre,auteur,type_document,date_publication,file_url,description
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restrict Dialog */}
      <Dialog open={showRestrictDialog} onOpenChange={setShowRestrictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restreindre l'accès</DialogTitle>
            <DialogDescription>
              Restreindre le téléchargement pour un utilisateur spécifique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID Utilisateur</Label>
              <Input
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="UUID de l'utilisateur"
              />
            </div>
            <div>
              <Label>Type de restriction</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abuse">Abus</SelectItem>
                  <SelectItem value="temporary">Temporaire</SelectItem>
                  <SelectItem value="user_banned">Utilisateur banni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Raison</Label>
              <Textarea placeholder="Raison de la restriction" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestrictDialog(false)}>
              Annuler
            </Button>
            <Button>Ajouter la restriction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}