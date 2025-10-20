import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import { AuthorAutocomplete } from "@/components/ui/author-autocomplete";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Recherche Avancée</h1>
          <p className="text-lg text-muted-foreground">
            Utilisez plusieurs critères pour affiner votre recherche
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Critères de recherche</CardTitle>
            <CardDescription>
              Remplissez un ou plusieurs champs pour rechercher dans nos collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Author - with autocomplete */}
              <AuthorAutocomplete
                label="Auteur"
                placeholder="Nom de l'auteur"
                value={formData.author}
                onChange={(value) => setFormData({ ...formData, author: value })}
              />

              {/* Title - with autocomplete */}
              <TitleAutocomplete
                label="Titre"
                placeholder="Titre du document"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
              />

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  placeholder="Mots-clés ou sujet"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* ISBN */}
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="Numéro ISBN"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>

              {/* Language and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LanguageAutocomplete
                  label="Langue"
                  placeholder="Sélectionner une langue"
                  value={formData.language}
                  onChange={(value) => setFormData({ ...formData, language: value })}
                />

                <div className="space-y-2">
                  <Label htmlFor="documentType">Type de document</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
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

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date de publication (de)</Label>
                  <Input
                    id="dateFrom"
                    type="number"
                    placeholder="Année"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date de publication (à)</Label>
                  <Input
                    id="dateTo"
                    type="number"
                    placeholder="Année"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Lancer la recherche
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Astuces de recherche</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Utilisez des guillemets pour rechercher une expression exacte : "Ibn Khaldoun"</p>
            <p>• Combinez plusieurs critères pour affiner vos résultats</p>
            <p>• La recherche n'est pas sensible à la casse (majuscules/minuscules)</p>
            <p>• Les résultats sont automatiquement paginés pour une meilleure navigation</p>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
