import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Search, RotateCcw, Save, Download, FileText } from 'lucide-react';
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
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LanguageAutocomplete } from '@/components/ui/language-autocomplete';
import { CountryAutocomplete } from '@/components/ui/country-autocomplete';
import { CoteAutocomplete } from '@/components/ui/cote-autocomplete';
import { mockDocuments } from '@/data/mockDocuments';

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

const DemandeReproduction = () => {
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

  // Restaurer l'état de recherche au retour de la notice
  useEffect(() => {
    if (location.state?.searchState) {
      const { criteria: savedCriteria, results, yearRange: savedYearRange } = location.state.searchState;
      setCriteria(savedCriteria);
      setSearchResults(results);
      if (savedYearRange) setYearRange(savedYearRange);
      
      // Nettoyer l'état pour éviter de le restaurer à nouveau
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
    'Autre'
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let results = [...mockDocuments];
      
      // Filtrer par mots-clés
      if (criteria.keywords) {
        const keywords = criteria.keywords.toLowerCase();
        results = results.filter(doc => 
          doc.title.toLowerCase().includes(keywords) ||
          doc.author.toLowerCase().includes(keywords) ||
          doc.description.toLowerCase().includes(keywords) ||
          doc.keywords?.some(k => k.toLowerCase().includes(keywords))
        );
      }
      
      // Filtrer par nature
      if (criteria.nature.length > 0) {
        results = results.filter(doc => 
          criteria.nature.includes(doc.supportType)
        );
      }
      
      // Filtrer par langue
      if (criteria.languages.length > 0) {
        results = results.filter(doc => 
          doc.language && criteria.languages.some(lang => 
            doc.language?.includes(lang)
          )
        );
      }
      
      // Filtrer par cote
      if (criteria.cote) {
        results = results.filter(doc => 
          doc.cote.toLowerCase().includes(criteria.cote.toLowerCase())
        );
      }
      
      setSearchResults(results);
      
      toast.success("Recherche terminée", {
        description: `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la recherche."
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

  const toggleNature = (nature: string) => {
    setCriteria(prev => ({
      ...prev,
      nature: prev.nature.includes(nature)
        ? prev.nature.filter(n => n !== nature)
        : [...prev.nature, nature]
    }));
  };

  const toggleSupport = (support: string) => {
    setCriteria(prev => ({
      ...prev,
      support: prev.support.includes(support)
        ? prev.support.filter(s => s !== support)
        : [...prev.support, support]
    }));
  };

  const toggleLanguage = (language: string) => {
    setCriteria(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Demande de reproduction</h1>
              <p className="text-lg text-muted-foreground">
                Recherchez des documents et demandez leur reproduction.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Aide à la recherche</DialogTitle>
                  <DialogDescription>
                    <div className="space-y-4 mt-4 text-left">
                      <div>
                        <h4 className="font-semibold mb-2">Opérateurs booléens</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>ET</strong> : tous les mots doivent être présents</li>
                          <li><strong>OU</strong> : au moins un mot doit être présent</li>
                          <li><strong>SAUF</strong> : exclure un mot</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">À propos de la reproduction</h4>
                        <p>Les demandes de reproduction sont soumises à validation et peuvent engendrer des frais selon le type de reproduction demandé.</p>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Onglets principaux */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="multi-criteria">
                  🔍 Multi-critères
                </TabsTrigger>
                <TabsTrigger value="author-az">
                  📚 Auteur A-Z
                </TabsTrigger>
                <TabsTrigger value="identifier">
                  📁 Cote / Identifiant
                </TabsTrigger>
              </TabsList>

              {/* Auteur A-Z */}
              <TabsContent value="author-az" className="space-y-4">
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Recherche par auteur (A-Z)</h3>
                  <Input
                    placeholder="Tapez le nom de l'auteur..."
                    className="max-w-md mx-auto"
                  />
                </div>
              </TabsContent>

              {/* Cote / Identifiant */}
              <TabsContent value="identifier" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-xl font-semibold mb-6">Recherche par cote ou identifiant</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <CoteAutocomplete
                        label="Cote"
                        value={criteria.cote}
                        onChange={(cote) => setCriteria({ ...criteria, cote })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input id="isbn" placeholder="Ex: 978-2-1234-5678-9" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Recherche multi-critères */}
              <TabsContent value="multi-criteria" className="space-y-4">
                <Accordion type="multiple" className="w-full space-y-3">
                  {/* Par mot-clé */}
                  <AccordionItem value="keywords" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par mot-clé</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div>
                        <Label htmlFor="keywords">Recherche</Label>
                        <Input
                          id="keywords"
                          placeholder="Titre, sujet, résumé..."
                          value={criteria.keywords}
                          onChange={(e) => setCriteria({ ...criteria, keywords: e.target.value })}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par nature de document */}
                  <AccordionItem value="nature" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par nature de document</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {documentNatures.map((nature) => (
                          <div key={nature} className="flex items-center space-x-2">
                            <Checkbox
                              id={`nature-${nature}`}
                              checked={criteria.nature.includes(nature)}
                              onCheckedChange={() => toggleNature(nature)}
                            />
                            <Label htmlFor={`nature-${nature}`} className="cursor-pointer">
                              {nature}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par langue */}
                  <AccordionItem value="language" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par langue</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <LanguageAutocomplete
                        label="Langue(s)"
                        value=""
                        onChange={(lang) => toggleLanguage(lang)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Barre d'action */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-primary hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>

        {/* Résultats */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de recherche</CardTitle>
              <CardDescription>{searchResults.length} résultats trouvés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((doc: any) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-lg mb-1">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Par {doc.author} • {doc.year} • {doc.publisher}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{doc.supportType}</Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {doc.cote}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => navigate(`/cbm/notice/${doc.id}`, { 
                          state: { 
                            document: doc,
                            fromReproduction: true,
                            searchState: {
                              criteria,
                              results: searchResults,
                              yearRange
                            }
                          } 
                        })}
                        variant="default"
                        size="lg"
                      >
                        Voir la notice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DemandeReproduction;
