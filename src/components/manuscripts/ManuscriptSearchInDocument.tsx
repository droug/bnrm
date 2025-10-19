import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, ChevronRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface SearchMatch {
  page_id: string;
  page_number: number;
  matches: {
    text: string;
    paragraphs: any[];
    positions: Array<{
      start: number;
      length: number;
      context: string;
    }>;
  };
}

interface ManuscriptSearchInDocumentProps {
  manuscriptId: string;
  onPageSelect: (pageNumber: number, highlightText?: string) => void;
}

export function ManuscriptSearchInDocument({ manuscriptId, onPageSelect }: ManuscriptSearchInDocumentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_manuscript_pages', {
        p_manuscript_id: manuscriptId,
        p_query: query,
        p_context_words: 10
      });

      if (error) throw error;
      setResults((data || []) as any);
      setIsExpanded(true);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const highlightQuery = (text: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark class="bg-yellow-300 dark:bg-yellow-700 px-0.5 rounded font-semibold">${part}</mark>`
        : part
    ).join('');
  };

  const totalMatches = results.reduce((sum, r) => sum + (r.matches.positions?.length || 0), 0);

  return (
    <Card className={`fixed right-4 top-20 ${isExpanded ? 'bottom-4 w-96' : 'w-80'} bg-background/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col z-50 transition-all duration-300`}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            Recherche dans le document
          </h3>
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsExpanded(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                performSearch();
              }
            }}
          />
        </div>

        {totalMatches > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalMatches} occurrence{totalMatches > 1 ? 's' : ''} trouvée{totalMatches > 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {results.length} page{results.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {isExpanded && (
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Recherche en cours...</p>
            </div>
          ) : results.length === 0 && query ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.page_id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Page {result.page_number}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.matches.positions?.length || 0} occurrence{(result.matches.positions?.length || 0) > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {result.matches.positions?.slice(0, 3).map((position, idx) => (
                      <button
                        key={idx}
                        onClick={() => onPageSelect(result.page_number, query)}
                        className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p 
                              className="text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(highlightQuery(position.context)) }}
                            />
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}

                    {(result.matches.positions?.length || 0) > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        + {(result.matches.positions?.length || 0) - 3} autre{(result.matches.positions?.length || 0) - 3 > 1 ? 's' : ''} occurrence{(result.matches.positions?.length || 0) - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </Card>
  );
}