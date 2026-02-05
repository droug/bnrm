import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SimpleDropdown } from "./SimpleDropdown";

interface SearchCriteria {
  query?: string;
  field?: string;
  title?: string;
  author?: string;
  publisher?: string;
  year?: string;
  yearEnd?: string;
  subject?: string;
  language?: string;
  documentType?: string;
  isbn?: string;
  cote?: string;
  numeroDL?: string;
  collection?: string;
  supportType?: string;
}

interface CBNAdvancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  onSelectDocument?: (document: any) => void;
  compact?: boolean;
}

export function CBNAdvancedSearch({ onSearch, onSelectDocument, compact = false }: CBNAdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  
  // Advanced search fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("all");
  const [documentType, setDocumentType] = useState("all");
  const [documentTypeOther, setDocumentTypeOther] = useState("");
  const [isbn, setIsbn] = useState("");
  const [cote, setCote] = useState("");
  const [numeroDL, setNumeroDL] = useState("");
  const [collection, setCollection] = useState("");
  const [supportType, setSupportType] = useState("all");

  const handleSimpleSearch = () => {
    onSearch({
      query: searchQuery,
      field: searchField,
    });
  };

  const handleAdvancedSearch = () => {
    onSearch({
      title: title || undefined,
      author: author || undefined,
      publisher: publisher || undefined,
      year: year || undefined,
      yearEnd: yearEnd || undefined,
      subject: subject || undefined,
      language: language !== "all" ? language : undefined,
      documentType: documentType !== "all" ? (documentType === "other" ? documentTypeOther : documentType) : undefined,
      isbn: isbn || undefined,
      cote: cote || undefined,
      numeroDL: numeroDL || undefined,
      collection: collection || undefined,
      supportType: supportType !== "all" ? supportType : undefined,
    });
  };

  const handleQuickFilter = (type: string) => {
    setDocumentType(type);
    onSearch({ documentType: type });
  };

  // Options for dropdowns
  const searchFieldOptions = [
    { value: "all", label: "Tous les champs" },
    { value: "title", label: "Titre" },
    { value: "author", label: "Auteur" },
    { value: "subject", label: "Sujet" },
    { value: "isbn", label: "ISBN/ISSN" },
  ];

  const languageOptions = [
    { value: "all", label: "Toutes les langues" },
    { value: "ar", label: "Arabe" },
    { value: "fr", label: "Français" },
    { value: "en", label: "Anglais" },
    { value: "es", label: "Espagnol" },
    { value: "de", label: "Allemand" },
    { value: "it", label: "Italien" },
    { value: "pt", label: "Portugais" },
    { value: "ru", label: "Russe" },
    { value: "zh", label: "Chinois" },
    { value: "ja", label: "Japonais" },
    { value: "ko", label: "Coréen" },
    { value: "tr", label: "Turc" },
    { value: "nl", label: "Néerlandais" },
    { value: "pl", label: "Polonais" },
    { value: "sv", label: "Suédois" },
    { value: "no", label: "Norvégien" },
    { value: "da", label: "Danois" },
    { value: "fi", label: "Finnois" },
    { value: "el", label: "Grec" },
    { value: "he", label: "Hébreu" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "ur", label: "Ourdou" },
    { value: "fa", label: "Persan" },
    { value: "th", label: "Thaï" },
    { value: "vi", label: "Vietnamien" },
    { value: "id", label: "Indonésien" },
    { value: "ms", label: "Malais" },
    { value: "tl", label: "Tagalog" },
    { value: "sw", label: "Swahili" },
    { value: "am", label: "Amharique" },
    { value: "ha", label: "Haoussa" },
    { value: "yo", label: "Yoruba" },
    { value: "ig", label: "Igbo" },
    { value: "zu", label: "Zoulou" },
    { value: "xh", label: "Xhosa" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanais" },
    { value: "hy", label: "Arménien" },
    { value: "az", label: "Azéri" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Biélorusse" },
    { value: "bs", label: "Bosniaque" },
    { value: "bg", label: "Bulgare" },
    { value: "ca", label: "Catalan" },
    { value: "hr", label: "Croate" },
    { value: "cs", label: "Tchèque" },
    { value: "et", label: "Estonien" },
    { value: "gl", label: "Galicien" },
    { value: "ka", label: "Géorgien" },
    { value: "hu", label: "Hongrois" },
    { value: "is", label: "Islandais" },
    { value: "ga", label: "Irlandais" },
    { value: "kk", label: "Kazakh" },
    { value: "lv", label: "Letton" },
    { value: "lt", label: "Lituanien" },
    { value: "mk", label: "Macédonien" },
    { value: "mt", label: "Maltais" },
    { value: "mn", label: "Mongol" },
    { value: "ro", label: "Roumain" },
    { value: "sr", label: "Serbe" },
    { value: "sk", label: "Slovaque" },
    { value: "sl", label: "Slovène" },
    { value: "uk", label: "Ukrainien" },
    { value: "cy", label: "Gallois" },
    { value: "yi", label: "Yiddish" },
    { value: "la", label: "Latin" },
    { value: "sa", label: "Sanskrit" },
    { value: "amz", label: "Amazighe (Tamazight)" },
    { value: "kab", label: "Kabyle" },
    { value: "tzm", label: "Tamazight du Maroc central" },
    { value: "shi", label: "Tachelhit" },
    { value: "rif", label: "Tarifit" },
  ];

  const documentTypeOptions = [
    { value: "all", label: "Tous" },
    { value: "monographie", label: "Monographie" },
    { value: "periodique", label: "Périodique" },
    { value: "bd_logiciel", label: "BD & Logiciel" },
    { value: "collection_specialisee", label: "Collection spécialisée" },
    { value: "other", label: "Autre" },
  ];

  const supportTypeOptions = [
    { value: "all", label: "Tous" },
    { value: "Papier", label: "Papier" },
    { value: "Microfilm", label: "Microfilm" },
    { value: "CD-ROM", label: "CD-ROM" },
    { value: "Numérique", label: "Numérique" },
  ];

  return (
    <Card className={`border-2 border-primary/20 shadow-lg overflow-visible ${!compact ? 'mb-6' : ''}`}>
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche dans le Catalogue CBN
        </CardTitle>
        <CardDescription>
          Recherchez dans le catalogue de la Bibliothèque Nationale
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-visible">
        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="mb-4 bg-primary/10">
            <TabsTrigger 
              value="simple" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Recherche Simple
            </TabsTrigger>
            <TabsTrigger 
              value="avancee" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Recherche Avancée
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <div className="flex gap-3">
              <Input 
                placeholder="Titre, auteur, sujet, ISBN..." 
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimpleSearch()}
              />
              <div className="w-44">
                <SimpleDropdown
                  value={searchField}
                  onChange={setSearchField}
                  options={searchFieldOptions}
                />
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 px-6"
                onClick={handleSimpleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("monographie")}
              >
                <BookOpen className="h-3 w-3 mr-1" /> Monographies
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("periodique")}
              >
                <Filter className="h-3 w-3 mr-1" /> Périodiques
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("bd_logiciel")}
              >
                <Filter className="h-3 w-3 mr-1" /> BD & Logiciel
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("collection_specialisee")}
              >
                <Filter className="h-3 w-3 mr-1" /> Collections spécialisées
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="avancee" className="space-y-4 overflow-visible">
            <div className="grid gap-4 overflow-visible">
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
                  <label className="text-sm font-medium">Collection</label>
                  <Input 
                    placeholder="Nom de la collection" 
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Année (de)</label>
                  <Input 
                    type="number" 
                    placeholder="AAAA" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Année (à)</label>
                  <Input 
                    type="number" 
                    placeholder="AAAA" 
                    value={yearEnd}
                    onChange={(e) => setYearEnd(e.target.value)}
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
                  <label className="text-sm font-medium">Cote</label>
                  <Input 
                    placeholder="Ex: LIT-MAR-2020-001" 
                    value={cote}
                    onChange={(e) => setCote(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Numéro DL</label>
                  <Input 
                    placeholder="Ex: DL-2024-001234" 
                    value={numeroDL}
                    onChange={(e) => setNumeroDL(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ISBN/ISSN</label>
                  <Input 
                    placeholder="ISBN ou ISSN" 
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Langue</label>
                  <SimpleDropdown
                    value={language}
                    onChange={setLanguage}
                    options={languageOptions}
                    searchable
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de document</label>
                  <SimpleDropdown
                    value={documentType}
                    onChange={(value) => {
                      setDocumentType(value);
                      if (value !== "other") {
                        setDocumentTypeOther("");
                      }
                    }}
                    options={documentTypeOptions}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de support</label>
                  <SimpleDropdown
                    value={supportType}
                    onChange={setSupportType}
                    options={supportTypeOptions}
                  />
                </div>
              </div>

              {documentType === "other" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Précisez le type de document</label>
                  <Input 
                    placeholder="Ex: Carte postale, Manuscrit ancien..." 
                    value={documentTypeOther}
                    onChange={(e) => setDocumentTypeOther(e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              )}

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
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
  );
}
