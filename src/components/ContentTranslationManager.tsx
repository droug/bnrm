import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Languages, CheckCircle, XCircle, RefreshCw, Eye, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Translation {
  id: string;
  content_id: string;
  language_code: string;
  title: string;
  excerpt: string;
  content_body: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string[];
  is_approved: boolean;
  created_at: string;
}

interface ContentTranslationManagerProps {
  contentId: string;
  contentTitle: string;
}

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'amz', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
];

export default function ContentTranslationManager({ contentId, contentTitle }: ContentTranslationManagerProps) {
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: translations, isLoading } = useQuery({
    queryKey: ['translations', contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_translations')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Translation[];
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (targetLanguages: string[]) => {
      const { data, error } = await supabase.functions.invoke('auto-translate-content', {
        body: { contentId, targetLanguages }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['translations', contentId] });
      const successCount = data.results.filter((r: any) => r.success).length;
      toast.success(`Traductions générées : ${successCount}/${data.results.length} langues`);
    },
    onError: (error) => {
      console.error('Translation error:', error);
      toast.error('Erreur lors de la traduction automatique');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ translationId, approved }: { translationId: string; approved: boolean }) => {
      const { error } = await supabase
        .from('content_translations')
        .update({ is_approved: approved })
        .eq('id', translationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', contentId] });
      toast.success('Statut de validation mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const updateTranslationMutation = useMutation({
    mutationFn: async (translation: Partial<Translation>) => {
      const { error } = await supabase
        .from('content_translations')
        .update(translation)
        .eq('id', translation.id!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', contentId] });
      setSelectedTranslation(null);
      toast.success('Traduction mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleGenerateTranslations = () => {
    const existingLangs = translations?.map(t => t.language_code) || [];
    const missingLangs = LANGUAGES
      .map(l => l.code)
      .filter(code => !existingLangs.includes(code));
    
    if (missingLangs.length === 0) {
      toast.info('Toutes les traductions existent déjà');
      return;
    }
    
    translateMutation.mutate(missingLangs);
  };

  const handleRegenerateTranslation = (languageCode: string) => {
    translateMutation.mutate([languageCode]);
  };

  const getLanguageInfo = (code: string) => {
    return LANGUAGES.find(l => l.code === code) || { name: code, flag: '🌐' };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Traductions automatiques
            </CardTitle>
            <CardDescription>
              Contenu : {contentTitle}
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateTranslations}
            disabled={translateMutation.isPending}
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traduction en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer les traductions manquantes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {LANGUAGES.map((lang) => {
              const translation = translations?.find(t => t.language_code === lang.code);
              
              return (
                <Card key={lang.code}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <CardTitle className="text-lg">{lang.name}</CardTitle>
                        {translation && (
                          <Badge variant={translation.is_approved ? "default" : "secondary"}>
                            {translation.is_approved ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validé
                              </>
                            ) : (
                              'En attente de validation'
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {translation ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTranslation(translation);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Aperçu
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateTranslation(lang.code)}
                              disabled={translateMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Régénérer
                            </Button>
                            {!translation.is_approved ? (
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate({ 
                                  translationId: translation.id, 
                                  approved: true 
                                })}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveMutation.mutate({ 
                                  translationId: translation.id, 
                                  approved: false 
                                })}
                                disabled={approveMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Invalider
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegenerateTranslation(lang.code)}
                            disabled={translateMutation.isPending}
                          >
                            <Languages className="h-4 w-4 mr-1" />
                            Traduire
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {translation && (
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Titre :</span> {translation.title}
                        </div>
                        <div>
                          <span className="font-medium">Créé le :</span>{' '}
                          {new Date(translation.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Aperçu et Édition - {selectedTranslation && getLanguageInfo(selectedTranslation.language_code).name}
              </DialogTitle>
              <DialogDescription>
                Vous pouvez modifier la traduction avant de la valider
              </DialogDescription>
            </DialogHeader>
            {selectedTranslation && (
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Textarea
                    value={selectedTranslation.title}
                    onChange={(e) => setSelectedTranslation({
                      ...selectedTranslation,
                      title: e.target.value
                    })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Extrait</Label>
                  <Textarea
                    value={selectedTranslation.excerpt}
                    onChange={(e) => setSelectedTranslation({
                      ...selectedTranslation,
                      excerpt: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Contenu</Label>
                  <Textarea
                    value={selectedTranslation.content_body}
                    onChange={(e) => setSelectedTranslation({
                      ...selectedTranslation,
                      content_body: e.target.value
                    })}
                    rows={10}
                  />
                </div>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => updateTranslationMutation.mutate(selectedTranslation)}
                    disabled={updateTranslationMutation.isPending}
                  >
                    Enregistrer les modifications
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
