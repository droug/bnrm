import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Book, Award, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const KitabRepertoireAuteurs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - à remplacer par des vraies données depuis Supabase
  const auteurs = [
    {
      id: 1,
      nom: "Ahmed El Fassi",
      genres: ["Roman", "Nouvelle"],
      email: "a.elfassi@email.ma",
      nombrePublications: 12,
      distinctions: ["Prix Kitab 2023"],
    },
    {
      id: 2,
      nom: "Fatima Zahra Bennani",
      genres: ["Poésie", "Essai"],
      email: "fz.bennani@email.ma",
      nombrePublications: 8,
      distinctions: ["Prix de Poésie 2022"],
    },
    {
      id: 3,
      nom: "Mohamed Idrissi",
      genres: ["Histoire", "Biographie"],
      email: "m.idrissi@email.ma",
      nombrePublications: 15,
      distinctions: [],
    },
  ];

  const filteredAuteurs = auteurs.filter(auteur =>
    auteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auteur.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--kitab-accent))]/5 to-background">
      <KitabHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--kitab-primary))]/10 border border-[hsl(var(--kitab-primary))]/20 mb-4">
            <User className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">Programme Kitab BNRM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-accent))] bg-clip-text text-transparent">
            Répertoire des Auteurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tous les auteurs ayant rejoint le programme Kitab de la BNRM
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">{auteurs.length}</div>
              <div className="text-sm text-muted-foreground">Auteurs Inscrits</div>
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
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {auteurs.filter(a => a.distinctions.length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Auteurs Primés</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des auteurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuteurs.map((auteur) => (
            <Card key={auteur.id} className="group hover:shadow-xl transition-all duration-300 border-[hsl(var(--kitab-primary))]/20 hover:border-[hsl(var(--kitab-primary))]/40">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-lg bg-[hsl(var(--kitab-primary))]/10 group-hover:bg-[hsl(var(--kitab-primary))]/20 transition-colors">
                    <User className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">
                    {auteur.nombrePublications} publications
                  </span>
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
          ))}
        </div>

        {filteredAuteurs.length === 0 && (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Aucun auteur trouvé</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default KitabRepertoireAuteurs;