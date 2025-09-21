import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Search, Book, BookOpen, Users, FileText, Download, Calendar, Globe, Accessibility, Share2, MousePointer, Star, Sparkles, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background bg-pattern-medina">
        <Header />
        
        {/* Bannière Artistique Marocaine */}
        <section className="relative bg-gradient-zellige py-8 border-b-4 border-gold/30">
          <div className="absolute inset-0 bg-pattern-embroidery opacity-20"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Crown className="h-8 w-8 text-gold animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-moroccan font-bold text-white drop-shadow-lg">
                الخزانة الوطنية للمملكة المغربية
              </h1>
              <Crown className="h-8 w-8 text-gold animate-pulse" />
            </div>
            <p className="text-lg text-white/90 font-elegant italic">
              "Gardienne du patrimoine millénaire marocain"
            </p>
            <div className="flex justify-center space-x-2 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-gold fill-gold animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Main Layout avec influences artistiques marocaines */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Zone principale de contenu avec éléments zellige */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Zone de recherche avec bordure zellige */}
              <div className="text-center mb-8 relative">
                <div className="absolute inset-0 bg-pattern-zellige-complex opacity-30 rounded-3xl"></div>
                <div className="max-w-2xl mx-auto relative bg-card/90 backdrop-blur-sm p-6 rounded-3xl shadow-moroccan border-2 border-gold/20">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="ابحث في كنوز المعرفة المغربية..."
                      className="w-full h-16 text-lg bg-white/95 shadow-zellige border-2 border-gold/30 focus:border-primary pl-6 pr-16 rounded-full font-arabic"
                    />
                    <Button 
                      size="lg" 
                      className="absolute right-2 top-2 h-12 w-12 rounded-full bg-gradient-sunset shadow-gold hover:shadow-berber transition-all duration-300"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-4 italic font-elegant">
                    "استكشف كنوز المكتبة الوطنية وتراث المغرب العريق"
                  </p>
                </div>
              </div>

              {/* Zone de contenu avec motifs berbères et zellige */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bloc principal avec motifs traditionnels */}
                <Card className="md:col-span-1 bg-gradient-subtle border-3 border-gold/40 shadow-moroccan hover:shadow-royal transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-pattern-berber-complex opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <CardContent className="p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-berber rounded-2xl flex items-center justify-center mb-4 shadow-berber transform group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-10 w-10 text-white" />
                      </div>
                      <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-pulse" />
                    </div>
                    <h3 className="text-xl font-moroccan font-bold text-foreground">
                      استكشف المكتبة الوطنية
                    </h3>
                    <p className="text-muted-foreground font-elegant">
                      رحلة عبر تاريخ وحضارة المغرب العريق
                    </p>
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bloc actualités avec dégradé royal */}
                <Card className="bg-gradient-primary text-primary-foreground border-3 border-royal/40 shadow-royal hover:shadow-gold transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-pattern-metal-engraving opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
                  <CardContent className="p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-sunset rounded-2xl flex items-center justify-center mb-4 shadow-gold transform group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-10 w-10 text-white" />
                      </div>
                      <Gem className="absolute -top-2 -right-2 h-6 w-6 text-coral animate-pulse" />
                    </div>
                    <h3 className="text-xl font-moroccan font-bold">
                      الأخبار والمنشورات
                    </h3>
                    <p className="text-primary-foreground/90 font-elegant">
                      آخر أخبار ومنشورات المكتبة الوطنية
                    </p>
                  </CardContent>
                </Card>

                {/* Bloc patrimoine avec couleurs authentiques */}
                <Card className="bg-gradient-accent text-accent-foreground border-3 border-coral/40 shadow-elegant hover:shadow-zellige transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-pattern-embroidery opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
                  <CardContent className="p-8 min-h-[200px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                    <div className="relative">
                      <div className="w-16 h-16 bg-coral/90 rounded-2xl flex items-center justify-center mb-3 shadow-berber transform group-hover:scale-110 transition-transform duration-300">
                        <Book className="h-8 w-8 text-white" />
                      </div>
                      <Star className="absolute -top-1 -right-1 h-4 w-4 text-gold fill-gold animate-pulse" />
                    </div>
                    <h3 className="text-lg font-moroccan font-bold">
                      استكشف التراث
                    </h3>
                    <p className="text-accent-foreground/90 text-sm font-elegant">
                      مجموعات ووثائق تراثية نادرة
                    </p>
                  </CardContent>
                </Card>

                {/* Bloc services avec style traditionnel */}
                <Card className="bg-gradient-sunset text-highlight-foreground border-3 border-accent/40 shadow-berber hover:shadow-moroccan transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-pattern-berber-complex opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
                  <CardContent className="p-8 min-h-[200px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                    <div className="relative">
                      <div className="w-16 h-16 bg-royal/90 rounded-2xl flex items-center justify-center mb-3 shadow-royal transform group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gold animate-pulse" />
                    </div>
                    <h3 className="text-lg font-moroccan font-bold">
                      خدماتنا
                    </h3>
                    <p className="text-highlight-foreground/90 text-sm font-elegant">
                      التسجيل، الحجز، والإيداع القانوني
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Services rapides avec style artisanal marocain */}
              <Card className="bg-gradient-subtle border-3 border-gold/30 shadow-moroccan relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-moroccan font-bold text-foreground">خدمات سريعة</h3>
                    <div className="w-24 h-1 bg-gradient-berber mx-auto mt-2 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { icon: FileText, label: "الإيداع القانوني", color: "text-primary", bg: "bg-primary/10" },
                      { icon: BookOpen, label: "حجز كتاب", color: "text-accent", bg: "bg-accent/10" },
                      { icon: Download, label: "النسخ", color: "text-coral", bg: "bg-coral/10" },
                      { icon: Users, label: "التسجيل", color: "text-royal", bg: "bg-royal/10" },
                      { icon: Calendar, label: "الفعاليات", color: "text-gold", bg: "bg-gold/10" }
                    ].map((service, index) => (
                      <div key={index} className={`text-center p-4 rounded-xl ${service.bg} hover:shadow-zellige transition-all duration-300 transform hover:scale-105 border border-gold/20`}>
                        <service.icon className={`h-8 w-8 ${service.color} mx-auto mb-2`} />
                        <p className="text-sm font-medium text-foreground font-arabic">{service.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar avec éléments artistiques marocains */}
            <div className="xl:col-span-1 space-y-4">
              
              {/* Mon espace avec style traditionnel */}
              <Card className="bg-card border-3 border-primary/30 shadow-moroccan hover:shadow-royal transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-embroidery opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-gradient-berber rounded-xl flex items-center justify-center mx-auto mb-3 shadow-berber transform group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">حسابي</h4>
                  <Button size="sm" className="w-full bg-gradient-primary shadow-gold hover:shadow-moroccan font-arabic">
                    تسجيل الدخول
                  </Button>
                </CardContent>
              </Card>

              {/* Aide avec motifs traditionnels */}
              <Card className="bg-card border-3 border-accent/30 shadow-elegant hover:shadow-zellige transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-berber-complex opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-3 shadow-elegant transform group-hover:scale-110 transition-transform duration-300">
                    <MousePointer className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">المساعدة</h4>
                  <p className="text-xs text-muted-foreground font-arabic">الأسئلة المتكررة والاتصال</p>
                </CardContent>
              </Card>

              {/* Services numériques avec bordure dorée */}
              <Card className="bg-card border-3 border-gold/30 shadow-gold hover:shadow-moroccan transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-metal-engraving opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-gradient-sunset rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-gold/30 shadow-gold transform group-hover:scale-110 transition-transform duration-300">
                    <Download className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">الخدمات الرقمية</h4>
                  <p className="text-xs text-muted-foreground font-arabic">الفهرس والنسخ الرقمية</p>
                </CardContent>
              </Card>

              {/* Langues avec couleurs nationales */}
              <Card className="bg-card border-3 border-coral/30 shadow-berber hover:shadow-gold transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-embroidery opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-coral/20 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-coral/30 shadow-berber transform group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-7 w-7 text-coral" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">اللغات</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="text-xs px-3 py-1 bg-primary/15 rounded-full text-primary font-arabic border border-primary/20">ع</span>
                    <span className="text-xs px-3 py-1 bg-accent/15 rounded-full text-accent border border-accent/20">FR</span>
                    <span className="text-xs px-3 py-1 bg-coral/15 rounded-full text-coral border border-coral/20">EN</span>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibilité avec style royal */}
              <Card className="bg-card border-3 border-royal/30 shadow-royal hover:shadow-moroccan transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-berber-complex opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-royal/20 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-royal/30 shadow-royal transform group-hover:scale-110 transition-transform duration-300">
                    <Accessibility className="h-7 w-7 text-royal" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">إمكانية الوصول</h4>
                  <p className="text-xs text-muted-foreground font-arabic">خيارات إمكانية الوصول</p>
                </CardContent>
              </Card>

              {/* Partage avec dégradé vibrant */}
              <Card className="bg-card border-3 border-highlight/30 shadow-elegant hover:shadow-gold transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-pattern-metal-engraving opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-14 h-14 bg-highlight/20 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-highlight/30 shadow-elegant transform group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="h-7 w-7 text-highlight" />
                  </div>
                  <h4 className="font-moroccan font-bold text-foreground mb-2">المشاركة</h4>
                  <p className="text-xs text-muted-foreground font-arabic">شبكات التواصل الاجتماعي</p>
                </CardContent>
              </Card>

              {/* Chatbot avec style royal et ornements */}
              <Card className="bg-gradient-berber text-white border-3 border-gold/40 shadow-royal relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-embroidery opacity-20"></div>
                <CardContent className="p-6 text-center min-h-[140px] flex flex-col justify-center relative z-10">
                  <div className="relative mx-auto mb-4">
                    <div className="w-18 h-18 bg-white/20 rounded-2xl flex items-center justify-center shadow-gold">
                      <MousePointer className="h-9 w-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-moroccan font-bold mb-2">مساعد ذكي</h4>
                  <p className="text-sm text-white/90 font-arabic">
                    مساعدة فورية ومتخصصة
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
