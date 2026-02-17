import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Briefcase, Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const offresEmploi = [
  {
    id: 1,
    titre: "Bibliothécaire spécialisé(e) en catalogage",
    departement: "Département du traitement documentaire",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2026-02-12",
    dateLimite: "2026-03-20",
    statut: "ouvert",
    description: "La BNRM recrute un(e) bibliothécaire spécialisé(e) en catalogage UNIMARC et gestion des fonds documentaires.",
  },
  {
    id: 2,
    titre: "Ingénieur(e) en systèmes d'information",
    departement: "Direction des systèmes d'information",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2026-02-08",
    dateLimite: "2026-03-15",
    statut: "ouvert",
    description: "Poste d'ingénieur SI pour la gestion et l'évolution du système intégré de gestion de bibliothèque (SIGB).",
  },
  {
    id: 3,
    titre: "Chargé(e) de communication digitale",
    departement: "Service communication",
    lieu: "Rabat",
    type: "CDD",
    datePublication: "2026-01-20",
    dateLimite: "2026-02-28",
    statut: "ouvert",
    description: "Animation des réseaux sociaux, création de contenu digital et gestion de la communication en ligne de la BNRM.",
  },
  {
    id: 4,
    titre: "Restaurateur(trice) de documents anciens",
    departement: "Département de la conservation",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2025-12-01",
    dateLimite: "2026-01-10",
    statut: "clos",
    description: "Restauration et conservation de manuscrits, ouvrages rares et documents patrimoniaux.",
  },
];

export default function Recrutement() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("tous");

  const filtered = offresEmploi.filter((offre) => {
    const matchSearch = offre.titre.toLowerCase().includes(search.toLowerCase()) || offre.departement.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "tous" || offre.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Recrutement</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Rejoignez l'équipe de la Bibliothèque Nationale du Royaume du Maroc. Découvrez nos offres d'emploi et de stage.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par poste ou département..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.map((offre) => (
              <Card key={offre.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{offre.titre}</CardTitle>
                      <CardDescription>{offre.departement}</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant="outline">{offre.type}</Badge>
                      <Badge variant={offre.statut === "ouvert" ? "default" : "secondary"}>
                        {offre.statut === "ouvert" ? "Ouvert" : "Clos"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground">{offre.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{offre.lieu}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Publié le {new Date(offre.datePublication).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Date limite : {new Date(offre.dateLimite).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  {offre.statut === "ouvert" && (
                    <Button size="sm" variant="outline" className="mt-2 gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      Postuler
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune offre d'emploi trouvée.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <GlobalAccessibilityTools />
    </div>
  );
}
