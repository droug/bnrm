import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Share2, 
  Lock, 
  ArrowLeft,
  HelpCircle,
  Video,
  FileText,
  Bookmark,
  ZoomIn,
  Printer,
  Mail,
  Users,
  Shield,
  PlayCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ManuscriptsHelp() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const tutorialSteps = [
    {
      icon: Search,
      title: "Recherche de manuscrits",
      description: "Utilisez la barre de recherche pour trouver des manuscrits par titre, auteur ou mots-clés.",
      steps: [
        "Saisissez votre requête dans la barre de recherche principale",
        "Utilisez les filtres avancés pour affiner vos résultats",
        "Cliquez sur 'Rechercher' pour lancer la recherche"
      ],
      difficulty: "Débutant",
      duration: "2 min"
    },
    {
      icon: Filter,
      title: "Filtres avancés",
      description: "Affinez vos recherches avec les filtres par langue, période, genre, etc.",
      steps: [
        "Cliquez sur 'Filtres avancés' en haut de la page",
        "Sélectionnez la langue souhaitée (Arabe, Français, Berbère, Latin)",
        "Choisissez une période historique",
        "Filtrez par genre littéraire ou matériau",
        "Cliquez sur 'Appliquer les filtres'"
      ],
      difficulty: "Intermédiaire",
      duration: "3 min"
    },
    {
      icon: Eye,
      title: "Consultation de manuscrits",
      description: "Accédez et visualisez les manuscrits numérisés.",
      steps: [
        "Cliquez sur 'Consulter' sur la carte du manuscrit",
        "Utilisez les contrôles de navigation (page précédente/suivante)",
        "Ajustez le zoom avec les boutons + et -",
        "Basculez entre vue simple et double page",
        "Utilisez la rotation si nécessaire"
      ],
      difficulty: "Débutant",
      duration: "5 min"
    },
    {
      icon: Bookmark,
      title: "Marque-pages",
      description: "Sauvegardez vos pages favorites pour un accès rapide.",
      steps: [
        "Ouvrez le manuscrit souhaité",
        "Naviguez jusqu'à la page à marquer",
        "Cliquez sur l'icône de marque-page",
        "Ajoutez une note optionnelle",
        "Accédez à vos marque-pages dans le panneau latéral"
      ],
      difficulty: "Débutant",
      duration: "2 min"
    },
    {
      icon: Download,
      title: "Téléchargement",
      description: "Téléchargez les manuscrits disponibles selon vos droits d'accès.",
      steps: [
        "Vérifiez que le manuscrit autorise le téléchargement",
        "Cliquez sur le bouton 'Télécharger'",
        "Choisissez le format souhaité (PDF, Images)",
        "Attendez la génération du fichier",
        "Le téléchargement démarre automatiquement"
      ],
      difficulty: "Débutant",
      duration: "3 min"
    },
    {
      icon: Share2,
      title: "Partage",
      description: "Partagez des manuscrits avec d'autres utilisateurs.",
      steps: [
        "Ouvrez le manuscrit à partager",
        "Cliquez sur le bouton 'Partager'",
        "Choisissez le mode de partage (lien, email, réseaux sociaux)",
        "Copiez le lien ou envoyez par email",
        "Le destinataire pourra accéder selon ses droits"
      ],
      difficulty: "Intermédiaire",
      duration: "2 min"
    }
  ];

  const faqItems = [
    {
      question: "Comment accéder aux manuscrits restreints ?",
      answer: "Les manuscrits restreints nécessitent une inscription et une approbation. Connectez-vous à votre compte et demandez un abonnement chercheur ou adhérent. Les administrateurs examineront votre demande sous 48h."
    },
    {
      question: "Puis-je télécharger tous les manuscrits ?",
      answer: "Le téléchargement dépend des droits d'accès et des restrictions de copyright. Les manuscrits publics peuvent généralement être téléchargés, tandis que les manuscrits restreints nécessitent des permissions spécifiques."
    },
    {
      question: "Comment rechercher dans le contenu d'un manuscrit ?",
      answer: "Pour les manuscrits avec OCR (reconnaissance de texte), utilisez la fonction de recherche dans le document. Cliquez sur l'icône de recherche dans le lecteur et saisissez votre requête."
    },
    {
      question: "Que faire si un manuscrit ne s'affiche pas correctement ?",
      answer: "Vérifiez votre connexion internet, actualisez la page, ou essayez un autre navigateur. Si le problème persiste, contactez le support technique avec le numéro du manuscrit."
    },
    {
      question: "Comment demander une reproduction haute qualité ?",
      answer: "Utilisez le bouton 'Demande de reproduction' sur la page du manuscrit. Remplissez le formulaire en précisant vos besoins (format, résolution, pages). Un devis vous sera communiqué."
    },
    {
      question: "Les manuscrits peuvent-ils être utilisés à des fins commerciales ?",
      answer: "Cela dépend des conditions d'utilisation de chaque manuscrit. Consultez les informations de copyright et contactez les administrateurs pour toute utilisation commerciale."
    },
    {
      question: "Comment devenir institution partenaire ?",
      answer: "Cliquez sur 'Devenir Partenaire' sur la page d'accueil des manuscrits. Remplissez le formulaire de demande de partenariat avec les informations de votre institution. Notre équipe vous contactera pour discuter de la collaboration."
    }
  ];

  const videoTutorials = [
    {
      title: "Introduction à la plateforme des manuscrits",
      duration: "5:30",
      thumbnail: "🎬",
      description: "Vue d'ensemble de la plateforme et de ses fonctionnalités principales"
    },
    {
      title: "Recherche avancée de manuscrits",
      duration: "8:15",
      thumbnail: "🔍",
      description: "Maîtrisez les techniques de recherche et les filtres avancés"
    },
    {
      title: "Utilisation du lecteur de manuscrits",
      duration: "6:45",
      thumbnail: "📖",
      description: "Apprenez à naviguer et utiliser tous les outils du lecteur"
    },
    {
      title: "Gestion de vos favoris et marque-pages",
      duration: "4:20",
      thumbnail: "⭐",
      description: "Organisez votre bibliothèque personnelle de manuscrits"
    }
  ];

  const glossary = [
    {
      term: "Manuscrit",
      definition: "Document écrit à la main, généralement ancien, conservé pour sa valeur historique ou culturelle."
    },
    {
      term: "Numérisation",
      definition: "Processus de conversion d'un document physique en format numérique pour consultation et préservation."
    },
    {
      term: "OCR",
      definition: "Reconnaissance Optique de Caractères - technologie permettant de convertir des images de texte en texte éditable."
    },
    {
      term: "Cote",
      definition: "Identifiant unique attribué à un manuscrit dans le système de catalogage."
    },
    {
      term: "Parchemin",
      definition: "Support d'écriture fait de peau animale, couramment utilisé au Moyen Âge."
    },
    {
      term: "Enluminure",
      definition: "Décoration peinte ornant certains manuscrits, souvent en or et en couleurs."
    },
    {
      term: "Folio",
      definition: "Feuille d'un manuscrit, comptant généralement recto et verso."
    },
    {
      term: "Copiste",
      definition: "Personne qui copiait les textes à la main avant l'invention de l'imprimerie."
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/manuscripts')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux manuscrits
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-moroccan font-bold text-foreground">
                Centre d'Aide - Manuscrits Numérisés
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Guides, tutoriels et réponses pour utiliser efficacement la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans l'aide (ex: comment télécharger un manuscrit)"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <Tabs defaultValue="tutorials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tutoriels
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="glossary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Glossaire
            </TabsTrigger>
          </TabsList>

          {/* Tutoriels pas à pas */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {tutorialSteps.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <tutorial.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                          <CardDescription>{tutorial.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline">{tutorial.difficulty}</Badge>
                      <Badge variant="secondary">⏱️ {tutorial.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-3">Étapes :</h4>
                    <ol className="space-y-2">
                      {tutorial.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tutoriels vidéo */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {videoTutorials.map((video, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="relative mb-4 aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                      <div className="text-6xl">{video.thumbnail}</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription>{video.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        <Video className="h-3 w-3 mr-1" />
                        {video.duration}
                      </Badge>
                      <Button size="sm">
                        Voir la vidéo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Chaîne YouTube officielle</CardTitle>
                <CardDescription>
                  Retrouvez tous nos tutoriels et actualités sur notre chaîne YouTube
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Visiter la chaîne YouTube
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune question ne correspond à votre recherche.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Vous ne trouvez pas de réponse ?
                </CardTitle>
                <CardDescription>
                  Notre équipe est là pour vous aider
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link to="/help">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Centre d'aide général
                  </Link>
                </Button>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Glossaire */}
          <TabsContent value="glossary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Glossaire des termes manuscrits</CardTitle>
                <CardDescription>
                  Comprendre le vocabulaire spécialisé des manuscrits anciens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {glossary.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <h4 className="font-bold text-lg mb-2 text-primary">
                        {item.term}
                      </h4>
                      <p className="text-muted-foreground">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Accès rapide aux ressources */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>Ressources supplémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Guide utilisateur PDF</div>
                  <div className="text-xs text-muted-foreground">Documentation complète</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Users className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Forum communauté</div>
                  <div className="text-xs text-muted-foreground">Échangez avec d'autres utilisateurs</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Politique d'accès</div>
                  <div className="text-xs text-muted-foreground">Comprendre les niveaux d'accès</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
