import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Search, BookOpen, MapPin, Filter, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CBMRecherche() {
  const [searchQuery, setSearchQuery] = useState("");

  const statistiques = [
    { label: "Bibliothèques connectées", value: "152", icon: MapPin, color: "cbm-primary" },
    { label: "Documents catalogués", value: "2.3M", icon: BookOpen, color: "cbm-secondary" },
    { label: "Recherches ce mois", value: "45,780", icon: Search, color: "cbm-accent" }
  ];

  const bibliothequesMembres = [
    { nom: "Bibliothèque Nationale du Royaume du Maroc", ville: "Rabat", documents: 350000 },
    { nom: "BU Hassan II Casablanca", ville: "Casablanca", documents: 280000 },
    { nom: "Médiathèque de Marrakech", ville: "Marrakech", documents: 95000 },
    { nom: "BU Mohammed V Rabat", ville: "Rabat", documents: 420000 },
    { nom: "Bibliothèque Municipale de Fès", ville: "Fès", documents: 65000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Recherche Documentaire
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Interrogez simultanément les catalogues de toutes les bibliothèques du réseau
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {statistiques.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className={`border-2 border-${stat.color}/20 bg-${stat.color}/5`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm">{stat.label}</CardDescription>
                  <IconComponent className={`h-5 w-5 text-${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search Interface */}
        <Card className="border-2 border-cbm-primary/20 shadow-cbm-strong mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-primary flex items-center gap-2">
              <Search className="h-6 w-6" />
              Recherche Fédérée
            </CardTitle>
            <CardDescription>
              Lancez une recherche dans l'ensemble des collections des bibliothèques membres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="mb-6 bg-cbm-primary/10">
                <TabsTrigger value="simple" className="data-[state=active]:bg-cbm-primary data-[state=active]:text-white">
                  Recherche Simple
                </TabsTrigger>
                <TabsTrigger value="avancee" className="data-[state=active]:bg-cbm-secondary data-[state=active]:text-white">
                  Recherche Avancée
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Titre, auteur, sujet, ISBN..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous les champs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les champs</SelectItem>
                      <SelectItem value="title">Titre</SelectItem>
                      <SelectItem value="author">Auteur</SelectItem>
                      <SelectItem value="subject">Sujet</SelectItem>
                      <SelectItem value="isbn">ISBN/ISSN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-cbm-primary hover:bg-cbm-primary/90 px-8">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-cbm-primary/10">
                    <Filter className="h-3 w-3 mr-1" /> Livres
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-cbm-primary/10">
                    <Filter className="h-3 w-3 mr-1" /> Périodiques
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-cbm-primary/10">
                    <Filter className="h-3 w-3 mr-1" /> Thèses
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-cbm-primary/10">
                    <Filter className="h-3 w-3 mr-1" /> Documents numériques
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="avancee" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titre</label>
                      <Input placeholder="Titre de l'ouvrage" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Auteur</label>
                      <Input placeholder="Nom de l'auteur" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Éditeur</label>
                      <Input placeholder="Maison d'édition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Année de publication</label>
                      <Input type="number" placeholder="AAAA" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sujet / Mots-clés</label>
                    <Input placeholder="Thématique, discipline..." />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Langue</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="ar">Arabe</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">Anglais</SelectItem>
                          <SelectItem value="es">Espagnol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de document</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="book">Livre</SelectItem>
                          <SelectItem value="periodical">Périodique</SelectItem>
                          <SelectItem value="thesis">Thèse</SelectItem>
                          <SelectItem value="digital">Numérique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bibliothèque</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {bibliothequesMembres.slice(0, 3).map((bib, i) => (
                            <SelectItem key={i} value={bib.nom}>{bib.ville}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full bg-cbm-secondary hover:bg-cbm-secondary/90">
                    <Search className="h-4 w-4 mr-2" />
                    Lancer la Recherche Avancée
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Bibliothèques Membres */}
        <Card className="border-2 border-cbm-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-cbm-secondary">Bibliothèques Membres</CardTitle>
            <CardDescription>Réseaux interrogés simultanément</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bibliothequesMembres.map((bib, index) => (
                <Card key={index} className="border border-cbm-secondary/20 hover:shadow-cbm transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-semibold line-clamp-2">{bib.nom}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {bib.ville}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documents</span>
                      <span className="font-bold text-cbm-primary">{bib.documents.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Protocol */}
        <Card className="mt-8 border-2 border-cbm-accent/20 bg-cbm-accent/5">
          <CardHeader>
            <CardTitle className="text-lg text-cbm-accent flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Protocoles Supportés
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">La plateforme CBM utilise les standards internationaux suivants :</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Z39.50</Badge>
              <Badge>SRU (Search/Retrieve via URL)</Badge>
              <Badge>OAI-PMH</Badge>
              <Badge>UNIMARC</Badge>
              <Badge>Dublin Core</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
