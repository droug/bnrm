import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewsEvents() {
  const navigate = useNavigate();

  const news = [
    {
      id: 1,
      title: "Nouvelle collection de manuscrits andalous numérisés",
      date: "2025-01-15",
      category: "Nouvelle collection",
      views: "1,234",
      excerpt: "Découvrez notre dernière collection de 150 manuscrits andalous récemment numérisés, datant du XIIe au XVe siècle.",
      image: "manuscript",
    },
    {
      id: 2,
      title: "Exposition virtuelle : Le Maroc à travers les âges",
      date: "2025-01-10",
      category: "Exposition",
      views: "2,890",
      excerpt: "Une exposition virtuelle interactive présentant l'histoire du Maroc à travers documents rares et photographies historiques.",
      image: "exhibition",
    },
    {
      id: 3,
      title: "Dépôt légal : Bilan 2024",
      date: "2025-01-05",
      category: "Dépôt légal",
      views: "567",
      excerpt: "Statistiques et analyse du dépôt légal pour l'année 2024 : 15,340 documents déposés.",
      image: "stats",
    },
    {
      id: 4,
      title: "Partenariat avec la Bibliothèque Nationale de France",
      date: "2024-12-20",
      category: "Partenariat",
      views: "3,456",
      excerpt: "Signature d'un accord de coopération pour la numérisation et l'échange de collections patrimoniales.",
      image: "partnership",
    },
    {
      id: 5,
      title: "Formation : Catalogage Dublin Core et MARC21",
      date: "2024-12-15",
      category: "Formation",
      views: "789",
      excerpt: "Session de formation destinée aux bibliothécaires sur les standards de catalogage international.",
      image: "training",
    },
    {
      id: 6,
      title: "Mise à jour : Nouveau moteur de recherche avancée",
      date: "2024-12-10",
      category: "Technologie",
      views: "4,123",
      excerpt: "Amélioration de notre moteur de recherche avec auto-complétion et filtres intelligents.",
      image: "tech",
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Nouvelle collection": "bg-blue-100 text-blue-800",
      "Exposition": "bg-purple-100 text-purple-800",
      "Dépôt légal": "bg-green-100 text-green-800",
      "Partenariat": "bg-amber-100 text-amber-800",
      "Formation": "bg-pink-100 text-pink-800",
      "Technologie": "bg-cyan-100 text-cyan-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Actualités & Événements</h1>
          <p className="text-lg text-muted-foreground">
            Restez informé des dernières nouvelles et événements de la bibliothèque numérique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/digital-library/news/${item.id}`)}
            >
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-12 w-12 text-primary/40" />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {item.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.views} vues
                  </span>
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                    Lire la suite →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
