import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, RotateCcw, Info } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { DEFAULT_TOOLTIPS, type BNTooltipConfig } from "@/hooks/useBNTooltips";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface TooltipField {
  key: keyof BNTooltipConfig;
  label: string;
  icon: string;
  category: string;
}

const TOOLTIP_FIELDS: TooltipField[] = [
  // Collections
  { key: "collections_manuscripts", label: "Manuscrits", icon: "mdi:scroll-text-outline", category: "Collections" },
  { key: "collections_lithography", label: "Lithographie", icon: "mdi:file-document-outline", category: "Collections" },
  { key: "collections_books", label: "Livres", icon: "mdi:book-outline", category: "Collections" },
  { key: "collections_periodicals", label: "Revues et Journaux", icon: "mdi:newspaper-variant-outline", category: "Collections" },
  { key: "collections_specialized", label: "Collections spécialisées", icon: "mdi:map-outline", category: "Collections" },
  { key: "collections_audiovisual", label: "Documents Audio-visuels", icon: "mdi:music-note-outline", category: "Collections" },
  // Services
  { key: "services_membership", label: "Abonnement", icon: "mdi:account-plus-outline", category: "Services aux lecteurs" },
  { key: "services_reproduction", label: "Demande de Reproduction", icon: "mdi:content-copy", category: "Services aux lecteurs" },
];

export default function CmsTooltipsManagerBN() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BNTooltipConfig>(DEFAULT_TOOLTIPS);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["bn-tooltips-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "bn_tooltips")
        .maybeSingle();

      if (error) throw error;

      const saved = data?.setting_value as Record<string, string> | null;
      return { ...DEFAULT_TOOLTIPS, ...(saved || {}) };
    },
  });

  useEffect(() => {
    if (savedData) {
      setFormData(savedData);
    }
  }, [savedData]);
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from("cms_portal_settings")
        .select("id")
        .eq("setting_key", "bn_tooltips")
        .maybeSingle();

      const jsonValue = formData as any;

      if (existing) {
        const { error } = await supabase
          .from("cms_portal_settings")
          .update({ setting_value: jsonValue, updated_at: new Date().toISOString() })
          .eq("setting_key", "bn_tooltips");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cms_portal_settings")
          .insert({
            setting_key: "bn_tooltips",
            setting_value: jsonValue,
            category: "navigation",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Infobulles sauvegardées avec succès");
      queryClient.invalidateQueries({ queryKey: ["bn-tooltips"] });
      queryClient.invalidateQueries({ queryKey: ["bn-tooltips-admin"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    },
  });

  const handleReset = () => {
    setFormData(DEFAULT_TOOLTIPS);
    toast.info("Valeurs par défaut restaurées (non sauvegardées)");
  };

  const handleChange = (key: keyof BNTooltipConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Group fields by category
  const categories = TOOLTIP_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, TooltipField[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Infobulles de la navigation</h3>
          <p className="text-sm text-muted-foreground">
            Personnalisez les textes descriptifs affichés au survol des éléments de menu
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {Object.entries(categories).map(([category, fields]) => (
        <Card key={category} className="border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{category}</Badge>
              <CardDescription>{fields.length} infobulles</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-1">
                  <Icon name={field.icon} className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <Textarea
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={DEFAULT_TOOLTIPS[field.key]}
                    className="min-h-[60px] text-sm resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Par défaut : {DEFAULT_TOOLTIPS[field.key]}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
