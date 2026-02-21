import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ServicePageBackground } from "@/components/ServicePageBackground";
import { CBNSearchWithSelection } from "@/components/cbn/CBNSearchWithSelection";
import { BookReservationDialog } from "@/components/cbn/BookReservationDialog";
import { AvailabilityCalendar } from "@/components/cbn/AvailabilityCalendar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SelectedDocument {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  year?: string;
  type?: string;
  status?: string;
  cote?: string;
}

export default function BookReservationService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Nettoyer les résultats de recherche sauvegardés au démontage
  useEffect(() => {
    return () => {
      // Ne nettoyer que si on quitte vraiment la page (pas juste pour voir les détails)
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/cbn/notice/')) {
        sessionStorage.removeItem('cbn_search_results');
      }
    };
  }, []);

  const handleSelectDocument = (doc: SelectedDocument) => {
    setSelectedDocument(doc);
    // Scroller automatiquement vers la carte du document sélectionné
    setTimeout(() => {
      selectedCardRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleOpenReservation = () => {
    if (selectedDocument) {
      setShowReservationDialog(true);
    }
  };

  const handleReservationComplete = () => {
    setShowReservationDialog(false);
    setSelectedDocument(null);
    navigate("/user/book-reservations");
  };

  // Déterminer le statut du support
  const getSupportStatus = (status?: string): "numerise" | "non_numerise" | "libre_acces" => {
    if (status === "Libre accès") return "libre_acces";
    if (status === "Consultation sur place") return "non_numerise";
    return "numerise";
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ServicePageBackground />
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Réserver un document</h1>
          <p className="text-muted-foreground">
            Recherchez et réservez un document du catalogue de la Bibliothèque Nationale (CBN)
          </p>
        </div>

        <CBNSearchWithSelection
          onSelectDocument={handleSelectDocument}
          selectedDocumentId={selectedDocument?.id}
        />

        {selectedDocument && (
          <Card 
            ref={selectedCardRef}
            className="mt-6 border-2 border-primary shadow-lg animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
          >
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Document sélectionné
              </CardTitle>
              <CardDescription>
                Vérifiez les informations et consultez la disponibilité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedDocument.title}</h3>
                {selectedDocument.author && (
                  <p className="text-sm text-muted-foreground">Auteur: {selectedDocument.author}</p>
                )}
                {selectedDocument.publisher && (
                  <p className="text-sm text-muted-foreground">Éditeur: {selectedDocument.publisher}</p>
                )}
                {selectedDocument.year && (
                  <p className="text-sm text-muted-foreground">Année: {selectedDocument.year}</p>
                )}
                {selectedDocument.cote && (
                  <p className="text-sm text-muted-foreground">Cote: {selectedDocument.cote}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAvailabilityDialog(true)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Disponibilité
                </Button>
                <Button
                  onClick={handleOpenReservation}
                  className="flex-1"
                  size="lg"
                >
                  Continuer vers la réservation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showReservationDialog && selectedDocument && (
          <BookReservationDialog
            isOpen={showReservationDialog}
            onClose={() => setShowReservationDialog(false)}
            documentId={selectedDocument.id}
            documentTitle={selectedDocument.title}
            documentAuthor={selectedDocument.author}
            documentYear={selectedDocument.year}
            supportType={selectedDocument.type || "Livre"}
            supportStatus={getSupportStatus(selectedDocument.status)}
            onReserve={handleReservationComplete}
          />
        )}

        {showAvailabilityDialog && selectedDocument && (
          <AvailabilityCalendar
            isOpen={showAvailabilityDialog}
            onClose={() => setShowAvailabilityDialog(false)}
            documentId={selectedDocument.id}
            documentTitle={selectedDocument.title}
          />
        )}
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  );
}
