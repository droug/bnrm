import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { generateArticleSchema } from "@/utils/seoUtils";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DOMPurify from "dompurify";

export default function NewsDetails() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: newsItem, isLoading } = useQuery({
    queryKey: ['bn-news-detail', newsId],
    queryFn: async () => {
      if (!newsId) return null;
      
      // Try by slug first, then by id
      let query = supabase.from('cms_actualites').select('*');
      
      // Check if newsId looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newsId);
      
      if (isUUID) {
        query = query.eq('id', newsId);
      } else {
        query = query.eq('slug', newsId);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!newsId,
  });

  const title = newsItem ? (language === 'ar' ? (newsItem.title_ar || newsItem.title_fr) : newsItem.title_fr) : '';
  const body = newsItem ? (language === 'ar' ? (newsItem.body_ar || newsItem.body_fr) : newsItem.body_fr) : '';
  const pubDate = newsItem?.date_publication || newsItem?.published_at || newsItem?.created_at;

  return (
    <DigitalLibraryLayout>
      <SEOHead
        title={title || 'Actualité'}
        description={newsItem?.chapo_fr || ''}
        keywords={["actualités BNRM", "nouvelles bibliothèque", newsItem?.category || '', "événements culturels"]}
        ogType="article"
        structuredData={title ? generateArticleSchema({
          title,
          description: newsItem?.chapo_fr || '',
          author: "BNRM",
          datePublished: pubDate || '',
        }) : undefined}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/digital-library/news')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux actualités
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !newsItem ? (
          <div className="text-center py-12 text-muted-foreground">
            Article non trouvé.
          </div>
        ) : (
          <article>
            <div className="mb-8">
              {newsItem.category && (
                <Badge className="mb-4">{newsItem.category}</Badge>
              )}
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              {pubDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(pubDate), 'dd MMMM yyyy', { locale: fr })}
                </div>
              )}
            </div>

            {newsItem.image_url && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img 
                  src={newsItem.image_url} 
                  alt={language === 'ar' ? (newsItem.image_alt_ar || title) : (newsItem.image_alt_fr || title)} 
                  className="w-full h-auto object-cover max-h-[400px]" 
                />
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                {body ? (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
                  />
                ) : (
                  <p className="text-muted-foreground">Aucun contenu disponible.</p>
                )}
              </CardContent>
            </Card>
          </article>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
