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

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

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
        
        {/* Hero Banner */}
        <section className="relative min-h-[70vh] overflow-hidden pt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${bnrmBuildingNight})`,
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center min-h-[70vh]">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('header.title')}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                {language === 'ar' 
                  ? 'الحفاظ على التراث المخطوط المغربي وتثمينه. اكتشف آلاف المخطوطات القديمة الرقمية في إطار معماري استثنائي.'
                  : 'Préservation et valorisation du patrimoine manuscrit marocain. Découvrez des milliers de manuscrits anciens numérisés dans un cadre architectural exceptionnel.'
                }
              </p>
              
              <div>
                <Button 
                  size="lg"
                  onClick={() => navigate('/help')}
                  className="bg-[#e67e22] hover:bg-[#d35400] text-white px-8 py-6 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <HelpCircle className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'المساعدة والدعم' : 'Aide & Support'}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-4">
              
              {/* Search Section */}
              <Card className="shadow-2xl border-2 border-primary/10 mb-6">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {language === 'ar' ? 'البحث في الفهرس' : 'Rechercher dans le catalogue'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'ابحث في مجموعاتنا الواسعة من الكتب والمخطوطات'
                        : 'Explorez nos vastes collections de livres et manuscrits'
                      }
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <SimpleSelect
                      value={searchFilter}
                      onValueChange={setSearchFilter}
                      options={[
                        { value: "all", label: language === 'ar' ? 'الكل' : 'Tout' },
                        { value: "books", label: language === 'ar' ? 'كتب' : 'Livres' },
                        { value: "manuscripts", label: language === 'ar' ? 'مخطوطات' : 'Manuscrits' },
                        { value: "documents", label: language === 'ar' ? 'وثائق' : 'Documents' },
                        { value: "periodicals", label: language === 'ar' ? 'دوريات' : 'Périodiques' },
                      ]}
                      placeholder={language === 'ar' ? 'الفئة' : 'Catégorie'}
                      icon={<Filter className="h-4 w-4" />}
                      className="w-full md:w-[200px]"
                    />
                    
                    <div className="relative flex-1">
                      <Input
                        type="search"
                        placeholder={language === 'ar' ? 'ابحث عن عنوان، مؤلف، موضوع...' : 'Rechercher un titre, auteur, sujet...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full h-14 text-base bg-background border-2 pr-16 hover:border-primary/50 focus:border-primary transition-colors"
                        maxLength={200}
                      />
                      
                      <Button 
                        size="lg"
                        onClick={handleSearch}
                        className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-950 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <Search className="h-5 w-5 mr-2" />
                        {language === 'ar' ? 'بحث' : 'Rechercher'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* News and Events Section */}
              <NewsEventsSection language={language} />

              {/* Digital Services Section */}
              <div className="mb-6">
                <div className="py-8 bg-gradient-to-b from-slate-50 to-white rounded-lg">
                  <div className="container mx-auto px-4">
                    <div className="mb-10">
                      <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
                        BNRM
                      </p>
                      <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
                        {language === 'ar' ? 'خدماتنا الرقمية' : 'Nos Services Numériques'}
                      </h2>
                      <div className="w-24 h-1 bg-orange-500 mb-4"></div>
                      <p className="text-muted-foreground">
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
              <div className="mb-12">
                <div className={`mb-10 ${language === 'ar' ? 'text-center' : 'text-left'}`}>
                  <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    BNRM
                  </p>
                  <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
                    {language === 'ar' ? 'روابط سريعة' : 'Liens rapides'}
                  </h2>
                  <div className={`w-24 h-1 bg-orange-500 mb-4 ${language === 'ar' ? 'mx-auto' : ''}`}></div>
                  <p className="text-muted-foreground">
                    {language === 'ar'
                      ? 'الوصول السريع إلى خدماتنا الأساسية'
                      : 'Accès rapide à nos services essentiels'
                    }
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {language === 'ar' ? 'تسجيل' : 'Inscription'}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {language === 'ar' 
                          ? 'إنشاء حساب جديد للوصول إلى جميع خدماتنا' 
                          : 'Créez votre compte pour accéder à tous nos services'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="group cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden"
                    onClick={() => navigate('/abonnements')}
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
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {language === 'ar' ? 'الاشتراكات' : 'Adhésions'}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {language === 'ar' ? 'المساعدة والدعم' : 'Aide & Support'}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
