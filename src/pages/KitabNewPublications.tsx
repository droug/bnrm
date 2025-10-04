import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Sparkles, Filter } from "lucide-react";
import { useState } from "react";

export default function KitabNewPublications() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--kitab-accent))] to-[hsl(var(--kitab-primary))] py-20">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/kitab">
            <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au Portail Kitab
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Nouvelles Parutions
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Découvrez les références des dernières publications nationales
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Search Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Rechercher dans les Nouvelles Parutions
              </h2>
              
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Titre, auteur, éditeur, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 text-lg pl-6 pr-32 rounded-full border-2 border-[hsl(var(--kitab-primary))]/30 focus:border-[hsl(var(--kitab-primary))]"
                />
                
                <Button 
                  size="lg"
                  onClick={handleSearch}
                  className="absolute right-2 top-2 h-10 px-6 rounded-full bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
              </div>

              <div className="mt-6 flex gap-3 flex-wrap justify-center">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Genre
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Éditeur
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Langue
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Results Section - Placeholder */}
        <section>
          <Card className="border-0 shadow-[var(--shadow-kitab)] max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-[hsl(var(--kitab-accent))]/10 to-[hsl(var(--kitab-primary))]/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-[hsl(var(--kitab-accent))]" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Données en Cours d'Intégration
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                Les nouvelles parutions sont régulièrement mises à jour depuis l'application de 
                Dépôt Légal. La base de données complète sera bientôt disponible avec informations 
                détaillées, couvertures et sommaires.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/kitab/bibliography">
                  <Button size="lg" className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white">
                    Consulter la Bibliographie Nationale
                  </Button>
                </Link>
                <Link to="/kitab/faq">
                  <Button size="lg" variant="outline">
                    Nous Contacter
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
