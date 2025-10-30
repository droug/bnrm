import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CBNSearchWithSelection } from "@/components/cbn/CBNSearchWithSelection";
import { ReproductionRequestDialog } from "@/components/cbn/ReproductionRequestDialog";
import { FileText, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SelectedDocument {
  id: string;
  title: string;
  author?: string;
  year?: string;
  type?: string;
  cote?: string;
}

export default function DemandeReproduction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([]);
  const [showReproductionDialog, setShowReproductionDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<SelectedDocument | null>(null);

  const handleSelectDocument = (document: SelectedDocument) => {
    const isAlreadySelected = selectedDocuments.some(doc => doc.id === document.id);
    
    if (isAlreadySelected) {
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast({
        title: "Document retiré",
        description: "Le document a été retiré de votre sélection",
      });
    } else {
      setSelectedDocuments(prev => [...prev, document]);
      toast({
        title: "Document ajouté",
        description: "Le document a été ajouté à votre sélection",
      });
    }
  };

  const handleOpenReproductionDialog = (doc?: SelectedDocument) => {
    const docToRequest = doc || selectedDocuments[0];
    if (!docToRequest) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document avant de continuer",
        variant: "destructive",
      });
      return;
    }
    setCurrentDocument(docToRequest);
    setShowReproductionDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Demande de reproduction</h1>
          <p className="text-lg text-muted-foreground">
            Recherchez et demandez la reproduction de documents du catalogue CBN
          </p>
        </div>

        {/* Panier de sélection */}
        {selectedDocuments.length > 0 && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Documents sélectionnés ({selectedDocuments.length})
              </CardTitle>
              <CardDescription>
                Cliquez sur "Demander" pour chaque document à reproduire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.author && `Par ${doc.author}`}
                      {doc.author && doc.year && ' • '}
                      {doc.year}
                      {doc.cote && ` • Cote: ${doc.cote}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenReproductionDialog(doc)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Demander
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectDocument(doc)}
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedDocuments([])}
                >
                  Vider la sélection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recherche dans le catalogue CBN */}
        <CBNSearchWithSelection
          onSelectDocument={handleSelectDocument}
          selectedDocumentId={selectedDocuments[selectedDocuments.length - 1]?.id}
        />

        {/* Informations supplémentaires */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations sur la reproduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📋 Formats disponibles</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Photocopie (noir et blanc ou couleur)</li>
                <li>Numérisation (PDF, JPEG, TIFF)</li>
                <li>Microfilm</li>
                <li>Reproduction photographique haute résolution</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">⏱️ Délais</h4>
              <p className="text-muted-foreground">
                Les demandes sont traitées sous 5 à 10 jours ouvrables. Un devis vous sera communiqué avant la réalisation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">💰 Tarification</h4>
              <p className="text-muted-foreground">
                Les tarifs varient selon le type de document, le format demandé et l'usage prévu. Consultez notre grille tarifaire ou demandez un devis personnalisé.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">📧 Contact</h4>
              <p className="text-muted-foreground">
                Pour toute question : reproduction@bnrm.ma ou +212 5 37 77 18 73
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Dialog de demande de reproduction */}
      {showReproductionDialog && currentDocument && (
        <ReproductionRequestDialog
          isOpen={showReproductionDialog}
          onClose={() => {
            setShowReproductionDialog(false);
            setCurrentDocument(null);
          }}
          document={{
            id: currentDocument.id,
            title: currentDocument.title,
            author: currentDocument.author || "",
            cote: currentDocument.cote || "",
            year: currentDocument.year || "",
          }}
        />
      )}
    </div>
  );
}
