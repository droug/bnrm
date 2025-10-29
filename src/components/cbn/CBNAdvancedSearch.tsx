import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SearchCriteria {
  query?: string;
  field?: string;
  title?: string;
  author?: string;
  publisher?: string;
  year?: string;
  subject?: string;
  language?: string;
  documentType?: string;
  isbn?: string;
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
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("all");
  const [documentType, setDocumentType] = useState("all");
  const [isbn, setIsbn] = useState("");

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
      subject: subject || undefined,
      language: language !== "all" ? language : undefined,
      documentType: documentType !== "all" ? documentType : undefined,
      isbn: isbn || undefined,
    });
  };

  const handleQuickFilter = (type: string) => {
    setDocumentType(type);
    onSearch({ documentType: type });
  };

  return (
    <Card className={`border-2 border-primary/20 shadow-lg ${!compact ? 'mb-6' : ''}`}>
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche dans le Catalogue CBN
        </CardTitle>
        <CardDescription>
          Recherchez dans le catalogue de la Bibliothèque Nationale
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-44">
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
                onClick={() => handleQuickFilter("book")}
              >
                <BookOpen className="h-3 w-3 mr-1" /> Livres
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("periodical")}
              >
                <Filter className="h-3 w-3 mr-1" /> Périodiques
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("thesis")}
              >
                <Filter className="h-3 w-3 mr-1" /> Thèses
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("manuscript")}
              >
                <Filter className="h-3 w-3 mr-1" /> Manuscrits
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFilter("digital")}
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
                      <SelectItem value="book">Livre</SelectItem>
                      <SelectItem value="periodical">Périodique</SelectItem>
                      <SelectItem value="thesis">Thèse</SelectItem>
                      <SelectItem value="manuscript">Manuscrit</SelectItem>
                      <SelectItem value="digital">Numérique</SelectItem>
                    </SelectContent>
                  </Select>
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
