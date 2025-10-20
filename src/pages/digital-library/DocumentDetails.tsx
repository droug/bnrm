import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Download, 
  Share2, 
  ArrowLeft, 
  Calendar,
  User,
  FileText,
  Languages,
  Scale,
  Copyright,
  Eye,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { DigitizationRequestDialog } from "@/components/digital-library/DigitizationRequestDialog";

interface DocumentMetadata {
  dc_creator?: string;
  dc_publisher?: string;
  dc_date?: string;
  dc_rights?: string;
  dc_format?: string;
  dc_identifier?: string;
  dc_language?: string;
  dc_subject?: string[];
  marc_245?: string;
  marc_100?: string;
  marc_260?: string;
  marc_300?: string;
}

export default function DocumentDetails() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const [isManuscript, setIsManuscript] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showDigitizationDialog, setShowDigitizationDialog] = useState(false);


  useEffect(() => {
    loadDocument();
    if (user) {
      loadUserProfile();
    }
  }, [documentId, user]);

  const loadDocument = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      // Essayer d'abord la table manuscripts
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', documentId)
        .single();

      if (manuscriptData && !manuscriptError) {
        setDocument(manuscriptData);
        setIsManuscript(true);
        setLoading(false);
        return;
      }

      // Sinon, essayer la table content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('id', documentId)
        .single();

      if (contentError) throw contentError;
      
      setDocument(contentData);
      setIsManuscript(false);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error("Erreur lors du chargement du document");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      setUserProfile({
        firstName: data?.first_name || '',
        lastName: data?.last_name || '',
        email: authUser?.email || '',
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleRead = () => {
    if (isManuscript) {
      navigate(`/manuscript-reader/${documentId}`);
    } else {
      navigate(`/book-reader/${documentId}`);
    }
  };

  const handleDownload = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      toast.error("Fichier non disponible");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papier");
  };

  if (loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!document) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Document non trouvé</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </DigitalLibraryLayout>
    );
  }

  const metadata: DocumentMetadata = document.metadata || {};
  const canDownload = document.download_enabled !== false && document.allow_download !== false;
  const canRead = document.file_url || document.digital_copy_url;
  const canReserve = !canRead && user && userProfile;
  // Always show digitization button for logged-in users (no file_url means not digitized)
  const canRequestDigitization = !document.file_url && user && userProfile;

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
                    {document.author && (
                      <p className="text-lg text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {document.author}
                      </p>
                    )}
                  </div>
                  <Badge variant={document.status === 'published' ? 'default' : 'secondary'}>
                    {document.status === 'published' ? 'Publié' : document.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{document.description}</p>
                  </div>
                )}

                {/* Aperçu image */}
                {document.thumbnail_url && (
                  <div>
                    <img 
                      src={document.thumbnail_url} 
                      alt={document.title}
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Métadonnées de base */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {document.language && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Langue</p>
                        <p className="font-medium">{document.language}</p>
                      </div>
                    </div>
                  )}
                  
                  {(document.publication_year || document.published_at) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date de publication</p>
                        <p className="font-medium">
                          {document.publication_year || new Date(document.published_at).getFullYear()}
                        </p>
                      </div>
                    </div>
                  )}

                  {document.material && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Support</p>
                        <p className="font-medium">{document.material}</p>
                      </div>
                    </div>
                  )}

                  {document.file_type && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="font-medium">{document.file_type}</p>
                      </div>
                    </div>
                  )}

                  {document.view_count !== undefined && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Consultations</p>
                        <p className="font-medium">{document.view_count.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Mots-clés</h3>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métadonnées Dublin Core/MARC */}
            {(metadata.dc_creator || metadata.marc_100 || metadata.dc_publisher) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métadonnées bibliographiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(metadata.dc_creator || metadata.marc_100) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Créateur/Auteur principal</p>
                      <p>{metadata.dc_creator || metadata.marc_100}</p>
                    </div>
                  )}
                  
                  {metadata.dc_publisher && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Éditeur</p>
                      <p>{metadata.dc_publisher}</p>
                    </div>
                  )}

                  {metadata.marc_260 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Publication (MARC 260)</p>
                      <p>{metadata.marc_260}</p>
                    </div>
                  )}

                  {metadata.dc_identifier && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Identifiant</p>
                      <p className="font-mono text-sm">{metadata.dc_identifier}</p>
                    </div>
                  )}

                  {metadata.dc_format && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Format</p>
                      <p>{metadata.dc_format}</p>
                    </div>
                  )}

                  {metadata.marc_300 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description physique</p>
                      <p>{metadata.marc_300}</p>
                    </div>
                  )}

                  {metadata.dc_subject && metadata.dc_subject.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Sujets</p>
                      <div className="flex flex-wrap gap-2">
                        {metadata.dc_subject.map((subject, index) => (
                          <Badge key={index} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Droits et licences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Copyright className="h-5 w-5" />
                  Droits et licences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metadata.dc_rights && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Droits d'auteur</p>
                    <p>{metadata.dc_rights}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={canRead ? "default" : "secondary"}>
                      {canRead ? "Consultable en ligne" : "Non consultable"}
                    </Badge>
                    <Badge variant={canDownload ? "default" : "secondary"}>
                      {canDownload ? "Téléchargeable" : "Non téléchargeable"}
                    </Badge>
                  </div>
                </div>

                {document.copyright_expires_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiration des droits</p>
                    <p>{new Date(document.copyright_expires_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canRead && (
                  <Button onClick={handleRead} className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Consulter le document
                  </Button>
                )}
                
                {canDownload && (
                  <Button onClick={handleDownload} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                )}

                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>

                {canReserve && (
                  <Button 
                    onClick={() => setShowReservationDialog(true)} 
                    variant="secondary" 
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver ce document
                  </Button>
                )}

                {canRequestDigitization && (
                  <Button 
                    onClick={() => setShowDigitizationDialog(true)} 
                    variant="secondary" 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Demander la numérisation
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Informations complémentaires */}
            {isManuscript && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations du manuscrit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {document.period && (
                    <div>
                      <p className="font-medium text-muted-foreground">Période</p>
                      <p>{document.period}</p>
                    </div>
                  )}
                  
                  {document.dimensions && (
                    <div>
                      <p className="font-medium text-muted-foreground">Dimensions</p>
                      <p>{document.dimensions}</p>
                    </div>
                  )}

                  {document.inventory_number && (
                    <div>
                      <p className="font-medium text-muted-foreground">Numéro d'inventaire</p>
                      <p className="font-mono">{document.inventory_number}</p>
                    </div>
                  )}

                  {document.cote && (
                    <div>
                      <p className="font-medium text-muted-foreground">Cote</p>
                      <p className="font-mono">{document.cote}</p>
                    </div>
                  )}

                  {document.condition_notes && (
                    <div>
                      <p className="font-medium text-muted-foreground">État de conservation</p>
                      <p>{document.condition_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de réservation */}
      {showReservationDialog && userProfile && (
        <ReservationRequestDialog
          isOpen={showReservationDialog}
          onClose={() => setShowReservationDialog(false)}
          documentId={documentId || ''}
          documentTitle={document.title}
          documentCote={document.cote || document.inventory_number}
          userProfile={userProfile}
        />
      )}

      {/* Dialog de demande de numérisation */}
      {showDigitizationDialog && userProfile && (
        <DigitizationRequestDialog
          isOpen={showDigitizationDialog}
          onClose={() => setShowDigitizationDialog(false)}
          documentId={documentId}
          documentTitle={document.title}
          documentCote={document.cote || document.inventory_number}
          userProfile={userProfile}
        />
      )}
    </DigitalLibraryLayout>
  );
}
