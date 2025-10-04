import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookMarked, Download, Filter } from "lucide-react";
import { useState } from "react";
import mosaicBanner from "@/assets/kitab-banner-mosaic-gradient.jpeg";

export default function KitabBibliography() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  const handleSearch = () => {
    console.log("Advanced search:", { searchQuery, selectedYear, selectedFormat });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const formats = [
    { value: "livre", label: "Livre" },
    { value: "periodique", label: "Périodique" },
    { value: "these", label: "Thèse" },
    { value: "rapport", label: "Rapport" },
    { value: "multimedia", label: "Multimédia" },
    { value: "autre", label: "Autre" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[400px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={mosaicBanner} 
            alt="Mosaïque Marocaine" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/70 via-[hsl(var(--kitab-primary-dark))]/60 to-[hsl(var(--kitab-secondary))]/70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/kitab" className="absolute top-8 left-4">
            <Button variant="ghost" className="text-white hover:text-white/80">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au Portail Kitab
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <BookMarked className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Bibliographie Nationale
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Recherche avancée par support et par année
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Advanced Search Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-5xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--kitab-neutral-light))] to-white">
              <CardTitle className="text-2xl text-[hsl(var(--kitab-primary))] flex items-center gap-2">
                <Filter className="w-6 h-6" />
                Recherche Avancée
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recherche par mot-clé
                  </label>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Titre, auteur, éditeur, ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-12 text-base pl-6 pr-14 border-2 border-[hsl(var(--kitab-primary))]/30"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Filters */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Année de publication
                    </label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-12 border-2 border-[hsl(var(--kitab-primary))]/30">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type de support
                    </label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="h-12 border-2 border-[hsl(var(--kitab-primary))]/30">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    size="lg" 
                    onClick={handleSearch}
                    className="flex-1 bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white h-12"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedYear("");
                      setSelectedFormat("");
                    }}
                    className="h-12"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Download Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-[var(--shadow-kitab)] max-w-5xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 to-[hsl(var(--kitab-accent))]/10 p-4 rounded-xl">
                  <Download className="w-10 h-10 text-[hsl(var(--kitab-primary))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Télécharger la Bibliographie Nationale
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Accédez à l'historique complet des publications marocaines en format numérique. 
                    Disponible en arabe et en français.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Version Arabe (PDF)
                    </Button>
                    <Button 
                      className="bg-[hsl(var(--kitab-secondary))] hover:bg-[hsl(var(--kitab-secondary))]/80 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Version Française (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Results Placeholder */}
        <section>
          <Card className="border-0 shadow-[var(--shadow-kitab)] max-w-5xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-[hsl(var(--kitab-secondary))]/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <BookMarked className="w-12 h-12 text-[hsl(var(--kitab-primary))]" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Base de Données en Construction
              </h3>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                La bibliographie nationale numérique est en cours de finalisation. 
                Elle regroupera l'ensemble des publications marocaines avec recherche avancée 
                par support, année, genre et autres critères.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
