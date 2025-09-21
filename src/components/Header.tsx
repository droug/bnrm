import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile } = useAuth();

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Portal - Bibliothèque Nationale", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        {/* Top bar with language and contact */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-border/50">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{t('header.title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-muted-foreground hover:text-foreground ${language === 'ar' ? 'text-primary' : ''}`}
              onClick={() => setLanguage('ar')}
            >
              <Globe className="h-4 w-4 mr-1" />
              العربية
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-muted-foreground hover:text-foreground ${language === 'ber' ? 'text-primary' : ''}`}
              onClick={() => setLanguage('ber')}
            >
              ⵜⴰⵎⴰⵣⵉⵖⵜ
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-muted-foreground hover:text-foreground ${language === 'fr' ? 'text-primary' : ''}`}
              onClick={() => setLanguage('fr')}
            >
              Français
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-muted-foreground hover:text-foreground ${language === 'en' ? 'text-primary' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {profile?.first_name || 'Dashboard'}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Connexion</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-moroccan">
              <Book className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">BNRM</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Bibliothèque Nationale</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-6">
              {/* Bibliothèque */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Bibliothèque
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] md:w-[600px] lg:grid-cols-[.75fr_1fr] bg-card border border-border rounded-lg shadow-moroccan">
                    <div className="row-span-3 bg-gradient-primary rounded-md p-4 text-primary-foreground">
                      <div className="mb-2 mt-4 text-lg font-medium">
                        À propos de la BNRM
                      </div>
                      <p className="text-sm leading-tight text-primary-foreground/90">
                        Découvrez l'histoire et la mission de la Bibliothèque Nationale du Royaume du Maroc
                      </p>
                    </div>
                    <NavigationMenuLink asChild>
                      <a href="/resources" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Ressources
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Nouvelles acquisitions et documents spécialisés
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/collections" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Book className="w-4 h-4 mr-2" />
                          Nos collections
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Manuscrits, livres rares et patrimoine documentaire
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/cooperation" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Coopération
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Partenariats et échanges internationaux
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Activités Culturelles */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Calendar className="w-4 h-4 mr-2" />
                  Activités Culturelles
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:grid-cols-2 bg-card border border-border rounded-lg shadow-moroccan">
                    <NavigationMenuLink asChild>
                      <a href="/rencontres-debats" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Rencontres débats</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Conférences et discussions littéraires
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/presentations-ouvrages" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Présentations d'ouvrages</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Lancements et signatures de livres
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/expositions" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Expositions</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Expositions patrimoniales et artistiques
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/activites-artistiques" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Activités artistiques</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Performances et événements culturels
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Agence Bibliographique */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Building className="w-4 h-4 mr-2" />
                  Agence Bibliographique
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:grid-cols-1 bg-card border border-border rounded-lg shadow-moroccan">
                    <NavigationMenuLink asChild>
                      <a href="/isbn-issn" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Numéros ISBN et ISSN
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Attribution des identifiants internationaux
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/depot-legal" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Download className="w-4 h-4 mr-2" />
                          Dépôt légal
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Formulaires et procédures de dépôt
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/bibliographie-nationale" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Book className="w-4 h-4 mr-2" />
                          Bibliographie nationale marocaine
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Catalogue national des publications
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Catalogues en Ligne */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/manuscripts" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                    <Search className="w-4 h-4 mr-2" />
                    Catalogues en Ligne
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Contact */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Phone className="w-4 h-4 mr-2" />
                  Informations
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[300px] bg-card border border-border rounded-lg shadow-moroccan">
                    <NavigationMenuLink asChild>
                      <a href="/horaires" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Horaires d'ouverture</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Planning et heures de visite
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/acces" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Plan d'accès
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Localisation et transports
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/contact" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Nous contacter
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Coordonnées et formulaires
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Input
                type="search"
                placeholder={t('header.search')}
                className="w-64 pl-10 pr-4 bg-background border-border focus:border-primary"
              />
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 sm:hidden">
          <div className="relative">
            <Input
              type="search"
              placeholder={t('header.searchMobile')}
              className="w-full pl-10 pr-4 bg-background border-border focus:border-primary"
            />
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-elegant animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a href="#accueil" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.home')}
            </a>
            <a href="#catalogue" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.catalog')}
            </a>
            <a href="#collections" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.collections')}
            </a>
            <a href="#services" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.services')}
            </a>
            <a href="#patrimoine" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.heritage')}
            </a>
            <a href="#contact" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.contact')}
            </a>
          </nav>
        </div>
      )}
      </header>
    </WatermarkContainer>
  );
};

export default Header;