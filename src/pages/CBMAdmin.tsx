import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, FileText, Database, ArrowRight } from "lucide-react";

export default function CBMAdmin() {
  const adminCards = [
    {
      title: "Gestion Demandes Adhérants",
      description: "Consulter et traiter les demandes d'adhésion au réseau CBM et au catalogue collectif",
      icon: Users,
      path: "/cbm/admin/adhesions",
      gradient: "from-primary/90 to-primary",
      count: "En attente"
    },
    {
      title: "Configuration Réseau",
      description: "Paramètres et configuration du réseau CBM",
      icon: Settings,
      path: "/cbm/admin/settings",
      gradient: "from-secondary/90 to-secondary"
    },
    {
      title: "Gestion Catalogue",
      description: "Administration du catalogue collectif national",
      icon: Database,
      path: "/cbm/admin/catalogue",
      gradient: "from-accent/90 to-accent"
    },
    {
      title: "Rapports & Statistiques",
      description: "Analyses et rapports d'activité du réseau",
      icon: FileText,
      path: "/cbm/admin/reports",
      gradient: "from-cbm-primary/90 to-cbm-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Administration CBM
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Tableau de bord d'administration du réseau
              </p>
            </div>
          </div>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card className="group h-full hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden border-2 border-cbm-primary/20">
                  {/* Icon Header with Gradient */}
                  <div className={`bg-gradient-to-br ${card.gradient} h-32 flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10"></div>
                    <IconComponent className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                  
                  <CardHeader className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-semibold group-hover:text-cbm-primary transition-colors">
                        {card.title}
                      </CardTitle>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-cbm-primary group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                    {card.count && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-cbm-primary/10 text-cbm-primary rounded-full text-xs font-medium">
                        {card.count}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
