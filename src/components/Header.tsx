import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail, UserCheck, Archive, ChevronDown, Accessibility, Bot, MessageCircle, Shield, HelpCircle, Network, LayoutDashboard, Handshake, Settings } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SmartChatBot from "@/components/SmartChatBot";
import { AccessibilityToolkit } from "@/components/AccessibilityToolkit";
import MessagingButton from "@/components/messaging/MessagingButton";
import NotificationsButton from "@/components/notifications/NotificationsButton";
import { BNRMTooltip } from "@/components/ui/bnrm-tooltip";
import logoImage from "@/assets/bnrm-portal-logo.gif";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Multilingual text helper - returns text for current language with fallback to fr
type MLText = { fr: string; ar: string; en?: string; es?: string; amz?: string };

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { goBack } = useNavigationHistory();
  const isHomePage = location.pathname === "/";

  // Helper to get text from multilingual object
  const ml = (texts: MLText): string => {
    return (texts as any)[language] || texts.fr;
  };

  // Menu data structure with full multilingual support
  const menuData = {
    discover: {
      practicalInfo: {
        title: { fr: "Informations pratiques", ar: "معلومات عملية", en: "Practical Information", es: "Información práctica", amz: "ⵉⵏⵖⵎⵉⵙⵏ ⵉⵎⵙⴷⴰⵡⵏ" },
        items: [
          {
            title: { fr: "Horaires et accès", ar: "المواعيد والوصول", en: "Hours & Access", es: "Horarios y acceso", amz: "ⵜⵉⵙⵔⴰⴳⵉⵏ ⴷ ⵓⴽⵛⵛⵓⵎ" },
            desc: { fr: "Consultez nos horaires d'ouverture et comment nous rejoindre", ar: "استشر مواعيد فتحنا وكيفية الوصول إلينا", en: "Check our opening hours and how to reach us", es: "Consulte nuestros horarios de apertura y cómo llegar", amz: "ⵙⵙⵓⴷⵓ ⵜⵉⵙⵔⴰⴳⵉⵏ ⵏ ⵓⵕⵥⵥⵓⵎ" },
            href: "/practical-info"
          },
          {
            title: { fr: "Catalogue de services et tarifs", ar: "كتالوج الخدمات والتعريفات", en: "Services Catalog & Rates", es: "Catálogo de servicios y tarifas", amz: "ⴰⴽⵜⴰⵍⵓⴳ ⵏ ⵜⵉⵏⴰⴼⵓⵜⵉⵏ" },
            desc: { fr: "Découvrez nos services et leurs tarifs", ar: "اكتشف خدماتنا وتعريفاتها", en: "Discover our services and rates", es: "Descubra nuestros servicios y tarifas", amz: "ⵙⵙⵓⴷⵓ ⵜⵉⵏⴰⴼⵓⵜⵉⵏ ⵏⵏⵖ" },
            href: "/services-tarifs"
          },
          {
            title: { fr: "Visites virtuelles", ar: "الجولات الافتراضية", en: "Virtual Tours", es: "Visitas virtuales", amz: "ⵜⵉⵔⵣⵉⵡⵉⵏ ⵜⵉⵎⵙⵍⵉⵏ" },
            desc: { fr: "Explorez la bibliothèque depuis chez vous", ar: "استكشف المكتبة من منزلك", en: "Explore the library from home", es: "Explore la biblioteca desde casa", amz: "ⵙⵙⵓⴷⵓ ⵜⴰⵙⴷⵍⵉⵙⵜ ⵙⴳ ⵜⴰⴷⴷⴰⵔⵜ" },
            href: "/page/visites-virtuelles"
          },
          {
            title: { fr: "Nos donateurs", ar: "متبرعونا", en: "Our Donors", es: "Nuestros donantes", amz: "ⵉⵎⵙⵙⴰⴽⴰⵏ ⵏⵏⵖ" },
            desc: { fr: "Recherchez par donateurs ou par œuvre", ar: "ابحث حسب المتبرعين أو العمل", en: "Search by donor or by work", es: "Busque por donante o por obra", amz: "ⵔⵣⵓ ⵙ ⵓⵎⵙⵙⴰⴽ ⵏⵖ ⵙ ⵜⵡⵓⵔⵉ" },
            href: "/page/donateurs"
          }
        ]
      },
      historyMissions: {
        title: { fr: "Histoire et missions", ar: "التاريخ والمهام", en: "History & Missions", es: "Historia y misiones", amz: "ⴰⵎⵣⵔⵓⵢ ⴷ ⵜⵉⵎⵀⴰⵍ" },
        items: [
          {
            title: { fr: "Histoire de la bibliothèque", ar: "تاريخ المكتبة", en: "Library History", es: "Historia de la biblioteca", amz: "ⴰⵎⵣⵔⵓⵢ ⵏ ⵜⵙⴷⵍⵉⵙⵜ" },
            desc: { fr: "Missions et valeurs prônées", ar: "المهام والقيم المؤيدة", en: "Missions and values", es: "Misiones y valores", amz: "ⵜⵉⵎⵀⴰⵍ ⴷ ⵉⴰⵣⴰⵍⵏ" },
            href: "/page/histoire"
          },
          {
            title: { fr: "Mot de la Direction", ar: "كلمة الإدارة", en: "Director's Message", es: "Mensaje de la Dirección", amz: "ⴰⵡⴰⵍ ⵏ ⵜⵎⵀⵍⴰ" },
            desc: { fr: "Message du directeur de la BNRM", ar: "رسالة مدير المكتبة", en: "Message from the BNRM director", es: "Mensaje del director de la BNRM", amz: "ⵜⴰⴱⵔⴰⵜ ⵏ ⵓⵏⵎⵀⴰⵍ" },
            href: "/page/mot-direction"
          },
          {
            title: { fr: "Organigramme", ar: "الهيكل التنظيمي", en: "Organization Chart", es: "Organigrama", amz: "ⴰⵙⵖⵏⵓ ⴰⵎⵙⵙⵓⴳⵓⵔ" },
            desc: { fr: "Structure organisationnelle de la BNRM", ar: "الهيكل التنظيمي للمكتبة", en: "BNRM organizational structure", es: "Estructura organizativa de la BNRM", amz: "ⴰⵙⴽⴽⵉⵍ ⴰⵎⵙⵙⵓⴳⵓⵔ" },
            href: "/page/organigramme"
          }
        ]
      }
    },
    services: {
      userServices: {
        title: { fr: "Services aux usagers", ar: "الخدمات للمستخدمين", en: "User Services", es: "Servicios al usuario", amz: "ⵜⵉⵏⴰⴼⵓⵜⵉⵏ ⵉ ⵉⵎⵙⵙⵎⵔⵙⵏ" },
        items: [
          {
            title: { fr: "Inscription professionnels", ar: "تسجيل المهنيين", en: "Professional Registration", es: "Inscripción profesionales", amz: "ⴰⵙⵎⴰⵍ ⵏ ⵉⵎⵙⵙⵓⴳⵓⵔⵏ" },
            desc: { fr: "Créer votre compte professionnel pour accéder aux services du Dépôt légal", ar: "إنشاء حساب مهني للوصول إلى خدمات الإيداع القانوني", en: "Create your professional account for Legal Deposit services", es: "Cree su cuenta profesional para los servicios de Depósito Legal", amz: "ⵙⵏⴼⵍⵓⵍ ⴰⵎⵉⴹⴰⵏ ⴰⵎⵙⵙⵓⴳⵓⵔ" },
            href: "/auth?action=signup&type=professional"
          },
          {
            title: { fr: "Adhésion (Abonnement)", ar: "الاشتراك (العضوية)", en: "Membership (Subscription)", es: "Adhesión (Suscripción)", amz: "ⴰⵙⵎⴰⵍ (ⴰⵎⵢⴰⵙⵙⴰ)" },
            desc: { fr: "Découvrez nos différentes formules d'adhésion et d'abonnement", ar: "اكتشف أنواع العضوية والاشتراكات المتاحة", en: "Discover our membership and subscription plans", es: "Descubra nuestras fórmulas de adhesión y suscripción", amz: "ⵙⵙⵓⴷⵓ ⵜⵉⵖⴰⵡⵙⵉⵡⵉⵏ ⵏ ⵓⵎⵢⴰⵙⵙⴰ" },
            href: "/abonnements"
          },
          {
            title: { fr: "Pass journalier", ar: "التصريح اليومي", en: "Daily Pass", es: "Pase diario", amz: "ⴰⵙⵉⵔⴰ ⵏ ⵡⴰⵙⵙ" },
            desc: { fr: "Accès illimité gratuit - 1 fois par an", ar: "وصول مجاني غير محدود - مرة واحدة في السنة", en: "Free unlimited access - once per year", es: "Acceso ilimitado gratuito - 1 vez al año", amz: "ⴰⴽⵛⵛⵓⵎ ⵉⵍⴻⵍⵍⵉ" },
            href: "/services-bnrm?open=daily-pass"
          },
          {
            title: { fr: "Consulter la Bibliothèque Nationale", ar: "استشارة المكتبة الوطنية", en: "Consult the National Library", es: "Consultar la Biblioteca Nacional", amz: "ⵙⵙⵓⴷⵓ ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ" },
            desc: { fr: "Accédez à notre bibliothèque numérique", ar: "الوصول إلى مكتبتنا الرقمية", en: "Access our digital library", es: "Acceda a nuestra biblioteca digital", amz: "ⴽⵛⵎ ⵖⵔ ⵜⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ" },
            href: "/digital-library"
          },
          {
            title: { fr: "Réserver un document", ar: "حجز وثيقة", en: "Reserve a Document", es: "Reservar un documento", amz: "ⴰⵃⵟⵟⵓ ⵏ ⵓⵙⴳⴷ" },
            desc: { fr: "Recherchez et réservez un document CBN", ar: "ابحث واحجز وثيقة", en: "Search and reserve a CBN document", es: "Busque y reserve un documento CBN", amz: "ⵔⵣⵓ ⴷ ⵃⵟⵟⵓ ⴰⵙⴳⴷ" },
            href: "/cbn/reserver-ouvrage"
          },
          {
            title: { fr: "Réserver nos espaces", ar: "حجز مساحاتنا", en: "Reserve Our Spaces", es: "Reservar nuestros espacios", amz: "ⴰⵃⵟⵟⵓ ⵏ ⵉⴷⵖⴰⵔⵏ ⵏⵏⵖ" },
            desc: { fr: "Réservez un espace de travail ou une salle", ar: "احجز مساحة عمل أو قاعة", en: "Reserve a workspace or meeting room", es: "Reserve un espacio de trabajo o sala", amz: "ⵃⵟⵟⵓ ⴰⴷⵖⴰⵔ ⵏ ⵜⵡⵓⵔⵉ" },
            href: "/reservation-espaces"
          }
        ]
      },
      specializedServices: {
        title: { fr: "Services spécialisés", ar: "الخدمات المتخصصة", en: "Specialized Services", es: "Servicios especializados", amz: "ⵜⵉⵏⴰⴼⵓⵜⵉⵏ ⵜⵓⵙⵍⵉⴳⵉⵏ" },
        items: [
          {
            title: { fr: "Dépôt légal", ar: "الإيداع القانوني", en: "Legal Deposit", es: "Depósito legal", amz: "ⴰⵙⵔⵙ ⴰⵏⴰⵎⵓⵙ" },
            desc: { fr: "Service obligatoire selon le Dahir n° 1-60-050 (1960)", ar: "خدمة إلزامية حسب الظهير رقم 1-60-050 (1960)", en: "Mandatory service under Dahir n° 1-60-050 (1960)", es: "Servicio obligatorio según el Dahir n° 1-60-050 (1960)", amz: "ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⵎⵙⵜⴳⴳⴰⵔⵜ" },
            href: "/depot-legal"
          },
          {
            title: { fr: "Demande de reproduction", ar: "طلب النسخ", en: "Reproduction Request", es: "Solicitud de reproducción", amz: "ⴰⵙⵓⵜⵔ ⵏ ⵓⵙⵏⵖⵍ" },
            desc: { fr: "Commandez des reproductions de documents", ar: "اطلب نسخًا من الوثائق", en: "Order document reproductions", es: "Solicite reproducciones de documentos", amz: "ⵙⵓⵜⵔ ⵉⵙⵏⵖⴰⵍ ⵏ ⵉⵙⴳⴷⴰⵏ" },
            href: "/demande-reproduction"
          },
          {
            title: { fr: "Demande de restauration", ar: "طلب الترميم", en: "Restoration Request", es: "Solicitud de restauración", amz: "ⴰⵙⵓⵜⵔ ⵏ ⵓⵙⴱⴷⴷⵉ" },
            desc: { fr: "Service de restauration de documents anciens", ar: "خدمة ترميم الوثائق القديمة", en: "Ancient document restoration service", es: "Servicio de restauración de documentos antiguos", amz: "ⵜⴰⵏⴰⴼⵓⵜ ⵏ ⵓⵙⴱⴷⴷⵉ ⵏ ⵉⵙⴳⴷⴰⵏ ⵉⵇⴱⵓⵔⵏ" },
            href: "/demande-restauration"
          }
        ]
      }
    },
    news: {
      news: {
        title: { fr: "Actualités", ar: "الأخبار", en: "News", es: "Noticias", amz: "ⵉⵏⵖⵎⵉⵙⵏ" },
        items: [
          {
            title: { fr: "Actualités et publications", ar: "الأخبار والمنشورات", en: "News & Publications", es: "Noticias y publicaciones", amz: "ⵉⵏⵖⵎⵉⵙⵏ ⴷ ⵜⵉⵣⵔⴰⵡⵉⵏ" },
            desc: { fr: "Nouvelles acquisitions et actualités du fonds documentaire", ar: "المقتنيات الجديدة وأخبار الرصيد الوثائقي", en: "New acquisitions and documentary fund news", es: "Nuevas adquisiciones y noticias del fondo documental", amz: "ⵉⵙⴰⵖⵏ ⵉⵎⴰⵢⵏⵓⵜⵏ" },
            href: "/news"
          },
          {
            title: { fr: "Ils parlent de nous", ar: "يتحدثون عنا", en: "They Talk About Us", es: "Hablan de nosotros", amz: "ⵙⴰⵡⴰⵍⵏ ⴼ ⵏⵏⵖ" },
            desc: { fr: "La BNRM dans les médias et publications", ar: "المكتبة في وسائل الإعلام والمنشورات", en: "BNRM in media and publications", es: "La BNRM en los medios y publicaciones", amz: "ⵜⴰⵙⴷⵍⵉⵙⵜ ⴳ ⵉⵎⴰⵙⵙⵏ ⵏ ⵓⵙⵏⵖⵎⵙ" },
            href: "/page/ils-parlent-de-nous"
          }
        ]
      },
      cultural: {
        title: { fr: "Notre programmation culturelle", ar: "برنامجنا الثقافي", en: "Our Cultural Programming", es: "Nuestra programación cultural", amz: "ⴰⵖⴰⵡⴰⵙ ⵏⵏⵖ ⴰⴷⵍⵙⴰⵏ" },
        items: [
          {
            title: { fr: "Programmation culturelle", ar: "البرمجة الثقافية", en: "Cultural Programming", es: "Programación cultural", amz: "ⴰⵖⴰⵡⴰⵙ ⴰⴷⵍⵙⴰⵏ" },
            desc: { fr: "Découvrez nos activités culturelles", ar: "اكتشف أنشطتنا الثقافية", en: "Discover our cultural activities", es: "Descubra nuestras actividades culturales", amz: "ⵙⵙⵓⴷⵓ ⵜⵉⵎⵙⴰⵔⵉⵏ ⵏⵏⵖ ⵜⵉⴷⵍⵙⴰⵏⵉⵏ" },
            href: "/page/programmation-culturelle"
          },
          {
            title: { fr: "Agenda", ar: "الأجندة", en: "Calendar", es: "Agenda", amz: "ⴰⵙⵎⴰⵍ" },
            desc: { fr: "Calendrier de nos événements", ar: "تقويم فعالياتنا", en: "Our events calendar", es: "Calendario de nuestros eventos", amz: "ⴰⵙⵎⴰⵍ ⵏ ⵜⵉⵎⵙⴰⵔⵉⵏ ⵏⵏⵖ" },
            href: "/page/agenda"
          },
          {
            title: { fr: "Nos expositions", ar: "معارضنا", en: "Our Exhibitions", es: "Nuestras exposiciones", amz: "ⵜⵉⵙⵎⵖⵓⵔⵉⵏ ⵏⵏⵖ" },
            desc: { fr: "Expositions actuelles et passées", ar: "المعارض الحالية والسابقة", en: "Current and past exhibitions", es: "Exposiciones actuales y pasadas", amz: "ⵜⵉⵙⵎⵖⵓⵔⵉⵏ ⵜⵉⵎⵉⵔⴰⵏⵉⵏ ⴷ ⵜⵉⵣⵔⵉⵏ" },
            href: "/page/expositions"
          }
        ]
      }
    },
    mecenat: {
      title: { fr: "Mécénat & Partenaires", ar: "الرعاية والشراكات", en: "Patronage & Partners", es: "Mecenazgo y Socios", amz: "ⴰⵙⵙⴹⵕⴰⵎ ⴷ ⵉⵎⴷⵔⴰⵡⵏ" },
      items: [
        {
          title: { fr: "Nos donateurs", ar: "متبرعونا", en: "Our Donors", es: "Nuestros donantes", amz: "ⵉⵎⵙⵙⴰⴽⴰⵏ ⵏⵏⵖ" },
          desc: { fr: "Découvrez nos mécènes et leurs œuvres", ar: "اكتشف المتبرعين وأعمالهم", en: "Discover our patrons and their works", es: "Descubra nuestros mecenas y sus obras", amz: "ⵙⵙⵓⴷⵓ ⵉⵎⵙⵙⴰⴽⴰⵏ ⵏⵏⵖ" },
          href: "/donateurs"
        },
        {
          title: { fr: "Offrir des collections", ar: "تقديم مجموعات", en: "Donate Collections", es: "Ofrecer colecciones", amz: "ⴰⴽⴼ ⵜⵉⴳⵔⴰⵡⵉⵏ" },
          desc: { fr: "Enrichir le fonds documentaire de la bibliothéque", ar: "إغناء الرصيد الوثائقي للمكتبة", en: "Enrich the library's documentary collection", es: "Enriquecer el fondo documental de la biblioteca", amz: "ⴰⵙⵎⵖⵓⵔ ⵏ ⵓⵃⵟⵟⵓ ⵏ ⵜⵙⴷⵍⵉⵙⵜ" },
          href: "/offrir-collections"
        },
        {
          title: { fr: "Dons financiers", ar: "التبرعات المالية", en: "Financial Donations", es: "Donaciones financieras", amz: "ⵜⵉⵙⵙⴰⴽⵉⵏ ⵏ ⵉⴷⵔⵉⵎⵏ" },
          desc: { fr: "Soutenez la bibliothèque par vos dons", ar: "ادعم المكتبة بتبرعاتك", en: "Support the library with your donations", es: "Apoye la biblioteca con sus donaciones", amz: "ⵎⵓⵏ ⵜⴰⵙⴷⵍⵉⵙⵜ ⵙ ⵜⵙⵙⴰⴽⵉⵏ ⵏⵏⴽ" },
          href: "/donation"
        }
      ]
    }
  };
  
  // Pages d'accueil principales (pas de bouton retour)
  const isDigitalLibraryHome = location.pathname === "/digital-library";
  const isManuscriptsPlatformHome = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform";
  const isSignupPage = location.pathname === "/signup";
  const isDepotLegalForm = location.pathname.startsWith("/depot-legal/");
  
  const isDigitalLibrary = location.pathname.startsWith("/digital-library");
  const isManuscriptsPlatform = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform" || location.pathname.startsWith("/manuscripts/");
  const isManuscriptsHelp = location.pathname === "/manuscripts/help" || location.pathname === "/aide-manuscrits";
  const isBackoffice = location.pathname.startsWith("/admin/manuscripts-backoffice") || location.pathname.startsWith("/admin/digital-library");
  const isCBMPortal = location.pathname.startsWith("/cbm");
  const hideNavigation = isDigitalLibrary || isManuscriptsPlatform || isManuscriptsHelp || isBackoffice || isCBMPortal;
  
  const showBackButton = !isHomePage && !isDigitalLibraryHome && !isManuscriptsPlatformHome && !isSignupPage && !isDepotLegalForm;

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Barre supérieure */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img src={logoImage} alt="Logo BNRM" className="h-14 w-auto" />
            </Link>
          
            <div className={`hidden md:flex flex-1 max-w-md mx-8 ${(location.pathname === '/plateforme-manuscrits' || location.pathname.startsWith('/admin/content-management-manuscrits')) ? 'invisible' : ''}`}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={ml({ fr: 'Rechercher...', ar: 'بحث...', en: 'Search...', es: 'Buscar...', amz: 'ⵔⵣⵓ...' })}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Administration Manuscrits - visible uniquement sur /plateforme-manuscrits pour admins/librarians */}
              {(location.pathname === '/plateforme-manuscrits' || location.pathname.startsWith('/admin/content-management-manuscrits')) && (profile?.role === 'admin' || profile?.role === 'librarian') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 bnrm-nav-menu text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100"
                  onClick={() => navigate('/admin/content-management-manuscrits')}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Administration</span>
                </Button>
              )}

              {/* Navigation Portails */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 bnrm-nav-menu text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                    <Building className="h-4 w-4" />
                    <span className="hidden md:inline">{ml({ fr: 'Portails', ar: 'البوابات', en: 'Portals', es: 'Portales', amz: 'ⵉⵏⴱⴱⴰⴹⵏ' })}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-64 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {ml({ fr: 'Portail Principal', ar: 'البوابة الرئيسية', en: 'Main Portal', es: 'Portal Principal', amz: 'ⴰⵏⴱⴱⴰⴹ ⴰⵎⵇⵔⴰⵏ' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/digital-library">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {ml({ fr: 'Bibliothèque Numérique', ar: 'المكتبة الرقمية', en: 'Digital Library', es: 'Biblioteca Digital', amz: 'ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/plateforme-manuscrits">
                      <FileText className="h-4 w-4 mr-2" />
                      {ml({ fr: 'Plateforme Manuscrits', ar: 'منصة المخطوطات', en: 'Manuscripts Platform', es: 'Plataforma Manuscritos', amz: 'ⴰⵙⵙⵉⵡⴹ ⵏ ⵉⵎⵙⴽⵜⴰⵢⵏ' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/cbm">
                      <Network className="h-4 w-4 mr-2" />
                      {ml({ fr: 'Plateforme CBM', ar: 'منصة الفهرس البيبليوغرافي', en: 'CBM Platform', es: 'Plataforma CBM', amz: 'ⴰⵙⵙⵉⵡⴹ CBM' })}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Langue */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} className="bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer">
                    🇲🇦 العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('amz')} className="cursor-pointer">
                    ⵣ ⵜⴰⵎⴰⵣⵉⵖⵜ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer">
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="cursor-pointer">
                    🇪🇸 Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <AccessibilityToolkit />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatBotOpen(!isChatBotOpen)}
                className={`text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100 relative ${isChatBotOpen ? 'bg-gray-100' : ''}`}
                title={ml({ fr: 'Assistant IA', ar: 'المساعد الذكي', en: 'AI Assistant', es: 'Asistente IA', amz: 'ⴰⵎⵙⵙⵓⵎⵓⵔ ⵏ ⵓⵎⵙⵙⵓⴳⵓⵔ' })}
              >
                <Bot className="h-5 w-5" />
                {!isChatBotOpen && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </Button>
              
              {user && <MessagingButton isHomePage={false} />}
              {user && <NotificationsButton isHomePage={false} />}
              
              {!user && (
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                  <User className="h-5 w-5" />
                </Button>
              )}
              
              {user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button className="bnrm-btn-primary px-4 py-2 rounded transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      {ml({ fr: 'Mon espace', ar: 'مساحتي', en: 'My Space', es: 'Mi espacio', amz: 'ⴰⴷⵖⴰⵔ ⵉⵏⵓ' })}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="bg-white border border-gray-200 shadow-lg w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-space" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {ml({ fr: 'Mon Espace', ar: 'مساحتي', en: 'My Space', es: 'Mi Espacio', amz: 'ⴰⴷⵖⴰⵔ ⵉⵏⵓ' })}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/wallet" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {ml({ fr: 'e-Wallet', ar: 'المحفظة', en: 'e-Wallet', es: 'e-Wallet', amz: 'ⵜⴰⵎⵃⴼⴰⴹⵜ' })}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {ml({ fr: 'Mon Profil', ar: 'ملفي', en: 'My Profile', es: 'Mi Perfil', amz: 'ⴰⵙⵙⴰⵖ ⵉⵏⵓ' })}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {ml({ fr: 'Tableau de bord', ar: 'لوحة التحكم', en: 'Dashboard', es: 'Panel de control', amz: 'ⵜⴰⴼⵍⵡⵉⵜ ⵏ ⵓⵙⵡⵓⴷⴷⵓ' })}
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin/settings" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {ml({ fr: 'Administration', ar: 'الإدارة', en: 'Administration', es: 'Administración', amz: 'ⴰⵙⴼⵔⵓⴽ' })}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                      <LogIn className="h-4 w-4 mr-2 rotate-180" />
                      {ml({ fr: 'Déconnexion', ar: 'خروج', en: 'Logout', es: 'Cerrar sesión', amz: 'ⴰⴼⵓⵖ' })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button className="bnrm-btn-primary px-4 py-2 rounded transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    {ml({ fr: 'Mon espace', ar: 'مساحتي', en: 'My Space', es: 'Mi espacio', amz: 'ⴰⴷⵖⴰⵔ ⵉⵏⵓ' })}
                  </Button>
                </Link>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

        {/* Bouton Retour */}
        {showBackButton && (
          <div className="border-b py-2">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const isDigitalLibraryAdmin = location.pathname.startsWith("/admin/digital-library");
                  if (isDigitalLibrary || isDigitalLibraryAdmin) {
                    navigate("/digital-library");
                    return;
                  }
                  goBack();
                }}
                className="gap-2 hover:bg-accent transition-all duration-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>
                  {isDigitalLibrary || location.pathname.startsWith("/admin/digital-library")
                    ? ml({ fr: "Retour vers page d'accueil", ar: "العودة إلى الصفحة الرئيسية", en: "Back to homepage", es: "Volver a la página de inicio", amz: "ⴰⵖⵓⵍ ⵖⵔ ⵜⴰⵙⵏⴰ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ" })
                    : ml({ fr: "Retour", ar: "رجوع", en: "Back", es: "Volver", amz: "ⴰⵖⵓⵍ" })}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation principale */}
        {!hideNavigation && (
          <div className="bg-white border-t border-slate-border">
            <div className="container mx-auto px-4 flex items-center justify-center py-0">

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-0">
              <NavigationMenuItem>
                <Link to="/">
                  <span className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 text-sm font-medium px-3 rounded-none inline-flex items-center cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {ml({ fr: 'Accueil', ar: 'الرئيسية', en: 'Home', es: 'Inicio', amz: 'ⴰⵙⵏⵓⴱⴳ' })}
                  </span>
                </Link>
              </NavigationMenuItem>
              
              <span className="text-slate-border mx-1">|</span>
              
              {/* Découvrir la Bibliothèque */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 bnrm-nav-menu px-3 rounded-none">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>{t('nav.discover')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[700px] lg:grid-cols-2 bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <div className="space-y-2">
                      <h4 className="bnrm-nav-submenu-header text-blue-primary-dark mb-3 flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 bg-blue-primary-dark rounded-full" />
                        {ml(menuData.discover.practicalInfo.title)}
                      </h4>
                      {menuData.discover.practicalInfo.items.map((item, idx) => {
                        const icons = ['mdi:clock-outline', 'mdi:tag-multiple', 'mdi:video-360', 'mdi:gift-outline'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={ml(item.title)} 
                            description={ml(item.desc)}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-blue-primary-dark/5 hover:text-blue-primary-dark rounded-lg border-l-3 border-transparent hover:border-blue-primary-dark transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <h4 className="bnrm-nav-submenu-header text-blue-primary-dark mb-3 flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                        {ml(menuData.discover.historyMissions.title)}
                      </h4>
                      {menuData.discover.historyMissions.items.map((item, idx) => {
                        const icons = ['mdi:book-open-page-variant', 'mdi:message-text', 'mdi:sitemap'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={ml(item.title)} 
                            description={ml(item.desc)}
                            icon={icons[idx]}
                            side="right"
                            variant="gold"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-amber-50 hover:text-amber-700 rounded-lg border-l-3 border-transparent hover:border-amber-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        );
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <span className="text-slate-border mx-1">|</span>

              {/* Accéder à nos services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 bnrm-nav-menu px-3 rounded-none">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{t('nav.services')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[700px] lg:grid-cols-2 bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <div className="space-y-2">
                      <h4 className="bnrm-nav-submenu-header text-blue-primary-dark mb-3 flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 bg-green-500 rounded-full" />
                        {ml(menuData.services.userServices.title)}
                      </h4>
                      {menuData.services.userServices.items.map((item, idx) => {
                        const icons = ['mdi:account-tie', 'mdi:card-account-details', 'mdi:badge-account', 'mdi:library', 'mdi:book-clock', 'mdi:calendar-check'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={ml(item.title)} 
                            description={ml(item.desc)}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-green-50 hover:text-green-700 rounded-lg border-l-3 border-transparent hover:border-green-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <h4 className="bnrm-nav-submenu-header text-blue-primary-dark mb-3 flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
                        {ml(menuData.services.specializedServices.title)}
                      </h4>
                      {menuData.services.specializedServices.items.map((item, idx) => {
                        const icons = ['mdi:file-document-check', 'mdi:content-copy', 'mdi:auto-fix'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={ml(item.title)} 
                            description={ml(item.desc)}
                            icon={icons[idx]}
                            side="right"
                            variant="gradient"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-purple-50 hover:text-purple-700 rounded-lg border-l-3 border-transparent hover:border-purple-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        );
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <span className="text-slate-border mx-1">|</span>

              {/* Explorer le patrimoine */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 bnrm-nav-menu px-3 rounded-none">
                  <Book className="w-4 h-4 mr-2" />
                  <span>{t('nav.explore')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-4 p-6 w-[950px] lg:grid-cols-3 bg-white border border-slate-200 shadow-2xl rounded-xl">
                    {/* Colonne 1 - Galerie et Collections */}
                    <div className="space-y-3">
                      <BNRMTooltip 
                        content={ml({ fr: 'Galerie des médias', ar: 'معرض الوسائط', en: 'Media Gallery', es: 'Galería de medios', amz: 'ⵜⴰⵙⴷⴰⵙⵜ ⵏ ⵉⵎⴰⵙⵙⵏ' })}
                        description={ml({ fr: 'Explorez notre collection multimédia riche', ar: 'استكشف مجموعتنا المتنوعة من الوسائط', en: 'Explore our rich multimedia collection', es: 'Explore nuestra rica colección multimedia', amz: 'ⵙⵙⵓⴷⵓ ⵜⴰⴳⵔⴰⵡⵜ ⵏⵏⵖ' })}
                        icon="mdi:image-multiple"
                        side="right"
                        variant="blue"
                      >
                        <NavigationMenuLink asChild>
                          <Link to="/galerie-medias" className="block p-3 text-base font-semibold text-white bg-gradient-to-r from-blue-primary-dark to-blue-deep hover:from-blue-deep hover:to-blue-primary-dark rounded-lg border-l-4 border-amber-500 transition-all duration-300 shadow-md hover:shadow-lg group">
                            <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                              {ml({ fr: 'Galerie des médias', ar: 'معرض الوسائط', en: 'Media Gallery', es: 'Galería de medios', amz: 'ⵜⴰⵙⴷⴰⵙⵜ ⵏ ⵉⵎⴰⵙⵙⵏ' })}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </BNRMTooltip>
                      
                      <div className="pt-2 bg-slate-50 rounded-lg p-3">
                        <h4 className="text-sm font-bold text-blue-primary-dark mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          {ml({ fr: 'Collections', ar: 'المجموعات', en: 'Collections', es: 'Colecciones', amz: 'ⵜⵉⴳⵔⴰⵡⵉⵏ' })}
                        </h4>
                        
                        {[
                          { href: '/collections-specialisees', fr: 'Collections spécialisées', ar: 'المجموعات المتخصصة', en: 'Specialized Collections', es: 'Colecciones especializadas', desc: { fr: 'Fonds thématiques et spécialisés', ar: 'مجموعات موضوعية ومتخصصة', en: 'Thematic and specialized collections', es: 'Fondos temáticos y especializados' }, icon: 'mdi:bookshelf' },
                          { href: '/collections-numerisees', fr: 'Collections numérisées', ar: 'المجموعات الرقمية', en: 'Digitized Collections', es: 'Colecciones digitalizadas', desc: { fr: 'Documents patrimoniaux numérisés', ar: 'وثائق تراثية مرقمنة', en: 'Digitized heritage documents', es: 'Documentos patrimoniales digitalizados' }, icon: 'mdi:cloud-download' },
                          { href: '/collections-offertes', fr: 'Collections offertes', ar: 'المجموعات المقدمة', en: 'Donated Collections', es: 'Colecciones donadas', desc: { fr: 'Dons et legs de mécènes', ar: 'هبات ووصايا المتبرعين', en: 'Gifts and bequests from patrons', es: 'Donaciones y legados de mecenas' }, icon: 'mdi:gift' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                            description={ml(item.desc)}
                            icon={item.icon}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                        
                        <div className="ml-2 mt-2 pl-3 border-l-2 border-blue-primary-dark/20 space-y-1">
                          {[
                            { href: '/plateforme-manuscrits', fr: 'Manuscrits', ar: 'المخطوطات', en: 'Manuscripts', es: 'Manuscritos', desc: { fr: 'Manuscrits anciens numérisés', ar: 'مخطوطات قديمة مرقمنة', en: 'Digitized ancient manuscripts', es: 'Manuscritos antiguos digitalizados' } },
                            { href: '/monographies', fr: 'Monographies', ar: 'الأحاديات', en: 'Monographs', es: 'Monografías', desc: { fr: 'Ouvrages et études', ar: 'مؤلفات ودراسات', en: 'Works and studies', es: 'Obras y estudios' } },
                            { href: '/periodiques', fr: 'Périodiques', ar: 'الدوريات', en: 'Periodicals', es: 'Publicaciones periódicas', desc: { fr: 'Revues et journaux', ar: 'مجلات وصحف', en: 'Magazines and newspapers', es: 'Revistas y periódicos' } },
                            { href: '/bouquets-abonnements', fr: 'Bouquets des abonnements', ar: 'باقات الاشتراكات', en: 'Subscription Bundles', es: 'Paquetes de suscripción', desc: { fr: 'Ressources électroniques', ar: 'موارد إلكترونية', en: 'Electronic resources', es: 'Recursos electrónicos' } },
                            { href: '/audiovisuelles', fr: 'Audiovisuelles et multimédias', ar: 'السمعية البصرية والوسائط المتعددة', en: 'Audiovisual & Multimedia', es: 'Audiovisuales y multimedia', desc: { fr: 'Contenus audio et vidéo', ar: 'محتويات صوتية ومرئية', en: 'Audio and video content', es: 'Contenidos de audio y vídeo' } }
                          ].map((sub, idx) => (
                            <BNRMTooltip 
                              key={idx}
                              content={ml({ fr: sub.fr, ar: sub.ar, en: sub.en, es: sub.es })}
                              description={ml(sub.desc)}
                              side="right"
                              variant="gold"
                            >
                              <NavigationMenuLink asChild>
                                <Link to={sub.href} className="block p-1.5 text-xs text-muted-foreground hover:text-blue-primary-dark hover:bg-blue-50 rounded transition-all group">
                                  <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                    • {ml({ fr: sub.fr, ar: sub.ar, en: sub.en, es: sub.es })}
                                  </span>
                                </Link>
                              </NavigationMenuLink>
                            </BNRMTooltip>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Colonne 2 - Catalogue général */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-3">
                      <h4 className="text-sm font-bold text-blue-primary-dark mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-violet-500 rounded-full" />
                        {ml({ fr: 'Catalogue général en ligne', ar: 'الفهرس العام على الإنترنت', en: 'Online General Catalog', es: 'Catálogo general en línea', amz: 'ⴰⴽⵜⴰⵍⵓⴳ ⴰⵎⴰⵜⴰⵢ ⵙ ⵓⵣⵔⴰⵡⵉⵏ' })}
                      </h4>
                      
                      <div>
                        <p className="text-xs font-semibold text-foreground px-2 mb-2 flex items-center gap-1">
                          <span className="w-1 h-1 bg-violet-400 rounded-full" />
                          {ml({ fr: 'Lire, écouter et voir', ar: 'القراءة والاستماع والمشاهدة', en: 'Read, listen and watch', es: 'Leer, escuchar y ver', amz: 'ⵖⵔ, ⵙⴼⵍⴷ ⴷ ⵥⵕ' })}
                        </p>
                        {[
                          { href: '/bibliographies', fr: 'Bibliographies Nationales', ar: 'الببليوغرافيات الوطنية', en: 'National Bibliographies', es: 'Bibliografías Nacionales', desc: { fr: 'Répertoire de la production intellectuelle', ar: 'دليل الإنتاج الفكري', en: 'Directory of intellectual production', es: 'Repertorio de producción intelectual' }, icon: 'mdi:book-open-variant' },
                          { href: '/rapports-activites', fr: "Rapport d'activités", ar: 'تقرير الأنشطة', en: 'Activity Report', es: 'Informe de actividades', desc: { fr: 'Bilans et perspectives', ar: 'حصائل وآفاق', en: 'Reviews and perspectives', es: 'Balances y perspectivas' }, icon: 'mdi:file-chart' },
                          { href: '/tresors', fr: 'Trésors', ar: 'الكنوز', en: 'Treasures', es: 'Tesoros', desc: { fr: 'Joyaux du patrimoine marocain', ar: 'جواهر التراث المغربي', en: 'Jewels of Moroccan heritage', es: 'Joyas del patrimonio marroquí' }, icon: 'mdi:diamond-stone' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                            description={ml(item.desc)}
                            icon={item.icon}
                            side="right"
                            variant="gradient"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-violet-100">
                        {[
                          { href: '/archives-manuscrits', fr: 'Archives et manuscrits', ar: 'الأرشيف والمخطوطات', en: 'Archives & Manuscripts', es: 'Archivos y manuscritos', desc: { fr: 'Documents historiques uniques', ar: 'وثائق تاريخية فريدة', en: 'Unique historical documents', es: 'Documentos históricos únicos' }, icon: 'mdi:archive' },
                          { href: '/autres-catalogues', fr: 'Autres catalogues et bases', ar: 'فهارس وقواعد أخرى', en: 'Other Catalogs & Databases', es: 'Otros catálogos y bases', desc: { fr: 'Ressources complémentaires', ar: 'موارد تكميلية', en: 'Complementary resources', es: 'Recursos complementarios' }, icon: 'mdi:database' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                            description={ml(item.desc)}
                            icon={item.icon}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                        <BNRMTooltip 
                          content={ml({ fr: 'Catalogue numérisé (Plateforme BN)', ar: 'الفهرس الرقمي (منصة BN)', en: 'Digitized Catalog (BN Platform)', es: 'Catálogo digitalizado (Plataforma BN)', amz: 'ⴰⴽⵜⴰⵍⵓⴳ ⵉⵜⵜⵓⵙⵏⵓⵎⵎⵉⵏ' })}
                          description={ml({ fr: 'Accédez à notre bibliothèque numérique complète', ar: 'الوصول إلى مكتبتنا الرقمية الكاملة', en: 'Access our complete digital library', es: 'Acceda a nuestra biblioteca digital completa' })}
                          icon="mdi:library"
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to="/digital-library" className="block p-2.5 mt-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md hover:shadow-lg transition-all group">
                              <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                📚 {ml({ fr: 'Catalogue numérisé (Plateforme BN)', ar: 'الفهرس الرقمي (منصة BN)', en: 'Digitized Catalog (BN Platform)', es: 'Catálogo digitalizado (Plataforma BN)', amz: 'ⴰⴽⵜⴰⵍⵓⴳ ⵉⵜⵜⵓⵙⵏⵓⵎⵎⵉⵏ' })}
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </BNRMTooltip>
                      </div>
                    </div>

                    {/* Colonne 3 - Recherche avancée */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-3">
                      <h4 className="text-sm font-bold text-blue-primary-dark mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                        {ml({ fr: 'Chercher un document', ar: 'البحث عن وثيقة', en: 'Search a Document', es: 'Buscar un documento', amz: 'ⵔⵣⵓ ⴰⵙⴳⴷ' })}
                      </h4>
                      <BNRMTooltip 
                        content={ml({ fr: 'Recherche avancée', ar: 'بحث متقدم', en: 'Advanced Search', es: 'Búsqueda avanzada', amz: 'ⴰⵔⵣⵣⵓ ⵓⵙⵍⵉⴳ' })}
                        description={ml({ fr: 'Trouvez précisément ce que vous cherchez', ar: 'ابحث بدقة عما تبحث عنه', en: 'Find exactly what you are looking for', es: 'Encuentre exactamente lo que busca' })}
                        icon="mdi:magnify"
                        side="right"
                        variant="blue"
                      >
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee" className="block p-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-500 rounded-lg shadow-md hover:shadow-lg transition-all group">
                            <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                              🔍 {ml({ fr: 'Recherche avancée', ar: 'بحث متقدم', en: 'Advanced Search', es: 'Búsqueda avanzada', amz: 'ⴰⵔⵣⵣⵓ ⵓⵙⵍⵉⴳ' })}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </BNRMTooltip>
                      
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-3 flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                          {ml({ fr: 'Documents en accès libre :', ar: 'وثائق في الوصول الحر:', en: 'Open access documents:', es: 'Documentos de acceso libre:', amz: 'ⵉⵙⴳⴷⴰⵏ ⵙ ⵓⴽⵛⵛⵓⵎ ⵉⵍⴻⵍⵍⵉ:' })}
                        </p>
                        {[
                          { href: '/recherche-avancee?type=livres-periodiques', fr: 'Livres et périodiques conservés', ar: 'الكتب والدوريات المحفوظة', en: 'Preserved books and periodicals', es: 'Libros y publicaciones periódicas conservados', desc: { fr: 'Ouvrages du fonds général', ar: 'مؤلفات من الرصيد العام', en: 'General collection works', es: 'Obras del fondo general' } },
                          { href: '/recherche-avancee?type=manuscrits-archives', fr: 'Manuscrits modernes et archives', ar: 'المخطوطات الحديثة والأرشيف', en: 'Modern manuscripts and archives', es: 'Manuscritos modernos y archivos', desc: { fr: 'Documents historiques', ar: 'وثائق تاريخية', en: 'Historical documents', es: 'Documentos históricos' } },
                          { href: '/recherche-avancee?type=iconographiques', fr: 'Documents iconographiques', ar: 'الوثائق الأيقونية', en: 'Iconographic documents', es: 'Documentos iconográficos', desc: { fr: 'Estampes, photos, affiches', ar: 'مطبوعات، صور، ملصقات', en: 'Prints, photos, posters', es: 'Estampas, fotos, carteles' } },
                          { href: '/recherche-avancee?type=periodiques-extraits', fr: 'Périodiques (extraits)', ar: 'الدوريات (مقتطفات)', en: 'Periodicals (excerpts)', es: 'Publicaciones periódicas (extractos)', desc: { fr: 'Articles de revues', ar: 'مقالات المجلات', en: 'Journal articles', es: 'Artículos de revistas' } }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                            description={ml(item.desc)}
                            side="right"
                            variant="gold"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2 text-xs text-foreground hover:bg-green-50 hover:text-green-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                  • {ml({ fr: item.fr, ar: item.ar, en: item.en, es: item.es })}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <span className="text-slate-border mx-1">|</span>

              {/* Consulter nos actualités */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 text-sm font-medium px-3 rounded-none">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{t('nav.consult.news')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[550px] bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <h4 className="text-sm font-bold text-orange-600 flex items-center gap-2 px-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
                      {ml(menuData.news.news.title)}
                    </h4>
                    {menuData.news.news.items.map((item, idx) => {
                      const icons = ['mdi:newspaper-variant-outline', 'mdi:television-classic'];
                      return (
                        <BNRMTooltip 
                          key={idx}
                          content={ml(item.title)} 
                          description={ml(item.desc)}
                          icon={icons[idx]}
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to={item.href} className="block p-3 text-foreground hover:bg-orange-50 hover:text-orange-700 rounded-lg border-l-3 border-transparent hover:border-orange-500 transition-all duration-200 group">
                              <div className="font-medium group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                            </Link>
                          </NavigationMenuLink>
                        </BNRMTooltip>
                      );
                    })}
                    
                    <div className="border-t border-orange-200/50 pt-3 mt-1">
                      <h4 className="text-sm font-bold text-blue-primary-dark flex items-center gap-2 px-2 mb-2">
                        <span className="w-1.5 h-4 bg-blue-primary-dark rounded-full" />
                        {ml(menuData.news.cultural.title)}
                      </h4>
                      {menuData.news.cultural.items.map((item, idx) => {
                        const icons = ['mdi:palette', 'mdi:calendar-month', 'mdi:image-multiple'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={ml(item.title)} 
                            description={ml(item.desc)}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-blue-primary-dark/5 hover:text-blue-primary-dark rounded-lg border-l-3 border-transparent hover:border-blue-primary-dark transition-all duration-200 group">
                                <div className="font-medium group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        );
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <span className="text-slate-border mx-1">|</span>

              {/* Collaborer avec nous */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 text-sm font-medium px-3 rounded-none">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{t('nav.collaborate')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[500px] bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <h4 className="text-sm font-bold text-teal-600 flex items-center gap-2 px-2">
                      <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
                      {ml({ fr: 'Partenariats', ar: 'الشراكات', en: 'Partnerships', es: 'Asociaciones', amz: 'ⵜⵉⵎⴷⵔⴰⵡⵉⵏ' })}
                    </h4>
                    <BNRMTooltip 
                      content={t('nav.national.collaborations')} 
                      description={t('nav.national.collaborations.desc')}
                      icon="mdi:handshake"
                      side="right"
                      variant="blue"
                    >
                      <NavigationMenuLink asChild>
                        <Link to="/collaborations-nationales" className="block p-3 text-foreground hover:bg-teal-50 hover:text-teal-700 rounded-lg border-l-3 border-transparent hover:border-teal-500 transition-all duration-200 group">
                          <div className="font-medium group-hover:translate-x-0.5 transition-transform">{t('nav.national.collaborations')}</div>
                        </Link>
                      </NavigationMenuLink>
                    </BNRMTooltip>
                    <BNRMTooltip 
                      content={t('nav.international.collaborations')} 
                      description={t('nav.international.collaborations.desc')}
                      icon="mdi:earth"
                      side="right"
                      variant="gradient"
                    >
                      <NavigationMenuLink asChild>
                        <Link to="/collaborations-internationales" className="block p-3 text-foreground hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border-l-3 border-transparent hover:border-indigo-500 transition-all duration-200 group">
                          <div className="font-medium group-hover:translate-x-0.5 transition-transform">{t('nav.international.collaborations')}</div>
                        </Link>
                      </NavigationMenuLink>
                    </BNRMTooltip>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <span className="text-slate-border mx-1">|</span>

              {/* Mécénat */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 text-sm font-medium px-3 rounded-none">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{ml(menuData.mecenat.title)}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[500px] bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 px-2">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                      {ml(menuData.mecenat.title)}
                    </h4>
                    {menuData.mecenat.items.map((item, idx) => {
                      const icons = ['mdi:account-heart', 'mdi:book-heart', 'mdi:currency-usd'];
                      return (
                        <BNRMTooltip 
                          key={idx}
                          content={ml(item.title)} 
                          description={ml(item.desc)}
                          icon={icons[idx]}
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to={item.href} className="block p-3 text-foreground hover:bg-amber-50 hover:text-amber-700 rounded-lg border-l-3 border-transparent hover:border-amber-500 transition-all duration-200 group">
                              <div className="font-medium group-hover:translate-x-0.5 transition-transform">{ml(item.title)}</div>
                            </Link>
                          </NavigationMenuLink>
                        </BNRMTooltip>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

            </div>
          </div>
        )}

      {/* Menu Mobile */}
      {!hideNavigation && isMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t-4 border-blue-primary-dark/30 shadow-2xl animate-slide-in-right">
          <nav className="container mx-auto px-6 py-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-primary-dark border-b border-blue-primary-dark/20 pb-2">Navigation</h3>
              
              <Link to="/" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-blue-primary-dark hover:bg-blue-surface transition-all duration-300 rounded-xl border border-transparent hover:border-blue-primary/20">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{t('nav.discover')}</span>
              </Link>
              
              <a href="/services" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-blue-primary-dark hover:bg-blue-surface transition-all duration-300 rounded-xl border border-transparent hover:border-blue-primary/20">
                <Users className="w-5 h-5" />
                <span className="font-medium">{t('nav.services')}</span>
              </a>
              
              <a href="/collections" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-blue-primary-dark hover:bg-blue-surface transition-all duration-300 rounded-xl border border-transparent hover:border-blue-primary/20">
                <Book className="w-5 h-5" />
                <span className="font-medium">{t('nav.explore')}</span>
              </a>
              
              <a href="/news" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-blue-primary-dark hover:bg-blue-surface transition-all duration-300 rounded-xl border border-transparent hover:border-blue-primary/20">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{t('nav.consult.news')}</span>
              </a>
              
              <a href="/collaboration" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-blue-primary-dark hover:bg-blue-surface transition-all duration-300 rounded-xl border border-transparent hover:border-blue-primary/20">
                <Building className="w-5 h-5" />
                <span className="font-medium">{t('nav.collaborate')}</span>
              </a>
            </div>

            <div className="space-y-3 pt-4 border-t border-blue-primary-dark/20">
              <h4 className="text-base font-semibold text-blue-primary-dark">{ml({ fr: "Outils d'assistance", ar: 'أدوات المساعدة', en: 'Assistance Tools', es: 'Herramientas de asistencia', amz: 'ⵉⵎⴰⵙⵙⵏ ⵏ ⵜⵡⵉⵙⵉ' })}</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{ml({ fr: 'Assistant IA et Accessibilité disponibles dans la barre du haut', ar: 'المساعد الذكي وأدوات الوصول متاحة في الشريط العلوي', en: 'AI Assistant and Accessibility available in the top bar', es: 'Asistente IA y Accesibilidad disponibles en la barra superior', amz: 'ⴰⵎⵙⵙⵓⵎⵓⵔ ⴷ ⵜⵉⵍⵉⵜ ⴳ ⵓⵣⴰⵍⴰⴳ ⴰⴼⵍⵍⴰ' })}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-blue-primary-dark/20">
              <h4 className="text-base font-semibold text-blue-primary-dark">{ml({ fr: 'Contact rapide', ar: 'اتصال سريع', en: 'Quick Contact', es: 'Contacto rápido', amz: 'ⴰⵎⵢⴰⵡⴰⴹ ⴰⵎⵍⴰⵍ' })}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+212 5 37 77 30 01</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@bnrm.ma</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Rabat, {ml({ fr: 'Maroc', ar: 'المغرب', en: 'Morocco', es: 'Marruecos', amz: 'ⵍⵎⵖⵔⵉⴱ' })}</span>
              </div>
            </div>
          </nav>
        </div>
      )}
      
      {isChatBotOpen && (
        <SmartChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
      </header>
  );
};

export default Header;
