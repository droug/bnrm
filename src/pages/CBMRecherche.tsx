import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Search, BookOpen, MapPin, Filter, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CBMSearchWithSelection } from "@/components/cbm/CBMSearchWithSelection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CBMRecherche() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Advanced search fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("all");
  const [documentType, setDocumentType] = useState("all");
  const [library, setLibrary] = useState("all");

  const handleSimpleSearch = async () => {
    setIsSearching(true);
    
    try {
      let query = supabase.from('cbm_catalog').select('*').limit(100);
      
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,publisher.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const results = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        author: doc.author,
        publisher: doc.publisher,
        year: doc.publication_year?.toString(),
        type: doc.document_type,
        isbn: doc.isbn,
        library_name: doc.library_name,
        library_code: doc.library_code,
        availability_status: doc.availability_status,
        shelf_location: doc.shelf_location
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setIsSearching(true);
    
    try {
      let query = supabase.from('cbm_catalog').select('*').limit(100);
      
      if (title) {
        query = query.ilike('title', `%${title}%`);
      }
      
      if (author) {
        query = query.ilike('author', `%${author}%`);
      }
      
      if (publisher) {
        query = query.ilike('publisher', `%${publisher}%`);
      }
      
      if (year) {
        query = query.eq('publication_year', parseInt(year));
      }
      
      if (documentType && documentType !== "all") {
        query = query.ilike('document_type', `%${documentType}%`);
      }
      
      if (library && library !== "all") {
        query = query.eq('library_code', library);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const results = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        author: doc.author,
        publisher: doc.publisher,
        year: doc.publication_year?.toString(),
        type: doc.document_type,
        isbn: doc.isbn,
        library_name: doc.library_name,
        library_code: doc.library_code,
        availability_status: doc.availability_status,
        shelf_location: doc.shelf_location
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const statistiques = [
    { label: "Bibliothèques connectées", value: "6", icon: MapPin, color: "cbm-primary" },
    { label: "Documents catalogués", value: "64", icon: BookOpen, color: "cbm-secondary" },
    { label: "Recherches ce mois", value: "45,780", icon: Search, color: "cbm-accent" }
  ];

  const bibliothequesMembres = [
    { nom: "Bibliothèque Nationale du Royaume du Maroc", ville: "Rabat", documents: 42, code: "BNRM" },
    { nom: "BU Hassan II Casablanca", ville: "Casablanca", documents: 5, code: "BUH2C" },
    { nom: "BU Mohammed V Rabat", ville: "Rabat", documents: 5, code: "BUMVR" },
    { nom: "Médiathèque de Marrakech", ville: "Marrakech", documents: 4, code: "MEDMRK" },
    { nom: "Bibliothèque Municipale de Fès", ville: "Fès", documents: 4, code: "BMFES" },
    { nom: "Bibliothèque Nationale de Tanger", ville: "Tanger", documents: 3, code: "BNTNG" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Recherche Documentaire
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Interrogez simultanément les catalogues de toutes les bibliothèques du réseau
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {statistiques.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className={`border-2 border-${stat.color}/20 bg-${stat.color}/5`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm">{stat.label}</CardDescription>
                  <IconComponent className={`h-5 w-5 text-${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search Interface */}
        <Card className="border-2 border-cbm-primary/20 shadow-cbm-strong mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-primary flex items-center gap-2">
              <Search className="h-6 w-6" />
              Recherche Fédérée
            </CardTitle>
            <CardDescription>
              Lancez une recherche dans l'ensemble des collections des bibliothèques membres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="mb-6 bg-cbm-primary/10">
                <TabsTrigger value="simple" className="data-[state=active]:bg-cbm-primary data-[state=active]:text-white">
                  Recherche Simple
                </TabsTrigger>
                <TabsTrigger value="avancee" className="data-[state=active]:bg-cbm-secondary data-[state=active]:text-white">
                  Recherche Avancée
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Titre, auteur, sujet, ISBN..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSimpleSearch()}
                  />
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous les champs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les champs</SelectItem>
                      <SelectItem value="title">Titre</SelectItem>
                      <SelectItem value="author">Auteur</SelectItem>
                      <SelectItem value="subject">Sujet</SelectItem>
                      <SelectItem value="isbn">ISBN/ISSN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="bg-cbm-primary hover:bg-cbm-primary/90 px-8"
                    onClick={handleSimpleSearch}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-cbm-primary/10"
                    onClick={() => {
                      setDocumentType("Livre");
                      handleAdvancedSearch();
                    }}
                  >
                    <Filter className="h-3 w-3 mr-1" /> Livres
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-cbm-primary/10"
                    onClick={() => {
                      setDocumentType("Périodique");
                      handleAdvancedSearch();
                    }}
                  >
                    <Filter className="h-3 w-3 mr-1" /> Périodiques
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-cbm-primary/10"
                    onClick={() => {
                      setDocumentType("Thèse");
                      handleAdvancedSearch();
                    }}
                  >
                    <Filter className="h-3 w-3 mr-1" /> Thèses
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-cbm-primary/10"
                    onClick={() => {
                      setDocumentType("Numérique");
                      handleAdvancedSearch();
                    }}
                  >
                    <Filter className="h-3 w-3 mr-1" /> Documents numériques
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="avancee" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titre</label>
                      <Input 
                        placeholder="Titre de l'ouvrage" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Auteur</label>
                      <Input 
                        placeholder="Nom de l'auteur" 
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Éditeur</label>
                      <Input 
                        placeholder="Maison d'édition" 
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Année de publication</label>
                      <Input 
                        type="number" 
                        placeholder="AAAA" 
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sujet / Mots-clés</label>
                    <Input 
                      placeholder="Thématique, discipline..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Langue</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="ar">Arabe</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">Anglais</SelectItem>
                          <SelectItem value="es">Espagnol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de document</label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="Livre">Livre</SelectItem>
                          <SelectItem value="Périodique">Périodique</SelectItem>
                          <SelectItem value="Thèse">Thèse</SelectItem>
                          <SelectItem value="Numérique">Numérique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bibliothèque</label>
                      <Select value={library} onValueChange={setLibrary}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {bibliothequesMembres.map((bib, i) => (
                            <SelectItem key={i} value={bib.code}>{bib.ville} - {bib.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-cbm-secondary hover:bg-cbm-secondary/90"
                    onClick={handleAdvancedSearch}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Lancer la Recherche Avancée
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Search Results */}
        <CBMSearchWithSelection 
          searchResults={searchResults}
          isSearching={isSearching}
        />

        {/* Bibliothèques Membres */}
        <Card className="border-2 border-cbm-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-secondary">Bibliothèques Membres</CardTitle>
            <CardDescription>Réseaux interrogés simultanément</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bibliothequesMembres.map((bib, index) => (
                <Card key={index} className="border border-cbm-secondary/20 hover:shadow-cbm transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-semibold line-clamp-2">{bib.nom}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {bib.ville}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documents</span>
                      <span className="font-bold text-cbm-primary">{bib.documents.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Protocol */}
        <Card className="mt-8 border-2 border-cbm-accent/20 bg-cbm-accent/5">
          <CardHeader>
            <CardTitle className="text-lg text-cbm-accent flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Protocoles Supportés
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">La plateforme CBM utilise les standards internationaux suivants :</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Z39.50</Badge>
              <Badge>SRU (Search/Retrieve via URL)</Badge>
              <Badge>OAI-PMH</Badge>
              <Badge>UNIMARC</Badge>
              <Badge>Dublin Core</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
