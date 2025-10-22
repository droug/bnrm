import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import type { BookingData } from "../BookingWizard";

interface StepServicesProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepServices({ data, onUpdate }: StepServicesProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ['space-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const toggleService = (serviceId: string) => {
    const currentServices = data.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    onUpdate({ services: newServices });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Services complémentaires</h2>
        <p className="text-muted-foreground">
          Sélectionnez les services additionnels souhaités (optionnel)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services?.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              data.services?.includes(service.id)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
          >
            <label
              htmlFor={service.id}
              className="flex items-start gap-3 p-4 cursor-pointer"
            >
              <Checkbox
                id={service.id}
                checked={data.services?.includes(service.id)}
                onCheckedChange={() => toggleService(service.id)}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {service.base_cost} {service.currency}/{service.unit_type}
                  </Badge>
                </div>
                
                {service.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.description}
                  </p>
                )}
                
                <Badge variant="secondary" className="text-xs mt-2">
                  {service.service_type}
                </Badge>
              </div>
            </label>
          </Card>
        ))}
      </div>

      {services?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun service disponible pour le moment</p>
        </div>
      )}
    </div>
  );
}
