import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BannerPreviewProps {
  title?: string;
  text?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  position?: string;
}

export default function BannerPreview({ 
  title, 
  text, 
  imageUrl, 
  linkUrl, 
  linkLabel,
  position = "hero"
}: BannerPreviewProps) {
  if (position === "hero") {
    return (
      <div className="relative rounded-xl overflow-hidden border shadow-lg">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || 'Bannière'} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-muted-foreground">Image de la bannière</span>
          </div>
        )}
        
        {(title || text) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            {title && (
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            )}
            {text && (
              <p className="text-white/90 text-sm mb-3 line-clamp-2">{text}</p>
            )}
            {linkUrl && linkLabel && (
              <Button size="sm" className="w-fit" variant="secondary">
                {linkLabel}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (position === "sidebar") {
    return (
      <div className="rounded-lg overflow-hidden border shadow-md max-w-xs">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || 'Bannière'} 
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Image</span>
          </div>
        )}
        <div className="p-3 bg-card">
          {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
          {text && <p className="text-xs text-muted-foreground line-clamp-2">{text}</p>}
          {linkUrl && linkLabel && (
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-xs">
              {linkLabel} →
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (position === "popup") {
    return (
      <div className="rounded-xl overflow-hidden border-2 shadow-xl bg-card max-w-sm mx-auto">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title || 'Bannière'} 
            className="w-full h-36 object-cover"
          />
        )}
        <div className="p-5 text-center">
          {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
          {text && <p className="text-muted-foreground text-sm mb-4">{text}</p>}
          {linkUrl && linkLabel && (
            <Button className="w-full">
              {linkLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Footer position
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title || 'Bannière'} 
          className="w-16 h-16 object-cover rounded-lg"
        />
      )}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        {text && <p className="text-xs text-muted-foreground">{text}</p>}
      </div>
      {linkUrl && linkLabel && (
        <Button size="sm" variant="outline">
          {linkLabel}
        </Button>
      )}
    </div>
  );
}
