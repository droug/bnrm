import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { FloatingButtons } from "@/components/FloatingButtons";
import WelcomePopup from "@/components/WelcomePopup";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t, language } = useLanguage();
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
  const heroTitle = language === 'ar' 
    ? (heroSettings?.hero_title_ar || t('header.title'))
    : (heroSettings?.hero_title_fr || t('header.title'));
  const heroSubtitle = language === 'ar'
    ? (heroSettings?.hero_subtitle_ar || 'الحفاظ على التراث المخطوط المغربي وتثمينه. اكتشف آلاف المخطوطات القديمة الرقمية في إطار معماري استثنائي.')
    : (heroSettings?.hero_subtitle_fr || 'Préservation et valorisation du patrimoine manuscrit marocain. Découvrez des milliers de manuscrits anciens numérisés dans un cadre architectural exceptionnel.');

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
              <p className="bnrm-caption uppercase tracking-widest text-blue-primary-light mb-2 sm:mb-4">
                {language === 'ar' ? 'التراث الوطني المغربي' : 'Patrimoine National Marocain'}
              </p>
              
              {/* Heading 2 - Main title - Responsive font sizes */}
              <h1 className="bnrm-hero-title text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                {heroTitle}
              </h1>
              
              {/* Text medium - Description */}
              <p className="bnrm-body-text text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-full sm:max-w-lg md:max-w-xl line-clamp-3 sm:line-clamp-none">
                {heroSubtitle}
              </p>
              
              <div>
                <Button 
                  size="default"
                  onClick={() => navigate('/help')}
                  className="bnrm-btn-primary px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  <HelpCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-white ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-white">{language === 'ar' ? 'المساعدة والدعم' : 'Aide & Support'}</span>
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
                        {language === 'ar' ? 'خدماتنا الرقمية' : 'Nos Services Numériques'}
                      </h2>
                      <div className="w-16 sm:w-20 md:w-24 h-1 bg-primary mb-2 sm:mb-4"></div>
                      <p className="bnrm-section-subtitle">
                        {language === 'ar'
                          ? 'اكتشف مجموعة واسعة من الخدمات الرقمية المتاحة'
                          : 'Découvrez notre large gamme de services numériques disponibles'
                        }
                      </p>
                    </div>

                    <DigitalServicesCarousel language={language === 'ar' ? 'ar' : 'fr'} />
                  </div>
                </div>
              </div>

              {/* Platforms Section */}
              <PlatformsSection language={language} />

              {/* Quick Links */}
              <div className="mb-8 sm:mb-10 md:mb-12">
                <div className={`mb-6 sm:mb-8 md:mb-10 ${language === 'ar' ? 'text-center' : 'text-left'}`}>
                  <p className="bnrm-caption uppercase tracking-widest text-primary mb-1 sm:mb-2">
                    BNRM
                  </p>
                  <h2 className="bnrm-section-title text-blue-dark mb-2 sm:mb-4">
                    {language === 'ar' ? 'روابط سريعة' : 'Liens rapides'}
                  </h2>
                  <div className={`w-16 sm:w-20 md:w-24 h-1 bg-primary mb-2 sm:mb-4 ${language === 'ar' ? 'mx-auto' : ''}`}></div>
                  <p className="bnrm-section-subtitle">
                    {language === 'ar'
                      ? 'الوصول السريع إلى خدماتنا الأساسية'
                      : 'Accès rapide à nos services essentiels'
                    }
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
                        {language === 'ar' ? 'تسجيل' : 'Inscription'}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {language === 'ar' 
                          ? 'إنشاء حساب جديد للوصول إلى جميع خدماتنا' 
                          : 'Créez votre compte pour accéder à tous nos services'}
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
                        {language === 'ar' ? 'الاشتراكات' : 'Adhésions'}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {language === 'ar' 
                          ? 'اكتشف أنواع الاشتراكات والخدمات المتاحة' 
                          : 'Découvrez nos différentes formules d\'adhésion'}
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
                        {language === 'ar' ? 'المساعدة والدعم' : 'Aide & Support'}
                      </h3>
                      <p className="bnrm-body-text-sm">
                        {language === 'ar' 
                          ? 'احصل على المساعدة والدعم الذي تحتاجه' 
                          : 'Obtenez l\'aide dont vous avez besoin'}
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
