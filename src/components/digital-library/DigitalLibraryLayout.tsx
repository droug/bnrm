import { ReactNode, useState, useEffect } from "react";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import DigitalLibraryFooter from "@/components/digital-library/DigitalLibraryFooter";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import logoDigitalLibrary from "@/assets/digital-library-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { DigitizationRequestDialog } from "@/components/digital-library/DigitizationRequestDialog";
import { supabase } from "@/integrations/supabase/client";
import { useElectronicBundles } from "@/hooks/useElectronicBundles";

interface DigitalLibraryLayoutProps {
  children: ReactNode;
}

export function DigitalLibraryLayout({ children }: DigitalLibraryLayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, isLibrarian } = useAccessControl();
  const { session, profile } = useAuth();
  
  const canManageLibrary = isLibrarian || profile?.role === 'admin' || profile?.role === 'librarian';
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showDigitizationDialog, setShowDigitizationDialog] = useState(false);
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
    { labelKey: "dl.collections.manuscripts", descKey: "dl.collections.manuscripts.desc", tooltipKey: "dl.collections.manuscripts.tooltip", href: "/digital-library/collections/manuscripts", iconName: "mdi:scroll-text-outline", count: "12,450" },
    { labelKey: "dl.collections.books", descKey: "dl.collections.books.desc", tooltipKey: "dl.collections.books.tooltip", href: "/digital-library/collections/books", iconName: "mdi:book-outline", count: "35,000" },
    { labelKey: "dl.collections.lithography", descKey: "dl.collections.lithography.desc", tooltipKey: "dl.collections.lithography.tooltip", href: "/digital-library/collections/lithography", iconName: "mdi:file-document-outline", count: "10,670" },
    { labelKey: "dl.collections.periodicals", descKey: "dl.collections.periodicals.desc", tooltipKey: "dl.collections.periodicals.tooltip", href: "/digital-library/collections/periodicals", iconName: "mdi:newspaper-variant-outline", count: "8,320" },
    { labelKey: "dl.collections.specialized", descKey: "dl.collections.specialized.desc", tooltipKey: "dl.collections.specialized.tooltip", href: "/digital-library/collections/photos", iconName: "mdi:map-outline", count: "15,890" },
    { labelKey: "dl.collections.audiovisual", descKey: "dl.collections.audiovisual.desc", tooltipKey: "dl.collections.audiovisual.tooltip", href: "/digital-library/collections/audiovisual", iconName: "mdi:music-note-outline", count: "2,890" },
  ];

  const themesSubmenu = [
    { labelKey: "dl.themes.history", href: "/digital-library/themes/history" },
    { labelKey: "dl.themes.arts", href: "/digital-library/themes/arts" },
    { labelKey: "dl.themes.sciences", href: "/digital-library/themes/sciences" },
    { labelKey: "dl.themes.religion", href: "/digital-library/themes/religion" },
    { labelKey: "dl.themes.literature", href: "/digital-library/themes/literature" },
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
    { code: 'ber', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
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
                  className="h-14 w-auto object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-foreground">Bibliothèque Numérique Marocaine</h1>
                  <p className="text-xs text-muted-foreground">{t('dl.subtitle')}</p>
                </div>
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
                <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label="Portails">
                  <Icon name="mdi:view-grid-outline" className="h-4 w-4" />
                  <span className="hidden sm:inline">Portails</span>
                  <Icon name="mdi:chevron-down" className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50" role="menu" aria-label="Portails">
                <Link to="/">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:home-outline" className="h-4 w-4" />
                    Portail Principal
                  </DropdownMenuItem>
                </Link>
                <Link to="/digital-library">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:library" className="h-4 w-4" />
                    Bibliothèque Numérique
                  </DropdownMenuItem>
                </Link>
                <Link to="/manuscripts">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:scroll-text-outline" className="h-4 w-4" />
                    Manuscrits Numérisés
                  </DropdownMenuItem>
                </Link>
                <Link to="/portail-cbm">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Icon name="mdi:earth" className="h-4 w-4" />
                    Portail CBM
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
              
              {/* Boutons Connexion/Adhésion */}
              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Link to="/auth?redirect=/digital-library">
                    <Button variant="outline" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label={t('dl.login')}>
                      <Icon name="mdi:login" className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('dl.login')}</span>
                    </Button>
                  </Link>
                  <Link to="/abonnements?platform=bn">
                    <Button size="sm" className="gap-2 text-sm bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white focus-visible:ring-2 focus-visible:ring-gold-bn-primary focus-visible:ring-offset-2" aria-label={t('dl.membership')}>
                      <Icon name="mdi:account-plus-outline" className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('dl.membership')}</span>
                    </Button>
                  </Link>
                </div>
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
          <div className="flex items-center gap-1 mt-3 overflow-x-auto" role="menubar" aria-label="Menu principal">
            <SimpleTooltip content={t('dl.home')}>
              <Link to="/digital-library">
                <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" role="menuitem" aria-label={t('dl.home')}>
                  <Icon name="mdi:home-outline" className="h-5 w-5" />
                </Button>
              </Link>
            </SimpleTooltip>

            <Link to="/digital-library/about">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" role="menuitem" aria-label="À propos">
                <Icon name="mdi:information-outline" className="h-4 w-4" />
                À propos
              </Button>
            </Link>

            {/* Collections Dropdown */}
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
                    <Link key={item.href} to={item.href} className="block" title={t(item.tooltipKey)}>
                      <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3 px-3 rounded-lg hover:bg-gold-bn-primary/5 transition-all duration-200 group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 group-hover:from-gold-bn-primary/30 group-hover:to-gold-bn-primary/10 transition-all duration-200 group-hover:scale-110">
                            <Icon name={item.iconName} className="h-5 w-5 text-gold-bn-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground group-hover:text-gold-bn-primary transition-colors">{t(item.labelKey)}</span>
                            <span className="text-xs text-muted-foreground">{t(item.descKey)}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-none transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-0 ${badgeStyles[index % badgeStyles.length]}`}>
                          {item.count}
                        </span>
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bouquets électroniques */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Ressources électroniques" aria-haspopup="true">
                  <Icon name="mdi:library" className="h-4 w-4" />
                  Ressources électroniques
                  <Icon name="mdi:chevron-down" className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50 min-w-[200px]">
                <DropdownMenuLabel>{t('dl.electronicResources')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activeBundles && activeBundles.length > 0 ? (
                  activeBundles.map((bundle) => (
                    <DropdownMenuItem 
                      key={bundle.id} 
                      className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                      onClick={() => {
                        if (bundle.website_url) {
                          window.open(bundle.website_url, '_blank');
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {bundle.provider_logo_url ? (
                          <img src={bundle.provider_logo_url} alt={bundle.provider} className="h-4 w-4 object-contain" />
                        ) : (
                          <Icon name="mdi:earth" className="h-4 w-4" />
                        )}
                        <div className="flex flex-col">
                          <span>{language === 'ar' && bundle.name_ar ? bundle.name_ar : bundle.name}</span>
                          <span className="text-xs text-muted-foreground">{bundle.provider}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground text-sm">
                    {t('dl.noBundlesAvailable')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/digital-library/search">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.advancedSearch')}>
                <Icon name="mdi:magnify" className="h-4 w-4" />
                {t('dl.advancedSearch')}
              </Button>
            </Link>

            {/* Services aux lecteurs */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.readerServices')} aria-haspopup="true">
                    <Icon name="mdi:bookmark-check-outline" className="h-4 w-4" />
                    {t('dl.readerServices')}
                    <Icon name="mdi:chevron-down" className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card z-50" role="menu" aria-label={t('dl.readerServices')}>
                  <Link to="/abonnements?platform=bn">
                    <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      <Icon name="mdi:account-plus-outline" className="h-4 w-4" />
                      {t('dl.membership')}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground" onClick={() => setShowReservationDialog(true)}>
                    <Icon name="mdi:bookmark-check-outline" className="h-4 w-4" />
                    {t('dl.reservationRequest')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground" onClick={() => setShowDigitizationDialog(true)}>
                    <Icon name="mdi:file-document-edit-outline" className="h-4 w-4" />
                    {t('dl.digitizationRequest')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Themes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.exploreByTheme')} aria-haspopup="true">
                  <Icon name="mdi:earth" className="h-4 w-4" />
                  {t('dl.exploreByTheme')}
                  <Icon name="mdi:chevron-down" className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50">
                {themesSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      {t(item.labelKey)}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>


            <Link to="/digital-library/help">
              <Button variant="ghost" size="sm" className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={t('dl.helpFaq')}>
                <Icon name="mdi:help-circle-outline" className="h-4 w-4" />
                {t('dl.helpFaq')}
              </Button>
            </Link>
          </div>

          {/* Barre de recherche globale */}
          <div className="mt-4">
            <GlobalSearchBar />
          </div>
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

      {/* Dialogs de demandes */}
      {showReservationDialog && userProfile && (
        <ReservationRequestDialog
          isOpen={showReservationDialog}
          onClose={() => setShowReservationDialog(false)}
          userProfile={userProfile}
        />
      )}
      {showDigitizationDialog && userProfile && (
        <DigitizationRequestDialog
          isOpen={showDigitizationDialog}
          onClose={() => setShowDigitizationDialog(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
