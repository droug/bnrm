import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  BookOpen, 
  Calendar, 
  User, 
  Filter,
  Library,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";
import { CountryAutocomplete } from "@/components/ui/country-autocomplete";
import { CoteAutocomplete } from "@/components/ui/cote-autocomplete";

// Données d'exemple pour le catalogue
const MOCK_DOCUMENTS = [
  {
    id: "DOC-2024-001",
    title: "Histoire de la littérature marocaine moderne",
    author: "Ahmed Ben Mohammed",
    year: "2023",
    publisher: "Éditions Atlas",
    supportType: "Livre",
    supportStatus: "numerise" as const,
    isFreeAccess: false,
    cote: "840.MAR.BEN",
    description: "Étude approfondie de l'évolution de la littérature marocaine moderne..."
  },
  {
    id: "DOC-2024-002",
    title: "Architecture traditionnelle du Maroc",
    author: "Fatima Zahra El Alami",
    year: "2022",
    publisher: "Presses Universitaires",
    supportType: "Livre",
    supportStatus: "numerise" as const,
    isFreeAccess: true,
    cote: "720.MAR.ELA",
    description: "Analyse des styles architecturaux marocains à travers les siècles..."
  },
  {
    id: "DOC-2024-003",
    title: "Manuscrits anciens de Fès",
    author: "Mohammed Bennis",
    year: "2021",
    publisher: "Bibliothèque Nationale",
    supportType: "Manuscrit",
    supportStatus: "non_numerise" as const,
    isFreeAccess: false,
    cote: "091.MAR.BEN",
    description: "Collection de manuscrits historiques préservés à Fès..."
  },
  {
    id: "DOC-2024-004",
    title: "Économie et développement au Maroc",
    author: "Hassan Idrissi",
    year: "2023",
    publisher: "Institut Royal",
    supportType: "Livre",
    supportStatus: "numerise" as const,
    isFreeAccess: false,
    cote: "330.MAR.IDR",
    description: "Analyse économique du développement marocain..."
  },
  {
    id: "DOC-2024-005",
    title: "Poésie marocaine contemporaine",
    author: "Amina Tazi",
    year: "2024",
    publisher: "Éditions Culturelles",
    supportType: "Livre",
    supportStatus: "numerise" as const,
    isFreeAccess: true,
    cote: "841.MAR.TAZ",
    description: "Anthologie de la poésie marocaine moderne..."
  }
];

export default function CatalogueCBN() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredDocuments, setFilteredDocuments] = useState(MOCK_DOCUMENTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Critères de recherche avancée
  const [advancedCriteria, setAdvancedCriteria] = useState({
    author: "",
    title: "",
    subject: "",
    publisher: "",
    isbn: "",
    issn: "",
    cote: "",
    yearFrom: "",
    yearTo: "",
    language: "",
    countries: [] as string[],
    documentNatures: [] as string[],
    supportTypes: [] as string[],
  });

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

  const handleSearch = () => {
    let results = MOCK_DOCUMENTS;

    // Filtrer par recherche textuelle
    if (searchQuery.trim()) {
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.cote.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrer par type
    if (filterType !== "all") {
      results = results.filter(doc => doc.supportType === filterType);
    }

    // Filtrer par statut
    if (filterStatus !== "all") {
      if (filterStatus === "libre_acces") {
        results = results.filter(doc => doc.isFreeAccess);
      } else {
        results = results.filter(doc => doc.supportStatus === filterStatus);
      }
    }

    setFilteredDocuments(results);
  };

  const getStatusBadge = (doc: typeof MOCK_DOCUMENTS[0]) => {
    if (doc.isFreeAccess) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          Libre accès
        </Badge>
      );
    }
    if (doc.supportStatus === "numerise") {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Numérisé
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
        Non numérisé
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Services</span>
            <span>/</span>
            <span>Catalogue Bibliographique National</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Catalogue Bibliographique National
          </h1>
          <p className="text-lg text-muted-foreground">
            Recherchez et réservez des ouvrages dans notre catalogue national
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rechercher dans le catalogue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recherche principale */}
            <div className="flex gap-2">
              <Input
                placeholder="Titre, auteur, cote, mots-clés..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="lg">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            {/* Filtres simples */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Type de support
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Livre">Livre</SelectItem>
                    <SelectItem value="Manuscrit">Manuscrit</SelectItem>
                    <SelectItem value="Périodique">Périodique</SelectItem>
                    <SelectItem value="Thèse">Thèse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Statut
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="libre_acces">Libre accès</SelectItem>
                    <SelectItem value="numerise">Numérisé</SelectItem>
                    <SelectItem value="non_numerise">Non numérisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Recherche avancée
                  {showAdvanced ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Recherche Avancée */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Critères de recherche avancée
                </h3>
                
                <Accordion type="multiple" className="w-full space-y-3">
                  {/* Champs bibliographiques */}
                  <AccordionItem value="biblio" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Champs bibliographiques</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="author">Auteur</Label>
                          <Input
                            id="author"
                            placeholder="Nom de l'auteur..."
                            value={advancedCriteria.author}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, author: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Titre</Label>
                          <Input
                            id="title"
                            placeholder="Titre de l'ouvrage..."
                            value={advancedCriteria.title}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Sujet</Label>
                          <Input
                            id="subject"
                            placeholder="Sujet ou thématique..."
                            value={advancedCriteria.subject}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, subject: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="publisher">Éditeur</Label>
                          <Input
                            id="publisher"
                            placeholder="Nom de l'éditeur..."
                            value={advancedCriteria.publisher}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, publisher: e.target.value})}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Identifiants */}
                  <AccordionItem value="identifiers" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Identifiants</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="isbn">ISBN</Label>
                          <Input
                            id="isbn"
                            placeholder="Ex: 978-2-1234-5678-9"
                            value={advancedCriteria.isbn}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, isbn: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="issn">ISSN</Label>
                          <Input
                            id="issn"
                            placeholder="Ex: 1234-5678"
                            value={advancedCriteria.issn}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, issn: e.target.value})}
                          />
                        </div>
                        <div>
                          <CoteAutocomplete
                            label="Cote"
                            value={advancedCriteria.cote}
                            onChange={(cote) => setAdvancedCriteria({...advancedCriteria, cote})}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Date de publication */}
                  <AccordionItem value="dates" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Date de publication</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearFrom">De l'année</Label>
                          <Input
                            id="yearFrom"
                            type="number"
                            placeholder="1900"
                            value={advancedCriteria.yearFrom}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, yearFrom: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="yearTo">À l'année</Label>
                          <Input
                            id="yearTo"
                            type="number"
                            placeholder="2025"
                            value={advancedCriteria.yearTo}
                            onChange={(e) => setAdvancedCriteria({...advancedCriteria, yearTo: e.target.value})}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Langue et pays */}
                  <AccordionItem value="language-country" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Langue et Pays</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <LanguageAutocomplete
                          label="Langue"
                          value={advancedCriteria.language}
                          onChange={(language) => setAdvancedCriteria({...advancedCriteria, language})}
                        />
                        <CountryAutocomplete
                          label="Pays de publication"
                          value={advancedCriteria.countries}
                          onChange={(countries) => setAdvancedCriteria({...advancedCriteria, countries})}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Nature de document */}
                  <AccordionItem value="nature" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Nature de document</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {documentNatures.map((nature) => (
                          <div key={nature} className="flex items-center space-x-2">
                            <Checkbox
                              id={`nature-${nature}`}
                              checked={advancedCriteria.documentNatures.includes(nature)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdvancedCriteria({
                                    ...advancedCriteria,
                                    documentNatures: [...advancedCriteria.documentNatures, nature]
                                  });
                                } else {
                                  setAdvancedCriteria({
                                    ...advancedCriteria,
                                    documentNatures: advancedCriteria.documentNatures.filter(n => n !== nature)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`nature-${nature}`} className="cursor-pointer text-sm">
                              {nature}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Type de support */}
                  <AccordionItem value="support" className="border border-border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold text-base">Type de support</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {supportTypes.map((support) => (
                          <div key={support} className="flex items-center space-x-2">
                            <Checkbox
                              id={`support-${support}`}
                              checked={advancedCriteria.supportTypes.includes(support)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdvancedCriteria({
                                    ...advancedCriteria,
                                    supportTypes: [...advancedCriteria.supportTypes, support]
                                  });
                                } else {
                                  setAdvancedCriteria({
                                    ...advancedCriteria,
                                    supportTypes: advancedCriteria.supportTypes.filter(s => s !== support)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`support-${support}`} className="cursor-pointer text-sm">
                              {support}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Lancer la recherche
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAdvancedCriteria({
                        author: "",
                        title: "",
                        subject: "",
                        publisher: "",
                        isbn: "",
                        issn: "",
                        cote: "",
                        yearFrom: "",
                        yearTo: "",
                        language: "",
                        countries: [],
                        documentNatures: [],
                        supportTypes: [],
                      });
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredDocuments.length} résultat(s) trouvé(s)
          </p>
        </div>

        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </Card>
          ) : (
            filteredDocuments.map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/cbm/notice/${doc.id}`, { state: { document: doc } })}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{doc.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{doc.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Library className="h-3 w-3" />
                          <span>{doc.publisher}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(doc)}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        <strong>Type:</strong> {doc.supportType}
                      </span>
                      <span className="text-muted-foreground">
                        <strong>Cote:</strong> {doc.cote}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cbm/notice/${doc.id}`, { state: { document: doc } });
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Voir la notice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
