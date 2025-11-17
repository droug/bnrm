import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface DynamicGridSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function DynamicGridSection({ section, language }: DynamicGridSectionProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { columns = 3, dataSource, itemsToShow = 6 } = section.props || {};

  const columnsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  useEffect(() => {
    loadData();
  }, [dataSource, itemsToShow]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (dataSource) {
        case 'recent_documents':
          await loadRecentDocuments();
          break;
        case 'featured_collections':
          await loadFeaturedCollections();
          break;
        case 'recent_content':
          await loadRecentContent();
          break;
        default:
          setData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentDocuments = async () => {
    const { data: documents, error } = await supabase
      .from('digital_library_documents')
      .select('id, title, title_ar, author, thumbnail_url, cover_image_url, document_type, publication_year, digital_collections, themes')
      .eq('access_level', 'public')
      .order('digitization_date', { ascending: false })
      .limit(itemsToShow);

    if (!error && documents) {
      setData(documents.map(doc => ({
        id: doc.id,
        title: language === 'ar' && doc.title_ar ? doc.title_ar : doc.title,
        description: doc.author,
        image: doc.cover_image_url || doc.thumbnail_url || '/placeholder.svg',
        type: doc.document_type,
        year: doc.publication_year,
        collections: doc.digital_collections,
        themes: doc.themes,
        link: `/digital-library/document/${doc.id}`
      })));
    }
  };

  const loadFeaturedCollections = async () => {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, description')
      .order('created_at', { ascending: false })
      .limit(itemsToShow);

    if (!error && collections) {
      setData(collections.map(col => ({
        id: col.id,
        title: col.name,
        description: col.description,
        link: `/digital-library/collections/${col.id}`
      })));
    }
  };

  const loadRecentContent = async () => {
    const { data: content, error } = await supabase
      .from('content')
      .select('id, title, excerpt, featured_image_url, published_at, view_count')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(itemsToShow);

    if (!error && content) {
      setData(content.map(item => ({
        id: item.id,
        title: item.title,
        description: item.excerpt,
        image: item.featured_image_url || '/placeholder.svg',
        published_at: item.published_at,
        view_count: item.view_count,
        link: `/digital-library/document/${item.id}`
      })));
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
          <p className="text-center text-muted-foreground">
            {language === 'ar' ? 'لا توجد بيانات متاحة' : 'Aucune donnée disponible'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>}
        {content && <p className="text-center text-muted-foreground mb-8">{content}</p>}
        
        <div className={`grid ${columnsClass} gap-6`}>
          {data.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {item.type && (
                    <Badge variant="secondary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {item.type}
                    </Badge>
                  )}
                  {item.year && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.year}
                    </Badge>
                  )}
                  {item.view_count && (
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.view_count}
                    </Badge>
                  )}
                </div>
                
                {item.collections && item.collections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.collections.slice(0, 2).map((col: string, idx: number) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {item.collections.length > 2 && (
                      <Badge variant="default" className="text-xs">
                        +{item.collections.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                
                {item.link && (
                  <Link to={item.link}>
                    <Button className="w-full" variant="outline">
                      {language === 'ar' ? 'استكشف' : 'Consulter'}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {dataSource === 'recent_documents' && (
          <div className="text-center mt-8">
            <Link to="/digital-library/search">
              <Button variant="default" size="lg">
                {language === 'ar' ? 'عرض جميع الوثائق' : 'Voir tous les documents'}
              </Button>
            </Link>
          </div>
        )}
        
        {dataSource === 'featured_collections' && (
          <div className="text-center mt-8">
            <Link to="/digital-library/collections">
              <Button variant="default" size="lg">
                {language === 'ar' ? 'عرض جميع المجموعات' : 'Voir toutes les collections'}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
