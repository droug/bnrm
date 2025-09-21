import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Search, Book, BookOpen, Users, FileText, Download, Calendar, Globe, Accessibility, Share2, MousePointer, Star, Sparkles, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import traditionalLibraryBg from "@/assets/traditional-library-bg.jpg";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Arrière-plan de la page avec motifs zellige complexes */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20"></div>
          <div className="absolute inset-0 bg-pattern-berber-complex opacity-15"></div>
          <div className="absolute inset-0 bg-pattern-embroidery opacity-10"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          
          {/* Bannière Artistique avec arrière-plan bibliothèque traditionnelle */}
          <section className="relative py-12 border-b-4 border-gold/40 overflow-hidden">
            {/* Image de fond bibliothèque traditionnelle */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
              style={{ backgroundImage: `url(${traditionalLibraryBg})` }}
            ></div>
            {/* Overlay gradient avec motifs */}
            <div className="absolute inset-0 bg-gradient-zellige opacity-85"></div>
            <div className="absolute inset-0 bg-pattern-metal-engraving opacity-25"></div>
            
            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
                <h1 className="text-4xl md:text-5xl font-moroccan font-bold text-white drop-shadow-2xl">
                  Bibliothèque Nationale du Royaume du Maroc
                </h1>
                <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
              </div>
              <p className="text-xl text-white/95 font-elegant italic mb-4 drop-shadow-lg">
                "Gardienne du patrimoine millénaire marocain"
              </p>
              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(7)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold animate-pulse drop-shadow-lg" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              {/* Motif décoratif zellige */}
              <div className="w-48 h-2 bg-gradient-berber mx-auto rounded-full shadow-gold"></div>
            </div>
          </section>
          
          {/* Main Layout avec arrière-plans enrichis */}
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Zone principale avec arrière-plans zellige */}
              <div className="xl:col-span-3 space-y-8">
                
                {/* Zone de recherche avec arrière-plan complexe */}
                <div className="text-center mb-10 relative">
                  <div className="absolute inset-0 bg-pattern-zellige-complex opacity-40 rounded-3xl blur-sm"></div>
                  <div className="absolute inset-0 bg-pattern-metal-engraving opacity-20 rounded-3xl"></div>
                  <div className="max-w-2xl mx-auto relative bg-gradient-subtle backdrop-blur-md p-8 rounded-3xl shadow-moroccan border-3 border-gold/30">
                    <h2 className="text-2xl font-moroccan font-bold text-foreground mb-4">
                      Recherchez dans nos collections
                    </h2>
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Explorez les trésors de la connaissance marocaine..."
                        className="w-full h-16 text-lg bg-white/98 shadow-zellige border-3 border-gold/40 focus:border-primary pl-6 pr-16 rounded-full font-serif"
                      />
                      <Button 
                        size="lg" 
                        className="absolute right-2 top-2 h-12 w-12 rounded-full bg-gradient-sunset shadow-gold hover:shadow-berber transition-all duration-300 transform hover:scale-105"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-4 italic font-elegant">
                      "Découvrez des siècles de savoir et de patrimoine culturel"
                    </p>
                  </div>
                </div>

                {/* Grille de contenu avec arrière-plans artistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Carte Découvrir avec motifs berbères */}
                  <Card className="md:col-span-1 relative overflow-hidden group border-3 border-gold/50 shadow-moroccan hover:shadow-royal transition-all duration-700">
                    <div className="absolute inset-0 bg-pattern-berber-complex opacity-15 group-hover:opacity-30 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-subtle opacity-80"></div>
                    <CardContent className="p-10 min-h-[350px] flex flex-col justify-center items-center text-center space-y-6 relative z-10">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-berber rounded-3xl flex items-center justify-center mb-6 shadow-berber transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <BookOpen className="h-12 w-12 text-white" />
                        </div>
                        <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-gold animate-spin" />
                      </div>
                      <h3 className="text-2xl font-moroccan font-bold text-foreground">
                        Découvrir la Bibliothèque
                      </h3>
                      <p className="text-muted-foreground font-elegant text-lg">
                        Explorez l'histoire, les missions et les services de notre institution millénaire
                      </p>
                      <div className="flex space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Carte Actualités avec arrière-plan royal */}
                  <Card className="relative overflow-hidden group border-3 border-royal/50 shadow-royal hover:shadow-gold transition-all duration-700">
                    <div className="absolute inset-0 bg-pattern-metal-engraving opacity-20 group-hover:opacity-35 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
                    <CardContent className="p-10 min-h-[350px] flex flex-col justify-center items-center text-center space-y-6 relative z-10">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-sunset rounded-3xl flex items-center justify-center mb-6 shadow-gold transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                          <Calendar className="h-12 w-12 text-white" />
                        </div>
                        <Gem className="absolute -top-3 -right-3 h-8 w-8 text-coral animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-moroccan font-bold text-white">
                        Actualités & Publications
                      </h3>
                      <p className="text-white/95 font-elegant text-lg">
                        Découvrez les dernières nouvelles, événements et publications de la BNRM
                      </p>
                    </CardContent>
                  </Card>

                  {/* Carte Patrimoine avec zellige */}
                  <Card className="relative overflow-hidden group border-3 border-coral/50 shadow-elegant hover:shadow-zellige transition-all duration-700">
                    <div className="absolute inset-0 bg-pattern-embroidery opacity-20 group-hover:opacity-35 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-accent opacity-90"></div>
                    <CardContent className="p-8 min-h-[250px] flex flex-col justify-center items-center text-center space-y-5 relative z-10">
                      <div className="relative">
                        <div className="w-20 h-20 bg-coral/95 rounded-3xl flex items-center justify-center mb-4 shadow-berber transform group-hover:scale-110 transition-all duration-500">
                          <Book className="h-10 w-10 text-white" />
                        </div>
                        <Star className="absolute -top-2 -right-2 h-6 w-6 text-gold fill-gold animate-pulse" />
                      </div>
                      <h3 className="text-xl font-moroccan font-bold text-white">
                        Explorer le Patrimoine
                      </h3>
                      <p className="text-white/95 font-elegant">
                        Collections manuscrites, fonds documentaires et trésors numériques
                      </p>
                    </CardContent>
                  </Card>

                  {/* Carte Services avec motifs traditionnels */}
                  <Card className="relative overflow-hidden group border-3 border-accent/50 shadow-berber hover:shadow-moroccan transition-all duration-700">
                    <div className="absolute inset-0 bg-pattern-berber-complex opacity-20 group-hover:opacity-35 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-sunset opacity-90"></div>
                    <CardContent className="p-8 min-h-[250px] flex flex-col justify-center items-center text-center space-y-5 relative z-10">
                      <div className="relative">
                        <div className="w-20 h-20 bg-royal/95 rounded-3xl flex items-center justify-center mb-4 shadow-royal transform group-hover:scale-110 transition-all duration-500">
                          <Users className="h-10 w-10 text-white" />
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-pulse" />
                      </div>
                      <h3 className="text-xl font-moroccan font-bold text-white">
                        Accéder à nos Services
                      </h3>
                      <p className="text-white/95 font-elegant">
                        Inscription, réservation, dépôt légal et services numériques
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Services rapides avec arrière-plan artistique enrichi */}
                <Card className="relative overflow-hidden border-3 border-gold/40 shadow-moroccan">
                  <div className="absolute inset-0 bg-pattern-zellige-complex opacity-25"></div>
                  <div className="absolute inset-0 bg-gradient-subtle opacity-95"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">Services Rapides</h3>
                      <div className="w-32 h-2 bg-gradient-berber mx-auto rounded-full shadow-gold"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      {[
                        { icon: FileText, label: "Dépôt légal", color: "text-primary", bg: "bg-primary/15", border: "border-primary/30" },
                        { icon: BookOpen, label: "Réserver un ouvrage", color: "text-accent", bg: "bg-accent/15", border: "border-accent/30" },
                        { icon: Download, label: "Reproduction", color: "text-coral", bg: "bg-coral/15", border: "border-coral/30" },
                        { icon: Users, label: "Inscription", color: "text-royal", bg: "bg-royal/15", border: "border-royal/30" },
                        { icon: Calendar, label: "Événements", color: "text-gold", bg: "bg-gold/15", border: "border-gold/30" }
                      ].map((service, index) => (
                        <div key={index} className={`text-center p-5 rounded-2xl ${service.bg} hover:shadow-zellige transition-all duration-300 transform hover:scale-105 border-2 ${service.border} relative overflow-hidden group`}>
                          <div className="absolute inset-0 bg-pattern-embroidery opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <service.icon className={`h-10 w-10 ${service.color} mx-auto mb-3 relative z-10`} />
                          <p className="text-sm font-semibold text-foreground font-serif relative z-10">{service.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar avec arrière-plans artistiques enrichis */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Mon espace avec motifs traditionnels */}
                <Card className="relative overflow-hidden group border-3 border-primary/40 shadow-moroccan hover:shadow-royal transition-all duration-500">
                  <div className="absolute inset-0 bg-pattern-embroidery opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-subtle opacity-90"></div>
                  <CardContent className="p-5 text-center relative z-10">
                    <div className="w-16 h-16 bg-gradient-berber rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-berber transform group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-moroccan font-bold text-foreground mb-3">Mon Espace</h4>
                    <Button size="sm" className="w-full bg-gradient-primary shadow-gold hover:shadow-moroccan font-serif">
                      Connexion
                    </Button>
                  </CardContent>
                </Card>

                {/* Cartes suivantes avec différents motifs */}
                {[
                  { title: "Aide & Support", subtitle: "FAQ, règlements, contacts", icon: MousePointer, gradient: "bg-gradient-accent", pattern: "bg-pattern-berber-complex", border: "border-accent/40", shadow: "shadow-elegant hover:shadow-zellige" },
                  { title: "Services numériques", subtitle: "Catalogue, reproduction", icon: Download, gradient: "bg-gradient-sunset", pattern: "bg-pattern-metal-engraving", border: "border-gold/40", shadow: "shadow-gold hover:shadow-moroccan" },
                  { title: "Langues", subtitle: "", icon: Globe, gradient: "bg-coral/20", pattern: "bg-pattern-embroidery", border: "border-coral/40", shadow: "shadow-berber hover:shadow-gold" },
                  { title: "Accessibilité", subtitle: "Options d'accessibilité", icon: Accessibility, gradient: "bg-royal/20", pattern: "bg-pattern-berber-complex", border: "border-royal/40", shadow: "shadow-royal hover:shadow-moroccan" },
                  { title: "Partager", subtitle: "Réseaux sociaux", icon: Share2, gradient: "bg-highlight/20", pattern: "bg-pattern-metal-engraving", border: "border-highlight/40", shadow: "shadow-elegant hover:shadow-gold" }
                ].map((item, index) => (
                  <Card key={index} className={`relative overflow-hidden group border-3 ${item.border} ${item.shadow} transition-all duration-500`}>
                    <div className={`absolute inset-0 ${item.pattern} opacity-15 group-hover:opacity-25 transition-opacity duration-500`}></div>
                    <div className={`absolute inset-0 ${item.gradient} opacity-90`}></div>
                    <CardContent className="p-5 text-center relative z-10">
                      <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-elegant transform group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-8 w-8 text-foreground" />
                      </div>
                      <h4 className="font-moroccan font-bold text-foreground mb-2">{item.title}</h4>
                      {item.subtitle && <p className="text-xs text-muted-foreground font-serif">{item.subtitle}</p>}
                      {item.title === "Langues" && (
                        <div className="flex flex-wrap gap-2 justify-center mt-3">
                          <span className="text-xs px-3 py-1 bg-primary/20 rounded-full text-primary border border-primary/30 font-serif">FR</span>
                          <span className="text-xs px-3 py-1 bg-accent/20 rounded-full text-accent border border-accent/30 font-arabic">AR</span>
                          <span className="text-xs px-3 py-1 bg-coral/20 rounded-full text-coral border border-coral/30 font-serif">EN</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Chatbot avec arrière-plan bibliothèque et ornements */}
                <Card className="relative overflow-hidden border-3 border-gold/50 shadow-royal">
                  <div className="absolute inset-0 bg-pattern-embroidery opacity-25"></div>
                  <div className="absolute inset-0 bg-gradient-berber opacity-95"></div>
                  <CardContent className="p-8 text-center min-h-[160px] flex flex-col justify-center relative z-10">
                    <div className="relative mx-auto mb-6">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-gold border-2 border-white/30">
                        <MousePointer className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center border-2 border-white/50">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h4 className="font-moroccan font-bold mb-3 text-white text-lg">Assistant Intelligent</h4>
                    <p className="text-sm text-white/95 font-elegant">
                      Assistance personnalisée pour vos recherches
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Index;
