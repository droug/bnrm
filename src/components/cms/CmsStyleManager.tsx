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
import { Palette, Save, Loader2, Type, Paintbrush, RotateCcw, Home, Newspaper, Globe, Link2, Video, Footprints, Grid3X3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CmsSectionIconsManager from "./CmsSectionIconsManager";

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
  heading_size: string;
  heading_weight: string;
  heading_style: string;
  body_font: string;
  body_size: string;
  body_weight: string;
  body_style: string;
  button_font: string;
  button_size: string;
  button_weight: string;
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
  heading_size: "2rem",
  heading_weight: "700",
  heading_style: "normal",
  body_font: "Inter",
  body_size: "1rem",
  body_weight: "400",
  body_style: "normal",
  button_font: "Inter",
  button_size: "0.875rem",
  button_weight: "500"
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

interface CmsStyleManagerProps {
  platform?: 'portal' | 'bn';
}

export default function CmsStyleManager({ platform = 'portal' }: CmsStyleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sectionStyles, setSectionStyles] = useState<SectionStyles>(defaultStyles);
  const [typography, setTypography] = useState<Typography>(defaultTypography);
  const [buttonStyles, setButtonStyles] = useState<ButtonStyles>(defaultButtonStyles);

  // Use platform-specific keys to separate BN and Portal styles
  const keyPrefix = platform === 'bn' ? 'bn_' : '';
  const sectionStylesKey = `${keyPrefix}section_styles`;
  const typographyKey = `${keyPrefix}typography`;
  const buttonStylesKey = `${keyPrefix}button_styles`;

  const { isLoading } = useQuery({
    queryKey: ['cms-portal-settings', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .in('setting_key', [sectionStylesKey, typographyKey, buttonStylesKey]);
      
      if (error) throw error;
      
      data?.forEach((setting: any) => {
        if (setting.setting_key === sectionStylesKey && setting.setting_value) {
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
        } else if (setting.setting_key === typographyKey && setting.setting_value) {
          setTypography({ ...defaultTypography, ...setting.setting_value });
        } else if (setting.setting_key === buttonStylesKey && setting.setting_value) {
          setButtonStyles({ ...defaultButtonStyles, ...setting.setting_value });
        }
      });
      
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { setting_key: sectionStylesKey, setting_value: sectionStyles as any, category: 'styling' },
        { setting_key: typographyKey, setting_value: typography as any, category: 'styling' },
        { setting_key: buttonStylesKey, setting_value: buttonStyles as any, category: 'styling' }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('cms_portal_settings')
          .upsert(update, { onConflict: 'setting_key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-portal-settings', platform] });
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
            {platform === 'bn' ? 'Styles et Design de la BN' : 'Styles et Design du Portail'}
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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="icons" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Icônes
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
            {/* Titres */}
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Police des titres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <Label className="text-sm font-medium">Police</Label>
                  <Label className="text-sm font-medium">Taille</Label>
                  <Label className="text-sm font-medium">Style</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={typography.heading_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, heading_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={typography.heading_size}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, heading_size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="1.5rem">Petit (24px)</SelectItem>
                      <SelectItem value="1.75rem">Medium (28px)</SelectItem>
                      <SelectItem value="2rem">Standard (32px)</SelectItem>
                      <SelectItem value="2.5rem">Grand (40px)</SelectItem>
                      <SelectItem value="3rem">Très grand (48px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={`${typography.heading_weight}-${typography.heading_style}`}
                    onValueChange={(value) => {
                      const [weight, style] = value.split('-');
                      setTypography(prev => ({ ...prev, heading_weight: weight, heading_style: style }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="400-normal">Normal</SelectItem>
                      <SelectItem value="500-normal">Medium</SelectItem>
                      <SelectItem value="600-normal">Semi-gras</SelectItem>
                      <SelectItem value="700-normal">Gras</SelectItem>
                      <SelectItem value="800-normal">Extra-gras</SelectItem>
                      <SelectItem value="400-italic">Italique</SelectItem>
                      <SelectItem value="500-italic">Medium Italique</SelectItem>
                      <SelectItem value="600-italic">Semi-gras Italique</SelectItem>
                      <SelectItem value="700-italic">Gras Italique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Corps de texte */}
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Police du corps de texte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <Label className="text-sm font-medium">Police</Label>
                  <Label className="text-sm font-medium">Taille</Label>
                  <Label className="text-sm font-medium">Style</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={typography.body_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, body_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={typography.body_size}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, body_size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="0.875rem">Petit (14px)</SelectItem>
                      <SelectItem value="1rem">Standard (16px)</SelectItem>
                      <SelectItem value="1.125rem">Medium (18px)</SelectItem>
                      <SelectItem value="1.25rem">Grand (20px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={`${typography.body_weight}-${typography.body_style}`}
                    onValueChange={(value) => {
                      const [weight, style] = value.split('-');
                      setTypography(prev => ({ ...prev, body_weight: weight, body_style: style }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="300-normal">Léger</SelectItem>
                      <SelectItem value="400-normal">Normal</SelectItem>
                      <SelectItem value="500-normal">Medium</SelectItem>
                      <SelectItem value="600-normal">Semi-gras</SelectItem>
                      <SelectItem value="300-italic">Léger Italique</SelectItem>
                      <SelectItem value="400-italic">Italique</SelectItem>
                      <SelectItem value="500-italic">Medium Italique</SelectItem>
                      <SelectItem value="600-italic">Semi-gras Italique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Boutons */}
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Police des boutons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <Label className="text-sm font-medium">Police</Label>
                  <Label className="text-sm font-medium">Taille</Label>
                  <Label className="text-sm font-medium">Style</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={typography.button_font}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, button_font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {availableFonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={typography.button_size}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, button_size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="0.75rem">Petit (12px)</SelectItem>
                      <SelectItem value="0.875rem">Standard (14px)</SelectItem>
                      <SelectItem value="1rem">Medium (16px)</SelectItem>
                      <SelectItem value="1.125rem">Grand (18px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={typography.button_weight}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, button_weight: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi-gras</SelectItem>
                      <SelectItem value="700">Gras</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <h2 
                    style={{ 
                      fontFamily: typography.heading_font,
                      fontSize: typography.heading_size,
                      fontWeight: typography.heading_weight,
                      fontStyle: typography.heading_style
                    }} 
                    className="mb-2"
                  >
                    Titre de section
                  </h2>
                  <p 
                    style={{ 
                      fontFamily: typography.body_font,
                      fontSize: typography.body_size,
                      fontWeight: typography.body_weight,
                      fontStyle: typography.body_style
                    }} 
                    className="mb-4"
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <Button 
                    style={{ 
                      fontFamily: typography.button_font,
                      fontSize: typography.button_size,
                      fontWeight: typography.button_weight
                    }}
                  >
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

          {/* Icons Tab */}
          <TabsContent value="icons" className="mt-4">
            <CmsSectionIconsManager platform={platform} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
