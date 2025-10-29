import { useState } from "react";
import { CBNAdvancedSearch } from "./CBNAdvancedSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (criteria: any) => {
    setIsSearching(true);
    
    // TODO: Remplacer par un vrai appel API au catalogue CBN
    // Simulation de résultats pour le moment
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Histoire du Maroc contemporain",
          author: "Mohamed El Mansour",
          publisher: "Éditions La Croisée des Chemins",
          year: "2020",
          type: "Livre",
          status: "Disponible",
          cote: "HIS-MAR-2020-001"
        },
        {
          id: "2",
          title: "La littérature marocaine francophone",
          author: "Tahar Ben Jelloun",
          publisher: "Éditions du Seuil",
          year: "2018",
          type: "Livre",
          status: "Disponible",
          cote: "LIT-MAR-2018-045"
        },
        {
          id: "3",
          title: "Architecture et urbanisme au Maroc",
          author: "Ahmed Skounti",
          publisher: "Centre Jacques-Berque",
          year: "2019",
          type: "Livre",
          status: "Consultation sur place",
          cote: "ARC-MAR-2019-023"
        },
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <CBNAdvancedSearch onSearch={handleSearch} compact={compact} />
      
      {searchResults.length > 0 && (
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">
              Résultats de recherche ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <Card 
                    key={result.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDocumentId === result.id 
                        ? 'border-2 border-primary bg-primary/5' 
                        : 'border border-border'
                    }`}
                    onClick={() => onSelectDocument(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-base leading-tight">
                                {result.title}
                              </h4>
                              {result.cote && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Cote: {result.cote}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {result.author && (
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{result.author}</span>
                              </div>
                            )}
                            {result.publisher && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{result.publisher}</span>
                              </div>
                            )}
                            {result.year && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{result.year}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {result.type && (
                              <Badge variant="secondary" className="text-xs">
                                {result.type}
                              </Badge>
                            )}
                            {result.status && (
                              <Badge 
                                variant={result.status === "Disponible" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {result.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {selectedDocumentId === result.id && (
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                        )}
                      </div>
                      
                      <Button 
                        variant={selectedDocumentId === result.id ? "default" : "outline"}
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDocument(result);
                        }}
                      >
                        {selectedDocumentId === result.id ? "Document sélectionné" : "Sélectionner ce document"}
                      </Button>
                    </CardContent>
                  </Card>
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
