import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface ManuscriptSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function ManuscriptSearchBar({ searchQuery, setSearchQuery }: ManuscriptSearchBarProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        <Input
          type="search"
          placeholder="Rechercher par titre, auteur ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-16 text-lg bg-white/98 shadow-lg border-3 border-gold/30 focus:border-white pl-6 pr-28 rounded-full"
        />
        
        {searchQuery && (
          <Button
            onClick={() => setSearchQuery("")}
            variant="ghost"
            size="sm"
            className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-destructive/10 rounded-full"
          >
            <X className="h-5 w-5 text-destructive" />
          </Button>
        )}
        
        <Button 
          size="lg" 
          className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md bg-gradient-neutral"
        >
          <Search className="h-6 w-6" />
        </Button>
      </div>
      <p className="text-white/90 text-sm text-center font-medium mt-4">
        💡 Utilisez les filtres ci-dessous pour affiner votre recherche
      </p>
    </div>
  );
}
