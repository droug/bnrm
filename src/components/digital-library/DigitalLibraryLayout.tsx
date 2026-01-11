import { ReactNode, useState, useEffect } from "react";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Book, BookOpen, Search, Globe, Calendar, HelpCircle, User, Settings, ChevronDown, Home, FileText, Image, Music, Video, Sparkles, BookmarkCheck, FileDigit, Shield, Library, UserPlus, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import logoBnrm from "@/assets/logo-bnrm.png";
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
  
  // Vérifier si l'utilisateur est admin ou bibliothécaire (compatible avec Header.tsx)
  const canManageLibrary = isLibrarian || profile?.role === 'admin' || profile?.role === 'librarian';
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showDigitizationDialog, setShowDigitizationDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { activeBundles } = useElectronicBundles();

  // Charger le profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // Utiliser les données du profil ou les métadonnées de l'utilisateur comme fallback
      if (data && !error) {
        setUserProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: session.user.email || "",
        });
      } else {
        // Fallback sur les métadonnées de l'utilisateur
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
    { label: "Livres", href: "/digital-library/collections/books", icon: Book, count: "45,670", description: "Ouvrages numérisés" },
    { label: "Revues et journaux", href: "/digital-library/collections/periodicals", icon: FileText, count: "8,320", description: "Publications périodiques" },
    { label: "Manuscrits", href: "/digital-library/collections/manuscripts", icon: BookOpen, count: "12,450", description: "Manuscrits anciens" },
    { label: "Collections spécialisées", href: "/digital-library/collections/photos", icon: Image, count: "15,890", description: "Photos, cartes et lithographies" },
    { label: "Audio-visuel", href: "/digital-library/collections/audiovisual", icon: Music, count: "2,890", description: "Archives sonores et vidéos" },
  ];

  const themesSubmenu = [
    { label: "Histoire & Patrimoine", href: "/digital-library/themes/history" },
    { label: "Arts & Culture", href: "/digital-library/themes/arts" },
    { label: "Sciences & Techniques", href: "/digital-library/themes/sciences" },
    { label: "Religion & Philosophie", href: "/digital-library/themes/religion" },
    { label: "Littérature & Poésie", href: "/digital-library/themes/literature" },
  ];

  const userMenu = isAuthenticated ? [
    { label: "Mon espace personnel", href: "/digital-library/my-space" },
    { label: "Mes demandes", href: "/digital-library/mes-demandes" },
    { label: "Mes emprunts numériques", href: "/digital-library/my-loans" },
    { label: "Mes annotations", href: "/digital-library/my-notes" },
    { label: "Paramètres du compte", href: "/digital-library/account-settings" },
  ] : [];

  const adminMenu = isLibrarian ? [
    { label: "Administration", href: "/admin/digital-library" },
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
            {/* Logo BNRM + Titre */}
            <div className="flex items-center gap-6">
              {/* Logo BNRM cliquable vers le portail */}
              <Link 
                to="/" 
                className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                aria-label="Retour au portail principal BNRM"
              >
                <img 
                  src={logoBnrm} 
                  alt="Logo BNRM" 
                  className="h-12 w-auto object-contain"
                />
              </Link>

              {/* Titre de la bibliothèque */}
              <Link 
                to="/digital-library" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                aria-label="Retour à l'accueil de la bibliothèque numérique"
              >
                <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
                <div>
                  <h1 className="text-lg font-bold text-foreground">Bibliothèque Numérique</h1>
                  <p className="text-xs text-muted-foreground">BNRM - Patrimoine Numérique du Maroc</p>
                </div>
              </Link>
            </div>

            {/* Bouton Gestion Bibliothèque Numérique pour admin/bibliothécaire */}
            {canManageLibrary && (
              <Link to="/admin/digital-library">
                <Button variant="outline" size="sm" className="gap-2 border-primary/40 hover:border-primary hover:bg-primary/10">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Gestion Bibliothèque Numérique</span>
                  <span className="sm:hidden">Gestion</span>
                </Button>
              </Link>
            )}

            {/* Language Selector, Theme Switcher & User Menu */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                    aria-label="Sélectionner la langue"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{languages.find(lang => lang.code === language)?.label}</span>
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card z-50" role="menu" aria-label="Menu des langues">
                  <DropdownMenuLabel>Choisir une langue</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                      aria-label={`Changer la langue en ${lang.label}`}
                      aria-current={language === lang.code ? 'true' : 'false'}
                    >
                      {lang.label}
                      {language === lang.code && <span className="ml-auto text-primary" aria-hidden="true">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeSwitcher />
              
              {/* Boutons Connexion/Adhésion pour utilisateurs non connectés */}
              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Link to="/auth">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Se connecter"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Connexion</span>
                    </Button>
                  </Link>
                  <Link to="/abonnements">
                    <Button 
                      size="sm" 
                      className="gap-2 text-sm bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="S'inscrire ou adhérer"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Adhésion</span>
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Menu Utilisateur */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                      aria-label="Menu utilisateur"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">
                        {userProfile?.firstName || session?.user?.email?.split('@')[0] || 'Mon compte'}
                      </span>
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card z-50 w-56" role="menu" aria-label="Menu utilisateur">
                    <DropdownMenuLabel>Mon espace</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenu.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    {isLibrarian && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Administration</DropdownMenuLabel>
                        {adminMenu.map((item) => (
                          <Link key={item.href} to={item.href}>
                            <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                              {item.label}
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
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto" role="menubar" aria-label="Menu principal">
            <Link to="/digital-library">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                role="menuitem"
                aria-label="Accueil de la bibliothèque numérique"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Accueil
              </Button>
            </Link>

            {/* Collections Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                  role="menuitem" 
                  aria-haspopup="true"
                  aria-label="Menu des collections"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Collections
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50 min-w-[280px]" role="menu" aria-label="Sous-menu Collections">
                {collectionsSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground py-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {item.count}
                      </span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bouquets électroniques Dropdown - après Collections */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Accéder aux bouquets électroniques"
                  aria-haspopup="true"
                >
                  <Library className="h-4 w-4" aria-hidden="true" />
                  Bouquets électroniques
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50 min-w-[200px]">
                <DropdownMenuLabel>Ressources électroniques</DropdownMenuLabel>
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
                          <img 
                            src={bundle.provider_logo_url} 
                            alt={bundle.provider}
                            className="h-4 w-4 object-contain"
                          />
                        ) : (
                          <Globe className="h-4 w-4" aria-hidden="true" />
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
                    Aucun bouquet disponible
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/digital-library/search">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Recherche avancée dans la bibliothèque"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Recherche avancée
              </Button>
            </Link>

            {/* Services aux lecteurs Dropdown */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Services aux lecteurs"
                    aria-haspopup="true"
                  >
                    <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                    Services aux lecteurs
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card z-50" role="menu" aria-label="Sous-menu Services aux lecteurs">
                  <Link to="/abonnements">
                    <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Adhésion
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    onClick={() => setShowReservationDialog(true)}
                  >
                    <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                    Demande de Réservation
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    onClick={() => setShowDigitizationDialog(true)}
                  >
                    <FileDigit className="h-4 w-4" aria-hidden="true" />
                    Demande de Numérisation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Themes Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Explorer par thème"
                  aria-haspopup="true"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Explorer par thème
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card z-50">
                {themesSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/digital-library/news">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Consulter les actualités et événements"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Actualités & Événements
              </Button>
            </Link>

            <Link to="/digital-library/help">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Aide et foire aux questions"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Aide & FAQ
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

      {/* Footer */}
      <Footer />

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
