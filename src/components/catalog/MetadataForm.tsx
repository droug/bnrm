import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Save } from "lucide-react";

interface MetadataFormProps {
  manuscriptId?: string;
  contentId?: string;
  existingData?: any;
  onSave?: () => void;
}

export default function MetadataForm({ 
  manuscriptId, 
  contentId, 
  existingData,
  onSave 
}: MetadataFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(existingData?.subjects || []);
  const [keywords, setKeywords] = useState<string[]>(existingData?.keywords || []);
  const [coAuthors, setCoAuthors] = useState<string[]>(existingData?.co_authors || []);
  const [newSubject, setNewSubject] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newCoAuthor, setNewCoAuthor] = useState("");

  const addItem = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const metadata = {
      manuscript_id: manuscriptId || null,
      content_id: contentId || null,
      isbn: formData.get('isbn') as string || null,
      issn: formData.get('issn') as string || null,
      dewey_classification: formData.get('dewey_classification') as string || null,
      original_title: formData.get('original_title') as string,
      subtitle: formData.get('subtitle') as string || null,
      main_author: formData.get('main_author') as string || null,
      co_authors: coAuthors.length > 0 ? coAuthors : null,
      publisher: formData.get('publisher') as string || null,
      publication_place: formData.get('publication_place') as string || null,
      publication_year: formData.get('publication_year') ? parseInt(formData.get('publication_year') as string) : null,
      page_count: formData.get('page_count') ? parseInt(formData.get('page_count') as string) : null,
      physical_description: formData.get('physical_description') as string || null,
      subjects: subjects.length > 0 ? subjects : null,
      keywords: keywords.length > 0 ? keywords : null,
      general_notes: formData.get('general_notes') as string || null,
      missing_pages_reason: formData.get('missing_pages_reason') as string || null,
      copyright_status: formData.get('copyright_status') as string || null,
      access_rights: formData.get('access_rights') as string || null,
    };

    try {
      const { error } = await supabase
        .from('catalog_metadata')
        .insert([metadata]);

      if (error) throw error;

      toast({
        title: "Métadonnées enregistrées",
        description: "Les métadonnées ont été enregistrées avec succès",
      });

      onSave?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métadonnées Bibliographiques</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifiants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identifiants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input 
                  id="isbn" 
                  name="isbn"
                  placeholder="978-X-XXX-XXXXX-X"
                  defaultValue={existingData?.isbn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issn">ISSN</Label>
                <Input 
                  id="issn" 
                  name="issn"
                  placeholder="XXXX-XXXX"
                  defaultValue={existingData?.issn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dewey_classification">Classification Dewey</Label>
                <Input 
                  id="dewey_classification" 
                  name="dewey_classification"
                  placeholder="XXX.XX"
                  defaultValue={existingData?.dewey_classification}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Informations bibliographiques */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations Bibliographiques</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original_title">Titre Original *</Label>
                <Input 
                  id="original_title" 
                  name="original_title"
                  required
                  defaultValue={existingData?.original_title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input 
                  id="subtitle" 
                  name="subtitle"
                  defaultValue={existingData?.subtitle}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Auteurs et contributeurs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auteurs et Contributeurs</h3>
            <div className="space-y-2">
              <Label htmlFor="main_author">Auteur Principal</Label>
              <Input 
                id="main_author" 
                name="main_author"
                defaultValue={existingData?.main_author}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Co-auteurs</Label>
              <div className="flex gap-2">
                <Input 
                  value={newCoAuthor}
                  onChange={(e) => setNewCoAuthor(e.target.value)}
                  placeholder="Nom du co-auteur"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newCoAuthor, setCoAuthors, setNewCoAuthor);
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => addItem(newCoAuthor, setCoAuthors, setNewCoAuthor)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {coAuthors.map((author, index) => (
                  <Badge key={index} variant="secondary">
                    {author}
                    <button
                      type="button"
                      onClick={() => removeItem(index, setCoAuthors)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Publication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Publication</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Éditeur</Label>
                <Input 
                  id="publisher" 
                  name="publisher"
                  defaultValue={existingData?.publisher}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publication_place">Lieu de Publication</Label>
                <Input 
                  id="publication_place" 
                  name="publication_place"
                  defaultValue={existingData?.publication_place}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publication_year">Année de Publication</Label>
                <Input 
                  id="publication_year" 
                  name="publication_year"
                  type="number"
                  defaultValue={existingData?.publication_year}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Description physique */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description Physique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page_count">Nombre de Pages</Label>
                <Input 
                  id="page_count" 
                  name="page_count"
                  type="number"
                  defaultValue={existingData?.page_count}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical_description">Description Physique</Label>
                <Input 
                  id="physical_description" 
                  name="physical_description"
                  defaultValue={existingData?.physical_description}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sujets et mots-clés */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sujets et Mots-clés</h3>
            
            <div className="space-y-2">
              <Label>Sujets</Label>
              <div className="flex gap-2">
                <Input 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ajouter un sujet"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newSubject, setSubjects, setNewSubject);
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => addItem(newSubject, setSubjects, setNewSubject)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeItem(index, setSubjects)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mots-clés</Label>
              <div className="flex gap-2">
                <Input 
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ajouter un mot-clé"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newKeyword, setKeywords, setNewKeyword);
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => addItem(newKeyword, setKeywords, setNewKeyword)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeItem(index, setKeywords)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes et Annotations</h3>
            <div className="space-y-2">
              <Label htmlFor="general_notes">Notes Générales</Label>
              <Textarea 
                id="general_notes" 
                name="general_notes"
                rows={3}
                defaultValue={existingData?.general_notes}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missing_pages_reason">Raison de l'Absence de Pages</Label>
              <Textarea 
                id="missing_pages_reason" 
                name="missing_pages_reason"
                rows={2}
                placeholder="Ex: Pages manquantes dans le document original"
                defaultValue={existingData?.missing_pages_reason}
              />
            </div>
          </div>

          <Separator />

          {/* Droits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Droits et Accès</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copyright_status">Statut des Droits</Label>
                <Input 
                  id="copyright_status" 
                  name="copyright_status"
                  defaultValue={existingData?.copyright_status}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_rights">Droits d'Accès</Label>
                <Input 
                  id="access_rights" 
                  name="access_rights"
                  defaultValue={existingData?.access_rights}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les Métadonnées
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}