import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Strikethrough,
  Highlighter,
  Table,
  Video,
  FileText,
  Globe,
  Check
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MultilingualContent {
  fr: string;
  ar: string;
  en: string;
  es: string;
  amz: string;
}

interface MultilingualWysiwygEditorProps {
  value: MultilingualContent;
  onChange: (value: MultilingualContent) => void;
  supportedLanguages?: Array<'fr' | 'ar' | 'en' | 'es' | 'amz'>;
  minHeight?: string;
  placeholder?: string;
}

const languageConfig = {
  fr: { label: "Français", flag: "🇫🇷", dir: "ltr" },
  ar: { label: "العربية", flag: "🇲🇦", dir: "rtl" },
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  es: { label: "Español", flag: "🇪🇸", dir: "ltr" },
  amz: { label: "ⵜⴰⵎⴰⵣⵉⵖⵜ", flag: "ⵣ", dir: "ltr" },
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, tooltip, onClick, active }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              "h-8 w-8 p-0 transition-colors",
              active && "bg-muted text-primary"
            )}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function MultilingualWysiwygEditor({ 
  value, 
  onChange,
  supportedLanguages = ['fr', 'ar', 'en', 'es', 'amz'],
  minHeight = "300px",
  placeholder = "Commencez à écrire..."
}: MultilingualWysiwygEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'ar' | 'en' | 'es' | 'amz'>('fr');
  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [editedLanguages, setEditedLanguages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ref = editorRefs.current[activeLanguage];
    if (ref && ref.innerHTML !== value[activeLanguage]) {
      ref.innerHTML = value[activeLanguage] || '';
    }
  }, [activeLanguage, value]);

  const executeCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    const ref = editorRefs.current[activeLanguage];
    if (ref) {
      onChange({
        ...value,
        [activeLanguage]: ref.innerHTML
      });
      setEditedLanguages(prev => new Set([...prev, activeLanguage]));
    }
  };

  const handleInput = (lang: 'fr' | 'ar' | 'en' | 'es' | 'amz') => {
    const ref = editorRefs.current[lang];
    if (ref) {
      onChange({
        ...value,
        [lang]: ref.innerHTML
      });
      setEditedLanguages(prev => new Set([...prev, lang]));
    }
  };

  const insertTable = () => {
    const rows = prompt('Nombre de lignes:', '3');
    const cols = prompt('Nombre de colonnes:', '3');
    if (rows && cols) {
      let table = '<table class="border-collapse border border-muted w-full my-4"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        table += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          table += `<td class="border border-muted p-2">${i === 0 ? 'En-tête' : 'Cellule'}</td>`;
        }
        table += '</tr>';
      }
      table += '</tbody></table>';
      document.execCommand('insertHTML', false, table);
      handleInput(activeLanguage);
    }
  };

  const insertVideo = () => {
    const url = prompt('URL YouTube ou vidéo:');
    if (url) {
      // Convert YouTube URL to embed
      let embedUrl = url;
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      const iframe = `<div class="my-4 aspect-video"><iframe src="${embedUrl}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`;
      document.execCommand('insertHTML', false, iframe);
      handleInput(activeLanguage);
    }
  };

  const currentLangConfig = languageConfig[activeLanguage];

  return (
    <Card className="border-2 overflow-hidden">
      {/* Language Tabs */}
      <div className="bg-muted/30 border-b px-4 py-2">
        <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as typeof activeLanguage)}>
          <TabsList className="bg-background/50 h-auto p-1 gap-1">
            {supportedLanguages.map((lang) => {
              const config = languageConfig[lang];
              const hasContent = value[lang] && value[lang].trim().length > 0;
              const isEdited = editedLanguages.has(lang);
              
              return (
                <TabsTrigger
                  key={lang}
                  value={lang}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    lang === 'ar' && "font-arabic"
                  )}
                >
                  <span className="text-base">{config.flag}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                  {hasContent && (
                    <Badge 
                      variant={isEdited ? "default" : "secondary"} 
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {isEdited ? <Check className="h-3 w-3" /> : "•"}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-muted/20 p-2 flex flex-wrap gap-1 items-center">
        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<Heading1 className="h-4 w-4" />}
            tooltip="Titre 1"
            onClick={() => executeCommand('formatBlock', '<h1>')}
          />
          <ToolbarButton
            icon={<Heading2 className="h-4 w-4" />}
            tooltip="Titre 2"
            onClick={() => executeCommand('formatBlock', '<h2>')}
          />
          <ToolbarButton
            icon={<Heading3 className="h-4 w-4" />}
            tooltip="Titre 3"
            onClick={() => executeCommand('formatBlock', '<h3>')}
          />
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            tooltip="Gras (Ctrl+B)"
            onClick={() => executeCommand('bold')}
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            tooltip="Italique (Ctrl+I)"
            onClick={() => executeCommand('italic')}
          />
          <ToolbarButton
            icon={<Underline className="h-4 w-4" />}
            tooltip="Souligné (Ctrl+U)"
            onClick={() => executeCommand('underline')}
          />
          <ToolbarButton
            icon={<Strikethrough className="h-4 w-4" />}
            tooltip="Barré"
            onClick={() => executeCommand('strikeThrough')}
          />
          <ToolbarButton
            icon={<Highlighter className="h-4 w-4" />}
            tooltip="Surligner"
            onClick={() => executeCommand('hiliteColor', '#ffeb3b')}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<AlignLeft className="h-4 w-4" />}
            tooltip="Aligner à gauche"
            onClick={() => executeCommand('justifyLeft')}
          />
          <ToolbarButton
            icon={<AlignCenter className="h-4 w-4" />}
            tooltip="Centrer"
            onClick={() => executeCommand('justifyCenter')}
          />
          <ToolbarButton
            icon={<AlignRight className="h-4 w-4" />}
            tooltip="Aligner à droite"
            onClick={() => executeCommand('justifyRight')}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            tooltip="Liste à puces"
            onClick={() => executeCommand('insertUnorderedList')}
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="Liste numérotée"
            onClick={() => executeCommand('insertOrderedList')}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<LinkIcon className="h-4 w-4" />}
            tooltip="Insérer un lien"
            onClick={() => {
              const url = prompt('URL du lien:');
              if (url) executeCommand('createLink', url);
            }}
          />
          <ToolbarButton
            icon={<ImageIcon className="h-4 w-4" />}
            tooltip="Insérer une image"
            onClick={() => {
              const url = prompt('URL de l\'image:');
              if (url) executeCommand('insertImage', url);
            }}
          />
          <ToolbarButton
            icon={<Video className="h-4 w-4" />}
            tooltip="Insérer une vidéo"
            onClick={insertVideo}
          />
          <ToolbarButton
            icon={<Table className="h-4 w-4" />}
            tooltip="Insérer un tableau"
            onClick={insertTable}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            tooltip="Citation"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
          />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            tooltip="Code"
            onClick={() => executeCommand('formatBlock', '<pre>')}
          />
        </div>

        <div className="flex-1" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={<Undo className="h-4 w-4" />}
            tooltip="Annuler (Ctrl+Z)"
            onClick={() => executeCommand('undo')}
          />
          <ToolbarButton
            icon={<Redo className="h-4 w-4" />}
            tooltip="Rétablir (Ctrl+Y)"
            onClick={() => executeCommand('redo')}
          />
        </div>
      </div>

      {/* Editor Area */}
      <CardContent className="p-0">
        {supportedLanguages.map((lang) => (
          <div
            key={lang}
            className={cn(
              "relative",
              activeLanguage !== lang && "hidden"
            )}
          >
            <div
              ref={(el) => { editorRefs.current[lang] = el; }}
              contentEditable
              onInput={() => handleInput(lang)}
              dir={languageConfig[lang].dir}
              className={cn(
                "p-4 focus:outline-none prose prose-sm max-w-none",
                "prose-headings:text-foreground prose-p:text-foreground",
                "prose-strong:text-foreground prose-em:text-foreground",
                "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
                "prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:rounded",
                "prose-pre:bg-muted prose-pre:text-foreground",
                "prose-a:text-primary prose-a:underline",
                "prose-ul:text-foreground prose-ol:text-foreground",
                "prose-li:text-foreground",
                "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none",
                lang === 'ar' && "font-arabic text-right",
                lang === 'amz' && "font-tifinagh"
              )}
              style={{ 
                minHeight,
                wordBreak: 'break-word' 
              }}
              data-placeholder={placeholder}
              suppressContentEditableWarning
            />
            
            {/* Language indicator */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>{currentLangConfig.label}</span>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Footer with language status */}
      <div className="border-t bg-muted/10 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {supportedLanguages.map((lang) => {
            const hasContent = value[lang] && value[lang].replace(/<[^>]*>/g, '').trim().length > 0;
            return (
              <div key={lang} className="flex items-center gap-1">
                <span>{languageConfig[lang].flag}</span>
                <span className={cn(hasContent ? "text-green-600" : "text-muted-foreground")}>
                  {hasContent ? "Rempli" : "Vide"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-3 w-3" />
          <span>Éditeur multilingue</span>
        </div>
      </div>
    </Card>
  );
}
