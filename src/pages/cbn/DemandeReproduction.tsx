import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ServicePageBackground } from "@/components/ServicePageBackground";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CBNSearchWithSelection } from "@/components/cbn/CBNSearchWithSelection";
import { ReproductionRequestDialog } from "@/components/cbn/ReproductionRequestDialog";
import { UnifiedDocumentSearch } from "@/components/reproduction/UnifiedDocumentSearch";
import { FileText, ShoppingCart, ArrowLeft, BookOpen, Info, Search, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDocument } from "@/hooks/useUnifiedDocumentIndex";

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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([]);
  const [showReproductionDialog, setShowReproductionDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<SelectedDocument | null>(null);
  const [prefilledDocument, setPrefilledDocument] = useState<SelectedDocument | null>(null);

  // Déterminer si on utilise le layout BN
  const platform = searchParams.get('platform');
  const isBNPlatform = platform === 'bn';

  // Récupérer les paramètres de l'URL (documentId et documentTitle)
  const documentIdFromUrl = searchParams.get('documentId');
  const documentTitleFromUrl = searchParams.get('documentTitle');

  // Charger les informations du document si un ID est passé en paramètre
  useEffect(() => {
    const loadDocumentFromUrl = async () => {
      if (!documentIdFromUrl) return;

      try {
        // Essayer d'abord digital_library_documents
        const { data: dlData } = await supabase
          .from('digital_library_documents')
          .select('id, title, author, publication_year, document_type, cbn_document_id')
          .eq('id', documentIdFromUrl)
          .maybeSingle();

        if (dlData) {
          // Récupérer la cote depuis cbn_documents si liée
          let cote = '';
          if (dlData.cbn_document_id) {
            const { data: cbnData } = await supabase
              .from('cbn_documents')
              .select('cote')
              .eq('id', dlData.cbn_document_id)
              .maybeSingle();
            cote = cbnData?.cote || '';
          }

          const doc: SelectedDocument = {
            id: dlData.id,
            title: dlData.title || documentTitleFromUrl || 'Document sans titre',
            author: dlData.author || undefined,
            year: dlData.publication_year?.toString() || undefined,
            type: dlData.document_type || undefined,
            cote: cote || undefined,
          };
          setPrefilledDocument(doc);
          setSelectedDocuments([doc]);
          return;
        }

        // Essayer ensuite cbn_documents
        const { data: cbnData } = await supabase
          .from('cbn_documents')
          .select('id, title, author, publication_year, document_type, cote')
          .eq('id', documentIdFromUrl)
          .maybeSingle();

        if (cbnData) {
          const doc: SelectedDocument = {
            id: cbnData.id,
            title: cbnData.title || documentTitleFromUrl || 'Document sans titre',
            author: cbnData.author || undefined,
            year: cbnData.publication_year?.toString() || undefined,
            type: cbnData.document_type || undefined,
            cote: cbnData.cote || undefined,
          };
          setPrefilledDocument(doc);
          setSelectedDocuments([doc]);
          return;
        }

        // Si aucun document trouvé mais on a un titre, créer un document temporaire
        if (documentTitleFromUrl) {
          const doc: SelectedDocument = {
            id: documentIdFromUrl,
            title: documentTitleFromUrl,
          };
          setPrefilledDocument(doc);
          setSelectedDocuments([doc]);
        }
      } catch (error) {
        console.error('Error loading document from URL:', error);
      }
    };

    loadDocumentFromUrl();
  }, [documentIdFromUrl, documentTitleFromUrl]);

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

  // Handler pour les documents unifiés (depuis la GED)
  const handleSelectUnifiedDocument = (doc: UnifiedDocument) => {
    const selectedDoc: SelectedDocument = {
      id: doc.id,
      title: doc.title,
      author: doc.author,
      year: doc.publication_year?.toString(),
      type: doc.document_type,
      cote: doc.cote,
    };
    handleSelectDocument(selectedDoc);
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

  // Contenu principal partagé
  const mainContent = (
    <>
      <main className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate(isBNPlatform ? '/digital-library' : '/');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Demande de reproduction</h1>
          <p className="text-lg text-muted-foreground">
            {prefilledDocument 
              ? "Complétez votre demande de reproduction pour le document sélectionné"
              : "Recherchez et demandez la reproduction de documents du catalogue CBN"
            }
          </p>
        </div>

        {/* Alerte document pré-sélectionné */}
        {prefilledDocument && (
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <BookOpen className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Document pré-sélectionné depuis la bibliothèque numérique : <strong>{prefilledDocument.title}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReproductionDialog(prefilledDocument)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Remplir la demande
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Panier de sélection */}
        {selectedDocuments.length > 0 && (
          <Card className="mb-6 border-2 border-primary/20 sticky top-20 z-40 bg-background shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Documents sélectionnés ({selectedDocuments.length})
              </CardTitle>
              <CardDescription>
                Cliquez sur "Demande de reproduction" pour chaque document à reproduire
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
                      Demande de reproduction
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

        {/* Onglets de recherche */}
        <Tabs defaultValue="unified" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="unified" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Recherche unifiée (GED)
            </TabsTrigger>
            <TabsTrigger value="cbn" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Catalogue CBN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unified">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Recherche dans tous les catalogues
                </CardTitle>
                <CardDescription>
                  Recherchez parmi tous les documents indexés : bibliothèque numérique, catalogue CBN, manuscrits, catalogue CBM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedDocumentSearch
                  onSelectDocument={handleSelectUnifiedDocument}
                  selectedDocumentIds={selectedDocuments.map(d => d.id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cbn">
            {/* Recherche dans le catalogue CBN */}
            <CBNSearchWithSelection
              onSelectDocument={handleSelectDocument}
              selectedDocumentId={selectedDocuments[selectedDocuments.length - 1]?.id}
              detailsRoute="reproduction"
            />
          </TabsContent>
        </Tabs>

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
            supportType: currentDocument.type || "",
            type: currentDocument.type || "",
          }}
        />
      )}
    </>
  );

  // Utiliser le layout BN si platform=bn
  if (isBNPlatform) {
    return (
      <DigitalLibraryLayout>
        {mainContent}
      </DigitalLibraryLayout>
    );
  }

  // Layout portail par défaut
  return (
    <div className="min-h-screen bg-background relative">
      <ServicePageBackground />
      <Header />
      <div className="relative z-10">{mainContent}</div>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  );
}
