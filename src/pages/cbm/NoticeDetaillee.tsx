import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookReservationDialog } from "@/components/cbn/BookReservationDialog";
import { BookOpen, Calendar, MapPin, Library, User, Hash, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentData {
  id: string;
  title: string;
  author: string;
  year: string;
  publisher: string;
  pages?: number;
  isbn?: string;
  cote: string;
  supportType: string;
  supportStatus: "numerise" | "non_numerise" | "libre_acces";
  isFreeAccess: boolean;
  allowPhysicalConsultation?: boolean;
  description: string;
}

export default function NoticeDetaillee() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);

  useEffect(() => {
    // Récupérer les données du document depuis l'état de navigation ou charger depuis l'API
    if (location.state?.document) {
      const doc = location.state.document;
      setDocumentData({
        ...doc,
        pages: doc.pages || 342,
        isbn: doc.isbn || "978-9954-123-456-7",
        allowPhysicalConsultation: doc.allowPhysicalConsultation ?? true
      });
    } else {
      // Ici, vous chargerez les données depuis votre API
      // Pour l'instant, on utilise des données d'exemple
      setDocumentData({
        id: id || "DOC-2024-001",
        title: "Histoire de la littérature marocaine moderne",
        author: "Ahmed Ben Mohammed",
        year: "2023",
        publisher: "Éditions Atlas",
        pages: 342,
        isbn: "978-9954-123-456-7",
        cote: "840.MAR.BEN",
        supportType: "Livre",
        supportStatus: "numerise",
        isFreeAccess: false,
        allowPhysicalConsultation: true,
        description: "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne, de l'indépendance à nos jours. Il analyse les principaux courants littéraires, les auteurs majeurs et les thèmes récurrents qui caractérisent cette période riche en productions.",
      });
    }
  }, [id, location.state]);

  const handleOpenReservation = () => {
    if (!documentData) return;

    // Si c'est un document libre d'accès, rediriger directement
    if (documentData.isFreeAccess) {
      window.open("/digital-library", "_blank");
      toast.success("Redirection vers la Bibliothèque Numérique", {
        description: "Ce document est en libre accès"
      });
      return;
    }
    setIsReservationOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: documentData?.title,
        text: `${documentData?.title} - ${documentData?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  if (!documentData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Chargement...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/cbm/catalogue")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au catalogue
        </Button>

        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Catalogue Bibliographique National</span>
            <span>/</span>
            <span>Notice détaillée</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Notice bibliographique</h1>
        </div>

        {/* Carte principale de la notice */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{documentData.title}</CardTitle>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{documentData.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{documentData.year}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {documentData.isFreeAccess ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Libre accès
                  </Badge>
                ) : documentData.supportStatus === "numerise" ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Numérisé
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Non numérisé
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {documentData.description}
              </p>
            </div>

            {/* Détails bibliographiques */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold border-b pb-2">Détails bibliographiques</h3>
                
                <div className="flex items-start gap-2">
                  <Library className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Éditeur</p>
                    <p className="text-sm text-muted-foreground">{documentData.publisher}</p>
                  </div>
                </div>

                {documentData.pages && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Pages</p>
                      <p className="text-sm text-muted-foreground">{documentData.pages} pages</p>
                    </div>
                  </div>
                )}

                {documentData.isbn && (
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">ISBN</p>
                      <p className="text-sm text-muted-foreground">{documentData.isbn}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold border-b pb-2">Localisation</h3>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Cote</p>
                    <p className="text-sm text-muted-foreground">{documentData.cote}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Library className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Type de support</p>
                    <p className="text-sm text-muted-foreground">{documentData.supportType}</p>
                  </div>
                </div>

                {documentData.allowPhysicalConsultation && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-success mt-1" />
                    <div>
                      <p className="text-sm font-medium text-success">Consultation physique</p>
                      <p className="text-sm text-muted-foreground">Autorisée sur place</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={handleOpenReservation}
                  className="flex-1 sm:flex-none"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {documentData.isFreeAccess ? "Accéder à l'ouvrage" : "Réserver cet ouvrage"}
                </Button>
                
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
              
              {documentData.isFreeAccess && (
                <p className="mt-3 text-sm text-muted-foreground">
                  ℹ️ Ce document est en libre accès. Vous pouvez y accéder directement.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Informations sur la réservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Les réservations sont traitées dans un délai de 48 heures ouvrables</p>
            <p>• La consultation physique se fait uniquement sur rendez-vous</p>
            <p>• Les documents numérisés sont accessibles depuis votre espace personnel</p>
            <p>• Pour toute question, contactez le service de référence</p>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Dialogue de réservation */}
      <BookReservationDialog
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        documentId={documentData.id}
        documentTitle={documentData.title}
        documentAuthor={documentData.author}
        documentYear={documentData.year}
        supportType={documentData.supportType}
        supportStatus={documentData.supportStatus}
        isFreeAccess={documentData.isFreeAccess}
        allowPhysicalConsultation={documentData.allowPhysicalConsultation}
        onReserve={() => {
          toast.success("Réservation effectuée avec succès");
        }}
      />
    </div>
  );
}
