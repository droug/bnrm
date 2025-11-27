import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { generateArticleSchema } from "@/utils/seoUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";

export default function NewsDetails() {
  const { newsId } = useParams();
  const navigate = useNavigate();

  const newsItems: { [key: number]: any } = {
    1: {
      id: 1,
      title: "Le Roi annonce la clôture définitive du dossier du Sahara",
      date: "2025-10-31",
      category: "Actualité Royale",
      author: "H24info",
      content: `Le Roi Mohammed VI a adressé ce vendredi un Discours à Son peuple fidèle. Le Souverain a évoqué un « tournant décisif dans l'Histoire du Maroc moderne », déclarant qu'il y aura « un avant et un après 31 octobre 2025 », et consacrant la fin du conflit artificiel du Sahara par l'Initiative d'Autonomie.

Ce discours intervient en prélude aux commémorations des cinquantième anniversaire de la Marche Verte et soixante-dixième de l'Indépendance du Maroc. Le Roi a exprimé sa « satisfaction » face à la teneur de la dernière Résolution du Conseil de Sécurité. Le Souverain a affirmé que, « après cinquante ans de sacrifices, nous ouvrons un nouveau chapitre victorieux dans le processus de consécration de la Marocanité du Sahara, destiné à clore définitivement le dossier de ce conflit artificiel » par une solution consensuelle fondée sur l'Initiative d'Autonomie.

Le Roi a souligné qu'il est venu le temps du « Maroc uni qui s'étend de Tanger à Lagouira », dont « nul ne s'avisera de bafouer les droits, ni de transgresser les frontières historiques ».

## La dynamique de changement et le soutien international

Le Discours Royal a mis en lumière les « fruits » de la « dynamique de changement » impulsée ces dernières années. S.M. le Roi Mohammed VI a précisé que désormais, « les deux-tiers des Etats-membres des Nations Unies considèrent que l'Initiative d'Autonomie est le seul cadre qui vaille » pour le règlement du conflit.

Le Souverain a également salué l'élargissement de la « souveraineté économique du Royaume sur ses Provinces du Sud ». De grandes puissances économiques comme les États-Unis d'Amérique, la France, la Grande-Bretagne, la Russie, l'Espagne et l'Union Européenne ont décidé d'encourager les investissements et les échanges commerciaux avec ces provinces, permettant ainsi au Sud de s'affirmer comme un « pôle de développement et de stabilité et un axe central de l'activité économique ».

## L'autonomie comme unique base de négociation

Le Roi Mohammed VI a insisté sur l'entrée dans la « phase décisive du processus onusien », où la Résolution du Conseil de Sécurité « définit les principes et les fondements susceptibles de conduire à un règlement politique définitif de ce conflit, dans le strict respect des droits légitimes du Maroc ».

Dans le droit fil de cette Résolution, le Maroc « procèdera à l'actualisation et à la formulation détaillée de la Proposition d'Autonomie en vue d'une soumission ultérieure aux Nations Unies ». Cette proposition, en tant que « solution réaliste et applicable », devra « constituer la seule base de négociation ».

Le Souverain a remercié vivement les pays ayant soutenu cette évolution, réservant une mention spéciale aux États-Unis d'Amérique, sous le leadership du Président Donald Trump, ainsi qu'à la Grande-Bretagne, l'Espagne et la France.

## Appel au dialogue avec l'Algérie et aux frères de Tindouf

Malgré les évolutions positives, le Maroc demeure attaché à une solution qui « sauve la face de toutes les parties, sans vainqueur, ni vaincu ».

Dans un geste fort, S.M. le Roi a lancé un appel « sincère » à « Mon Frère, Son Excellence le Président Abdelmadjid Tebboune à un dialogue fraternel sincère entre le Maroc et l'Algérie » pour dépasser les différends et jeter les bases de relations nouvelles.

Le Souverain a également appelé « sincèrement nos frères dans les camps de Tindouf à saisir cette opportunité historique pour retrouver les leurs » et contribuer au développement de leur patrie dans le « giron du Maroc uni », tout en soulignant que « les Marocains, étant tous égaux, il n'y a pas de différence » entre eux.

Le Roi Mohammed VI a conclu en saluant les sacrifices consentis par les Forces Armées Royales et les Forces de sécurité, et en rendant hommage à la mémoire de Sa Majesté le Roi Hassan II, « Artisan de la Marche Verte ».`,
    },
    2: {
      id: 2,
      title: "La Directrice de la BNRM en visite à la Bibliothèque Nationale de Turquie",
      date: "2025-11-03",
      category: "Coopération Internationale",
      author: "Direction de la BNRM",
      content: `Madame Samira El Malizi la Directrice de la Bibliothèque Nationale du Royaume du Maroc a effectué, ce 3 novembre 2025, une visite officielle à la Bibliothèque Nationale de Turquie, où elle a été accueillie par Monsieur Taner BEYOĞLU, Directeur Général.

L'entretien a permis d'esquisser les fondations d'une coopération ambitieuse autour de la valorisation documentaire, de la digitalisation des fonds et du partage d'expertise.

Cette rencontre ouvre une trajectoire de collaboration durable, porteuse d'initiatives concrètes et mutuellement avantageuses entre les deux institutions nationales.

## Axes de coopération

Les discussions ont porté sur plusieurs axes stratégiques majeurs :

- La valorisation et la préservation du patrimoine documentaire
- La digitalisation des fonds historiques et manuscrits
- Le partage d'expertise technique et professionnelle
- Le développement de programmes d'échange entre les deux institutions

Cette visite s'inscrit dans la volonté de la BNRM de renforcer ses partenariats internationaux et de développer des collaborations stratégiques avec les grandes bibliothèques nationales à travers le monde.`,
    },
  };

  const newsItem = newsItems[parseInt(newsId || "1")] || {
    id: parseInt(newsId || "1"),
    title: "Article non trouvé",
    date: "2025-01-15",
    category: "Non classé",
    author: "BNRM",
    content: "Cet article n'existe pas encore.",
  };

  const handleRetour = () => {
    navigate("/");
    // Scroll vers la section actualités après un court délai pour laisser le temps à la page de charger
    setTimeout(() => {
      const newsSection = document.querySelector('[class*="NewsEventsSection"]');
      if (newsSection) {
        newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
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
          <Button variant="ghost" onClick={handleRetour} className="mb-6">
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
              <div className="prose prose-lg max-w-none">
                {newsItem.content.split('\n\n').map((paragraph: string, index: number) => {
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-primary">{paragraph.replace('## ', '')}</h2>;
                  }
                  return <p key={index} className="text-lg leading-relaxed mb-4">{paragraph}</p>;
                })}
              </div>
            </CardContent>
          </Card>
        </article>
        </div>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
