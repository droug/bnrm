import { DynamicGridSection } from './DynamicGridSection';

interface GridSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function GridSection({ section, language }: GridSectionProps) {
  const { dataSource } = section.props || {};
  
  // Si un dataSource est spécifié, utiliser le composant dynamique
  if (dataSource) {
    return <DynamicGridSection section={section} language={language} />;
  }
  
  // Sinon, utiliser le rendu statique
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const { columns = 3, items = [] } = section.props || {};

  const columnsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className={`grid ${columnsClass} gap-6`}>
          {items.map((item: any, index: number) => {
            const itemTitle = language === 'ar' ? item.title_ar || item.title : item.title;
            const itemDesc = language === 'ar' ? item.description_ar || item.description : item.description;
            
            return (
              <div key={index} className="bg-card p-6 rounded-lg border">
                {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
                {item.image && <img src={item.image} alt={itemTitle} className="w-full h-48 object-cover rounded mb-4" />}
                {itemTitle && <h3 className="text-xl font-semibold mb-2">{itemTitle}</h3>}
                {itemDesc && <p className="text-muted-foreground">{itemDesc}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
