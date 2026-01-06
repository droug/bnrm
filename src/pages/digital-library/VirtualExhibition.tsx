import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2">
                <Layers className="h-4 w-4 mr-2" />
                {activeExhibition?.title || "Exposition Virtuelle 2025"}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Le Maroc
                <span className="block text-amber-400 pb-2">
                  à travers les âges
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-xl">
                Un voyage immersif à travers des siècles d'histoire, de culture et de patrimoine. 
                Explorez plus de 250 documents rares, manuscrits précieux et photographies historiques.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25"
                  onClick={startTour}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Commencer la visite
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm bg-white/10"
                  onClick={() => timelineRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Info className="h-5 w-5 mr-2" />
                  <span>Explorer librement</span>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">250+</div>
                  <div className="text-sm text-white/60">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">5</div>
                  <div className="text-sm text-white/60">Périodes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-400">12</div>
                  <div className="text-sm text-white/60">Siècles</div>
                </div>
              </div>
            </div>

            {/* Right - Featured Carousel */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <img 
                  src={featuredExhibits[currentSlide].image}
                  alt={featuredExhibits[currentSlide].title}
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Slide Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge className="bg-white/20 backdrop-blur-sm mb-3">
                    {featuredExhibits[currentSlide].itemCount} pièces
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{featuredExhibits[currentSlide].title}</h3>
                  <p className="text-white/80 text-sm line-clamp-2">{featuredExhibits[currentSlide].description}</p>
                </div>

                {/* Navigation */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Carousel Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {featuredExhibits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-amber-400' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section ref={timelineRef} className="py-16 bg-gradient-to-b from-slate-900 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Explorez l'Histoire</h2>
            <p className="text-muted-foreground">Naviguez à travers les différentes périodes de l'histoire marocaine</p>
          </div>

          {/* Timeline Bar */}
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2" />
            <div className="flex justify-between relative">
              {timelinePeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedEra(period.id)}
                  className={`group flex flex-col items-center transition-all duration-300 ${
                    selectedEra === period.id ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${period.color} flex items-center justify-center shadow-lg ${
                    selectedEra === period.id ? 'ring-4 ring-white/30' : ''
                  }`}>
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`font-semibold text-sm ${selectedEra === period.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {period.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{period.years}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gallery for selected era */}
          <div className="bg-card rounded-2xl border p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {timelinePeriods.find(p => p.id === selectedEra)?.label}
              </h3>
              <Badge variant="secondary">{currentGallery.length} documents</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentGallery.map((item) => (
                <Card 
                  key={item.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300"
                  onClick={() => openItemDetail(item)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="text-xs opacity-80">{item.year}</div>
                      <div className="font-medium text-sm line-clamp-1">{item.title}</div>
                    </div>
                    <Badge className="absolute top-2 right-2 text-xs">{item.type}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Thematic Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Explorer par Thème</h2>
            <p className="text-muted-foreground">Découvrez nos collections organisées par thématiques</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {themes.map((theme) => (
              <Card 
                key={theme.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-xl ${theme.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <theme.icon className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">{theme.title}</h4>
                  <p className="text-xs text-muted-foreground">{theme.count} pièces</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Collections Phares</h2>
              <p className="text-muted-foreground">Nos ensembles les plus remarquables</p>
            </div>
            <Button variant="outline">
              Voir tout <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredExhibits.map((exhibit) => (
              <Card key={exhibit.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={exhibit.image}
                    alt={exhibit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-foreground">
                    {exhibit.itemCount} pièces
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">{exhibit.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{exhibit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Explorer la collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
