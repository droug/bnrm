import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { FloatingButtons } from "@/components/FloatingButtons";
import WelcomePopup from "@/components/WelcomePopup";
import { useTranslation } from "@/hooks/useTranslation";
import SEOHead from "@/components/seo/SEOHead";
import { Search, Book, BookOpen, Users, Download, Calendar, Globe, Accessibility, Share2, MousePointer, CreditCard, BadgeCheck, UserPlus, Filter, Scroll, HelpCircle } from "lucide-react";
import emblemeMaroc from "@/assets/embleme-maroc.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleSelect } from "@/components/SimpleSelect";
import bnrmBuildingNight from "@/assets/bnrm-hero.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";
import islamicPattern from "@/assets/islamic-calligraphy-pattern.jpg";
import { DigitalServicesCarousel } from "@/components/DigitalServicesCarousel";
import { PlatformsSection } from "@/components/PlatformsSection";
import { NewsEventsSection } from "@/components/NewsEventsSection";
import { MediathequeSection } from "@/components/MediathequeSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t, language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  // Fetch hero settings from CMS for PORTAL platform
  const { data: heroSettings } = useQuery({
    queryKey: ["cms-hero-settings-portal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_hero_settings")
        .select("*")
        .eq("platform", "portal")
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching hero settings:", error);
        return null;
      }

      return data ?? null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Get hero image URL with fallback to static image
  const heroImageUrl = heroSettings?.hero_image_url || bnrmBuildingNight;
  
  // Get hero content with proper language fallback - prioritize translations for non-CMS languages
  const getHeroTitle = () => {
    // For Arabic, use CMS Arabic content if available
    if (language === 'ar' && heroSettings?.hero_title_ar) {
      return heroSettings.hero_title_ar;
    }
    // For French, use CMS French content if available
    if (language === 'fr' && heroSettings?.hero_title_fr) {
      return heroSettings.hero_title_fr;
    }
    // For all other languages (EN, ES, AMZ), use translation system
    return t('portal.hero.title');
  };
  
  const getHeroSubtitle = () => {
    // For Arabic, use CMS Arabic content if available
    if (language === 'ar' && heroSettings?.hero_subtitle_ar) {
      return heroSettings.hero_subtitle_ar;
    }
    // For French, use CMS French content if available
    if (language === 'fr' && heroSettings?.hero_subtitle_fr) {
      return heroSettings.hero_subtitle_fr;
    }
    // For all other languages (EN, ES, AMZ), use translation system
    return t('portal.hero.description');
  };
  
  const heroTitle = getHeroTitle();
  const heroSubtitle = getHeroSubtitle();

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('bnrm-welcome-popup-dismissed');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cbm/recherche?q=${encodeURIComponent(searchQuery.trim())}&filter=${searchFilter}`);
    }
  };

  return (
    <>
      <SEOHead
        title="Accueil"
        description="Bibliothèque Nationale du Royaume du Maroc - Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel."
        keywords={["bibliothèque maroc", "BNRM", "manuscrits marocains", "patrimoine culturel"]}
      />

      <div className="min-h-screen bg-background">
        <Header />

        <WelcomePopup
          isOpen={showWelcomePopup}
          onClose={() => setShowWelcomePopup(false)}
        />

        {/* Hero Banner - Mobile First */}
        <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden pt-16 sm:pt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${heroImageUrl})`,
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 sm:from-black/70 sm:via-black/50 sm:to-black/30" />
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]">
            <div className="max-w-full sm:max-w-xl md:max-w-2xl">
              {/* Tagline */}
              <span
                className="inline-block uppercase tracking-widest text-white text-sm font-semibold mb-2 sm:mb-4"
                style={{
                  width: 257,
                  height: 42,
                  lineHeight: '42px',
                  borderRadius: 10,
                  background: 'rgba(30, 58, 138, 0.37)',
                  border: '1px solid rgba(30, 58, 138, 0.53)',
                  textAlign: 'center',
                }}
              >
                {t('portal.hero.tagline')}
              </span>
              
              {/* Heading 2 - Main title - Responsive font sizes */}
              <h1 className="bnrm-hero-title text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                {heroTitle}
              </h1>
              
              {/* Text medium - Description */}
              <p className="bnrm-hero-subtitle text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-full sm:max-w-lg md:max-w-xl">
                {heroSubtitle}
              </p>
              
              <div>
                <Button 
                  size="default"
                  onClick={() => navigate('/help')}
                  className="px-6 py-0 text-sm font-semibold rounded-[5px] shadow-lg hover:shadow-xl transition-all sm:w-auto"
                  style={{ width: 204, height: 31, backgroundColor: '#93C5FD', color: '#fff', border: 'none' }}
                >
                  <HelpCircle className={`h-4 w-4 text-black ${isRTL ? 'ml-2' : 'mr-2'}`} />
                   <span className="text-black">{t('portal.hero.helpBtn')}</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content - Mobile First */}
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <div className="max-w-6xl mx-auto space-y-4">
              
              {/* News and Events Section */}
              <NewsEventsSection language={language} />

              {/* Digital Services Section */}
              <div className="mb-4 sm:mb-6">
                <div className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-slate-50 to-white rounded-lg">
                  <div className="container mx-auto px-3 sm:px-4">
                    <div className="mb-6 sm:mb-8 md:mb-10">
                      <p className="bnrm-caption uppercase tracking-widest text-primary mb-1 sm:mb-2">
                        BNRM
                      </p>
                      <h2 className="bnrm-section-title text-blue-dark mb-2 sm:mb-4">
                        {t('portal.digitalServices.title')}
                      </h2>
                      <div className="w-16 sm:w-20 md:w-24 h-1 bg-primary mb-2 sm:mb-4"></div>
                      <p className="bnrm-section-subtitle">
                        {t('portal.digitalServices.subtitle')}
                      </p>
                    </div>

                    <DigitalServicesCarousel language={language} />
                  </div>
                </div>
              </div>

              {/* Platforms Section */}
              <PlatformsSection language={language} />

              {/* Quick Links */}
              <div className="mb-8 sm:mb-10 md:mb-12">
                <div className={`mb-6 sm:mb-8 md:mb-10 ${isRTL ? 'text-center' : 'text-left'}`}>
                  <p className="bnrm-caption uppercase tracking-widest text-primary mb-1 sm:mb-2">
                    BNRM
                  </p>
                  <h2 className="bnrm-section-title text-blue-dark mb-2 sm:mb-4">
                    {t('portal.quickLinks.title')}
                  </h2>
                  <div className={`w-16 sm:w-20 md:w-24 h-1 bg-primary mb-2 sm:mb-4 ${isRTL ? 'mx-auto' : ''}`}></div>
                  <p className="bnrm-section-subtitle">
                    {t('portal.quickLinks.subtitle')}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  <Card 
                    className="group cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden"
                    onClick={() => navigate('/signup')}
                  >
                    <div 
                      className="absolute inset-0 opacity-10 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${islamicPattern})`,
                        transform: 'rotate(0deg) scale(1.2)'
                      }}
                    />
                    <CardContent className="p-8 text-center space-y-4 relative z-10">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="bnrm-card-title group-hover:text-primary transition-colors">
                        {t('portal.quickLinks.registration.title')}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {t('portal.quickLinks.registration.desc')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="group cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden"
                    onClick={() => navigate('/abonnements?platform=portal')}
                  >
                    <div 
                      className="absolute inset-0 opacity-10 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${islamicPattern})`,
                        transform: 'rotate(15deg) scale(1.2)'
                      }}
                    />
                    <CardContent className="p-8 text-center space-y-4 relative z-10">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CreditCard className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="bnrm-card-title group-hover:text-primary transition-colors">
                        {t('portal.quickLinks.subscriptions.title')}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {t('portal.quickLinks.subscriptions.desc')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="group cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden"
                    onClick={() => navigate('/help')}
                  >
                    <div 
                      className="absolute inset-0 opacity-10 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${islamicPattern})`,
                        transform: 'rotate(-15deg) scale(1.2)'
                      }}
                    />
                    <CardContent className="p-8 text-center space-y-4 relative z-10">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MousePointer className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="bnrm-card-title group-hover:text-primary transition-colors">
                        {t('portal.quickLinks.help.title')}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {t('portal.quickLinks.help.desc')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mediatheque Section */}
              <MediathequeSection language={language} />
          </div>
        </main>
        
        <Footer />
        <FloatingButtons />
      </div>
    </>
  );
};

export default Index;
