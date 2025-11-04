import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { generateArticleSchema } from "@/utils/seoUtils";

export default function NewsDetails() {
  const { newsId } = useParams();
  const navigate = useNavigate();

  const newsItem = {
    id: parseInt(newsId || "1"),
    title: "Nouvelle collection de manuscrits andalous numérisés",
    date: "2025-01-15",
    category: "Nouvelle collection",
    author: "Direction de la BNRM",
    content: "La Bibliothèque Nationale annonce la mise en ligne d'une nouvelle collection de 150 manuscrits andalous...",
  };

  return (
    <DigitalLibraryLayout>
      <SEOHead
        title={newsItem.title}
        description={newsItem.content}
        keywords={["actualités BNRM", "nouvelles bibliothèque", newsItem.category, "événements culturels"]}
        ogType="article"
        structuredData={generateArticleSchema({
          title: newsItem.title,
          description: newsItem.content,
          author: newsItem.author,
          datePublished: newsItem.date,
        })}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/digital-library/news")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <article>
          <div className="mb-8">
            <Badge className="mb-4">{newsItem.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{newsItem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(newsItem.date).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">{newsItem.content}</p>
            </CardContent>
          </Card>
        </article>
      </div>
    </DigitalLibraryLayout>
  );
}
