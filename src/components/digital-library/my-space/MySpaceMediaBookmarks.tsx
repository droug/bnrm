import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@iconify/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MediaBookmarkWithDocument {
  id: string;
  document_id: string;
  timestamp_seconds: number;
  label: string | null;
  created_at: string;
  document?: {
    id: string;
    title: string;
    document_type: string;
    thumbnail_url?: string;
  };
}

export function MySpaceMediaBookmarks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<MediaBookmarkWithDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;
    
    try {
      // Fetch media bookmarks with document info
      const { data, error } = await supabase
        .from('media_bookmarks')
        .select(`
          id,
          document_id,
          timestamp_seconds,
          label,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch document details for each bookmark
      if (data && data.length > 0) {
        const documentIds = [...new Set(data.map(b => b.document_id))];
        const { data: documents } = await supabase
          .from('digital_library_documents')
          .select('id, title, document_type, thumbnail_url')
          .in('id', documentIds);

        const bookmarksWithDocs = data.map(bookmark => ({
          ...bookmark,
          document: documents?.find(d => d.id === bookmark.document_id)
        }));

        setBookmarks(bookmarksWithDocs);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error('Error loading media bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResumePlayback = (bookmark: MediaBookmarkWithDocument) => {
    navigate(`/digital-library/book-reader/${bookmark.document_id}?t=${Math.floor(bookmark.timestamp_seconds)}`);
  };

  const getDocumentIcon = (type?: string) => {
    if (type === 'audio') return 'mdi:music';
    if (type === 'video') return 'mdi:video';
    return 'mdi:file-document';
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
            <Icon icon="mdi:bookmark-music" className="h-5 w-5 text-gold-bn-primary" />
          </div>
          <div>
            <span className="text-lg">Marque-pages média</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Icon icon="mdi:bookmark-off-outline" className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <div>
              <p className="text-sm text-muted-foreground">
                Aucun marque-page audio ou vidéo
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Marquez des positions dans les documents audio/vidéo pour reprendre la lecture
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-gold-bn-primary/30 hover:bg-accent/30 transition-all cursor-pointer group"
                  onClick={() => handleResumePlayback(bookmark)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                    bookmark.document?.document_type === 'audio' 
                      ? "bg-purple-100 text-purple-600" 
                      : "bg-blue-100 text-blue-600"
                  )}>
                    <Icon icon={getDocumentIcon(bookmark.document?.document_type)} className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">
                      {bookmark.label || bookmark.document?.title || 'Document sans titre'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
                        {formatTime(bookmark.timestamp_seconds)}
                      </Badge>
                      {bookmark.document?.document_type && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {bookmark.document.document_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resume button */}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-gold-bn-primary hover:text-gold-bn-primary hover:bg-gold-bn-primary/10"
                  >
                    <Icon icon="mdi:play" className="h-4 w-4" />
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
