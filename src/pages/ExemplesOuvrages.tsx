import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockDocuments } from "@/data/mockDocuments";
import { BookOpen, Eye } from "lucide-react";

export default function ExemplesOuvrages() {
  const navigate = useNavigate();

  const handleViewNotice = (docId: string) => {
    const document = mockDocuments.find(doc => doc.id === docId);
    navigate(`/cbm/notice/${docId}`, { state: { document } });
  };

  const getStatusBadge = (doc: typeof mockDocuments[0]) => {
    if (doc.isFreeAccess) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          🟢 Libre accès
        </Badge>
      );
    }
    if (doc.supportStatus === "numerise") {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          🟠 Accès restreint
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
        🔴 Consultation physique
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Exemples d'ouvrages</h1>
          <p className="text-muted-foreground text-lg">
            Cette page présente différents types d'ouvrages avec leurs statuts de disponibilité et de consultation.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{mockDocuments.filter(d => d.isFreeAccess).length}</p>
                <p className="text-sm text-muted-foreground mt-1">Ouvrages en libre accès</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{mockDocuments.filter(d => d.supportStatus === "numerise" && !d.isFreeAccess).length}</p>
                <p className="text-sm text-muted-foreground mt-1">Ouvrages numérisés (accès restreint)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{mockDocuments.filter(d => d.supportStatus === "non_numerise").length}</p>
                <p className="text-sm text-muted-foreground mt-1">Ouvrages non numérisés</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des ouvrages */}
        <div className="space-y-4">
          {mockDocuments.map((doc, index) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Badge variant="secondary">{doc.supportType}</Badge>
                      {getStatusBadge(doc)}
                    </div>
                    <CardTitle className="text-xl mb-2">{doc.title}</CardTitle>
                    {doc.titleAr && (
                      <CardTitle className="text-lg text-muted-foreground mb-2" dir="rtl">
                        {doc.titleAr}
                      </CardTitle>
                    )}
                    <CardDescription className="text-base">
                      {doc.author} • {doc.publisher} • {doc.year}
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleViewNotice(doc.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir la notice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.summary || doc.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {doc.keywords?.slice(0, 4).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t text-sm">
                    <div>
                      <p className="font-semibold mb-1">Type de support</p>
                      <p className="text-muted-foreground">{doc.supportType}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Statut</p>
                      <p className="text-muted-foreground">
                        {doc.isFreeAccess 
                          ? "Libre accès" 
                          : doc.supportStatus === "numerise" 
                            ? "Numérisé" 
                            : "Non numérisé"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Consultation physique</p>
                      <p className="text-muted-foreground">
                        {doc.allowPhysicalConsultation ? "✅ Autorisée" : "❌ Non autorisée"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Cote</p>
                      <p className="text-muted-foreground font-mono text-xs">{doc.cote}</p>
                    </div>
                  </div>

                  {/* Description du cas d'usage */}
                  <div className="bg-muted/50 p-3 rounded-lg mt-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Cas d'usage :</strong>{" "}
                      {doc.isFreeAccess && (
                        <>Ce document est en libre accès. Les utilisateurs peuvent le consulter directement en ligne sans réservation. Le bouton "Réserver cet Ouvrage" ne s'affiche pas.</>
                      )}
                      {!doc.isFreeAccess && doc.supportStatus === "numerise" && (
                        <>Ce document est numérisé mais avec accès restreint. Une réservation est nécessaire pour la consultation numérique. {doc.allowPhysicalConsultation && "La consultation physique est également autorisée."}</>
                      )}
                      {doc.supportStatus === "non_numerise" && doc.allowPhysicalConsultation && (
                        <>Ce document n'est pas numérisé. Consultation physique uniquement à la BNRM après réservation.</>
                      )}
                      {doc.supportStatus === "non_numerise" && !doc.allowPhysicalConsultation && (
                        <>Ce document est un ouvrage rare ou précieux. Consultation uniquement sur place avec autorisation spéciale.</>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Légende */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Légende des statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-success/10 text-success border-success/20 mt-0.5">
                🟢 Libre accès
              </Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Document numérisé et accessible à tous sans réservation. Redirection directe vers la Bibliothèque Numérique.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-warning/10 text-warning border-warning/20 mt-0.5">
                🟠 Accès restreint
              </Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Document numérisé nécessitant une réservation pour consultation. Traité par la Bibliothèque Numérique.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 mt-0.5">
                🔴 Consultation physique
              </Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Document non numérisé disponible uniquement en salle de consultation. Traité par le Responsable Support.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
