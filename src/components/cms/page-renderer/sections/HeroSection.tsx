interface HeroSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function HeroSection({ section, language }: HeroSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { backgroundImage, ctaText, ctaLink, height = 'large' } = section.props || {};

  const heightClass = {
    small: 'min-h-[300px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[600px]'
  }[height] || 'min-h-[500px]';

  return (
    <section 
      className={`relative ${heightClass} flex items-center justify-center text-center bg-primary/10`}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className="container relative z-10 text-foreground">
        {title && <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>}
        {content && <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">{content}</p>}
        {ctaText && ctaLink && (
          <a 
            href={ctaLink}
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
