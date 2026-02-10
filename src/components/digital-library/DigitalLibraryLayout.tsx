import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { FancyTooltip } from "@/components/ui/fancy-tooltip";
import { useBNTooltips } from "@/hooks/useBNTooltips";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import DigitalLibraryFooter from "@/components/digital-library/DigitalLibraryFooter";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import logoDigitalLibrary from "@/assets/FINAL_LOGO_3.png";
// Logos ressources électroniques
import logoBrill from "@/assets/logos/logo-brill.png";
import logoCairn from "@/assets/logos/logo-cairn.svg";
import logoRfn from "@/assets/logos/logo-rfn.png";
import logoEuropeana from "@/assets/logos/logo-europeana.svg";
import logoIfla from "@/assets/logos/logo-ifla.svg";

// Mapping des logos par nom de provider (insensible à la casse)
const providerLogoMap: Record<string, string> = {
  'cairn': logoCairn,
  'cairn.info': logoCairn,
  'brill': logoBrill,
  'rfn': logoRfn,
  'europeana': logoEuropeana,
  'ifla': logoIfla,
  'eni-elearning': 'https://www.eni-elearning.com/wp-content/uploads/2021/12/belearn-formations-informatique_fr.svg',
  'eni': 'https://www.eni-elearning.com/wp-content/uploads/2021/12/belearn-formations-informatique_fr.svg',
  'almanhal': 'https://assets.almanhal.com/website/ui/img/logo-default-white.png',
  'al-manhal': 'https://assets.almanhal.com/website/ui/img/logo-default-white.png',
};
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ReproductionRequestDialog } from "@/components/digital-library/ReproductionRequestDialog";
import { supabase } from "@/integrations/supabase/client";
import { useElectronicBundles } from "@/hooks/useElectronicBundles";

interface DigitalLibraryLayoutProps {
  children: ReactNode;
}

export function DigitalLibraryLayout({ children }: DigitalLibraryLayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };
  const { isAuthenticated, isLibrarian } = useAccessControl();
  const location = useLocation();
  const isHomePage = location.pathname === '/digital-library' || location.pathname === '/digital-library/';
  const { session, profile } = useAuth();
  const { tooltips: bnTooltips } = useBNTooltips();
  
  const canManageLibrary = isLibrarian || profile?.role === 'admin' || profile?.role === 'librarian';
  const [showReproductionDialog, setShowReproductionDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { activeBundles } = useElectronicBundles();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data && !error) {
        setUserProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: session.user.email || "",
        });
      } else {
        const metadata = session.user.user_metadata;
        setUserProfile({
          firstName: metadata?.first_name || "",
          lastName: metadata?.last_name || "",
          email: session.user.email || "",
        });
      }
    };

    if (isAuthenticated && session) {
      loadUserProfile();
    }
  }, [session, isAuthenticated]);

  const collectionsSubmenu = [
    { labelKey: "dl.collections.manuscripts", descKey: "dl.collections.manuscripts.desc", tooltipKey: "collections_manuscripts" as const, href: "/digital-library/collections/manuscripts", iconName: "mdi:scroll-text-outline", count: "+12 000" },
    { labelKey: "dl.collections.lithography", descKey: "dl.collections.lithography.desc", tooltipKey: "collections_lithography" as const, href: "/digital-library/collections/lithography", iconName: "mdi:file-document-outline", count: "+30" },
    { labelKey: "dl.collections.books", descKey: "Livres rares, Imprimés et E-Books", tooltipKey: "collections_books" as const, href: "/digital-library/collections/books", iconName: "mdi:book-outline", count: "+400", customDesc: true },
    { labelKey: "dl.collections.periodicals", descKey: "dl.collections.periodicals.desc", tooltipKey: "collections_periodicals" as const, href: "/digital-library/collections/periodicals", iconName: "mdi:newspaper-variant-outline", count: "+70" },
    { labelKey: "dl.collections.specialized", descKey: "dl.collections.specialized.desc", tooltipKey: "collections_specialized" as const, href: "/digital-library/collections/photos", iconName: "mdi:map-outline", count: "+2 000" },
    { labelKey: "dl.collections.audiovisual", descKey: "dl.collections.audiovisual.desc", tooltipKey: "collections_audiovisual" as const, href: "/digital-library/collections/audiovisual", iconName: "mdi:music-note-outline", count: "+100" },
  ];

  const themesSubmenu = [
    { label: ml("Informatique, information et ouvrages généraux", "المعلوماتية والمعلومات والمؤلفات العامة", "Computer science, information & general works", "Informática, información y obras generales", "ⵜⴰⵎⵙⵙⵓⵏⵜ, ⵜⴰⵏⴼⵓⵙⵜ ⴷ ⵉⴷⵍⵉⵙⵏ ⵉⵎⴰⵜⴰⵢⵏ"), href: "/digital-library/themes/informatique", iconName: "mdi:laptop" },
    { label: ml("Philosophie et psychologie", "الفلسفة وعلم النفس", "Philosophy & psychology", "Filosofía y psicología", "ⵜⴰⴼⵍⵙⴰⴼⵜ ⴷ ⵜⴰⵏⴼⵙⵉⵜ"), href: "/digital-library/themes/philosophie", iconName: "mdi:head-cog-outline" },
    { label: ml("Religion", "الدين", "Religion", "Religión", "ⴰⴷⵉⵏ"), href: "/digital-library/themes/religion", iconName: "mdi:mosque" },
    { label: ml("Sciences sociales", "العلوم الاجتماعية", "Social sciences", "Ciencias sociales", "ⵜⵓⵙⵙⵏⵉⵡⵉⵏ ⵜⵉⵏⴰⵎⵓⵏⵉⵏ"), href: "/digital-library/themes/sciences-sociales", iconName: "mdi:account-group-outline" },
    { label: ml("Langues et linguistique", "اللغات واللسانيات", "Languages & linguistics", "Lenguas y lingüística", "ⵜⵓⵜⵍⴰⵢⵉⵏ ⴷ ⵜⴰⵙⵏⵉⵍⵙⵜ"), href: "/digital-library/themes/langues", iconName: "mdi:translate" },
    { label: ml("Sciences pures", "العلوم البحتة", "Pure sciences", "Ciencias puras", "ⵜⵓⵙⵙⵏⵉⵡⵉⵏ ⵜⵉⵙⵔⴼⴰⵏⵉⵏ"), href: "/digital-library/themes/sciences-pures", iconName: "mdi:flask-outline" },
    { label: ml("Techniques et sciences appliquées", "التقنيات والعلوم التطبيقية", "Technology & applied sciences", "Técnicas y ciencias aplicadas", "ⵜⵉⵜⵉⵇⵏⵉⵢⵉⵏ ⴷ ⵜⵓⵙⵙⵏⵉⵡⵉⵏ ⵜⵉⵎⵙⴽⴰⵔⵉⵏ"), href: "/digital-library/themes/techniques", iconName: "mdi:cog-outline" },
    { label: ml("Arts, loisirs et sports", "الفنون والترفيه والرياضة", "Arts, recreation & sports", "Artes, ocio y deportes", "ⵜⴰⵥⵓⵕⵉ, ⴰⵙⴼⵓⴳⵍⵓ ⴷ ⵓⴷⴷⵉⵙ"), href: "/digital-library/themes/arts", iconName: "mdi:palette-outline" },
    { label: ml("Littérature", "الأدب", "Literature", "Literatura", "ⵜⴰⵙⴽⵍⴰ"), href: "/digital-library/themes/litterature", iconName: "mdi:feather" },
    { label: ml("Géographie et histoire", "الجغرافيا والتاريخ", "Geography & history", "Geografía e historia", "ⵜⴰⴽⵔⴹⴰ ⴷ ⵓⵎⵣⵔⵓⵢ"), href: "/digital-library/themes/geographie-histoire", iconName: "mdi:earth" },
  ];

  const userMenu = isAuthenticated ? [
    { labelKey: "dl.myPersonalSpace", href: "/digital-library/my-space" },
    { labelKey: "dl.accountSettings", href: "/digital-library/account-settings" },
  ] : [];

  const adminMenu = isLibrarian ? [
    { labelKey: "dl.administration", href: "/admin/digital-library" },
  ] : [];

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'amz', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-card border-b sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Navigation principale">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Titre */}
            <div className="flex items-center gap-6">
              <Link 
                to="/digital-library" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                aria-label={t('dl.backToPortal')}
              >
                <img 
                  src={logoDigitalLibrary} 
                  alt="Ibn Battuta - Bibliothèque Numérique Marocaine" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Bouton Gestion */}
            {canManageLibrary && (
              <Link to="/admin/digital-library">
                <Button variant="outline" size="sm" className="gap-2 border-gold-bn-primary/40 hover:border-gold-bn-primary hover:bg-gold-bn-primary/10">
                  <Icon name="mdi:shield-outline" className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dl.manageLibrary')}</span>
                  <span className="sm:hidden">{t('dl.administration')}</span>
                </Button>
              </Link>
            )}

            {/* Menu Portails */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label={ml('Portails', 'البوابات', 'Portals', 'Portales', 'ⵉⵖⵔⴰⴱⵏ')}>
                  <Icon name="mdi:view-grid-outline" className="h-4 w-4" />
                  <span className="hidden sm:inline">{ml('Portails', 'البوابات', 'Portals', 'Portales', 'ⵉⵖⵔⴰⴱⵏ')}</span>
                  <Icon name="mdi:chevron-down" className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50" role="menu" aria-label={ml('Portails', 'البوابات', 'Portals', 'Portales', 'ⵉⵖⵔⴰⴱⵏ')}>
                <Link to="/">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:home-outline" className="h-4 w-4" />
                    {ml('Portail Principal', 'البوابة الرئيسية', 'Main Portal', 'Portal Principal', 'ⴰⵖⵔⴰⴱ ⴰⵎⵇⵇⵔⴰⵏ')}
                  </DropdownMenuItem>
                </Link>
                <Link to="/digital-library">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:library" className="h-4 w-4" />
                    {ml('Bibliothèque Numérique', 'المكتبة الرقمية', 'Digital Library', 'Biblioteca Digital', 'ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ')}
                  </DropdownMenuItem>
                </Link>
                <Link to="/manuscripts">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:scroll-text-outline" className="h-4 w-4" />
                    {ml('Manuscrits Numérisés', 'المخطوطات الرقمية', 'Digitized Manuscripts', 'Manuscritos Digitalizados', 'ⵉⵎⵙⴽⵜⴰⵢⵏ ⵉⵜⵜⵓⵙⵏⵓⵎⴰⵏⵏ')}
                  </DropdownMenuItem>
                </Link>
                <Link to="/portail-cbm">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:earth" className="h-4 w-4" />
                    {ml('Portail CBM', 'بوابة الفهرس البيبليوغرافي', 'CBM Portal', 'Portal CBM', 'ⴰⵖⵔⴰⴱ CBM')}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language & User Menu */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label="Sélectionner la langue">
                    <Icon name="mdi:translate" className="h-4 w-4" />
                    <span className="hidden sm:inline uppercase font-medium">{language}</span>
                    <Icon name="mdi:chevron-down" className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card z-50 min-w-[160px]" role="menu" aria-label={t('dl.chooseLanguage')}>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Icon name="mdi:web" className="h-4 w-4 text-gold-bn-primary" />
                    {t('dl.chooseLanguage')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className={`cursor-pointer focus:bg-accent focus:text-accent-foreground gap-3 ${language === lang.code ? 'bg-gold-bn-primary/10' : ''}`}
                      aria-label={`Changer la langue en ${lang.label}`}
                      aria-current={language === lang.code ? 'true' : 'false'}
                    >
                      <span className="uppercase font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{lang.code}</span>
                      <span className="flex-1">{lang.label}</span>
                      {language === lang.code && <Icon name="mdi:check" className="h-4 w-4 text-gold-bn-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeSwitcher />
              
              {/* Bouton Connexion */}
              {!isAuthenticated && (
                <Link to="/auth-BN">
                  <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label={t('dl.login')}>
                    <Icon name="mdi:login" className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('dl.login')}</span>
                  </Button>
                </Link>
              )}
              
              {/* Menu Utilisateur */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Menu utilisateur">
                      <Icon name="mdi:account-outline" className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {userProfile?.firstName || session?.user?.email?.split('@')[0] || t('dl.myAccount')}
                      </span>
                      <Icon name="mdi:chevron-down" className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card z-50 w-56" role="menu" aria-label={t('dl.myAccount')}>
                    <DropdownMenuLabel>{t('dl.myPersonalSpace')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenu.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                          {t(item.labelKey)}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    {isLibrarian && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t('dl.administration')}</DropdownMenuLabel>
                        {adminMenu.map((item) => (
                          <Link key={item.href} to={item.href}>
                            <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                              <Icon name="mdi:cog-outline" className="h-4 w-4 mr-2" />
                              {t(item.labelKey)}
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/digital-library';
                      }}
                    >
                      <Icon name="mdi:logout" className="h-4 w-4" />
                      {t('dl.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex items-center gap-1 mt-3 pb-1 overflow-x-auto" role="menubar" aria-label="Menu principal">
            <SimpleTooltip content={t('dl.home')}>
              <Link to="/digital-library" className="relative group pb-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" role="menuitem" aria-label={t('dl.home')}>
                  <Icon name="mdi:home-outline" className="h-5 w-5" />
                </Button>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
              </Link>
            </SimpleTooltip>

            <Link to="/digital-library/about" className="relative group pb-1">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" role="menuitem" aria-label={ml('À propos', 'حول', 'About', 'Acerca de', 'ⵖⴼ')}>
                <Icon name="mdi:information-outline" className="h-4 w-4" />
                {ml('À propos', 'حول', 'About', 'Acerca de', 'ⵖⴼ')}
              </Button>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </Link>

            {/* Collections Dropdown */}
            <div className="relative group pb-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" role="menuitem" aria-haspopup="true" aria-label={t('dl.collections')}>
                    <Icon name="mdi:book-open-page-variant-outline" className="h-4 w-4" />
                    {t('dl.collections')}
                    <Icon name="mdi:chevron-down" className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card z-50 min-w-[320px] p-2" role="menu" aria-label={t('dl.collections')}>
                  {collectionsSubmenu.map((item, index) => {
                    const badgeStyles = [
                      "bg-gradient-to-r from-gold-bn-primary to-amber-500 text-white shadow-lg shadow-gold-bn-primary/30 rotate-2",
                      "bg-white border-2 border-bn-blue text-gray-900 shadow-lg shadow-bn-blue/20 -rotate-1",
                      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 rotate-1",
                      "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 -rotate-2",
                      "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 rotate-1",
                      "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 -rotate-1",
                    ];
                    
                    return (
                      <FancyTooltip 
                        key={item.href}
                        content={t(item.labelKey)} 
                        description={bnTooltips[item.tooltipKey]}
                        icon={item.iconName}
                        side="right"
                        variant="gold"
                      >
                        <Link to={item.href} className="block">
                          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3 px-3 rounded-lg hover:bg-gold-bn-primary/5 transition-all duration-200 group">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 group-hover:from-gold-bn-primary/30 group-hover:to-gold-bn-primary/10 transition-all duration-200 group-hover:scale-110">
                                <Icon name={item.iconName} className="h-5 w-5 text-gold-bn-primary" />
                              </div>
                              <span className="font-semibold text-foreground group-hover:text-gold-bn-primary transition-colors">{t(item.labelKey)}</span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-none transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-0 ${badgeStyles[index % badgeStyles.length]}`}>
                              {item.count}
                            </span>
                          </DropdownMenuItem>
                        </Link>
                      </FancyTooltip>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </div>

            {/* Bouquets électroniques */}
            <div className="relative group pb-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.electronicResources')} aria-haspopup="true">
                      <Icon name="mdi:library" className="h-4 w-4" />
                      {t('dl.electronicResources')}
                      <Icon name="mdi:chevron-down" className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card z-50 min-w-[320px] p-2">
                  {activeBundles && activeBundles.length > 0 ? (
                    activeBundles.map((bundle, index) => {
                      // Chercher le logo local en priorité basé sur le nom du provider
                      const providerKey = bundle.provider?.toLowerCase().trim();
                      const localLogo = providerKey ? providerLogoMap[providerKey] : null;
                      const logoSrc = localLogo || bundle.provider_logo_url;
                      
                      // Logos avec texte blanc nécessitant un fond sombre
                      const needsDarkBackground = providerKey === 'almanhal' || providerKey === 'eni' || providerKey === 'eni-elearning';
                      
                      // Description du bouquet (bilingue) avec fallback
                      const defaultDescriptions: Record<string, { fr: string; ar: string; icon: string }> = {
                        'cairn': { 
                          fr: "Plateforme contenant des revues et ouvrages en sciences humaines et sociales francophones", 
                          ar: "منصة تحتوي على مجلات وكتب في العلوم الإنسانية والاجتماعية الفرنكوفونية",
                          icon: "mdi:book-open-page-variant"
                        },
                        'ebsco': { 
                          fr: "Plateforme contenant des milliers de revues académiques internationales multidisciplinaires", 
                          ar: "منصة تحتوي على آلاف المجلات الأكاديمية الدولية متعددة التخصصات",
                          icon: "mdi:database-search"
                        },
                        'brill': { 
                          fr: "Plateforme contenant des publications académiques en études orientales, religion et histoire", 
                          ar: "منصة تحتوي على منشورات أكاديمية في الدراسات الشرقية والدين والتاريخ",
                          icon: "mdi:book-education"
                        },
                        'almanhal': { 
                          fr: "Plateforme contenant des ressources numériques en langue arabe couvrant tous les domaines du savoir", 
                          ar: "منصة تحتوي على موارد رقمية باللغة العربية تغطي جميع مجالات المعرفة",
                          icon: "mdi:library"
                        },
                        'eni-elearning': { 
                          fr: "Plateforme contenant des cours interactifs en informatique et technologies numériques", 
                          ar: "منصة تحتوي على دورات تفاعلية في تكنولوجيا المعلومات والتقنيات الرقمية",
                          icon: "mdi:laptop"
                        },
                        'eni': { 
                          fr: "Plateforme contenant des cours interactifs en informatique et technologies numériques", 
                          ar: "منصة تحتوي على دورات تفاعلية في تكنولوجيا المعلومات والتقنيات الرقمية",
                          icon: "mdi:laptop"
                        },
                        'europeana': { 
                          fr: "Plateforme contenant le patrimoine culturel européen numérisé", 
                          ar: "منصة تحتوي على التراث الثقافي الأوروبي الرقمي",
                          icon: "mdi:castle"
                        },
                        'rfn': { 
                          fr: "Plateforme contenant les ressources du réseau francophone numérique", 
                          ar: "منصة تحتوي على موارد الشبكة الفرنكوفونية الرقمية",
                          icon: "mdi:earth"
                        },
                        'ifla': { 
                          fr: "Plateforme contenant les ressources de la fédération internationale des bibliothèques", 
                          ar: "منصة تحتوي على موارد الاتحاد الدولي لجمعيات المكتبات",
                          icon: "mdi:account-group"
                        },
                      };
                      
                      const defaultData = providerKey ? defaultDescriptions[providerKey] : null;
                      const bundleDescription = (() => {
                        if (language === 'ar') return bundle.description_ar || defaultData?.ar || '';
                        return bundle.description || defaultData?.fr || '';
                      })();
                      const bundleName = language === 'ar' && bundle.name_ar ? bundle.name_ar : bundle.name;
                      const bundleIcon = defaultData?.icon || 'mdi:book-open-variant';
                      
                      // Styles de badges variés
                      const badgeStyles = [
                        "bg-gradient-to-r from-gold-bn-primary to-amber-500 text-white shadow-lg shadow-gold-bn-primary/30",
                        "bg-gradient-to-r from-bn-blue-primary to-blue-600 text-white shadow-lg shadow-bn-blue-primary/30",
                        "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
                        "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30",
                        "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30",
                      ];
                      
                      return (
                        <FancyTooltip 
                          key={bundle.id}
                          content={bundleName} 
                          description={bundleDescription || ml("Accédez à cette ressource électronique", "الوصول إلى هذا المورد الإلكتروني", "Access this electronic resource", "Acceda a este recurso electrónico", "ⴽⵛⵎ ⵖⵔ ⵜⵖⴱⵓⵍⵜ ⴰⴷ ⵜⴰⵍⵉⴽⵜⵕⵓⵏⵉⵜ")}
                          icon={bundleIcon}
                          side="right"
                          variant="gold"
                        >
                          <a 
                            href={bundle.api_base_url || bundle.website_url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3 px-3 rounded-lg hover:bg-gold-bn-primary/5 transition-all duration-200 group">
                              <div className="flex items-center gap-3 flex-1">
                                {logoSrc ? (
                                  <div className={`p-2 rounded-xl ${needsDarkBackground ? 'bg-bn-blue-primary' : 'bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 group-hover:from-gold-bn-primary/30 group-hover:to-gold-bn-primary/10'} transition-all duration-200 group-hover:scale-110`}>
                                    <img src={logoSrc} alt={bundle.provider} className="h-6 w-auto max-w-[80px] object-contain" />
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 group-hover:from-gold-bn-primary/30 group-hover:to-gold-bn-primary/10 transition-all duration-200 group-hover:scale-110">
                                    <Icon name={bundleIcon} className="h-5 w-5 text-gold-bn-primary" />
                                  </div>
                                )}
                                <span className="font-semibold text-foreground group-hover:text-gold-bn-primary transition-colors">{bundleName}</span>
                              </div>
                              {bundle.document_count && bundle.document_count > 0 && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-none transform transition-all duration-300 group-hover:scale-110 ${badgeStyles[index % badgeStyles.length]}`}>
                                  {bundle.document_count > 1000 ? `+${Math.floor(bundle.document_count / 1000)}K` : bundle.document_count}
                                </span>
                              )}
                              <Icon name="mdi:open-in-new" className="h-4 w-4 text-muted-foreground group-hover:text-gold-bn-primary transition-colors" />
                            </DropdownMenuItem>
                          </a>
                        </FancyTooltip>
                      );
                    })
                  ) : (
                    <DropdownMenuItem disabled className="text-muted-foreground text-sm">
                      {ml('Aucune ressource disponible', 'لا توجد موارد متاحة', 'No resources available', 'No hay recursos disponibles', 'ⵓⵔ ⵍⵍⵉⵏ ⵜⵉⵖⴱⵓⵍⴰ')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </div>

            <Link to="/digital-library/search" className="relative group pb-1">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.advancedSearch')}>
                <Icon name="mdi:magnify" className="h-4 w-4" />
                {t('dl.advancedSearch')}
              </Button>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </Link>

            {/* Services aux lecteurs */}
            {isAuthenticated && (
              <div className="relative group pb-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.readerServices')} aria-haspopup="true">
                      <Icon name="mdi:bookmark-check-outline" className="h-4 w-4" />
                      {t('dl.readerServices')}
                      <Icon name="mdi:chevron-down" className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card z-50 min-w-[280px] p-2" role="menu" aria-label={t('dl.readerServices')}>
                    <FancyTooltip 
                      content={t('dl.membership')} 
                      description={bnTooltips.services_membership}
                      icon="mdi:account-plus-outline"
                      side="right"
                      variant="gold"
                    >
                      <Link to="/abonnements?platform=bn" className="block">
                        <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3 px-3 rounded-lg hover:bg-gold-bn-primary/5 transition-all duration-200 group">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 group-hover:from-gold-bn-primary/30 group-hover:to-gold-bn-primary/10 transition-all duration-200 group-hover:scale-110">
                            <Icon name="mdi:account-plus-outline" className="h-5 w-5 text-gold-bn-primary" />
                          </div>
                          <span className="font-semibold text-foreground group-hover:text-gold-bn-primary transition-colors">{t('dl.membership')}</span>
                        </DropdownMenuItem>
                      </Link>
                    </FancyTooltip>
                    <FancyTooltip 
                      content={ml("Demande de Reproduction", "طلب استنساخ", "Reproduction Request", "Solicitud de Reproducción", "ⴰⵙⵓⵜⵔ ⵏ ⵓⵙⵏⵖⵍ")}
                      description={bnTooltips.services_reproduction}
                      icon="mdi:content-copy"
                      side="right"
                      variant="gold"
                    >
                      <Link to="/demande-reproduction?platform=bn" className="block">
                        <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3 px-3 rounded-lg hover:bg-gold-bn-primary/5 transition-all duration-200 group">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 group-hover:from-purple-500/30 group-hover:to-purple-500/10 transition-all duration-200 group-hover:scale-110">
                            <Icon name="mdi:content-copy" className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">{ml("Demande de Reproduction", "طلب استنساخ", "Reproduction Request", "Solicitud de Reproducción", "ⴰⵙⵓⵜⵔ ⵏ ⵓⵙⵏⵖⵍ")}</span>
                        </DropdownMenuItem>
                      </Link>
                    </FancyTooltip>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
              </div>
            )}

            {/* Themes */}
            <div className="relative group pb-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.exploreByTheme')} aria-haspopup="true">
                    <Icon name="mdi:earth" className="h-4 w-4" />
                    {t('dl.exploreByTheme')}
                    <Icon name="mdi:chevron-down" className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card z-50 w-[340px] p-1.5 grid grid-cols-1 gap-0.5" role="menu" aria-label={t('dl.exploreByTheme')}>
                  {themesSubmenu.map((item, index) => {
                    const iconColors = [
                      "from-blue-500 to-indigo-600",
                      "from-purple-500 to-violet-600", 
                      "from-emerald-500 to-teal-600",
                      "from-amber-500 to-orange-600",
                      "from-cyan-500 to-blue-500",
                      "from-rose-500 to-pink-600",
                      "from-green-500 to-emerald-600",
                      "from-fuchsia-500 to-purple-600",
                      "from-indigo-500 to-blue-600",
                      "from-teal-500 to-cyan-600",
                    ];
                    
                    return (
                      <Link key={item.href} to={item.href} className="block">
                        <DropdownMenuItem className="gap-2.5 cursor-pointer focus:bg-accent py-2 px-2.5 rounded-md hover:bg-bn-blue/5 transition-all duration-200 group">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${iconColors[index % iconColors.length]} shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
                            <Icon name={item.iconName} className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground/80 group-hover:text-bn-blue transition-colors flex-1 truncate">{item.label}</span>
                          <Icon name="mdi:chevron-right" className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </div>

            <Link to="/digital-library/help" className="relative group pb-1">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.helpFaq')}>
                <Icon name="mdi:help-circle-outline" className="h-4 w-4" />
                {t('dl.helpFaq')}
              </Button>
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary transition-all duration-300 ease-out group-hover:w-4/5 rounded-full" />
            </Link>
          </div>

          {/* Barre de recherche globale - Hidden on homepage since it has integrated search */}
          {!isHomePage && (
            <div className="mt-4">
              <GlobalSearchBar />
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1" role="main" id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer BN */}
      <DigitalLibraryFooter />

      {/* Outils globaux d'accessibilité et chatbot */}
      <GlobalAccessibilityTools />

      {/* Dialog de demande de reproduction */}
      {showReproductionDialog && userProfile && (
        <ReproductionRequestDialog
          isOpen={showReproductionDialog}
          onClose={() => setShowReproductionDialog(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
