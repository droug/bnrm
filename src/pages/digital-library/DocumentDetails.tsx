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
import { ReaderNoteForm } from "@/components/digital-library/ReaderNoteForm";


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
  const [effectiveDocumentId, setEffectiveDocumentId] = useState<string | null>(null);
  const [accessRestrictions, setAccessRestrictions] = useState<any>(null);
  const [pageAccessRestrictions, setPageAccessRestrictions] = useState<any>(null);
  const [isManuscript, setIsManuscript] = useState(false);
  const [authorName, setAuthorName] = useState<string>("");
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
      const loadRestrictionsFor = async (id: string) => {
        const [{ data: restrictionsData }, { data: pageRestrictionsData }] = await Promise.all([
          supabase
            .from('digital_library_access_restrictions')
            .select('*')
            .eq('document_id', id)
            .maybeSingle(),
          supabase
            .from('page_access_restrictions')
            .select('*')
            .eq('content_id', id)
            .maybeSingle(),
        ]);

        setAccessRestrictions(restrictionsData);
        setPageAccessRestrictions(pageRestrictionsData);
      };

      // 1) Priorité: digital_library_documents (ID utilisé par /admin/digital-library/documents et /digital-library/search)
      const { data: dlData, error: dlError } = await supabase
        .from('digital_library_documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (dlData && !dlError) {
        const mapped = {
          ...dlData,
          // Harmoniser le champ utilisé par l'UI (download/read)
          file_url: (dlData as any).pdf_url ?? (dlData as any).file_url ?? null,
          // Harmoniser le statut
          status: (dlData as any).publication_status ?? (dlData as any).status ?? 'published',
          // Harmoniser les tags
          tags: (dlData as any).keywords ?? (dlData as any).themes ?? [],
          // Fallback description
          description: (dlData as any).description ?? (dlData as any).content_notes ?? null,
          // Vignettes
          thumbnail_url: (dlData as any).thumbnail_url ?? (dlData as any).cover_image_url ?? null,
        };

        setDocument(mapped);
        setEffectiveDocumentId(dlData.id);
        setIsManuscript(Boolean((dlData as any).is_manuscript) || String((dlData as any).document_type || '').toLowerCase().includes('manuscr'));
        setAuthorName((dlData as any).author || '');
        await loadRestrictionsFor(dlData.id);
        setLoading(false);
        return;
      }

      // 1bis) Fallback: digital_library_documents via cbn_document_id (certains flux conservent cet identifiant)
      const { data: dlByCbnId, error: dlByCbnIdError } = await supabase
        .from('digital_library_documents')
        .select('*')
        .eq('cbn_document_id', documentId)
        .maybeSingle();

      if (dlByCbnId && !dlByCbnIdError) {
        const mapped = {
          ...dlByCbnId,
          file_url: (dlByCbnId as any).pdf_url ?? (dlByCbnId as any).file_url ?? null,
          status: (dlByCbnId as any).publication_status ?? (dlByCbnId as any).status ?? 'published',
          tags: (dlByCbnId as any).keywords ?? (dlByCbnId as any).themes ?? [],
          description: (dlByCbnId as any).description ?? (dlByCbnId as any).content_notes ?? null,
          thumbnail_url: (dlByCbnId as any).thumbnail_url ?? (dlByCbnId as any).cover_image_url ?? null,
        };

        setDocument(mapped);
        setEffectiveDocumentId(dlByCbnId.id);
        setIsManuscript(Boolean((dlByCbnId as any).is_manuscript) || String((dlByCbnId as any).document_type || '').toLowerCase().includes('manuscr'));
        setAuthorName((dlByCbnId as any).author || '');
        await loadRestrictionsFor(dlByCbnId.id);
        setLoading(false);
        return;
      }

      // 2) Fallback: cbn_documents (anciens liens / index)
      const { data: cbnData, error: cbnError } = await supabase
        .from('cbn_documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (cbnData && !cbnError) {
        // Si cbn_documents référence un digital_library_documents, privilégier celui-ci
        if ((cbnData as any).digital_library_document_id) {
          const linkedId = (cbnData as any).digital_library_document_id as string;
          const { data: linkedDl } = await supabase
            .from('digital_library_documents')
            .select('*')
            .eq('id', linkedId)
            .maybeSingle();

          if (linkedDl) {
            const mapped = {
              ...linkedDl,
              file_url: (linkedDl as any).pdf_url ?? (linkedDl as any).file_url ?? null,
              status: (linkedDl as any).publication_status ?? (linkedDl as any).status ?? 'published',
              tags: (linkedDl as any).keywords ?? (linkedDl as any).themes ?? [],
              description: (linkedDl as any).description ?? (linkedDl as any).content_notes ?? null,
              thumbnail_url: (linkedDl as any).thumbnail_url ?? (linkedDl as any).cover_image_url ?? null,
            };
            setDocument(mapped);
            setEffectiveDocumentId(linkedDl.id);
            setIsManuscript(Boolean((linkedDl as any).is_manuscript) || String((linkedDl as any).document_type || '').toLowerCase().includes('manuscr'));
            setAuthorName((linkedDl as any).author || (cbnData as any).author || '');
            await loadRestrictionsFor(linkedDl.id);
            setLoading(false);
            return;
          }
        }

        // Transformer les données cbn_documents pour correspondre au format attendu
        setDocument({
          ...cbnData,
          description: cbnData.notes || cbnData.physical_description,
          language: cbnData.support_type || 'Français',
          tags: cbnData.keywords || cbnData.subject_headings || [],
          status: 'published',
          metadata: {
            dc_creator: cbnData.author,
            dc_publisher: cbnData.publisher,
            dc_date: cbnData.publication_year?.toString(),
            dc_format: cbnData.physical_description,
            dc_identifier: cbnData.isbn || cbnData.issn || cbnData.cote,
            dc_language: cbnData.support_type,
            dc_subject: cbnData.subject_headings || cbnData.keywords || [],
            marc_100: cbnData.author,
            marc_260: cbnData.publisher ? `${cbnData.publication_place || ''} : ${cbnData.publisher}, ${cbnData.publication_year || ''}` : null,
            marc_300: cbnData.physical_description,
          }
        });
        setEffectiveDocumentId(cbnData.id);
        setIsManuscript(cbnData.document_type === 'Manuscrit');
        setAuthorName(cbnData.author || '');
        await loadRestrictionsFor(cbnData.id);
        setLoading(false);
        return;
      }

      // Essayer ensuite la table manuscripts
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (manuscriptData && !manuscriptError) {
        setDocument(manuscriptData);
        setIsManuscript(true);
        setAuthorName(manuscriptData.author || '');
        setLoading(false);
        return;
      }

      // Sinon, essayer la table content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (contentData) {
        setDocument(contentData);
        setIsManuscript(false);
        setLoading(false);
        return;
      }

      // Aucun document trouvé
      console.error('Document not found in any table');
      toast.error("Document non trouvé");
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
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
      }

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
    // Tous les documents de la bibliothèque numérique sont numérisés
    if (isManuscript) {
      navigate(`/manuscript-reader/${effectiveDocumentId || documentId}`);
    } else {
      navigate(`/digital-library/book-reader/${effectiveDocumentId || documentId}`);
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
              <Button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/bibliotheque-numerique')}>
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
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/bibliotheque-numerique')}
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
                    {(authorName || document.author) && (
                      <p className="text-lg text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {authorName || document.author}
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
              <CardContent className="space-y-4">
                {/* Mode d'accès */}
                {pageAccessRestrictions?.is_restricted && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Mode d'accès</p>
                    <div className="flex flex-wrap gap-2">
                      {pageAccessRestrictions?.allow_internet_access && (
                        <Badge variant="default" className="text-xs gap-1.5">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Accès Internet
                        </Badge>
                      )}
                      {pageAccessRestrictions?.allow_internal_access && (
                        <Badge variant="secondary" className="text-xs gap-1.5">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Consultation sur place
                        </Badge>
                      )}
                      {pageAccessRestrictions?.is_rare_book && (
                        <Badge className="text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
                          ✨ Livre rare
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Niveau d'accès */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Niveau d'accès</p>
                  <Badge 
                    variant={
                      accessRestrictions?.access_level === 'public' ? 'default' :
                      accessRestrictions?.access_level === 'copyrighted' ? 'destructive' :
                      accessRestrictions?.access_level === 'restricted' ? 'secondary' :
                      accessRestrictions?.access_level === 'internal' ? 'outline' : 'default'
                    }
                    className="text-sm"
                  >
                    {accessRestrictions?.access_level === 'public' && '🔓 Libre accès'}
                    {accessRestrictions?.access_level === 'copyrighted' && '🔒 Sous droits d\'auteur'}
                    {accessRestrictions?.access_level === 'restricted' && '🔐 Accès restreint'}
                    {accessRestrictions?.access_level === 'internal' && '🏛️ Usage interne'}
                    {!accessRestrictions && '🔓 Libre accès'}
                  </Badge>
                </div>

                {/* Exigence d'abonnement */}
                {accessRestrictions?.requires_subscription && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Abonnement requis : {
                            accessRestrictions.required_subscription_type === 'basic' ? 'Adhésion Standard' :
                            accessRestrictions.required_subscription_type === 'researcher' ? 'Adhésion Chercheur' :
                            accessRestrictions.required_subscription_type === 'premium' ? 'Adhésion Premium' :
                            accessRestrictions.required_subscription_type
                          }
                        </p>
                        {accessRestrictions.subscription_message && (
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            {accessRestrictions.subscription_message}
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => navigate('/abonnements?platform=bn')}
                        >
                          Souscrire à une adhésion
                        </Button>
          </div>
        </div>

        {/* Section notes privées du lecteur */}
        {user && userProfile && (
          <div className="mt-6">
            <ReaderNoteForm
              documentId={effectiveDocumentId || documentId || ""}
              documentTitle={document.title}
              documentType={document.document_type || undefined}
              documentCote={document.cote || document.inventory_number || undefined}
              userId={user.id}
              userFirstName={userProfile.firstName}
              userLastName={userProfile.lastName}
              userEmail={userProfile.email}
            />
          </div>
        )}
      </div>
                )}

                {/* Statut des droits d'auteur */}
                {accessRestrictions?.copyright_status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Statut des droits</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {accessRestrictions.copyright_status === 'public_domain' && 'Domaine public'}
                        {accessRestrictions.copyright_status === 'copyrighted' && 'Protégé par le droit d\'auteur'}
                        {accessRestrictions.copyright_status === 'creative_commons' && 'Creative Commons'}
                        {accessRestrictions.copyright_status === 'unknown' && 'Statut inconnu'}
                      </Badge>
                      {accessRestrictions.license_type && (
                        <Badge variant="secondary" className="text-xs">
                          {accessRestrictions.license_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Titulaire des droits */}
                {accessRestrictions?.copyright_holder && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Titulaire des droits</p>
                    <p className="text-sm">{accessRestrictions.copyright_holder}</p>
                  </div>
                )}

                {/* Permissions */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={accessRestrictions?.allow_full_consultation !== false ? "default" : "secondary"} className="text-xs">
                      {accessRestrictions?.allow_full_consultation !== false 
                        ? "✓ Consultation complète" 
                        : `⚠ Aperçu ${accessRestrictions?.consultation_percentage || 10}%`}
                    </Badge>
                    <Badge variant={accessRestrictions?.allow_download !== false ? "default" : "destructive"} className="text-xs">
                      {accessRestrictions?.allow_download !== false ? "✓ Téléchargement" : "✗ Téléchargement interdit"}
                    </Badge>
                    <Badge variant={accessRestrictions?.allow_sharing !== false ? "default" : "secondary"} className="text-xs">
                      {accessRestrictions?.allow_sharing !== false ? "✓ Partage" : "✗ Partage interdit"}
                    </Badge>
                  </div>
                </div>

                {/* Restrictions de sécurité */}
                {(accessRestrictions?.block_right_click || accessRestrictions?.block_screenshot || accessRestrictions?.block_print) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Mesures de protection</p>
                    <div className="flex flex-wrap gap-2">
                      {accessRestrictions.block_screenshot && (
                        <Badge variant="outline" className="text-xs">🛡️ Capture d'écran bloquée</Badge>
                      )}
                      {accessRestrictions.block_right_click && (
                        <Badge variant="outline" className="text-xs">🛡️ Clic droit désactivé</Badge>
                      )}
                      {accessRestrictions.block_print && (
                        <Badge variant="outline" className="text-xs">🛡️ Impression interdite</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Message de restriction */}
                {accessRestrictions?.restriction_message_fr && (
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground italic">
                      {accessRestrictions.restriction_message_fr}
                    </p>
                  </div>
                )}

                {/* Expiration des droits */}
                {(accessRestrictions?.copyright_expires_at || document.copyright_expires_at) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiration des droits</p>
                    <p className="text-sm">
                      {new Date(accessRestrictions?.copyright_expires_at || document.copyright_expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                {/* Lien vers la licence */}
                {accessRestrictions?.license_url && (
                  <div>
                    <a 
                      href={accessRestrictions.license_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Voir les termes de la licence →
                    </a>
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
                <Button onClick={handleRead} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Consulter le document
                </Button>
              </CardContent>
            </Card>

            {/* Informations du document catalogué (CBN) */}
            {document.cote && !isManuscript && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations catalographiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Cote</p>
                    <p className="font-mono">{document.cote}</p>
                  </div>
                  
                  {document.document_type && (
                    <div>
                      <p className="font-medium text-muted-foreground">Type de document</p>
                      <p>{document.document_type}</p>
                    </div>
                  )}

                  {document.isbn && (
                    <div>
                      <p className="font-medium text-muted-foreground">ISBN</p>
                      <p className="font-mono">{document.isbn}</p>
                    </div>
                  )}

                  {document.issn && (
                    <div>
                      <p className="font-medium text-muted-foreground">ISSN</p>
                      <p className="font-mono">{document.issn}</p>
                    </div>
                  )}

                  {document.dewey_classification && (
                    <div>
                      <p className="font-medium text-muted-foreground">Classification Dewey</p>
                      <p>{document.dewey_classification}</p>
                    </div>
                  )}

                  {document.pages_count && (
                    <div>
                      <p className="font-medium text-muted-foreground">Nombre de pages</p>
                      <p>{document.pages_count}</p>
                    </div>
                  )}

                  {document.edition && (
                    <div>
                      <p className="font-medium text-muted-foreground">Édition</p>
                      <p>{document.edition}</p>
                    </div>
                  )}

                  {document.collection_name && (
                    <div>
                      <p className="font-medium text-muted-foreground">Collection</p>
                      <p>{document.collection_name}</p>
                    </div>
                  )}

                  {document.location && (
                    <div>
                      <p className="font-medium text-muted-foreground">Localisation</p>
                      <p>{document.location}</p>
                    </div>
                  )}

                  {document.physical_status && (
                    <div>
                      <p className="font-medium text-muted-foreground">État physique</p>
                      <p>{document.physical_status}</p>
                    </div>
                  )}

                  {document.consultation_mode && (
                    <div>
                      <p className="font-medium text-muted-foreground">Mode de consultation</p>
                      <Badge variant={document.consultation_mode === 'libre' ? 'default' : 'secondary'}>
                        {document.consultation_mode === 'libre' ? 'Libre accès' : 'Sur demande'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informations du manuscrit */}
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
