import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaEditDialogProps {
  media: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MediaEditDialog({ media, open, onOpenChange, onSuccess }: MediaEditDialogProps) {
  const [saving, setSaving] = useState(false);
  const [metadata, setMetadata] = useState({
    title_fr: "",
    title_ar: "",
    alt_fr: "",
    alt_ar: "",
    description_fr: "",
    description_ar: "",
    tags: "",
  });

  useEffect(() => {
    if (media) {
      setMetadata({
        title_fr: media.title_fr || "",
        title_ar: media.title_ar || "",
        alt_fr: media.alt_fr || "",
        alt_ar: media.alt_ar || "",
        description_fr: media.description_fr || "",
        description_ar: media.description_ar || "",
        tags: media.tags?.join(", ") || "",
      });
    }
  }, [media]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cms_media")
        .update({
          title_fr: metadata.title_fr,
          title_ar: metadata.title_ar,
          alt_fr: metadata.alt_fr,
          alt_ar: metadata.alt_ar,
          description_fr: metadata.description_fr,
          description_ar: metadata.description_ar,
          tags: metadata.tags ? metadata.tags.split(",").map(t => t.trim()) : [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", media.id);

      if (error) throw error;

      toast.success("Métadonnées mises à jour avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier les métadonnées</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          {media.media_type === "image" && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={media.file_url}
                alt={media.title_fr || media.file_name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
