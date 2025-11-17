import { Calendar, MapPin } from "lucide-react";

interface EventListSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function EventListSection({ section, language }: EventListSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const { events = [] } = section.props || {};

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8">{title}</h2>}
        <div className="space-y-6">
          {events.map((event: any, index: number) => {
            const eventTitle = language === 'ar' ? event.title_ar || event.title : event.title;
            const eventDesc = language === 'ar' ? event.description_ar || event.description : event.description;
            const eventLocation = language === 'ar' ? event.location_ar || event.location : event.location;
            
            return (
              <div key={index} className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {event.image && (
                    <img src={event.image} alt={eventTitle} className="w-full md:w-48 h-48 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{eventTitle}</h3>
                    <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                      {event.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                        </div>
                      )}
                      {eventLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{eventLocation}</span>
                        </div>
                      )}
                    </div>
                    {eventDesc && <p className="text-muted-foreground">{eventDesc}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
