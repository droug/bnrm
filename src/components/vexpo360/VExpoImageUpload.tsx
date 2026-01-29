import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Loader2, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface VExpoImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  label?: string;
  description?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
}

// Sanitize filename for storage
const sanitizeFilename = (filename: string): string => {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars
    .replace(/_+/g, "_") // Remove multiple underscores
    .toLowerCase();
};

// Optimize image for panorama display (resize if needed, maintain quality)
const optimizeImageForPanorama = async (
  file: File, 
  maxWidth: number = 8192,
  quality: number = 0.92
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Only resize if the image is larger than max dimensions
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              // If blob creation fails, return original file
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = reject;
  });
};

export function VExpoImageUpload({
  value,
  onChange,
  onUploadingChange,
  label = "Image",
  description,
  folder = "covers",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMB = 20
}: VExpoImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [urlInput, setUrlInput] = useState(value || "");
  const [activeTab, setActiveTab] = useState<string>(value ? "url" : "upload");

  const setUploading = (next: boolean) => {
    setIsUploading(next);
    onUploadingChange?.(next);
  };

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const isTransientFetchError = (err: any) => {
    const msg = String(err?.message || err?.originalError?.message || "").toLowerCase();
    return msg.includes("failed to fetch");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale est de ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Formats acceptés: JPG, PNG, WebP, GIF",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(5);
    setUploadStatus("Préparation...");

    try {
      let fileToUpload = file;
      const originalSize = file.size;
      
      // Optimize image if it's large (> 5MB) or very high resolution
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus("Optimisation de l'image...");
        setUploadProgress(15);
        
        try {
          // Determine max width based on folder (panoramas need higher resolution)
          const maxWidth = folder === "panoramas" ? 8192 : 4096;
          fileToUpload = await optimizeImageForPanorama(file, maxWidth, 0.92);
          
          const savedPercent = Math.round((1 - fileToUpload.size / originalSize) * 100);
          if (savedPercent > 0) {
            console.log(`Image optimized: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB (${savedPercent}% reduction)`);
          }
        } catch (optimizeError) {
          console.warn("Image optimization failed, using original:", optimizeError);
          fileToUpload = file;
        }
      }

      setUploadProgress(30);
      setUploadStatus("Téléversement...");

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = sanitizeFilename(file.name).replace(/\.\w+$/, '.jpg');
      const filePath = `${folder}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage (retry transient network errors)
      let uploadedPath: string | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { data, error } = await supabase.storage
            .from("vexpo-assets")
            .upload(filePath, fileToUpload, {
              cacheControl: "31536000", // 1 year cache for optimized images
              upsert: false,
              contentType: 'image/jpeg',
            });

          if (error) throw error;
          uploadedPath = data.path;
          break;
        } catch (err: any) {
          if (attempt < 2 && isTransientFetchError(err)) {
            // Small backoff
            setUploadProgress(30);
            await sleep(500 * (attempt + 1));
            continue;
          }
          throw err;
        }
      }

      if (!uploadedPath) {
        throw new Error("Upload incomplet");
      }

      setUploadProgress(80);
      setUploadStatus("Finalisation...");

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("vexpo-assets")
        .getPublicUrl(uploadedPath);

      setUploadProgress(100);
      setUploadStatus("Terminé!");
      onChange(publicUrl);
      setUrlInput(publicUrl);

      toast({
        title: "Image téléversée",
        description: "L'image a été optimisée et ajoutée avec succès"
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de téléverser l'image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus("");
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = async () => {
    // If the URL is from our storage, delete it
    if (value && value.includes("vexpo-assets")) {
      try {
        const urlParts = value.split("/vexpo-assets/");
        if (urlParts[1]) {
          await supabase.storage
            .from("vexpo-assets")
            .remove([urlParts[1]]);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    onChange("");
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      {label && (
        <div>
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Téléverser
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link className="h-4 w-4 mr-2" />
            URL externe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{uploadStatus || "Téléversement en cours..."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir une image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP ou GIF • Max {maxSizeMB}MB
                </p>
                <Alert className="text-left max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Les images volumineuses seront automatiquement optimisées pour un affichage optimal dans l'exposition virtuelle.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Appliquer
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {value && (
        <div className="relative">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Aperçu"
              className="max-w-md max-h-64 rounded-lg border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 break-all max-w-md">
            {value}
          </p>
        </div>
      )}
    </div>
  );
}
