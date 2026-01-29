import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Unlink,
  Code2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface RichTextEditorCompactProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  dir?: "ltr" | "rtl";
  className?: string;
}

export default function RichTextEditorCompact({ 
  value, 
  onChange, 
  placeholder = "Saisissez du texte...",
  minHeight = "120px",
  dir = "ltr",
  className = ""
}: RichTextEditorCompactProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
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

  const insertLink = useCallback(() => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  }, [linkUrl, executeCommand]);

  const ToolbarBtn = ({ 
    icon: Icon, 
    command, 
    cmdValue, 
    tooltip 
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    command: string; 
    cmdValue?: string; 
    tooltip: string 
  }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command, cmdValue)}
            className="h-7 w-7 p-0 hover:bg-primary/10"
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={`border rounded-lg overflow-hidden bg-background ${className}`}>
      {/* Compact Toolbar */}
      <div className="border-b bg-muted/30 px-2 py-1 flex flex-wrap gap-0.5 items-center">
        {/* Basic formatting */}
        <ToolbarBtn icon={Bold} command="bold" tooltip="Gras (Ctrl+B)" />
        <ToolbarBtn icon={Italic} command="italic" tooltip="Italique (Ctrl+I)" />
        <ToolbarBtn icon={Underline} command="underline" tooltip="Souligné (Ctrl+U)" />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <ToolbarBtn icon={List} command="insertUnorderedList" tooltip="Liste à puces" />
        <ToolbarBtn icon={ListOrdered} command="insertOrderedList" tooltip="Liste numérotée" />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarBtn icon={AlignLeft} command="justifyLeft" tooltip="Aligner à gauche" />
        <ToolbarBtn icon={AlignCenter} command="justifyCenter" tooltip="Centrer" />
        <ToolbarBtn icon={AlignRight} command="justifyRight" tooltip="Aligner à droite" />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10">
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
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

        <div className="flex-1" />

        {/* Source toggle */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button" 
                variant={showSource ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => setShowSource(!showSource)}
                className="h-7 w-7 p-0"
              >
                <Code2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Code source HTML</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Editor / Source */}
      {showSource ? (
        <div className="flex flex-col">
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            className="p-3 font-mono text-sm resize-none focus:outline-none bg-muted/20"
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
          className="p-3 focus:outline-none prose prose-sm max-w-none overflow-auto text-sm"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      )}

      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem;
        }
        .prose a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
