import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Copy, 
  Download, 
  Upload,
  Image as ImageIcon,
  Star,
  Palette,
  Shapes,
  Loader2,
  X,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VisualResource {
  id: string;
  name: string;
  name_ar: string | null;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  tags: string[];
  description_fr: string | null;
  description_ar: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

const categories = [
  { value: "icon", label: "Icônes", icon: Star },
  { value: "logo", label: "Logos", icon: Shapes },
  { value: "illustration", label: "Illustrations", icon: ImageIcon },
  { value: "pictogram", label: "Pictogrammes", icon: Palette },
];

export default function CmsVisualResourcesManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<VisualResource | null>(null);
  const [deleteResource, setDeleteResource] = useState<VisualResource | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch visual resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ["cms-visual-resources", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("cms_visual_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VisualResource[];
    },
  });

  // Stats
  const stats = {
    total: resources?.length || 0,
    icons: resources?.filter(r => r.category === "icon").length || 0,
    logos: resources?.filter(r => r.category === "logo").length || 0,
    illustrations: resources?.filter(r => r.category === "illustration").length || 0,
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cms_visual_resources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-visual-resources"] });
      toast.success("Ressource supprimée avec succès");
      setDeleteResource(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée dans le presse-papiers");
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || Star;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border-none bg-gradient-to-br from-violet-500/10 via-fuchsia-400/5 to-background shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Palette className="h-6 w-6 text-violet-500" />
                Ressources Visuelles
              </CardTitle>
              <CardDescription className="mt-1">
                Gérez votre collection d'icônes, logos et illustrations
              </CardDescription>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une ressource
                </Button>
              </DialogTrigger>
              <UploadDialog 
                onClose={() => setIsUploadOpen(false)} 
                onSuccess={() => {
                  setIsUploadOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["cms-visual-resources"] });
                }}
              />
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <StatCard label="Total" value={stats.total} icon={Palette} color="violet" />
            <StatCard label="Icônes" value={stats.icons} icon={Star} color="amber" />
            <StatCard label="Logos" value={stats.logos} icon={Shapes} color="blue" />
            <StatCard label="Illustrations" value={stats.illustrations} icon={ImageIcon} color="green" />
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tous
              </Button>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className="gap-1"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : resources && resources.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {resources.map((resource, index) => {
                  const CategoryIcon = getCategoryIcon(resource.category);
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative"
                    >
                      <div className={cn(
                        "relative aspect-square rounded-xl border-2 bg-muted/30 p-4 flex items-center justify-center transition-all hover:shadow-md hover:border-primary/30",
                        !resource.is_active && "opacity-50"
                      )}>
                        {/* Preview */}
                        {resource.file_type === "svg" ? (
                          <img 
                            src={resource.file_url} 
                            alt={resource.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img 
                            src={resource.file_url} 
                            alt={resource.name}
                            className="w-full h-full object-contain rounded"
                          />
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="p-1 rounded bg-background/80 backdrop-blur-sm">
                            <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => copyUrl(resource.file_url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingResource(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteResource(resource)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="mt-2 px-1">
                        <p className="text-xs font-medium truncate" title={resource.name}>
                          {resource.name}
                        </p>
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {resource.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune ressource visuelle trouvée</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Ajouter votre première ressource
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingResource && (
        <EditDialog 
          resource={editingResource}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            queryClient.invalidateQueries({ queryKey: ["cms-visual-resources"] });
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResource} onOpenChange={() => setDeleteResource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La ressource "{deleteResource?.name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteResource && deleteMutation.mutate(deleteResource.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color }: { 
  label: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border">
      <div className={cn("p-2 rounded-lg", colorClasses[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// Upload Dialog Component
function UploadDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    category: "icon",
    description_fr: "",
    description_ar: "",
    tags: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["image/svg+xml", "image/png", "image/webp", "image/jpeg"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Type de fichier non supporté. Utilisez SVG, PNG, WebP ou JPEG.");
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      // Auto-fill name from filename
      if (!formData.name) {
        const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setFormData(prev => ({ ...prev, name }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !formData.name) {
      toast.error("Veuillez sélectionner un fichier et entrer un nom");
      return;
    }

    setLoading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `visual-resources/${formData.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("cms-media")
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from("cms_visual_resources")
        .insert({
          name: formData.name,
          name_ar: formData.name_ar || null,
          category: formData.category,
          file_url: urlData.publicUrl,
          file_type: fileExt,
          file_size: file.size,
          description_fr: formData.description_fr || null,
          description_ar: formData.description_ar || null,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        });

      if (dbError) throw dbError;

      toast.success("Ressource ajoutée avec succès");
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Ajouter une ressource visuelle</DialogTitle>
        <DialogDescription>
          Importez une icône, un logo ou une illustration
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Fichier *</Label>
          {preview ? (
            <div className="relative aspect-video border-2 border-dashed rounded-lg bg-muted/30 flex items-center justify-center p-4">
              <img src={preview} alt="Preview" className="max-h-32 object-contain" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="aspect-video border-2 border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Cliquez ou déposez un fichier</p>
              <p className="text-xs text-muted-foreground mt-1">SVG, PNG, WebP, JPEG</p>
              <input
                type="file"
                accept=".svg,.png,.webp,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom (FR) *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Icône livre"
            />
          </div>
          <div className="space-y-2">
            <Label>Nom (AR)</Label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
              placeholder="مثال: أيقونة كتاب"
              dir="rtl"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (séparés par des virgules)</Label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="livre, lecture, bibliothèque"
          />
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Description (FR)</Label>
            <Textarea
              value={formData.description_fr}
              onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
              placeholder="Description..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (AR)</Label>
            <Textarea
              value={formData.description_ar}
              onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
              placeholder="الوصف..."
              rows={2}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !file || !formData.name}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          Ajouter
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Edit Dialog Component
function EditDialog({ resource, onClose, onSuccess }: { 
  resource: VisualResource; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: resource.name,
    name_ar: resource.name_ar || "",
    category: resource.category,
    description_fr: resource.description_fr || "",
    description_ar: resource.description_ar || "",
    tags: resource.tags?.join(", ") || "",
    is_active: resource.is_active,
  });

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("cms_visual_resources")
        .update({
          name: formData.name,
          name_ar: formData.name_ar || null,
          category: formData.category,
          description_fr: formData.description_fr || null,
          description_ar: formData.description_ar || null,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          is_active: formData.is_active,
        })
        .eq("id", resource.id);

      if (error) throw error;

      toast.success("Ressource mise à jour");
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la ressource</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette ressource visuelle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="aspect-video border rounded-lg bg-muted/30 flex items-center justify-center p-4">
            <img src={resource.file_url} alt={resource.name} className="max-h-24 object-contain" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom (FR) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom (AR)</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                dir="rtl"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description (FR)</Label>
              <Textarea
                value={formData.description_fr}
                onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (AR)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                rows={2}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.name}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
