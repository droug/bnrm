import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Eye, Share2, User, Tag } from "lucide-react";

export default function NewsDetails() {
  const { newsId } = useParams();
  const navigate = useNavigate();

  // Mock news data
  const newsItem = {
    id: parseInt(newsId || "1"),
    title: "Nouvelle collection de manuscrits andalous numérisés",
    date: "2025-01-15",
    category: "Nouvelle collection",
    author: "Direction de la BNRM",
    views: "1,234",
    image: null,
    content: `
# Nouvelle collection exceptionnelle de manuscrits andalous

La Bibliothèque Nationale du Royaume du Maroc est heureuse d'annoncer la mise en ligne d'une nouvelle collection de 150 manuscrits andalous récemment numérisés, datant du XIIe au XVe siècle.

## Un patrimoine exceptionnel

Cette collection comprend des œuvres rares et précieuses qui témoignent de la richesse culturelle et scientifique d'Al-Andalus. Parmi les pièces maîtresses :

- **Manuscrits médicaux** : Traités de médecine d'Ibn Rushd (Averroès) et d'autres médecins andalous
- **Œuvres philosophiques** : Commentaires philosophiques et traductions arabes de textes grecs
- **Poésie andalouse** : Recueils de poèmes des grands poètes d'Al-Andalus
- **Traités scientifiques** : Ouvrages d'astronomie, mathématiques et optique

## Processus de numérisation

La numérisation a été réalisée selon les standards internationaux les plus stricts :

1. **Haute résolution** : Chaque page a été numérisée en 600 DPI minimum
2. **Conservation préventive** : Manipulation des manuscrits dans des conditions contrôlées
3. **Métadonnées enrichies** : Catalogage détaillé selon les normes Dublin Core et MARC21
4. **OCR multilingue** : Reconnaissance optique de caractères en arabe classique

## Accès et consultation

Ces manuscrits sont désormais accessibles gratuitement sur notre plateforme numérique. Les chercheurs et le grand public peuvent :

- Consulter les manuscrits en haute définition
- Télécharger les images pour usage académique
- Effectuer des recherches plein texte grâce à l'OCR
- Annoter et partager les références

## Collaboration internationale

Ce projet a été réalisé en partenariat avec :

- La Bibliothèque Nationale de France (BnF)
- L'Université Mohammed V de Rabat
- Le Centre d'Études Andalouses de Grenade
- L'UNESCO dans le cadre du programme Mémoire du Monde

## Prochaines étapes

D'autres collections suivront dans les prochains mois, notamment :

- Manuscrits scientifiques du Maroc médiéval (200 documents)
- Archives photographiques du protectorat (500 photographies)
- Collections de périodiques marocains historiques (50 titres)

---

**Contact** : Pour plus d'informations, contactez le service de numérisation à numerisation@bnrm.ma

**Accès direct** : [Consulter la collection](/digital-library/collections/manuscripts)
    `,
    relatedNews: [
      {
        id: 2,
        title: "Exposition virtuelle : Le Maroc à travers les âges",
        date: "2025-01-10",
        category: "Exposition",
      },
      {
        id: 3,
        title: "Partenariat avec la Bibliothèque Nationale de France",
        date: "2024-12-20",
        category: "Partenariat",
      },
    ],
  };

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/digital-library/news")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux actualités
        </Button>

        <article>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={getCategoryColor(newsItem.category)}>
                {newsItem.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(newsItem.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">
              {newsItem.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {newsItem.author}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {newsItem.views} lectures
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {newsItem.image && (
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-8 flex items-center justify-center">
              <p className="text-muted-foreground">Image de l'actualité</p>
            </div>
          )}

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-lg max-w-none">
              <div className="whitespace-pre-line">
                {newsItem.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
                  }
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                  }
                  if (paragraph.startsWith('- **')) {
                    const match = paragraph.match(/- \*\*(.*?)\*\* : (.*)/);
                    if (match) {
                      return (
                        <li key={index} className="ml-6 mb-2">
                          <strong>{match[1]}</strong> : {match[2]}
                        </li>
                      );
                    }
                  }
                  if (paragraph.startsWith('**')) {
                    return <p key={index} className="font-semibold mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</p>;
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={index} className="my-8" />;
                  }
                  if (paragraph.trim()) {
                    return <p key={index} className="mb-4">{paragraph}</p>;
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Suivre cette catégorie
            </Button>
          </div>

          {/* Related News */}
          {newsItem.relatedNews && newsItem.relatedNews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actualités similaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {newsItem.relatedNews.map((related) => (
                  <div
                    key={related.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/digital-library/news/${related.id}`)}
                  >
                    <div>
                      <h4 className="font-semibold mb-1">{related.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {related.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(related.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </article>
      </div>
    </DigitalLibraryLayout>
  );
}
