interface BannerSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function BannerSection({ section, language }: BannerSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { variant = 'default', ctaText, ctaLink } = section.props || {};

  const variantClass = {
    default: 'bg-primary text-primary-foreground',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-yellow-950',
    success: 'bg-green-500 text-white'
  }[variant] || 'bg-primary text-primary-foreground';

  return (
    <section className={`py-8 ${variantClass}`}>
      <div className="container mx-auto px-4 text-center">
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>}
        {content && <p className="text-lg mb-4">{content}</p>}
        {ctaText && ctaLink && (
          <a 
            href={ctaLink}
            className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
