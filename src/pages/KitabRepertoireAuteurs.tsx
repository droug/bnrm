import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Book, Award, Mail, ExternalLink, Globe, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const KitabRepertoireAuteurs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Données temporaires - filtrées pour auteurs marocains uniquement
  // À remplacer par des vraies données depuis Supabase quand la table auteurs sera créée
  const auteurs = [
    // Personnes physiques
    {
      id: 1,
      nom: "Ahmed El Fassi",
      type: "physique",
      genres: ["Roman", "Nouvelle"],
      email: "a.elfassi@email.ma",
      telephone: "+212 6 12 34 56 78",
      nombrePublications: 12,
      distinctions: ["Prix Kitab 2023"],
      nationalite: "Marocaine",
    },
    {
      id: 2,
      nom: "Fatima Zahra Bennani",
      type: "physique",
      genres: ["Poésie", "Essai"],
      email: "fz.bennani@email.ma",
      telephone: "+212 6 23 45 67 89",
      nombrePublications: 8,
      distinctions: ["Prix de Poésie 2022"],
      nationalite: "Marocaine",
    },
    {
      id: 3,
      nom: "Mohamed Idrissi",
      type: "physique",
      genres: ["Histoire", "Biographie"],
      email: "m.idrissi@email.ma",
      telephone: "+212 6 34 56 78 90",
      nombrePublications: 15,
      distinctions: [],
      nationalite: "Marocaine",
    },
    {
      id: 4,
      nom: "Aicha Bouali",
      type: "physique",
      genres: ["Roman", "Littérature jeunesse"],
      email: "a.bouali@email.ma",
      telephone: "+212 6 45 67 89 01",
      nombrePublications: 6,
      distinctions: [],
      nationalite: "Marocaine",
    },
    // Personnes morales
    {
      id: 5,
      nom: "Éditions Dar Al Kitab",
      type: "morale",
      genres: ["Maison d'édition"],
      email: "contact@daralqitab.ma",
      telephone: "+212 5 22 12 34 56",
      nombrePublications: 45,
      distinctions: ["Label Qualité 2023"],
      nationalite: "Marocaine",
    },
    {
      id: 6,
      nom: "Centre Culturel Atlas",
      type: "morale",
      genres: ["Centre culturel", "Diffusion"],
      email: "info@atlasculturel.ma",
      telephone: "+212 5 24 23 45 67",
      nombrePublications: 28,
      distinctions: [],
      nationalite: "Marocaine",
    },
    {
      id: 7,
      nom: "Librairie Le Carrefour des Lettres",
      type: "morale",
      genres: ["Librairie", "Distribution"],
      email: "contact@carrefourlettres.ma",
      telephone: "+212 5 22 34 56 78",
      nombrePublications: 20,
      distinctions: [],
      nationalite: "Marocaine",
    },
  ];

  const auteursPhysiques = auteurs.filter(a => a.type === "physique");
  const auteursMorales = auteurs.filter(a => a.type === "morale");

  const filteredPhysiques = auteursPhysiques.filter(auteur =>
    auteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auteur.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMorales = auteursMorales.filter(auteur =>
    auteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auteur.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderAuthorCard = (auteur: typeof auteurs[0], showPhone: boolean = true) => (
    <Card key={auteur.id} className="group hover:shadow-xl transition-all duration-300 border-[hsl(var(--kitab-primary))]/20 hover:border-[hsl(var(--kitab-primary))]/40">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-3 rounded-lg bg-[hsl(var(--kitab-primary))]/10 group-hover:bg-[hsl(var(--kitab-primary))]/20 transition-colors">
            {auteur.type === "morale" ? (
              <Building2 className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
            ) : (
              <User className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {auteur.nationalite}
            </span>
            {auteur.type === "morale" && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Personne morale
              </span>
            )}
            <span className="text-xs font-medium text-[hsl(var(--kitab-primary))]">
              {auteur.nombrePublications} publications
            </span>
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-[hsl(var(--kitab-primary))] transition-colors">
          {auteur.nom}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {auteur.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {auteur.genres.map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--kitab-accent))]/20 text-[hsl(var(--kitab-accent))]"
            >
              {genre}
            </span>
          ))}
        </div>
        
        {showPhone && auteur.telephone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {auteur.telephone}
          </div>
        )}
        
        {auteur.distinctions.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4 text-[hsl(var(--kitab-primary))] mt-0.5" />
            <div className="flex flex-col gap-1">
              {auteur.distinctions.map((dist, index) => (
                <span key={index}>{dist}</span>
              ))}
            </div>
          </div>
        )}
        
        <Button className="w-full bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/90 gap-2">
          <Book className="h-4 w-4" />
          Voir les publications
          <ExternalLink className="h-4 w-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--kitab-accent))]/5 to-background">
      <KitabHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--kitab-primary))]/10 border border-[hsl(var(--kitab-primary))]/20 mb-4">
            <Globe className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">Nationalité Marocaine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-accent))] bg-clip-text text-transparent">
            Répertoire des Auteurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Auteurs marocains du programme Kitab de la BNRM
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            type="search"
            placeholder="Rechercher un auteur par nom ou genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-lg"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">{auteurs.length}</div>
              <div className="text-sm text-muted-foreground">Total Inscrits</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--kitab-primary))]" />
              <div className="text-lg font-semibold text-[hsl(var(--kitab-primary))] mb-1">{auteursPhysiques.length}</div>
              <div className="text-sm text-muted-foreground">Personnes Physiques</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--kitab-primary))]" />
              <div className="text-lg font-semibold text-[hsl(var(--kitab-primary))] mb-1">{auteursMorales.length}</div>
              <div className="text-sm text-muted-foreground">Personnes Morales</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {auteurs.reduce((acc, a) => acc + a.nombrePublications, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Publications Totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets pour séparer personnes physiques et morales */}
        <Tabs defaultValue="physiques" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="physiques" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personnes Physiques ({auteursPhysiques.length})
            </TabsTrigger>
            <TabsTrigger value="morales" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Personnes Morales ({auteursMorales.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="physiques">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhysiques.map((auteur) => renderAuthorCard(auteur, false))}
            </div>
            {filteredPhysiques.length === 0 && (
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Aucune personne physique trouvée</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="morales">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMorales.map((auteur) => renderAuthorCard(auteur, true))}
            </div>
            {filteredMorales.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Aucune personne morale trouvée</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default KitabRepertoireAuteurs;