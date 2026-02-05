import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Download, Eye, Shield, MousePointerClick, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  description: string;
  language: string;
  period: string;
  material: string;
  inventory_number: string;
  access_level: string;
  status: string;
  institution?: string;
  thumbnail_url?: string;
  created_at: string;
}

export function ManuscriptsManager() {
  const { toast } = useToast();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<Manuscript | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    description: string;
    language: string;
    period: string;
    material: string;
    inventory_number: string;
    access_level: 'public' | 'restricted' | 'confidential';
    status: 'available' | 'digitization' | 'reserved' | 'maintenance';
    institution: string;
    thumbnail_url: string;
    page_count: number;
    block_right_click: boolean;
    block_screenshot: boolean;
    allow_download: boolean;
    allow_print: boolean;
    allow_email_share: boolean;
  }>({
    title: "",
    author: "",
    description: "",
    language: "ar",
    period: "",
    material: "",
    inventory_number: "",
    access_level: "public",
    status: "available",
    institution: "BNRM",
    thumbnail_url: "",
    page_count: 0,
    block_right_click: false,
    block_screenshot: false,
    allow_download: true,
    allow_print: true,
    allow_email_share: true,
  });

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const fetchManuscripts = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManuscripts(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les manuscrits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingManuscript) {
        const { error } = await supabase
          .from('manuscripts')
          .update(formData)
          .eq('id', editingManuscript.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Manuscrit modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('manuscripts')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Manuscrit créé avec succès",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchManuscripts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce manuscrit ?")) return;

    try {
      const { error } = await supabase
        .from('manuscripts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Manuscrit supprimé avec succès",
      });
      
      fetchManuscripts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (manuscript: Manuscript) => {
    setEditingManuscript(manuscript);
    setFormData({
      title: manuscript.title,
      author: manuscript.author,
      description: manuscript.description,
      language: manuscript.language,
      period: manuscript.period,
      material: manuscript.material || "",
      inventory_number: manuscript.inventory_number,
      access_level: manuscript.access_level as 'public' | 'restricted' | 'confidential',
      status: manuscript.status as 'available' | 'digitization' | 'reserved' | 'maintenance',
      institution: manuscript.institution || "BNRM",
      thumbnail_url: manuscript.thumbnail_url || "",
      page_count: (manuscript as any).page_count || 0,
      block_right_click: (manuscript as any).block_right_click || false,
      block_screenshot: (manuscript as any).block_screenshot || false,
      allow_download: (manuscript as any).allow_download !== false,
      allow_print: (manuscript as any).allow_print !== false,
      allow_email_share: (manuscript as any).allow_email_share !== false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingManuscript(null);
    setFormData({
      title: "",
      author: "",
      description: "",
      language: "ar",
      period: "",
      material: "",
      inventory_number: "",
      access_level: "public",
      status: "available",
      institution: "BNRM",
      thumbnail_url: "",
      page_count: 0,
      block_right_click: false,
      block_screenshot: false,
      allow_download: true,
      allow_print: true,
      allow_email_share: true,
    });
  };

  const filteredManuscripts = manuscripts.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.inventory_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestion des Manuscrits</span>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Manuscrit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingManuscript ? "Modifier" : "Nouveau"} Manuscrit
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du manuscrit
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Auteur *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory_number">N° Inventaire *</Label>
                    <Input
                      id="inventory_number"
                      value={formData.inventory_number}
                      onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">Arabe</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="amz">Amazighe</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                        <SelectItem value="la">Latin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Période</Label>
                    <Input
                      id="period"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Matériau</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access_level">Niveau d'accès</Label>
                    <Select value={formData.access_level} onValueChange={(value: 'public' | 'restricted' | 'confidential') => setFormData({ ...formData, access_level: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="restricted">Restreint</SelectItem>
                        <SelectItem value="confidential">Confidentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value: 'available' | 'digitization' | 'reserved' | 'maintenance') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="digitization">Numérisation</SelectItem>
                        <SelectItem value="reserved">Réservé</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page_count">Nombre de pages</Label>
                    <Input
                      id="page_count"
                      type="number"
                      value={formData.page_count}
                      onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">URL de l'image</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold">Paramètres de Sécurité et Consultation</h3>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="block_right_click" className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4" />
                          Bloquer le clic droit
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Empêche les utilisateurs de faire un clic droit sur ce manuscrit
                        </p>
                      </div>
                      <Switch
                        id="block_right_click"
                        checked={formData.block_right_click}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, block_right_click: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="block_screenshot" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Bloquer les captures d'écran
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Tente d'empêcher les captures d'écran (PrintScreen, etc.)
                        </p>
                      </div>
                      <Switch
                        id="block_screenshot"
                        checked={formData.block_screenshot}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, block_screenshot: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow_download">
                          Autoriser le téléchargement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Les utilisateurs autorisés peuvent télécharger ce manuscrit
                        </p>
                      </div>
                      <Switch
                        id="allow_download"
                        checked={formData.allow_download}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, allow_download: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow_print">
                          Autoriser l'impression
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Les utilisateurs peuvent imprimer ce manuscrit
                        </p>
                      </div>
                      <Switch
                        id="allow_print"
                        checked={formData.allow_print}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, allow_print: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow_email_share">
                          Autoriser le partage par email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Les utilisateurs peuvent envoyer ce manuscrit par email
                        </p>
                      </div>
                      <Switch
                        id="allow_email_share"
                        checked={formData.allow_email_share}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, allow_email_share: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingManuscript ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          {manuscripts.length} manuscrit(s) au total
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, auteur ou n° inventaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Inventaire</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead>Accès</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManuscripts.map((manuscript) => (
                <TableRow key={manuscript.id}>
                  <TableCell className="font-mono text-sm">
                    {manuscript.inventory_number}
                  </TableCell>
                  <TableCell className="font-medium">{manuscript.title}</TableCell>
                  <TableCell>{manuscript.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{manuscript.language}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      manuscript.access_level === 'public' ? 'default' :
                      manuscript.access_level === 'restricted' ? 'secondary' :
                      'destructive'
                    }>
                      {manuscript.access_level === 'public' ? 'Public' :
                       manuscript.access_level === 'restricted' ? 'Restreint' :
                       'Confidentiel'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      manuscript.status === 'available' ? 'default' :
                      manuscript.status === 'digitization' ? 'secondary' :
                      'outline'
                    }>
                      {manuscript.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(manuscript)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(manuscript.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
