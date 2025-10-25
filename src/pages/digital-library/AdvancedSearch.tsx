import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, X, BookOpen, FileText, Tag, Calendar, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import { AuthorAutocomplete } from "@/components/ui/author-autocomplete";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";
import { CoteAutocomplete } from "@/components/ui/cote-autocomplete";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    keyword: "",
    cote: "",
    author: "",
    title: "",
    subject: "",
    isbn: "",
    language: "",
    documentType: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    navigate(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setFormData({
      keyword: "",
      cote: "",
      author: "",
      title: "",
      subject: "",
      isbn: "",
      language: "",
      documentType: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Recherche Avancée</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Affinez votre recherche en utilisant nos critères avancés organisés par catégorie
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Critères de recherche
              </CardTitle>
              <CardDescription>
                Dépliez les sections et remplissez les champs selon vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="multiple" defaultValue={["main"]} className="w-full">
                {/* Recherche Principale */}
                <AccordionItem value="main" className="border rounded-lg mb-4 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Recherche principale</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Titre, auteur et mot-clé général
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyword" className="text-base">Mot-clé</Label>
                      <Input
                        id="keyword"
                        placeholder="Recherche générale par mot-clé"
                        value={formData.keyword}
                        onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <TitleAutocomplete
                      label="Titre"
                      placeholder="Titre du document"
                      value={formData.title}
                      onChange={(value) => setFormData({ ...formData, title: value })}
                    />

                    <AuthorAutocomplete
                      label="Auteur"
                      placeholder="Nom de l'auteur"
                      value={formData.author}
                      onChange={(value) => setFormData({ ...formData, author: value })}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Identification */}
                <AccordionItem value="identification" className="border rounded-lg mb-4 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-secondary/10">
                        <Hash className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Identification</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Numéro de côte et ISBN
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 space-y-4">
                    <CoteAutocomplete
                      label="Numéro de Côte"
                      placeholder="Rechercher un numéro de côte"
                      value={formData.cote}
                      onChange={(value) => setFormData({ ...formData, cote: value })}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="isbn" className="text-base">ISBN</Label>
                      <Input
                        id="isbn"
                        placeholder="Numéro ISBN (ex: 978-2-1234-5678-9)"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Caractéristiques */}
                <AccordionItem value="characteristics" className="border rounded-lg mb-4 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-accent/10">
                        <FileText className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Caractéristiques</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Langue et type de document
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LanguageAutocomplete
                        label="Langue"
                        placeholder="Sélectionner une langue"
                        value={formData.language}
                        onChange={(value) => setFormData({ ...formData, language: value })}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="documentType" className="text-base">Type de document</Label>
                        <Select
                          value={formData.documentType}
                          onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                        >
                          <SelectTrigger id="documentType" className="h-11">
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="book">Livre</SelectItem>
                            <SelectItem value="periodical">Périodique</SelectItem>
                            <SelectItem value="manuscript">Manuscrit</SelectItem>
                            <SelectItem value="image">Image/Carte</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="video">Vidéo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Sujet et Contenu */}
                <AccordionItem value="subject" className="border rounded-lg mb-4 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Sujet et contenu</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Thématiques et mots-clés
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-base">Sujet</Label>
                      <Input
                        id="subject"
                        placeholder="Thématique ou mots-clés spécifiques"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: histoire, philosophie, sciences, littérature...
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Date de Publication */}
                <AccordionItem value="date" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-secondary/10">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Date de publication</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Période de publication
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateFrom" className="text-base">De l'année</Label>
                        <Input
                          id="dateFrom"
                          type="number"
                          placeholder="Ex: 1900"
                          min="1000"
                          max={new Date().getFullYear()}
                          value={formData.dateFrom}
                          onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateTo" className="text-base">À l'année</Label>
                        <Input
                          id="dateTo"
                          type="number"
                          placeholder={`Ex: ${new Date().getFullYear()}`}
                          min="1000"
                          max={new Date().getFullYear()}
                          value={formData.dateTo}
                          onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button type="submit" size="lg" className="flex-1 h-12 text-base">
              <Search className="h-5 w-5 mr-2" />
              Lancer la recherche
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleReset} className="h-12 text-base">
              <X className="h-5 w-5 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Search Tips */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Astuces de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-muted-foreground">
                  Utilisez les <strong>guillemets</strong> pour rechercher une expression exacte : "Ibn Khaldoun"
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-muted-foreground">
                  Combinez <strong>plusieurs critères</strong> dans différentes catégories pour des résultats plus précis
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-muted-foreground">
                  La recherche n'est <strong>pas sensible</strong> à la casse (majuscules/minuscules)
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-muted-foreground">
                  Les champs avec autocomplétion vous <strong>suggèrent automatiquement</strong> des valeurs existantes
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DigitalLibraryLayout>
  );
}
