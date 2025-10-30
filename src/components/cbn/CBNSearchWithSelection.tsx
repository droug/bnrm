import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CBNAdvancedSearch } from "./CBNAdvancedSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  year?: string;
  type?: string;
  status?: string;
  cote?: string;
}

interface CBNSearchWithSelectionProps {
  onSelectDocument: (document: SearchResult) => void;
  selectedDocumentId?: string;
  compact?: boolean;
}

export function CBNSearchWithSelection({ 
  onSelectDocument, 
  selectedDocumentId,
  compact = false 
}: CBNSearchWithSelectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documentsCache, setDocumentsCache] = useState<Record<string, any>>({});

  // Charger les documents depuis Supabase pour le cache
  useEffect(() => {
    const loadDocuments = async () => {
      const { data, error } = await supabase
        .from('cbn_catalog_documents')
        .select('*');
      
      if (data && !error) {
        const cache = data.reduce((acc, doc) => {
          acc[doc.id] = doc;
          return acc;
        }, {} as Record<string, any>);
        setDocumentsCache(cache);
      }
    };
    
    loadDocuments();
  }, []);

  const handleSearch = async (criteria: any) => {
    setIsSearching(true);
    
    try {
      // Construire la requête Supabase
      let query = supabase
        .from('cbn_catalog_documents')
        .select('*');
      
      // Recherche simple (query)
      if (criteria.query) {
        const searchQuery = criteria.query.toLowerCase();
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,cote.ilike.%${searchQuery}%,support_type.ilike.%${searchQuery}%,keywords.cs.{${searchQuery}}`);
      }
      
      // Filtres avancés
      if (criteria.title) {
        query = query.ilike('title', `%${criteria.title}%`);
      }
      
      if (criteria.author) {
        query = query.ilike('author', `%${criteria.author}%`);
      }
      
      if (criteria.publisher) {
        query = query.ilike('publisher', `%${criteria.publisher}%`);
      }
      
      if (criteria.year) {
        query = query.gte('year', criteria.year);
      }
      
      if (criteria.yearEnd) {
        query = query.lte('year', criteria.yearEnd);
      }
      
      if (criteria.cote) {
        query = query.ilike('cote', `%${criteria.cote}%`);
      }
      
      if (criteria.documentType && criteria.documentType !== "all") {
        const typeMap: Record<string, string> = {
          "book": "Livre",
          "periodical": "Périodique",
          "thesis": "Thèse",
          "manuscript": "Manuscrit",
          "microfilm": "Microfilm",
          "digital": "CD-ROM"
        };
        const targetType = typeMap[criteria.documentType];
        if (targetType) {
          query = query.ilike('support_type', `%${targetType}%`);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error searching documents:', error);
        toast({
          title: "Erreur de recherche",
          description: "Impossible de rechercher les documents",
          variant: "destructive",
        });
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      // Mapper les documents au format SearchResult
      const results: SearchResult[] = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        author: doc.author,
        publisher: doc.publisher,
        year: doc.year,
        type: doc.support_type,
        status: doc.support_status === "libre_acces" ? "Libre accès" : 
                doc.support_status === "numerise" ? "Numérisé" : 
                "Non numérisé",
        cote: doc.cote
      }));
      
      setSearchResults(results);
      sessionStorage.setItem('cbn_search_results', JSON.stringify(results));
    } catch (error) {
      console.error('Error searching documents:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative z-10">
        <CBNAdvancedSearch onSearch={handleSearch} compact={compact} />
      </div>
      
      {searchResults.length > 0 && (
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">
              Résultats de recherche ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className={`p-4 border rounded-lg transition-all ${
                      selectedDocumentId === result.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Title with icon */}
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <h4 className="font-semibold text-base leading-tight">
                            {result.title}
                          </h4>
                        </div>
                        
                        {/* Author, Year, Publisher */}
                        <p className="text-sm text-muted-foreground">
                          {result.author && `Par ${result.author}`}
                          {result.author && result.year && ' • '}
                          {result.year}
                          {(result.author || result.year) && result.publisher && ' • '}
                          {result.publisher}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {result.status && (
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              {result.status}
                            </Badge>
                          )}
                          {result.type && (
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          )}
                          {result.cote && (
                            <Badge variant="outline" className="text-xs">
                              {result.cote}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {documentsCache[result.id]?.description || 
                           documentsCache[result.id]?.summary || 
                           "Description non disponible"}
                        </p>
                      </div>
                      
                      {/* Details Button */}
                      <Button 
                        className="shrink-0"
                        onClick={() => navigate(`/cbn/notice/${result.id}`)}
                      >
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Recherche en cours...</p>
        </div>
      )}
      
      {!isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Lancez une recherche pour afficher les résultats</p>
        </div>
      )}
    </div>
  );
}
