import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  X, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  Eye, 
  Globe,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface Content {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_body: string;
  content_type: 'news' | 'event' | 'exhibition' | 'page';
  status: 'draft' | 'published' | 'archived';
  featured_image_url?: string;
  author_id: string;
  published_at?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface ContentEditorProps {
  content?: Content | null;
  onSave: () => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  content_type: string;
}

export default function ContentEditor({ content, onSave, onCancel }: ContentEditorProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content_body: '',
    content_type: 'news' as 'news' | 'event' | 'exhibition' | 'page',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured_image_url: '',
    start_date: '',
    end_date: '',
    location: '',
    tags: [] as string[],
    meta_title: '',
    meta_description: '',
    seo_keywords: [] as string[],
    is_featured: false
  });

  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchCategories();
    
    if (content) {
      setFormData({
        title: content.title || '',
        slug: content.slug || '',
        excerpt: content.excerpt || '',
        content_body: content.content_body || '',
        content_type: content.content_type || 'news',
        status: content.status || 'draft',
        featured_image_url: content.featured_image_url || '',
        start_date: content.start_date ? content.start_date.split('T')[0] : '',
        end_date: content.end_date ? content.end_date.split('T')[0] : '',
        location: content.location || '',
        tags: content.tags || [],
        meta_title: content.meta_title || '',
        meta_description: content.meta_description || '',
        seo_keywords: content.seo_keywords || [],
        is_featured: content.is_featured || false
      });
    }
  }, [content]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = async (title: string) => {
    if (!title) return '';
    
    try {
      const { data, error } = await supabase.rpc('generate_content_slug', { title });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating slug:', error);
      // Fallback local slug generation
      return title
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  };

  const handleTitleChange = async (title: string) => {
    setFormData(prev => ({ ...prev, title }));
    
    if (!content && title) {
      const slug = await generateSlug(title);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.seo_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...prev.seo_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: prev.seo_keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content_body.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et le contenu sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const contentData = {
        ...formData,
        author_id: user?.id,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (content) {
        // Update existing content
        const { error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', content.id);

        if (error) throw error;

        toast({
          title: "Contenu mis à jour",
          description: "Le contenu a été mis à jour avec succès",
        });
      } else {
        // Create new content
        const { error } = await supabase
          .from('content')
          .insert(contentData);

        if (error) throw error;

        toast({
          title: "Contenu créé",
          description: "Le contenu a été créé avec succès",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le contenu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableCategories = categories.filter(cat => 
    cat.content_type === formData.content_type
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {content ? 'Modifier le contenu' : 'Nouveau contenu'}
                </h1>
                <p className="text-muted-foreground">
                  {content ? `Modification de "${content.title}"` : 'Créez un nouveau contenu'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contenu Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Titre du contenu"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-du-contenu"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Résumé</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Court résumé du contenu"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content_body">Contenu *</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant={showPreview ? "outline" : "default"} 
                        size="sm"
                        onClick={() => setShowPreview(false)}
                      >
                        Éditer
                      </Button>
                      <Button 
                        type="button" 
                        variant={showPreview ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                    </div>
                  </div>
                  
                  {showPreview ? (
                    <div 
                      className="border rounded-md p-4 min-h-[360px] max-h-[500px] overflow-auto bg-background prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.content_body }}
                    />
                  ) : (
                    <Textarea
                      id="content_body"
                      value={formData.content_body}
                      onChange={(e) => setFormData(prev => ({ ...prev, content_body: e.target.value }))}
                      placeholder="Rédigez votre contenu ici..."
                      rows={15}
                      className="font-mono"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous pouvez utiliser du HTML pour la mise en forme
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informations supplémentaires pour événements et expositions */}
            {(formData.content_type === 'event' || formData.content_type === 'exhibition') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informations {formData.content_type === 'event' ? 'Événement' : 'Exposition'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Date de début</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Date de fin</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lieu de l'événement ou de l'exposition"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Référencement (SEO)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Titre SEO</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_title.length}/60 caractères recommandés
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_description">Description SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 caractères recommandés
                  </p>
                </div>

                <div>
                  <Label>Mots-clés SEO</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Ajouter un mot-clé"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    />
                    <Button type="button" onClick={handleAddKeyword} size="sm">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seo_keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Options de publication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Publication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content_type">Type de contenu</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, content_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">Actualité</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="exhibition">Exposition</SelectItem>
                      <SelectItem value="page">Page informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Contenu en vedette</Label>
                </div>
              </CardContent>
            </Card>

            {/* Image à la une */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image à la une
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="featured_image_url">URL de l'image</Label>
                  <Input
                    id="featured_image_url"
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formData.featured_image_url && (
                  <div className="mt-3">
                    <img
                      src={formData.featured_image_url}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}