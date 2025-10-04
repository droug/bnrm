import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Book, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const KitabRepertoireDistributeurs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - à remplacer par des vraies données depuis Supabase
  const distributeurs = [
    {
      id: 1,
      nom: "Distribution Culturelle Marocaine",
      ville: "Casablanca",
      email: "contact@dcm.ma",
      telephone: "+212 5 22 XX XX XX",
      nombrePublications: 450,
      zones: ["Grand Casablanca", "Rabat-Salé"],
    },
    {
      id: 2,
      nom: "Librairie du Maroc",
      ville: "Rabat",
      email: "info@librairiedumaroc.ma",
      telephone: "+212 5 37 XX XX XX",
      nombrePublications: 380,
      zones: ["Rabat-Salé", "Kenitra"],
    },
    {
      id: 3,
      nom: "Diffusion Sud",
      ville: "Marrakech",
      email: "contact@diffusionsud.ma",
      telephone: "+212 5 24 XX XX XX",
      nombrePublications: 290,
      zones: ["Marrakech", "Agadir", "Essaouira"],
    },
  ];

  const filteredDistributeurs = distributeurs.filter(dist =>
    dist.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dist.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--kitab-accent))]/5 to-background">
      <KitabHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--kitab-primary))]/10 border border-[hsl(var(--kitab-primary))]/20 mb-4">
            <Truck className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">Programme Kitab BNRM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-accent))] bg-clip-text text-transparent">
            Répertoire des Distributeurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tous les distributeurs ayant rejoint le programme Kitab de la BNRM
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            type="search"
            placeholder="Rechercher un distributeur par nom ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-lg"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">{distributeurs.length}</div>
              <div className="text-sm text-muted-foreground">Distributeurs Inscrits</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {distributeurs.reduce((acc, d) => acc + d.nombrePublications, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Publications Distribuées</div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--kitab-primary))]/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                {new Set(distributeurs.flatMap(d => d.zones)).size}
              </div>
              <div className="text-sm text-muted-foreground">Zones de Distribution</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des distributeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistributeurs.map((distributeur) => (
            <Card key={distributeur.id} className="group hover:shadow-xl transition-all duration-300 border-[hsl(var(--kitab-primary))]/20 hover:border-[hsl(var(--kitab-primary))]/40">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-lg bg-[hsl(var(--kitab-primary))]/10 group-hover:bg-[hsl(var(--kitab-primary))]/20 transition-colors">
                    <Truck className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">
                    {distributeur.nombrePublications} publications
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-[hsl(var(--kitab-primary))] transition-colors">
                  {distributeur.nom}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {distributeur.ville}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {distributeur.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {distributeur.telephone}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {distributeur.zones.map((zone, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--kitab-accent))]/20 text-[hsl(var(--kitab-accent))]"
                    >
                      {zone}
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

        {filteredDistributeurs.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Aucun distributeur trouvé</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default KitabRepertoireDistributeurs;