import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, GraduationCap, Network, Download, ExternalLink } from "lucide-react";

export default function CBMAccesRapide() {
  const documents = [
    {
      categorie: "Documents Officiels",
      icon: FileText,
      color: "cbm-primary",
      items: [
        { titre: "Charte du Réseau CBM", taille: "850 KB", format: "PDF" },
        { titre: "Règlement Intérieur", taille: "1.2 MB", format: "PDF" },
        { titre: "Convention d'Adhésion (Modèle)", taille: "450 KB", format: "PDF" },
        { titre: "Procédures de Catalogage", taille: "2.1 MB", format: "PDF" }
      ]
    },
    {
      categorie: "Formations",
      icon: GraduationCap,
      color: "cbm-secondary",
      items: [
        { titre: "Guide UNIMARC - Niveau débutant", taille: "3.5 MB", format: "PDF" },
        { titre: "Formation RDA (Ressources)", taille: "5.2 MB", format: "ZIP" },
        { titre: "Tutoriel Z39.50 Configuration", taille: "1.8 MB", format: "PDF" },
        { titre: "Webinaire Qualité des Métadonnées", taille: "45 MB", format: "MP4" }
      ]
    },
    {
      categorie: "Connectivité Technique",
      icon: Network,
      color: "cbm-accent",
      items: [
        { titre: "Guide de Connexion SRU/Z39.50", taille: "980 KB", format: "PDF" },
        { titre: "Configuration OAI-PMH", taille: "650 KB", format: "PDF" },
        { titre: "Paramètres Serveur CBM", taille: "120 KB", format: "TXT" },
        { titre: "Documentation API REST", taille: "2.4 MB", format: "PDF" }
      ]
    }
  ];

  const lienesUtiles = [
    { titre: "IFLA - Normes Bibliographiques", url: "https://www.ifla.org" },
    { titre: "Transition Bibliographique (France)", url: "https://www.transition-bibliographique.fr" },
    { titre: "Library of Congress - Standards", url: "https://www.loc.gov/standards" },
    { titre: "OCLC WorldCat", url: "https://www.worldcat.org" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-accent flex items-center justify-center shadow-cbm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Accès Rapide
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Ressources essentielles, formations et documentation technique
              </p>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="space-y-8 mb-12">
          {documents.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className={`border-2 border-${section.color}/20`}>
                <CardHeader>
                  <CardTitle className={`text-2xl text-${section.color} flex items-center gap-3`}>
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${section.color} to-${section.color}/70 flex items-center justify-center shadow-cbm`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    {section.categorie}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {section.items.map((doc, i) => (
                      <Card key={i} className={`border border-${section.color}/20 hover:shadow-cbm transition-all group cursor-pointer`}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-semibold group-hover:text-cbm-primary transition-colors">
                              {doc.titre}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {doc.format} • {doc.taille}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`w-full justify-start text-${section.color} hover:bg-${section.color}/10`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Liens Utiles */}
        <Card className="border-2 border-cbm-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-primary flex items-center gap-2">
              <ExternalLink className="h-6 w-6" />
              Liens Utiles
            </CardTitle>
            <CardDescription>Ressources externes et références internationales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {lienesUtiles.map((lien, index) => (
                <a 
                  key={index} 
                  href={lien.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-cbm-primary/5 hover:border-cbm-primary/40 transition-all group"
                >
                  <span className="font-medium group-hover:text-cbm-primary transition-colors">
                    {lien.titre}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-cbm-primary transition-colors" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Contact */}
        <Card className="mt-8 border-2 border-cbm-secondary/20 bg-cbm-secondary/5">
          <CardHeader>
            <CardTitle className="text-xl text-cbm-secondary">Besoin d'Assistance ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Pour toute question technique ou demande de support, contactez l'équipe CBM :</p>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold min-w-24">Email :</span>
                <span className="text-cbm-primary">support@cbm.ma</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold min-w-24">Téléphone :</span>
                <span>+212 5XX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold min-w-24">Horaires :</span>
                <span>Lun-Ven 9h-17h</span>
              </div>
            </div>
            <Button className="bg-cbm-secondary hover:bg-cbm-secondary/90">
              Ouvrir un Ticket de Support
            </Button>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
