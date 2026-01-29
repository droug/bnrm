import { useState, useRef } from "react";
import { useElectronicBundles, ElectronicBundle } from "@/hooks/useElectronicBundles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Key, Globe, Server, ArrowLeft, Upload, X, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const defaultBundle: Omit<ElectronicBundle, 'id' | 'created_at' | 'updated_at'> = {
  name: "",
  name_ar: "",
  provider: "",
  description: "",
  description_ar: "",
  website_url: "",
  api_base_url: "",
  api_key_name: "",
  api_authentication_type: "api_key",
  api_headers: {},
  api_query_params: {},
  ip_authentication: false,
  ip_ranges: [],
  access_type: "subscription",
  is_active: true,
  document_count: 0,
  categories: [],
  subjects: [],
  supported_formats: [],
  search_endpoint: "",
  fulltext_endpoint: "",
  metadata_endpoint: "",
  proxy_required: false,
  proxy_url: "",
  notes: "",
  contact_email: "",
  contact_phone: "",
  sort_order: 0,
};

export default function ElectronicBundlesManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bundles, isLoading, createBundle, updateBundle, deleteBundle, toggleActive } = useElectronicBundles();
  const [showDialog, setShowDialog] = useState(false);
  const [editingBundle, setEditingBundle] = useState<ElectronicBundle | null>(null);
  const [formData, setFormData] = useState(defaultBundle);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez choisir un fichier PNG, JPG, SVG ou WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5 Mo",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('electronic-bundles-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('electronic-bundles-logos')
        .getPublicUrl(fileName);

      updateFormField('provider_logo_url', urlData.publicUrl);
      toast({
        title: "Logo uploadé",
        description: "Le logo a été uploadé avec succès",
      });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader le logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    updateFormField('provider_logo_url', '');
  };

  const handleEdit = (bundle: ElectronicBundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      name_ar: bundle.name_ar || "",
      provider: bundle.provider,
      description: bundle.description || "",
      description_ar: bundle.description_ar || "",
      provider_logo_url: bundle.provider_logo_url || "",
      website_url: bundle.website_url || "",
      api_base_url: bundle.api_base_url || "",
      api_key_name: bundle.api_key_name || "",
      api_authentication_type: bundle.api_authentication_type || "api_key",
      api_headers: bundle.api_headers || {},
      api_query_params: bundle.api_query_params || {},
      ip_authentication: bundle.ip_authentication || false,
      ip_ranges: bundle.ip_ranges || [],
      access_type: bundle.access_type || "subscription",
      subscription_start_date: bundle.subscription_start_date || "",
      subscription_end_date: bundle.subscription_end_date || "",
      is_active: bundle.is_active ?? true,
      document_count: bundle.document_count || 0,
      categories: bundle.categories || [],
      subjects: bundle.subjects || [],
      supported_formats: bundle.supported_formats || [],
      search_endpoint: bundle.search_endpoint || "",
      fulltext_endpoint: bundle.fulltext_endpoint || "",
      metadata_endpoint: bundle.metadata_endpoint || "",
      proxy_required: bundle.proxy_required || false,
      proxy_url: bundle.proxy_url || "",
      notes: bundle.notes || "",
      contact_email: bundle.contact_email || "",
      contact_phone: bundle.contact_phone || "",
      sort_order: bundle.sort_order || 0,
    });
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingBundle(null);
    setFormData(defaultBundle);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (editingBundle) {
      await updateBundle.mutateAsync({ id: editingBundle.id, ...formData });
    } else {
      await createBundle.mutateAsync(formData);
    }
    setShowDialog(false);
    setEditingBundle(null);
    setFormData(defaultBundle);
  };

  const handleDelete = async (id: string) => {
    await deleteBundle.mutateAsync(id);
    setShowDeleteConfirm(null);
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/admin/digital-library');
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestion des Bouquets Électroniques</h1>
            <p className="text-muted-foreground">
              Configurer les abonnements aux ressources électroniques externes
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bouquet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bouquets configurés</CardTitle>
          <CardDescription>
            {bundles?.length || 0} bouquet(s) électronique(s) configuré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bundles && bundles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Type d'accès</TableHead>
                  <TableHead>Authentification</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {bundle.provider_logo_url && (
                          <img 
                            src={bundle.provider_logo_url} 
                            alt={bundle.provider}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <div>
                          <div>{bundle.name}</div>
                          {bundle.name_ar && (
                            <div className="text-xs text-muted-foreground" dir="rtl">{bundle.name_ar}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bundle.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {bundle.access_type === 'subscription' ? 'Abonnement' : 
                         bundle.access_type === 'open_access' ? 'Libre accès' : bundle.access_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {bundle.ip_authentication && (
                          <Badge variant="secondary" className="text-xs">
                            <Server className="h-3 w-3 mr-1" />
                            IP
                          </Badge>
                        )}
                        {bundle.api_authentication_type && bundle.api_authentication_type !== 'none' && (
                          <Badge variant="secondary" className="text-xs">
                            <Key className="h-3 w-3 mr-1" />
                            {bundle.api_authentication_type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {bundle.document_count?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate({ id: bundle.id, is_active: bundle.is_active ?? true })}
                      >
                        {bundle.is_active ? (
                          <Badge className="bg-green-500">
                            <Eye className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {bundle.subscription_end_date ? (
                        <span className={new Date(bundle.subscription_end_date) < new Date() ? 'text-destructive' : ''}>
                          {format(new Date(bundle.subscription_end_date), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {bundle.website_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(bundle.website_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bundle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setShowDeleteConfirm(bundle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun bouquet électronique configuré</p>
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier bouquet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingBundle ? "Modifier le bouquet" : "Ajouter un bouquet électronique"}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres de connexion et d'affichage du bouquet
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="api">Configuration API</TabsTrigger>
                <TabsTrigger value="access">Accès</TabsTrigger>
                <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du bouquet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormField('name', e.target.value)}
                      placeholder="Ex: JSTOR Arts & Sciences"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_ar">Nom en arabe</Label>
                    <Input
                      id="name_ar"
                      value={formData.name_ar}
                      onChange={(e) => updateFormField('name_ar', e.target.value)}
                      placeholder="الاسم بالعربية"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Fournisseur *</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => updateFormField('provider', e.target.value)}
                    placeholder="Ex: JSTOR, Elsevier, Springer..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    placeholder="Description du bouquet et de son contenu..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">Description en arabe</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => updateFormField('description_ar', e.target.value)}
                    placeholder="الوصف بالعربية..."
                    dir="rtl"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Site web</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => updateFormField('website_url', e.target.value)}
                      placeholder="https://www.jstor.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider_logo_url">URL du logo</Label>
                    <Input
                      id="provider_logo_url"
                      type="url"
                      value={formData.provider_logo_url}
                      onChange={(e) => updateFormField('provider_logo_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de contact</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => updateFormField('contact_email', e.target.value)}
                      placeholder="support@provider.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Téléphone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => updateFormField('contact_phone', e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => updateFormField('is_active', checked)}
                  />
                  <Label>Bouquet actif (visible dans le menu)</Label>
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="api_base_url">URL de base de l'API</Label>
                  <Input
                    id="api_base_url"
                    type="url"
                    value={formData.api_base_url}
                    onChange={(e) => updateFormField('api_base_url', e.target.value)}
                    placeholder="https://api.provider.com/v1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_authentication_type">Type d'authentification</Label>
                    <Select
                      value={formData.api_authentication_type}
                      onValueChange={(value) => updateFormField('api_authentication_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="api_key">Clé API</SelectItem>
                        <SelectItem value="bearer_token">Bearer Token</SelectItem>
                        <SelectItem value="basic_auth">Basic Auth</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key_name">Nom de la clé/secret</Label>
                    <Input
                      id="api_key_name"
                      value={formData.api_key_name}
                      onChange={(e) => updateFormField('api_key_name', e.target.value)}
                      placeholder="JSTOR_API_KEY"
                    />
                    <p className="text-xs text-muted-foreground">
                      La valeur doit être configurée dans les secrets Supabase
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search_endpoint">Endpoint de recherche</Label>
                    <Input
                      id="search_endpoint"
                      value={formData.search_endpoint}
                      onChange={(e) => updateFormField('search_endpoint', e.target.value)}
                      placeholder="/search"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fulltext_endpoint">Endpoint texte intégral</Label>
                    <Input
                      id="fulltext_endpoint"
                      value={formData.fulltext_endpoint}
                      onChange={(e) => updateFormField('fulltext_endpoint', e.target.value)}
                      placeholder="/fulltext"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metadata_endpoint">Endpoint métadonnées</Label>
                    <Input
                      id="metadata_endpoint"
                      value={formData.metadata_endpoint}
                      onChange={(e) => updateFormField('metadata_endpoint', e.target.value)}
                      placeholder="/metadata"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.proxy_required}
                    onCheckedChange={(checked) => updateFormField('proxy_required', checked)}
                  />
                  <Label>Proxy requis</Label>
                </div>

                {formData.proxy_required && (
                  <div className="space-y-2">
                    <Label htmlFor="proxy_url">URL du proxy</Label>
                    <Input
                      id="proxy_url"
                      type="url"
                      value={formData.proxy_url}
                      onChange={(e) => updateFormField('proxy_url', e.target.value)}
                      placeholder="https://proxy.bnrm.ma"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="access" className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="access_type">Type d'accès</Label>
                  <Select
                    value={formData.access_type}
                    onValueChange={(value) => updateFormField('access_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Abonnement payant</SelectItem>
                      <SelectItem value="open_access">Libre accès</SelectItem>
                      <SelectItem value="trial">Essai gratuit</SelectItem>
                      <SelectItem value="consortium">Consortium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscription_start_date">Date de début d'abonnement</Label>
                    <Input
                      id="subscription_start_date"
                      type="date"
                      value={formData.subscription_start_date}
                      onChange={(e) => updateFormField('subscription_start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription_end_date">Date de fin d'abonnement</Label>
                    <Input
                      id="subscription_end_date"
                      type="date"
                      value={formData.subscription_end_date}
                      onChange={(e) => updateFormField('subscription_end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.ip_authentication}
                    onCheckedChange={(checked) => updateFormField('ip_authentication', checked)}
                  />
                  <Label>Authentification par adresse IP</Label>
                </div>

                {formData.ip_authentication && (
                  <div className="space-y-2">
                    <Label htmlFor="ip_ranges">Plages IP autorisées (une par ligne)</Label>
                    <Textarea
                      id="ip_ranges"
                      value={formData.ip_ranges?.join('\n') || ''}
                      onChange={(e) => updateFormField('ip_ranges', e.target.value.split('\n').filter(Boolean))}
                      placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                      rows={4}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="document_count">Nombre de documents estimé</Label>
                  <Input
                    id="document_count"
                    type="number"
                    value={formData.document_count}
                    onChange={(e) => updateFormField('document_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categories">Catégories (une par ligne)</Label>
                  <Textarea
                    id="categories"
                    value={formData.categories?.join('\n') || ''}
                    onChange={(e) => updateFormField('categories', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Sciences humaines&#10;Arts&#10;Littérature"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Sujets couverts (un par ligne)</Label>
                  <Textarea
                    id="subjects"
                    value={formData.subjects?.join('\n') || ''}
                    onChange={(e) => updateFormField('subjects', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Histoire&#10;Philosophie&#10;Sociologie"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supported_formats">Formats supportés (un par ligne)</Label>
                  <Textarea
                    id="supported_formats"
                    value={formData.supported_formats?.join('\n') || ''}
                    onChange={(e) => updateFormField('supported_formats', e.target.value.split('\n').filter(Boolean))}
                    placeholder="PDF&#10;HTML&#10;EPUB"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordre d'affichage</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => updateFormField('sort_order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormField('notes', e.target.value)}
                    placeholder="Notes pour l'administration..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.provider || createBundle.isPending || updateBundle.isPending}
            >
              {editingBundle ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce bouquet électronique ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              disabled={deleteBundle.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
