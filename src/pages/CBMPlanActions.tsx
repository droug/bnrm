import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, CheckCircle2, Circle, Clock } from "lucide-react";

export default function CBMPlanActions() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Évaluation et Préparation",
      status: "completed",
      duration: "3 mois",
      etapes: [
        "Audit des systèmes bibliothéconomiques existants",
        "Définition des standards et normes de catalogage",
        "Formation des équipes techniques",
        "Mise en place de l'infrastructure réseau"
      ]
    },
    {
      phase: "Phase 2",
      title: "Intégration Technique",
      status: "in-progress",
      duration: "6 mois",
      etapes: [
        "Configuration des connecteurs Z39.50/SRU",
        "Synchronisation des bases de données",
        "Tests de compatibilité entre SIGB",
        "Migration progressive des données"
      ]
    },
    {
      phase: "Phase 3",
      title: "Déploiement et Formation",
      status: "upcoming",
      duration: "4 mois",
      etapes: [
        "Formation des bibliothécaires membres",
        "Documentation et guides d'utilisation",
        "Support technique dédié",
        "Évaluation des procédures"
      ]
    },
    {
      phase: "Phase 4",
      title: "Optimisation Continue",
      status: "upcoming",
      duration: "Permanent",
      etapes: [
        "Analyse des statistiques d'usage",
        "Amélioration des performances",
        "Extension du réseau à de nouveaux membres",
        "Innovation et développement de nouveaux services"
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-cbm-secondary" />;
      case "in-progress":
        return <Clock className="h-6 w-6 text-cbm-accent animate-pulse" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed":
        return "border-cbm-secondary/40 bg-cbm-secondary/5";
      case "in-progress":
        return "border-cbm-accent/40 bg-cbm-accent/5";
      default:
        return "border-border";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <Network className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Plan d'Actions du Réseau CBM
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Feuille de route et étapes d'intégration des bibliothèques
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cbm-primary via-cbm-secondary to-cbm-accent hidden md:block" />
          
          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-8 -translate-x-1/2 hidden md:block">
                  <div className="h-4 w-4 rounded-full bg-white border-4 border-cbm-primary shadow-cbm" />
                </div>

                <Card className={`md:ml-20 border-2 ${getStatusColor(phase.status)} hover:shadow-cbm-strong transition-all duration-300`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(phase.status)}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-cbm-primary bg-cbm-primary/10 px-3 py-1 rounded-full">
                              {phase.phase}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {phase.duration}
                            </span>
                          </div>
                          <CardTitle className="text-2xl">{phase.title}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {phase.etapes.map((etape, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-2 w-2 rounded-full bg-cbm-accent mt-2 flex-shrink-0" />
                          <span className="text-sm">{etape}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Success Factors */}
        <Card className="mt-12 border-2 border-cbm-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-primary">Facteurs Clés de Succès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-cbm-secondary">Engagement institutionnel</h3>
                <p className="text-sm text-muted-foreground">
                  Soutien actif des directions des bibliothèques et allocation des ressources nécessaires
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-cbm-secondary">Formation continue</h3>
                <p className="text-sm text-muted-foreground">
                  Montée en compétences des équipes sur les outils et procédures du réseau
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-cbm-secondary">Standardisation</h3>
                <p className="text-sm text-muted-foreground">
                  Respect strict des normes de catalogage et d'échange de données
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-cbm-secondary">Communication</h3>
                <p className="text-sm text-muted-foreground">
                  Coordination régulière entre les membres et partage des bonnes pratiques
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
