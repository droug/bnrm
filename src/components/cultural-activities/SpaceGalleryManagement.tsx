import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Image as ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryImage {
  url: string;
  alt: string;
  order: number;
}

function SortableImageItem({ image, onDelete, onUpdateAlt, id }: {
  image: GalleryImage;
  onDelete: () => void;
  onUpdateAlt: (alt: string) => void;
  id: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <img
        src={image.url}
        alt={image.alt}
        className="w-24 h-16 object-cover rounded"
      />
      <div className="flex-1 space-y-2">
        <Input
          value={image.alt}
          onChange={(e) => onUpdateAlt(e.target.value)}
          placeholder="Description de l'image"
          className="h-9"
        />
        <p className="text-xs text-muted-foreground truncate">{image.url}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function SpaceGalleryManagement() {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: spaces, isLoading: loadingSpaces } = useQuery({
    queryKey: ['cultural-spaces-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const selectedSpace = spaces?.find(s => s.id === selectedSpaceId);
  const images = Array.isArray(selectedSpace?.gallery_images) 
    ? (selectedSpace.gallery_images as unknown as GalleryImage[]) 
    : [];

  const updateGalleryMutation = useMutation({
    mutationFn: async (newImages: GalleryImage[]) => {
      const { error } = await supabase
        .from('cultural_spaces')
        .update({ gallery_images: newImages as any })
        .eq('id', selectedSpaceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-spaces-admin'] });
      toast.success("Galerie mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    }
  });

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    const newImage: GalleryImage = {
      url: newImageUrl,
      alt: newImageAlt || selectedSpace?.name + " - Vue " + (images.length + 1),
      order: images.length + 1
    };

    updateGalleryMutation.mutate([...images, newImage]);
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i + 1 }));
    updateGalleryMutation.mutate(updatedImages);
  };

  const handleUpdateAlt = (index: number, alt: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], alt };
    updateGalleryMutation.mutate(updatedImages);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => `image-${img.order}` === active.id);
      const newIndex = images.findIndex((img) => `image-${img.order}` === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex)
        .map((img, i) => ({ ...img, order: i + 1 }));
      
      updateGalleryMutation.mutate(reorderedImages);
    }
  };

  if (loadingSpaces) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          Gestion des galeries photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection de l'espace */}
        <div className="space-y-2">
          <Label>Espace culturel</Label>
          <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un espace" />
            </SelectTrigger>
            <SelectContent>
              {spaces?.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSpaceId && (
          <>
            {/* Ajouter une nouvelle image */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-sm">Ajouter une photo</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Description</Label>
                  <Input
                    id="imageAlt"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    placeholder="Description de l'image"
                  />
                </div>
              </div>
              <Button onClick={handleAddImage} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter la photo
              </Button>
            </div>

            {/* Liste des images */}
            {images.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">
                  Photos actuelles ({images.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Glissez-déposez pour réorganiser les photos
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map(img => `image-${img.order}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {images.map((image, index) => (
                      <SortableImageItem
                        key={`image-${image.order}`}
                        id={`image-${image.order}`}
                        image={image}
                        onDelete={() => handleDeleteImage(index)}
                        onUpdateAlt={(alt) => handleUpdateAlt(index, alt)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune photo pour cet espace</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
