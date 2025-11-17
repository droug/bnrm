import DOMPurify from 'dompurify';

interface RichTextSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function RichTextSection({ section, language }: RichTextSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { maxWidth = 'default', alignment = 'left' } = section.props || {};

  const widthClass = {
    narrow: 'max-w-2xl',
    default: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-full'
  }[maxWidth] || 'max-w-4xl';

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment] || 'text-left';

  return (
    <section className="py-12">
      <div className={`container ${widthClass} mx-auto px-4`}>
        {title && <h2 className={`text-3xl font-bold mb-6 ${alignmentClass}`}>{title}</h2>}
        {content && (
          <div 
            className={`prose prose-lg max-w-none ${alignmentClass}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        )}
      </div>
    </section>
  );
}
