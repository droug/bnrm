import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BNPageHeader } from "@/components/digital-library/shared";
import { Icon } from "@iconify/react";

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
      icon: "mdi:script-text-outline",
    },
    {
      id: 2,
      title: "Exposition virtuelle : Le Maroc à travers les âges",
      date: "2025-01-10",
      category: "Exposition",
      views: "2,890",
      excerpt: "Une exposition virtuelle interactive présentant l'histoire du Maroc à travers documents rares et photographies historiques.",
      icon: "mdi:rotate-3d-variant",
    },
    {
      id: 3,
      title: "Dépôt légal : Bilan 2024",
      date: "2025-01-05",
      category: "Dépôt légal",
      views: "567",
      excerpt: "Statistiques et analyse du dépôt légal pour l'année 2024 : 15,340 documents déposés.",
      icon: "mdi:chart-bar",
    },
    {
      id: 4,
      title: "Partenariat avec la Bibliothèque Nationale de France",
      date: "2024-12-20",
      category: "Partenariat",
      views: "3,456",
      excerpt: "Signature d'un accord de coopération pour la numérisation et l'échange de collections patrimoniales.",
      icon: "mdi:handshake-outline",
    },
    {
      id: 5,
      title: "Formation : Catalogage Dublin Core et MARC21",
      date: "2024-12-15",
      category: "Formation",
      views: "789",
      excerpt: "Session de formation destinée aux bibliothécaires sur les standards de catalogage international.",
      icon: "mdi:school-outline",
    },
    {
      id: 6,
      title: "Mise à jour : Nouveau moteur de recherche avancée",
      date: "2024-12-10",
      category: "Technologie",
      views: "4,123",
      excerpt: "Amélioration de notre moteur de recherche avec auto-complétion et filtres intelligents.",
      icon: "mdi:magnify",
    },
  ];

  const getCategoryStyles = (category: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      "Nouvelle collection": { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/20" },
      "Exposition": { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/20" },
      "Dépôt légal": { bg: "bg-green-500/10", text: "text-green-700", border: "border-green-500/20" },
      "Partenariat": { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/20" },
      "Formation": { bg: "bg-pink-500/10", text: "text-pink-700", border: "border-pink-500/20" },
      "Technologie": { bg: "bg-cyan-500/10", text: "text-cyan-700", border: "border-cyan-500/20" },
    };
    return styles[category] || { bg: "bg-gray-500/10", text: "text-gray-700", border: "border-gray-500/20" };
  };

  return (
    <DigitalLibraryLayout>
      <BNPageHeader
        title="Actualités & Événements"
        subtitle="Restez informé des dernières nouvelles et événements de la bibliothèque numérique"
        icon="mdi:newspaper-variant-outline"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => {
            const categoryStyle = getCategoryStyles(item.category);
            return (
              <Card
                key={item.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate(`/digital-library/news/${item.id}`)}
              >
                <CardHeader className="pb-3">
                  {/* Image placeholder with gradient */}
                  <div className="aspect-video bg-gradient-to-br from-bn-blue-primary/20 via-gold-bn-primary/10 to-bn-blue-primary/10 rounded-xl mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Icon icon={item.icon} className="h-12 w-12 text-bn-blue-primary/60" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} font-medium`}>
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <CardTitle className="text-lg group-hover:text-bn-blue-primary transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-sm">
                    {item.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {item.views} vues
                    </span>
                    <span className="text-bn-blue-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Lire la suite
                      <Icon icon="mdi:arrow-right" className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
