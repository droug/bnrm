import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Download, Eye, Filter, ArrowLeft } from "lucide-react";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/simple-select";
import SEOHead from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import mosaicBanner from "@/assets/kitab-banner-mosaic-gradient.jpeg";

interface RapportEdition {
  id: string;
  title: string;
  year: number;
  language: string;
  pages: number;
  size: string;
  pdfUrl: string;
}

export default function KitabRapportsEdition() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  // Données d'exemple
  const rapports: RapportEdition[] = [
    {
      id: "1",
      title: "Rapport d'édition 2024 - État de l'édition marocaine",
      year: 2024,
      language: "Français",
      pages: 128,
      size: "4.2 MB",
      pdfUrl: "#"
    },
    {
      id: "2",
      title: "تقرير النشر 2024 - حالة النشر المغربي",
      year: 2024,
      language: "العربية",
      pages: 135,
      size: "4.5 MB",
      pdfUrl: "#"
    },
    {
      id: "3",
      title: "Rapport d'édition 2023 - Analyse du marché du livre",
      year: 2023,
      language: "Français",
      pages: 115,
      size: "3.8 MB",
      pdfUrl: "#"
    },
    {
      id: "4",
      title: "تقرير النشر 2023 - تحليل سوق الكتاب",
      year: 2023,
      language: "العربية",
      pages: 120,
      size: "4.0 MB",
      pdfUrl: "#"
    },
    {
      id: "5",
      title: "Rapport d'édition 2022 - Production éditoriale nationale",
      year: 2022,
      language: "Français",
      pages: 98,
      size: "3.2 MB",
      pdfUrl: "#"
    },
    {
      id: "6",
      title: "تقرير النشر 2022 - الإنتاج التحريري الوطني",
      year: 2022,
      language: "العربية",
      pages: 105,
      size: "3.5 MB",
      pdfUrl: "#"
    },
    {
      id: "7",
      title: "Rapport d'édition 2021 - Tendances et perspectives",
      year: 2021,
      language: "Français",
      pages: 92,
      size: "3.0 MB",
      pdfUrl: "#"
    },
    {
      id: "8",
      title: "Publishing Report 2023 - Moroccan Publishing Overview",
      year: 2023,
      language: "English",
      pages: 110,
      size: "3.7 MB",
      pdfUrl: "#"
    }
  ];

  // Options pour les filtres
  const years = ["all", ...Array.from(new Set(rapports.map(r => r.year.toString()))).sort().reverse()];
  const languages = ["all", ...Array.from(new Set(rapports.map(r => r.language)))];

  // Filtrage des rapports
  const filteredRapports = rapports.filter(rapport => {
    const yearMatch = selectedYear === "all" || rapport.year.toString() === selectedYear;
    const languageMatch = selectedLanguage === "all" || rapport.language === selectedLanguage;
    return yearMatch && languageMatch;
  });

  const handleVisualize = (rapport: RapportEdition) => {
    console.log("Visualiser:", rapport.title);
    // TODO: Ouvrir le PDF dans une visionneuse
  };

  const handleDownload = (rapport: RapportEdition) => {
    console.log("Télécharger:", rapport.title);
    // TODO: Déclencher le téléchargement
  };

  return (
    <>
      <SEOHead
        title="Rapports d'édition - Kitab"
        description="Consultez et téléchargez les rapports d'édition annuels sur l'état du secteur éditorial marocain. Analyses statistiques, tendances et perspectives du marché du livre au Maroc."
        keywords={["rapports édition maroc", "statistiques livre maroc", "édition marocaine", "marché du livre", "production éditoriale"]}
      />
      
      <div className="min-h-screen bg-background">
        <KitabHeader />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden h-[400px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={mosaicBanner} 
              alt="Mosaïque Marocaine" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/70 via-[hsl(var(--kitab-primary-dark))]/60 to-[hsl(var(--kitab-secondary))]/70"></div>
          
          <div className="container mx-auto px-4 relative z-10 h-full flex items-start pt-16">
            <div className="w-full">
              <Link to="/kitab">
                <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour au Portail Kitab
                </Button>
              </Link>
              
              <div className="max-w-4xl mx-auto text-center">
                <FileText className="w-16 h-16 text-white mx-auto mb-6" />
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Rapports d'Édition
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Analyses et statistiques annuelles du secteur éditorial marocain
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filtres Section */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Filter className="w-5 h-5 text-[hsl(var(--kitab-primary))]" />
                  <span>Filtrer par :</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <SimpleSelect
                      label=""
                      placeholder="Toutes les années"
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={[
                        { value: "all", label: "Toutes les années" },
                        ...years.filter(y => y !== "all").map(year => ({
                          value: year,
                          label: year
                        }))
                      ]}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <SimpleSelect
                      label=""
                      placeholder="Toutes les langues"
                      value={selectedLanguage}
                      onChange={setSelectedLanguage}
                      options={[
                        { value: "all", label: "Toutes les langues" },
                        ...languages.filter(l => l !== "all").map(lang => ({
                          value: lang,
                          label: lang
                        }))
                      ]}
                    />
                  </div>
                </div>

                {(selectedYear !== "all" || selectedLanguage !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedYear("all");
                      setSelectedLanguage("all");
                    }}
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Liste des Rapports */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Liste des Rapports d'Édition
                </h2>
                <p className="text-muted-foreground">
                  {filteredRapports.length} rapport(s) disponible(s)
                </p>
              </div>

              {filteredRapports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">
                      Aucun rapport trouvé avec les filtres sélectionnés
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredRapports.map((rapport) => (
                    <Card key={rapport.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <FileText className="w-6 h-6 text-[hsl(var(--kitab-primary))] flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  {rapport.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="bg-[hsl(var(--kitab-primary))]/10 text-[hsl(var(--kitab-primary))]">
                                    {rapport.year}
                                  </Badge>
                                  <Badge variant="outline">
                                    {rapport.language}
                                  </Badge>
                                  <Badge variant="outline">
                                    {rapport.pages} pages
                                  </Badge>
                                  <Badge variant="outline">
                                    {rapport.size}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVisualize(rapport)}
                              className="border-[hsl(var(--kitab-primary))]/40 hover:bg-[hsl(var(--kitab-primary))]/10"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Visualiser
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(rapport)}
                              className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section informative */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-[hsl(var(--kitab-primary))]">
                    À propos des Rapports d'Édition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Les rapports d'édition annuels offrent une analyse approfondie du secteur éditorial marocain. 
                    Ils comprennent des statistiques détaillées sur la production éditoriale, les tendances du marché, 
                    et les perspectives du livre au Maroc.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-background rounded-lg border">
                      <h4 className="font-semibold text-foreground mb-2">Contenu des rapports</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Statistiques de production</li>
                        <li>• Analyse par genre littéraire</li>
                        <li>• Tendances du marché</li>
                        <li>• Répartition géographique</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <h4 className="font-semibold text-foreground mb-2">Formats disponibles</h4>
                      <ul className="text-sm space-y-1">
                        <li>• PDF téléchargeable</li>
                        <li>• Visualisation en ligne</li>
                        <li>• Données statistiques</li>
                        <li>• Graphiques et tableaux</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
