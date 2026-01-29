import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { FancyTooltip } from "@/components/ui/fancy-tooltip";
import { useElectronicBundles } from "@/hooks/useElectronicBundles";
import { Skeleton } from "@/components/ui/skeleton";

export function ElectronicResourcesHomeSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { activeBundles, isLoading } = useElectronicBundles();

  // Calculate pagination
  const itemsPerPage = 3;
  const totalItems = activeBundles?.length || 0;
  const maxIndex = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-4" />
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-6 w-[600px] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!activeBundles || activeBundles.length === 0) {
    return null; // Hide section if no active bundles
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <Icon name="mdi:select-multiple" className="h-6 w-6 text-gold-bn-primary" />
            </div>
          </div>
          <h2 className="text-[48px] font-normal text-bn-blue-primary font-gilda">
            Ressources électroniques
          </h2>
          <p className="font-body text-muted-foreground max-w-3xl mx-auto mt-4">
            Ces ressources permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale
          </p>
        </div>

        {/* Carousel */}
        <div className="relative px-16">
          {/* Left Arrow */}
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
            disabled={currentIndex === 0} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed" 
            aria-label="Précédent"
          >
            <Icon name="mdi:chevron-left" className="h-6 w-6" />
          </button>

          {/* Slides */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
            >
              {activeBundles.map((bundle) => (
                <div key={bundle.id} className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <FancyTooltip 
                    content={bundle.name} 
                    description={bundle.description || `Accédez aux ressources ${bundle.provider}`}
                    icon="mdi:book-open-variant" 
                    side="top" 
                    variant="gold"
                  >
                    <Card className="bg-card border-0 rounded-xl shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)] hover:shadow-[0_12px_40px_hsl(0_0%_0%_/0.18)] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <CardContent className="p-8 flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center h-[80px]">
                          {bundle.provider_logo_url ? (
                            <div className="flex items-center justify-center h-full bg-bn-blue-primary rounded-lg px-4">
                              <img 
                                src={bundle.provider_logo_url} 
                                alt={bundle.name}
                                className="h-[50px] max-w-[200px] object-contain"
                                onError={(e) => {
                                  // Fallback to text if image fails
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.className = "flex items-center justify-center h-full";
                                    parent.innerHTML = `<span class="font-heading text-[32px] font-semibold text-bn-blue-primary tracking-wide">${bundle.name}</span>`;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="font-heading text-[32px] font-semibold text-bn-blue-primary tracking-wide">
                              {bundle.name}
                            </div>
                          )}
                        </div>
                        <a 
                          href={bundle.website_url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium hover:bg-gold-bn-primary/20 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explorer <Icon name="mdi:chevron-right" className="h-4 w-4" />
                        </a>
                      </CardContent>
                    </Card>
                  </FancyTooltip>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))} 
            disabled={currentIndex >= maxIndex} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed" 
            aria-label="Suivant"
          >
            <Icon name="mdi:chevron-right" className="h-6 w-6" />
          </button>
        </div>

        {/* Pagination */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-3 mt-14">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentIndex(index)} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-gold-bn-primary' 
                    : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
                }`} 
                aria-label={`Aller à la page ${index + 1}`} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
