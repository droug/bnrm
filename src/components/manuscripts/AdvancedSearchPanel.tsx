import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, Filter, Calendar, BookOpen, User, MapPin, Tag } from "lucide-react";

interface AdvancedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  author: string;
  title: string;
  subject: string[];
  genre: string;
  language: string;
  yearFrom: string;
  yearTo: string;
  period: string;
  cote: string;
  source: string;
  status: string;
}

export function AdvancedSearchPanel({ isOpen, onClose, onSearch }: AdvancedSearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    author: "",
    title: "",
    subject: [],
    genre: "",
    language: "",
    yearFrom: "",
    yearTo: "",
    period: "",
    cote: "",
    source: "",
    status: ""
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const emptyFilters: SearchFilters = {
      query: "",
      author: "",
      title: "",
      subject: [],
      genre: "",
      language: "",
      yearFrom: "",
      yearTo: "",
      period: "",
      cote: "",
      source: "",
      status: ""
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recherche Avancée
          </SheetTitle>
          <SheetDescription>
            Affinez votre recherche avec plusieurs critères
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Recherche plein texte */}
            <div className="space-y-2">
              <Label htmlFor="query" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Recherche plein texte
              </Label>
              <Input
                id="query"
                placeholder="Mots-clés dans tout le contenu..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>

            <Separator />

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Titre
              </Label>
              <Input
                id="title"
                placeholder="Titre du manuscrit..."
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
              />
            </div>

            {/* Auteur */}
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Auteur
              </Label>
              <Input
                id="author"
                placeholder="Nom de l'auteur..."
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
              />
            </div>

            {/* Langue */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Langue
              </Label>
              <Select value={filters.language} onValueChange={(v) => handleFilterChange('language', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les langues</SelectItem>
                  <SelectItem value="arabe">Arabe</SelectItem>
                  <SelectItem value="français">Français</SelectItem>
                  <SelectItem value="berbère">Berbère</SelectItem>
                  <SelectItem value="latin">Latin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Genre
              </Label>
              <Select value={filters.genre} onValueChange={(v) => handleFilterChange('genre', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les genres</SelectItem>
                  <SelectItem value="littérature">Littérature</SelectItem>
                  <SelectItem value="poésie">Poésie</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="religion">Religion</SelectItem>
                  <SelectItem value="philosophie">Philosophie</SelectItem>
                  <SelectItem value="histoire">Histoire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Période */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Période historique
              </Label>
              <Select value={filters.period} onValueChange={(v) => handleFilterChange('period', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les périodes</SelectItem>
                  <SelectItem value="médiéval">Médiéval</SelectItem>
                  <SelectItem value="moderne">Moderne</SelectItem>
                  <SelectItem value="contemporain">Contemporain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Année de publication */}
            <div className="space-y-2">
              <Label>Année de publication</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="De"
                  value={filters.yearFrom}
                  onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="À"
                  value={filters.yearTo}
                  onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                />
              </div>
            </div>

            {/* Cote */}
            <div className="space-y-2">
              <Label htmlFor="cote">Cote</Label>
              <Input
                id="cote"
                placeholder="Cote du manuscrit..."
                value={filters.cote}
                onChange={(e) => handleFilterChange('cote', e.target.value)}
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="Source du manuscrit..."
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="digitization">Numérisation</SelectItem>
                  <SelectItem value="reserved">Réservé</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Rechercher {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}