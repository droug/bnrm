import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeroSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function HeroSection({ section, language }: HeroSectionProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { 
    backgroundImage, 
    ctaText, 
    ctaLink, 
    height = 'large',
    overlay = 'dark',
    alignment = 'center',
    showSearchBar = false
  } = section.props || {};

  const heightClass = {
    small: 'min-h-[300px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[600px]',
    xl: 'min-h-[700px]'
  }[height] || 'min-h-[500px]';

  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }[alignment] || 'text-center items-center';

  const overlayClass = {
    none: '',
    light: 'bg-black/20',
    dark: 'bg-black/50',
    darker: 'bg-black/70'
  }[overlay] || 'bg-black/40';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/digital-library/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section 
      className={`relative ${heightClass} flex flex-col justify-center ${alignmentClass} bg-primary/10`}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {backgroundImage && overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayClass}`} />
      )}
      
      <div className="container relative z-10 px-4">
        <div className={`max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
          {title && (
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
              {title}
            </h1>
          )}
          
          {content && (
            <p className={`text-lg md:text-xl lg:text-2xl mb-8 ${backgroundImage ? 'text-white/90' : 'text-muted-foreground'}`}>
              {content}
            </p>
          )}
          
          {showSearchBar && (
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={language === 'ar' 
                      ? 'ابحث عن وثيقة، مؤلف، موضوع...' 
                      : 'Rechercher un document, un auteur, un sujet...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background/95 backdrop-blur"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12">
                  {language === 'ar' ? 'بحث' : 'Rechercher'}
                </Button>
              </div>
            </form>
          )}
          
          {ctaText && ctaLink && !showSearchBar && (
            <a 
              href={ctaLink}
              className={`inline-block px-8 py-4 rounded-lg transition-colors font-semibold ${
                backgroundImage 
                  ? 'bg-white text-primary hover:bg-white/90' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
