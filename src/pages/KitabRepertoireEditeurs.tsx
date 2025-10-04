import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Book, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const KitabRepertoireEditeurs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - à remplacer par des vraies données depuis Supabase
  const editeurs = [
    {
      id: 1,
      nom: "Éditions Al Maarif",
      ville: "Rabat",
      email: "contact@almaarif.ma",
      telephone: "+212 5 37 XX XX XX",
      nombrePublications: 245,
      specialites: ["Littérature", "Sciences Humaines"],
    },
    {
      id: 2,
      nom: "Dar Al Kitab",
      ville: "Casablanca",
      email: "info@daralkitab.ma",
      telephone: "+212 5 22 XX XX XX",
      nombrePublications: 189,
      specialites: ["Poésie", "Romans"],
    },
    {
      id: 3,
      nom: "Maison de la Culture",
      ville: "Fès",
      email: "contact@maisonculture.ma",
      telephone: "+212 5 35 XX XX XX",
      nombrePublications: 156,
      specialites: ["Histoire", "Patrimoine"],
    },
  ];

  const filteredEditeurs = editeurs.filter(editeur =>
    editeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editeur.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--kitab-accent))]/5 to-background">
      <KitabHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--kitab-primary))]/10 border border-[hsl(var(--kitab-primary))]/20 mb-4">
            <Building2 className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">Programme Kitab BNRM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-accent))] bg-clip-text text-transparent">
            Répertoire des Éditeurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tous les éditeurs ayant rejoint le programme Kitab de la BNRM
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            type="search"
            placeholder="Rechercher un éditeur par nom ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-lg"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">{editeurs.length}</div>
              <div className="text-sm text-muted-foreground">Éditeurs Inscrits</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {editeurs.reduce((acc, e) => acc + e.nombrePublications, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Publications Totales</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {new Set(editeurs.map(e => e.ville)).size}
              </div>
              <div className="text-sm text-muted-foreground">Villes Représentées</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des éditeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEditeurs.map((editeur) => (
            <Card key={editeur.id} className="group hover:shadow-xl transition-all duration-300 border-[hsl(var(--kitab-primary))]/20 hover:border-[hsl(var(--kitab-primary))]/40">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-lg bg-[hsl(var(--kitab-primary))]/10 group-hover:bg-[hsl(var(--kitab-primary))]/20 transition-colors">
                    <Building2 className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">
                    {editeur.nombrePublications} publications
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-[hsl(var(--kitab-primary))] transition-colors">
                  {editeur.nom}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {editeur.ville}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {editeur.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {editeur.telephone}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editeur.specialites.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--kitab-accent))]/20 text-[hsl(var(--kitab-accent))]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                
                <Button className="w-full bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/90 gap-2">
                  <Book className="h-4 w-4" />
                  Voir les publications
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEditeurs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Aucun éditeur trouvé</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default KitabRepertoireEditeurs;