import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronUp, ChevronDown, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface SearchResult {
  page_id: string;
  page_number: number;
  ocr_text: string;
  match_count: number;
}

interface SidebarSearchInBookProps {
  documentId: string;
  onPageSelect: (pageNumber: number, highlightText?: string) => void;
  /** @deprecated Cette prop n'est plus utilisée, la vérification se fait directement via la base de données */
  isOcrProcessed?: boolean;
}

export function SidebarSearchInBook({ documentId, onPageSelect }: SidebarSearchInBookProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [hasOcrPages, setHasOcrPages] = useState<boolean | null>(null);

  // Vérifier si le document a des pages OCR indexées
  // On vérifie directement dans la base de données, indépendamment du flag isOcrProcessed
  // car celui-ci peut être désynchronisé ou mis à jour tardivement
  useEffect(() => {
    const checkOcrPages = async () => {
      if (!documentId) {
        setHasOcrPages(false);
        return;
      }
      
      try {
        console.log('[SidebarSearchInBook] Vérification pages OCR pour document:', documentId);
        
        // Vérifier directement si des pages avec texte OCR existent
        const { count, error } = await supabase
          .from('digital_library_pages')
          .select('*', { count: 'exact', head: true })
          .eq('document_id', documentId)
          .not('ocr_text', 'is', null);
        
        if (error) {
          console.error('[SidebarSearchInBook] Erreur requête pages:', error);
          throw error;
        }
        
        const hasPages = (count || 0) > 0;
        console.log('[SidebarSearchInBook] Pages OCR trouvées:', count, '- hasOcrPages:', hasPages);
        setHasOcrPages(hasPages);
      } catch (error) {
        console.error('[SidebarSearchInBook] Erreur vérification OCR:', error);
        setHasOcrPages(false);
      }
    };

    checkOcrPages();
  }, [documentId]);

  const performSearch = async () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setCurrentResultIndex(0);
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
      const searchResults = (data || []) as SearchResult[];
      setResults(searchResults);
      setCurrentResultIndex(0);
      
      // Aller automatiquement à la première occurrence
      if (searchResults.length > 0) {
        onPageSelect(searchResults[0].page_number, query);
      }
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
        setCurrentResultIndex(0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const goToPreviousResult = useCallback(() => {
    if (results.length === 0) return;
    const newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : results.length - 1;
    setCurrentResultIndex(newIndex);
    onPageSelect(results[newIndex].page_number, query);
  }, [results, currentResultIndex, query, onPageSelect]);

  const goToNextResult = useCallback(() => {
    if (results.length === 0) return;
    const newIndex = currentResultIndex < results.length - 1 ? currentResultIndex + 1 : 0;
    setCurrentResultIndex(newIndex);
    onPageSelect(results[newIndex].page_number, query);
  }, [results, currentResultIndex, query, onPageSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        goToPreviousResult();
      } else {
        goToNextResult();
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setCurrentResultIndex(0);
  };

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

  const getContextSnippet = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, maxLength) + '...';
    
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + query.length + 40);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  };

  const totalMatches = results.reduce((sum, r) => sum + (r.match_count || 0), 0);

  // Chargement en cours de la vérification OCR
  if (hasOcrPages === null) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!hasOcrPages) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Recherche non disponible</p>
          <p className="text-xs mt-2">
            Ce document n'a pas encore été traité par OCR ou le texte n'a pas été indexé.
          </p>
          <p className="text-xs mt-1">La recherche textuelle sera disponible après le traitement.</p>
          <a 
            href="/admin/digital-library/documents" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-xs text-primary hover:underline"
          >
            → Accéder à l'outil d'import OCR
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche style Word */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-20"
          />
          {query && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation entre résultats */}
        {results.length > 0 && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {currentResultIndex + 1} sur {results.length} page{results.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToPreviousResult}
                title="Résultat précédent (Shift+Entrée)"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNextResult}
                title="Résultat suivant (Entrée)"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        {totalMatches > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {totalMatches} occurrence{totalMatches > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Liste des résultats */}
      <ScrollArea className="h-[calc(100vh-450px)]">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Recherche en cours...</p>
          </div>
        ) : results.length === 0 && query && query.length >= 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun résultat trouvé</p>
            <p className="text-xs mt-1">Essayez un autre terme</p>
          </div>
        ) : !query ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Recherche par mot clé</p>
            <p className="text-xs mt-1">Entrez un terme pour rechercher dans le document</p>
            <p className="text-xs mt-2 text-muted-foreground/70">
              Utilisez Entrée pour naviguer entre les résultats
            </p>
          </div>
        ) : query.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Entrez au moins 2 caractères</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <button
                key={result.page_id}
                onClick={() => {
                  setCurrentResultIndex(index);
                  onPageSelect(result.page_number, query);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  index === currentResultIndex 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge 
                    variant={index === currentResultIndex ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    Page {result.page_number}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {result.match_count} occ.
                  </span>
                </div>

                <p 
                  className="text-xs leading-relaxed text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(highlightQuery(getContextSnippet(result.ocr_text))) 
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
