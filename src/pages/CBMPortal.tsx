import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Target, Users, UserPlus, Database, BookOpen, ArrowRight, Sparkles, TrendingUp, Award, Globe, BookMarked, Zap, CheckCircle2 } from "lucide-react";

export default function CBMPortal() {
  const menuCards = [
    {
      title: "Objectifs du Réseau CBM",
      description: "Découvrez les missions et objectifs du Catalogue des Bibliothèques Marocaines",
      icon: Target,
      path: "/cbm/objectifs",
      color: "from-violet-600 to-purple-600",
      badge: "Essentiel"
    },
    {
      title: "Plan d'Actions",
      description: "Étapes d'intégration et feuille de route du réseau",
      icon: Network,
      path: "/cbm/plan-actions",
      color: "from-blue-600 to-cyan-600",
      badge: "Stratégie"
    },
    {
      title: "Organes de Gestion",
      description: "Bureau CBM, Comité Actif et structure organisationnelle",
      icon: Users,
      path: "/cbm/organes-gestion",
      color: "from-emerald-600 to-teal-600",
      badge: "Gouvernance"
    },
    {
      title: "Adhésion au Réseau",
      description: "Rejoignez le réseau CBM - Formulaire et conditions",
      icon: UserPlus,
      path: "/cbm/adhesion",
      color: "from-orange-600 to-amber-600",
      badge: "Rejoindre"
    },
    {
      title: "Recherche Documentaire",
      description: "Accédez aux ressources des bibliothèques membres",
      icon: Database,
      path: "/cbm/recherche",
      color: "from-pink-600 to-rose-600",
      badge: "Catalogue"
    },
    {
      title: "Accès Rapide",
      description: "Charte, règlements, formations et connectivité",
      icon: BookOpen,
      path: "/cbm/acces-rapide",
      color: "from-indigo-600 to-blue-600",
      badge: "Ressources"
    }
  ];

  const stats = [
    { label: "Bibliothèques Membres", value: "150+", icon: BookMarked },
    { label: "Documents Catalogués", value: "2M+", icon: Database },
    { label: "Utilisateurs Actifs", value: "50K+", icon: Users },
    { label: "Taux de Satisfaction", value: "98%", icon: Award }
  ];

  const features = [
    "Recherche unifiée dans toutes les bibliothèques",
    "Partage de ressources documentaires",
    "Formations et accompagnement technique",
    "Connectivité et interopérabilité",
    "Standards internationaux (UNIMARC, Z39.50)",
    "Support et assistance continue"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Banner - Design Premium Ultra-Moderne */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">Réseau National de Coopération</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0">
                Nouveau
              </Badge>
            </div>
            
            {/* Main Title with Gradient */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Portail CBM
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-3xl md:text-4xl mb-6 font-light text-blue-100">
              Catalogue des Bibliothèques Marocaines
            </p>
            
            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/50"></div>
              <Network className="w-8 h-8 text-purple-300" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/50"></div>
            </div>
            
            {/* Description */}
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-blue-100/90 leading-relaxed font-light">
              Connectez-vous au plus grand réseau de partage de ressources documentaires 
              entre bibliothèques marocaines. Innovation, collaboration et excellence.
            </p>
            
            {/* CTA Buttons - Modern Style */}
            <div className="flex flex-wrap gap-6 justify-center mb-16">
              <Link to="/cbm/recherche">
                <Button size="lg" className="h-14 px-8 text-lg bg-white hover:bg-blue-50 text-violet-900 shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 rounded-xl group">
                  <Database className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Rechercher dans le Catalogue
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/cbm/adhesion">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 rounded-xl border-2 border-white/20">
                  <UserPlus className="w-6 h-6 mr-3" />
                  Adhérer au Réseau
                  <Zap className="w-5 h-5 ml-3" />
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                  >
                    <IconComponent className="w-8 h-8 text-purple-300 mb-3 mx-auto" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Modern Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-20">
        {/* Section Title with Animation */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 px-4 py-2 text-sm">
            Explorer le Réseau
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Accédez à Tous les Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
            Découvrez l'ensemble des fonctionnalités et ressources du Portail CBM
          </p>
        </div>

        {/* Menu Cards Grid - Premium Design */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {menuCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card 
                  className="group h-full hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white overflow-hidden hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Top Border */}
                  <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
                  
                  <CardHeader className="relative pb-6 pt-8">
                    {/* Badge */}
                    <Badge className={`absolute top-4 right-4 bg-gradient-to-r ${card.color} text-white border-0 shadow-lg`}>
                      {card.badge}
                    </Badge>
                    
                    {/* Icon with Gradient Background */}
                    <div className="relative mb-6">
                      <div 
                        className={`inline-flex h-20 w-20 rounded-2xl items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 bg-gradient-to-br ${card.color}`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <div className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity`}></div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-purple-600 transition-all">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-8">
                    <div className="flex items-center text-violet-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Découvrir</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 rounded-3xl p-12 md:p-16 mb-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-4xl font-bold text-white">
                Pourquoi Choisir CBM ?
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/15 transition-all group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center bg-gradient-to-r from-slate-100 to-blue-100 rounded-3xl p-12 md:p-16">
          <Globe className="w-16 h-16 mx-auto mb-6 text-violet-600" />
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Prêt à Rejoindre le Réseau ?
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-light">
            Rejoignez plus de 150 bibliothèques marocaines et participez à la révolution 
            du partage des connaissances.
          </p>
          <Link to="/cbm/adhesion">
            <Button size="lg" className="h-16 px-10 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 rounded-xl">
              <UserPlus className="w-6 h-6 mr-3" />
              Commencer Maintenant
              <TrendingUp className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
