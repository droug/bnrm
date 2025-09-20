import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Eye, 
  Tag, 
  Search,
  Filter,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_body: string;
  featured_image_url?: string;
  published_at: string;
  tags?: string[];
  is_featured: boolean;
  view_count: number;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function News() {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content_body,
          featured_image_url,
          published_at,
          tags,
          is_featured,
          view_count,
          profiles:author_id (first_name, last_name)
        `)
        .eq('content_type', 'news')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les actualités",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('id, name, slug, color')
        .eq('content_type', 'news')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const incrementViewCount = async (newsId: string) => {
    try {
      // Get current view count and increment it
      const { data: currentData } = await supabase
        .from('content')
        .select('view_count')
        .eq('id', newsId)
        .single();
      
      if (currentData) {
        await supabase
          .from('content')
          .update({ view_count: (currentData.view_count || 0) + 1 })
          .eq('id', newsId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    incrementViewCount(newsItem.id);
    // Navigate to news detail page (to be implemented)
    console.log('Navigate to:', `/news/${newsItem.slug}`);
  };

  // Get all unique tags from news
  const allTags = Array.from(
    new Set(news.flatMap(item => item.tags || []))
  ).sort();

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === "all" || item.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const featuredNews = filteredNews.filter(item => item.is_featured).slice(0, 3);
  const regularNews = filteredNews.filter(item => !item.is_featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Actualités
          </h1>
          <p className="text-xl text-muted-foreground">
            Découvrez les dernières nouvelles et actualités de la Bibliothèque Nationale du Royaume du Maroc
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les actualités..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sujets</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              À la une
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredNews.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleNewsClick(item)}
                >
                  {item.featured_image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.featured_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Star className="h-3 w-3 mr-1" />
                          À la une
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.published_at)}
                      <span>•</span>
                      <Eye className="h-4 w-4" />
                      {item.view_count} vues
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.excerpt && (
                      <p className="text-muted-foreground mb-4">
                        {truncateText(item.excerpt, 120)}
                      </p>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {item.profiles && (
                        <span className="text-sm text-muted-foreground">
                          Par {item.profiles.first_name} {item.profiles.last_name}
                        </span>
                      )}
                      
                      <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular News */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {featuredNews.length > 0 ? 'Autres actualités' : 'Toutes les actualités'}
          </h2>
          
          {regularNews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularNews.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleNewsClick(item)}
                >
                  {item.featured_image_url && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.featured_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.published_at)}
                      <span>•</span>
                      <Eye className="h-4 w-4" />
                      {item.view_count} vues
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.excerpt && (
                      <p className="text-muted-foreground mb-4 text-sm">
                        {truncateText(item.excerpt, 100)}
                      </p>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {item.profiles && (
                        <span className="text-xs text-muted-foreground">
                          {item.profiles.first_name} {item.profiles.last_name}
                        </span>
                      )}
                      
                      <Button variant="ghost" size="sm" className="text-xs">
                        Lire
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune actualité trouvée</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Aucune actualité ne correspond à votre recherche" : "Aucune actualité disponible pour le moment"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Newsletter Subscription */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé des dernières actualités
            </h3>
            <p className="mb-6 opacity-90">
              Recevez nos actualités directement dans votre boîte e-mail
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Votre adresse e-mail"
                className="bg-white text-foreground"
              />
              <Button variant="secondary">
                S'abonner
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}