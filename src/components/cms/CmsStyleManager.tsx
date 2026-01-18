import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Save, Loader2, Type, Paintbrush, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SectionStyles {
  services_numeriques: {
    background_color: string;
    title_color: string;
    button_bg_color: string;
    button_text_color: string;
    card_bg_color: string;
  };
  mediatheque: {
    background_color: string;
    title_color: string;
    button_bg_color: string;
    button_text_color: string;
    accent_color: string;
  };
}

interface Typography {
  heading_font: string;
  body_font: string;
  button_font: string;
}

interface ButtonStyles {
  primary: {
    background: string;
    text: string;
    border_radius: string;
  };
  secondary: {
    background: string;
    text: string;
    border_radius: string;
  };
}

const availableFonts = [
  "Inter",
  "Playfair Display",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Source Sans Pro",
  "Noto Sans Arabic",
  "Cairo",
  "Tajawal"
];

const defaultStyles: SectionStyles = {
  services_numeriques: {
    background_color: "#f8fafc",
    title_color: "#1e293b",
    button_bg_color: "#1e40af",
    button_text_color: "#ffffff",
    card_bg_color: "#ffffff"
  },
  mediatheque: {
    background_color: "#1e3a5f",
    title_color: "#ffffff",
    button_bg_color: "#3b82f6",
    button_text_color: "#ffffff",
    accent_color: "#d4af37"
  }
};

const defaultTypography: Typography = {
  heading_font: "Playfair Display",
  body_font: "Inter",
  button_font: "Inter"
};

const defaultButtonStyles: ButtonStyles = {
  primary: {
    background: "#1e40af",
    text: "#ffffff",
    border_radius: "8px"
  },
  secondary: {
    background: "#f1f5f9",
    text: "#1e293b",
    border_radius: "8px"
  }
};

export default function CmsStyleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sectionStyles, setSectionStyles] = useState<SectionStyles>(defaultStyles);
  const [typography, setTypography] = useState<Typography>(defaultTypography);
  const [buttonStyles, setButtonStyles] = useState<ButtonStyles>(defaultButtonStyles);

  const { isLoading } = useQuery({
    queryKey: ['cms-portal-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*');
      
      if (error) throw error;
      
      data?.forEach((setting: any) => {
        if (setting.setting_key === 'section_styles') {
          setSectionStyles(setting.setting_value as SectionStyles);
        } else if (setting.setting_key === 'typography') {
          setTypography(setting.setting_value as Typography);
        } else if (setting.setting_key === 'button_styles') {
          setButtonStyles(setting.setting_value as ButtonStyles);
        }
      });
      
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { setting_key: 'section_styles', setting_value: sectionStyles as any, category: 'styling' },
        { setting_key: 'typography', setting_value: typography as any, category: 'styling' },
        { setting_key: 'button_styles', setting_value: buttonStyles as any, category: 'styling' }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('cms_portal_settings')
          .upsert(update, {
            onConflict: 'setting_key'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-portal-settings'] });
      toast({ title: "Styles sauvegardés avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const resetToDefaults = () => {
    setSectionStyles(defaultStyles);
    setTypography(defaultTypography);
    setButtonStyles(defaultButtonStyles);
    toast({ title: "Styles réinitialisés aux valeurs par défaut" });
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
            <Palette className="h-5 w-5" />
            Styles et Design du Portail
          </CardTitle>
          <CardDescription>
            Personnalisez les couleurs, polices et styles des sections
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
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
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typographie
            </TabsTrigger>
            <TabsTrigger value="buttons" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Boutons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6 mt-4">
            {/* Services Numériques */}
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Section "Nos Services Numériques"</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.services_numeriques.background_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, background_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.services_numeriques.background_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, background_color: e.target.value }
                      }))}
                      placeholder="#f8fafc"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur du titre</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.services_numeriques.title_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, title_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.services_numeriques.title_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, title_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fond des boutons</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.services_numeriques.button_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, button_bg_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.services_numeriques.button_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, button_bg_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Texte des boutons</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.services_numeriques.button_text_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, button_text_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.services_numeriques.button_text_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, button_text_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fond des cartes</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.services_numeriques.card_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, card_bg_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.services_numeriques.card_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        services_numeriques: { ...prev.services_numeriques, card_bg_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Médiathèque */}
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Section "Médiathèque"</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.mediatheque.background_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, background_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.mediatheque.background_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, background_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur du titre</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.mediatheque.title_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, title_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.mediatheque.title_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, title_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fond des boutons</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.mediatheque.button_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, button_bg_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.mediatheque.button_bg_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, button_bg_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Texte des boutons</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.mediatheque.button_text_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, button_text_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.mediatheque.button_text_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, button_text_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur accent (ligne)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={sectionStyles.mediatheque.accent_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, accent_color: e.target.value }
                      }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={sectionStyles.mediatheque.accent_color}
                      onChange={(e) => setSectionStyles(prev => ({
                        ...prev,
                        mediatheque: { ...prev.mediatheque, accent_color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Polices typographiques</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Police des titres</Label>
                  <Select
                    value={typography.heading_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, heading_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFonts.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: typography.heading_font }}>
                    Aperçu: Titre exemple
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Police du corps de texte</Label>
                  <Select
                    value={typography.body_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, body_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFonts.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: typography.body_font }}>
                    Aperçu: Texte de paragraphe exemple
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Police des boutons</Label>
                  <Select
                    value={typography.button_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, button_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFonts.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: typography.button_font }}>
                    Aperçu: BOUTON
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Button */}
              <Card className="border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Bouton Primaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Couleur de fond</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={buttonStyles.primary.background}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          primary: { ...prev.primary, background: e.target.value }
                        }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={buttonStyles.primary.background}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          primary: { ...prev.primary, background: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur du texte</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={buttonStyles.primary.text}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          primary: { ...prev.primary, text: e.target.value }
                        }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={buttonStyles.primary.text}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          primary: { ...prev.primary, text: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rayon des coins</Label>
                    <Input
                      value={buttonStyles.primary.border_radius}
                      onChange={(e) => setButtonStyles(prev => ({
                        ...prev,
                        primary: { ...prev.primary, border_radius: e.target.value }
                      }))}
                      placeholder="8px"
                    />
                  </div>
                  <div className="pt-2">
                    <Label className="text-xs text-muted-foreground">Aperçu:</Label>
                    <button
                      className="mt-2 px-6 py-2 font-medium"
                      style={{
                        backgroundColor: buttonStyles.primary.background,
                        color: buttonStyles.primary.text,
                        borderRadius: buttonStyles.primary.border_radius,
                        fontFamily: typography.button_font
                      }}
                    >
                      Bouton Primaire
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Button */}
              <Card className="border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Bouton Secondaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Couleur de fond</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={buttonStyles.secondary.background}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          secondary: { ...prev.secondary, background: e.target.value }
                        }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={buttonStyles.secondary.background}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          secondary: { ...prev.secondary, background: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur du texte</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={buttonStyles.secondary.text}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          secondary: { ...prev.secondary, text: e.target.value }
                        }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={buttonStyles.secondary.text}
                        onChange={(e) => setButtonStyles(prev => ({
                          ...prev,
                          secondary: { ...prev.secondary, text: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rayon des coins</Label>
                    <Input
                      value={buttonStyles.secondary.border_radius}
                      onChange={(e) => setButtonStyles(prev => ({
                        ...prev,
                        secondary: { ...prev.secondary, border_radius: e.target.value }
                      }))}
                      placeholder="8px"
                    />
                  </div>
                  <div className="pt-2">
                    <Label className="text-xs text-muted-foreground">Aperçu:</Label>
                    <button
                      className="mt-2 px-6 py-2 font-medium border"
                      style={{
                        backgroundColor: buttonStyles.secondary.background,
                        color: buttonStyles.secondary.text,
                        borderRadius: buttonStyles.secondary.border_radius,
                        fontFamily: typography.button_font
                      }}
                    >
                      Bouton Secondaire
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}