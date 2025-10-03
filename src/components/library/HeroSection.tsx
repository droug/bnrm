import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronDown, X, BookOpen, Book, FileText, Globe, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: { type: string; value: string }[];
  onAddFilter: (type: string, value: string) => void;
  onRemoveFilter: (type: string) => void;
  onClearSearch: () => void;
  onSearch: (e: React.FormEvent) => void;
  backgroundImage: string;
}

export function HeroSection({
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearSearch,
  onSearch,
  backgroundImage,
}: HeroSectionProps) {
  const getFilterLabel = (type: string) => {
    const labels: Record<string, string> = {
      'author': 'Auteur',
      'publisher': 'Éditeur',
      'genre': 'Genre',
      'publication_year': 'Année',
      'publication_month': 'Mois',
      'language': 'Langue',
      'content_type': 'Type'
    };
    return labels[type] || type;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  return (
    <section className="relative mb-12 py-24 md:py-32 px-8 rounded-3xl border-4 border-gold/40 overflow-hidden shadow-2xl">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/40 to-accent/50" />
      <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10" />
      
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-moroccan font-bold text-white mb-6 drop-shadow-2xl">
          {title}
        </h1>
        <p className="text-2xl md:text-3xl text-white mb-10 max-w-4xl mx-auto drop-shadow-2xl font-elegant">
          {subtitle}
        </p>
        
        <div className="max-w-4xl mx-auto space-y-3">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter.type} 
                  variant="secondary" 
                  className="gap-1.5 bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors px-3 py-1.5"
                >
                  <span className="text-sm font-medium">
                    {getFilterLabel(filter.type)}: {filter.value}
                  </span>
                  <button
                    onClick={() => onRemoveFilter(filter.type)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="h-7 px-2 text-white/90 hover:text-white hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Tout effacer
              </Button>
            </div>
          )}

          <form onSubmit={onSearch} className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="h-16 px-4 gap-2 bg-white/95 hover:bg-white border-3 border-gold/30 shadow-lg shrink-0"
                >
                  <Filter className="h-5 w-5" />
                  <span className="hidden sm:inline">Filtres</span>
                  <ChevronDown className="h-4 w-4" />
                  {activeFilters.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-background border-border z-50 shadow-xl">
                <DropdownMenuLabel className="text-base">Filtrer par critère</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {
                  const value = prompt("Nom de l'auteur:");
                  if (value?.trim()) onAddFilter('author', value.trim());
                }} className="cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Auteur</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {
                  const value = prompt("Nom de l'éditeur:");
                  if (value?.trim()) onAddFilter('publisher', value.trim());
                }} className="cursor-pointer">
                  <Book className="h-4 w-4 mr-2" />
                  <span>Éditeur</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {
                  const value = prompt("Genre (ex: Roman, Poésie, Histoire...):");
                  if (value?.trim()) onAddFilter('genre', value.trim());
                }} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Genre</span>
                </DropdownMenuItem>
                
                <DropdownMenuLabel className="text-sm">Période de publication</DropdownMenuLabel>
                
                <div className="px-2 py-2 space-y-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Année</label>
                    <Select onValueChange={(value) => onAddFilter('publication_year', value)}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Mois</label>
                    <Select 
                      onValueChange={(value) => onAddFilter('publication_month', value)}
                      disabled={!activeFilters.some(f => f.type === 'publication_year')}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Sélectionner un mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {
                  const value = prompt("Code langue (ar/fr/en/ber):");
                  if (value?.trim()) onAddFilter('language', value.trim().toLowerCase());
                }} className="cursor-pointer">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Langue</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {
                  const options = ['manuscript', 'book', 'periodical', 'article'];
                  const value = prompt(`Type de contenu (${options.join(', ')}):`);
                  if (value?.trim() && options.includes(value.trim().toLowerCase())) {
                    onAddFilter('content_type', value.trim().toLowerCase());
                  }
                }} className="cursor-pointer">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <span>Type de contenu</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Rechercher dans les collections (titre, auteur, mots-clés...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 text-lg bg-white/98 shadow-lg border-3 border-gold/30 focus:border-primary pl-6 pr-28 rounded-full"
              />
              
              {searchQuery && (
                <Button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  variant="ghost"
                  size="sm"
                  className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-destructive/10 rounded-full"
                  title="Effacer"
                >
                  <X className="h-5 w-5 text-destructive" />
                </Button>
              )}
              
              <Button 
                type="submit"
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md"
                disabled={!searchQuery.trim() && activeFilters.length === 0}
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </form>
          
          <p className="text-white/90 text-sm text-center font-medium">
            💡 Utilisez les filtres pour affiner votre recherche par auteur, éditeur, année, genre ou langue
          </p>
        </div>
      </div>
    </section>
  );
}
