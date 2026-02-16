import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDropdown } from "@/components/cbn/SimpleDropdown";
import { Plus, Pencil, Trash2, Copy, Shield, Lock, Unlock, Eye, EyeOff, Download, Camera, MousePointerClick, BookOpenCheck, ScrollText, Layers } from "lucide-react";
import { Icon } from "@iconify/react";

interface RestrictionTemplate {
  id: string;
  name: string;
  description: string | null;
  is_restricted: boolean;
  restriction_mode: string;
  start_page: number | null;
  end_page: number | null;
  manual_pages: number[] | null;
  percentage_value: number | null;
  percentage_distribution: string | null;
  allow_physical_consultation: boolean | null;
  allow_download: boolean | null;
  allow_screenshot: boolean | null;
  allow_right_click: boolean | null;
  restricted_page_display: string | null;
  restricted_page_display_reason: string | null;
  allow_double_page_view: boolean | null;
  allow_scroll_view: boolean | null;
  created_at: string;
  updated_at: string;
}

const defaultTemplate: Partial<RestrictionTemplate> = {
  name: "",
  description: "",
  is_restricted: true,
  restriction_mode: "range",
  start_page: 1,
  end_page: 10,
  manual_pages: [],
  percentage_value: 10,
  percentage_distribution: "start",
  allow_physical_consultation: false,
  allow_download: true,
  allow_screenshot: true,
  allow_right_click: true,
  restricted_page_display: "blur",
  restricted_page_display_reason: "Pages du document numérique consultables intégralement sur place",
  allow_double_page_view: true,
  allow_scroll_view: true,
};

export function RestrictionTemplatesManager() {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showSheet, setShowSheet] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RestrictionTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<RestrictionTemplate>>(defaultTemplate);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['restriction-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restriction_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RestrictionTemplate[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<RestrictionTemplate>) => {
      if (editingTemplate) {
        const { error } = await supabase
          .from('restriction_templates')
          .update(data)
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restriction_templates')
          .insert({ ...data, created_by: session?.user?.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restriction-templates'] });
      setShowSheet(false);
      setEditingTemplate(null);
      setFormData(defaultTemplate);
      toast({ title: editingTemplate ? "Modèle mis à jour" : "Modèle créé", description: "Le modèle de restrictions a été sauvegardé." });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('restriction_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restriction-templates'] });
      toast({ title: "Modèle supprimé" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  });

  const openCreate = () => {
    setEditingTemplate(null);
    setFormData(defaultTemplate);
    setShowSheet(true);
  };

  const openEdit = (tpl: RestrictionTemplate) => {
    setEditingTemplate(tpl);
    setFormData({ ...tpl });
    setShowSheet(true);
  };

  const openDuplicate = (tpl: RestrictionTemplate) => {
    setEditingTemplate(null);
    setFormData({ ...tpl, name: `${tpl.name} (copie)`, id: undefined });
    setShowSheet(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir un nom pour le modèle.", variant: "destructive" });
      return;
    }
    const { id, created_at, updated_at, ...saveData } = formData as any;
    saveMutation.mutate(saveData);
  };

  const displayModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'blur': return 'Flou';
      case 'empty': return 'Vide';
      case 'hidden': return 'Masqué';
      default: return mode;
    }
  };

  const restrictionModeLabel = (mode: string) => {
    switch (mode) {
      case 'range': return 'Par plage';
      case 'manual': return 'Manuel';
      case 'percentage': return 'Pourcentage';
      default: return mode;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-start gap-6">
          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <Icon icon="mdi:file-document-check-outline" className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Modèles de restrictions</h1>
            <p className="text-white/90 text-lg">
              Créez des modèles réutilisables pour appliquer rapidement des restrictions aux lots de documents
            </p>
            <div className="mt-4 flex gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" />
                {templates?.length || 0} modèle(s)
              </Badge>
            </div>
          </div>
          <Button onClick={openCreate} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau modèle
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Liste des modèles
          </CardTitle>
          <CardDescription>Modèles de restrictions préconfigurés applicables aux lots</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : !templates?.length ? (
            <div className="p-12 text-center">
              <Icon icon="mdi:file-document-plus-outline" className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Aucun modèle créé</p>
              <p className="text-sm text-muted-foreground mb-4">Créez votre premier modèle de restrictions</p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un modèle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Affichage restreint</TableHead>
                    <TableHead>Sécurité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow key={tpl.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tpl.name}</p>
                          {tpl.description && <p className="text-xs text-muted-foreground">{tpl.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{restrictionModeLabel(tpl.restriction_mode)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {tpl.restriction_mode === 'range' && `${tpl.start_page} - ${tpl.end_page}`}
                        {tpl.restriction_mode === 'percentage' && `${tpl.percentage_value}%`}
                        {tpl.restriction_mode === 'manual' && `${tpl.manual_pages?.length || 0} pages`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tpl.restricted_page_display === 'blur' ? 'secondary' : 'destructive'} className="text-xs">
                          {displayModeLabel(tpl.restricted_page_display)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!tpl.allow_download && <Download className="h-3.5 w-3.5 text-destructive" />}
                          {!tpl.allow_screenshot && <Camera className="h-3.5 w-3.5 text-destructive" />}
                          {!tpl.allow_right_click && <MousePointerClick className="h-3.5 w-3.5 text-destructive" />}
                          {tpl.allow_download && tpl.allow_screenshot && tpl.allow_right_click && (
                            <span className="text-xs text-muted-foreground">Tout autorisé</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(tpl)} title="Modifier">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDuplicate(tpl)} title="Dupliquer">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (confirm(`Supprimer le modèle "${tpl.name}" ?`)) deleteMutation.mutate(tpl.id);
                          }} title="Supprimer">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet for create/edit */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTemplate ? "Modifier le modèle" : "Nouveau modèle"}</SheetTitle>
            <SheetDescription>
              Configurez les paramètres de restriction réutilisables
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Nom et description */}
            <div className="space-y-3">
              <Label className="font-semibold">Nom du modèle *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Restriction standard 10%"
              />
            </div>
            <div className="space-y-3">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du modèle..."
                rows={2}
              />
            </div>

            {/* Mode de restriction */}
            <div className="space-y-3">
              <Label className="font-semibold">Mode de restriction</Label>
              <SimpleDropdown
                value={formData.restriction_mode || "range"}
                onChange={(v) => setFormData({ ...formData, restriction_mode: v })}
                options={[
                  { value: "range", label: "Par plage de pages" },
                  { value: "percentage", label: "Par pourcentage" },
                  { value: "manual", label: "Pages manuelles" },
                ]}
                placeholder="Sélectionner"
              />
            </div>

            {/* Config selon le mode */}
            {formData.restriction_mode === "range" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page début</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.start_page || 1}
                    onChange={(e) => setFormData({ ...formData, start_page: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Page fin</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.end_page || 10}
                    onChange={(e) => setFormData({ ...formData, end_page: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            )}

            {formData.restriction_mode === "percentage" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pourcentage (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.percentage_value || 10}
                    onChange={(e) => setFormData({ ...formData, percentage_value: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Distribution</Label>
                  <SimpleDropdown
                    value={formData.percentage_distribution || "start"}
                    onChange={(v) => setFormData({ ...formData, percentage_distribution: v })}
                    options={[
                      { value: "start", label: "Depuis le début" },
                      { value: "end", label: "Depuis la fin" },
                      { value: "distributed", label: "Réparties" },
                    ]}
                    placeholder="Distribution"
                  />
                </div>
              </div>
            )}

            {formData.restriction_mode === "manual" && (
              <div className="space-y-2">
                <Label>Pages autorisées (séparées par des virgules)</Label>
                <Input
                  value={formData.manual_pages?.join(", ") || ""}
                  onChange={(e) => {
                    const pages = e.target.value.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                    setFormData({ ...formData, manual_pages: pages });
                  }}
                  placeholder="1, 2, 3, 10, 15"
                />
              </div>
            )}

            {/* Affichage des pages restreintes */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Affichage des pages restreintes
              </h3>
              <SimpleDropdown
                value={formData.restricted_page_display || "blur"}
                onChange={(v) => setFormData({ ...formData, restricted_page_display: v })}
                options={[
                  { value: "blur", label: "🔍 Flou (aperçu flouté)" },
                  { value: "empty", label: "📄 Vide (page blanche)" },
                  { value: "hidden", label: "🚫 Masqué (page cachée)" },
                ]}
                placeholder="Mode d'affichage"
              />
              <div className="space-y-2">
                <Label className="text-xs">Motif affiché à l'utilisateur</Label>
                <Input
                  value={formData.restricted_page_display_reason || ""}
                  onChange={(e) => setFormData({ ...formData, restricted_page_display_reason: e.target.value })}
                  placeholder="Raison de la restriction..."
                />
              </div>
            </div>

            {/* Sécurité */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Paramètres de sécurité
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <Label>Téléchargement</Label>
                  </div>
                  <Switch checked={formData.allow_download ?? true} onCheckedChange={(v) => setFormData({ ...formData, allow_download: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <Label>Capture d'écran</Label>
                  </div>
                  <Switch checked={formData.allow_screenshot ?? true} onCheckedChange={(v) => setFormData({ ...formData, allow_screenshot: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    <Label>Clic droit</Label>
                  </div>
                  <Switch checked={formData.allow_right_click ?? true} onCheckedChange={(v) => setFormData({ ...formData, allow_right_click: v })} />
                </div>
              </div>
            </div>

            {/* Vue */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4" />
                Options de vue
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Vue double page</Label>
                  <Switch checked={formData.allow_double_page_view ?? true} onCheckedChange={(v) => setFormData({ ...formData, allow_double_page_view: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Vue défilement</Label>
                  <Switch checked={formData.allow_scroll_view ?? true} onCheckedChange={(v) => setFormData({ ...formData, allow_scroll_view: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Consultation physique</Label>
                  <Switch checked={formData.allow_physical_consultation ?? false} onCheckedChange={(v) => setFormData({ ...formData, allow_physical_consultation: v })} />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSheet(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Enregistrement..." : editingTemplate ? "Mettre à jour" : "Créer le modèle"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
