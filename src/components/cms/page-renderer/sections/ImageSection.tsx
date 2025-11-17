interface ImageSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function ImageSection({ section, language }: ImageSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { imageUrl, imageAlt, size = 'large', alignment = 'center' } = section.props || {};

  const sizeClass = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-full'
  }[size] || 'max-w-4xl';

  const alignmentClass = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  }[alignment] || 'mx-auto';

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
        <div className={`${sizeClass} ${alignmentClass}`}>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={imageAlt || title || ''} 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          )}
          {content && <p className="mt-4 text-center text-muted-foreground">{content}</p>}
        </div>
      </div>
    </section>
  );
}
