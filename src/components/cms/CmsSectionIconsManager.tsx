import { useState } from "react";
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

// Complete MDI icon library organized by category
const mdiIconLibrary: Record<string, string[]> = {
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
};

// Sections that can have icons configured for BN platform
const sectionIconConfigs = [
  { id: "ressources_electroniques", label: "Ressources électroniques", defaultIcon: "mdi:select-multiple" },
  { id: "ibn_battouta_stats", label: "Ibn Battouta en chiffres", defaultIcon: "mdi:format-list-numbered" },
  { id: "derniers_ajouts", label: "Derniers ajouts", defaultIcon: "mdi:book-open-page-variant-outline" },
  { id: "mediatheque", label: "Médiathèque", defaultIcon: "mdi:video-box" },
  { id: "hero", label: "Section Hero", defaultIcon: "mdi:home-outline" },
  { id: "actualites", label: "Actualités", defaultIcon: "mdi:newspaper-variant-outline" },
  { id: "evenements", label: "Événements", defaultIcon: "mdi:calendar-month-outline" },
  { id: "collections", label: "Collections", defaultIcon: "mdi:library" },
  { id: "vexpo", label: "Expositions virtuelles", defaultIcon: "mdi:panorama-outline" },
  { id: "recherche", label: "Recherche", defaultIcon: "mdi:magnify" },
];

interface SectionIcons {
  [sectionId: string]: {
    icon: string;
    color?: string;
  };
}

interface CmsSectionIconsManagerProps {
  platform: 'portal' | 'bn';
}

export default function CmsSectionIconsManager({ platform }: CmsSectionIconsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionIcons, setSectionIcons] = useState<SectionIcons>({});

  const keyPrefix = platform === 'bn' ? 'bn_' : '';
  const sectionIconsKey = `${keyPrefix}section_icons`;

  // Load saved icons
  const { isLoading } = useQuery({
    queryKey: ['cms-section-icons', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .eq('setting_key', sectionIconsKey)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.setting_value) {
        setSectionIcons(data.setting_value as SectionIcons);
      } else {
        // Initialize with defaults
        const defaults: SectionIcons = {};
        sectionIconConfigs.forEach(config => {
          defaults[config.id] = {
            icon: config.defaultIcon,
            color: platform === 'bn' ? '#C9A227' : '#3b82f6'
          };
        });
        setSectionIcons(defaults);
      }
      
      return data;
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cms_portal_settings')
        .upsert({
          setting_key: sectionIconsKey,
          setting_value: sectionIcons as any,
          category: 'styling'
        }, { onConflict: 'setting_key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-section-icons', platform] });
      toast({ title: "Icônes sauvegardées avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const selectIconForSection = (sectionId: string, iconName: string) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        icon: iconName
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

  // Filter icons by search
  const filteredLibrary = Object.entries(mdiIconLibrary).reduce((acc, [category, icons]) => {
    const filtered = icons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as typeof mdiIconLibrary);

  // Count total icons
  const totalIcons = Object.values(mdiIconLibrary).flat().length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icon name="mdi:loading" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Icon name="mdi:loading" className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Icon name="mdi:content-save-outline" className="h-4 w-4 mr-2" />
          )}
          Sauvegarder les icônes
        </Button>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Icon name="mdi:layers-outline" className="h-4 w-4" />
            Icônes des sections
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Icon name="mdi:view-grid-outline" className="h-4 w-4" />
            Bibliothèque MDI
          </TabsTrigger>
        </TabsList>

        {/* Section Icons Configuration */}
        <TabsContent value="sections" className="mt-4">
          <div className="grid gap-4">
            {sectionIconConfigs.map(config => {
              const currentIcon = sectionIcons[config.id] || { icon: config.defaultIcon, color: '#C9A227' };
              return (
                <Card key={config.id} className={selectedSection === config.id ? "ring-2 ring-primary" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Current Icon Preview */}
                        <div 
                          className="w-12 h-12 rounded-lg border flex items-center justify-center"
                          style={{ color: currentIcon.color }}
                        >
                          <Icon name={currentIcon.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">
                            <code className="bg-muted px-1 rounded text-xs">{currentIcon.icon}</code>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Color Picker */}
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

                    {/* Icon Selector (expanded when selected) */}
                    {selectedSection === config.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="mb-4">
                          <div className="relative">
                            <Icon name="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher une icône MDI..."
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
                                  <Badge variant="outline" className="ml-2">{icons.length}</Badge>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-6 gap-2 py-2">
                                    {icons.map((iconName) => (
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
          </div>
        </TabsContent>

        {/* Full Icon Library */}
        <TabsContent value="library" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="mdi:material-design" className="h-5 w-5" />
                Bibliothèque Material Design Icons
              </CardTitle>
              <CardDescription>
                {totalIcons} icônes MDI disponibles dans le système
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
                          <Badge variant="outline">{icons.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-6 md:grid-cols-8 gap-3 py-4">
                          {icons.map((iconName) => (
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
                                {iconName.replace("mdi:", "")}
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
