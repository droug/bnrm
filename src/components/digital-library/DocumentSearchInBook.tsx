import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, ChevronRight, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface SearchResult {
  page_id: string;
  page_number: number;
  ocr_text: string;
  match_count: number;
}

interface DocumentSearchInBookProps {
  documentId: string;
  onPageSelect: (pageNumber: number, highlightText?: string) => void;
  isOcrProcessed?: boolean;
}

export function DocumentSearchInBook({ documentId, onPageSelect, isOcrProcessed = false }: DocumentSearchInBookProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const performSearch = async () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_digital_library_pages', {
        p_document_id: documentId,
        p_query: query,
        p_context_words: 10
      });

      if (error) throw error;
      setResults((data || []) as SearchResult[]);
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
      if (query && query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const highlightQuery = (text: string) => {
    if (!query || !text) return text || '';
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark class="bg-yellow-300 dark:bg-yellow-700 px-0.5 rounded font-semibold">${part}</mark>`
        : part
    ).join('');
  };

  const getContextSnippet = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, maxLength) + '...';
    
    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + query.length + 60);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  };

  const totalMatches = results.reduce((sum, r) => sum + (r.match_count || 0), 0);

  if (!isOcrProcessed) {
    return (
      <Card className="fixed right-4 top-20 w-80 bg-background/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col z-50">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Recherche dans le document</h3>
          </div>
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Ce document n'a pas encore été traité par OCR.</p>
            <p className="text-xs mt-1">La recherche textuelle n'est pas disponible.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`fixed right-4 top-20 ${isExpanded ? 'bottom-4 w-96' : 'w-80'} bg-background/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col z-50 transition-all duration-300`}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" />
            Recherche par mot clé
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
            placeholder="Rechercher dans le document..."
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
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Recherche en cours...</p>
            </div>
          ) : results.length === 0 && query && query.length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat trouvé</p>
              <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
            </div>
          ) : query && query.length < 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Entrez au moins 2 caractères</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <button
                  key={result.page_id}
                  onClick={() => onPageSelect(result.page_number, query)}
                  className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Page {result.page_number}
                    </Badge>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {result.match_count} occurrence{result.match_count > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-xs leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(highlightQuery(getContextSnippet(result.ocr_text))) 
                        }}
                      />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </Card>
  );
}
