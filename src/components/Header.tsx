import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
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
          <nav className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            <a href="#accueil" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.home')}
            </a>
            <a href="#catalogue" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.catalog')}
            </a>
            <a href="#collections" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.collections')}
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.services')}
            </a>
            <a href="#patrimoine" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.heritage')}
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('header.contact')}
            </a>
          </nav>

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
  );
};

export default Header;