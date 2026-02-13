import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BNPageHeader } from "@/components/digital-library/shared";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function NewsEvents() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['bn-news-events', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_actualites')
        .select('*')
        .eq('status', 'published')
        .order('date_publication', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const getCategoryStyles = (category: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      "Nouvelle collection": { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/20" },
      "Exposition": { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/20" },
      "Dépôt légal": { bg: "bg-green-500/10", text: "text-green-700", border: "border-green-500/20" },
      "Partenariat": { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/20" },
      "Formation": { bg: "bg-pink-500/10", text: "text-pink-700", border: "border-pink-500/20" },
      "Technologie": { bg: "bg-cyan-500/10", text: "text-cyan-700", border: "border-cyan-500/20" },
    };
    return styles[category] || { bg: "bg-gray-500/10", text: "text-gray-700", border: "border-gray-500/20" };
  };

  return (
    <DigitalLibraryLayout>
      <BNPageHeader
        title="Actualités & Événements"
        subtitle="Restez informé des dernières nouvelles et événements de la bibliothèque numérique"
        icon="mdi:newspaper-variant-outline"
      />

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucune actualité publiée pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => {
              const title = language === 'ar' ? (item.title_ar || item.title_fr) : item.title_fr;
              const excerpt = language === 'ar' ? (item.chapo_ar || item.chapo_fr) : item.chapo_fr;
              const category = item.category || 'Actualité';
              const categoryStyle = getCategoryStyles(category);
              const pubDate = item.date_publication || item.created_at;

              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col"
                  onClick={() => navigate(`/digital-library/news/${item.slug || item.id}`)}
                >
                  <CardHeader className="pb-3">
                    {item.image_url ? (
                      <div className="aspect-video rounded-xl mb-4 overflow-hidden relative">
                        <img 
                          src={item.image_url.startsWith('/') ? `${window.location.origin}${item.image_url}` : item.image_url} 
                          alt={title} 
                          className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-500/20 via-amber-500/10 to-blue-500/10 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500/60"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-bn-blue-primary/20 via-gold-bn-primary/10 to-bn-blue-primary/10 rounded-xl mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <Icon icon="mdi:newspaper-variant-outline" className="h-12 w-12 text-bn-blue-primary/60" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} font-medium`}>
                        {category}
                      </Badge>
                      {pubDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(pubDate), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-lg group-hover:text-bn-blue-primary transition-colors line-clamp-2">
                      {title}
                    </CardTitle>
                    {excerpt && (
                      <CardDescription className="line-clamp-3 text-sm">
                        {excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0 mt-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {item.view_count || 0} vues
                      </span>
                      <span className="text-bn-blue-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Lire la suite
                        <Icon icon="mdi:arrow-right" className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
