import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CBNAdvancedSearch } from "./CBNAdvancedSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
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
    
    // TODO: Remplacer par un vrai appel API au catalogue CBN
    // Simulation de résultats pour le moment
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Histoire de la littérature marocaine moderne",
          author: "Ahmed Ben Mohammed",
          publisher: "Éditions Atlas",
          year: "2023",
          type: "Livre",
          status: "Libre accès",
          cote: "840.MAR.BEN"
        },
        {
          id: "2",
          title: "Manuscrits enluminés du Maroc médiéval",
          author: "Hassan El Fassi",
          publisher: "Publications de la BNRM",
          year: "2022",
          type: "Manuscrit",
          status: "Numérisé",
          cote: "091.MAR.ELF"
        },
        {
          id: "3",
          title: "Archives royales du Maroc : Correspondances diplomatiques 1912-1956",
          author: "Mohammed Kenbib",
          publisher: "Éditions du Palais Royal",
          year: "2023",
          type: "Archives",
          status: "Non numérisé",
          cote: "327.64.KEN"
        },
        {
          id: "4",
          title: "Revue marocaine d'études juridiques et politiques",
          author: "Collectif",
          publisher: "Faculté de Droit - Rabat",
          year: "2024",
          type: "Périodique",
          status: "Numérisé",
          cote: "340.05.REV"
        },
        {
          id: "5",
          title: "Architecture et urbanisme au Maroc",
          author: "Ahmed Skounti",
          publisher: "Centre Jacques-Berque",
          year: "2019",
          type: "Livre",
          status: "Disponible",
          cote: "ARC-MAR-2019-023"
        },
      ];
      
      setSearchResults(mockResults);
      // Sauvegarder les résultats dans sessionStorage
      sessionStorage.setItem('cbn_search_results', JSON.stringify(mockResults));
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
                        
                        {/* Description - mock for now */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.title.includes("littérature") && "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne, de l'indépendance à nos jours. Il analyse les principaux courants littéraires, les auteurs majeurs et les thèmes récurrents qui caractérisent cette période riche en productions."}
                          {result.title.includes("Manuscrits") && "Catalogue exhaustif des manuscrits enluminés conservés à la Bibliothèque Nationale. Cet ouvrage présente une analyse détaillée de l'art de l'enluminure au Maroc médiéval, avec des reproductions haute résolution de pages exceptionnelles."}
                          {result.title.includes("Archives") && "Recueil de correspondances diplomatiques entre le Maroc et diverses puissances étrangères durant la période du protectorat. Documents d'archives inédits accompagnés d'analyses contextuelles."}
                          {result.title.includes("Revue") && "Revue académique trimestrielle consacrée aux études juridiques et politiques au Maroc et dans le monde arabe. Numéro spécial sur les réformes constitutionnelles."}
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
