import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CBNSearchWithSelection } from "@/components/cbn/CBNSearchWithSelection";
import { BookReservationDialog } from "@/components/cbn/BookReservationDialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

  const handleSelectDocument = (doc: SelectedDocument) => {
    setSelectedDocument(doc);
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Réserver un ouvrage</h1>
          <p className="text-muted-foreground">
            Recherchez et réservez un ouvrage du catalogue de la Bibliothèque Nationale (CBN)
          </p>
        </div>

        <CBNSearchWithSelection
          onSelectDocument={handleSelectDocument}
          selectedDocumentId={selectedDocument?.id}
        />

        {selectedDocument && (
          <Card className="mt-6 border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Document sélectionné</CardTitle>
              <CardDescription>
                Vérifiez les informations avant de réserver
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

              <Button
                onClick={handleOpenReservation}
                className="w-full"
                size="lg"
              >
                Continuer vers la réservation
              </Button>
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
      </main>
      <Footer />
    </div>
  );
}
