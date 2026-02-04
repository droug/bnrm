import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Edit, Image, MapPin, FileText, Video, Navigation } from "lucide-react";
import { VExpoImageUpload } from "@/components/vexpo360/VExpoImageUpload";
import { VExpoMediaUpload } from "@/components/vexpo360/VExpoMediaUpload";
import { PanoramaPositionPicker } from "@/components/vexpo360/PanoramaPositionPicker";

interface Panorama {
  id: string;
  exhibition_id: string;
  name_fr: string;
  name_ar: string | null;
  panorama_image_url: string;
  display_order: number;
  is_active: boolean;
}

interface Hotspot {
  id: string;
  panorama_id: string;
  hotspot_type: 'artwork' | 'text' | 'media' | 'navigation';
  yaw: number;
  pitch: number;
  label_fr: string;
  label_ar: string | null;
  rich_text_fr: string | null;
  rich_text_ar: string | null;
  artwork_id: string | null;
  media_url: string | null;
  target_panorama_id: string | null;
}

export default function VExpo360PanoramaEditor() {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPanorama, setSelectedPanorama] = useState<Panorama | null>(null);
  const [isAddPanoramaOpen, setIsAddPanoramaOpen] = useState(false);
  const [isAddHotspotOpen, setIsAddHotspotOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [deleteId, setDeleteId] = useState<{ type: 'panorama' | 'hotspot'; id: string } | null>(null);
  const [isEditPanoramaOpen, setIsEditPanoramaOpen] = useState(false);
  const [isUploadingPanorama, setIsUploadingPanorama] = useState(false);

  // Form states
  const [panoramaForm, setPanoramaForm] = useState({
    name_fr: "",
    name_ar: "",
    panorama_image_url: ""
  });

  const [editPanoramaForm, setEditPanoramaForm] = useState({
    name_fr: "",
    name_ar: "",
    panorama_image_url: ""
  });

  const [hotspotForm, setHotspotForm] = useState({
    hotspot_type: "artwork" as 'artwork' | 'text' | 'media' | 'navigation',
    yaw: 0,
    pitch: 0,
    label_fr: "",
    label_ar: "",
    rich_text_fr: "",
    rich_text_ar: "",
    artwork_id: "",
    media_url: "",
    target_panorama_id: ""
  });

  // Fetch exhibition
  const { data: exhibition } = useQuery({
    queryKey: ['vexpo360-exhibition', exhibitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('*')
        .eq('id', exhibitionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!exhibitionId
  });

  // Fetch panoramas
  const { data: panoramas, isLoading: panoramasLoading } = useQuery({
    queryKey: ['vexpo360-panoramas', exhibitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_panoramas')
        .select('*')
        .eq('exhibition_id', exhibitionId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Panorama[];
    },
    enabled: !!exhibitionId
  });

  // Fetch hotspots for selected panorama
  const { data: hotspots } = useQuery({
    queryKey: ['vexpo360-hotspots', selectedPanorama?.id],
    queryFn: async () => {
      if (!selectedPanorama) return [];
      const { data, error } = await supabase
        .from('vexpo_hotspots')
        .select('*')
        .eq('panorama_id', selectedPanorama.id);
      if (error) throw error;
      return data as Hotspot[];
    },
    enabled: !!selectedPanorama
  });

  // Fetch artworks for hotspot linking
  const { data: artworks } = useQuery({
    queryKey: ['vexpo360-artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_artworks')
        .select('id, title_fr, title_ar')
        .order('title_fr');
      if (error) throw error;
      return data;
    }
  });

  // Auto-select first panorama
  useEffect(() => {
    if (panoramas && panoramas.length > 0 && !selectedPanorama) {
      setSelectedPanorama(panoramas[0]);
    }
  }, [panoramas, selectedPanorama]);

  // Add panorama mutation
  const addPanorama = useMutation({
    mutationFn: async () => {
      const displayOrder = (panoramas?.length || 0) + 1;
      const { error } = await supabase
        .from('vexpo_panoramas')
        .insert([{
          exhibition_id: exhibitionId,
          name_fr: panoramaForm.name_fr,
          name_ar: panoramaForm.name_ar || null,
          panorama_image_url: panoramaForm.panorama_image_url,
          display_order: displayOrder,
          is_active: true
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-panoramas', exhibitionId] });
      toast({ title: "Panorama ajouté" });
      setIsAddPanoramaOpen(false);
      setPanoramaForm({ name_fr: "", name_ar: "", panorama_image_url: "" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'ajouter le panorama", variant: "destructive" });
    }
  });

  // Add/Update hotspot mutation
  const saveHotspot = useMutation({
    mutationFn: async () => {
      const payload = {
        panorama_id: selectedPanorama?.id,
        hotspot_type: hotspotForm.hotspot_type,
        yaw: hotspotForm.yaw,
        pitch: hotspotForm.pitch,
        label_fr: hotspotForm.label_fr,
        label_ar: hotspotForm.label_ar || null,
        rich_text_fr: hotspotForm.rich_text_fr || null,
        rich_text_ar: hotspotForm.rich_text_ar || null,
        artwork_id: hotspotForm.artwork_id || null,
        media_url: hotspotForm.media_url || null,
        target_panorama_id: hotspotForm.target_panorama_id || null
      };

      if (editingHotspot) {
        const { error } = await supabase
          .from('vexpo_hotspots')
          .update(payload)
          .eq('id', editingHotspot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vexpo_hotspots')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-hotspots', selectedPanorama?.id] });
      toast({ title: editingHotspot ? "Hotspot modifié" : "Hotspot ajouté" });
      setIsAddHotspotOpen(false);
      setEditingHotspot(null);
      resetHotspotForm();
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le hotspot", variant: "destructive" });
    }
  });

  // Update panorama mutation
  const updatePanorama = useMutation({
    mutationFn: async () => {
      if (!selectedPanorama) return;
      const { error } = await supabase
        .from('vexpo_panoramas')
        .update({
          name_fr: editPanoramaForm.name_fr,
          name_ar: editPanoramaForm.name_ar || null,
          panorama_image_url: editPanoramaForm.panorama_image_url
        })
        .eq('id', selectedPanorama.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-panoramas', exhibitionId] });
      // Update local selected panorama
      if (selectedPanorama) {
        setSelectedPanorama({
          ...selectedPanorama,
          name_fr: editPanoramaForm.name_fr,
          name_ar: editPanoramaForm.name_ar || null,
          panorama_image_url: editPanoramaForm.panorama_image_url
        });
      }
      toast({ title: "Panorama modifié" });
      setIsEditPanoramaOpen(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier le panorama", variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'panorama' | 'hotspot'; id: string }) => {
      const table = type === 'panorama' ? 'vexpo_panoramas' : 'vexpo_hotspots';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { type }) => {
      if (type === 'panorama') {
        queryClient.invalidateQueries({ queryKey: ['vexpo360-panoramas', exhibitionId] });
        if (selectedPanorama?.id === deleteId?.id) {
          setSelectedPanorama(null);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ['vexpo360-hotspots', selectedPanorama?.id] });
      }
      toast({ title: `${type === 'panorama' ? 'Panorama' : 'Hotspot'} supprimé` });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  });

  const openEditPanorama = () => {
    if (selectedPanorama) {
      setEditPanoramaForm({
        name_fr: selectedPanorama.name_fr,
        name_ar: selectedPanorama.name_ar || "",
        panorama_image_url: selectedPanorama.panorama_image_url
      });
      setIsEditPanoramaOpen(true);
    }
  };

  const resetHotspotForm = () => {
    setHotspotForm({
      hotspot_type: "artwork",
      yaw: 0,
      pitch: 0,
      label_fr: "",
      label_ar: "",
      rich_text_fr: "",
      rich_text_ar: "",
      artwork_id: "",
      media_url: "",
      target_panorama_id: ""
    });
  };

  const openEditHotspot = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setHotspotForm({
      hotspot_type: hotspot.hotspot_type,
      yaw: hotspot.yaw,
      pitch: hotspot.pitch,
      label_fr: hotspot.label_fr,
      label_ar: hotspot.label_ar || "",
      rich_text_fr: hotspot.rich_text_fr || "",
      rich_text_ar: hotspot.rich_text_ar || "",
      artwork_id: hotspot.artwork_id || "",
      media_url: hotspot.media_url || "",
      target_panorama_id: hotspot.target_panorama_id || ""
    });
    setIsAddHotspotOpen(true);
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'artwork': return <Image className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'media': return <Video className="h-4 w-4" />;
      case 'navigation': return <Navigation className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getHotspotTypeBadge = (type: string) => {
    switch (type) {
      case 'artwork': return <Badge variant="default">Œuvre</Badge>;
      case 'text': return <Badge variant="secondary">Texte</Badge>;
      case 'media': return <Badge className="bg-purple-500">Média</Badge>;
      case 'navigation': return <Badge className="bg-blue-500">Navigation</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <span className="font-semibold">CMS VExpo 360°</span>
        </div>
      </header>
      
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/vexpo360/edit/${exhibitionId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Éditeur de Panoramas</h1>
              <p className="text-muted-foreground">{exhibition?.title_fr}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Panoramas List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Panoramas ({panoramas?.length || 0}/3)</CardTitle>
                <Dialog open={isAddPanoramaOpen} onOpenChange={setIsAddPanoramaOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={(panoramas?.length || 0) >= 3}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau Panorama</DialogTitle>
                      <DialogDescription>Ajoutez une image panoramique équirectangulaire</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Titre (FR) *</Label>
                        <Input
                          value={panoramaForm.name_fr}
                          onChange={(e) => setPanoramaForm(p => ({ ...p, name_fr: e.target.value }))}
                          placeholder="Salle principale"
                        />
                      </div>
                      <div>
                        <Label>Titre (AR)</Label>
                        <Input
                          value={panoramaForm.name_ar}
                          onChange={(e) => setPanoramaForm(p => ({ ...p, name_ar: e.target.value }))}
                          placeholder="القاعة الرئيسية"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <VExpoImageUpload
                          value={panoramaForm.panorama_image_url}
                          onChange={(url) => setPanoramaForm(p => ({ ...p, panorama_image_url: url }))}
                          label="Image panoramique *"
                          description="Format recommandé: 8192×4096 équirectangulaire"
                          folder="panoramas"
                          maxSizeMB={50}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPanoramaOpen(false)}>Annuler</Button>
                      <Button onClick={() => addPanorama.mutate()} disabled={!panoramaForm.name_fr || !panoramaForm.panorama_image_url}>
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-2">
                {panoramasLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : panoramas && panoramas.length > 0 ? (
                  panoramas.map((panorama) => (
                    <div
                      key={panorama.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPanorama?.id === panorama.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPanorama(panorama)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{panorama.name_fr}</span>
                        </div>
                        {panorama.display_order === 1 && (
                          <Badge variant="outline" className="text-xs">Entrée</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {panorama.panorama_image_url}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId({ type: 'panorama', id: panorama.id });
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun panorama. Ajoutez-en un pour commencer.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hotspots Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Hotspots {selectedPanorama ? `- ${selectedPanorama.name_fr}` : ''}
                  </CardTitle>
                  <CardDescription>
                    Points d'interaction dans le panorama sélectionné
                  </CardDescription>
                </div>
                {selectedPanorama && (
                  <Dialog open={isAddHotspotOpen} onOpenChange={(open) => {
                    setIsAddHotspotOpen(open);
                    if (!open) {
                      setEditingHotspot(null);
                      resetHotspotForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter un Hotspot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingHotspot ? "Modifier le Hotspot" : "Nouveau Hotspot"}</DialogTitle>
                        <DialogDescription>Configurez le point d'interaction</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type *</Label>
                            <Select
                              value={hotspotForm.hotspot_type}
                              onValueChange={(v) => setHotspotForm(h => ({ ...h, hotspot_type: v as typeof hotspotForm.hotspot_type }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="artwork">Œuvre d'art</SelectItem>
                                <SelectItem value="text">Texte informatif</SelectItem>
                                <SelectItem value="media">Média (vidéo/audio)</SelectItem>
                                <SelectItem value="navigation">Navigation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Visual Position Picker */}
                        {selectedPanorama && (
                          <PanoramaPositionPicker
                            panoramaUrl={selectedPanorama.panorama_image_url}
                            yaw={hotspotForm.yaw}
                            pitch={hotspotForm.pitch}
                            onPositionChange={(newYaw, newPitch) => {
                              setHotspotForm(h => ({ ...h, yaw: newYaw, pitch: newPitch }));
                            }}
                          />
                        )}

                        {/* Manual position inputs */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Yaw (horizontal) *</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={hotspotForm.yaw}
                              onChange={(e) => setHotspotForm(h => ({ ...h, yaw: parseFloat(e.target.value) || 0 }))}
                              placeholder="-180 à 180"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Position horizontale (-180° à 180°)</p>
                          </div>
                          <div>
                            <Label>Pitch (vertical) *</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={hotspotForm.pitch}
                              onChange={(e) => setHotspotForm(h => ({ ...h, pitch: parseFloat(e.target.value) || 0 }))}
                              placeholder="-90 à 90"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Position verticale (-90° à 90°)</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Label (FR) *</Label>
                            <Input
                              value={hotspotForm.label_fr}
                              onChange={(e) => setHotspotForm(h => ({ ...h, label_fr: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Label (AR)</Label>
                            <Input
                              value={hotspotForm.label_ar}
                              onChange={(e) => setHotspotForm(h => ({ ...h, label_ar: e.target.value }))}
                              dir="rtl"
                            />
                          </div>
                        </div>

                        {hotspotForm.hotspot_type === 'artwork' && (
                          <div>
                            <Label>Œuvre liée</Label>
                            <Select
                              value={hotspotForm.artwork_id}
                              onValueChange={(v) => setHotspotForm(h => ({ ...h, artwork_id: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une œuvre" />
                              </SelectTrigger>
                              <SelectContent>
                                {artworks?.map(artwork => (
                                  <SelectItem key={artwork.id} value={artwork.id}>
                                    {artwork.title_fr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {hotspotForm.hotspot_type === 'navigation' && (
                          <div>
                            <Label>Panorama cible</Label>
                            <Select
                              value={hotspotForm.target_panorama_id}
                              onValueChange={(v) => setHotspotForm(h => ({ ...h, target_panorama_id: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un panorama" />
                              </SelectTrigger>
                              <SelectContent>
                                {panoramas?.filter(p => p.id !== selectedPanorama?.id).map(p => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name_fr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {hotspotForm.hotspot_type === 'media' && (
                          <VExpoMediaUpload
                            value={hotspotForm.media_url}
                            onChange={(url) => setHotspotForm(h => ({ ...h, media_url: url }))}
                            label="Fichier média (vidéo/audio)"
                            description="Téléversez un fichier vidéo ou audio pour ce hotspot"
                            folder="hotspot-media"
                            maxSizeMB={100}
                          />
                        )}

                        {(hotspotForm.hotspot_type === 'artwork' || hotspotForm.hotspot_type === 'text') && (
                          <VExpoImageUpload
                            value={hotspotForm.media_url}
                            onChange={(url) => setHotspotForm(h => ({ ...h, media_url: url }))}
                            label="Image associée (optionnel)"
                            description="Ajoutez une image pour illustrer ce hotspot"
                            folder="hotspot-images"
                            maxSizeMB={10}
                          />
                        )}

                        {(hotspotForm.hotspot_type === 'text' || hotspotForm.hotspot_type === 'artwork') && (
                          <>
                            <div>
                              <Label>Description (FR)</Label>
                              <Textarea
                                value={hotspotForm.rich_text_fr}
                                onChange={(e) => setHotspotForm(h => ({ ...h, rich_text_fr: e.target.value }))}
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label>Description (AR)</Label>
                              <Textarea
                                value={hotspotForm.rich_text_ar}
                                onChange={(e) => setHotspotForm(h => ({ ...h, rich_text_ar: e.target.value }))}
                                rows={3}
                                dir="rtl"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsAddHotspotOpen(false);
                          setEditingHotspot(null);
                          resetHotspotForm();
                        }}>
                          Annuler
                        </Button>
                        <Button onClick={() => saveHotspot.mutate()} disabled={!hotspotForm.label_fr}>
                          {editingHotspot ? "Modifier" : "Ajouter"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {!selectedPanorama ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un panorama pour gérer ses hotspots</p>
                  </div>
                ) : hotspots && hotspots.length > 0 ? (
                  <div className="space-y-3">
                    {hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getHotspotIcon(hotspot.hotspot_type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{hotspot.label_fr}</span>
                              {getHotspotTypeBadge(hotspot.hotspot_type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Position: yaw={hotspot.yaw}°, pitch={hotspot.pitch}°
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditHotspot(hotspot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId({ type: 'hotspot', id: hotspot.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun hotspot pour ce panorama</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddHotspotOpen(true)}
                    >
                      Ajouter le premier hotspot
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview and Edit Panorama */}
            {selectedPanorama && (
              <Card className="mt-4">
                <CardContent className="py-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Aperçu du panorama</p>
                        <p className="text-xs text-muted-foreground">
                          Visualisez et modifiez l'image panoramique
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          window.open(selectedPanorama.panorama_image_url, '_blank');
                        }}>
                          <Image className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="default" size="sm" onClick={openEditPanorama}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                    {/* Image preview */}
                    <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                      <img
                        src={selectedPanorama.panorama_image_url}
                        alt={selectedPanorama.name_fr}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {selectedPanorama.name_fr}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Panorama Dialog */}
            <Dialog open={isEditPanoramaOpen} onOpenChange={(open) => {
              if (!isUploadingPanorama) {
                setIsEditPanoramaOpen(open);
              }
            }}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Modifier le Panorama</DialogTitle>
                  <DialogDescription>Modifiez les informations et l'image du panorama</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Titre (FR) *</Label>
                    <Input
                      value={editPanoramaForm.name_fr}
                      onChange={(e) => setEditPanoramaForm(p => ({ ...p, name_fr: e.target.value }))}
                      placeholder="Salle principale"
                    />
                  </div>
                  <div>
                    <Label>Titre (AR)</Label>
                    <Input
                      value={editPanoramaForm.name_ar}
                      onChange={(e) => setEditPanoramaForm(p => ({ ...p, name_ar: e.target.value }))}
                      placeholder="القاعة الرئيسية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <VExpoImageUpload
                      value={editPanoramaForm.panorama_image_url}
                      onChange={(url) => setEditPanoramaForm(p => ({ ...p, panorama_image_url: url }))}
                      onUploadingChange={setIsUploadingPanorama}
                      label="Image panoramique *"
                      description="Format recommandé: 8192×4096 équirectangulaire"
                      folder="panoramas"
                      maxSizeMB={50}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditPanoramaOpen(false)}
                    disabled={isUploadingPanorama || updatePanorama.isPending}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={() => updatePanorama.mutate()} 
                    disabled={!editPanoramaForm.name_fr || !editPanoramaForm.panorama_image_url || isUploadingPanorama || updatePanorama.isPending}
                  >
                    {updatePanorama.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteId?.type === 'panorama'
                ? "Ce panorama et tous ses hotspots seront définitivement supprimés."
                : "Ce hotspot sera définitivement supprimé."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
