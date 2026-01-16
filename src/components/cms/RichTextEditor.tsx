import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Palette,
  Type,
  Table,
  Upload,
  Loader2,
  Maximize2,
  Minimize2,
  Eye,
  Code2
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  dir?: "ltr" | "rtl";
}

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  value?: string;
  tooltip: string;
}

const colors = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E"
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Commencez à écrire...",
  minHeight = "300px",
  dir = "ltr"
}: RichTextEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current && !showSource) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, showSource]);

  useEffect(() => {
    if (showSource) {
      setSourceCode(value);
    }
  }, [showSource, value]);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceCode(e.target.value);
  }, []);

  const applySourceCode = useCallback(() => {
    onChange(sourceCode);
    setShowSource(false);
  }, [sourceCode, onChange]);

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5 Mo", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cms-editor/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('digital-library')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('digital-library')
        .getPublicUrl(fileName);
      
      executeCommand('insertImage', publicUrl);
      toast({ title: "Image insérée" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const insertLink = useCallback(() => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  }, [linkUrl, executeCommand]);

  const insertTable = useCallback(() => {
    const tableHtml = `
      <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">En-tête 1</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">En-tête 2</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">En-tête 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 1</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 2</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 4</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 5</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cellule 6</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCommand('insertHTML', tableHtml);
  }, [executeCommand]);

  const ToolbarBtn = ({ icon: Icon, command, value, tooltip }: ToolbarButton) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command, value)}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const containerClass = isFullscreen 
    ? "fixed inset-4 z-50 flex flex-col bg-background border rounded-xl shadow-2xl"
    : "border rounded-xl overflow-hidden bg-background";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center">
        {/* Undo/Redo */}
        <div className="flex gap-0.5">
          <ToolbarBtn icon={Undo} command="undo" tooltip="Annuler (Ctrl+Z)" />
          <ToolbarBtn icon={Redo} command="redo" tooltip="Rétablir (Ctrl+Y)" />
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Headings */}
        <div className="flex gap-0.5">
          <ToolbarBtn icon={Heading1} command="formatBlock" value="<h1>" tooltip="Titre 1" />
          <ToolbarBtn icon={Heading2} command="formatBlock" value="<h2>" tooltip="Titre 2" />
          <ToolbarBtn icon={Heading3} command="formatBlock" value="<h3>" tooltip="Titre 3" />
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Basic formatting */}
        <div className="flex gap-0.5">
          <ToolbarBtn icon={Bold} command="bold" tooltip="Gras (Ctrl+B)" />
          <ToolbarBtn icon={Italic} command="italic" tooltip="Italique (Ctrl+I)" />
          <ToolbarBtn icon={Underline} command="underline" tooltip="Souligné (Ctrl+U)" />
          <ToolbarBtn icon={Strikethrough} command="strikeThrough" tooltip="Barré" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Text color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => executeCommand('foreColor', color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Background color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => executeCommand('hiliteColor', color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <div className="flex gap-0.5">
          <ToolbarBtn icon={AlignLeft} command="justifyLeft" tooltip="Aligner à gauche" />
          <ToolbarBtn icon={AlignCenter} command="justifyCenter" tooltip="Centrer" />
          <ToolbarBtn icon={AlignRight} command="justifyRight" tooltip="Aligner à droite" />
          <ToolbarBtn icon={AlignJustify} command="justifyFull" tooltip="Justifier" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <div className="flex gap-0.5">
          <ToolbarBtn icon={List} command="insertUnorderedList" tooltip="Liste à puces" />
          <ToolbarBtn icon={ListOrdered} command="insertOrderedList" tooltip="Liste numérotée" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Insert elements */}
        <div className="flex gap-0.5">
          {/* Link */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              <div className="space-y-3">
                <Label className="text-sm">URL du lien</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={insertLink} disabled={!linkUrl}>
                    Insérer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => executeCommand('unlink')}>
                    <Unlink className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image upload */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
              disabled={isUploading}
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Table */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="sm" onClick={insertTable} className="h-8 w-8 p-0">
                  <Table className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Insérer un tableau</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ToolbarBtn icon={Quote} command="formatBlock" value="<blockquote>" tooltip="Citation" />
          <ToolbarBtn icon={Minus} command="insertHorizontalRule" tooltip="Ligne horizontale" />
          <ToolbarBtn icon={Code} command="formatBlock" value="<pre>" tooltip="Code" />
        </div>

        <div className="flex-1" />

        {/* View toggles */}
        <div className="flex gap-0.5">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant={showSource ? "secondary" : "ghost"}
                  size="sm" 
                  onClick={() => setShowSource(!showSource)}
                  className="h-8 w-8 p-0"
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Code source HTML</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{isFullscreen ? "Réduire" : "Plein écran"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Editor / Source */}
      {showSource ? (
        <div className="flex-1 flex flex-col">
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-muted/20"
            style={{ minHeight }}
            dir="ltr"
          />
          <div className="border-t p-2 flex justify-end gap-2 bg-muted/30">
            <Button size="sm" variant="outline" onClick={() => setShowSource(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={applySourceCode}>
              Appliquer
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dir={dir}
          className="flex-1 p-4 focus:outline-none prose prose-sm max-w-none overflow-auto"
          style={{ minHeight, wordBreak: 'break-word' }}
          data-placeholder={placeholder}
        />
      )}

      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .prose blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .prose pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .prose img {
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
        }
        .prose th, .prose td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
        }
        .prose th {
          background-color: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
}
