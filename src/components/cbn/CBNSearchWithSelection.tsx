import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CBNAdvancedSearch } from "./CBNAdvancedSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockDocuments, MockDocument } from "@/data/mockDocuments";

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Charger les résultats depuis sessionStorage au montage
  useEffect(() => {
    const savedResults = sessionStorage.getItem('cbn_search_results');
    if (savedResults) {
      try {
        setSearchResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Error parsing saved search results:', e);
      }
    }
  }, []);

  const handleSearch = async (criteria: any) => {
    setIsSearching(true);
    
    setTimeout(() => {
      // Filtrer les mockDocuments selon les critères de recherche
      let filteredDocs = [...mockDocuments];
      
      // Recherche simple (query)
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(query) ||
          doc.author.toLowerCase().includes(query) ||
          doc.cote.toLowerCase().includes(query) ||
          doc.supportType.toLowerCase().includes(query) ||
          (doc.keywords && doc.keywords.some(k => k.toLowerCase().includes(query)))
        );
      }
      
      // Filtres avancés
      if (criteria.title) {
        const title = criteria.title.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(title)
        );
      }
      
      if (criteria.author) {
        const author = criteria.author.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.author.toLowerCase().includes(author)
        );
      }
      
      if (criteria.publisher) {
        const publisher = criteria.publisher.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.publisher.toLowerCase().includes(publisher)
        );
      }
      
      if (criteria.year) {
        filteredDocs = filteredDocs.filter(doc => 
          parseInt(doc.year) >= parseInt(criteria.year)
        );
      }
      
      if (criteria.yearEnd) {
        filteredDocs = filteredDocs.filter(doc => 
          parseInt(doc.year) <= parseInt(criteria.yearEnd)
        );
      }
      
      if (criteria.cote) {
        const cote = criteria.cote.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.cote.toLowerCase().includes(cote)
        );
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
          filteredDocs = filteredDocs.filter(doc => 
            doc.supportType.toLowerCase().includes(targetType.toLowerCase())
          );
        }
      }
      
      // Mapper les documents au format SearchResult
      const results: SearchResult[] = filteredDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        author: doc.author,
        publisher: doc.publisher,
        year: doc.year,
        type: doc.supportType,
        status: doc.supportStatus === "libre_acces" ? "Libre accès" : 
                doc.supportStatus === "numerise" ? "Numérisé" : 
                "Non numérisé",
        cote: doc.cote
      }));
      
      setSearchResults(results);
      sessionStorage.setItem('cbn_search_results', JSON.stringify(results));
      setIsSearching(false);
    }, 500);
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
                          {mockDocuments.find(doc => doc.id === result.id)?.description || 
                           mockDocuments.find(doc => doc.id === result.id)?.summary || 
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
