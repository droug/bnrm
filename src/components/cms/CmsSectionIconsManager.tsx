import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Check, Library, Layers, Settings2, FileJson } from "lucide-react";

// Available icon libraries
const iconLibraries = {
  mdi: {
    id: "mdi",
    name: "Material Design Icons",
    prefix: "mdi:",
    description: "7000+ icônes Material Design",
    categories: {
      "Bibliothèque & Documents": [
        "mdi:library",
        "mdi:book-open-page-variant-outline",
        "mdi:book-multiple",
        "mdi:book-outline",
        "mdi:bookshelf",
        "mdi:file-document-outline",
        "mdi:file-multiple-outline",
        "mdi:folder-outline",
        "mdi:folder-open-outline",
        "mdi:archive-outline",
        "mdi:script-text-outline",
        "mdi:scroll-text-outline",
        "mdi:text-box-outline",
        "mdi:newspaper-variant-outline",
        "mdi:note-text-outline",
      ],
      "Grilles & Tableaux": [
        "mdi:select-multiple",
        "mdi:table-large-plus",
        "mdi:view-grid-outline",
        "mdi:grid",
        "mdi:table-large",
        "mdi:view-module-outline",
        "mdi:view-dashboard-outline",
        "mdi:view-list-outline",
        "mdi:view-grid-plus-outline",
        "mdi:table-of-contents",
        "mdi:format-list-bulleted",
        "mdi:format-list-numbered",
        "mdi:apps",
      ],
      "Statistiques & Graphiques": [
        "mdi:chart-box-outline",
        "mdi:chart-bar",
        "mdi:chart-line",
        "mdi:chart-pie",
        "mdi:chart-areaspline",
        "mdi:finance",
        "mdi:poll",
        "mdi:trending-up",
        "mdi:trending-down",
        "mdi:percent-outline",
        "mdi:counter",
      ],
      "Médias": [
        "mdi:video-box",
        "mdi:video-outline",
        "mdi:image-outline",
        "mdi:image-multiple-outline",
        "mdi:camera-outline",
        "mdi:movie-outline",
        "mdi:music-note-outline",
        "mdi:microphone-outline",
        "mdi:headphones",
        "mdi:play-circle-outline",
        "mdi:youtube",
        "mdi:multimedia",
      ],
      "Navigation": [
        "mdi:home-outline",
        "mdi:arrow-left",
        "mdi:arrow-right",
        "mdi:arrow-up",
        "mdi:arrow-down",
        "mdi:chevron-left",
        "mdi:chevron-right",
        "mdi:chevron-up",
        "mdi:chevron-down",
        "mdi:menu",
        "mdi:dots-horizontal",
        "mdi:dots-vertical",
        "mdi:open-in-new",
        "mdi:link-variant",
        "mdi:compass-outline",
        "mdi:map-marker-outline",
      ],
      "Actions": [
        "mdi:plus",
        "mdi:minus",
        "mdi:close",
        "mdi:check",
        "mdi:pencil-outline",
        "mdi:delete-outline",
        "mdi:content-save-outline",
        "mdi:download",
        "mdi:upload",
        "mdi:refresh",
        "mdi:magnify",
        "mdi:filter-outline",
        "mdi:sort",
        "mdi:share-variant-outline",
        "mdi:content-copy",
        "mdi:eye-outline",
        "mdi:eye-off-outline",
      ],
      "Utilisateurs & Sécurité": [
        "mdi:account-outline",
        "mdi:account-group-outline",
        "mdi:account-circle-outline",
        "mdi:account-plus-outline",
        "mdi:account-check-outline",
        "mdi:login",
        "mdi:logout",
        "mdi:lock-outline",
        "mdi:lock-open-outline",
        "mdi:shield-outline",
        "mdi:shield-check-outline",
        "mdi:key-outline",
      ],
      "Communication": [
        "mdi:email-outline",
        "mdi:message-outline",
        "mdi:phone-outline",
        "mdi:bell-outline",
        "mdi:comment-outline",
        "mdi:chat-outline",
        "mdi:send-outline",
        "mdi:bullhorn-outline",
      ],
      "Événements & Calendrier": [
        "mdi:calendar-outline",
        "mdi:calendar-month-outline",
        "mdi:calendar-today-outline",
        "mdi:calendar-range-outline",
        "mdi:calendar-clock-outline",
        "mdi:clock-outline",
        "mdi:timer-outline",
        "mdi:history",
      ],
      "Design & Style": [
        "mdi:palette-outline",
        "mdi:format-text",
        "mdi:format-bold",
        "mdi:format-italic",
        "mdi:brush-outline",
        "mdi:pencil-ruler",
        "mdi:shape-outline",
        "mdi:circle-outline",
        "mdi:square-outline",
        "mdi:star-outline",
        "mdi:heart-outline",
        "mdi:bookmark-outline",
      ],
      "État & Feedback": [
        "mdi:information-outline",
        "mdi:alert-outline",
        "mdi:alert-circle-outline",
        "mdi:check-circle-outline",
        "mdi:help-circle-outline",
        "mdi:lightbulb-outline",
        "mdi:flash-outline",
        "mdi:flag-outline",
        "mdi:trophy-outline",
        "mdi:medal-outline",
      ],
      "Technologies": [
        "mdi:earth",
        "mdi:web",
        "mdi:database-outline",
        "mdi:server-outline",
        "mdi:cloud-outline",
        "mdi:cog-outline",
        "mdi:wrench-outline",
        "mdi:code-tags",
        "mdi:cellphone",
        "mdi:laptop",
        "mdi:printer-outline",
        "mdi:qrcode",
      ],
      "Institutions": [
        "mdi:domain",
        "mdi:office-building-outline",
        "mdi:school-outline",
        "mdi:bank-outline",
        "mdi:castle",
        "mdi:mosque",
        "mdi:town-hall",
        "mdi:account-tie-outline",
      ],
    }
  },
  lucide: {
    id: "lucide",
    name: "Lucide Icons",
    prefix: "lucide:",
    description: "1000+ icônes minimalistes",
    categories: {
      "Documents": [
        "lucide:file",
        "lucide:file-text",
        "lucide:folder",
        "lucide:book",
        "lucide:book-open",
        "lucide:library",
        "lucide:newspaper",
        "lucide:scroll",
      ],
      "Interface": [
        "lucide:home",
        "lucide:menu",
        "lucide:search",
        "lucide:settings",
        "lucide:plus",
        "lucide:minus",
        "lucide:x",
        "lucide:check",
      ],
      "Médias": [
        "lucide:image",
        "lucide:video",
        "lucide:camera",
        "lucide:music",
        "lucide:play",
        "lucide:pause",
      ],
      "Utilisateurs": [
        "lucide:user",
        "lucide:users",
        "lucide:user-plus",
        "lucide:shield",
        "lucide:lock",
        "lucide:key",
      ],
    }
  },
  fontawesome: {
    id: "fontawesome",
    name: "Font Awesome",
    prefix: "fa:",
    description: "2000+ icônes populaires",
    categories: {
      "Solides": [
        "fa:house",
        "fa:book",
        "fa:file",
        "fa:folder",
        "fa:user",
        "fa:gear",
        "fa:magnifying-glass",
        "fa:bell",
      ],
      "Marques": [
        "fa:facebook",
        "fa:twitter",
        "fa:instagram",
        "fa:youtube",
        "fa:linkedin",
        "fa:github",
      ],
    }
  }
};

// Target types where icons can be applied
const targetTypes = [
  { id: "section", label: "Sections de page", icon: "mdi:layers-outline" },
  { id: "page", label: "Pages CMS", icon: "mdi:file-document-outline" },
  { id: "form", label: "Formulaires", icon: "mdi:form-select" },
  { id: "menu", label: "Menus de navigation", icon: "mdi:menu" },
  { id: "button", label: "Boutons d'action", icon: "mdi:gesture-tap-button" },
];

// Predefined section configs for BN platform
const sectionIconConfigs = [
  { id: "ressources_electroniques", label: "Ressources électroniques", defaultIcon: "mdi:select-multiple", type: "section" },
  { id: "ibn_battouta_stats", label: "Ibn Battouta en chiffres", defaultIcon: "mdi:format-list-numbered", type: "section" },
  { id: "derniers_ajouts", label: "Derniers ajouts", defaultIcon: "mdi:book-open-page-variant-outline", type: "section" },
  { id: "mediatheque", label: "Médiathèque", defaultIcon: "mdi:video-box", type: "section" },
  { id: "hero", label: "Section Hero", defaultIcon: "mdi:home-outline", type: "section" },
  { id: "actualites", label: "Actualités", defaultIcon: "mdi:newspaper-variant-outline", type: "section" },
  { id: "evenements", label: "Événements", defaultIcon: "mdi:calendar-month-outline", type: "section" },
  { id: "collections", label: "Collections", defaultIcon: "mdi:library", type: "section" },
  { id: "vexpo", label: "Expositions virtuelles", defaultIcon: "mdi:panorama-outline", type: "section" },
  { id: "recherche", label: "Recherche", defaultIcon: "mdi:magnify", type: "section" },
];

interface IconConfig {
  icon: string;
  color?: string;
  library?: string;
}

interface SectionIcons {
  [targetId: string]: IconConfig;
}

interface IconLibraryConfig {
  activeLibrary: string;
  customIcons: Array<{ name: string; icon: string; category: string }>;
}

interface CmsSectionIconsManagerProps {
  platform: 'portal' | 'bn';
}

export default function CmsSectionIconsManager({ platform }: CmsSectionIconsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTargetType, setSelectedTargetType] = useState("section");
  const [activeLibrary, setActiveLibrary] = useState<string>("mdi");
  const [sectionIcons, setSectionIcons] = useState<SectionIcons>({});
  const [customIcons, setCustomIcons] = useState<Array<{ name: string; icon: string; category: string }>>([]);

  const keyPrefix = platform === 'bn' ? 'bn_' : '';
  const sectionIconsKey = `${keyPrefix}section_icons`;
  const libraryConfigKey = `${keyPrefix}icon_library_config`;

  // Load saved icons and library config
  const { isLoading } = useQuery({
    queryKey: ['cms-section-icons', platform],
    queryFn: async () => {
      const [iconsRes, configRes] = await Promise.all([
        supabase
          .from('cms_portal_settings')
          .select('*')
          .eq('setting_key', sectionIconsKey)
          .maybeSingle(),
        supabase
          .from('cms_portal_settings')
          .select('*')
          .eq('setting_key', libraryConfigKey)
          .maybeSingle()
      ]);
      
      if (iconsRes.error) throw iconsRes.error;
      if (configRes.error) throw configRes.error;
      
      // Load section icons
      if (iconsRes.data?.setting_value) {
        setSectionIcons(iconsRes.data.setting_value as unknown as SectionIcons);
      } else {
        const defaults: SectionIcons = {};
        sectionIconConfigs.forEach(config => {
          defaults[config.id] = {
            icon: config.defaultIcon,
            color: platform === 'bn' ? '#C9A227' : '#3b82f6',
            library: 'mdi'
          };
        });
        setSectionIcons(defaults);
      }
      
      // Load library config
      if (configRes.data?.setting_value) {
        const config = configRes.data.setting_value as unknown as IconLibraryConfig;
        setActiveLibrary(config.activeLibrary || 'mdi');
        setCustomIcons(config.customIcons || []);
      }
      
      return { icons: iconsRes.data, config: configRes.data };
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const libraryConfig: IconLibraryConfig = {
        activeLibrary,
        customIcons
      };
      
      await Promise.all([
        supabase
          .from('cms_portal_settings')
          .upsert({
            setting_key: sectionIconsKey,
            setting_value: sectionIcons as any,
            category: 'styling'
          }, { onConflict: 'setting_key' }),
        supabase
          .from('cms_portal_settings')
          .upsert({
            setting_key: libraryConfigKey,
            setting_value: libraryConfig as any,
            category: 'styling'
          }, { onConflict: 'setting_key' })
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-section-icons', platform] });
      toast({ title: "Configuration sauvegardée avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Export configuration
  const handleExport = () => {
    const exportData = {
      version: "1.0",
      platform,
      activeLibrary,
      sectionIcons,
      customIcons,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-config-${platform}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Configuration exportée" });
  };

  // Import configuration
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.activeLibrary) setActiveLibrary(data.activeLibrary);
        if (data.sectionIcons) setSectionIcons(data.sectionIcons);
        if (data.customIcons) setCustomIcons(data.customIcons);
        
        toast({ title: "Configuration importée avec succès" });
      } catch (error) {
        toast({ title: "Erreur d'import", description: "Fichier JSON invalide", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectIconForSection = (sectionId: string, iconName: string) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        icon: iconName,
        library: activeLibrary
      }
    }));
  };

  const updateSectionIconColor = (sectionId: string, color: string) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        color
      }
    }));
  };

  // Get current library icons
  const currentLibrary = iconLibraries[activeLibrary as keyof typeof iconLibraries];
  const libraryCategories = currentLibrary?.categories || {};

  // Filter icons by search
  const filteredLibrary = Object.entries(libraryCategories).reduce((acc, [category, icons]) => {
    const filtered = (icons as string[]).filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Add custom icons to filtered results
  if (customIcons.length > 0) {
    const customFiltered = customIcons.filter(ic => 
      ic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ic.icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (customFiltered.length > 0) {
      filteredLibrary["Icônes personnalisées"] = customFiltered.map(ic => ic.icon);
    }
  }

  // Count total icons
  const totalIcons = Object.values(libraryCategories).flat().length + customIcons.length;

  // Filter sections by target type
  const filteredSections = sectionIconConfigs.filter(s => s.type === selectedTargetType);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icon name="mdi:loading" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <span className="font-medium">Gestionnaire d'icônes</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Icon name="mdi:loading" className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Icon name="mdi:content-save-outline" className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Bibliothèques
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Appliquer
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Icon name="mdi:view-grid-outline" className="h-4 w-4" />
            Parcourir
          </TabsTrigger>
        </TabsList>

        {/* Library Selection Tab */}
        <TabsContent value="library" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choisir une bibliothèque d'icônes</CardTitle>
              <CardDescription>
                Sélectionnez la bibliothèque d'icônes à utiliser pour le {platform === 'bn' ? 'portail BN' : 'portail BNRM'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.values(iconLibraries).map((lib) => (
                  <Card 
                    key={lib.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeLibrary === lib.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setActiveLibrary(lib.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Icon name={`${lib.prefix}star-outline`} className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">{lib.name}</p>
                            <p className="text-sm text-muted-foreground">{lib.description}</p>
                          </div>
                        </div>
                        {activeLibrary === lib.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {Object.keys(lib.categories).slice(0, 3).map(cat => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {Object.keys(lib.categories).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(lib.categories).length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Icons Import */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Icônes personnalisées
              </CardTitle>
              <CardDescription>
                Importez vos propres icônes ou configurez des icônes additionnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30 text-center">
                  <Icon name="mdi:cloud-upload-outline" className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez un fichier JSON de configuration ou
                  </p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Parcourir les fichiers
                  </Button>
                </div>
                
                {customIcons.length > 0 && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Icônes importées ({customIcons.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {customIcons.map((ic, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                          <Icon name={ic.icon} className="h-3 w-3" />
                          {ic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply Icons Tab */}
        <TabsContent value="apply" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Appliquer les icônes
              </CardTitle>
              <CardDescription>
                Choisissez où appliquer les icônes dans votre interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Target Type Selector */}
              <div className="mb-6">
                <Label className="mb-3 block">Type d'élément</Label>
                <div className="flex flex-wrap gap-2">
                  {targetTypes.map(type => (
                    <Button
                      key={type.id}
                      variant={selectedTargetType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTargetType(type.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon name={type.icon} className="h-4 w-4" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Section List */}
              <div className="grid gap-4">
                {filteredSections.map(config => {
                  const currentIcon = sectionIcons[config.id] || { 
                    icon: config.defaultIcon, 
                    color: platform === 'bn' ? '#C9A227' : '#3b82f6',
                    library: 'mdi'
                  };
                  return (
                    <Card key={config.id} className={selectedSection === config.id ? "ring-2 ring-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-lg border flex items-center justify-center"
                              style={{ color: currentIcon.color }}
                            >
                              <Icon name={currentIcon.icon} className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{currentIcon.icon}</code>
                                {currentIcon.library && (
                                  <Badge variant="secondary" className="text-xs">
                                    {iconLibraries[currentIcon.library as keyof typeof iconLibraries]?.name || currentIcon.library}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Couleur</Label>
                              <Input
                                type="color"
                                value={currentIcon.color || '#C9A227'}
                                onChange={(e) => updateSectionIconColor(config.id, e.target.value)}
                                className="w-10 h-10 p-1 cursor-pointer"
                              />
                            </div>
                            <Button 
                              variant={selectedSection === config.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSection(selectedSection === config.id ? null : config.id)}
                            >
                              {selectedSection === config.id ? "Fermer" : "Changer"}
                            </Button>
                          </div>
                        </div>

                        {/* Icon Selector */}
                        {selectedSection === config.id && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="mb-4">
                              <div className="relative">
                                <Icon name="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder={`Rechercher dans ${currentLibrary?.name || 'la bibliothèque'}...`}
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            <ScrollArea className="h-[300px]">
                              <Accordion type="multiple" defaultValue={Object.keys(filteredLibrary).slice(0, 2)} className="space-y-2">
                                {Object.entries(filteredLibrary).map(([category, icons]) => (
                                  <AccordionItem key={category} value={category} className="border rounded-lg px-3">
                                    <AccordionTrigger className="hover:no-underline py-2">
                                      <span className="text-sm font-medium">{category}</span>
                                      <Badge variant="outline" className="ml-2">{(icons as string[]).length}</Badge>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-6 gap-2 py-2">
                                        {(icons as string[]).map((iconName) => (
                                          <button
                                            key={iconName}
                                            onClick={() => selectIconForSection(config.id, iconName)}
                                            className={`p-3 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center gap-1 ${
                                              currentIcon.icon === iconName ? "bg-primary/10 border-primary" : ""
                                            }`}
                                            title={iconName}
                                          >
                                            <Icon name={iconName} className="h-5 w-5" style={{ color: currentIcon.color }} />
                                            {currentIcon.icon === iconName && (
                                              <Icon name="mdi:check" className="h-3 w-3 text-primary" />
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredSections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="mdi:information-outline" className="h-8 w-8 mx-auto mb-2" />
                    <p>Aucun élément configuré pour ce type.</p>
                    <p className="text-sm">Les icônes de sections sont actuellement disponibles.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Library Tab */}
        <TabsContent value="browse" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="mdi:material-design" className="h-5 w-5" />
                {currentLibrary?.name || 'Bibliothèque'}
              </CardTitle>
              <CardDescription>
                {totalIcons} icônes disponibles
              </CardDescription>
              <div className="relative mt-4">
                <Icon name="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une icône..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Accordion type="multiple" defaultValue={Object.keys(filteredLibrary)} className="space-y-2">
                  {Object.entries(filteredLibrary).map(([category, icons]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category}</span>
                          <Badge variant="outline">{(icons as string[]).length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-6 md:grid-cols-8 gap-3 py-4">
                          {(icons as string[]).map((iconName) => (
                            <div
                              key={iconName}
                              className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 cursor-pointer group"
                              title={iconName}
                              onClick={() => {
                                navigator.clipboard.writeText(iconName);
                                toast({ title: "Copié!", description: iconName });
                              }}
                            >
                              <Icon name={iconName} className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                {iconName.replace(/^(mdi:|lucide:|fa:)/, "")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
