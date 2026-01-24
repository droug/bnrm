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
import { 
  Save, Loader2, Search, Check, Grid3X3, 
  // Section icons
  Home, Newspaper, Globe, Link2, Video, Footprints, BookOpen, FileText, Image, Music, 
  Calendar, Sparkles, Layers, Eye, Users, Settings, Database, BarChart3, 
  LibraryBig, GraduationCap, Building2, Map, Landmark, ScrollText, Archive,
  FolderOpen, BookMarked, FileStack, Table2, Grid2X2, LayoutGrid, Boxes,
  Package, Palette, Type, PenTool, Brush, Camera, Film, Mic, Headphones,
  Bell, Mail, MessageSquare, Phone, Share2, Send, Download, Upload, 
  ExternalLink, Link, Bookmark, Star, Heart, Award, Trophy, Medal, 
  Flag, Target, Zap, Lightbulb, Compass, Navigation, MapPin, Clock,
  Timer, CalendarDays, CalendarRange, History, Undo, Redo, RefreshCw,
  Filter, SortAsc, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Strikethrough, Quote, Code, Terminal,
  Monitor, Smartphone, Tablet, Laptop, Printer, Wifi, Bluetooth,
  Cloud, Server, HardDrive, Cpu, MemoryStick, CircuitBoard,
  Lock, Unlock, Key, Shield, ShieldCheck, UserCheck, UserPlus,
  LogIn, LogOut, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, Maximize,
  Minimize, Plus, Minus, X, Check as CheckIcon, Info, AlertTriangle, AlertCircle,
  HelpCircle, CircleDot, Circle, Square, Triangle, Hexagon, Pentagon, Octagon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Icon library with categories
const iconLibrary = {
  "Navigation": [
    { name: "Home", icon: Home },
    { name: "ChevronRight", icon: ChevronRight },
    { name: "ChevronLeft", icon: ChevronLeft },
    { name: "ChevronUp", icon: ChevronUp },
    { name: "ChevronDown", icon: ChevronDown },
    { name: "ArrowRight", icon: ArrowRight },
    { name: "ArrowLeft", icon: ArrowLeft },
    { name: "ArrowUp", icon: ArrowUp },
    { name: "ArrowDown", icon: ArrowDown },
    { name: "ArrowUpRight", icon: ArrowUpRight },
    { name: "ExternalLink", icon: ExternalLink },
    { name: "Link", icon: Link },
    { name: "Link2", icon: Link2 },
    { name: "Compass", icon: Compass },
    { name: "Navigation", icon: Navigation },
    { name: "MapPin", icon: MapPin },
    { name: "Map", icon: Map },
  ],
  "Contenu": [
    { name: "FileText", icon: FileText },
    { name: "FileStack", icon: FileStack },
    { name: "BookOpen", icon: BookOpen },
    { name: "BookMarked", icon: BookMarked },
    { name: "Newspaper", icon: Newspaper },
    { name: "ScrollText", icon: ScrollText },
    { name: "Archive", icon: Archive },
    { name: "FolderOpen", icon: FolderOpen },
    { name: "Database", icon: Database },
    { name: "LibraryBig", icon: LibraryBig },
  ],
  "Bibliothèque": [
    { name: "GraduationCap", icon: GraduationCap },
    { name: "Building2", icon: Building2 },
    { name: "Landmark", icon: Landmark },
    { name: "Globe", icon: Globe },
    { name: "Users", icon: Users },
    { name: "Calendar", icon: Calendar },
    { name: "CalendarDays", icon: CalendarDays },
    { name: "CalendarRange", icon: CalendarRange },
    { name: "Clock", icon: Clock },
    { name: "History", icon: History },
  ],
  "Médias": [
    { name: "Image", icon: Image },
    { name: "Camera", icon: Camera },
    { name: "Film", icon: Film },
    { name: "Video", icon: Video },
    { name: "Music", icon: Music },
    { name: "Mic", icon: Mic },
    { name: "Headphones", icon: Headphones },
  ],
  "Grilles & Layouts": [
    { name: "Grid3X3", icon: Grid3X3 },
    { name: "Grid2X2", icon: Grid2X2 },
    { name: "LayoutGrid", icon: LayoutGrid },
    { name: "Table2", icon: Table2 },
    { name: "Layers", icon: Layers },
    { name: "Boxes", icon: Boxes },
    { name: "Package", icon: Package },
    { name: "List", icon: List },
    { name: "ListOrdered", icon: ListOrdered },
  ],
  "Design": [
    { name: "Palette", icon: Palette },
    { name: "Type", icon: Type },
    { name: "PenTool", icon: PenTool },
    { name: "Brush", icon: Brush },
    { name: "Sparkles", icon: Sparkles },
    { name: "Eye", icon: Eye },
  ],
  "Actions": [
    { name: "Plus", icon: Plus },
    { name: "Minus", icon: Minus },
    { name: "X", icon: X },
    { name: "Check", icon: CheckIcon },
    { name: "Save", icon: Save },
    { name: "Download", icon: Download },
    { name: "Upload", icon: Upload },
    { name: "Share2", icon: Share2 },
    { name: "Send", icon: Send },
    { name: "RefreshCw", icon: RefreshCw },
    { name: "Maximize", icon: Maximize },
    { name: "Minimize", icon: Minimize },
  ],
  "Indicateurs": [
    { name: "Star", icon: Star },
    { name: "Heart", icon: Heart },
    { name: "Award", icon: Award },
    { name: "Trophy", icon: Trophy },
    { name: "Medal", icon: Medal },
    { name: "Flag", icon: Flag },
    { name: "Target", icon: Target },
    { name: "Zap", icon: Zap },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Bookmark", icon: Bookmark },
    { name: "Bell", icon: Bell },
  ],
  "Communication": [
    { name: "Mail", icon: Mail },
    { name: "MessageSquare", icon: MessageSquare },
    { name: "Phone", icon: Phone },
    { name: "Info", icon: Info },
    { name: "HelpCircle", icon: HelpCircle },
    { name: "AlertTriangle", icon: AlertTriangle },
    { name: "AlertCircle", icon: AlertCircle },
  ],
  "Sécurité": [
    { name: "Lock", icon: Lock },
    { name: "Unlock", icon: Unlock },
    { name: "Key", icon: Key },
    { name: "Shield", icon: Shield },
    { name: "ShieldCheck", icon: ShieldCheck },
    { name: "UserCheck", icon: UserCheck },
    { name: "UserPlus", icon: UserPlus },
    { name: "LogIn", icon: LogIn },
    { name: "LogOut", icon: LogOut },
  ],
  "Formes": [
    { name: "Circle", icon: Circle },
    { name: "CircleDot", icon: CircleDot },
    { name: "Square", icon: Square },
    { name: "Triangle", icon: Triangle },
    { name: "Hexagon", icon: Hexagon },
    { name: "Pentagon", icon: Pentagon },
    { name: "Octagon", icon: Octagon },
  ],
  "Analyse": [
    { name: "BarChart3", icon: BarChart3 },
    { name: "Settings", icon: Settings },
    { name: "Filter", icon: Filter },
    { name: "SortAsc", icon: SortAsc },
  ],
};

// Custom SVG icons (MDI style)
const customSvgIcons = {
  "table-box-multiple-outline": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 6V18H13V20H1V4H21V13H19V6H3Z"/>
      <path d="M3 11H19V13H3V11Z"/>
      <path d="M8 6V18H10V6H8Z"/>
      <path d="M14 6V13H16V6H14Z"/>
      <path d="M23 15V17H21V19H23V21H21V19H19V21H17V19H19V17H17V15H19V17H21V15H23ZM21 17H19V19H21V17Z"/>
    </svg>
  ),
  "book-open-page-variant-outline": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19 1L14 6V17L19 12.5V1M21 5V18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5M10 18.41C8.75 18.09 7.5 18 6.5 18C5.44 18 4.18 18.19 3 18.5V7.13C3.91 6.73 5.14 6.5 6.5 6.5C7.86 6.5 9.09 6.73 10 7.13V18.41Z"/>
    </svg>
  ),
  "chart-box-outline": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M9 17H7V10H9V17M13 17H11V7H13V17M17 17H15V13H17V17M19 19H5V5H19V19.1M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"/>
    </svg>
  ),
  "video-box": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 16L14 12.8V16H6V8H14V11.2L18 8M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4Z"/>
    </svg>
  ),
};

// Sections that can have icons configured
const sectionIconConfigs = [
  { id: "ressources_electroniques", label: "Ressources électroniques", defaultIcon: "table-box-multiple-outline", isCustom: true },
  { id: "ibn_battouta_stats", label: "Ibn Battouta en chiffres", defaultIcon: "chart-box-outline", isCustom: true },
  { id: "derniers_ajouts", label: "Derniers ajouts", defaultIcon: "book-open-page-variant-outline", isCustom: true },
  { id: "mediatheque", label: "Médiathèque", defaultIcon: "video-box", isCustom: true },
  { id: "hero", label: "Section Hero", defaultIcon: "Home", isCustom: false },
  { id: "actualites", label: "Actualités", defaultIcon: "Newspaper", isCustom: false },
  { id: "evenements", label: "Événements", defaultIcon: "Calendar", isCustom: false },
  { id: "collections", label: "Collections", defaultIcon: "LibraryBig", isCustom: false },
];

interface SectionIcons {
  [sectionId: string]: {
    icon: string;
    isCustom: boolean;
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
            isCustom: config.isCustom,
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

  const selectIconForSection = (sectionId: string, iconName: string, isCustom: boolean) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        icon: iconName,
        isCustom
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
  const filteredLibrary = Object.entries(iconLibrary).reduce((acc, [category, icons]) => {
    const filtered = icons.filter(icon => 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as typeof iconLibrary);

  const filteredCustomIcons = Object.entries(customSvgIcons).filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = (iconName: string, isCustom: boolean, className?: string) => {
    if (isCustom && customSvgIcons[iconName as keyof typeof customSvgIcons]) {
      return customSvgIcons[iconName as keyof typeof customSvgIcons];
    }
    
    // Find in library
    for (const icons of Object.values(iconLibrary)) {
      const found = icons.find(i => i.name === iconName);
      if (found) {
        const IconComponent = found.icon;
        return <IconComponent className={className || "w-5 h-5"} />;
      }
    }
    
    return <Grid3X3 className={className || "w-5 h-5"} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder les icônes
        </Button>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Icônes des sections
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Bibliothèque d'icônes
          </TabsTrigger>
        </TabsList>

        {/* Section Icons Configuration */}
        <TabsContent value="sections" className="mt-4">
          <div className="grid gap-4">
            {sectionIconConfigs.map(config => {
              const currentIcon = sectionIcons[config.id] || { icon: config.defaultIcon, isCustom: config.isCustom, color: '#C9A227' };
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
                          {renderIcon(currentIcon.icon, currentIcon.isCustom)}
                        </div>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">
                            Icône: <code className="bg-muted px-1 rounded">{currentIcon.icon}</code>
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher une icône..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <ScrollArea className="h-[300px]">
                          {/* Custom SVG Icons */}
                          {filteredCustomIcons.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Badge variant="secondary">Personnalisées (MDI)</Badge>
                              </p>
                              <div className="grid grid-cols-6 gap-2">
                                {filteredCustomIcons.map(([name, svg]) => (
                                  <button
                                    key={name}
                                    onClick={() => selectIconForSection(config.id, name, true)}
                                    className={`p-3 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center gap-1 ${
                                      currentIcon.icon === name && currentIcon.isCustom ? "bg-primary/10 border-primary" : ""
                                    }`}
                                    title={name}
                                  >
                                    <div style={{ color: currentIcon.color }}>{svg}</div>
                                    {currentIcon.icon === name && currentIcon.isCustom && (
                                      <Check className="h-3 w-3 text-primary" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lucide Icons by Category */}
                          <Accordion type="multiple" className="space-y-2">
                            {Object.entries(filteredLibrary).map(([category, icons]) => (
                              <AccordionItem key={category} value={category} className="border rounded-lg px-3">
                                <AccordionTrigger className="hover:no-underline py-2">
                                  <span className="text-sm font-medium">{category}</span>
                                  <Badge variant="outline" className="ml-2">{icons.length}</Badge>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-6 gap-2 py-2">
                                    {icons.map(({ name, icon: Icon }) => (
                                      <button
                                        key={name}
                                        onClick={() => selectIconForSection(config.id, name, false)}
                                        className={`p-3 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center gap-1 ${
                                          currentIcon.icon === name && !currentIcon.isCustom ? "bg-primary/10 border-primary" : ""
                                        }`}
                                        title={name}
                                      >
                                        <Icon className="h-5 w-5" style={{ color: currentIcon.color }} />
                                        {currentIcon.icon === name && !currentIcon.isCustom && (
                                          <Check className="h-3 w-3 text-primary" />
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
              <CardTitle className="text-lg">Bibliothèque d'icônes système</CardTitle>
              <CardDescription>
                Parcourez toutes les icônes disponibles dans le système
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                {/* Custom SVG Icons */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    Icônes personnalisées (MDI)
                    <Badge variant="secondary">{Object.keys(customSvgIcons).length}</Badge>
                  </p>
                  <div className="grid grid-cols-8 gap-3">
                    {Object.entries(customSvgIcons).map(([name, svg]) => (
                      <div
                        key={name}
                        className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 cursor-pointer"
                        title={name}
                      >
                        <div className="text-primary">{svg}</div>
                        <span className="text-xs text-muted-foreground truncate w-full text-center">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lucide Icons */}
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
                        <div className="grid grid-cols-8 gap-3 py-4">
                          {icons.map(({ name, icon: Icon }) => (
                            <div
                              key={name}
                              className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 cursor-pointer"
                              title={name}
                            >
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="text-xs text-muted-foreground truncate w-full text-center">{name}</span>
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
