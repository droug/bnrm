import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Palette, Save, Loader2, Type, Paintbrush, RotateCcw, Home, Newspaper, Globe, Link2, Video, Footprints } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SectionStyles {
  hero: {
    overlay_color: string;
    overlay_opacity: string;
    title_color: string;
    subtitle_color: string;
    tagline_color: string;
    button_bg_color: string;
    button_text_color: string;
  };
  actualites_evenements: {
    header_bg_color: string;
    header_title_color: string;
    header_tagline_color: string;
    card_bg_color: string;
    card_title_color: string;
    badge_bg_color: string;
    badge_text_color: string;
    button_bg_color: string;
    button_text_color: string;
  };
  services_numeriques: {
    background_color: string;
    title_color: string;
    tagline_color: string;
    description_color: string;
    button_bg_color: string;
    button_text_color: string;
    card_bg_color: string;
    accent_color: string;
  };
  plateformes: {
    overlay_color: string;
    title_color: string;
    tagline_color: string;
    description_color: string;
    accent_color: string;
  };
  liens_rapides: {
    background_color: string;
    title_color: string;
    tagline_color: string;
    card_bg_gradient_from: string;
    card_bg_gradient_to: string;
    card_title_color: string;
    card_description_color: string;
    icon_color: string;
  };
  mediatheque: {
    background_color: string;
    title_color: string;
    tagline_color: string;
    description_color: string;
    accent_color: string;
    button_bg_color: string;
    button_text_color: string;
  };
  footer: {
    background_color: string;
    text_color: string;
    link_color: string;
    link_hover_color: string;
    border_color: string;
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
  hero: {
    overlay_color: "#000000",
    overlay_opacity: "0.5",
    title_color: "#ffffff",
    subtitle_color: "#ffffff",
    tagline_color: "#93c5fd",
    button_bg_color: "#1e40af",
    button_text_color: "#ffffff"
  },
  actualites_evenements: {
    header_bg_color: "#1e3a8a",
    header_title_color: "#ffffff",
    header_tagline_color: "#93c5fd",
    card_bg_color: "#ffffff",
    card_title_color: "#1e3a8a",
    badge_bg_color: "#1e40af",
    badge_text_color: "#ffffff",
    button_bg_color: "#1e40af",
    button_text_color: "#ffffff"
  },
  services_numeriques: {
    background_color: "#f8fafc",
    title_color: "#1e3a8a",
    tagline_color: "#3b82f6",
    description_color: "#64748b",
    button_bg_color: "#1e40af",
    button_text_color: "#ffffff",
    card_bg_color: "#ffffff",
    accent_color: "#3b82f6"
  },
  plateformes: {
    overlay_color: "#000000",
    title_color: "#ffffff",
    tagline_color: "#f97316",
    description_color: "#ffffff",
    accent_color: "#f97316"
  },
  liens_rapides: {
    background_color: "#ffffff",
    title_color: "#1e3a8a",
    tagline_color: "#3b82f6",
    card_bg_gradient_from: "#eff6ff",
    card_bg_gradient_to: "#dbeafe",
    card_title_color: "#1e293b",
    card_description_color: "#64748b",
    icon_color: "#3b82f6"
  },
  mediatheque: {
    background_color: "#1e3a5f",
    title_color: "#ffffff",
    tagline_color: "#93c5fd",
    description_color: "#ffffff",
    accent_color: "#d4af37",
    button_bg_color: "#3b82f6",
    button_text_color: "#ffffff"
  },
  footer: {
    background_color: "#1e293b",
    text_color: "#94a3b8",
    link_color: "#cbd5e1",
    link_hover_color: "#ffffff",
    border_color: "#334155"
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

// Composant réutilisable pour les champs de couleur
function ColorField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}

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
        if (setting.setting_key === 'section_styles' && setting.setting_value) {
          // Deep merge each section with defaults
          const loaded = setting.setting_value as Partial<SectionStyles>;
          setSectionStyles({
            hero: { ...defaultStyles.hero, ...(loaded.hero || {}) },
            actualites_evenements: { ...defaultStyles.actualites_evenements, ...(loaded.actualites_evenements || {}) },
            services_numeriques: { ...defaultStyles.services_numeriques, ...(loaded.services_numeriques || {}) },
            plateformes: { ...defaultStyles.plateformes, ...(loaded.plateformes || {}) },
            liens_rapides: { ...defaultStyles.liens_rapides, ...(loaded.liens_rapides || {}) },
            mediatheque: { ...defaultStyles.mediatheque, ...(loaded.mediatheque || {}) },
            footer: { ...defaultStyles.footer, ...(loaded.footer || {}) }
          });
        } else if (setting.setting_key === 'typography' && setting.setting_value) {
          setTypography({ ...defaultTypography, ...setting.setting_value });
        } else if (setting.setting_key === 'button_styles' && setting.setting_value) {
          setButtonStyles({ ...defaultButtonStyles, ...setting.setting_value });
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
          .upsert(update, { onConflict: 'setting_key' });
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

  const updateSectionStyle = <K extends keyof SectionStyles>(
    section: K,
    key: keyof SectionStyles[K],
    value: string
  ) => {
    setSectionStyles(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
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
            Personnalisez les couleurs, polices et styles de toutes les sections
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

          <TabsContent value="sections" className="mt-4">
            <Accordion type="multiple" defaultValue={["hero"]} className="space-y-2">
              {/* Hero Section */}
              <AccordionItem value="hero" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">Section Hero</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Overlay" 
                      value={sectionStyles.hero.overlay_color}
                      onChange={(v) => updateSectionStyle('hero', 'overlay_color', v)}
                    />
                    <ColorField 
                      label="Titre" 
                      value={sectionStyles.hero.title_color}
                      onChange={(v) => updateSectionStyle('hero', 'title_color', v)}
                    />
                    <ColorField 
                      label="Sous-titre" 
                      value={sectionStyles.hero.subtitle_color}
                      onChange={(v) => updateSectionStyle('hero', 'subtitle_color', v)}
                    />
                    <ColorField 
                      label="Tagline" 
                      value={sectionStyles.hero.tagline_color}
                      onChange={(v) => updateSectionStyle('hero', 'tagline_color', v)}
                    />
                    <ColorField 
                      label="Bouton (fond)" 
                      value={sectionStyles.hero.button_bg_color}
                      onChange={(v) => updateSectionStyle('hero', 'button_bg_color', v)}
                    />
                    <ColorField 
                      label="Bouton (texte)" 
                      value={sectionStyles.hero.button_text_color}
                      onChange={(v) => updateSectionStyle('hero', 'button_text_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Actualités & Événements */}
              <AccordionItem value="actualites" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Newspaper className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold">Section Actualités & Événements</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Header (fond)" 
                      value={sectionStyles.actualites_evenements.header_bg_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'header_bg_color', v)}
                    />
                    <ColorField 
                      label="Header (titre)" 
                      value={sectionStyles.actualites_evenements.header_title_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'header_title_color', v)}
                    />
                    <ColorField 
                      label="Header (tagline)" 
                      value={sectionStyles.actualites_evenements.header_tagline_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'header_tagline_color', v)}
                    />
                    <ColorField 
                      label="Carte (fond)" 
                      value={sectionStyles.actualites_evenements.card_bg_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'card_bg_color', v)}
                    />
                    <ColorField 
                      label="Carte (titre)" 
                      value={sectionStyles.actualites_evenements.card_title_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'card_title_color', v)}
                    />
                    <ColorField 
                      label="Badge (fond)" 
                      value={sectionStyles.actualites_evenements.badge_bg_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'badge_bg_color', v)}
                    />
                    <ColorField 
                      label="Badge (texte)" 
                      value={sectionStyles.actualites_evenements.badge_text_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'badge_text_color', v)}
                    />
                    <ColorField 
                      label="Bouton (fond)" 
                      value={sectionStyles.actualites_evenements.button_bg_color}
                      onChange={(v) => updateSectionStyle('actualites_evenements', 'button_bg_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Services Numériques */}
              <AccordionItem value="services" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold">Section Nos Services Numériques</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Fond" 
                      value={sectionStyles.services_numeriques.background_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'background_color', v)}
                    />
                    <ColorField 
                      label="Titre" 
                      value={sectionStyles.services_numeriques.title_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'title_color', v)}
                    />
                    <ColorField 
                      label="Tagline" 
                      value={sectionStyles.services_numeriques.tagline_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'tagline_color', v)}
                    />
                    <ColorField 
                      label="Description" 
                      value={sectionStyles.services_numeriques.description_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'description_color', v)}
                    />
                    <ColorField 
                      label="Carte (fond)" 
                      value={sectionStyles.services_numeriques.card_bg_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'card_bg_color', v)}
                    />
                    <ColorField 
                      label="Accent (ligne)" 
                      value={sectionStyles.services_numeriques.accent_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'accent_color', v)}
                    />
                    <ColorField 
                      label="Bouton (fond)" 
                      value={sectionStyles.services_numeriques.button_bg_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'button_bg_color', v)}
                    />
                    <ColorField 
                      label="Bouton (texte)" 
                      value={sectionStyles.services_numeriques.button_text_color}
                      onChange={(v) => updateSectionStyle('services_numeriques', 'button_text_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Plateformes */}
              <AccordionItem value="plateformes" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold">Section Nos Plateformes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Overlay" 
                      value={sectionStyles.plateformes.overlay_color}
                      onChange={(v) => updateSectionStyle('plateformes', 'overlay_color', v)}
                    />
                    <ColorField 
                      label="Titre" 
                      value={sectionStyles.plateformes.title_color}
                      onChange={(v) => updateSectionStyle('plateformes', 'title_color', v)}
                    />
                    <ColorField 
                      label="Tagline" 
                      value={sectionStyles.plateformes.tagline_color}
                      onChange={(v) => updateSectionStyle('plateformes', 'tagline_color', v)}
                    />
                    <ColorField 
                      label="Description" 
                      value={sectionStyles.plateformes.description_color}
                      onChange={(v) => updateSectionStyle('plateformes', 'description_color', v)}
                    />
                    <ColorField 
                      label="Accent (ligne)" 
                      value={sectionStyles.plateformes.accent_color}
                      onChange={(v) => updateSectionStyle('plateformes', 'accent_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Liens Rapides */}
              <AccordionItem value="liens" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-violet-500" />
                    <span className="font-semibold">Section Liens Rapides</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Fond" 
                      value={sectionStyles.liens_rapides.background_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'background_color', v)}
                    />
                    <ColorField 
                      label="Titre" 
                      value={sectionStyles.liens_rapides.title_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'title_color', v)}
                    />
                    <ColorField 
                      label="Tagline" 
                      value={sectionStyles.liens_rapides.tagline_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'tagline_color', v)}
                    />
                    <ColorField 
                      label="Carte (gradient début)" 
                      value={sectionStyles.liens_rapides.card_bg_gradient_from}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'card_bg_gradient_from', v)}
                    />
                    <ColorField 
                      label="Carte (gradient fin)" 
                      value={sectionStyles.liens_rapides.card_bg_gradient_to}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'card_bg_gradient_to', v)}
                    />
                    <ColorField 
                      label="Carte (titre)" 
                      value={sectionStyles.liens_rapides.card_title_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'card_title_color', v)}
                    />
                    <ColorField 
                      label="Carte (description)" 
                      value={sectionStyles.liens_rapides.card_description_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'card_description_color', v)}
                    />
                    <ColorField 
                      label="Icône" 
                      value={sectionStyles.liens_rapides.icon_color}
                      onChange={(v) => updateSectionStyle('liens_rapides', 'icon_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Médiathèque */}
              <AccordionItem value="mediatheque" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Section Médiathèque</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Fond" 
                      value={sectionStyles.mediatheque.background_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'background_color', v)}
                    />
                    <ColorField 
                      label="Titre" 
                      value={sectionStyles.mediatheque.title_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'title_color', v)}
                    />
                    <ColorField 
                      label="Tagline" 
                      value={sectionStyles.mediatheque.tagline_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'tagline_color', v)}
                    />
                    <ColorField 
                      label="Description" 
                      value={sectionStyles.mediatheque.description_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'description_color', v)}
                    />
                    <ColorField 
                      label="Accent (ligne)" 
                      value={sectionStyles.mediatheque.accent_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'accent_color', v)}
                    />
                    <ColorField 
                      label="Bouton (fond)" 
                      value={sectionStyles.mediatheque.button_bg_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'button_bg_color', v)}
                    />
                    <ColorField 
                      label="Bouton (texte)" 
                      value={sectionStyles.mediatheque.button_text_color}
                      onChange={(v) => updateSectionStyle('mediatheque', 'button_text_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Footer */}
              <AccordionItem value="footer" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Footprints className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold">Section Footer</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                    <ColorField 
                      label="Fond" 
                      value={sectionStyles.footer.background_color}
                      onChange={(v) => updateSectionStyle('footer', 'background_color', v)}
                    />
                    <ColorField 
                      label="Texte" 
                      value={sectionStyles.footer.text_color}
                      onChange={(v) => updateSectionStyle('footer', 'text_color', v)}
                    />
                    <ColorField 
                      label="Liens" 
                      value={sectionStyles.footer.link_color}
                      onChange={(v) => updateSectionStyle('footer', 'link_color', v)}
                    />
                    <ColorField 
                      label="Liens (survol)" 
                      value={sectionStyles.footer.link_hover_color}
                      onChange={(v) => updateSectionStyle('footer', 'link_hover_color', v)}
                    />
                    <ColorField 
                      label="Bordure" 
                      value={sectionStyles.footer.border_color}
                      onChange={(v) => updateSectionStyle('footer', 'border_color', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Appliquée aux titres H1-H6</p>
                </div>
                <div className="space-y-2">
                  <Label>Police du corps</Label>
                  <Select
                    value={typography.body_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, body_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Appliquée aux paragraphes</p>
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
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Appliquée aux boutons et CTA</p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Aperçu des polices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h2 style={{ fontFamily: typography.heading_font }} className="text-2xl font-bold mb-2">
                    Titre de section (Playfair Display)
                  </h2>
                  <p style={{ fontFamily: typography.body_font }} className="text-base mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <Button style={{ fontFamily: typography.button_font }}>
                    Bouton exemple
                  </Button>
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
                  <ColorField 
                    label="Couleur de fond" 
                    value={buttonStyles.primary.background}
                    onChange={(v) => setButtonStyles(prev => ({
                      ...prev,
                      primary: { ...prev.primary, background: v }
                    }))}
                  />
                  <ColorField 
                    label="Couleur du texte" 
                    value={buttonStyles.primary.text}
                    onChange={(v) => setButtonStyles(prev => ({
                      ...prev,
                      primary: { ...prev.primary, text: v }
                    }))}
                  />
                  <div className="space-y-2">
                    <Label>Rayon de bordure</Label>
                    <Select
                      value={buttonStyles.primary.border_radius}
                      onValueChange={(value) => setButtonStyles(prev => ({
                        ...prev,
                        primary: { ...prev.primary, border_radius: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0px">Carré (0px)</SelectItem>
                        <SelectItem value="4px">Léger (4px)</SelectItem>
                        <SelectItem value="8px">Standard (8px)</SelectItem>
                        <SelectItem value="12px">Arrondi (12px)</SelectItem>
                        <SelectItem value="9999px">Pilule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4">
                    <Label className="mb-2 block">Aperçu</Label>
                    <Button
                      style={{
                        backgroundColor: buttonStyles.primary.background,
                        color: buttonStyles.primary.text,
                        borderRadius: buttonStyles.primary.border_radius
                      }}
                    >
                      Bouton Primaire
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Button */}
              <Card className="border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Bouton Secondaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorField 
                    label="Couleur de fond" 
                    value={buttonStyles.secondary.background}
                    onChange={(v) => setButtonStyles(prev => ({
                      ...prev,
                      secondary: { ...prev.secondary, background: v }
                    }))}
                  />
                  <ColorField 
                    label="Couleur du texte" 
                    value={buttonStyles.secondary.text}
                    onChange={(v) => setButtonStyles(prev => ({
                      ...prev,
                      secondary: { ...prev.secondary, text: v }
                    }))}
                  />
                  <div className="space-y-2">
                    <Label>Rayon de bordure</Label>
                    <Select
                      value={buttonStyles.secondary.border_radius}
                      onValueChange={(value) => setButtonStyles(prev => ({
                        ...prev,
                        secondary: { ...prev.secondary, border_radius: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0px">Carré (0px)</SelectItem>
                        <SelectItem value="4px">Léger (4px)</SelectItem>
                        <SelectItem value="8px">Standard (8px)</SelectItem>
                        <SelectItem value="12px">Arrondi (12px)</SelectItem>
                        <SelectItem value="9999px">Pilule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4">
                    <Label className="mb-2 block">Aperçu</Label>
                    <Button
                      variant="outline"
                      style={{
                        backgroundColor: buttonStyles.secondary.background,
                        color: buttonStyles.secondary.text,
                        borderRadius: buttonStyles.secondary.border_radius
                      }}
                    >
                      Bouton Secondaire
                    </Button>
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
