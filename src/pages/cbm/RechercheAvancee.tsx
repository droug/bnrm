import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Search, RotateCcw, Save, Download, BookOpen, MapPin } from 'lucide-react';
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
import { moroccanRegions, getCitiesByRegion } from '@/data/moroccanRegions';
import { LibraryMapModal } from '@/components/cbm/LibraryMapModal';

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
  filterCM: boolean;
  filterCBM: boolean;
}

const RechercheAvancee = () => {
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
    filterCM: false,
    filterCBM: false,
  });
  const [yearRange, setYearRange] = useState([1900, 2025]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  
  // État pour l'onglet Bibliothèque
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [currentMapLibrary, setCurrentMapLibrary] = useState({ name: '', city: '' });

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

  const languages = [
    'Français',
    'Arabe',
    'Amazighe (Tifinagh)',
    'Anglais',
    'Espagnol',
    'Autres'
  ];

  // Bibliothèques avec leurs villes
  const librariesByCity: { [key: string]: string[] } = {
    'Rabat': [
      'Bibliothèque de l\'école des sciences de l\'information',
      'Bibliothèque de la Faculté de Médecine et de Pharmacie de Rabat',
      'Bibliothèque de la Faculté des Sciences Juridiques Economiques et Sociales - Souissi',
      'Bibliothèque Nationale du Royaume du Maroc',
      'Catalogue du Ministère de la Culture'
    ],
    'Oujda': ['Bibliothèque de l\'Université Mohammed 1'],
    'Casablanca': [
      'Bibliothèque de la Faculté des Sciences Juridiques, Economiques et Sociales',
      'Bibliothèque universitaire Mohammed Sekkat',
      'Catalogue de la Mosquée Hassan II',
      'Université Hassan II de Casablanca'
    ],
    'Ifrane': ['Université Al Akhawayn'],
    'Tanger': ['Fondation du Roi Abdul-Aziz Al Saoud pour les Etudes Islamiques et les Sciences Humaines']
  };

  // Obtenir les villes filtrées par région
  const availableCities = selectedRegion ? getCitiesByRegion(selectedRegion) : [];
  
  // Obtenir les bibliothèques de toutes les villes sélectionnées
  const availableLibraries = selectedCities.length > 0
    ? [
        ...selectedCities.flatMap(city => librariesByCity[city] || []),
        'Autre'
      ]
    : [];
  
  // Fonctions pour gérer la sélection multiple
  const toggleCity = (city: string) => {
    setSelectedCities(prev => {
      if (prev.includes(city)) {
        // Retirer la ville et ses bibliothèques associées
        const newCities = prev.filter(c => c !== city);
        const cityLibraries = librariesByCity[city] || [];
        setSelectedLibraries(libs => libs.filter(lib => !cityLibraries.includes(lib)));
        return newCities;
      } else {
        return [...prev, city];
      }
    });
  };
  
  const toggleLibrary = (library: string) => {
    setSelectedLibraries(prev => 
      prev.includes(library)
        ? prev.filter(lib => lib !== library)
        : [...prev, library]
    );
  };
  
  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
    const cityLibraries = librariesByCity[city] || [];
    setSelectedLibraries(libs => libs.filter(lib => !cityLibraries.includes(lib)));
  };
  
  const removeLibrary = (library: string) => {
    setSelectedLibraries(prev => prev.filter(lib => lib !== library));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // Rechercher dans la base de données cbm_catalog
      let query: any = supabase.from('cbm_catalog').select('*', { count: 'exact' });
      
      // Filtrer par mots-clés si présents
      if (criteria.keywords) {
        const keywords = criteria.keywords.toLowerCase();
        query = query.or(`title.ilike.%${keywords}%,author.ilike.%${keywords}%,publisher.ilike.%${keywords}%`);
      }
      
      // Filtrer par nature de document
      if (criteria.nature.length > 0) {
        query = query.in('document_type', criteria.nature);
      }
      
      // Filtrer par date de publication
      if (criteria.pubDateFrom) {
        query = query.gte('publication_year', parseInt(criteria.pubDateFrom));
      }
      if (criteria.pubDateTo) {
        query = query.lte('publication_year', parseInt(criteria.pubDateTo));
      }
      
      // Filtrer par cote si présente
      if (criteria.cote) {
        query = query.ilike('shelf_location', `%${criteria.cote}%`);
      }
      
      // Filtrer par établissement détenteur
      if (criteria.holder.length > 0) {
        query = query.in('library_code', criteria.holder);
      }
      
      // Filtrer pour afficher uniquement les documents disponibles
      if (criteria.availableOnly) {
        query = query.eq('availability_status', 'Disponible');
      }
      
      // Filtrer par CM - Ouvrages concernant le Maroc (sujet géographique)
      if (criteria.filterCM) {
        // Utiliser ilike sur le champ subject pour rechercher "Maroc"
        query = query.ilike('subject', '%Maroc%');
      }
      
      // Filtrer par CBM - Tous les ouvrages des bibliothèques du Maroc
      if (criteria.filterCBM) {
        // Le filtre CBM peut être basé sur un champ spécifique de la base
        // Par exemple, un champ 'catalog_source' ou 'is_cbm'
        query = query.eq('catalog_source', 'CBM');
      }
      
      const { data, error, count } = await query.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );
      
      if (error) throw error;
      
      setTotalResults(count || 0);
      
      const results = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        titleAr: doc.title_ar,
        author: doc.author || 'Auteur inconnu',
        year: doc.publication_year?.toString() || '',
        publisher: doc.publisher || '',
        cote: doc.shelf_location || '',
        supportType: doc.document_type || 'Livre',
        supportStatus: 'numerise',
        isFreeAccess: false,
        description: `${doc.title} - ${doc.library_name}`,
        library_name: doc.library_name,
        library_code: doc.library_code,
        availability_status: doc.availability_status,
        isbn: doc.isbn
      }));
      
      setSearchResults(results);
      
      toast({
        title: "Recherche terminée",
        description: `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
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
      filterCM: false,
      filterCBM: false,
    });
    setYearRange([1900, 2025]);
    setSearchResults([]);
    setCurrentPage(1);
    setTotalResults(0);
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
    <div className="min-h-screen bg-[#F8F7F2]">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#333] mb-2">Recherche avancée</h1>
              <p className="text-lg text-[#666]">
                Affinez votre recherche dans le catalogue bibliographique national.
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
                        <h4 className="font-semibold mb-2">Troncature</h4>
                        <p>Utilisez * pour remplacer plusieurs caractères (ex: biblio* trouvera bibliothèque, bibliographie, etc.)</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Recherche exacte</h4>
                        <p>Utilisez des guillemets pour rechercher une expression exacte (ex: "droits de l'homme")</p>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Filtres CM et CBM */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-cm"
                    checked={criteria.filterCM}
                    onCheckedChange={(checked) => 
                      setCriteria(prev => ({ 
                        ...prev, 
                        filterCM: checked as boolean,
                        filterCBM: checked ? false : prev.filterCBM
                      }))
                    }
                  />
                  <label
                    htmlFor="filter-cm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <span className="font-bold text-primary">CM</span> — Ouvrages concernant le Maroc
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-cbm"
                    checked={criteria.filterCBM}
                    onCheckedChange={(checked) => 
                      setCriteria(prev => ({ 
                        ...prev, 
                        filterCBM: checked as boolean,
                        filterCM: checked ? false : prev.filterCM
                      }))
                    }
                  />
                  <label
                    htmlFor="filter-cbm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <span className="font-bold text-primary">CBM</span> — Tous les ouvrages des bibliothèques du Maroc
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="multi-criteria" className="flex items-center gap-2">
                  🔍 Multi-critères
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-2">
                  🏛️ Bibliothèques sources
                </TabsTrigger>
                <TabsTrigger value="author-az" className="flex items-center gap-2">
                  📚 Auteur A-Z
                </TabsTrigger>
                <TabsTrigger value="subject-az" className="flex items-center gap-2">
                  🏷 Sujet A-Z
                </TabsTrigger>
                <TabsTrigger value="periodicals" className="flex items-center gap-2">
                  📰 Périodiques
                </TabsTrigger>
                <TabsTrigger value="identifier" className="flex items-center gap-2">
                  📁 Identifiant
                </TabsTrigger>
              </TabsList>

              {/* Bibliothèque */}
              <TabsContent value="library" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-xl font-semibold mb-6">Recherche par bibliothèques</h3>
                  <div className="grid gap-6 md:grid-cols-1">
                    <div>
                      <Label htmlFor="region">Région</Label>
                      <Select 
                        value={selectedRegion} 
                        onValueChange={(value) => {
                          setSelectedRegion(value);
                          setSelectedCities([]);
                          setSelectedLibraries([]);
                        }}
                      >
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Sélectionner une région..." />
                        </SelectTrigger>
                        <SelectContent>
                          {moroccanRegions.map((region) => (
                            <SelectItem key={region.name} value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Villes (sélection multiple)</Label>
                      <Card className="p-4">
                        {!selectedRegion ? (
                          <p className="text-sm text-muted-foreground">Veuillez d'abord sélectionner une région</p>
                        ) : (
                          <div className="space-y-2">
                            {availableCities.map((city) => (
                              <div key={city} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`city-${city}`}
                                  checked={selectedCities.includes(city)}
                                  onCheckedChange={() => toggleCity(city)}
                                />
                                <label
                                  htmlFor={`city-${city}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {city}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                      {selectedCities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCities.map((city) => (
                            <Badge 
                              key={city} 
                              variant="secondary" 
                              className="cursor-pointer"
                              onClick={() => removeCity(city)}
                            >
                              {city} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Bibliothèques adhérentes (sélection multiple)</Label>
                      <Card className="p-4">
                        {selectedCities.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Veuillez d'abord sélectionner au moins une ville</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {availableLibraries.map((library) => (
                              <div key={library} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`library-${library}`}
                                  checked={selectedLibraries.includes(library)}
                                  onCheckedChange={() => toggleLibrary(library)}
                                />
                                <label
                                  htmlFor={`library-${library}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                >
                                  {library}
                                </label>
                                {library !== 'Autre' && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      // Trouver la ville de cette bibliothèque
                                      const libraryCity = Object.entries(librariesByCity).find(
                                        ([_, libs]) => libs.includes(library)
                                      )?.[0];
                                      if (libraryCity) {
                                        setCurrentMapLibrary({ name: library, city: libraryCity });
                                        setIsMapModalOpen(true);
                                      }
                                    }}
                                  >
                                    <MapPin className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                      {selectedLibraries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedLibraries.map((library) => (
                            <Badge 
                              key={library} 
                              variant="secondary" 
                              className="cursor-pointer"
                              onClick={() => removeLibrary(library)}
                            >
                              {library} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Modale de localisation */}
              <LibraryMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                libraryName={currentMapLibrary.name}
                city={currentMapLibrary.city}
              />

              {/* Auteur A-Z */}
              <TabsContent value="author-az" className="space-y-4">
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Recherche par auteur (A-Z)</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                      <Button
                        key={letter}
                        variant="outline"
                        className="w-10 h-10 p-0"
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Ou tapez le nom de l'auteur..."
                    className="max-w-md mx-auto"
                  />
                </div>
              </TabsContent>

              {/* Sujet A-Z */}
              <TabsContent value="subject-az" className="space-y-4">
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Recherche par sujet (A-Z)</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                      <Button
                        key={letter}
                        variant="outline"
                        className="w-10 h-10 p-0"
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Ou tapez le sujet..."
                    className="max-w-md mx-auto"
                  />
                </div>
              </TabsContent>

              {/* Périodiques */}
              <TabsContent value="periodicals" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-xl font-semibold mb-6">Recherche de périodiques</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="issn">ISSN</Label>
                      <Input id="issn" placeholder="Ex: 1234-5678" />
                    </div>
                    <div>
                      <Label htmlFor="title-key">Titre clé</Label>
                      <Input id="title-key" placeholder="Titre du périodique" />
                    </div>
                    <div>
                      <Label htmlFor="publisher">Éditeur</Label>
                      <Input id="publisher" placeholder="Nom de l'éditeur" />
                    </div>
                    <div>
                      <Label htmlFor="periodicity">Périodicité</Label>
                      <Select>
                        <SelectTrigger id="periodicity">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Quotidien</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                          <SelectItem value="quarterly">Trimestriel</SelectItem>
                          <SelectItem value="annual">Annuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Identifiant */}
              <TabsContent value="identifier" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-xl font-semibold mb-6">Recherche par identifiant</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input id="isbn" placeholder="Ex: 978-2-1234-5678-9" />
                    </div>
                    <div>
                      <Label htmlFor="issn-id">ISSN</Label>
                      <Input id="issn-id" placeholder="Ex: 1234-5678" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Recherche multi-critères */}
              <TabsContent value="multi-criteria" className="space-y-4">
                <Accordion type="multiple" className="w-full space-y-3">
                  {/* Par mot-clé */}
                  <AccordionItem value="keywords" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par mot-clé</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div>
                        <Label htmlFor="keywords">Recherche</Label>
                        <Input
                          id="keywords"
                          placeholder="Titre, sujet, résumé, texte intégral..."
                          value={criteria.keywords}
                          onChange={(e) => setCriteria({ ...criteria, keywords: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="normalized"
                          checked={criteria.normalizedKeywordsOnly}
                          onCheckedChange={(checked) =>
                            setCriteria({ ...criteria, normalizedKeywordsOnly: checked as boolean })
                          }
                        />
                        <Label htmlFor="normalized" className="cursor-pointer">
                          Rechercher uniquement dans les mots-clés normalisés (vedettes)
                        </Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par typologie du document */}
                  <AccordionItem value="nature" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par typologie du document</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hybrid"
                          checked={criteria.includeHybrid}
                          onCheckedChange={(checked) =>
                            setCriteria({ ...criteria, includeHybrid: checked as boolean })
                          }
                        />
                        <Label htmlFor="hybrid" className="cursor-pointer">
                          Inclure les documents hybrides (papier + numérique)
                        </Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par langue */}
                  <AccordionItem value="language" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par langue</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <LanguageAutocomplete
                        label="Langue"
                        placeholder="Rechercher une langue..."
                        value={criteria.languages[0] || ''}
                        onChange={(langCode) => setCriteria({ ...criteria, languages: [langCode] })}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Choisissez parmi plus de 7000 langues mondiales
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par pays de publication */}
                  <AccordionItem value="country" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par pays de publication</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <CountryAutocomplete
                        label="Pays"
                        placeholder="Rechercher un pays..."
                        value={criteria.countries}
                        onChange={(countries) => setCriteria({ ...criteria, countries })}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Sélectionnez un ou plusieurs pays de publication
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par date d'édition */}
                  <AccordionItem value="pub-date" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par date d'édition</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pub-from">De</Label>
                          <Input
                            id="pub-from"
                            type="number"
                            placeholder="AAAA"
                            value={criteria.pubDateFrom}
                            onChange={(e) => setCriteria({ ...criteria, pubDateFrom: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pub-to">À</Label>
                          <Input
                            id="pub-to"
                            type="number"
                            placeholder="AAAA"
                            value={criteria.pubDateTo}
                            onChange={(e) => setCriteria({ ...criteria, pubDateTo: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Plage d'années : {yearRange[0]} - {yearRange[1]}</Label>
                        <Slider
                          value={yearRange}
                          onValueChange={setYearRange}
                          min={1500}
                          max={2025}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="exact-year">Ou exactement en</Label>
                        <Input
                          id="exact-year"
                          type="number"
                          placeholder="AAAA"
                          value={criteria.exactYear}
                          onChange={(e) => setCriteria({ ...criteria, exactYear: e.target.value })}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par date d'enregistrement */}
                  <AccordionItem value="reg-date" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par date d'enregistrement (interne BNRM)</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-from">De</Label>
                          <Input
                            id="reg-from"
                            type="date"
                            value={criteria.regDateFrom}
                            onChange={(e) => setCriteria({ ...criteria, regDateFrom: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reg-to">À</Label>
                          <Input
                            id="reg-to"
                            type="date"
                            value={criteria.regDateTo}
                            onChange={(e) => setCriteria({ ...criteria, regDateTo: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="this-year"
                          checked={criteria.addedThisYear}
                          onCheckedChange={(checked) =>
                            setCriteria({ ...criteria, addedThisYear: checked as boolean })
                          }
                        />
                        <Label htmlFor="this-year" className="cursor-pointer">
                          Ajoutées cette année
                        </Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par support physique */}
                  <AccordionItem value="support" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par support physique</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {supportTypes.map((support) => (
                          <div key={support} className="flex items-center space-x-2">
                            <Checkbox
                              id={`support-${support}`}
                              checked={criteria.support.includes(support)}
                              onCheckedChange={() => toggleSupport(support)}
                            />
                            <Label htmlFor={`support-${support}`} className="cursor-pointer">
                              {support}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="available"
                          checked={criteria.availableOnly}
                          onCheckedChange={(checked) =>
                            setCriteria({ ...criteria, availableOnly: checked as boolean })
                          }
                        />
                        <Label htmlFor="available" className="cursor-pointer">
                          Uniquement exemplaires disponibles
                        </Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Par établissement détenteur */}
                  <AccordionItem value="holder" className="border border-border rounded-lg px-4 bg-card hover:border-[#C6A760]/50 transition-colors data-[state=open]:border-[#C6A760] data-[state=open]:bg-[#C6A760]/5">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Par établissement détenteur</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div>
                        <Label htmlFor="holder">Établissement</Label>
                        <Input
                          id="holder"
                          placeholder="BNRM, Universités, Partenaires..."
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Source : Référentiel établissements (back-office listes)
                        </p>
                      </div>
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
            className="bg-[#C6A760] hover:bg-[#B59650] text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder la requête
          </Button>
        </div>

        {/* Résultats */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de recherche</CardTitle>
              <CardDescription>{totalResults} résultats trouvés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              {searchResults.map((doc: any) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-lg text-foreground mb-1">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Par {doc.author} • {doc.year} • {doc.publisher}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doc.isFreeAccess ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              Libre accès
                            </Badge>
                          ) : doc.supportStatus === "numerise" ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              Numérisé
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Non numérisé
                            </Badge>
                          )}
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
                            fromReservation: true,
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
                        Notice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
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
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RechercheAvancee;
