import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Search, RotateCcw, Save, Download, BookOpen, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LanguageAutocomplete } from '@/components/ui/language-autocomplete';
import { CountryAutocomplete } from '@/components/ui/country-autocomplete';
import { CoteAutocomplete } from '@/components/ui/cote-autocomplete';
import { supabase } from '@/integrations/supabase/client';
import { SearchPagination } from '@/components/ui/search-pagination';

interface SearchCriteria {
  keywords: string;
  nature: string[];
  typology: string[];
  languages: string[];
  countries: string[];
  pubDateFrom: string;
  pubDateTo: string;
  regDateFrom: string;
  regDateTo: string;
  support: string[];
  holder: string[];
  exactYear: string;
  cote: string;
  availableOnly: boolean;
  includeHybrid: boolean;
  normalizedKeywordsOnly: boolean;
  addedThisYear: boolean;
}

const DemandeNumerisation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('multi-criteria');
  const [criteria, setCriteria] = useState<SearchCriteria>({
    keywords: '',
    nature: [],
    typology: [],
    languages: [],
    countries: [],
    pubDateFrom: '',
    pubDateTo: '',
    regDateFrom: '',
    regDateTo: '',
    support: [],
    holder: [],
    exactYear: '',
    cote: '',
    availableOnly: false,
    includeHybrid: false,
    normalizedKeywordsOnly: false,
    addedThisYear: false,
  });
  const [yearRange, setYearRange] = useState([1900, 2025]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);

  // Restaurer l'état de recherche au retour de la notice
  useEffect(() => {
    if (location.state?.searchState) {
      const { criteria: savedCriteria, results, yearRange: savedYearRange } = location.state.searchState;
      setCriteria(savedCriteria);
      setSearchResults(results);
      if (savedYearRange) setYearRange(savedYearRange);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const documentNatures = [
    'Monographie',
    'Périodique',
    'Thèse',
    'Manuscrit',
    'Carte/Plan',
    'Partition/Audio',
    'Image/Visuel',
    'Électronique',
    'Autre'
  ];

  const supportTypes = [
    'Papier',
    'Numérique',
    'Microfilm',
    'Audio',
    'Vidéo',
    'Objet 3D',
    'Autre'
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      // Rechercher dans CBN pour les documents non numérisés
      let query = supabase.from('cbn_documents').select('*').eq('is_digitized', false).limit(100);
      
      if (criteria.keywords) {
        const keywords = criteria.keywords.toLowerCase();
        query = query.or(`title.ilike.%${keywords}%,author.ilike.%${keywords}%,publisher.ilike.%${keywords}%`);
      }
      
      if (criteria.cote) {
        query = query.ilike('cote', `%${criteria.cote}%`);
      }
      
      const { data, error, count } = await query.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );
      
      if (error) throw error;
      
      setTotalResults(count || 0);
      
      let results = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        titleAr: doc.title_ar,
        author: doc.author || 'Auteur inconnu',
        year: doc.publication_year?.toString() || '',
        publisher: doc.publisher || '',
        cote: doc.cote,
        supportType: doc.document_type || 'Livre',
        supportStatus: 'non_numerise',
        isFreeAccess: false,
        description: doc.physical_description || `${doc.title}`,
        language: '',
        keywords: doc.keywords || []
      }));
      
      if (criteria.languages.length > 0 && results.some(doc => doc.language)) {
        results = results.filter(doc => 
          doc.language && criteria.languages.includes(doc.language)
        );
      }
      
      if (criteria.support.length > 0) {
        results = results.filter(doc => criteria.support.includes(doc.supportType));
      }
      
      setSearchResults(results);
      
      toast({
        title: "Recherche terminée",
        description: `${results.length} document(s) non numérisé(s) trouvé(s)`,
      });
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

  const handleReset = () => {
    setCriteria({
      keywords: '',
      nature: [],
      typology: [],
      languages: [],
      countries: [],
      pubDateFrom: '',
      pubDateTo: '',
      regDateFrom: '',
      regDateTo: '',
      support: [],
      holder: [],
      exactYear: '',
      cote: '',
      availableOnly: false,
      includeHybrid: false,
      normalizedKeywordsOnly: false,
      addedThisYear: false,
    });
    setYearRange([1900, 2025]);
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Scan className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Demande de Numérisation</span>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                Recherche de documents non numérisés
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Recherchez et sélectionnez les documents que vous souhaitez faire numériser
              </p>
            </div>

            {/* Formulaire de recherche */}
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Critères de recherche
                </CardTitle>
                <CardDescription>
                  Affinez votre recherche avec plusieurs critères
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="multi-criteria">Recherche multi-critères</TabsTrigger>
                    <TabsTrigger value="by-cote">Recherche par cote</TabsTrigger>
                  </TabsList>

                  <TabsContent value="multi-criteria" className="space-y-6">
                    {/* Mots-clés */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="text-base font-semibold">Mots-clés</Label>
                      <Input
                        id="keywords"
                        placeholder="Titre, auteur, sujet..."
                        value={criteria.keywords}
                        onChange={(e) => setCriteria({...criteria, keywords: e.target.value})}
                        className="text-base"
                      />
                    </div>

                    <Accordion type="multiple" className="w-full">
                      {/* Nature du document */}
                      <AccordionItem value="nature">
                        <AccordionTrigger>Nature du document</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                            {documentNatures.map((nature) => (
                              <div key={nature} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`nature-${nature}`}
                                  checked={criteria.nature.includes(nature)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setCriteria({...criteria, nature: [...criteria.nature, nature]});
                                    } else {
                                      setCriteria({...criteria, nature: criteria.nature.filter(n => n !== nature)});
                                    }
                                  }}
                                />
                                <label htmlFor={`nature-${nature}`} className="text-sm cursor-pointer">
                                  {nature}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Langue */}
                      <AccordionItem value="language">
                        <AccordionTrigger>Langue</AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4">
                            <Select
                              value={criteria.languages[0] || ""}
                              onValueChange={(value) => setCriteria({...criteria, languages: value ? [value] : []})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une langue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arabe">Arabe</SelectItem>
                                <SelectItem value="Français">Français</SelectItem>
                                <SelectItem value="Anglais">Anglais</SelectItem>
                                <SelectItem value="Espagnol">Espagnol</SelectItem>
                                <SelectItem value="Amazighe">Amazighe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Type de support */}
                      <AccordionItem value="support">
                        <AccordionTrigger>Type de support</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                            {supportTypes.map((support) => (
                              <div key={support} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`support-${support}`}
                                  checked={criteria.support.includes(support)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setCriteria({...criteria, support: [...criteria.support, support]});
                                    } else {
                                      setCriteria({...criteria, support: criteria.support.filter(s => s !== support)});
                                    }
                                  }}
                                />
                                <label htmlFor={`support-${support}`} className="text-sm cursor-pointer">
                                  {support}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="by-cote" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cote" className="text-base font-semibold">Cote du document</Label>
                      <Input
                        id="cote"
                        value={criteria.cote}
                        onChange={(e) => setCriteria({...criteria, cote: e.target.value})}
                        placeholder="Ex: 840.MAR.BEN"
                      />
                      <p className="text-sm text-muted-foreground">
                        Recherchez directement par la cote du document (ex: 840.MAR.BEN)
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Boutons d'action */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="flex-1"
                    size="lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    {isSearching ? 'Recherche en cours...' : 'Rechercher'}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Résultats */}
            {searchResults.length > 0 && (
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                  <CardTitle>Résultats de recherche ({totalResults})</CardTitle>
                  <CardDescription>Documents non numérisés disponibles pour numérisation</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SearchPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalResults / itemsPerPage)}
                    totalItems={totalResults}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      handleSearch();
                    }}
                    onItemsPerPageChange={(items) => {
                      setItemsPerPage(items);
                      setCurrentPage(1);
                      handleSearch();
                    }}
                  />
                  
                  <div className="space-y-4">
                    {searchResults.map((doc) => (
                      <Card
                        key={doc.id}
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                        onClick={() => navigate(`/cbm/notice/${doc.id}`, { 
                          state: { 
                            document: doc,
                            fromDigitization: true,
                            searchState: {
                              criteria,
                              results: searchResults,
                              yearRange
                            }
                          }
                        })}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-24 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-primary/50" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <h3 className="font-bold text-xl text-primary hover:underline">
                                {doc.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Auteur:</span> {doc.author}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{doc.language || "N/A"}</Badge>
                                <Badge variant="outline">{doc.supportType}</Badge>
                                <Badge className="bg-amber-500 hover:bg-amber-600">Non numérisé</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {doc.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                <span>Cote: <span className="font-mono font-semibold">{doc.cote}</span></span>
                                <span>Année: {doc.year}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.length === 0 && !isSearching && (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <Scan className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground">
                    Utilisez les critères de recherche ci-dessus pour trouver des documents non numérisés
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DemandeNumerisation;
