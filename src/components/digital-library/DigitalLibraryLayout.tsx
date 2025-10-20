import { ReactNode } from "react";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Book, BookOpen, Search, Globe, Calendar, HelpCircle, User, Settings, ChevronDown, Home, FileText, Image, Music, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Footer from "@/components/Footer";
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
            <Link to="/digital-library" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Bibliothèque Numérique</h1>
                <p className="text-xs text-muted-foreground">BNRM - Patrimoine Numérique du Maroc</p>
              </div>
            </Link>

            {/* Language Selector & Theme Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" role="group" aria-label="Sélection de langue">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage(lang.code as Language)}
                    className="text-xs"
                    aria-label={`Changer la langue en ${lang.label}`}
                    aria-pressed={language === lang.code}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
              <ThemeSwitcher />
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto" role="menubar" aria-label="Menu principal">
            <Link to="/digital-library">
              <Button variant="ghost" size="sm" className="gap-2 text-sm" role="menuitem">
                <Home className="h-4 w-4" aria-hidden="true" />
                Accueil
              </Button>
            </Link>

            {/* Collections Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm" role="menuitem" aria-haspopup="true">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Collections
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" role="menu" aria-label="Sous-menu Collections">
                {collectionsSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/digital-library/search">
              <Button variant="ghost" size="sm" className="gap-2 text-sm">
                <Search className="h-4 w-4" />
                Recherche avancée
              </Button>
            </Link>

            {/* Themes Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  Explorer par thème
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {themesSubmenu.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <DropdownMenuItem className="cursor-pointer">
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/digital-library/news">
              <Button variant="ghost" size="sm" className="gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Actualités & Événements
              </Button>
            </Link>

            <Link to="/digital-library/help">
              <Button variant="ghost" size="sm" className="gap-2 text-sm">
                <HelpCircle className="h-4 w-4" />
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
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground mr-1" />
                  {userMenu.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
              
              {adminMenu.length > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Settings className="h-4 w-4 text-muted-foreground mr-1" />
                  {adminMenu.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button variant="ghost" size="sm" className="text-xs">
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
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
