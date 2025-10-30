import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Building2, 
  Calendar, 
  Hash,
  FileText,
  Share2,
  ChevronDown,
  ExternalLink,
  Download
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ReproductionRequestDialog } from "@/components/cbn/ReproductionRequestDialog";
import { supabase } from "@/integrations/supabase/client";

export default function NoticeDetailReproduction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReproductionDialog, setShowReproductionDialog] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    zone100: false,
    zone210: false,
    zone300: false,
    zone330: false,
    zone600: false,
    zone700: false,
    zone801: false,
    zone856: false,
  });

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cbn_catalog_documents')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error loading document:', error);
          setDocument(null);
        } else if (data) {
          // Mapper les données Supabase au format attendu par le template
          setDocument({
            id: data.id,
            title: data.title,
            author: data.author,
            publisher: data.publisher,
            year: data.year,
            type: data.support_type,
            status: data.support_status === "libre_acces" ? "Libre accès" : 
                    data.support_status === "numerise" ? "Numérisé" : 
                    "Non numérisé",
            cote: data.cote,
            isbn: data.isbn || "Absent",
            pages: data.pages || data.physical_description || "Non spécifié",
            collection: data.collection,
            language: data.language,
            resume: data.summary,
            noteContenu: data.description,
            sommaire: data.table_of_contents || [],
            keywords: data.keywords || [],
            relatedDocs: []
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p>Document non trouvé</p>
        </main>
        <Footer />
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre et métadonnées principales */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-primary">
                    {document.title}
                  </h1>
                  
                  <div className="space-y-2 text-sm">
                    {document.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{document.author}</span>
                      </div>
                    )}
                    
                    {document.publisher && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{document.publisher}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      {document.year && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{document.year}</span>
                        </div>
                      )}
                      
                      {document.cote && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>{document.cote}</span>
                        </div>
                      )}
                      
                      {document.isbn && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{document.isbn}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {document.type && (
                      <Badge variant="secondary">{document.type}</Badge>
                    )}
                    {document.status && (
                      <Badge variant={document.status === "Libre accès" ? "default" : "outline"}>
                        {document.status}
                      </Badge>
                    )}
                    {document.language && (
                      <Badge variant="outline">{document.language}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Résumé et description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Résumé et description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.resume && (
                  <div>
                    <h4 className="font-semibold mb-2">📖 Résumé</h4>
                    <p className="text-sm text-muted-foreground">{document.resume}</p>
                  </div>
                )}
                
                {document.noteContenu && (
                  <div>
                    <h4 className="font-semibold mb-2">📝 Note de contenu</h4>
                    <p className="text-sm text-muted-foreground">{document.noteContenu}</p>
                  </div>
                )}
                
                {document.sommaire && (
                  <div>
                    <h4 className="font-semibold mb-2">📑 Sommaire</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {document.sommaire.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {document.keywords && (
                  <div>
                    <h4 className="font-semibold mb-2">🏷️ Indexation thématique</h4>
                    <div className="flex flex-wrap gap-2">
                      {document.keywords.map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="cursor-pointer hover:bg-primary/10">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {document.collection && (
                  <div>
                    <h4 className="font-semibold mb-2">🧭 Collection / Série</h4>
                    <p className="text-sm text-primary cursor-pointer hover:underline">
                      {document.collection}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Détails bibliographiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📚 Détails bibliographiques</CardTitle>
                <p className="text-sm text-muted-foreground">Informations détaillées selon UNIMARC</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Collapsible open={openSections.zone100} onOpenChange={() => toggleSection("zone100")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Auteur principal</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone100 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    {document.author}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone210} onOpenChange={() => toggleSection("zone210")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Publication / Éditeur</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone210 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    {document.publisher} • {document.year}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone300} onOpenChange={() => toggleSection("zone300")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Description matérielle</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone300 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    {document.pages}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone330} onOpenChange={() => toggleSection("zone330")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Résumé</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone330 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    {document.resume}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone600} onOpenChange={() => toggleSection("zone600")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Mots-clés</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone600 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {document.keywords?.map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone801} onOpenChange={() => toggleSection("zone801")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Origine de la notice</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone801 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    Bibliothèque Nationale du Royaume du Maroc (BNRM)
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={openSections.zone856} onOpenChange={() => toggleSection("zone856")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                    <span className="font-medium">Cote et exemplaires</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.zone856 ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                    Cote: {document.cote}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Documents liés */}
            {document.relatedDocs && document.relatedDocs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Documents liés / Voir aussi
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Autres ouvrages sur le même auteur ou la même collection
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {document.relatedDocs.map((doc: any, idx: number) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm mb-1">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {doc.author} • {doc.year}
                          </p>
                          <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                            Voir notice →
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Disponibilité et Type de reproduction */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">📍 Disponibilité et accès</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type de support */}
                <div>
                  <p className="text-sm font-medium mb-1">Type de support</p>
                  <Badge variant="secondary">{document.type}</Badge>
                </div>

                {/* Statut */}
                <div>
                  <p className="text-sm font-medium mb-1">Statut du support</p>
                  <div className="flex items-center gap-2">
                    {document.status === "Libre accès" && (
                      <Badge className="bg-green-500">Accès numérique</Badge>
                    )}
                    {document.status === "Numérisé" && (
                      <Badge className="bg-orange-500">Accès restreint</Badge>
                    )}
                    {document.status === "Non numérisé" && (
                      <Badge variant="outline">❌ Non autorisée</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  {(document.status === "Libre accès" || document.status === "Numérisé") && document.type !== "Microfilm" && document.type !== "Carte" && (
                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={() => navigate(`/book-reader/${document.id}`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Consulter en ligne
                    </Button>
                  )}
                  
                  {document.status === "Numérisé" && (
                    <Button className="w-full" variant="default">
                      Adhérer
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => setShowReproductionDialog(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Demande de reproduction
                  </Button>
                  
                  <Button className="w-full" variant="ghost">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>

                <Separator />

                {/* Votre historique */}
                <div>
                  <h4 className="font-semibold mb-2">⏱️ Votre historique</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Demandes en cours: <span className="font-medium">0</span></p>
                    <p>En attente: <span className="font-medium">0</span></p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p className="mb-1">De cette consultation :</p>
                  <p>Résultat de la recherche marocaine [SUPRASER]</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Voir toutes mes recherches →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Reproduction Request Dialog */}
      {showReproductionDialog && document && (
        <ReproductionRequestDialog
          isOpen={showReproductionDialog}
          onClose={() => setShowReproductionDialog(false)}
          document={{
            id: document.id,
            title: document.title,
            author: document.author,
            year: document.year,
            supportType: document.type,
            cote: document.cote
          }}
        />
      )}
    </div>
  );
}
