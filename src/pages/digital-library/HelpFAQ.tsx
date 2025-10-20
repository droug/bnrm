import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Mail, Phone, MapPin, BookOpen, Download, Copyright, FileType } from "lucide-react";

export default function HelpFAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqSections = [
    {
      title: "Comment consulter",
      icon: BookOpen,
      questions: [
        {
          q: "Comment accéder aux documents numériques ?",
          a: "Pour consulter les documents, utilisez la barre de recherche ou parcourez nos collections par thème. Certains documents nécessitent une inscription gratuite.",
        },
        {
          q: "Puis-je lire les documents sans connexion Internet ?",
          a: "Certains documents peuvent être téléchargés pour une consultation hors ligne si vous disposez d'un compte et des droits nécessaires.",
        },
        {
          q: "Comment utiliser le lecteur de documents ?",
          a: "Le lecteur intégré permet de naviguer page par page, zoomer, rechercher du texte et ajouter des annotations (pour les utilisateurs connectés).",
        },
      ],
    },
    {
      title: "Droits d'auteur",
      icon: Copyright,
      questions: [
        {
          q: "Quels documents puis-je télécharger ?",
          a: "Les documents du domaine public ou sous licence libre sont téléchargeables. Les documents protégés nécessitent une autorisation spécifique.",
        },
        {
          q: "Puis-je utiliser ces documents pour ma recherche ?",
          a: "Oui, à condition de respecter les droits d'auteur et de citer correctement la source. Consultez nos mentions légales pour plus de détails.",
        },
        {
          q: "Comment demander une reproduction ?",
          a: "Utilisez notre formulaire de demande de reproduction. L'équipe étudiera votre demande et vous répondra sous 5 jours ouvrables.",
        },
      ],
    },
    {
      title: "Formats",
      icon: FileType,
      questions: [
        {
          q: "Quels formats de fichiers sont disponibles ?",
          a: "Nos documents sont disponibles en PDF, EPUB pour les livres, et JPEG/TIFF pour les images. Certains manuscrits sont en format IIIF.",
        },
        {
          q: "Quel logiciel pour lire les documents ?",
          a: "Les PDF s'ouvrent avec Adobe Reader ou tout lecteur PDF. Les EPUB nécessitent une application de lecture e-book (Calibre, Adobe Digital Editions).",
        },
        {
          q: "Puis-je convertir les formats ?",
          a: "Oui, mais uniquement pour usage personnel et dans le respect des droits d'auteur. Des outils comme Calibre permettent la conversion EPUB/PDF.",
        },
      ],
    },
    {
      title: "Téléchargement",
      icon: Download,
      questions: [
        {
          q: "Y a-t-il une limite de téléchargement ?",
          a: "Les utilisateurs gratuits peuvent télécharger jusqu'à 10 documents par mois. Les abonnés premium n'ont pas de limite.",
        },
        {
          q: "Combien de temps le téléchargement prend-il ?",
          a: "Cela dépend de la taille du fichier et de votre connexion. Les documents standard (10-50 Mo) prennent 1-5 minutes.",
        },
        {
          q: "Le téléchargement a échoué, que faire ?",
          a: "Vérifiez votre connexion Internet et réessayez. Si le problème persiste, contactez le support technique.",
        },
      ],
    },
  ];

  const filteredSections = searchQuery
    ? faqSections.map(section => ({
        ...section,
        questions: section.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(section => section.questions.length > 0)
    : faqSections;

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Aide & FAQ</h1>
          <p className="text-lg text-muted-foreground">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, qIndex) => (
                    <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun résultat trouvé pour "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                Effacer la recherche
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
            <CardDescription>Notre équipe est à votre disposition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <a href="mailto:support@bnrm.ma" className="text-primary hover:underline">
                  support@bnrm.ma
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Téléphone</p>
                <p className="text-muted-foreground">+212 5XX-XXXXXX</p>
                <p className="text-sm text-muted-foreground">Du lundi au vendredi, 9h-17h</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-muted-foreground">
                  Bibliothèque Nationale du Royaume du Maroc<br />
                  Avenue Ibn Batouta, Rabat, Maroc
                </p>
              </div>
            </div>

            <Button className="w-full mt-4">
              <Mail className="h-4 w-4 mr-2" />
              Nous contacter
            </Button>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
