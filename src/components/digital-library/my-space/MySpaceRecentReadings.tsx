import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@iconify/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReadingHistoryItem {
  id: string;
  content_id: string | null;
  manuscript_id: string | null;
  content_type: string;
  title: string;
  author: string | null;
  thumbnail_url: string | null;
  last_page_read: number | null;
  reading_progress: number;
  created_at: string;
}

export function MySpaceRecentReadings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [readings, setReadings] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReadings();
    }
  }, [user]);

  const loadReadings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error loading reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeReading = (item: ReadingHistoryItem) => {
    if (item.manuscript_id) {
      navigate(`/manuscript-reader/${item.manuscript_id}?page=${item.last_page_read || 1}`);
    } else if (item.content_id) {
      navigate(`/digital-library/book-reader/${item.content_id}?page=${item.last_page_read || 1}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manuscript': return 'mdi:script-text';
      case 'book': return 'mdi:book-open-page-variant';
      case 'periodical': return 'mdi:newspaper-variant';
      case 'audio': return 'mdi:music';
      case 'video': return 'mdi:video';
      default: return 'mdi:file-document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manuscript': return 'bg-amber-100 text-amber-700';
      case 'book': return 'bg-blue-100 text-blue-700';
      case 'periodical': return 'bg-purple-100 text-purple-700';
      case 'audio': return 'bg-pink-100 text-pink-700';
      case 'video': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card className="border-bn-blue-primary/10">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bn-blue-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-bn-blue-primary/10 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5 pb-4">
        <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
          <div className="p-2 rounded-lg bg-gold-bn-primary/10">
            <Icon icon="mdi:clock-outline" className="h-5 w-5 text-gold-bn-primary" />
          </div>
          <div>
            <span className="text-lg">Dernières lectures</span>
            {readings.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {readings.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {readings.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Icon icon="mdi:book-open-blank-variant" className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <div>
              <p className="text-sm text-muted-foreground">
                Aucune lecture récente
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Parcourez la bibliothèque pour commencer
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/digital-library')}
              className="mt-2"
            >
              <Icon icon="mdi:bookshelf" className="h-4 w-4 mr-2" />
              Explorer
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-2">
            <div className="space-y-2">
              {readings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-gold-bn-primary/30 hover:bg-accent/30 transition-all cursor-pointer group"
                  onClick={() => handleResumeReading(item)}
                >
                  {/* Thumbnail or Icon */}
                  <div className="flex-shrink-0">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className={cn(
                        "w-12 h-16 rounded flex items-center justify-center",
                        getTypeColor(item.content_type)
                      )}>
                        <Icon icon={getTypeIcon(item.content_type)} className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">
                      {item.title}
                    </p>
                    {item.author && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.author}
                      </p>
                    )}
                    
                    {/* Progress */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        {item.reading_progress > 0 && (
                          <span className="font-medium text-bn-blue-primary">
                            {Math.round(item.reading_progress)}%
                          </span>
                        )}
                      </div>
                      {item.reading_progress > 0 && (
                        <Progress 
                          value={item.reading_progress} 
                          className="h-1.5"
                        />
                      )}
                    </div>
                  </div>

                  {/* Resume button */}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-gold-bn-primary hover:text-gold-bn-primary hover:bg-gold-bn-primary/10 self-center"
                  >
                    <Icon icon="mdi:play-circle" className="h-4 w-4" />
                    <span className="hidden sm:inline">Reprendre</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
