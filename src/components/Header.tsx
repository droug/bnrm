import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail, UserCheck, Archive, ChevronDown, Accessibility, Bot, MessageCircle, Shield, HelpCircle, Network } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/hooks/useLanguage";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { goBack } = useNavigationHistory();
  const isHomePage = location.pathname === "/";

  // Menu data structure with bilingual support
  const menuData = {
    discover: {
      practicalInfo: {
        title: { fr: "Informations pratiques", ar: "معلومات عملية" },
        items: [
          {
            title: { fr: "Horaires et accès", ar: "المواعيد والوصول" },
            desc: { fr: "Consultez nos horaires d'ouverture et comment nous rejoindre", ar: "استشر مواعيد فتحنا وكيفية الوصول إلينا" },
            href: "/practical-info"
          },
          {
            title: { fr: "Catalogue de services et tarifs", ar: "كتالوج الخدمات والتعريفات" },
            desc: { fr: "Découvrez nos services et leurs tarifs", ar: "اكتشف خدماتنا وتعريفاتها" },
            href: "/services-tarifs"
          },
          {
            title: { fr: "Visites virtuelles", ar: "الجولات الافتراضية" },
            desc: { fr: "Explorez la bibliothèque depuis chez vous", ar: "استكشف المكتبة من منزلك" },
            href: "/page/visites-virtuelles"
          },
          {
            title: { fr: "Nos donateurs", ar: "متبرعونا" },
            desc: { fr: "Recherchez par donateurs ou par œuvre", ar: "ابحث حسب المتبرعين أو العمل" },
            href: "/page/donateurs"
          }
        ]
      },
      historyMissions: {
        title: { fr: "Histoire et missions", ar: "التاريخ والمهام" },
        items: [
          {
            title: { fr: "Histoire de la bibliothèque", ar: "تاريخ المكتبة" },
            desc: { fr: "Missions et valeurs prônées", ar: "المهام والقيم المؤيدة" },
            href: "/page/histoire"
          },
          {
            title: { fr: "Mot de la Direction", ar: "كلمة الإدارة" },
            desc: { fr: "Message du directeur de la BNRM", ar: "رسالة مدير المكتبة" },
            href: "/page/mot-direction"
          },
          {
            title: { fr: "Organigramme", ar: "الهيكل التنظيمي" },
            desc: { fr: "Structure organisationnelle de la BNRM", ar: "الهيكل التنظيمي للمكتبة" },
            href: "/page/organigramme"
          }
        ]
      }
    },
    services: {
      userServices: {
        title: { fr: "Services aux usagers", ar: "الخدمات للمستخدمين" },
        items: [
          {
            title: { fr: "Inscription en ligne / Réinscription", ar: "التسجيل عبر الإنترنت / إعادة التسجيل" },
            desc: { fr: "Créez votre compte ou renouvelez votre abonnement", ar: "أنشئ حسابك أو جدد اشتراكك" },
            href: "/auth?action=signup"
          },
          {
            title: { fr: "Pass journalier", ar: "التصريح اليومي" },
            desc: { fr: "Accès illimité gratuit - 1 fois par an", ar: "وصول مجاني غير محدود - مرة واحدة في السنة" },
            href: "/services-bnrm?open=daily-pass"
          },
          {
            title: { fr: "Consulter la Bibliothèque Nationale", ar: "استشارة المكتبة الوطنية" },
            desc: { fr: "Accédez à notre bibliothèque numérique", ar: "الوصول إلى مكتبتنا الرقمية" },
            href: "/digital-library"
          },
          {
            title: { fr: "Réserver un document", ar: "حجز وثيقة" },
            desc: { fr: "Recherchez et réservez un document CBN", ar: "ابحث واحجز وثيقة" },
            href: "/cbn/reserver-ouvrage"
          },
          {
            title: { fr: "Réserver nos espaces", ar: "حجز مساحاتنا" },
            desc: { fr: "Réservez un espace de travail ou une salle", ar: "احجز مساحة عمل أو قاعة" },
            href: "/reservation-espaces"
          }
        ]
      },
      specializedServices: {
        title: { fr: "Services spécialisés", ar: "الخدمات المتخصصة" },
        items: [
          {
            title: { fr: "Dépôt légal", ar: "الإيداع القانوني" },
            desc: { fr: "Service obligatoire selon le Dahir n° 1-60-050 (1960)", ar: "خدمة إلزامية حسب الظهير رقم 1-60-050 (1960)" },
            href: "/depot-legal"
          },
          {
            title: { fr: "Demande de reproduction", ar: "طلب النسخ" },
            desc: { fr: "Commandez des reproductions de documents", ar: "اطلب نسخًا من الوثائق" },
            href: "/demande-reproduction"
          },
          {
            title: { fr: "Demande de restauration", ar: "طلب الترميم" },
            desc: { fr: "Service de restauration de documents anciens", ar: "خدمة ترميم الوثائق القديمة" },
            href: "/demande-restauration"
          }
        ]
      }
    },
    news: {
      news: {
        title: { fr: "Actualités", ar: "الأخبار" },
        items: [
          {
            title: { fr: "Actualités et publications", ar: "الأخبار والمنشورات" },
            desc: { fr: "Nouvelles acquisitions et actualités du fonds documentaire", ar: "المقتنيات الجديدة وأخبار الرصيد الوثائقي" },
            href: "/news"
          },
          {
            title: { fr: "Ils parlent de nous", ar: "يتحدثون عنا" },
            desc: { fr: "La BNRM dans les médias et publications", ar: "المكتبة في وسائل الإعلام والمنشورات" },
            href: "/page/ils-parlent-de-nous"
          }
        ]
      },
      cultural: {
        title: { fr: "Notre programmation culturelle", ar: "برنامجنا الثقافي" },
        items: [
          {
            title: { fr: "Programmation culturelle", ar: "البرمجة الثقافية" },
            desc: { fr: "Découvrez nos activités culturelles", ar: "اكتشف أنشطتنا الثقافية" },
            href: "/page/programmation-culturelle"
          },
          {
            title: { fr: "Agenda", ar: "الأجندة" },
            desc: { fr: "Calendrier de nos événements", ar: "تقويم فعالياتنا" },
            href: "/page/agenda"
          },
          {
            title: { fr: "Nos expositions", ar: "معارضنا" },
            desc: { fr: "Expositions actuelles et passées", ar: "المعارض الحالية والسابقة" },
            href: "/page/expositions"
          }
        ]
      }
    },
    mecenat: {
      title: { fr: "Mécénat", ar: "الرعاية" },
      items: [
        {
          title: { fr: "Nos donateurs", ar: "متبرعونا" },
          desc: { fr: "Découvrez nos mécènes et leurs œuvres", ar: "اكتشف المتبرعين وأعمالهم" },
          href: "/donateurs"
        },
        {
          title: { fr: "Offrir des collections", ar: "تقديم مجموعات" },
          desc: { fr: "Enrichir le fonds documentaire de la bibliothéque", ar: "إغناء الرصيد الوثائقي للمكتبة" },
          href: "/offrir-collections"
        },
        {
          title: { fr: "Dons financiers", ar: "التبرعات المالية" },
          desc: { fr: "Soutenez la bibliothèque par vos dons", ar: "ادعم المكتبة بتبرعاتك" },
          href: "/donation"
        }
      ]
    }
  };
  
  // Pages d'accueil principales (pas de bouton retour)
  const isDigitalLibraryHome = location.pathname === "/digital-library";
  const isManuscriptsPlatformHome = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform";
  const isSignupPage = location.pathname === "/signup"; // Les formulaires ont leur propre bouton Retour
  const isDepotLegalForm = location.pathname.startsWith("/depot-legal/"); // Les formulaires de dépôt légal ont leur propre bouton Retour
  
  // Vérifier si on est sur une des plateformes spéciales
  const isDigitalLibrary = location.pathname.startsWith("/digital-library");
  const isManuscriptsPlatform = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform" || location.pathname.startsWith("/manuscripts/");
  const isManuscriptsHelp = location.pathname === "/manuscripts/help" || location.pathname === "/aide-manuscrits";
  const isBackoffice = location.pathname.startsWith("/admin/manuscripts-backoffice") || location.pathname.startsWith("/admin/digital-library");
  const isCBMPortal = location.pathname.startsWith("/cbm");
  const hideNavigation = isDigitalLibrary || isManuscriptsPlatform || isManuscriptsHelp || isBackoffice || isCBMPortal;
  
  // Afficher le bouton retour sur toutes les pages SAUF les pages d'accueil principales et les formulaires (qui ont leur propre bouton)
  const showBackButton = !isHomePage && !isDigitalLibraryHome && !isManuscriptsPlatformHome && !isSignupPage && !isDepotLegalForm;

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Barre supérieure - Fond blanc avec logo, recherche et actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo + Titre trilingue */}
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img src={logoImage} alt="Logo BNRM" className="h-14 w-auto" />
            </Link>
          
            {/* Barre de recherche centrale */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث...' : 'Search'}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-2">
              {/* Navigation Portails */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 bnrm-nav-menu text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                    <Building className="h-4 w-4" />
                    <span className="hidden md:inline">{language === 'ar' ? 'البوابات' : 'Portails'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 z-50">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'البوابة الرئيسية' : 'Portail Principal'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/digital-library">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'المكتبة الرقمية' : 'Bibliothèque Numérique'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/plateforme-manuscrits">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'المخطوطات الرقمية' : 'Manuscrits Numérisés'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/cbm">
                      <Network className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'بوابة CBM' : 'Portail CBM'}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Langue */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 z-50">
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer">
                    🇲🇦 العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ber')} className="cursor-pointer">
                    ⵣ ⵜⴰⵎⴰⵣⵉⵖⵜ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer">
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                    🇺🇸 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Accessibilité */}
              <AccessibilityToolkit />
              
              {/* Chatbot */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatBotOpen(!isChatBotOpen)}
                className={`text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100 relative ${isChatBotOpen ? 'bg-gray-100' : ''}`}
                title={language === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
              >
                <Bot className="h-5 w-5" />
                {!isChatBotOpen && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </Button>
              
              {/* Messagerie */}
              {user && <MessagingButton isHomePage={false} />}
              
              {/* Notifications */}
              {user && <NotificationsButton isHomePage={false} />}
              
              {/* Utilisateur icône (non connecté) */}
              {!user && (
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-primary-dark hover:bg-gray-100">
                  <User className="h-5 w-5" />
                </Button>
              )}
              
              {/* Bouton Mon Espace / Connexion */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                <Button className="bnrm-btn-primary px-4 py-2 rounded transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'مساحتي' : 'Mon espace'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200 z-50 w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-space" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {language === 'ar' ? 'مساحتي' : 'Mon Espace'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/wallet" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {language === 'ar' ? 'المحفظة' : 'e-Wallet'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {language === 'ar' ? 'ملفي' : 'Mon Profil'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin/settings" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {language === 'ar' ? 'الإدارة' : 'Administration'}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                      <LogIn className="h-4 w-4 mr-2 rotate-180" />
                      {language === 'ar' ? 'خروج' : 'Déconnexion'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button className="bnrm-btn-primary px-4 py-2 rounded transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'مساحتي' : 'Mon espace'}
                  </Button>
                </Link>
              )}
              
              {/* Menu mobile */}
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

        {/* Bouton Retour - affiché sur toutes les pages sauf les pages d'accueil principales */}
        {showBackButton && (
          <div className="border-b py-2">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const isDigitalLibraryAdmin = location.pathname.startsWith("/admin/digital-library");

                  // Bibliothèque Numérique (front ou backoffice) => toujours vers page d'accueil DL
                  if (isDigitalLibrary || isDigitalLibraryAdmin) {
                    navigate("/digital-library");
                    return;
                  }

                  // Utiliser l'historique de session pour les autres pages
                  goBack();
                }}
                className="gap-2 hover:bg-accent transition-all duration-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>
                  {isDigitalLibrary || location.pathname.startsWith("/admin/digital-library")
                    ? (language === "ar" ? "العودة إلى الصفحة الرئيسية" : "Retour vers page d'accueil")
                    : language === "ar"
                      ? "رجوع"
                      : "Retour"}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation principale blanche - style comme l'image de référence */}
        {!hideNavigation && (
          <div className="bg-white border-t border-slate-border">
            <div className="container mx-auto px-4 flex items-center justify-center py-0">

          {/* Navigation Desktop */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-0">
              {/* Accueil - Même style que les autres menus */}
              <NavigationMenuItem>
                <Link to="/">
                  <span className="bg-transparent text-slate-text-dark hover:text-blue-primary-dark hover:bg-slate-light h-12 text-sm font-medium px-3 rounded-none inline-flex items-center cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'الرئيسية' : 'Accueil'}
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
                        {menuData.discover.practicalInfo.title[language]}
                      </h4>
                      {menuData.discover.practicalInfo.items.map((item, idx) => {
                        const icons = ['mdi:clock-outline', 'mdi:tag-multiple', 'mdi:video-360', 'mdi:gift-outline'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={item.title[language]} 
                            description={item.desc[language]}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-blue-primary-dark/5 hover:text-blue-primary-dark rounded-lg border-l-3 border-transparent hover:border-blue-primary-dark transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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
                        {menuData.discover.historyMissions.title[language]}
                      </h4>
                      {menuData.discover.historyMissions.items.map((item, idx) => {
                        const icons = ['mdi:book-open-page-variant', 'mdi:message-text', 'mdi:sitemap'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={item.title[language]} 
                            description={item.desc[language]}
                            icon={icons[idx]}
                            side="right"
                            variant="gold"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-amber-50 hover:text-amber-700 rounded-lg border-l-3 border-transparent hover:border-amber-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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
                        {menuData.services.userServices.title[language]}
                      </h4>
                      {menuData.services.userServices.items.map((item, idx) => {
                        const icons = ['mdi:account-plus', 'mdi:badge-account', 'mdi:library', 'mdi:book-clock', 'mdi:calendar-check'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={item.title[language]} 
                            description={item.desc[language]}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-green-50 hover:text-green-700 rounded-lg border-l-3 border-transparent hover:border-green-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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
                        {menuData.services.specializedServices.title[language]}
                      </h4>
                      {menuData.services.specializedServices.items.map((item, idx) => {
                        const icons = ['mdi:file-document-check', 'mdi:content-copy', 'mdi:auto-fix'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={item.title[language]} 
                            description={item.desc[language]}
                            icon={icons[idx]}
                            side="right"
                            variant="gradient"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-purple-50 hover:text-purple-700 rounded-lg border-l-3 border-transparent hover:border-purple-500 transition-all duration-200 group">
                                <div className="flex items-center gap-2">
                                  <div className="bnrm-nav-submenu-item group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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
                        content={language === 'ar' ? 'معرض الوسائط' : 'Galerie des médias'}
                        description={language === 'ar' ? 'استكشف مجموعتنا المتنوعة من الوسائط' : 'Explorez notre collection multimédia riche'}
                        icon="mdi:image-multiple"
                        side="right"
                        variant="blue"
                      >
                        <NavigationMenuLink asChild>
                          <Link to="/galerie-medias" className="block p-3 text-base font-semibold text-white bg-gradient-to-r from-blue-primary-dark to-blue-deep hover:from-blue-deep hover:to-blue-primary-dark rounded-lg border-l-4 border-amber-500 transition-all duration-300 shadow-md hover:shadow-lg group">
                            <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                              {language === 'ar' ? 'معرض الوسائط' : 'Galerie des médias'}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </BNRMTooltip>
                      
                      <div className="pt-2 bg-slate-50 rounded-lg p-3">
                        <h4 className="text-sm font-bold text-blue-primary-dark mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          {language === 'ar' ? 'المجموعات' : 'Collections'}
                        </h4>
                        
                        {[
                          { href: '/collections-specialisees', fr: 'Collections spécialisées', ar: 'المجموعات المتخصصة', desc: 'Fonds thématiques et spécialisés', icon: 'mdi:bookshelf' },
                          { href: '/collections-numerisees', fr: 'Collections numérisées', ar: 'المجموعات الرقمية', desc: 'Documents patrimoniaux numérisés', icon: 'mdi:cloud-download' },
                          { href: '/collections-offertes', fr: 'Collections offertes', ar: 'المجموعات المقدمة', desc: 'Dons et legs de mécènes', icon: 'mdi:gift' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={language === 'ar' ? item.ar : item.fr}
                            description={item.desc}
                            icon={item.icon}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {language === 'ar' ? item.ar : item.fr}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                        
                        <div className="ml-2 mt-2 pl-3 border-l-2 border-blue-primary-dark/20 space-y-1">
                          {[
                            { href: '/plateforme-manuscrits', fr: 'Manuscrits', ar: 'المخطوطات', desc: 'Manuscrits anciens numérisés' },
                            { href: '/monographies', fr: 'Monographies', ar: 'الأحاديات', desc: 'Ouvrages et études' },
                            { href: '/periodiques', fr: 'Périodiques', ar: 'الدوريات', desc: 'Revues et journaux' },
                            { href: '/bouquets-abonnements', fr: 'Bouquets des abonnements', ar: 'باقات الاشتراكات', desc: 'Ressources électroniques' },
                            { href: '/audiovisuelles', fr: 'Audiovisuelles et multimédias', ar: 'السمعية البصرية والوسائط المتعددة', desc: 'Contenus audio et vidéo' }
                          ].map((sub, idx) => (
                            <BNRMTooltip 
                              key={idx}
                              content={language === 'ar' ? sub.ar : sub.fr}
                              description={sub.desc}
                              side="right"
                              variant="gold"
                            >
                              <NavigationMenuLink asChild>
                                <Link to={sub.href} className="block p-1.5 text-xs text-muted-foreground hover:text-blue-primary-dark hover:bg-blue-50 rounded transition-all group">
                                  <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                    • {language === 'ar' ? sub.ar : sub.fr}
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
                        {language === 'ar' ? 'الفهرس العام على الإنترنت' : 'Catalogue général en ligne'}
                      </h4>
                      
                      <div>
                        <p className="text-xs font-semibold text-foreground px-2 mb-2 flex items-center gap-1">
                          <span className="w-1 h-1 bg-violet-400 rounded-full" />
                          {language === 'ar' ? 'القراءة والاستماع والمشاهدة' : 'Lire, écouter et voir'}
                        </p>
                        {[
                          { href: '/bibliographies', fr: 'Bibliographies Nationales', ar: 'الببليوغرافيات الوطنية', desc: 'Répertoire de la production intellectuelle', icon: 'mdi:book-open-variant' },
                          { href: '/rapports-activites', fr: "Rapport d'activités", ar: 'تقرير الأنشطة', desc: 'Bilans et perspectives', icon: 'mdi:file-chart' },
                          { href: '/tresors', fr: 'Trésors', ar: 'الكنوز', desc: 'Joyaux du patrimoine marocain', icon: 'mdi:diamond-stone' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={language === 'ar' ? item.ar : item.fr}
                            description={item.desc}
                            icon={item.icon}
                            side="right"
                            variant="gradient"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {language === 'ar' ? item.ar : item.fr}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-violet-100">
                        {[
                          { href: '/archives-manuscrits', fr: 'Archives et manuscrits', ar: 'الأرشيف والمخطوطات', desc: 'Documents historiques uniques', icon: 'mdi:archive' },
                          { href: '/autres-catalogues', fr: 'Autres catalogues et bases', ar: 'فهارس وقواعد أخرى', desc: 'Ressources complémentaires', icon: 'mdi:database' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={language === 'ar' ? item.ar : item.fr}
                            description={item.desc}
                            icon={item.icon}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2.5 text-sm text-foreground hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform font-medium">
                                  {language === 'ar' ? item.ar : item.fr}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </BNRMTooltip>
                        ))}
                        <BNRMTooltip 
                          content={language === 'ar' ? 'الفهرس الرقمي (منصة BN)' : 'Catalogue numérisé (Plateforme BN)'}
                          description="Accédez à notre bibliothèque numérique complète"
                          icon="mdi:library"
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to="/digital-library" className="block p-2.5 mt-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md hover:shadow-lg transition-all group">
                              <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                📚 {language === 'ar' ? 'الفهرس الرقمي (منصة BN)' : 'Catalogue numérisé (Plateforme BN)'}
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
                        {language === 'ar' ? 'البحث عن وثيقة' : 'Chercher un document'}
                      </h4>
                      <BNRMTooltip 
                        content={language === 'ar' ? 'بحث متقدم' : 'Recherche avancée'}
                        description="Trouvez précisément ce que vous cherchez"
                        icon="mdi:magnify"
                        side="right"
                        variant="blue"
                      >
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee" className="block p-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-500 rounded-lg shadow-md hover:shadow-lg transition-all group">
                            <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                              🔍 {language === 'ar' ? 'بحث متقدم' : 'Recherche avancée'}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </BNRMTooltip>
                      
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-3 flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                          {language === 'ar' ? 'وثائق في الوصول الحر:' : 'Documents en accès libre :'}
                        </p>
                        {[
                          { href: '/recherche-avancee?type=livres-periodiques', fr: 'Livres et périodiques conservés', ar: 'الكتب والدوريات المحفوظة', desc: 'Ouvrages du fonds général' },
                          { href: '/recherche-avancee?type=manuscrits-archives', fr: 'Manuscrits modernes et archives', ar: 'المخطوطات الحديثة والأرشيف', desc: 'Documents historiques' },
                          { href: '/recherche-avancee?type=iconographiques', fr: 'Documents iconographiques', ar: 'الوثائق الأيقونية', desc: 'Estampes, photos, affiches' },
                          { href: '/recherche-avancee?type=periodiques-extraits', fr: 'Périodiques (extraits)', ar: 'الدوريات (مقتطفات)', desc: 'Articles de revues' }
                        ].map((item, idx) => (
                          <BNRMTooltip 
                            key={idx}
                            content={language === 'ar' ? item.ar : item.fr}
                            description={item.desc}
                            side="right"
                            variant="gold"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-2 text-xs text-foreground hover:bg-green-50 hover:text-green-700 rounded-lg transition-all group">
                                <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                  • {language === 'ar' ? item.ar : item.fr}
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
                      {menuData.news.news.title[language]}
                    </h4>
                    {menuData.news.news.items.map((item, idx) => {
                      const icons = ['mdi:newspaper-variant-outline', 'mdi:television-classic'];
                      return (
                        <BNRMTooltip 
                          key={idx}
                          content={item.title[language]} 
                          description={item.desc[language]}
                          icon={icons[idx]}
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to={item.href} className="block p-3 text-foreground hover:bg-orange-50 hover:text-orange-700 rounded-lg border-l-3 border-transparent hover:border-orange-500 transition-all duration-200 group">
                              <div className="font-medium group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
                            </Link>
                          </NavigationMenuLink>
                        </BNRMTooltip>
                      );
                    })}
                    
                    <div className="border-t border-orange-200/50 pt-3 mt-1">
                      <h4 className="text-sm font-bold text-blue-primary-dark flex items-center gap-2 px-2 mb-2">
                        <span className="w-1.5 h-4 bg-blue-primary-dark rounded-full" />
                        {menuData.news.cultural.title[language]}
                      </h4>
                      {menuData.news.cultural.items.map((item, idx) => {
                        const icons = ['mdi:palette', 'mdi:calendar-month', 'mdi:image-multiple'];
                        return (
                          <BNRMTooltip 
                            key={idx}
                            content={item.title[language]} 
                            description={item.desc[language]}
                            icon={icons[idx]}
                            side="right"
                            variant="blue"
                          >
                            <NavigationMenuLink asChild>
                              <Link to={item.href} className="block p-3 text-foreground hover:bg-blue-primary-dark/5 hover:text-blue-primary-dark rounded-lg border-l-3 border-transparent hover:border-blue-primary-dark transition-all duration-200 group">
                                <div className="font-medium group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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
                      {language === 'ar' ? 'الشراكات' : 'Partenariats'}
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
                  <span>{menuData.mecenat.title[language]}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[500px] bg-white border border-slate-200 shadow-2xl rounded-xl">
                    <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 px-2">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                      {menuData.mecenat.title[language]}
                    </h4>
                    {menuData.mecenat.items.map((item, idx) => {
                      const icons = ['mdi:account-heart', 'mdi:book-heart', 'mdi:currency-usd'];
                      return (
                        <BNRMTooltip 
                          key={idx}
                          content={item.title[language]} 
                          description={item.desc[language]}
                          icon={icons[idx]}
                          side="right"
                          variant="gold"
                        >
                          <NavigationMenuLink asChild>
                            <Link to={item.href} className="block p-3 text-foreground hover:bg-amber-50 hover:text-amber-700 rounded-lg border-l-3 border-transparent hover:border-amber-500 transition-all duration-200 group">
                              <div className="font-medium group-hover:translate-x-0.5 transition-transform">{item.title[language]}</div>
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

      {/* Menu Mobile Navigation amélioré */}
      {!hideNavigation && isMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t-4 border-blue-primary-dark/30 shadow-2xl animate-slide-in-right">
          <nav className="container mx-auto px-6 py-8 space-y-6">
            {/* Liens principaux avec icônes */}
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

            {/* Outils d'assistance mobile */}
            <div className="space-y-3 pt-4 border-t border-blue-primary-dark/20">
              <h4 className="text-base font-semibold text-blue-primary-dark">Outils d'assistance</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assistant IA et Accessibilité disponibles dans la barre du haut</span>
              </div>
            </div>

            {/* Section contact rapide */}
            <div className="space-y-3 pt-4 border-t border-blue-primary-dark/20">
              <h4 className="text-base font-semibold text-blue-primary-dark">Contact rapide</h4>
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
                <span>Rabat, Maroc</span>
              </div>
            </div>
          </nav>
        </div>
      )}
      
      {/* Chatbot intelligent */}
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