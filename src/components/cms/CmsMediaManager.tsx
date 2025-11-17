import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Image, FileText, Video, Music } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MediaUploadDialog from "./media/MediaUploadDialog";
import MediaGrid from "./media/MediaGrid";
import MediaFilters from "./media/MediaFilters";

export default function CmsMediaManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: mediaFiles, isLoading, refetch } = useQuery({
    queryKey: ["cms-media", searchQuery, selectedType],
    queryFn: async () => {
      let query = supabase
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `file_name.ilike.%${searchQuery}%,title_fr.ilike.%${searchQuery}%,title_ar.ilike.%${searchQuery}%`
        );
      }

      if (selectedType) {
        query = query.eq("file_type", selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: mediaFiles?.length || 0,
    images: mediaFiles?.filter(m => m.file_type === "image").length || 0,
    videos: mediaFiles?.filter(m => m.file_type === "video").length || 0,
    documents: mediaFiles?.filter(m => m.file_type === "document").length || 0,
    audio: mediaFiles?.filter(m => m.file_type === "audio").length || 0,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bibliothèque de Médias</CardTitle>
            <CardDescription>
              Gérez vos images, vidéos et autres fichiers avec métadonnées bilingues
            </CardDescription>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Uploader un média
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Image className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.images}</p>
                  <p className="text-sm text-muted-foreground">Images</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Video className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.videos}</p>
                  <p className="text-sm text-muted-foreground">Vidéos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.documents}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Music className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.audio}</p>
                  <p className="text-sm text-muted-foreground">Audio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher par nom de fichier ou titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <MediaFilters 
            selectedType={selectedType} 
            onTypeChange={setSelectedType} 
          />
        </div>

        {/* Grille de médias */}
        <MediaGrid 
          mediaFiles={mediaFiles || []} 
          isLoading={isLoading}
          onRefetch={refetch}
        />

        {/* Dialog d'upload */}
        <MediaUploadDialog 
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={refetch}
        />
      </CardContent>
    </Card>
  );
}
