import { ExternalLink, FileText, Image, Download, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Attachment {
  label: string;
  url: string | null | undefined;
}

interface AttachmentsSectionProps {
  attachments: Attachment[];
  title?: string;
}

export function AttachmentsSection({ attachments, title = "Pièces jointes" }: AttachmentsSectionProps) {
  const validAttachments = attachments.filter(a => a.url);

  const getFileIcon = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) return <Image className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  const getFileName = (url: string, label: string) => {
    try {
      const parts = url.split('/');
      const raw = parts[parts.length - 1]?.split('?')[0];
      if (raw && raw.length < 60) return decodeURIComponent(raw);
    } catch {}
    return label;
  };

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <h4 className="font-semibold text-base">{title}</h4>
        {validAttachments.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground italic py-2">
            <Paperclip className="h-4 w-4" />
            <span>Aucune pièce jointe</span>
          </div>
        ) : (
          <div className="space-y-2">
            {validAttachments.map((attachment, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg hover:bg-muted transition-colors"
              >
                {getFileIcon(attachment.url!)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getFileName(attachment.url!, attachment.label)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(attachment.url!, '_blank')}
                    title="Ouvrir"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <a href={attachment.url!} download title="Télécharger">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
