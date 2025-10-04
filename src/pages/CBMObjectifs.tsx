import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Globe, BookOpen, Users, Zap, Shield } from "lucide-react";

export default function CBMObjectifs() {
  const objectifs = [
    {
      icon: Globe,
      title: "Mutualisation des Ressources",
      description: "Partager les collections et ressources documentaires entre bibliothèques membres pour enrichir l'offre accessible aux usagers"
    },
    {
      icon: BookOpen,
      title: "Catalogue Collectif National",
      description: "Créer et maintenir un catalogue unifié permettant la recherche simultanée dans toutes les bibliothèques du réseau"
    },
    {
      icon: Users,
      title: "Coopération Interinstitutionnelle",
      description: "Faciliter les échanges, prêts entre bibliothèques et collaborations entre institutions partenaires"
    },
    {
      icon: Zap,
      title: "Normalisation des Pratiques",
      description: "Harmoniser les standards de catalogage, de conservation et de services selon les normes internationales"
    },
    {
      icon: Shield,
      title: "Préservation du Patrimoine",
      description: "Protéger et valoriser le patrimoine documentaire marocain à travers la numérisation et l'archivage"
    },
    {
      icon: Target,
      title: "Accessibilité Universelle",
      description: "Démocratiser l'accès à l'information et au savoir pour tous les citoyens marocains"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-primary-dark flex items-center justify-center shadow-cbm">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Objectifs du Réseau CBM
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Vision et mission du Catalogue des Bibliothèques Marocaines
              </p>
            </div>
          </div>
        </div>

        {/* Vision Statement */}
        <Card className="mb-12 border-2 border-cbm-primary/20 bg-gradient-to-br from-cbm-primary/5 to-cbm-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-primary">Notre Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-lg leading-relaxed">
            <p className="mb-4">
              Le Réseau CBM aspire à devenir le pilier central de la coopération bibliothéconomique au Maroc, 
              en créant un écosystème documentaire national intégré, accessible et durable.
            </p>
            <p>
              Notre ambition est de transformer l'accès au savoir et à l'information en fédérant les forces 
              vives des bibliothèques marocaines autour de valeurs communes : partage, excellence et innovation.
            </p>
          </CardContent>
        </Card>

        {/* Objectifs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objectifs.map((obj, index) => {
            const IconComponent = obj.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-cbm-strong transition-all duration-300 border-2 hover:border-cbm-accent/40"
              >
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center mb-4 shadow-cbm group-hover:scale-110 transition-transform">
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-cbm-primary transition-colors">
                    {obj.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {obj.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Impact Section */}
        <Card className="mt-12 border-2 border-cbm-secondary/20 bg-cbm-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-secondary">Impact Attendu</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-cbm-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">✓</span>
                <span>Réduction des coûts d'acquisition grâce au prêt entre bibliothèques</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-cbm-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">✓</span>
                <span>Amélioration de la qualité des services documentaires au niveau national</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-cbm-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">✓</span>
                <span>Renforcement des compétences professionnelles des bibliothécaires</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-cbm-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">✓</span>
                <span>Valorisation internationale du patrimoine documentaire marocain</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
