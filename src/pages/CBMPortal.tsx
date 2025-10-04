import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Target, Users, UserPlus, Database, FileText, BookOpen, Shield } from "lucide-react";

export default function CBMPortal() {
  const menuCards = [
    {
      title: "Objectifs du Réseau CBM",
      description: "Découvrez les missions et objectifs du Catalogue des Bibliothèques Marocaines",
      icon: Target,
      path: "/cbm/objectifs",
      color: "cbm-primary"
    },
    {
      title: "Plan d'Actions",
      description: "Étapes d'intégration et feuille de route du réseau",
      icon: Network,
      path: "/cbm/plan-actions",
      color: "cbm-secondary"
    },
    {
      title: "Organes de Gestion",
      description: "Bureau CBM, Comité Actif et structure organisationnelle",
      icon: Users,
      path: "/cbm/organes-gestion",
      color: "cbm-accent"
    },
    {
      title: "Adhésion au Réseau",
      description: "Rejoignez le réseau CBM - Formulaire et conditions",
      icon: UserPlus,
      path: "/cbm/adhesion",
      color: "cbm-primary"
    },
    {
      title: "Recherche Documentaire",
      description: "Accédez aux ressources des bibliothèques membres",
      icon: Database,
      path: "/cbm/recherche",
      color: "cbm-secondary"
    },
    {
      title: "Accès Rapide",
      description: "Charte, règlements, formations et connectivité",
      icon: BookOpen,
      path: "/cbm/acces-rapide",
      color: "cbm-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section CBM */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent p-12 mb-12 text-white shadow-cbm-strong">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'var(--pattern-cbm-network)' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Network className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Portail CBM
                </h1>
                <p className="text-xl opacity-90">
                  Catalogue des Bibliothèques Marocaines
                </p>
              </div>
            </div>
            <p className="text-lg max-w-3xl opacity-90">
              Réseau national de coopération et de partage des ressources documentaires entre bibliothèques marocaines
            </p>
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card className="group h-full hover:shadow-cbm-strong transition-all duration-300 cursor-pointer border-2 hover:border-cbm-accent/40 overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
                  />
                  <CardHeader className="relative">
                    <div 
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${card.color} to-${card.color}/70 flex items-center justify-center mb-4 shadow-cbm group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-cbm-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-cbm-primary group-hover:bg-cbm-primary/10"
                    >
                      En savoir plus →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-cbm-primary/20 bg-cbm-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-cbm-primary">150+</CardTitle>
              <CardDescription>Bibliothèques membres</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-cbm-secondary/20 bg-cbm-secondary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-cbm-secondary">2M+</CardTitle>
              <CardDescription>Documents catalogués</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-cbm-accent/20 bg-cbm-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-cbm-accent">24/7</CardTitle>
              <CardDescription>Accès aux ressources</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
