import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Newspaper, Video, FolderOpen } from "lucide-react";
import { ServicePageBackground } from "@/components/ServicePageBackground";

export default function LegalDepositTypes() {
  const navigate = useNavigate();

  const depositTypes = [
    {
      id: "books",
      title: "Livres",
      titleAr: "الكتب",
      description: "Dépôt légal des livres et publications imprimées",
      descriptionAr: "الإيداع القانوني للكتب والمنشورات المطبوعة",
      icon: Book,
      route: "/depot-legal/livres",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
    },
    {
      id: "periodicals",
      title: "Périodiques",
      titleAr: "الدوريات",
      description: "Dépôt légal des journaux, magazines et revues",
      descriptionAr: "الإيداع القانوني للصحف والمجلات والدوريات",
      icon: Newspaper,
      route: "/depot-legal/periodiques",
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      id: "audiovisual",
      title: "Audio-visuel & Logiciels",
      titleAr: "السمعي البصري والبرمجيات",
      description: "Dépôt légal des documents audiovisuels et logiciels",
      descriptionAr: "الإيداع القانوني للوثائق السمعية البصرية والبرمجيات",
      icon: Video,
      route: "/depot-legal/audiovisuel",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950",
    },
    {
      id: "specialized",
      title: "Collections Spécialisées",
      titleAr: "المجموعات المتخصصة",
      description: "Dépôt légal des collections spécialisées et documents rares",
      descriptionAr: "الإيداع القانوني للمجموعات المتخصصة والوثائق النادرة",
      icon: FolderOpen,
      route: "/depot-legal/collections-specialisees",
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <ServicePageBackground />
      <Header />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Dépôt Légal
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choisissez le type de document que vous souhaitez déposer
            </p>
          </div>

          {/* Grille des types de dépôt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {depositTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary"
                  onClick={() => navigate(type.route)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-lg ${type.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {type.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {type.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Cliquez pour accéder au formulaire
                      </span>
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informations complémentaires */}
          <Card className="mt-12 border-primary/20">
            <CardHeader>
              <CardTitle>Informations importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Le dépôt légal est obligatoire pour tous les documents édités ou produits au Maroc
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Vous devez effectuer votre dépôt dans les 30 jours suivant la publication
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Un numéro de dépôt légal vous sera attribué après validation de votre demande
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Pour toute question, contactez notre service de dépôt légal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
