import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Save, Plus, Trash2, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MediathequeVideo {
  id: string;
  youtube_id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
}

function SortableVideoItem({ 
  video, 
  onUpdate, 
  onDelete 
}: { 
  video: MediathequeVideo;
  onUpdate: (id: string, updates: Partial<MediathequeVideo>) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thumbnailUrl = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="border rounded-lg p-4 bg-background"
    >
      <div className="flex gap-4">
        <button
          className="cursor-grab active:cursor-grabbing p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
          <img 
            src={thumbnailUrl} 
            alt={video.title_fr}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/default.jpg`;
            }}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Titre (FR)"
              value={video.title_fr}
              onChange={(e) => onUpdate(video.id, { title_fr: e.target.value })}
            />
            <Input
              dir="rtl"
              placeholder="العنوان (AR)"
              value={video.title_ar || ""}
              onChange={(e) => onUpdate(video.id, { title_ar: e.target.value })}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="ID YouTube (ex: 2hOKleHBUYs)"
              value={video.youtube_id}
              onChange={(e) => onUpdate(video.id, { youtube_id: e.target.value })}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={video.is_active}
                onCheckedChange={(checked) => onUpdate(video.id, { is_active: checked })}
              />
              {video.is_active ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(video.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CmsMediathequeManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [videos, setVideos] = useState<MediathequeVideo[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { isLoading } = useQuery({
    queryKey: ['cms-mediatheque-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_mediatheque_videos')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setVideos(data || []);
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete removed videos
      const { data: existingVideos } = await supabase
        .from('cms_mediatheque_videos')
        .select('id');
      
      const existingIds = (existingVideos || []).map(v => v.id);
      const currentIds = videos.map(v => v.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (toDelete.length > 0) {
        await supabase
          .from('cms_mediatheque_videos')
          .delete()
          .in('id', toDelete);
      }

      // Upsert all current videos
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const { error } = await supabase
          .from('cms_mediatheque_videos')
          .upsert({
            ...video,
            sort_order: i,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-mediatheque-videos'] });
      toast({ title: "Vidéos sauvegardées avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setVideos((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addVideo = () => {
    const newVideo: MediathequeVideo = {
      id: crypto.randomUUID(),
      youtube_id: "",
      title_fr: "Nouvelle vidéo",
      title_ar: null,
      description_fr: null,
      description_ar: null,
      thumbnail_url: null,
      sort_order: videos.length,
      is_active: true
    };
    setVideos([...videos, newVideo]);
  };

  const updateVideo = (id: string, updates: Partial<MediathequeVideo>) => {
    setVideos(videos.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Gestion de la Médiathèque
          </CardTitle>
          <CardDescription>
            Gérez les vidéos YouTube affichées dans la section Médiathèque
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addVideo}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une vidéo
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList>
            <TabsTrigger value="videos">Vidéos ({videos.length})</TabsTrigger>
            <TabsTrigger value="help">Aide</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-4">
            {videos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune vidéo configurée.</p>
                <p className="text-sm">Cliquez sur "Ajouter une vidéo" pour commencer.</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={videos.map(v => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <SortableVideoItem
                        key={video.id}
                        video={video}
                        onUpdate={updateVideo}
                        onDelete={deleteVideo}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>

          <TabsContent value="help" className="mt-4">
            <Card className="border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Comment trouver l'ID d'une vidéo YouTube ?</h4>
                  <p className="text-sm text-muted-foreground">
                    L'ID YouTube est la partie de l'URL après "v=". Par exemple, pour l'URL 
                    <code className="bg-muted px-1 mx-1">https://www.youtube.com/watch?v=2hOKleHBUYs</code>
                    l'ID est <code className="bg-muted px-1">2hOKleHBUYs</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Réorganiser les vidéos</h4>
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez les vidéos à l'aide de l'icône de poignée pour modifier l'ordre d'affichage.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Masquer une vidéo</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilisez le commutateur pour activer/désactiver une vidéo sans la supprimer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}