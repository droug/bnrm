import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, Sparkles } from "lucide-react";
import type { BookingData } from "../BookingWizard";

interface StepEquipmentProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepEquipment({ data, onUpdate }: StepEquipmentProps) {
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['space-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_equipment')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
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

  const toggleEquipment = (equipmentId: string) => {
    const currentEquipment = data.equipment || [];
    const newEquipment = currentEquipment.includes(equipmentId)
      ? currentEquipment.filter(id => id !== equipmentId)
      : [...currentEquipment, equipmentId];
    
    onUpdate({ equipment: newEquipment });
  };

  const toggleService = (serviceId: string) => {
    const currentServices = data.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    onUpdate({ services: newServices });
  };

  const isLoading = isLoadingEquipment || isLoadingServices;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Équipements & Services</h2>
        <p className="text-muted-foreground">
          Sélectionnez les équipements et services nécessaires pour votre événement
        </p>
      </div>

      {/* Section Équipements */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Équipements disponibles</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipment?.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                data.equipment?.includes(item.id)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
            >
              <label
                htmlFor={item.id}
                className="flex items-start gap-3 p-4 cursor-pointer"
              >
                <Checkbox
                  id={item.id}
                  checked={data.equipment?.includes(item.id)}
                  onCheckedChange={() => toggleEquipment(item.id)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold">{item.name}</span>
                    {!item.is_included && item.additional_cost && (
                      <Badge variant="outline" className="text-xs">
                        +{item.additional_cost} {item.currency || 'MAD'}
                      </Badge>
                    )}
                    {item.is_included && (
                      <Badge variant="secondary" className="text-xs">
                        Inclus
                      </Badge>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </label>
            </Card>
          ))}
        </div>

        {equipment?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun équipement disponible</p>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Section Services additionnels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Services additionnels</h3>
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
                    <span className="font-semibold">{service.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {service.base_cost} {service.currency}/{service.unit_type}
                    </Badge>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  )}
                  
                  {service.service_type && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {service.service_type}
                    </Badge>
                  )}
                </div>
              </label>
            </Card>
          ))}
        </div>

        {services?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun service disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
