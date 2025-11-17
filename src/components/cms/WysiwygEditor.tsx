import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Heading2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="h-8 w-8 p-0"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="h-8 w-8 p-0"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyLeft')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyCenter')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyRight')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Entrez l\'URL du lien:');
              if (url) executeCommand('createLink', url);
            }}
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Entrez l\'URL de l\'image:');
              if (url) executeCommand('insertImage', url);
            }}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('formatBlock', '<pre>')}
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}
