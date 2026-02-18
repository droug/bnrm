import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw, Search, Mail, Phone, MapPin, Clock } from "lucide-react";

interface SearchContactSettings {
  email: string;
  phone: string;
  phone_display: string;
  address: string;
  hours: string;
}

const DEFAULT_SETTINGS: SearchContactSettings = {
  email: "info@bnrm.ma",
  phone: "+212537279800",
  phone_display: "+212 5 37 27 98 00",
  address: "Avenue Ibn Batouta, Rabat",
  hours: "Du lundi au vendredi, 8h30 – 18h00",
};

const SETTING_KEY = "advanced_search_contact";

export default function CmsSearchContactManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SearchContactSettings>(DEFAULT_SETTINGS);

  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["advanced-search-contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      return data?.setting_value as unknown as SearchContactSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({ ...DEFAULT_SETTINGS, ...settings });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: SearchContactSettings) => {
      const { error } = await supabase
        .from("cms_portal_settings")
        .upsert(
          { setting_key: SETTING_KEY, setting_value: data as any, updated_at: new Date().toISOString() },
          { onConflict: "setting_key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advanced-search-contact-settings"] });
      toast({ title: "Paramètres sauvegardés", description: "Les coordonnées ont été mises à jour." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Coordonnées — Recherche avancée (résultats vides)
            </CardTitle>
            <CardDescription>
              Ces informations de contact s'affichent dans la carte "Obtenir des informations" lorsqu'une recherche ne retourne aucun résultat.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Aperçu */}
          <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Aperçu de la carte
            </p>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium">{formData.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                <div className="p-2 rounded-full bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Téléphone</p>
                  <p className="text-sm font-medium">{formData.phone_display || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                <div className="p-2 rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Adresse</p>
                  <p className="text-sm font-medium">{formData.address || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Horaires :</span> {formData.hours || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Champs */}
          <div className="grid gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email de contact
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@bnrm.ma"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Numéro (lien href)
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+212537279800"
                />
                <p className="text-xs text-muted-foreground">Sans espaces ni tirets (pour le lien tel:)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Numéro (affiché)
              </Label>
              <Input
                value={formData.phone_display}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_display: e.target.value }))}
                placeholder="+212 5 37 27 98 00"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Adresse
              </Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Avenue Ibn Batouta, Rabat"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Horaires d'ouverture
              </Label>
              <Input
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="Du lundi au vendredi, 8h30 – 18h00"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="gap-2 bg-bn-blue-primary hover:bg-bn-blue-primary/90"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
