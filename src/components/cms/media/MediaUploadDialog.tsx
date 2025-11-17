import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageOptimization";

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MediaUploadDialog({ open, onOpenChange, onSuccess }: MediaUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    title_fr: "",
    title_ar: "",
    alt_fr: "",
    alt_ar: "",
    description_fr: "",
    description_ar: "",
    media_type: "image" as "image" | "video" | "document" | "audio",
    tags: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect media type
      if (selectedFile.type.startsWith("image/")) {
        setMetadata(prev => ({ ...prev, media_type: "image" }));
      } else if (selectedFile.type.startsWith("video/")) {
        setMetadata(prev => ({ ...prev, media_type: "video" }));
      } else if (selectedFile.type.startsWith("audio/")) {
        setMetadata(prev => ({ ...prev, media_type: "audio" }));
      } else {
        setMetadata(prev => ({ ...prev, media_type: "document" }));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);
    try {
      // Compress image if needed
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file);
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cms-media/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filePath, fileToUpload, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("cms-media")
        .getPublicUrl(filePath);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("cms_media")
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size_kb: Math.round(fileToUpload.size / 1024),
          mime_type: file.type,
          media_type: metadata.media_type,
          title_fr: metadata.title_fr || file.name,
          title_ar: metadata.title_ar,
          alt_fr: metadata.alt_fr,
          alt_ar: metadata.alt_ar,
          description_fr: metadata.description_fr,
          description_ar: metadata.description_ar,
          tags: metadata.tags ? metadata.tags.split(",").map(t => t.trim()) : [],
        });

      if (dbError) throw dbError;

      toast.success("Média uploadé avec succès");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFile(null);
      setMetadata({
        title_fr: "",
        title_ar: "",
        alt_fr: "",
        alt_ar: "",
        description_fr: "",
        description_ar: "",
        media_type: "image",
        tags: "",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload du média");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uploader un média</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File selection */}
          <div>
            <Label htmlFor="file">Fichier *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                {file.name} ({Math.round(file.size / 1024)} Ko)
              </p>
            )}
          </div>

          {/* Media type */}
          <div>
            <Label htmlFor="media_type">Type de média</Label>
            <Select
              value={metadata.media_type}
              onValueChange={(value) => setMetadata(prev => ({ ...prev, media_type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bilingual fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title_fr">Titre (FR)</Label>
              <Input
                id="title_fr"
                value={metadata.title_fr}
                onChange={(e) => setMetadata(prev => ({ ...prev, title_fr: e.target.value }))}
                placeholder="Titre en français"
              />
            </div>
            <div>
              <Label htmlFor="title_ar">Titre (AR)</Label>
              <Input
                id="title_ar"
                value={metadata.title_ar}
                onChange={(e) => setMetadata(prev => ({ ...prev, title_ar: e.target.value }))}
                placeholder="العنوان بالعربية"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alt_fr">Texte alternatif (FR)</Label>
              <Input
                id="alt_fr"
                value={metadata.alt_fr}
                onChange={(e) => setMetadata(prev => ({ ...prev, alt_fr: e.target.value }))}
                placeholder="Description pour accessibilité"
              />
            </div>
            <div>
              <Label htmlFor="alt_ar">Texte alternatif (AR)</Label>
              <Input
                id="alt_ar"
                value={metadata.alt_ar}
                onChange={(e) => setMetadata(prev => ({ ...prev, alt_ar: e.target.value }))}
                placeholder="وصف للوصول"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description_fr">Description (FR)</Label>
              <Textarea
                id="description_fr"
                value={metadata.description_fr}
                onChange={(e) => setMetadata(prev => ({ ...prev, description_fr: e.target.value }))}
                placeholder="Description détaillée en français"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="description_ar">Description (AR)</Label>
              <Textarea
                id="description_ar"
                value={metadata.description_ar}
                onChange={(e) => setMetadata(prev => ({ ...prev, description_ar: e.target.value }))}
                placeholder="وصف مفصل بالعربية"
                dir="rtl"
                rows={3}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={metadata.tags}
              onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="patrimoine, culture, histoire"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
