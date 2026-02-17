import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import depotLegalBg from "@/assets/depot-legal-bg.jpg";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, ExternalLink, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const appelsOffres = [
  {
    id: 1,
    titre: "Acquisition de matériel informatique pour la salle de lecture",
    reference: "AO-BNRM-2026-001",
    datePublication: "2026-02-10",
    dateLimite: "2026-03-15",
    statut: "ouvert",
    categorie: "Fournitures",
    description: "La BNRM lance un appel d'offres pour l'acquisition de matériel informatique destiné à équiper la salle de lecture numérique.",
  },
  {
    id: 2,
    titre: "Travaux de rénovation de l'espace d'exposition",
    reference: "AO-BNRM-2026-002",
    datePublication: "2026-02-05",
    dateLimite: "2026-03-10",
    statut: "ouvert",
    categorie: "Travaux",
    description: "Rénovation et aménagement de l'espace d'exposition permanente de la Bibliothèque Nationale.",
  },
  {
    id: 3,
    titre: "Prestation de numérisation de fonds anciens",
    reference: "AO-BNRM-2025-045",
    datePublication: "2025-12-01",
    dateLimite: "2026-01-15",
    statut: "clos",
    categorie: "Services",
    description: "Numérisation haute résolution de manuscrits et ouvrages rares du fonds patrimonial.",
  },
  {
    id: 4,
    titre: "Fourniture de mobilier pour les salles de consultation",
    reference: "AO-BNRM-2025-040",
    datePublication: "2025-11-15",
    dateLimite: "2025-12-20",
    statut: "clos",
    categorie: "Fournitures",
    description: "Acquisition de mobilier ergonomique pour les salles de consultation de la BNRM.",
  },
];

export default function AppelsOffres() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");

  const filtered = appelsOffres.filter((ao) => {
    const matchSearch = ao.titre.toLowerCase().includes(search.toLowerCase()) || ao.reference.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || ao.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${depotLegalBg})` }} />
      <div className="fixed inset-0 z-0 bg-background/50" />
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Appels d'offres</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Consultez les marchés publics et appels d'offres de la Bibliothèque Nationale du Royaume du Maroc.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou référence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="ouvert">Ouverts</SelectItem>
                <SelectItem value="clos">Clos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.map((ao) => (
              <Card key={ao.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ao.titre}</CardTitle>
                      <CardDescription className="text-xs font-mono">{ao.reference}</CardDescription>
                    </div>
                    <Badge variant={ao.statut === "ouvert" ? "default" : "secondary"}>
                      {ao.statut === "ouvert" ? "Ouvert" : "Clos"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground">{ao.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Publié le {new Date(ao.datePublication).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Date limite : {new Date(ao.dateLimite).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{ao.categorie}</Badge>
                  </div>
                  {ao.statut === "ouvert" && (
                    <Button size="sm" variant="outline" className="mt-2 gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Consulter le dossier
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun appel d'offres trouvé.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <div className="relative z-10"><Footer /></div>
      <GlobalAccessibilityTools />
    </div>
  );
}
