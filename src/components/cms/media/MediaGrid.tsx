import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, FileText, Music, Trash2, Edit, Download, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaEditDialog from "./MediaEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  media_type: string;
  title_fr: string | null;
  title_ar: string | null;
  file_size_kb: number | null;
  created_at: string;
  tags: string[] | null;
}

interface MediaGridProps {
  mediaFiles: MediaFile[];
  isLoading: boolean;
  onRefetch: () => void;
}

export default function MediaGrid({ mediaFiles, isLoading, onRefetch }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée dans le presse-papiers");
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;

    try {
      // Delete from storage
      const filePath = mediaToDelete.file_url.split("/").slice(-2).join("/");
      const { error: storageError } = await supabase.storage
        .from("cms-media")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("cms_media")
        .delete()
        .eq("id", mediaToDelete.id);

      if (dbError) throw dbError;

      toast.success("Média supprimé avec succès");
      onRefetch();
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur lors de la suppression du média");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-40 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucun média trouvé</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaFiles.map((media) => (
          <Card key={media.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Media preview */}
              <div className="relative h-40 bg-muted flex items-center justify-center">
                {media.media_type === "image" ? (
                  <img
                    src={media.file_url}
                    alt={media.title_fr || media.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {getMediaIcon(media.media_type)}
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {media.media_type}
                </Badge>
              </div>

              {/* Media info */}
              <div className="p-3 space-y-2">
                <h4 className="font-medium text-sm truncate" title={media.title_fr || media.file_name}>
                  {media.title_fr || media.file_name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {media.file_size_kb ? `${media.file_size_kb} Ko` : "Taille inconnue"}
                </p>

                {/* Tags */}
                {media.tags && media.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {media.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {media.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{media.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMedia(media)}
                    title="Modifier"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(media.file_url)}
                    title="Copier l'URL"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(media.file_url, "_blank")}
                    title="Télécharger"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMediaToDelete(media);
                      setDeleteDialogOpen(true);
                    }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      {selectedMedia && (
        <MediaEditDialog
          media={selectedMedia}
          open={!!selectedMedia}
          onOpenChange={(open) => !open && setSelectedMedia(null)}
          onSuccess={onRefetch}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
