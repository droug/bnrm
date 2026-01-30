import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { FancyTooltip } from "@/components/ui/fancy-tooltip";
import { PdfThumbnail } from "./PdfThumbnail";

interface DocumentItem {
  id: string;
  title: string;
  author: string;
  type: string;
  date: string;
  isAvailable: boolean;
  cote: string;
  thumbnail: string;
  pdfUrl?: string; // URL du PDF pour générer la miniature dynamiquement
  isManuscript?: boolean;
  description?: string;
}

interface LatestAdditionsSectionProps {
  items: DocumentItem[];
  loading: boolean;
  onConsultDocument: (item: DocumentItem) => void;
}

export function LatestAdditionsSection({ items, loading, onConsultDocument }: LatestAdditionsSectionProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getBadgeColor = (_type: string) => {
    return 'bg-[#B68F1C] text-white';
  };

  const getDocumentIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('manuscrit') || lowerType.includes('manuscript')) {
      return 'mdi:script-text-outline';
    }
    if (lowerType.includes('livre') || lowerType.includes('book')) {
      return 'mdi:book-open-page-variant';
    }
    if (lowerType.includes('revue') || lowerType.includes('article') || lowerType.includes('périodique')) {
      return 'mdi:newspaper-variant-outline';
    }
    if (lowerType.includes('image') || lowerType.includes('photo')) {
      return 'mdi:image-outline';
    }
    return 'mdi:file-document-outline';
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <Icon name="mdi:text-box-plus-outline" className="h-7 w-7 text-gold-bn-primary" />
            </div>
          </div>
          
          <h2 className="text-[48px] font-normal text-bn-blue-primary font-gilda">
            {t('dl.home.latestAdditions')}
          </h2>
          
          <p className="font-body text-regular text-muted-foreground max-w-2xl mx-auto mt-4">
            {t('dl.home.recentlyAdded')}
          </p>
        </div>

        {/* Cards Grid */}
        {!loading && displayedItems.length > 0 && (
          <div className="relative">
            {/* Navigation Arrows */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <Icon name="mdi:chevron-left" className="h-5 w-5 text-slate-text-dark" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <Icon name="mdi:chevron-right" className="h-5 w-5 text-slate-text-dark" />
              </Button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {displayedItems.map((item) => (
                <FancyTooltip 
                  key={item.id}
                  content={item.title} 
                  description={`${item.author}${item.date ? ` • ${item.date}` : ''}${item.cote ? ` • Cote: ${item.cote}` : ''}`}
                  icon={getDocumentIcon(item.type)}
                  side="top"
                  variant="gold"
                >
                  <Card 
                    className="group bg-white border border-[#B68F1C]/30 hover:border-[#B68F1C]/50 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer min-h-[420px]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-light">
                      {/* Priorité: cover_image_url > PDF thumbnail > fallback */}
                      {item.thumbnail?.includes('supabase') && item.thumbnail?.includes('cover') ? (
                        // Image de couverture uploadée
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : item.pdfUrl ? (
                        // Générer miniature depuis le PDF
                        <PdfThumbnail 
                          pdfUrl={item.pdfUrl} 
                          fallbackImage={undefined}
                          alt={item.title}
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        // Fallback ultime
                        <img 
                          src={item.thumbnail || '/placeholder.svg'} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    
                    {/* Badge moved under image */}
                    <div className="px-4 pt-4">
                      <Badge 
                        className={`${getBadgeColor(item.type)} px-3 py-1 text-xs font-medium rounded-sm`}
                      >
                        {item.type}
                      </Badge>
                    </div>
                    
                    <CardHeader className="flex-1 p-4 pb-3 pt-3 space-y-3">
                      <CardTitle className="text-base font-semibold text-slate-base-dark line-clamp-2 leading-relaxed">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-text line-clamp-2 leading-relaxed">
                        {item.description || (item.author && item.author !== 'Auteur inconnu' ? item.author : 'Document numérisé de la Bibliothèque Nationale...')}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-2">
                      <button
                        onClick={() => onConsultDocument(item)}
                        className="group/link inline-flex items-center gap-1 text-gold-bn-primary-dark hover:text-gold-bn-primary font-medium text-sm transition-colors"
                      >
                        En savoir plus
                        <Icon name="mdi:chevron-right" className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </CardContent>
                  </Card>
                </FancyTooltip>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Dots */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage 
                    ? 'bg-gold-bn-primary w-6' 
                    : 'bg-slate-muted hover:bg-slate-text-light'
                }`}
                aria-label={`Page ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-text">
              <Icon name="mdi:loading" className="w-5 h-5 animate-spin text-gold-bn-primary" />
              {t('dl.home.loadingDocuments')}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-text">{t('dl.home.noRecentDocuments')}</p>
          </div>
        )}

        {/* View All Button */}
        {!loading && items.length > 0 && (
          <div className="flex justify-center mt-8">
            <Link to="/digital-library/search?sort=recent">
              <Button 
                variant="outline" 
                className="border-gold-bn-primary text-gold-bn-primary-dark hover:bg-gold-bn-surface hover:text-gold-bn-primary-dark px-6"
              >
                {t('dl.home.viewAll')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
