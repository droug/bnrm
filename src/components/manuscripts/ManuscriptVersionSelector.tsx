import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, FileText, Languages, Settings } from "lucide-react";

type ViewMode = 'image' | 'ocr' | 'translation' | 'comparison';

interface ManuscriptVersion {
  original_images?: string[];
  ocr_text?: string;
  translations?: {
    [language: string]: string;
  };
  versions?: {
    [version: string]: any;
  };
}

interface ManuscriptVersionSelectorProps {
  currentPage: number;
  version: ManuscriptVersion;
  onModeChange: (mode: ViewMode) => void;
  currentMode: ViewMode;
}

export function ManuscriptVersionSelector({
  currentPage,
  version,
  onModeChange,
  currentMode
}: ManuscriptVersionSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');

  const availableTranslations = version.translations ? Object.keys(version.translations) : [];
  const hasOCR = !!version.ocr_text;
  const hasTranslations = availableTranslations.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Options d'affichage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={currentMode} onValueChange={(value) => onModeChange(value as ViewMode)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image" className="text-xs">
              <Image className="h-3 w-3 mr-1" />
              Image
            </TabsTrigger>
            <TabsTrigger value="ocr" disabled={!hasOCR} className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              OCR
            </TabsTrigger>
            <TabsTrigger value="translation" disabled={!hasTranslations} className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              Traduction
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">
              Comparaison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-3">
            <p className="text-sm text-muted-foreground">
              Affichage de l'image originale du manuscrit
            </p>
          </TabsContent>

          <TabsContent value="ocr" className="mt-3">
            {hasOCR ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Texte extrait par reconnaissance optique de caractères (OCR)
                </p>
                <Badge variant="secondary" className="text-xs">
                  Reconnaissance automatique
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun texte OCR disponible pour cette page
              </p>
            )}
          </TabsContent>

          <TabsContent value="translation" className="mt-3">
            {hasTranslations ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Sélectionnez une traduction :
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTranslations.map((lang) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage(lang)}
                      className="text-xs"
                    >
                      {lang === 'fr' ? '🇫🇷 Français' :
                       lang === 'en' ? '🇬🇧 English' :
                       lang === 'ar' ? '🇲🇦 العربية' :
                       lang}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune traduction disponible pour cette page
              </p>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-3">
            <p className="text-sm text-muted-foreground">
              Affichage côte à côte de l'image originale et du texte OCR
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}