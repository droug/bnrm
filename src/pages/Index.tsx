import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import WelcomePopup from "@/components/WelcomePopup";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/seo/SEOHead";
import { Search, Book, BookOpen, Users, Download, Calendar, Globe, Accessibility, Share2, MousePointer, CreditCard, BadgeCheck, UserPlus } from "lucide-react";
import emblemeMaroc from "@/assets/embleme-maroc.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import bnrmBuildingNight from "@/assets/bnrm-building-night.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";
import { DigitalServicesCarousel } from "@/components/DigitalServicesCarousel";
import { PlatformsSection } from "@/components/PlatformsSection";
import { NewsEventsSection } from "@/components/NewsEventsSection";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    if (searchQuery) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <>
      <SEOHead
        title="Accueil"
        description="Bibliothèque Nationale du Royaume du Maroc - Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel."
        keywords={["bibliothèque maroc", "BNRM", "manuscrits marocains", "patrimoine culturel"]}
      />
      
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Banner */}
        <section className="relative min-h-screen overflow-hidden pt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${bnrmBuildingNight})`,
              filter: 'brightness(1.2) contrast(1.1)'
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          
          <div className="relative z-10 h-full flex flex-col pt-8 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-2xl" />
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
                  {t('header.title')}
                </h1>
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-2xl" />
              </div>
              
              <p className="text-2xl md:text-3xl text-white/95 font-light mb-8 drop-shadow-lg">
                {language === 'ar' 
                  ? 'حارسة التراث الألفي المغربي'
                  : 'Gardienne du patrimoine millénaire marocain'
                }
              </p>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Main Area */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* Search Section */}
              <div className="text-center mb-10">
                <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-lg">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {t('header.search')}
                  </h2>
                  
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder={language === 'ar' ? 'ابحث في الفهرس...' : 'Rechercher dans le catalogue...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full h-16 text-lg bg-white shadow-md border-2 pr-16 rounded-full"
                    />
                    
                    <Button 
                      size="lg"
                      onClick={handleSearch}
                      className="absolute right-2 top-2 h-12 w-12 rounded-full"
                    >
                      <Search className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* News and Events Section */}
              <NewsEventsSection language={language} />

              {/* Platforms Section */}
              <PlatformsSection language={language} />

              {/* Digital Services Section */}
              <div className="mb-12">
                <div className="py-16 bg-gradient-to-b from-slate-50 to-white rounded-lg">
                  <div className="container mx-auto px-4">
                    <div className="mb-10">
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white mb-3">
                        BNRM
                      </Badge>
                      <h2 className="text-4xl font-bold mb-3 text-[#1e3a8a] relative inline-block">
                        {language === 'ar' ? 'خدماتنا الرقمية' : 'Nos Services Numériques'}
                        <div className="absolute bottom-0 left-0 w-32 h-1 bg-orange-500"></div>
                      </h2>
                      <p className="text-muted-foreground mt-4">
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

              {/* Quick Services */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                    {language === 'ar' ? 'خدمات سريعة' : 'Services Rapides'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="text-center p-5 rounded-2xl bg-primary/10 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate('/signup')}
                    >
                      <UserPlus className="h-10 w-10 text-primary mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'ar' ? 'تسجيل' : 'Inscription'}
                      </p>
                    </div>
                    <div 
                      className="text-center p-5 rounded-2xl bg-primary/10 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate('/abonnements')}
                    >
                      <CreditCard className="h-10 w-10 text-primary mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'ar' ? 'الاشتراكات' : 'Adhésions'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/auth')}>
                <CardContent className="p-5 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-3">
                    {language === 'ar' ? 'مساحتي' : 'Mon Espace'}
                  </h4>
                  <Button size="sm" className="w-full">
                    {language === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
                  </Button>
                </CardContent>
              </Card>

              {[
                { title_fr: "Aide & Support", title_ar: "المساعدة والدعم", icon: MousePointer, href: "/help" },
                { title_fr: "Partager", title_ar: "مشاركة", icon: Share2, href: "#" }
              ].map((item, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate(item.href)}>
                  <CardContent className="p-4 text-center">
                    <item.icon className="h-6 w-6 text-foreground mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-foreground">
                      {language === 'ar' ? item.title_ar : item.title_fr}
                    </h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        
        <Footer />
        <GlobalAccessibilityTools />
      </div>
    </>
  );
};

export default Index;
