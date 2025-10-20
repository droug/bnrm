import { ReactNode } from "react";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Book, BookOpen, Search, Globe, Calendar, HelpCircle, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";

interface DigitalLibraryLayoutProps {
  children: ReactNode;
}

export function DigitalLibraryLayout({ children }: DigitalLibraryLayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, isLibrarian } = useAccessControl();

  const mainMenu = [
    { label: "Accueil", href: "/digital-library", icon: Book },
    { label: "Collections", href: "/digital-library/collections", icon: BookOpen },
    { label: "Recherche avancée", href: "/digital-library/search", icon: Search },
    { label: "Explorer par thème", href: "/digital-library/themes", icon: Globe },
    { label: "Actualités & Événements", href: "/digital-library/news", icon: Calendar },
    { label: "Aide & FAQ", href: "/digital-library/help", icon: HelpCircle },
  ];

  const userMenu = isAuthenticated ? [
    { label: "Mon espace personnel", href: "/digital-library/my-space" },
    { label: "Mes emprunts numériques", href: "/digital-library/my-loans" },
    { label: "Mes annotations", href: "/digital-library/my-notes" },
    { label: "Paramètres du compte", href: "/settings" },
  ] : [];

  const adminMenu = isLibrarian ? [
    { label: "Tableau de bord", href: "/admin/digital-library" },
    { label: "Gestion des collections", href: "/admin/digital-library/documents" },
    { label: "Import & Catalogage", href: "/admin/digital-library/bulk-import" },
    { label: "Utilisateurs & droits", href: "/admin/digital-library/users" },
    { label: "Statistiques et rapports", href: "/admin/digital-library/analytics" },
    { label: "Paramètres techniques", href: "/admin/digital-library/settings" },
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
      <nav className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Bibliothèque Numérique</h1>
                <p className="text-xs text-muted-foreground">BNRM - Patrimoine Numérique du Maroc</p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage(lang.code as Language)}
                  className="text-xs"
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto">
            {mainMenu.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button variant="ghost" size="sm" className="gap-2 text-sm">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
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
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About BNRM */}
            <div>
              <h3 className="font-bold text-foreground mb-3">À propos de la BNRM</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">Mission et historique</Link></li>
                <li><Link to="/partners" className="hover:text-primary">Nos partenaires</Link></li>
                <li><Link to="/team" className="hover:text-primary">L'équipe</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Mentions légales</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/legal/copyright" className="hover:text-primary">Droits d'auteur</Link></li>
                <li><Link to="/legal/accessibility" className="hover:text-primary">Accessibilité RGAA</Link></li>
                <li><Link to="/legal/terms" className="hover:text-primary">Conditions d'utilisation</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-primary">Politique de confidentialité</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Contact / Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-primary">Nous contacter</Link></li>
                <li><Link to="/digital-library/help" className="hover:text-primary">Centre d'aide</Link></li>
                <li><Link to="/feedback" className="hover:text-primary">Votre avis</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Suivez-nous</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Bibliothèque Nationale du Royaume du Maroc - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
