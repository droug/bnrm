interface StatBlocksSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function StatBlocksSection({ section, language }: StatBlocksSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const { stats = [] } = section.props || {};

  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat: any, index: number) => {
            const statLabel = language === 'ar' ? stat.label_ar || stat.label : stat.label;
            
            return (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {stat.value}
                  {stat.suffix && <span className="text-3xl">{stat.suffix}</span>}
                </div>
                {statLabel && (
                  <div className="text-lg text-muted-foreground font-medium">
                    {statLabel}
                  </div>
                )}
                {stat.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? stat.description_ar || stat.description : stat.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
