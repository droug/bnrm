import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { VExpoPublicList } from "@/components/vexpo360/VExpoPublicList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ZoomIn, 
  Share2, 
  Download, 
  Info,
  Clock,
  MapPin,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Layers,
  ArrowRight,
  Star,
  Eye,
  X,
  SkipForward,
  RotateCcw,
  Maximize2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import document1 from "@/assets/digital-library/document-1.jpg";
import document2 from "@/assets/digital-library/document-2.jpg";
import document3 from "@/assets/digital-library/document-3.jpg";
import document4 from "@/assets/digital-library/document-4.jpg";
import document5 from "@/assets/digital-library/document-5.jpg";
import document6 from "@/assets/digital-library/document-6.jpg";
import manuscritsAndalous from "@/assets/digital-library/manuscrits-andalous.jpg";
import cartesAnciennes from "@/assets/digital-library/cartes-anciennes.jpg";
import archivesPhotoMaroc from "@/assets/digital-library/archives-photo-maroc.jpg";

// Default images fallback mapping
const defaultImages: Record<string, string> = {
  manuscript: manuscritsAndalous,
  map: cartesAnciennes,
  photo: archivesPhotoMaroc,
  document: document1,
};

export default function VirtualExhibition() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState("medieval");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Tour mode states
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch active exhibition
  const { data: activeExhibition } = useQuery({
    queryKey: ['active-virtual-exhibition'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('virtual_exhibitions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Fetch tour items for active exhibition
  const { data: dbTourItems } = useQuery({
    queryKey: ['exhibition-tour-items-public', activeExhibition?.id],
    queryFn: async () => {
      if (!activeExhibition?.id) return null;
      
      const { data, error } = await supabase
        .from('exhibition_tour_items')
        .select('*')
        .eq('exhibition_id', activeExhibition.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeExhibition?.id
  });

  // Timeline periods
  const timelinePeriods = [
    { id: "ancient", label: "Antiquité", years: "1000 av. J.-C. - 700", color: "from-amber-600 to-orange-600" },
    { id: "islamic", label: "Période islamique", years: "700 - 1100", color: "from-emerald-600 to-teal-600" },
    { id: "medieval", label: "Moyen Âge", years: "1100 - 1500", color: "from-purple-600 to-indigo-600" },
    { id: "modern", label: "Époque moderne", years: "1500 - 1900", color: "from-blue-600 to-cyan-600" },
    { id: "contemporary", label: "Contemporain", years: "1900 - aujourd'hui", color: "from-rose-600 to-pink-600" },
  ];

  // Featured exhibits
  const featuredExhibits = [
    {
      id: 1,
      title: "Les Manuscrits Andalous",
      description: "Collection exceptionnelle de manuscrits arabo-andalous du XIIe au XVe siècle, témoins de l'âge d'or de la civilisation islamique en Espagne.",
      image: manuscritsAndalous,
      itemCount: 45,
      era: "medieval",
      featured: true,
    },
    {
      id: 2,
      title: "Cartographie Historique",
      description: "Cartes anciennes du Maroc et du Maghreb, des premières représentations arabes aux cartes européennes du XIXe siècle.",
      image: cartesAnciennes,
      itemCount: 32,
      era: "modern",
      featured: true,
    },
    {
      id: 3,
      title: "Photographies Coloniales",
      description: "Archives photographiques du Maroc sous le protectorat français, documentant la vie quotidienne et les transformations urbaines.",
      image: archivesPhotoMaroc,
      itemCount: 120,
      era: "contemporary",
      featured: true,
    },
  ];

  // Gallery items by era
  const galleryItems: Record<string, Array<{ id: number; title: string; image: string; type: string; year: string }>> = {
    ancient: [
      { id: 1, title: "Stèle libyco-berbère", image: document1, type: "Artefact", year: "IIIe siècle av. J.-C." },
      { id: 2, title: "Inscription punique", image: document2, type: "Épigraphie", year: "IIe siècle av. J.-C." },
    ],
    islamic: [
      { id: 1, title: "Coran enluminé de Fès", image: document3, type: "Manuscrit", year: "XIe siècle" },
      { id: 2, title: "Traité d'astronomie", image: document4, type: "Manuscrit", year: "Xe siècle" },
    ],
    medieval: [
      { id: 1, title: "Maqamat d'Al-Hariri", image: manuscritsAndalous, type: "Manuscrit enluminé", year: "XIIIe siècle" },
      { id: 2, title: "Traité de médecine d'Ibn Sina", image: document1, type: "Manuscrit", year: "XIIe siècle" },
      { id: 3, title: "Recueil poétique andalou", image: document2, type: "Manuscrit", year: "XIVe siècle" },
      { id: 4, title: "Atlas Al-Idrisi", image: cartesAnciennes, type: "Cartographie", year: "XIIe siècle" },
    ],
    modern: [
      { id: 1, title: "Carte du Royaume du Maroc", image: cartesAnciennes, type: "Cartographie", year: "1750" },
      { id: 2, title: "Registre du Makhzen", image: document5, type: "Archive", year: "1850" },
      { id: 3, title: "Correspondance diplomatique", image: document6, type: "Archive", year: "1880" },
    ],
    contemporary: [
      { id: 1, title: "Fès - Médina", image: archivesPhotoMaroc, type: "Photographie", year: "1920" },
      { id: 2, title: "Casablanca moderne", image: document3, type: "Photographie", year: "1935" },
      { id: 3, title: "Marrakech - Souks", image: document4, type: "Photographie", year: "1945" },
    ],
  };

  // Exhibition themes
  const themes = [
    { id: "calligraphy", title: "Art Calligraphique", icon: BookOpen, count: 28, color: "bg-amber-500" },
    { id: "science", title: "Sciences & Savoir", icon: Star, count: 35, color: "bg-emerald-500" },
    { id: "cartography", title: "Cartographie", icon: MapPin, count: 22, color: "bg-blue-500" },
    { id: "photography", title: "Photographie", icon: ImageIcon, count: 86, color: "bg-rose-500" },
    { id: "archives", title: "Archives Royales", icon: FileText, count: 42, color: "bg-purple-500" },
    { id: "art", title: "Arts Décoratifs", icon: Layers, count: 31, color: "bg-cyan-500" },
  ];

  const currentGallery = galleryItems[selectedEra] || [];

  // Default fallback tour items
  const defaultTourItems = [
    { 
      id: "intro", 
      item_type: "intro",
      title: "Bienvenue dans l'exposition", 
      description: "Découvrez le patrimoine culturel marocain à travers une sélection de documents exceptionnels couvrant plus de 12 siècles d'histoire.",
      image_url: null,
      details: "Cette exposition virtuelle vous invite à un voyage à travers le temps, des premières traces de civilisation jusqu'à l'époque moderne."
    },
    { 
      id: "manuscript-1", 
      item_type: "document",
      title: "Maqamat d'Al-Hariri", 
      description: "Chef-d'œuvre de la littérature arabe médiévale, ce manuscrit enluminé du XIIIe siècle illustre les aventures d'Abu Zayd.",
      image_url: null,
      year: "XIIIe siècle",
      origin: "Al-Andalus",
      technique: "Enluminure sur parchemin",
      dimensions: "32 x 24 cm",
      details: "Ce manuscrit est l'un des plus beaux exemples de l'art de l'enluminure arabo-andalouse."
    },
  ];

  // Use database tour items if available, otherwise use defaults
  const tourItems = (dbTourItems && dbTourItems.length > 0) 
    ? dbTourItems.map(item => ({
        ...item,
        image: item.image_url || defaultImages[item.item_type] || manuscritsAndalous,
        type: item.item_type
      }))
    : defaultTourItems.map(item => ({
        ...item,
        image: manuscritsAndalous,
        type: item.item_type
      }));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredExhibits.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredExhibits.length) % featuredExhibits.length);
  };

  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
    setSelectedItem(tourItems[0]);
  };

  const nextTourStep = () => {
    if (tourStep < tourItems.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      setSelectedItem(tourItems[nextStep]);
    } else {
      // End of tour
      setIsTourActive(false);
      setTourStep(0);
      setSelectedItem(null);
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      setSelectedItem(tourItems[prevStep]);
    }
  };

  const endTour = () => {
    setIsTourActive(false);
    setTourStep(0);
    setSelectedItem(null);
    setIsAutoPlay(false);
  };

  const restartTour = () => {
    setTourStep(0);
    setSelectedItem(tourItems[0]);
  };

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlay && isTourActive) {
      const timer = setTimeout(() => {
        nextTourStep();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isTourActive, tourStep]);

  const openItemDetail = (item: any) => {
    setSelectedItem({
      ...item,
      type: "document",
      details: `Document de type ${item.type} datant de ${item.year}. Cette pièce fait partie de nos collections patrimoniales et témoigne de la richesse culturelle du Maroc.`
    });
  };

  return (
    <DigitalLibraryLayout>
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-bn-blue-primary via-bn-blue-deep to-bn-blue-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-gold-bn-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gold-bn-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-gold-bn-primary bg-white/10 backdrop-blur-sm rounded-xl mb-6">
            <Layers className="h-8 w-8 text-gold-bn-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Expositions Virtuelles 360°
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Découvrez nos expositions immersives avec panoramas 360° et hotspots interactifs
          </p>
        </div>
      </section>

      {/* VExpo 360 Exhibitions from CMS */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <VExpoPublicList />
        </div>
      </section>



      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1IMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <CardContent className="py-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Envie de contribuer ?</h2>
                <p className="text-white/80 mb-6">
                  Vous possédez des documents historiques ? Participez à la préservation du patrimoine marocain 
                  en proposant vos pièces pour numérisation.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                    Proposer un document
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Contacter un conservateur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tour Mode Overlay */}
      {isTourActive && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Tour Controls - Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <Badge className="bg-amber-500 text-white">
                {tourStep + 1} / {tourItems.length}
              </Badge>
              <span className="text-white/80 text-sm hidden md:block">Visite guidée</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-2 hidden md:inline">{isAutoPlay ? "Pause" : "Auto"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={restartTour}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={endTour}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-20 max-h-screen overflow-y-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {selectedItem.type !== "intro" && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4 mr-1" />
                      Agrandir
                    </Button>
                    <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                      <Maximize2 className="h-4 w-4 mr-1" />
                      Plein écran
                    </Button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-white space-y-6">
                {selectedItem.type === "intro" ? (
                  <>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Introduction
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">{selectedItem.title}</h2>
                    <p className="text-xl text-white/80">{selectedItem.description}</p>
                    <p className="text-white/60">{selectedItem.details}</p>
                  </>
                ) : (
                  <>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      {selectedItem.year}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">{selectedItem.title}</h2>
                    <p className="text-lg text-white/80">{selectedItem.description}</p>
                    
                    {/* Document Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {selectedItem.origin && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-white/50 uppercase tracking-wider">Origine</div>
                          <div className="text-white font-medium">{selectedItem.origin}</div>
                        </div>
                      )}
                      {selectedItem.technique && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-white/50 uppercase tracking-wider">Technique</div>
                          <div className="text-white font-medium">{selectedItem.technique}</div>
                        </div>
                      )}
                      {selectedItem.dimensions && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-white/50 uppercase tracking-wider">Dimensions</div>
                          <div className="text-white font-medium">{selectedItem.dimensions}</div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-white/60 text-sm border-l-2 border-amber-500/50 pl-4">
                      {selectedItem.details}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation - Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="container mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                className="border-white/50 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
                onClick={prevTourStep}
                disabled={tourStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Précédent</span>
              </Button>

              {/* Progress dots */}
              <div className="hidden md:flex gap-1">
                {tourItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTourStep(index);
                      setSelectedItem(tourItems[index]);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === tourStep 
                        ? 'w-6 bg-amber-400' 
                        : index < tourStep
                        ? 'bg-amber-400/50'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={nextTourStep}
              >
                {tourStep === tourItems.length - 1 ? (
                  <>
                    Terminer
                    <X className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Auto-play progress bar */}
          {isAutoPlay && (
            <div className="absolute top-16 left-0 right-0 h-1 bg-white/10">
              <div 
                className="h-full bg-amber-500 transition-all duration-100"
                style={{ 
                  width: '100%',
                  animation: 'shrink 8s linear forwards'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={selectedItem !== null && !isTourActive} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          {selectedItem && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <DialogHeader>
                  <Badge className="w-fit mb-2">{selectedItem.type || selectedItem.year}</Badge>
                  <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
                  <DialogDescription>{selectedItem.description || selectedItem.details}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {selectedItem.year && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.year}</span>
                    </div>
                  )}
                  {selectedItem.origin && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.origin}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Consulter
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </DigitalLibraryLayout>
  );
}
