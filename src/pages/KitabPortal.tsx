import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import { BookText, Lightbulb, Sparkles, BookMarked, Library, Mail, ArrowRight, FileText, Clock } from "lucide-react";
import kitabBanner from "@/assets/kitab-banner.jpg";
import { useLanguage } from "@/hooks/useLanguage";

export default function KitabPortal() {
  const { language } = useLanguage();
  
  const mainFeatures = [
    {
      title_fr: "À Propos",
      title_ar: "حول كتاب",
      description_fr: "Découvrez Kitab, la plateforme dédiée à l'édition marocaine",
      description_ar: "اكتشف كتاب، المنصة المخصصة للنشر المغربي",
      icon: Lightbulb,
      path: "/kitab/about",
      gradient: "from-kitab-primary/90 to-kitab-primary"
    },
    {
      title_fr: "À Paraître",
      title_ar: "قريباً",
      description_fr: "Les prochaines sorties et nouvelles publications",
      description_ar: "الإصدارات والمنشورات الجديدة القادمة",
      icon: Clock,
      path: "/kitab/upcoming",
      gradient: "from-kitab-secondary/90 to-kitab-secondary"
    },
    {
      title_fr: "Nouvelles Parutions",
      title_ar: "إصدارات جديدة",
      description_fr: "Explorez les dernières publications nationales",
      description_ar: "استكشف أحدث المنشورات الوطنية",
      icon: Sparkles,
      path: "/kitab/new-publications",
      gradient: "from-kitab-accent/90 to-kitab-accent"
    },
    {
      title_fr: "Bibliographie Nationale",
      title_ar: "الببليوغرافيا الوطنية",
      description_fr: "Recherche avancée par support et par année",
      description_ar: "بحث متقدم حسب الوسيلة والسنة",
      icon: BookMarked,
      path: "/bibliographies",
      gradient: "from-kitab-primary-dark/90 to-kitab-primary"
    }
  ];

  const quickAccess = [
    {
      title_fr: "Questions & Réponses",
      title_ar: "أسئلة وأجوبة",
      description_fr: "Contactez-nous à kitab@bnrm.ma pour vos suggestions",
      description_ar: "اتصل بنا على kitab@bnrm.ma لاقتراحاتك",
      icon: Mail,
      path: "/kitab/faq"
    }
  ];

  return (
    <>
      <SEOHead
        title="Kitab - Portail des Publications Marocaines"
        description="Kitab est le portail national des publications marocaines. Découvrez les nouvelles parutions, bibliographie nationale, répertoires d'éditeurs et auteurs marocains."
        keywords={["Kitab", "publications marocaines", "édition maroc", "bibliographie nationale", "auteurs marocains", "éditeurs marocains", "livres maroc"]}
      />
      
      <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section - Kitab Style */}
      <section className="relative overflow-hidden h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={kitabBanner} 
            alt="Kitab Banner" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/60 via-[hsl(var(--kitab-secondary))]/50 to-[hsl(var(--kitab-accent))]/40"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Badge */}
              <Badge className="mb-6 bg-[hsl(var(--kitab-accent))] text-white border-0 px-6 py-2 text-sm font-medium">
                {language === 'ar' ? 'المنصة الوطنية' : 'PLATEFORME NATIONALE'}
              </Badge>
              
              {/* Main Title */}
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {language === 'ar' ? 'كتاب' : 'Kitab'}
              </h1>
              
              {/* Subtitle */}
              <p className="text-2xl text-white/95 mb-4 font-semibold">
                {language === 'ar' 
                  ? 'المنصة الرقمية للنشر في المغرب'
                  : 'Plateforme Digitale de l\'Édition au Maroc'
                }
              </p>
              
              {/* Description */}
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                {language === 'ar'
                  ? 'مكتبة ببليوغرافية رقمية مجانية مخصصة للمنشورات الوطنية. اكتشف واستكشف وروج لصناعة الكتاب المغربية.'
                  : 'Bibliothèque bibliographique numérique gratuite dédiée aux publications nationales. Découvrez, explorez et promouvez l\'industrie marocaine du livre.'
                }
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/kitab/new-publications">
                  <Button size="lg" className="bg-white text-[hsl(var(--kitab-primary))] hover:bg-white/90 h-14 px-8 text-lg shadow-[var(--shadow-kitab-strong)]">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {language === 'ar' ? 'إصدارات جديدة' : 'Nouvelles Parutions'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/bibliographies">
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 h-14 px-8 text-lg">
                    <BookMarked className="w-5 h-5 mr-2" />
                    {language === 'ar' ? 'الببليوغرافيا الوطنية' : 'Bibliographie Nationale'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-16">
        {/* Main Features Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl font-bold text-foreground pl-4 ${
              language === 'ar' 
                ? 'border-r-4 border-[hsl(var(--kitab-primary))] pr-4' 
                : 'border-l-4 border-[hsl(var(--kitab-primary))]'
            }`}>
              {language === 'ar' ? 'استكشف كتاب' : 'Explorer Kitab'}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mainFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const title = language === 'ar' ? feature.title_ar : feature.title_fr;
              const description = language === 'ar' ? feature.description_ar : feature.description_fr;
              return (
                <Link key={feature.path} to={feature.path}>
                  <Card className="group h-full hover:shadow-[var(--shadow-kitab-strong)] transition-all duration-500 cursor-pointer overflow-hidden border-2 border-[hsl(var(--kitab-primary))]/10 hover:border-[hsl(var(--kitab-primary))]/30 shadow-[var(--shadow-kitab)] bg-white">
                    {/* Icon Header with Gradient and animated background */}
                    <div className={`bg-gradient-to-br ${feature.gradient} h-48 flex items-center justify-center relative overflow-hidden`}>
                      <div 
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                        style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
                      ></div>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Icon with enhanced styling */}
                      <div className="relative z-10 bg-white/20 backdrop-blur-sm rounded-3xl p-6 group-hover:bg-white/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                        <IconComponent className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
                      </div>
                      
                      {/* Sparkle effects */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-3 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    
                    <CardHeader className="p-6 bg-gradient-to-b from-transparent to-[hsl(var(--kitab-neutral-light))]/10">
                      <CardTitle className="text-lg font-bold group-hover:text-[hsl(var(--kitab-primary))] transition-colors mb-2 flex items-center gap-2">
                        {title}
                        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                          language === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'
                        }`} />
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="mb-16">
          <h2 className={`text-3xl font-bold text-foreground pl-4 mb-8 ${
            language === 'ar'
              ? 'border-r-4 border-[hsl(var(--kitab-primary))] pr-4'
              : 'border-l-4 border-[hsl(var(--kitab-primary))]'
          }`}>
            {language === 'ar' ? 'وصول سريع' : 'Accès Rapide'}
          </h2>

          <div className="grid gap-6">
            {quickAccess.map((item) => {
              const IconComponent = item.icon;
              const title = language === 'ar' ? item.title_ar : item.title_fr;
              const description = language === 'ar' ? item.description_ar : item.description_fr;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group hover:shadow-[var(--shadow-kitab-strong)] transition-all duration-500 cursor-pointer border-2 border-[hsl(var(--kitab-primary))]/10 hover:border-[hsl(var(--kitab-primary))]/30 shadow-[var(--shadow-kitab)] bg-gradient-to-r from-white via-white to-[hsl(var(--kitab-neutral-light))]/20 overflow-hidden">
                    <CardHeader className="flex flex-row items-start gap-6 p-8 relative">
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      {/* Enhanced icon container */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-[hsl(var(--kitab-primary))]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 via-[hsl(var(--kitab-accent))]/15 to-[hsl(var(--kitab-secondary))]/10 p-5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg border border-[hsl(var(--kitab-primary))]/20">
                          <IconComponent className="w-10 h-10 text-[hsl(var(--kitab-primary))] drop-shadow-sm" strokeWidth={1.5} />
                        </div>
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <CardTitle className="text-xl mb-3 group-hover:text-[hsl(var(--kitab-primary))] transition-colors font-bold flex items-center gap-2">
                          {title}
                          <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[hsl(var(--kitab-accent))]" />
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {description}
                        </CardDescription>
                      </div>
                      <ArrowRight className={`w-6 h-6 text-muted-foreground group-hover:text-[hsl(var(--kitab-primary))] transition-all duration-300 flex-shrink-0 relative z-10 ${
                        language === 'ar' ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'
                      }`} />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-secondary))] text-white rounded-2xl p-12 shadow-[var(--shadow-kitab-strong)] relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-center">
                {language === 'ar' ? 'كتاب في أرقام' : 'Kitab en Chiffres'}
              </h2>
              <p className="text-center text-white/90 mb-10">
                {language === 'ar'
                  ? 'منصة في تطور مستمر في خدمة النشر المغربي'
                  : 'Une plateforme en constante évolution au service de l\'édition marocaine'
                }
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-sm text-white/80">
                    {language === 'ar' ? 'ناشرون مرجعيون' : 'Éditeurs Référencés'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">15K+</div>
                  <div className="text-sm text-white/80">
                    {language === 'ar' ? 'منشورات مفهرسة' : 'Publications Cataloguées'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">2K+</div>
                  <div className="text-sm text-white/80">
                    {language === 'ar' ? 'إصدارات جديدة/سنة' : 'Nouvelles Parutions/An'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-sm text-white/80">
                    {language === 'ar' ? 'مجاني ومتاح' : 'Gratuit & Accessible'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <div className="relative bg-gradient-to-r from-[hsl(var(--kitab-neutral-light))] via-white to-[hsl(var(--kitab-neutral-light))] rounded-2xl p-12 text-center shadow-[var(--shadow-kitab)] border-2 border-[hsl(var(--kitab-primary))]/10 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[hsl(var(--kitab-accent))]/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Enhanced icon */}
              <div className="inline-block relative mb-6">
                <div className="absolute inset-0 bg-[hsl(var(--kitab-primary))]/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 to-[hsl(var(--kitab-accent))]/10 p-6 rounded-full">
                  <Library className="w-16 h-16 text-[hsl(var(--kitab-primary))] drop-shadow-lg" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {language === 'ar' ? 'انضم إلى نظام كتاب' : 'Rejoignez l\'Écosystème Kitab'}
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {language === 'ar'
                  ? 'ناشرون، مؤلفون، بائعو كتب: شاركوا في الترويج لصناعة الكتاب الوطنية. اتصلوا بنا لإدراج منشوراتكم في كتاب.'
                  : 'Éditeurs, auteurs, libraires : participez à la promotion de l\'industrie nationale du livre. Contactez-nous pour intégrer vos publications dans Kitab.'
                }
              </p>
              <Link to="/kitab/faq">
                <Button size="lg" className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white h-12 px-8 shadow-[var(--shadow-kitab)] group">
                  <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {language === 'ar' ? 'اتصل بنا' : 'Nous Contacter'}
                  <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${
                    language === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'
                  }`} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />
    </div>
    </>
  );
}
