interface CardListSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function CardListSection({ section, language }: CardListSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const { cards = [] } = section.props || {};

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card: any, index: number) => {
            const cardTitle = language === 'ar' ? card.title_ar || card.title : card.title;
            const cardContent = language === 'ar' ? card.content_ar || card.content : card.content;
            
            return (
              <div key={index} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {card.image && (
                  <img src={card.image} alt={cardTitle} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  {cardTitle && <h3 className="text-xl font-semibold mb-3">{cardTitle}</h3>}
                  {cardContent && <p className="text-muted-foreground mb-4">{cardContent}</p>}
                  {card.link && (
                    <a href={card.link} className="text-primary hover:underline font-medium">
                      {language === 'ar' ? 'اقرأ المزيد' : 'En savoir plus'} →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
