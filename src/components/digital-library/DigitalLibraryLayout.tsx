import { ReactNode } from "react";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Book, BookOpen, Search, Globe, Calendar, HelpCircle, User, Settings, ChevronDown, Home, FileText, Image, Music, Video, Sparkles, BookmarkCheck, FileDigit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface DigitalLibraryLayoutProps {
  children: ReactNode;
}

export function DigitalLibraryLayout({ children }: DigitalLibraryLayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, isLibrarian } = useAccessControl();

  const collectionsSubmenu = [
    { label: "Livres numériques", href: "/digital-library/collections/books", icon: Book },
    { label: "Revues et périodiques", href: "/digital-library/collections/periodicals", icon: FileText },
    { label: "Manuscrits numérisés", href: "/digital-library/collections/manuscripts", icon: BookOpen },
    { label: "Photographies et cartes", href: "/digital-library/collections/photos", icon: Image },
    { label: "Archives sonores et audiovisuelles", href: "/digital-library/collections/audiovisual", icon: Music },
  ];

  const themesSubmenu = [
    { label: "Histoire & Patrimoine", href: "/digital-library/themes/history" },
    { label: "Arts & Culture", href: "/digital-library/themes/arts" },
    { label: "Sciences & Techniques", href: "/digital-library/themes/sciences" },
    { label: "Religion & Philosophie", href: "/digital-library/themes/religion" },
    { label: "Littérature & Poésie", href: "/digital-library/themes/literature" },
  ];

  const servicesSubmenu = [
    { label: "Mes demandes de réservation", href: "/digital-library/mes-reservations", icon: BookmarkCheck },
    { label: "Mes demandes de numérisation", href: "/digital-library/mes-demandes-numerisation", icon: FileDigit },
  ];

  const userMenu = isAuthenticated ? [
    { label: "Mon espace personnel", href: "/digital-library/my-space" },
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
            {/* Logo and Title */}
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

            {/* Language Selector & Theme Switcher */}
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
              <DropdownMenuContent align="start" className="bg-card z-50" role="menu" aria-label="Sous-menu Collections">
                {collectionsSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
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
                  {servicesSubmenu.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
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

          {/* User/Admin Menu */}
          {(userMenu.length > 0 || adminMenu.length > 0) && (
            <div className="flex items-center gap-2 mt-2 border-t pt-2">
              {userMenu.length > 0 && (
                <div className="flex items-center gap-1" role="navigation" aria-label="Menu utilisateur">
                  <User className="h-4 w-4 text-muted-foreground mr-1" aria-hidden="true" />
                  {userMenu.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={item.label}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
              
              {adminMenu.length > 0 && (
                <div className="flex items-center gap-1 ml-auto" role="navigation" aria-label="Menu administration">
                  <Settings className="h-4 w-4 text-muted-foreground mr-1" aria-hidden="true" />
                  {adminMenu.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={item.label}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
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
    </div>
  );
}
