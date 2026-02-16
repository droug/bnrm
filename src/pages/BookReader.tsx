import { useState, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import manuscriptPage1 from "@/assets/manuscript-page-1.jpg";
import manuscriptPage2 from "@/assets/manuscript-page-2.jpg";
import manuscriptPage3 from "@/assets/manuscript-page-3.jpg";
import manuscriptPage4 from "@/assets/manuscript-page-4.jpg";
import { PageFlipBook, type PageFlipBookHandle } from "@/components/book-reader/PageFlipBook";
import { PdfPageFlipBook, type PdfPageFlipBookHandle } from "@/components/book-reader/PdfPageFlipBook";
import { DocumentSearchInBook } from "@/components/digital-library/DocumentSearchInBook";
import { SidebarSearchInBook } from "@/components/digital-library/SidebarSearchInBook";
import { OptimizedPdfPageRenderer, preloadPdfPages, clearPdfCache } from "@/components/digital-library/OptimizedPdfPageRenderer";
import { PdfPageWithHighlight } from "@/components/digital-library/PdfPageWithHighlight";
import { VirtualizedScrollReader } from "@/components/digital-library/reader/VirtualizedScrollReader";
import { DraggableDoublePage } from "@/components/digital-library/reader/DraggableDoublePage";
import { ReproductionAuthChoiceModal } from "@/components/digital-library/ReproductionAuthChoiceModal";
import AudioVideoReader from "@/components/digital-library/reader/AudioVideoReader";
import { PanZoomContainer } from "@/components/digital-library/reader/PanZoomContainer";
import { FullPageOverlay } from "@/components/digital-library/reader/FullPageOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  Bookmark,
  Printer,
  RotateCw,
  Maximize,
  Volume2,
  FileText,
  Info,
  MessageCircle,
  ChevronDown,
  BookOpen,
  Copy,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  BookMarked,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minimize,
  Languages,
  Eye,
  EyeOff,
  MousePointerClick,
  Heart,
  Star,
  AlertCircle,
  Search,
  ChevronsUp,
  FileImage
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { isAdmin, isLibrarian } = useAccessControl();
  
  // Display states
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double" | "scroll">("single");
  const [readingMode, setReadingMode] = useState<"book" | "audio">("book");
  const [isFullPage, setIsFullPage] = useState(false);

  const mainContentRef = useRef<HTMLElement | null>(null);
  // Supporte PageFlipBook (images) et PdfPageFlipBook (PDF)
  const pageFlipRef = useRef<PageFlipBookHandle | PdfPageFlipBookHandle>(null);
  const [floatingToolbarStyle, setFloatingToolbarStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (viewMode !== "scroll" || readingMode !== "book") {
      setFloatingToolbarStyle(null);
      return;
    }

    const update = () => {
      const mainEl = mainContentRef.current;
      if (!mainEl) return;

      const nav = document.querySelector(
        'nav[aria-label="Navigation principale"]'
      ) as HTMLElement | null;

      const mainRect = mainEl.getBoundingClientRect();
      const top = isFullscreen
        ? 0
        : nav
        ? Math.max(0, nav.getBoundingClientRect().bottom)
        : 0;

      setFloatingToolbarStyle({
        position: "fixed",
        top,
        left: Math.max(0, mainRect.left),
        width: mainRect.width,
        zIndex: 60,
      });
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [viewMode, readingMode, isFullscreen]);
  
  // User interaction states
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  
  // Security settings (paramétrable)
  const [blockScreenCapture, setBlockScreenCapture] = useState(false);
  const [blockRightClick, setBlockRightClick] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowSharing, setAllowSharing] = useState(true);
  
  // Access restrictions from database
  const [accessRestrictions, setAccessRestrictions] = useState<any>(null);
  const [pageAccessRestrictions, setPageAccessRestrictions] = useState<any>(null);
  const [consultationPercentage, setConsultationPercentage] = useState(100);
  const [maxAllowedPage, setMaxAllowedPage] = useState(245);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  
  // Page access restriction settings
  const [restrictPageAccess, setRestrictPageAccess] = useState(false);
  const [pageRestrictionMode, setPageRestrictionMode] = useState<"range" | "manual">("range");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(10);
  const [manualPages, setManualPages] = useState<number[]>([]);
  
  // View mode restrictions (from page_access_restrictions)
  const [allowDoublePageViewRestriction, setAllowDoublePageViewRestriction] = useState(true);
  const [allowScrollViewRestriction, setAllowScrollViewRestriction] = useState(true);
  const [restrictedPageDisplay, setRestrictedPageDisplay] = useState<"blur" | "empty" | "hidden">("blur");
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioBookmarks, setAudioBookmarks] = useState<number[]>([]);
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  
  // Reproduction auth modal
  const [showReproductionAuthModal, setShowReproductionAuthModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const [documentImage, setDocumentImage] = useState<string>("");
  const [documentPages, setDocumentPages] = useState<string[]>([]);
  const [isOcrProcessed, setIsOcrProcessed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [actualTotalPages, setActualTotalPages] = useState(245);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentLanguage, setDocumentLanguage] = useState<string | null>(null);
  const [searchHighlight, setSearchHighlight] = useState<string>("");

  const getDefaultPageRotations = (docId?: string): Record<number, number> => {
    if (!docId) return {};

    // Corrections connues + correctifs spécifiques par document
    const defaults: Record<string, number[]> = {
      // Contes et Poèmes d'Islam: certaines pages scannées à l'envers
      "6135d8a8-43c3-446f-8484-39c88f517978": [8],
      // مطالب الشعب المغربي (mémoire projet): pages 11 & 12 inversées
      "f74bf753-4018-41ae-b182-877fc7e192c1": [11, 12],
    };

    const pages = defaults[docId] ?? [];
    return pages.reduce<Record<number, number>>((acc, page) => {
      acc[page] = 180;
      return acc;
    }, {});
  };

  useEffect(() => {
    if (!id) return;
    const key = `dl_page_rotations:${id}`;
    const defaults = getDefaultPageRotations(id);

    let stored: Record<number, number> = {};
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        stored = Object.entries(parsed || {}).reduce<Record<number, number>>((acc, [k, v]) => {
          const page = Number(k);
          if (Number.isFinite(page) && typeof v === "number") acc[page] = v;
          return acc;
        }, {});
      }
    } catch {
      stored = {};
    }

    setPageRotations({ ...defaults, ...stored });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const key = `dl_page_rotations:${id}`;
    try {
      localStorage.setItem(key, JSON.stringify(pageRotations));
    } catch {
      // ignore storage errors
    }
  }, [id, pageRotations]);

  const togglePageRotation = (page: number) => {
    setPageRotations((prev) => {
      const current = prev[page] ?? 0;
      const next = current === 180 ? 0 : 180;
      const updated = { ...prev };
      if (next === 0) delete updated[page];
      else updated[page] = next;
      return updated;
    });
  };
  
  // Fictional manuscript pages (fallback)
  const manuscriptPages = [
    manuscriptPage1,
    manuscriptPage2,
    manuscriptPage3,
    manuscriptPage4,
  ];
  
  // Load document data from Supabase
  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Charger les restrictions d'accès depuis digital_library_access_restrictions
        const { data: restrictionsData } = await supabase
          .from('digital_library_access_restrictions')
          .select('*')
          .eq('document_id', id)
          .maybeSingle();
        
        // Charger les restrictions de page depuis page_access_restrictions
        const { data: pageRestrictionsData } = await supabase
          .from('page_access_restrictions')
          .select('*')
          .eq('content_id', id)
          .maybeSingle();
        
        // Appliquer les restrictions de page_access_restrictions
        if (pageRestrictionsData) {
          setPageAccessRestrictions(pageRestrictionsData);
          
          // Paramètres de sécurité depuis page_access_restrictions
          if (pageRestrictionsData.allow_download === false) {
            setAllowDownload(false);
          }
          if (pageRestrictionsData.allow_screenshot === false) {
            setBlockScreenCapture(true);
          }
          if (pageRestrictionsData.allow_right_click === false) {
            setBlockRightClick(true);
          }
          
          // Modes de vue
          setAllowDoublePageViewRestriction(pageRestrictionsData.allow_double_page_view !== false);
          setAllowScrollViewRestriction(pageRestrictionsData.allow_scroll_view !== false);
          const displayMode = pageRestrictionsData.restricted_page_display;
          if (displayMode === "blur" || displayMode === "empty" || displayMode === "hidden") {
            setRestrictedPageDisplay(displayMode);
          }
          
          // Restriction des pages
          if (pageRestrictionsData.is_restricted) {
            setRestrictPageAccess(true);
            setManualPages(pageRestrictionsData.manual_pages || []);
            setStartPage(pageRestrictionsData.start_page || 1);
            setEndPage(pageRestrictionsData.end_page || 10);
            const mode = pageRestrictionsData.restriction_mode;
            if (mode === "range" || mode === "manual") {
              setPageRestrictionMode(mode);
            }
          }
        }
        
        // Vérifier l'abonnement de l'utilisateur si nécessaire
        let userHasValidSubscription = false;
        let userSub = null;
        
        if (user && restrictionsData?.requires_subscription) {
          const { data: subscriptionData } = await supabase
            .from('service_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .maybeSingle();
          
          if (subscriptionData) {
            userSub = subscriptionData;
            // Vérifier si le type d'abonnement correspond
            const requiredType = restrictionsData.required_subscription_type;
            const userSubType = subscriptionData.subscription_type;
            
            // Hiérarchie: premium > researcher > basic
            const subscriptionHierarchy: { [key: string]: number } = {
              'basic': 1,
              'researcher': 2,
              'premium': 3
            };
            
            const requiredLevel = subscriptionHierarchy[requiredType] || 0;
            const userLevel = subscriptionHierarchy[userSubType] || 0;
            
            userHasValidSubscription = userLevel >= requiredLevel;
          }
          
          setHasValidSubscription(userHasValidSubscription);
          setUserSubscription(userSub);
        } else {
          setHasValidSubscription(true); // Pas d'abonnement requis
        }
        
        if (restrictionsData) {
          setAccessRestrictions(restrictionsData);
          // Ne pas écraser si déjà défini par page_access_restrictions
          if (!pageRestrictionsData?.allow_right_click === false) {
            setBlockRightClick(restrictionsData.block_right_click || false);
          }
          if (!pageRestrictionsData?.allow_screenshot === false) {
            setBlockScreenCapture(restrictionsData.block_screenshot || false);
          }
          
          // Si abonnement requis mais pas valide, appliquer les restrictions
          const canFullAccess = !restrictionsData.requires_subscription || userHasValidSubscription;
          
          // Ne pas écraser si déjà défini par page_access_restrictions
          if (pageRestrictionsData?.allow_download !== false) {
            setAllowDownload(canFullAccess && restrictionsData.allow_download !== false);
          }
          setAllowSharing(canFullAccess && restrictionsData.allow_sharing !== false);
          
          // Calculer le pourcentage de consultation
          let effectivePercentage = restrictionsData.consultation_percentage || 100;
          if (restrictionsData.requires_subscription && !userHasValidSubscription) {
            // Limiter à 10% pour les non-abonnés
            effectivePercentage = Math.min(effectivePercentage, 10);
          }
          
          setConsultationPercentage(effectivePercentage);
          
          // Calculer la page maximum autorisée
          const maxPage = Math.ceil((245 * effectivePercentage) / 100);
          setMaxAllowedPage(maxPage);
          
          // Si consultation partielle, activer les restrictions
          if (!restrictionsData.allow_full_consultation || (restrictionsData.requires_subscription && !userHasValidSubscription)) {
            setRestrictPageAccess(true);
            setStartPage(1);
            setEndPage(maxPage);
          }
        }

        // Essayer d'abord digital_library_documents par id
        let dlData = null;
        let dlError = null;
        
        const { data: dlByIdData, error: dlByIdError } = await supabase
          .from('digital_library_documents')
          .select('id, cbn_document_id, ocr_processed, title, author, publication_year, cover_image_url, pages_count, document_type, pdf_url, language')
          .eq('id', id)
          .maybeSingle();
        
        if (dlByIdData && !dlByIdError) {
          dlData = dlByIdData;
          dlError = dlByIdError;
        } else {
          // Si non trouvé par id, essayer par cbn_document_id
          const { data: dlByCbnIdData, error: dlByCbnIdError } = await supabase
            .from('digital_library_documents')
            .select('id, cbn_document_id, ocr_processed, title, author, publication_year, cover_image_url, pages_count, document_type, pdf_url, language')
            .eq('cbn_document_id', id)
            .maybeSingle();
          
          dlData = dlByCbnIdData;
          dlError = dlByCbnIdError;
        }

        if (dlData && !dlError) {
          const pagesCount = dlData.pages_count || 0;
          // Utiliser l'ID réel du document (pas cbn_document_id) pour les opérations
          const realDocumentId = dlData.id;
          setIsOcrProcessed(dlData.ocr_processed || false);
          setDocumentLanguage(dlData.language || null);
          // Utiliser les données de digital_library_documents directement
          setDocumentData({
            id: realDocumentId, // Important: utiliser l'ID réel
            cbn_document_id: dlData.cbn_document_id,
            title: dlData.title,
            author: dlData.author || 'Auteur inconnu',
            publication_year: dlData.publication_year,
            document_type: dlData.document_type,
            pdf_url: dlData.pdf_url,
            cover_image_url: dlData.cover_image_url,
            excerpt: `Document numérisé - ${pagesCount || 50} pages`,
          });

          // Définir le nombre de pages
          if (pagesCount) {
            setActualTotalPages(pagesCount);
          }

          // Si des images de pages existent dans /public/digital-library-pages/{documentId}/, les utiliser.
          // (On évite de générer des centaines d'URLs pour les très gros documents.)
          if (pagesCount > 0 && pagesCount <= 100) {
            const firstPageUrl = `/digital-library-pages/${realDocumentId}/page_1.jpg`;
            console.log('🔍 Checking for page images at:', firstPageUrl);
            
            let firstPageExists = false;
            try {
              const response = await fetch(firstPageUrl, { method: 'HEAD' });
              // Vérifier que c'est bien une image et pas une page d'erreur HTML
              const contentType = response.headers.get('content-type');
              firstPageExists = response.ok && contentType?.startsWith('image/');
              console.log('🔍 Response:', response.ok, 'Content-Type:', contentType, 'Exists:', firstPageExists);
            } catch (e) {
              console.log('🔍 Fetch error:', e);
              firstPageExists = false;
            }

            if (firstPageExists) {
              console.log('✅ Using page images');
              const pages = Array.from({ length: pagesCount }, (_, i) => (
                `/digital-library-pages/${realDocumentId}/page_${i + 1}.jpg`
              ));
              setDocumentPages(pages);
              setDocumentImage(pages[0]);
            } else if (dlData.pdf_url) {
              // Si pas d'images mais un PDF, utiliser le rendu PDF
              console.log('📄 No page images found, using PDF URL:', dlData.pdf_url);
              setPdfUrl(dlData.pdf_url);
              setDocumentPages([]);
              setDocumentImage(dlData.cover_image_url || manuscriptPage1);
            } else {
              console.log('⚠️ No page images and no PDF URL');
              setDocumentPages([]);
              setDocumentImage(dlData.cover_image_url || manuscriptPage1);
            }
          } else if (dlData.pdf_url) {
            // Document avec beaucoup de pages ou sans pages_count - utiliser PDF
            console.log('📄 Setting PDF URL (large doc):', dlData.pdf_url);
            setPdfUrl(dlData.pdf_url);
            setDocumentPages([]);
            setDocumentImage(dlData.cover_image_url || manuscriptPage1);
          } else {
            setDocumentPages([]);
            setDocumentImage(dlData.cover_image_url || manuscriptPage1);
          }

          setLoading(false);
          return;
        }

        // Essayer ensuite cbn_documents
        const { data: cbnData, error: cbnError } = await supabase
          .from('cbn_documents')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (cbnData && !cbnError) {
          setDocumentData({
            ...cbnData,
            author: cbnData.author || 'Auteur inconnu',
            title: cbnData.title,
            excerpt: cbnData.notes || cbnData.physical_description,
          });
          setDocumentImage(manuscriptPage1);
          setLoading(false);
          return;
        }

        // Sinon essayer la table content
        const { data, error } = await supabase
          .from('content')
          .select('id, title, excerpt, content_type, published_at, file_url, file_type, tags, author_id, page_count, pages_path')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          // Load author info
          let authorName = "Auteur inconnu";
          if (data.author_id) {
            const { data: authorData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', data.author_id)
              .maybeSingle();
            
            if (authorData) {
              authorName = `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() || 'Auteur inconnu';
            }
          }

          setDocumentData({
            ...data,
            author: authorName
          });

          // Si le document a des pages extraites
          if (data.pages_path && data.page_count) {
            const pages: string[] = [];
            for (let i = 1; i <= data.page_count; i++) {
              pages.push(`${data.pages_path}/page_${i}.jpg`);
            }
            setDocumentPages(pages);
            setActualTotalPages(data.page_count);
            setDocumentImage(pages[0]); // Première page comme image par défaut
          } else {
            // Set document image based on title or use file_url
            const titleImageMap: { [key: string]: string } = {
              "Archives Photographiques du Maroc Colonial": "/src/assets/digital-library/archives-photo-maroc.jpg",
              "Collection de Cartes Anciennes": "/src/assets/digital-library/cartes-anciennes.jpg",
              "Logiciel Patrimoine": "/src/assets/digital-library/logiciel-patrimoine.jpg",
              "Manuscrits Andalous": "/src/assets/digital-library/manuscrits-andalous.jpg",
              "Documents Administratifs Historiques": "/src/assets/digital-library/documents-administratifs.jpg",
            };

            setDocumentImage(titleImageMap[data.title] || data.file_url || manuscriptPage1);
          }
        } else {
          console.error('Error loading document:', error);
          toast.error("Erreur lors du chargement du document");
        }
      } catch (err) {
        console.error('Exception loading document:', err);
        toast.error("Erreur lors du chargement du document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);
  
  const totalPages = actualTotalPages;
  
  const getCurrentPageImage = (page: number) => {
    // Si le document a des pages extraites, les utiliser
    if (documentPages.length > 0 && page <= documentPages.length) {
      return documentPages[page - 1];
    }
    // Si on a une vraie image de document (pas les images manuscrit par défaut), l'utiliser
    if (documentImage && !documentImage.includes('manuscript-page')) {
      return documentImage;
    }
    // Retourner null si pas de contenu réel - sera géré par hasDisplayableContent
    return null;
  };

  // Generate page images for flip book
  const generatePageImages = () => {
    if (documentPages.length > 0) {
      return documentPages;
    }
    // Si on a une image de couverture du document, l'utiliser
    // Sinon retourner un tableau vide pour forcer l'affichage de l'erreur "document non disponible"
    if (documentImage && !documentImage.includes('manuscript-page')) {
      const images = [];
      for (let i = 0; i < totalPages; i++) {
        images.push(documentImage);
      }
      return images;
    }
    // Pas de vraies images disponibles
    return [];
  };
  
  // Vérifier si le document a un contenu affichable (PDF ou images de pages)
  const hasDisplayableContent = Boolean(pdfUrl) || documentPages.length > 0 || 
    (documentImage && !documentImage.includes('manuscript-page'));
  
  // Pour le mode Double, on a besoin soit d'images de pages, soit d'un PDF qu'on peut afficher page par page
  const canUseDoubleMode = documentPages.length > 0 || 
    (documentImage && !documentImage.includes('manuscript-page'));

  // Détecter si le document est en arabe (pour le mode RTL en double page)
  const isArabicDocument = (): boolean => {
    // Vérifier la langue explicite
    if (documentLanguage) {
      const lang = documentLanguage.toLowerCase();
      if (lang === 'ar' || lang === 'arabic' || lang === 'arabe') return true;
    }
    // Vérifier si le titre contient des caractères arabes
    const title = documentData?.title || '';
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(title);
  };
  
  const bookInfo = {
    title: documentData?.title || "Chargement...",
    author: documentData?.author || "Auteur inconnu",
    collection: documentData?.content_type === 'news' ? 'Articles' : 
                documentData?.content_type === 'event' ? 'Événements' : 
                documentData?.content_type === 'exhibition' ? 'Expositions' : 'Manuscrits',
    date: documentData?.published_at ? new Date(documentData.published_at).getFullYear().toString() : "N/A",
    description: documentData?.excerpt || "Description non disponible",
    language: "Arabe classique",
    pages: totalPages,
    format: "PDF Haute résolution",
    size: "45.3 MB",
    hasAudio: true,
    audioDuration: "5h 23min",
    permalink: `https://bnrm-dev.digiup.ma/digital-library/book-reader/${id}`
  };

  const chapters = [
    { name: "Introduction", page: 1 },
    { name: "Chapitre I - La métaphysique", page: 15 },
    { name: "Chapitre II - La logique", page: 45 },
    { name: "Chapitre III - La physique", page: 89 },
    { name: "Chapitre IV - L'éthique", page: 145 },
    { name: "Chapitre V - La politique", page: 189 },
    { name: "Conclusion", page: 230 }
  ];

  // Block right click
  useEffect(() => {
    if (blockRightClick) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.error("Le clic droit est désactivé pour ce document");
      };
      document.addEventListener("contextmenu", handleContextMenu);
      return () => document.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [blockRightClick]);

  // Block screen capture
  useEffect(() => {
    if (blockScreenCapture) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && e.key === "S")) {
          e.preventDefault();
          toast.error("Les captures d'écran sont désactivées pour ce document");
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [blockScreenCapture]);

  // Vérifier si une page est accessible
  const isPageAccessible = (page: number): boolean => {
    // Si pas de restrictions ou accès complet autorisé
    if (!accessRestrictions || accessRestrictions.allow_full_consultation) {
      // Mais vérifier si un abonnement est requis
      if (accessRestrictions?.requires_subscription && !hasValidSubscription) {
        return page <= maxAllowedPage;
      }
      return true;
    }
    return page <= maxAllowedPage;
  };

  // Message d'erreur pour les pages non accessibles
  const getAccessDeniedMessage = (): string => {
    if (accessRestrictions?.requires_subscription && !hasValidSubscription) {
      const subscriptionName = 
        accessRestrictions.required_subscription_type === 'basic' ? 'Adhésion Standard' :
        accessRestrictions.required_subscription_type === 'researcher' ? 'Adhésion Chercheur' :
        accessRestrictions.required_subscription_type === 'premium' ? 'Adhésion Premium' :
        accessRestrictions.required_subscription_type;
      return `Abonnement "${subscriptionName}" requis pour accéder au document complet. ${accessRestrictions.subscription_message || ''}`;
    }
    return accessRestrictions?.restriction_message_fr || 'Contactez la bibliothèque pour un accès complet.';
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      if (viewMode === "double" && pageFlipRef.current) {
        pageFlipRef.current.flipPrev();
      } else {
        const newPage = viewMode === "double" ? Math.max(1, currentPage - 2) : currentPage - 1;
        setCurrentPage(newPage);
      }
    }
  };

  const handleNextPage = () => {
    const nextPage = viewMode === "double" ? Math.min(totalPages, currentPage + 2) : currentPage + 1;
    
    if (!isPageAccessible(nextPage)) {
      toast.error(getAccessDeniedMessage());
      return;
    }
    
    if (currentPage < totalPages) {
      if (viewMode === "double" && pageFlipRef.current) {
        pageFlipRef.current.flipNext();
      } else {
        setCurrentPage(nextPage);
      }
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10);
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleResetRotation = () => {
    setRotation(0);
    setPageRotations({});
    // Clear from localStorage
    if (id) {
      try {
        localStorage.removeItem(`dl_page_rotations:${id}`);
      } catch {
        // ignore storage errors
      }
    }
    toast.success("Rotation réinitialisée");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleBookmark = (page: number) => {
    if (bookmarks.includes(page)) {
      setBookmarks(bookmarks.filter(p => p !== page));
      toast.success("Marque-page retiré");
    } else {
      setBookmarks([...bookmarks, page]);
      toast.success("Marque-page ajouté");
    }
  };

  const goToPage = (page: number) => {
    if (!isPageAccessible(page)) {
      toast.error(getAccessDeniedMessage());
      return;
    }

    // Mode Double: le flipbook ne “saute” pas de page uniquement avec le state;
    // il faut le piloter via son handle.
    if (viewMode === "double" && pageFlipRef.current) {
      pageFlipRef.current.turnToPage(page);
      setCurrentPage(page);
      toast.success(`Navigation vers la page ${page}`);
      return;
    }

    // Mode Scroll: le state currentPage ne suffit pas, il faut scroller le conteneur.
    if (viewMode === "scroll") {
      const virtualizedContainer = document.getElementById("virtualized-scroll-container");
      const pageElId = `page-${page}`;
      const pageEl = document.getElementById(pageElId);

      // En mode virtualisé, la page n'est pas forcément dans le DOM.
      if (virtualizedContainer && !pageEl) {
        // Doit rester cohérent avec VirtualizedScrollReader (estimation)
        const ESTIMATED_PAGE_HEIGHT = 800;
        const estimatedTop = (page - 1) * ESTIMATED_PAGE_HEIGHT * (zoom / 100);
        virtualizedContainer.scrollTo({ top: estimatedTop, behavior: "smooth" });

        // Après la mise à jour de la virtualisation, on réaligne précisément.
        window.setTimeout(() => {
          document.getElementById(pageElId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      } else if (pageEl) {
        // En mode scroll “images”, scrollIntoView va scroller le parent scrollable.
        pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setCurrentPage(page);
      toast.success(`Navigation vers la page ${page}`);
      return;
    }

    // Mode Single
    setCurrentPage(page);
    toast.success(`Navigation vers la page ${page}`);
  };

  const handleDownload = async (format: string) => {
    if (!allowDownload) {
      toast.error(accessRestrictions?.restriction_message_fr || "Le téléchargement est désactivé pour ce document protégé par le droit d'auteur");
      return;
    }
    
    if (pdfUrl) {
      toast.success("Téléchargement en cours...");
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${documentData?.title || 'document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download error:', error);
        toast.error("Erreur lors du téléchargement");
      }
    } else {
      toast.error("Aucun fichier disponible pour le téléchargement");
    }
  };

  const handlePrint = async () => {
    // Seuls les admins et bibliothécaires BN peuvent imprimer
    if (!isAdmin && !isLibrarian) {
      toast.error("L'impression est réservée au personnel de la bibliothèque");
      return;
    }
    
    if (accessRestrictions?.block_print) {
      toast.error("L'impression est désactivée pour ce document protégé");
      return;
    }
    
    if (pdfUrl) {
      toast.success("Préparation de l'impression du document...");
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(blobUrl);
          };
        } else {
          // Fallback: télécharger le PDF
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${documentData?.title || 'document'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          toast.info("Le PDF a été téléchargé. Vous pouvez l'imprimer depuis votre lecteur PDF.");
        }
      } catch (error) {
        console.error('Print error:', error);
        toast.error("Erreur lors de la préparation de l'impression");
      }
      return;
    }
    
    toast.success("Préparation de l'impression...");
    window.print();
  };

  const handleShare = (platform: string) => {
    if (!allowSharing) {
      toast.error("Le partage est désactivé pour ce document protégé par le droit d'auteur");
      return;
    }
    
    const url = bookInfo.permalink;
    const text = `${bookInfo.title} - ${bookInfo.author}`;
    
    switch(platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Découvrez ce document: ${url}`)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
        break;
    }
    setShowShareDialog(false);
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    toast.success(`Email envoyé à ${emailAddress}`);
    setShowEmailDialog(false);
    setEmailAddress("");
  };

  // Audio controls
  const toggleAudioPlay = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? "Lecture en pause" : "Lecture en cours");
  };

  const toggleAudioBookmark = () => {
    const pos = audioPosition;
    if (audioBookmarks.includes(pos)) {
      setAudioBookmarks(audioBookmarks.filter(p => p !== pos));
      toast.success("Marque-page audio retiré");
    } else {
      setAudioBookmarks([...audioBookmarks, pos]);
      toast.success("Marque-page audio ajouté");
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang as "fr" | "ar" | "en");
    toast.success(`Langue changée: ${lang === "fr" ? "Français" : lang === "ar" ? "العربية" : "English"}`);
  };

  // Check if document is audiovisual type
  const isAudioVisualDocument = documentData?.document_type === 'audio' || documentData?.document_type === 'video';

  // Render AudioVideoReader for audio/video documents
  if (isAudioVisualDocument && documentData?.pdf_url) {
    return (
      <DigitalLibraryLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <AudioVideoReader 
            documentData={{
              id: documentData.id,
              title: documentData.title,
              author: documentData.author,
              publication_year: documentData.publication_year,
              document_type: documentData.document_type as 'audio' | 'video',
              pdf_url: documentData.pdf_url,
              cover_image_url: documentData.cover_image_url
            }}
            onBack={() => window.history.length > 1 ? navigate(-1) : navigate('/bibliotheque-numerique')}
          />
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      
      {/* Breadcrumb with Language Selector */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-primary">Accueil</a>
              <ChevronRight className="h-4 w-4" />
              <a href="/digital-library" className="hover:text-primary">Bibliothèque Numérique</a>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Consultation Ouvrage</span>
            </div>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Languages className="h-4 w-4 mr-2" />
                  Langue
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                  🇲🇦 العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Bannière d'alerte pour les restrictions d'accès */}
      {accessRestrictions && (!accessRestrictions.allow_full_consultation || (accessRestrictions.requires_subscription && !hasValidSubscription)) && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {accessRestrictions.requires_subscription && !hasValidSubscription 
                  ? `Abonnement ${
                      accessRestrictions.required_subscription_type === 'basic' ? 'Standard' :
                      accessRestrictions.required_subscription_type === 'researcher' ? 'Chercheur' :
                      accessRestrictions.required_subscription_type === 'premium' ? 'Premium' :
                      accessRestrictions.required_subscription_type
                    } requis - Aperçu limité à ${consultationPercentage}%`
                  : `Aperçu limité à ${consultationPercentage}% (${maxAllowedPage} pages sur ${totalPages})`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                {accessRestrictions.access_level === 'copyrighted' && 'Droits d\'auteur'}
                {accessRestrictions.access_level === 'restricted' && 'Accès restreint'}
                {accessRestrictions.access_level === 'internal' && 'Usage interne'}
              </Badge>
              {accessRestrictions.requires_subscription && !hasValidSubscription && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs h-6 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                  onClick={() => navigate('/subscription')}
                >
                  S'abonner
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar - Book Info & Navigation */}
        <aside className="w-80 shrink-0 bg-muted/30 border-r min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <Button 
                variant="outline" 
                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/bibliotheque-numerique')}
                className="w-full"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="info" className="flex-1 min-w-[60px]">Info</TabsTrigger>
                  <TabsTrigger value="chapters" className="flex-1 min-w-[80px]">Chapitres</TabsTrigger>
                  <TabsTrigger value="search" className="flex-1 min-w-[90px] flex items-center justify-center gap-1">
                    <Search className="h-3 w-3" />
                    Recherche
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="px-3">
                    <Bookmark className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-6">
                  {/* Book Details */}
                  <div>
                    <Badge variant="secondary" className="mb-3">{bookInfo.collection}</Badge>
                    <h2 className="text-xl font-bold mb-2">{bookInfo.title}</h2>
                    <p className="text-muted-foreground mb-2">{bookInfo.author}</p>
                    <p className="text-sm text-muted-foreground">{bookInfo.description}</p>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full justify-center font-semibold shadow-md" 
                    size="default"
                    onClick={() => {
                      if (user) {
                        const redirectUrl = `/demande-reproduction?documentId=${encodeURIComponent(id || '')}&documentTitle=${encodeURIComponent(documentData?.title || '')}`;
                        navigate(redirectUrl);
                      } else {
                        setShowReproductionAuthModal(true);
                      }
                    }}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    Demande de reproduction
                  </Button>

                  <Separator />

                  {/* Accordion pour les informations essentielles */}
                  <Accordion type="multiple" defaultValue={["essential"]} className="w-full">
                    {/* Informations essentielles */}
                    <AccordionItem value="essential">
                      <AccordionTrigger className="text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Informations essentielles
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground font-medium">Auteur:</span>
                            <p className="font-semibold text-foreground mt-1">{bookInfo.author}</p>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground font-medium">Année:</span>
                            <p className="font-semibold text-foreground mt-1">{bookInfo.date}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground font-medium">Numéro de cote:</span>
                            <p className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">{id}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground font-medium">Résumé:</span>
                            <p className="text-foreground mt-1 leading-relaxed">{bookInfo.description}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Détails techniques */}
                    <AccordionItem value="technical">
                      <AccordionTrigger className="text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Détails techniques
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Langue:</span>
                            <span className="font-medium">{bookInfo.language}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="font-medium">{bookInfo.pages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Format:</span>
                            <span className="font-medium">{bookInfo.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taille:</span>
                            <span className="font-medium">{bookInfo.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Collection:</span>
                            <Badge variant="secondary" className="text-xs">{bookInfo.collection}</Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Audio (si disponible) */}
                    {bookInfo.hasAudio && (
                      <AccordionItem value="audio">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Version audio
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Durée:</span>
                              <span className="font-medium">{bookInfo.audioDuration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Disponible:</span>
                              <Badge variant="default" className="text-xs">Oui</Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                  <Separator />

                  {/* Permalink */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Permalien</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={bookInfo.permalink} 
                        readOnly 
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(bookInfo.permalink);
                          toast.success("Lien copié!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm mb-3">Actions</h3>
                    
                    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Partager</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <Button onClick={() => handleShare("facebook")} variant="outline">
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                          </Button>
                          <Button onClick={() => handleShare("twitter")} variant="outline">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                          <Button onClick={() => handleShare("linkedin")} variant="outline">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Button>
                          <Button onClick={() => handleShare("email")} variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            E-mail
                          </Button>
                          <Button onClick={() => handleShare("copy")} variant="outline" className="col-span-2">
                            <Copy className="h-4 w-4 mr-2" />
                            Copier lien
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>


                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleDownload("PDF")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => toggleBookmark(currentPage)}
                    >
                      <Bookmark 
                        className={`h-4 w-4 mr-2 ${bookmarks.includes(currentPage) ? "fill-current" : ""}`} 
                      />
                      {bookmarks.includes(currentPage) ? "Retirer marque-page" : "Ajouter marque-page"}
                    </Button>

                  </div>
                </TabsContent>

                <TabsContent value="chapters" className="space-y-2 mt-6">
                  <h3 className="font-semibold mb-3">Table des matières</h3>
                  {chapters.map((chapter, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-between text-left"
                      size="sm"
                      onClick={() => goToPage(chapter.page)}
                    >
                      <span className="text-sm truncate">{chapter.name}</span>
                      <span className="text-xs text-muted-foreground">p.{chapter.page}</span>
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="search" className="mt-6">
                  <SidebarSearchInBook 
                    documentId={documentData?.id || id || ''}
                    onPageSelect={(pageNumber, highlightText) => {
                      goToPage(pageNumber);
                      // Stocker le texte recherché pour la surbrillance
                      if (highlightText) {
                        setSearchHighlight(highlightText);
                      }
                    }}
                    isOcrProcessed={isOcrProcessed}
                  />
                </TabsContent>

                <TabsContent value="bookmarks" className="space-y-2 mt-6">
                  <h3 className="font-semibold mb-3">Marque-pages ({bookmarks.length})</h3>
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucun marque-page
                    </p>
                  ) : (
                    bookmarks.sort((a, b) => a - b).map((page) => (
                      <Button
                        key={page}
                        variant="ghost"
                        className="w-full justify-between"
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        <span>Page {page}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(page);
                          }}
                        >
                          ✕
                        </Button>
                      </Button>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Book Viewer */}
        <main ref={mainContentRef} className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden relative">
          {/* Toolbar */}
          {(() => {
            const content = (
              <div className="flex items-center justify-between gap-4">
              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // En mode scroll, le state currentPage ne reflète pas forcément la position réelle,
                    // donc on force toujours un scroll vers le haut.
                    if (viewMode === "scroll") {
                      // Try virtualized scroll container first (PDF mode), then fallback
                      const virtualizedContainer = document.getElementById("virtualized-scroll-container");
                      const scrollContainer = document.getElementById("scroll-container");
                      const targetContainer = virtualizedContainer || scrollContainer;
                      
                      if (targetContainer) {
                        targetContainer.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                      setCurrentPage(1);
                      return;
                    }

                    setCurrentPage(1);
                  }}
                  disabled={viewMode !== "scroll" && currentPage === 1}
                  title="Retour à la première page"
                >
                  <ChevronsUp className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCurrentPage(Math.min(totalPages, Math.max(1, val)));
                    }}
                    className="w-16 text-center h-9 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1">
                <Button 
                  variant={viewMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("single")}
                  title="Mode page simple"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Simple
                </Button>
                <Button 
                  variant={viewMode === "double" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!allowDoublePageViewRestriction) {
                      toast.error("Le mode double page est désactivé pour ce document");
                      return;
                    }
                    setViewMode("double");
                  }}
                  title={allowDoublePageViewRestriction ? "Mode livre (double page)" : "Mode non disponible"}
                  disabled={!allowDoublePageViewRestriction}
                  className={!allowDoublePageViewRestriction ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Double
                </Button>
                <Button 
                  variant={viewMode === "scroll" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!allowScrollViewRestriction) {
                      toast.error("Le mode défilement est désactivé pour ce document");
                      return;
                    }
                    setViewMode("scroll");
                  }}
                  title={allowScrollViewRestriction ? "Mode défilement vertical" : "Mode non disponible"}
                  disabled={!allowScrollViewRestriction}
                  className={!allowScrollViewRestriction ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Scroll
                </Button>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" title="Rotation">
                      <RotateCw className="h-4 w-4" />
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Rotation</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleRotate}>
                      Tourner l'affichage (90°)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => togglePageRotation(currentPage)}>
                      {pageRotations[currentPage] ? "Rétablir" : "Tourner"} la page {currentPage} (180°)
                    </DropdownMenuItem>
                    {viewMode === "double" && currentPage + 1 <= totalPages && (
                      <DropdownMenuItem onClick={() => togglePageRotation(currentPage + 1)}>
                        {pageRotations[currentPage + 1] ? "Rétablir" : "Tourner"} la page {currentPage + 1} (180°)
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleResetRotation}
                      disabled={rotation === 0 && Object.keys(pageRotations).length === 0}
                    >
                      Réinitialiser (version originale)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFullPage(true)}
                  title="Mode plein écran"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={showSearch ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  title="Recherche par mot clé"
                >
                  <Search className="h-4 w-4" />
                </Button>
                
                {/* Indicateur de surbrillance active */}
                {searchHighlight && (
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => setSearchHighlight("")}
                    title="Cliquer pour effacer la surbrillance"
                  >
                    <span className="max-w-[100px] truncate">"{searchHighlight}"</span>
                    <span className="text-xs">✕</span>
                  </Badge>
                )}
              </div>

              {/* Reading Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {readingMode === "book" ? <FileText className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    {readingMode === "book" ? "Liseuse" : "Audio"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setReadingMode("book")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Mode Liseuse
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setReadingMode("audio")} disabled={!bookInfo.hasAudio}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Mode Audio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            );

            if (viewMode === "scroll" && floatingToolbarStyle) {
              return createPortal(
                <div
                  style={floatingToolbarStyle}
                  className="bg-background/95 backdrop-blur-sm border-b shadow-sm p-3"
                >
                  {content}
                </div>,
                document.body
              );
            }

            return (
              <div className="bg-muted/30 backdrop-blur-sm border-b p-3 z-30 shrink-0">
                {content}
              </div>
            );
          })()}

          {/* Book Display Area */}
          {readingMode === "book" ? (
            <main ref={mainContentRef} id="scroll-container" className={`flex-1 min-h-0 min-w-0 overflow-hidden bg-muted/10 flex flex-col`}>
              {loading ? (
                <div className="text-center">
                  <p className="text-muted-foreground">Chargement du document...</p>
                </div>
              ) : !hasDisplayableContent ? (
                /* Aucun PDF ni pages disponibles - afficher un message d'erreur */
                <div className="text-center p-8">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Document non disponible</h3>
                    <p className="text-muted-foreground">
                      Ce document n'a pas encore été numérisé ou le fichier PDF n'est pas disponible.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Veuillez contacter la bibliothèque pour plus d'informations ou demander la numérisation de ce document.
                    </p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                  </div>
                </div>
              ) : viewMode === "double" ? (
                <div className="flex-1 min-h-0 flex items-center justify-center p-0 relative">
                  <PanZoomContainer
                    zoom={zoom}
                    rotation={0}
                    className="w-full h-full"
                  >
                    {canUseDoubleMode ? (
                      <PageFlipBook 
                        ref={pageFlipRef as any}
                        images={generatePageImages()}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        zoom={100}
                        rotation={rotation}
                        pageRotations={pageRotations}
                        isRtl={isArabicDocument()}
                      />
                    ) : pdfUrl ? (
                      /* Mode Double avec PDF - effet livre avec glisser-déposer */
                      <PdfPageFlipBook
                        ref={pageFlipRef as any}
                        pdfUrl={pdfUrl}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        zoom={100}
                        rotation={rotation}
                        pageRotations={pageRotations}
                        isRtl={isArabicDocument()}
                        onTotalPagesChange={setActualTotalPages}
                        searchHighlight={searchHighlight}
                      />
                    ) : null}
                  </PanZoomContainer>
                  
                  {/* Boutons marque-page positionnés hors du PanZoomContainer */}
                  <div className="absolute top-6 left-6 z-20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-background/80 backdrop-blur-sm shadow-sm"
                      onClick={() => toggleBookmark(currentPage)}
                      title={bookmarks.includes(currentPage) ? `Retirer marque-page p.${currentPage}` : `Ajouter marque-page p.${currentPage}`}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarks.includes(currentPage) ? "fill-current text-primary" : ""}`} />
                      <span className="ml-1 text-xs">{currentPage}</span>
                    </Button>
                  </div>
                  {currentPage + 1 <= totalPages && (
                    <div className="absolute top-6 right-6 z-20">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-background/80 backdrop-blur-sm shadow-sm"
                        onClick={() => toggleBookmark(currentPage + 1)}
                        title={bookmarks.includes(currentPage + 1) ? `Retirer marque-page p.${currentPage + 1}` : `Ajouter marque-page p.${currentPage + 1}`}
                      >
                        <span className="mr-1 text-xs">{currentPage + 1}</span>
                        <Bookmark className={`h-4 w-4 ${bookmarks.includes(currentPage + 1) ? "fill-current text-primary" : ""}`} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : viewMode === "scroll" ? (
                /* Mode défilement vertical - scroll géré par VirtualizedScrollReader ou le conteneur interne */
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {/* Conteneur pour le scroll - hauteur contrainte */}
                  <div className="flex-1 min-h-0 h-full">
                    {pdfUrl && documentPages.length === 0 ? (
                      <VirtualizedScrollReader
                        pdfUrl={pdfUrl}
                        totalPages={actualTotalPages}
                        zoom={zoom}
                        rotation={rotation}
                        pageRotations={pageRotations}
                        bookmarks={bookmarks}
                        onToggleBookmark={toggleBookmark}
                        onCurrentPageChange={setCurrentPage}
                        isPageAccessible={isPageAccessible}
                        restrictedPageDisplay={restrictedPageDisplay}
                        getAccessDeniedMessage={getAccessDeniedMessage}
                        searchHighlight={searchHighlight}
                        documentId={documentData?.id || id}
                      />
                    ) : (
                      /* Mode scroll avec images pré-extraites - scroll interne */
                      <div className="h-full overflow-y-auto overscroll-contain scroll-smooth flex flex-col items-center gap-6 pb-8 p-4 md:p-8">
                        {generatePageImages().map((pageImage, index) => {
                          const pageNum = index + 1;
                          const isAccessible = isPageAccessible(pageNum);
                          
                          if (!isAccessible && restrictedPageDisplay === "hidden") {
                            return null;
                          }
                          
                          return (
                            <div 
                              key={pageNum} 
                              className="relative"
                              id={`page-${pageNum}`}
                            >
                              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                <Badge variant="secondary" className="text-xs">
                                  Page {pageNum}
                                </Badge>
                              </div>
                              
                              <Card 
                                className="shadow-xl"
                                style={{
                                  transform: `scale(${zoom / 100}) rotate(${rotation + (pageRotations[pageNum] ?? 0)}deg)`,
                                  transformOrigin: 'center',
                                  transition: 'transform 0.3s ease'
                                }}
                              >
                                <CardContent className="p-0">
                                  <div className="w-full max-w-[600px] bg-gradient-to-br from-background to-muted flex items-center justify-center relative overflow-hidden">
                                    {isAccessible ? (
                                      <img 
                                        src={pageImage}
                                        alt={`Page ${pageNum}`}
                                        className="w-full h-auto object-contain"
                                        loading="lazy"
                                      />
                                    ) : restrictedPageDisplay === "blur" ? (
                                      <div className="relative w-full">
                                        <img 
                                          src={pageImage}
                                          alt={`Page ${pageNum}`}
                                          className="w-full h-auto object-contain filter blur-lg"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                          <div className="text-center p-4 bg-background/90 rounded-lg shadow-lg">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                                            <p className="text-sm font-medium">Page restreinte</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {getAccessDeniedMessage()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full aspect-[3/4] flex items-center justify-center bg-muted/50">
                                        <div className="text-center p-8">
                                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                                          <p className="text-muted-foreground text-sm">
                                            {getAccessDeniedMessage()}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    {bookmarks.includes(pageNum) && (
                                      <Badge className="absolute top-4 right-4 bg-primary/90">
                                        <Bookmark className="h-3 w-3 mr-1 fill-current" />
                                        Marqué
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => toggleBookmark(pageNum)}
                              >
                                <Bookmark className={`h-4 w-4 ${bookmarks.includes(pageNum) ? "fill-current text-primary" : ""}`} />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode Simple - ajuster à la hauteur du conteneur en conservant le ratio */
                <div 
                  className="flex-1 min-h-0 flex items-center justify-center p-2"
                  style={{ height: 'calc(100vh - 10rem)' }}
                >
                  {(() => {
                    const totalRotation = rotation + (pageRotations[currentPage] ?? 0);
                    const isPdfMode = pdfUrl && documentPages.length === 0;

                    return (
                      <PanZoomContainer
                        zoom={zoom}
                        rotation={isPdfMode ? 0 : totalRotation}
                        className="h-full w-full"
                      >
                        <div className="relative">
                          <Card 
                            className="shadow-2xl overflow-hidden"
                            style={{ maxHeight: '100%', height: 'auto' }}
                          >
                            <CardContent className="p-0 flex items-center justify-center">
                              <div className="relative flex items-center justify-center">
                                {isPdfMode ? (
                                  <PdfPageWithHighlight
                                    pdfUrl={pdfUrl}
                                    pageNumber={currentPage}
                                    scale={1.2}
                                    rotation={totalRotation}
                                    className=""
                                    onPageLoad={(totalPages) => {
                                      if (actualTotalPages !== totalPages) {
                                        setActualTotalPages(totalPages);
                                      }
                                    }}
                                    preloadPages={[currentPage - 1, currentPage + 1, currentPage + 2]}
                                    searchHighlight={searchHighlight}
                                    documentId={documentData?.id || id}
                                  />
                                ) : documentPages.length > 0 || (documentImage && !documentImage.includes('manuscript-page')) ? (
                                  <img
                                    src={getCurrentPageImage(currentPage) || ''}
                                    alt={`Page ${currentPage}`}
                                    className="block w-auto h-auto object-contain pointer-events-none"
                                    style={{ maxHeight: 'calc(100vh - 12rem)' }}
                                  />
                                ) : (
                                  /* Fallback - ne devrait pas arriver grâce à hasDisplayableContent */
                                  <div className="flex items-center justify-center p-16 text-muted-foreground">
                                    <FileText className="h-12 w-12 mr-4" />
                                    <span>Contenu non disponible</span>
                                  </div>
                                )}
                                {bookmarks.includes(currentPage) && (
                                  <Badge className="absolute top-4 left-4 bg-primary/90">
                                    <Bookmark className="h-3 w-3 mr-1 fill-current" />
                                    Marqué
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Bouton marque-page intégré sur la page - comme en mode Scroll */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => toggleBookmark(currentPage)}
                            title={bookmarks.includes(currentPage) ? "Retirer marque-page" : "Ajouter marque-page"}
                          >
                            <Bookmark className={`h-4 w-4 ${bookmarks.includes(currentPage) ? "fill-current text-primary" : ""}`} />
                          </Button>
                        </div>
                      </PanZoomContainer>
                    );
                  })()}
                </div>
              )}
            </main>
          ) : (
            // Audio Mode
            <div className="flex-1 overflow-auto bg-muted/10 p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <Volume2 className="h-32 w-32 text-primary/40" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold mb-2">{bookInfo.title}</h2>
                        <p className="text-muted-foreground">{bookInfo.author}</p>
                      </div>

                      {/* Audio Player Controls */}
                      <div className="space-y-4">
                        <Slider 
                          value={[audioPosition]} 
                          max={100}
                          step={1}
                          onValueChange={(value) => setAudioPosition(value[0])}
                          className="w-full"
                        />
                        
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="icon">
                            <SkipBack className="h-5 w-5" />
                          </Button>
                          <Button size="icon" className="h-14 w-14" onClick={toggleAudioPlay}>
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>
                          <Button variant="outline" size="icon">
                            <SkipForward className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="sm" onClick={toggleAudioBookmark}>
                            <BookMarked className="h-4 w-4 mr-2" />
                            Marquer
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Vitesse: {audioSpeed}x
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setAudioSpeed(0.5)}>0.5x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(0.75)}>0.75x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1)}>1x (Normal)</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1.25)}>1.25x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1.5)}>1.5x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(2)}>2x</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Audio Bookmarks */}
                        {audioBookmarks.length > 0 && (
                          <div className="mt-6 space-y-2">
                            <h4 className="font-semibold text-sm">Marque-pages audio</h4>
                            <div className="flex flex-wrap gap-2">
                              {audioBookmarks.map((pos) => (
                                <Badge 
                                  key={pos}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => setAudioPosition(pos)}
                                >
                                  {Math.floor(pos / 60)}:{(pos % 60).toString().padStart(2, '0')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Page Progress (Book mode only) */}
          {readingMode === "book" && (
            <div className="bg-muted/30 border-t p-4">
              <Slider 
                value={[currentPage]} 
                max={totalPages}
                step={1}
                onValueChange={(value) => setCurrentPage(value[0])}
                className="w-full"
              />
            </div>
          )}
        </main>

        {/* Document Search Panel */}
        {showSearch && (documentData?.id || id) && (
          <DocumentSearchInBook 
            documentId={documentData?.id || id || ''}
            onPageSelect={(pageNumber, highlightText) => {
              goToPage(pageNumber);
              setShowSearch(false);
              // Stocker le texte recherché pour la surbrillance
              if (highlightText) {
                setSearchHighlight(highlightText);
              }
            }}
            isOcrProcessed={isOcrProcessed}
          />
        )}
      </div>

      {/* Reproduction Auth Choice Modal */}
      <ReproductionAuthChoiceModal
        open={showReproductionAuthModal}
        onOpenChange={setShowReproductionAuthModal}
        documentId={id}
        documentTitle={documentData?.title}
      />

      {/* Full Page Overlay */}
      {isFullPage && readingMode === "book" && (
        <FullPageOverlay
          onClose={() => setIsFullPage(false)}
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onRotate={handleRotate}
        >
          {pdfUrl && documentPages.length === 0 ? (
            <PdfPageWithHighlight
              pdfUrl={pdfUrl}
              pageNumber={currentPage}
              scale={zoom / 60}
              rotation={rotation + (pageRotations[currentPage] ?? 0)}
              className="max-h-[calc(100vh-6rem)]"
              onPageLoad={(totalPages) => {
                if (actualTotalPages !== totalPages) {
                  setActualTotalPages(totalPages);
                }
              }}
              searchHighlight={searchHighlight}
              documentId={documentData?.id || id}
            />
          ) : documentPages.length > 0 || documentImage ? (
            <img
              src={getCurrentPageImage(currentPage) || ''}
              alt={`Page ${currentPage}`}
              className="max-h-[calc(100vh-6rem)] w-auto object-contain"
              style={{
                transform: `rotate(${rotation + (pageRotations[currentPage] ?? 0)}deg)`,
              }}
            />
          ) : null}
        </FullPageOverlay>
      )}

      </div>
    </DigitalLibraryLayout>
  );
};

export default BookReader;
