import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";

interface DocumentItem {
  id: string;
  title: string;
  author: string;
  type: string;
  date: string;
  isAvailable: boolean;
  cote: string;
  thumbnail: string;
  isManuscript?: boolean;
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

  // Badge color mapping based on document type
  const getBadgeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('manuscrit') || lowerType.includes('manuscript')) {
      return 'bg-gold-bn-primary text-white';
    }
    if (lowerType.includes('livre') || lowerType.includes('book')) {
      return 'bg-blue-primary text-white';
    }
    if (lowerType.includes('revue') || lowerType.includes('article') || lowerType.includes('périodique')) {
      return 'bg-gold-bn-primary-dark text-white';
    }
    if (lowerType.includes('image') || lowerType.includes('photo')) {
      return 'bg-bn-blue-primary text-white';
    }
    return 'bg-gold-bn-primary text-white';
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Section Header - Matching reference design */}
        <div className="text-center mb-10">
          {/* Gold Grid Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <Grid3X3 className="h-7 w-7 text-gold-bn-primary" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Title in Playfair Display with gold underline */}
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-gold-bn-primary mb-3">
            {t('dl.home.latestAdditions')}
          </h2>
          
          {/* Subtitle in muted text */}
          <p className="text-slate-text max-w-2xl mx-auto text-base">
            {t('dl.home.recentlyAdded')}
          </p>
        </div>

        {/* Cards Grid */}
        {!loading && displayedItems.length > 0 && (
          <div className="relative">
            {/* Navigation Arrows - Outside cards */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-5 w-5 text-slate-text-dark" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-5 w-5 text-slate-text-dark" />
              </Button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {displayedItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group bg-white border border-slate-border hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-light">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Badge - Positioned on image */}
                    <Badge 
                      className={`absolute bottom-3 left-3 ${getBadgeColor(item.type)} px-3 py-1 text-xs font-medium shadow-md`}
                    >
                      {item.type}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <CardHeader className="flex-1 p-4 pb-2">
                    <CardTitle className="text-base font-semibold text-slate-base-dark line-clamp-2 leading-snug mb-1">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-text line-clamp-2">
                      {item.author}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Action Link */}
                  <CardContent className="p-4 pt-2">
                    <button
                      onClick={() => onConsultDocument(item)}
                      className="group/link inline-flex items-center gap-1 text-gold-bn-primary-dark hover:text-gold-bn-primary font-medium text-sm transition-colors"
                    >
                      {t('dl.home.readMore') || 'En savoir plus'}
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
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
              <div className="w-5 h-5 border-2 border-gold-bn-primary border-t-transparent rounded-full animate-spin" />
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
