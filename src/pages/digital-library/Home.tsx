// Force cache regeneration: v7 - 2026-02-03
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Image, Music, Calendar, Sparkles, Globe, ExternalLink, Layers, Eye } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { FancyTooltip } from "@/components/ui/fancy-tooltip";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import SEOImage from "@/components/seo/SEOImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { LatestAdditionsSection } from "@/components/digital-library/LatestAdditionsSection";
import { IbnBattoutaStatsSection } from "@/components/digital-library/IbnBattoutaStatsSection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsStyles } from "@/hooks/useCmsStyles";
import { useElectronicBundles } from "@/hooks/useElectronicBundles";
import document1 from "@/assets/digital-library/document-1.jpg";
import document2 from "@/assets/digital-library/document-2.jpg";
import document3 from "@/assets/digital-library/document-3.jpg";
import document4 from "@/assets/digital-library/document-4.jpg";
import document5 from "@/assets/digital-library/document-5.jpg";
import document6 from "@/assets/digital-library/document-6.jpg";
import archivesPhotoMaroc from "@/assets/digital-library/archives-photo-maroc.jpg";
import cartesAnciennes from "@/assets/digital-library/cartes-anciennes.jpg";
import logicielPatrimoine from "@/assets/digital-library/logiciel-patrimoine.jpg";
import manuscritsAndalous from "@/assets/digital-library/manuscrits-andalous.jpg";
import documentsAdministratifs from "@/assets/digital-library/documents-administratifs.jpg";
import libraryBanner from "@/assets/digital-library/library-banner.jpg";
import virtualExhibitionBg from "@/assets/virtual-exhibition-bg.png";
// Logos ressources électroniques
import logoBrill from "@/assets/logos/logo-brill.png";
import logoCairn from "@/assets/logos/logo-cairn.svg";
import logoAlmanhal from "@/assets/logos/logo-almanhal.png";
import logoEni from "@/assets/logos/logo-eni.svg";
import logoRfn from "@/assets/logos/logo-rfn.png";
import logoEuropeana from "@/assets/logos/logo-europeana.svg";
import logoIfla from "@/assets/logos/logo-ifla.svg";

// Mapping des logos par nom de provider (insensible à la casse)
const providerLogoMap: Record<string, string> = {
  'cairn': logoCairn,
  'cairn.info': logoCairn,
  'brill': logoBrill,
  'rfn': logoRfn,
  'europeana': logoEuropeana,
  'ifla': logoIfla,
  'eni-elearning': logoEni,
  'eni': logoEni,
  'almanhal': logoAlmanhal,
  'al-manhal': logoAlmanhal,
};

// Providers nécessitant un fond sombre (logos blancs)
const darkBackgroundProviders = ['almanhal', 'al-manhal', 'eni', 'eni-elearning'];

export default function DigitalLibraryHome() {
  const navigate = useNavigate();
  const {
    session
  } = useAuth();
  const {
    t,
    language
  } = useLanguage();
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [repoCarouselIndex, setRepoCarouselIndex] = useState(0);
  
  // Fetch active electronic bundles
  const { activeBundles } = useElectronicBundles();
  
  // Calculate max carousel index based on bundles count
  const maxCarouselIndex = useMemo(() => {
    if (!activeBundles || activeBundles.length <= 3) return 0;
    return Math.ceil(activeBundles.length / 3) - 1;
  }, [activeBundles]);

  // Fetch CMS styles for BN platform
  const {
    data: cmsStyles
  } = useCmsStyles('bn');

  // Hero image configured from /admin/content-management-BN (CmsHeroManagerBN)
  // Fetches settings for the BN (Bibliothèque Numérique) platform specifically
  const {
    data: heroSettings
  } = useQuery({
    queryKey: ["cms-hero-settings-bn"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("cms_hero_settings").select("*").eq("platform", "bn").single();
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching hero settings:", error);
        return null;
      }
      return data ?? null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always"
  });

  // Type for VExpo Hero settings
  interface VExpoHeroSettings {
    image_url?: string;
    title_fr?: string;
    title_ar?: string;
    subtitle_fr?: string;
    subtitle_ar?: string;
    cta_label_fr?: string;
    cta_label_ar?: string;
    cta_url?: string;
    secondary_cta_label_fr?: string;
    secondary_cta_label_ar?: string;
    secondary_cta_url?: string;
  }

  // Fetch VExpo Hero settings from CMS (for background image, title, subtitle)
  const {
    data: vexpoHeroSettings
  } = useQuery<VExpoHeroSettings | null>({
    queryKey: ["vexpo-hero-settings-bn"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("cms_portal_settings").select("*").eq("setting_key", "vexpo_hero_bn").maybeSingle();
      if (error) {
        console.error("Error fetching vexpo hero settings:", error);
        return null;
      }
      return data?.setting_value as VExpoHeroSettings ?? null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always"
  });

  // Fetch all published virtual exhibitions for carousel
  const {
    data: publishedExhibitions
  } = useQuery({
    queryKey: ["published-vexpo-exhibitions"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("vexpo_exhibitions").select("id, slug, title_fr, title_ar, teaser_fr, teaser_ar, cover_image_url").eq("status", "published").order("created_at", {
        ascending: false
      });
      if (error) {
        console.error("Error fetching exhibitions:", error);
        return [];
      }
      return data || [];
    }
  });

  // Get the first exhibition for background fallback
  const latestExhibition = publishedExhibitions?.[0] || null;
  const heroImageUrl = heroSettings?.hero_image_url?.trim() ? heroSettings.hero_image_url : libraryBanner;
  const autoplayPlugin = useRef(Autoplay({
    delay: 5000,
    stopOnInteraction: true,
    stopOnMouseEnter: true
  }));
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user) {
        const {
          data
        } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", session.user.id).single();
        if (data) {
          setUserProfile({
            firstName: data.first_name,
            lastName: data.last_name,
            email: session.user.email
          });
        }
      }
    };
    loadUserProfile();
  }, [session]);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<any[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [featuredThemes, setFeaturedThemes] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Load featured works from CMS for the hero carousel
  useEffect(() => {
    const loadFeaturedWorks = async () => {
      setLoadingFeatured(true);
      try {
        // Load featured works from digital_library_featured_works
        const {
          data: works,
          error
        } = await supabase.from('digital_library_featured_works').select('*').eq('is_active', true).order('display_order', {
          ascending: true
        });
        if (error) throw error;
        if (works && works.length > 0) {
          // For each work, get document details if linked
          const formattedWorks = await Promise.all(works.map(async (work: any) => {
            let docData = null;
            if (work.document_id) {
              const {
                data
              } = await supabase.from('digital_library_documents').select('id, title, author, cover_image_url, document_type, publication_year, is_manuscript').eq('id', work.document_id).single();
              docData = data;
            }
            return {
              id: work.document_id || work.id,
              workId: work.id,
              title: docData?.title || work.custom_title || 'Sans titre',
              title_ar: work.custom_title_ar,
              author: docData?.author || work.custom_author || t('dl.home.unknownAuthor'),
              type: work.custom_category || (docData?.is_manuscript ? t('dl.docTypes.manuscript') : t('dl.docTypes.document')),
              date: work.custom_date || (docData?.publication_year ? String(docData.publication_year) : ''),
              thumbnail: docData?.cover_image_url || work.custom_image_url,
              description: work.custom_description,
              link: work.custom_link,
              isManuscript: docData?.is_manuscript || false,
              hasDocument: !!work.document_id
            };
          }));
          setFeaturedWorks(formattedWorks);
        }
      } catch (err) {
        console.error('Error loading featured works:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    loadFeaturedWorks();
  }, [t]);
  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoading(true);
      try {
        // Charger depuis digital_library_documents
        const {
          data,
          error
        } = await supabase.from('digital_library_documents').select('id, title, author, publication_year, document_type, cover_image_url, pdf_url, thumbnail_url, created_at, is_manuscript').eq('publication_status', 'published').is('deleted_at', null).order('created_at', {
          ascending: false
        }).limit(6);
        if (data && !error) {
          // Images réelles pour les exemples
          const exampleImages = [document1, document2, document3, document4, document5, document6];

          // Mapping spécifique pour certains titres
          const titleImageMap: {
            [key: string]: string;
          } = {
            "Archives Photographiques du Maroc Colonial": archivesPhotoMaroc,
            "Collection de Cartes Anciennes": cartesAnciennes,
            "Logiciel Patrimoine": logicielPatrimoine,
            "Manuscrits Andalous": manuscritsAndalous,
            "Documents Administratifs Historiques": documentsAdministratifs
          };
          const formattedItems = data.map((item: any, index: number) => {
            // Fonction pour mapper le type de document
            const getDocumentTypeLabel = (docType: string | null, isManuscript: boolean) => {
              if (isManuscript) return t('dl.docTypes.manuscript');
              if (!docType) return t('dl.docTypes.document');
              
              const typeLower = docType.toLowerCase();
              if (typeLower === 'book' || typeLower === 'livre') return t('dl.docTypes.book');
              if (typeLower === 'article') return t('dl.docTypes.article');
              if (typeLower === 'periodique' || typeLower === 'periodical' || typeLower === 'revue') return t('dl.docTypes.periodical');
              if (typeLower === 'manuscrit' || typeLower === 'manuscript') return t('dl.docTypes.manuscript');
              if (typeLower === 'carte' || typeLower === 'map') return t('dl.docTypes.map');
              if (typeLower === 'audio') return t('dl.docTypes.audio');
              if (typeLower === 'video') return t('dl.docTypes.video');
              if (typeLower === 'image' || typeLower === 'photo') return t('dl.docTypes.image');
              
              // Retourner le type original capitalisé si non reconnu
              return docType.charAt(0).toUpperCase() + docType.slice(1);
            };

            // Générer la miniature depuis la première page du PDF si pas de cover_image_url
            const generatePdfThumbnail = (pdfUrl: string | null) => {
              if (!pdfUrl) return null;
              // Pour l'instant, utiliser une image par défaut - la vraie miniature sera générée côté client
              return null;
            };

            // Extraire l'ID YouTube depuis l'URL (peut être dans pdf_url pour les vidéos)
            const extractYouTubeId = (url: string | null) => {
              if (!url) return null;
              const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]+)/);
              return match ? match[1] : null;
            };

            const isVideo = item.document_type?.toLowerCase() === 'video';
            // Pour les vidéos, essayer d'extraire l'ID YouTube depuis pdf_url
            const youtubeId = isVideo ? extractYouTubeId(item.pdf_url) : null;
            
            // Utiliser cover_image_url, puis thumbnail_url, puis miniature YouTube pour vidéos, puis PDF, puis fallback
            const thumbnail = item.cover_image_url || 
                              item.thumbnail_url ||
                              (isVideo && youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null) ||
                              generatePdfThumbnail(item.pdf_url) ||
                              titleImageMap[item.title] || 
                              exampleImages[index % exampleImages.length];
            
            return {
              id: item.id,
              title: item.title,
              author: item.author || t('dl.home.unknownAuthor'),
              type: getDocumentTypeLabel(item.document_type, item.is_manuscript),
              date: item.created_at,
              isAvailable: true,
              cote: item.document_type?.toUpperCase() || 'DOC',
              thumbnail: thumbnail,
              pdfUrl: item.pdf_url, // URL du PDF pour générer la miniature dynamiquement
              isManuscript: item.is_manuscript,
              isVideo: isVideo,
              videoUrl: isVideo ? item.pdf_url : null
            };
          });
          console.log('Loaded digital library documents:', formattedItems);
          setNewItems(formattedItems);
        } else if (error) {
          console.error('Error loading documents:', error);
        }
      } catch (err) {
        console.error('Exception loading documents:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecentDocuments();
  }, [t]);
  const handleReservationClick = (item: any) => {
    setSelectedDocument(item);
    setShowReservationDialog(true);
  };
  const handleConsultDocument = (item: any) => {
    const isManuscript = item.type === 'Manuscrit' || item.file_type === 'manuscript';
    if (isManuscript) {
      navigate(`/manuscript-reader/${item.id}`);
    } else {
      navigate(`/digital-library/book-reader/${item.id}`);
    }
  };
  useEffect(() => {
    const loadHomeContent = async () => {
      // Charger les collections depuis le CMS (tag: home-collection)
      const {
        data: collections
      } = await supabase.from('content').select('*').eq('content_type', 'page').eq('status', 'published').eq('is_featured', true).contains('tags', ['home-collection']).order('created_at', {
        ascending: false
      }).limit(4);
      if (collections && collections.length > 0) {
        setFeaturedCollections(collections.map(col => ({
          id: col.id,
          title: col.title,
          icon: BookOpen,
          count: col.meta_description || "0",
          href: col.slug || '#',
          image: col.featured_image_url || manuscritsAndalous,
          description: col.excerpt
        })));
      } else {
        // Valeurs par défaut
        setFeaturedCollections([{
          id: "books",
          titleKey: "dl.collections.books",
          icon: BookOpen,
          count: "45,670",
          href: "/digital-library/collections/books",
          image: manuscritsAndalous
        }, {
          id: "periodicals",
          titleKey: "dl.collections.periodicals",
          icon: FileText,
          count: "8,320",
          href: "/digital-library/collections/periodicals",
          image: manuscritsAndalous
        }, {
          id: "photos",
          titleKey: "dl.collectionsPage.photos",
          icon: Image,
          count: "15,890",
          href: "/digital-library/collections/photos",
          image: manuscritsAndalous
        }, {
          id: "audiovisual",
          titleKey: "dl.collections.audiovisual",
          icon: Music,
          count: "2,890",
          href: "/digital-library/collections/audiovisual",
          image: manuscritsAndalous
        }]);
      }

      // Charger les thèmes (tag: home-theme)
      const {
        data: themes
      } = await supabase.from('content').select('*').eq('content_type', 'page').eq('status', 'published').eq('is_featured', true).contains('tags', ['home-theme']).order('created_at', {
        ascending: false
      }).limit(6);
      if (themes && themes.length > 0) {
        setFeaturedThemes(themes.map(theme => ({
          id: theme.id,
          title: theme.title,
          emoji: theme.meta_description || '📚',
          href: theme.slug || '#'
        })));
      } else {
        // Valeurs par défaut
        setFeaturedThemes([{
          id: "history",
          titleKey: "dl.themes.history",
          emoji: "🏛️",
          href: "/digital-library/themes/history"
        }, {
          id: "arts",
          titleKey: "dl.themes.arts",
          emoji: "🎨",
          href: "/digital-library/themes/arts"
        }, {
          id: "literature",
          titleKey: "dl.themes.literature",
          emoji: "✍️",
          href: "/digital-library/themes/literature"
        }]);
      }

      // Charger les actualités
      const {
        data: news
      } = await supabase.from('content').select('*').eq('content_type', 'news').eq('status', 'published').eq('is_featured', true).order('published_at', {
        ascending: false
      }).limit(2);
      if (news) {
        setNewsArticles(news);
      }

      // Charger les statistiques (tag: home-stats)
      const {
        data: stats
      } = await supabase.from('content').select('*').eq('content_type', 'page').eq('status', 'published').contains('tags', ['home-stats']).order('created_at', {
        ascending: false
      }).limit(3);
      if (stats && stats.length > 0) {
        setStatsData(stats.map(stat => ({
          label: stat.title,
          value: stat.meta_description || '0'
        })));
      } else {
        // Valeurs par défaut
        setStatsData([{
          labelKey: "dl.home.digitizedManuscripts",
          value: "12,450"
        }, {
          labelKey: "dl.home.historicalDocuments",
          value: "5,230"
        }, {
          labelKey: "dl.home.imagesAndMaps",
          value: "8,760"
        }]);
      }
    };
    loadHomeContent();
  }, []);
  return <DigitalLibraryLayout>
      <SEOHead title="Bibliothèque Numérique" description="Accédez à plus de 100,000 documents numérisés du patrimoine marocain : livres, manuscrits, revues, photographies et archives audiovisuelles." keywords={["bibliothèque numérique", "documents numérisés", "patrimoine marocain", "livres électroniques", "archives numériques", "collections BNRM"]} />
      
      {/* Hero Section with Background Image & Integrated Search */}
      <section className="relative min-h-[90vh] overflow-hidden" style={{
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
        <div className="container mx-auto px-4 relative z-10 flex flex-col min-h-[90vh]">
          {/* Hero Title & Subtitle */}
          <div className="text-center pt-16 pb-6">
            <h1 className="font-inter text-[36px] font-bold leading-[160%] tracking-normal text-center uppercase text-white mb-3 animate-fade-in drop-shadow-lg">
              BIBLIOTHÈQUE NUMÉRIQUE MAROCAINE
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto animate-fade-in drop-shadow-md">
              Plongez dans nos collections riches et diversifiées de documents historiques
            </p>
          </div>

          {/* Integrated Search Bar */}
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="relative flex items-center bg-white rounded-full shadow-xl overflow-hidden">
              <div className="flex items-center pl-5 text-gray-400">
                <Icon name="mdi:magnify" className="w-5 h-5" />
              </div>
              <input type="text" placeholder="Rechercher parmi 50,000+ documents..." className="flex-1 px-4 py-3.5 text-base bg-transparent outline-none text-gray-800 placeholder:text-gray-400" onKeyDown={e => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                if (value.trim()) {
                  navigate(`/digital-library/search?q=${encodeURIComponent(value.trim())}`);
                }
              }
            }} />
              <button className="m-1.5 px-6 py-2 border border-gold-bn-primary bg-gold-bn-primary text-white hover:bg-transparent hover:text-gold-bn-primary rounded-full text-sm font-medium transition-colors" onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (input?.value.trim()) {
                navigate(`/digital-library/search?q=${encodeURIComponent(input.value.trim())}`);
              }
            }}>
                Rechercher
              </button>
            </div>
          </div>

          {/* Œuvres et vedettes - Featured Works Carousel */}
          <div className="flex-1 flex items-center justify-center py-6">
            {!loadingFeatured && featuredWorks.length > 0 && <div className="relative w-full max-w-5xl mx-auto px-4">
                {/* Left Arrow - Large gold triangle outside container */}
                <button className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-20 text-gold-bn-primary hover:text-gold-bn-primary-dark transition-colors p-2" onClick={() => {
              const prevBtn = document.querySelector('[data-carousel-prev]') as HTMLButtonElement;
              prevBtn?.click();
            }}>
                  <svg className="w-5 h-10 md:w-6 md:h-12" viewBox="0 0 24 48" fill="currentColor">
                    <polygon points="20,4 4,24 20,44" />
                  </svg>
                </button>
                
                {/* Right Arrow - Large gold triangle outside container */}
                <button className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-20 text-gold-bn-primary hover:text-gold-bn-primary-dark transition-colors p-2" onClick={() => {
              const nextBtn = document.querySelector('[data-carousel-next]') as HTMLButtonElement;
              nextBtn?.click();
            }}>
                  <svg className="w-5 h-10 md:w-6 md:h-12" viewBox="0 0 24 48" fill="currentColor">
                    <polygon points="4,4 20,24 4,44" />
                  </svg>
                </button>

                {/* Carousel container with semi-transparent background */}
                <div className="rounded-lg" style={{ background: '#6C666636' }}>
                  <Carousel opts={{
                align: "center",
                loop: true
              }} plugins={[autoplayPlugin.current]} className="w-full bg-transparent">
                    <CarouselContent className="bg-transparent">
                      {featuredWorks.map(item => <CarouselItem key={item.workId || item.id} className="animate-fade-in bg-transparent">
                          <div className="relative flex h-[320px] md:h-[380px] bg-transparent">
                            {/* Left: Text Content - constrained to 50% to not overlap with image */}
                            <div className="w-1/2 text-white flex flex-col justify-between p-6 md:p-8 pt-4 md:pt-6 pr-4">
                              {/* Top Left: Badge/Tagline with little padding on top */}
                              <div className="pt-2">
                                <Badge className="bg-gold-bn-primary text-white hover:bg-gold-bn-primary-dark text-xs px-4 py-1.5 rounded font-medium w-fit">
                                  {item.type}
                                </Badge>
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wide leading-tight mt-4">
                                  {language === 'ar' && item.title_ar ? item.title_ar : item.title}
                                </h2>
                                <p className="text-white/85 text-sm md:text-base leading-relaxed line-clamp-4 text-justify max-w-lg mt-3">
                                  {item.description || `${item.author}${item.date ? ` - ${item.date}` : ''}`}
                                </p>
                              </div>
                              {/* Bottom Right: Button */}
                              <div className="flex justify-end">
                                <button 
                                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#B68F1C]/20 hover:bg-[#B68F1C]/30 text-white text-sm font-medium transition-all group" 
                                  onClick={() => {
                                    if (item.hasDocument) {
                                      handleConsultDocument(item);
                                    } else if (item.link) {
                                      window.open(item.link, '_blank');
                                    } else {
                                      navigate(`/digital-library/document/${item.id}`);
                                    }
                                  }}
                                >
                                  En savoir plus
                                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Right: Image - half width, full height, extends to edge, transparent bg */}
                            {item.thumbnail && (
                              <div className="w-1/2 h-full absolute right-0 top-0 bottom-0 bg-transparent">
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover object-center bg-transparent" />
                              </div>
                            )}
                          </div>
                        </CarouselItem>)}
                    </CarouselContent>
                    
                    {/* Hidden native buttons for programmatic control */}
                    <CarouselPrevious data-carousel-prev className="hidden" />
                    <CarouselNext data-carousel-next className="hidden" />
                  </Carousel>
                </div>
              </div>}
            
            {/* Fallback to recent documents if no featured works */}
            {!loadingFeatured && featuredWorks.length === 0 && !loading && newItems.length > 0 && <div className="relative w-full max-w-7xl mx-auto px-4">
                {/* Left Arrow - Large gold triangle */}
                <button className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-20 text-gold-bn-primary hover:text-gold-bn-primary-dark transition-colors p-2" onClick={() => {
              const prevBtn = document.querySelector('[data-carousel-prev-fallback]') as HTMLButtonElement;
              prevBtn?.click();
            }}>
                  <svg className="w-6 h-12 md:w-8 md:h-16" viewBox="0 0 24 48" fill="currentColor">
                    <polygon points="20,4 4,24 20,44" />
                  </svg>
                </button>
                
                {/* Right Arrow - Large gold triangle */}
                <button className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-20 text-gold-bn-primary hover:text-gold-bn-primary-dark transition-colors p-2" onClick={() => {
              const nextBtn = document.querySelector('[data-carousel-next-fallback]') as HTMLButtonElement;
              nextBtn?.click();
            }}>
                  <svg className="w-6 h-12 md:w-8 md:h-16" viewBox="0 0 24 48" fill="currentColor">
                    <polygon points="4,4 20,24 4,44" />
                  </svg>
                </button>

                {/* Blurred container backdrop */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 mx-8 md:mx-12">
                  <Carousel opts={{
                align: "center",
                loop: true
              }} plugins={[autoplayPlugin.current]} className="w-full">
                    <CarouselContent>
                      {newItems.map(item => <CarouselItem key={item.id} className="animate-fade-in">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                            {/* Left: Text Content */}
                            <div className="text-white space-y-3 order-2 lg:order-1">
                              <Badge className="bg-gold-bn-primary text-white hover:bg-gold-bn-primary-dark text-xs px-3 py-1 rounded">
                                {item.type}
                              </Badge>
                              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wider leading-tight">
                                {item.title}
                              </h2>
                              <p className="text-white/80 text-sm leading-relaxed text-justify">
                                {item.author} - {t('dl.home.addedOn')} {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}
                              </p>
                              <div className="pt-3">
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded text-gold-bn-primary text-sm font-medium transition-all group" onClick={() => handleConsultDocument(item)}>
                                  En savoir plus
                                  <Icon name="mdi:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Right: Image with glow effect */}
                            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
                              <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent blur-2xl rounded-full" />
                                <div className="absolute -inset-8 bg-gradient-to-r from-cyan-300/10 to-transparent blur-3xl" />
                                <div className="relative w-56 h-64 md:w-72 md:h-80 lg:w-80 lg:h-[22rem] rounded-lg overflow-hidden shadow-2xl border border-white/10 transform hover:scale-[1.02] transition-transform duration-500">
                                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>)}
                    </CarouselContent>
                    
                    <CarouselPrevious data-carousel-prev-fallback className="hidden" />
                    <CarouselNext data-carousel-next-fallback className="hidden" />
                  </Carousel>
                </div>
              </div>}
            
            {(loadingFeatured || loading) && <div className="text-center py-12">
                <p className="text-white/90 drop-shadow-md">{t('dl.home.loadingDocuments')}</p>
              </div>}
            {!loadingFeatured && featuredWorks.length === 0 && !loading && newItems.length === 0 && <div className="text-center py-12">
                <p className="text-white/90 drop-shadow-md">{t('dl.home.noDocumentsAvailable')}</p>
              </div>}
          </div>
        </div>
      </section>

      {/* Latest Additions - Reference Design */}
      <LatestAdditionsSection items={newItems} loading={loading} onConsultDocument={handleConsultDocument} />

      {/* Ibn Battouta en chiffres - Stats Section */}
      <IbnBattoutaStatsSection />

      {/* Latest News */}
      {newsArticles.length > 0 && <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[48px] font-normal text-bn-blue-primary font-gilda flex items-center gap-2">
                <Calendar className="h-8 w-8 text-gold-bn-primary" />
                {t('dl.home.latestNews')}
              </h2>
              <Link to="/digital-library/news">
                <Button variant="outline" className="border-gold-bn-primary text-bn-blue-primary hover:bg-gold-bn-surface">{t('dl.home.allNews')}</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsArticles.map(article => <Card key={article.id}>
                  {article.featured_image_url && <div className="aspect-video bg-muted relative overflow-hidden">
                      <img src={article.featured_image_url} alt={article.title} className="object-cover w-full h-full" />
                    </div>}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy') : ''}</span>
                    </div>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/digital-library/news/${article.id}`}>
                      <Button variant="outline" className="w-full border-gold-bn-primary text-bn-blue-primary hover:bg-gold-bn-surface">{t('dl.home.readMore')}</Button>
                    </Link>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>}


      {/* Section Exposition Virtuelle - Carrousel */}
      {publishedExhibitions && publishedExhibitions.length > 0 && <section className="py-16 relative overflow-hidden">
          {/* Background Image - uses CMS settings (vexpo_hero_bn) if available */}
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: vexpoHeroSettings?.image_url ? `url(${vexpoHeroSettings.image_url})` : latestExhibition?.cover_image_url ? `url(${latestExhibition.cover_image_url})` : `url(${virtualExhibitionBg})`
          }} />
          <div className="absolute inset-0 bg-gradient-to-br from-bn-blue-primary/80 via-bn-blue-primary/70 to-bn-blue-deep/80" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-bn-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              {/* Icon badge */}
              <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary bg-white/10 backdrop-blur-sm rounded-lg mb-6">
                <Layers className="h-6 w-6 text-gold-bn-primary" />
              </div>
              
              <h2 className="text-[48px] font-normal text-white font-gilda">
                {language === 'ar' ? vexpoHeroSettings?.title_ar || 'معارض افتراضية' : vexpoHeroSettings?.title_fr || 'Expositions Virtuelles'}
              </h2>
              <p className="font-body text-regular text-white/80 max-w-2xl mx-auto mt-4">
                {language === 'ar' ? vexpoHeroSettings?.subtitle_ar || 'استكشف تاريخ وتراث المغرب من خلال معارضنا التفاعلية' : vexpoHeroSettings?.subtitle_fr || 'Explorez l\'histoire et le patrimoine du Maroc à travers nos expositions interactives'}
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Carousel
                opts={{
                  align: "center",
                  loop: publishedExhibitions.length > 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {publishedExhibitions.map((exhibition) => (
                    <CarouselItem key={exhibition.id} className="pl-4 md:basis-full">
                      <Link to={`/digital-library/exposition-virtuelle/${exhibition.slug}`}>
                        <Card className="group relative overflow-hidden border-2 border-white/20 hover:border-gold-bn-primary/50 transition-all duration-500 bg-white/10 backdrop-blur-md cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-gold-bn-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                              {/* Image/Visual */}
                              <div className="relative flex-shrink-0">
                                <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-gold-bn-primary to-gold-bn-deep p-1 shadow-2xl shadow-gold-bn-primary/30 group-hover:shadow-gold-bn-primary/50 transition-shadow duration-500">
                                  {exhibition.cover_image_url ? (
                                    <img 
                                      src={exhibition.cover_image_url} 
                                      alt={language === 'ar' ? exhibition.title_ar || exhibition.title_fr : exhibition.title_fr} 
                                      className="w-full h-full rounded-xl object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-xl bg-bn-blue-primary/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-gold-bn-primary/20 rounded-full blur-xl animate-pulse" />
                                        <Layers className="h-24 w-24 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark text-white text-xs font-bold rounded-full shadow-lg">
                                  360°
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white group-hover:text-gold-bn-primary transition-colors">
                                  {language === 'ar' ? exhibition.title_ar || exhibition.title_fr : exhibition.title_fr}
                                </h3>
                                <p className="text-white/80 mb-6 leading-relaxed line-clamp-3">
                                  {language === 'ar' ? exhibition.teaser_ar || exhibition.teaser_fr : exhibition.teaser_fr}
                                </p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                  <Button className="bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark hover:from-gold-bn-primary-dark hover:to-gold-bn-deep text-white shadow-lg shadow-gold-bn-primary/25 group-hover:shadow-gold-bn-primary/40 transition-all duration-300">
                                    <Eye className="h-4 w-4 mr-2" />
                                    {language === 'ar' ? 'زيارة المعرض' : 'Visiter l\'exposition'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {publishedExhibitions.length > 1 && (
                  <>
                    <CarouselPrevious className="left-0 md:-left-12 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white" />
                    <CarouselNext className="right-0 md:-right-12 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white" />
                  </>
                )}
              </Carousel>
              
              {/* Indicators */}
              {publishedExhibitions.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {publishedExhibitions.map((_, index) => (
                    <div 
                      key={index}
                      className="w-2 h-2 rounded-full bg-white/30"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>}

      {/* Section Ressources électroniques - Dynamique depuis la BDD */}
      {activeBundles && activeBundles.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-muted to-background relative overflow-hidden">
          {/* Décorations de fond (très léger) */}
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
            <div className="w-full h-full bg-gradient-to-tr from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
            <div className="w-full h-full bg-gradient-to-tl from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="text-center mb-14">
              {/* Icône dorée (grille + plus) */}
              <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary rounded-lg mb-6">
                <Icon name="mdi:select-multiple" className="w-6 h-6 text-gold-bn-primary" />
              </div>

              <h2 className="text-[48px] font-normal text-foreground font-gilda">
                Ressources électroniques
              </h2>
              <p className="font-body text-regular text-foreground max-w-2xl mx-auto mt-4">
                Ces ressources permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale
              </p>
            </div>

            {/* Carrousel dynamique */}
            <div className="relative px-16">
              {/* Flèche gauche */}
              <button 
                onClick={() => setRepoCarouselIndex(prev => Math.max(0, prev - 1))} 
                disabled={repoCarouselIndex === 0} 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed" 
                aria-label="Précédent"
              >
                <Icon name="mdi:chevron-left" className="h-6 w-6" />
              </button>

              {/* Slides */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${repoCarouselIndex * 33.333}%)` }}
                >
                  {activeBundles.map((bundle) => {
                    // Chercher le logo local en priorité basé sur le nom du provider
                    const providerKey = bundle.provider?.toLowerCase().trim();
                    const localLogo = providerKey ? providerLogoMap[providerKey] : null;
                    const logoSrc = localLogo || bundle.provider_logo_url;
                    
                    // Logos avec texte blanc nécessitant un fond sombre
                    const needsDarkBackground = providerKey && darkBackgroundProviders.includes(providerKey);
                    
                    // URL de destination : priorité à api_base_url, sinon website_url
                    const resourceUrl = bundle.api_base_url || bundle.website_url || '#';
                    
                    // Description pour le tooltip
                    const description = language === 'ar' && bundle.description_ar 
                      ? bundle.description_ar 
                      : bundle.description || '';

                    return (
                      <div key={bundle.id} className="flex-shrink-0 w-full md:w-1/3 px-4">
                        <FancyTooltip 
                          content={bundle.provider || bundle.name} 
                          description={description}
                          icon="mdi:book-open-variant" 
                          side="top" 
                          variant="gold"
                        >
                          <Card className="bg-card border-0 rounded-xl shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)] hover:shadow-[0_12px_40px_hsl(0_0%_0%_/0.18)] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                            <CardContent className="p-8 flex flex-col items-center justify-center">
                              <div className={`flex items-center justify-center h-[80px] ${needsDarkBackground ? 'bg-bn-blue-primary rounded-lg px-4' : ''}`}>
                                {logoSrc ? (
                                  <img 
                                    src={logoSrc} 
                                    alt={bundle.provider || bundle.name} 
                                    className="h-[50px] max-w-[200px] object-contain" 
                                  />
                                ) : (
                                  <div className="font-heading text-[42px] font-semibold text-bn-blue-primary tracking-wide">
                                    {bundle.provider || bundle.name}
                                  </div>
                                )}
                              </div>
                              <a 
                                href={resourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium hover:bg-gold-bn-primary/20 transition-colors"
                              >
                                Explorer <Icon name="mdi:chevron-right" className="h-4 w-4" />
                              </a>
                            </CardContent>
                          </Card>
                        </FancyTooltip>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flèche droite */}
              <button 
                onClick={() => setRepoCarouselIndex(prev => Math.min(maxCarouselIndex, prev + 1))} 
                disabled={repoCarouselIndex >= maxCarouselIndex} 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed" 
                aria-label="Suivant"
              >
                <Icon name="mdi:chevron-right" className="h-6 w-6" />
              </button>
            </div>

            {/* Pagination dynamique */}
            {maxCarouselIndex > 0 && (
              <div className="flex justify-center gap-3 mt-14">
                {Array.from({ length: maxCarouselIndex + 1 }, (_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setRepoCarouselIndex(index)} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${repoCarouselIndex === index ? 'bg-gold-bn-primary' : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'}`} 
                    aria-label={`Aller à la page ${index + 1}`} 
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reservation Dialog */}
      {selectedDocument && userProfile && <ReservationRequestDialog isOpen={showReservationDialog} onClose={() => {
      setShowReservationDialog(false);
      setSelectedDocument(null);
    }} documentId={selectedDocument.id} documentTitle={selectedDocument.title} documentCote={selectedDocument.cote} userProfile={userProfile} />}
    </DigitalLibraryLayout>;
}