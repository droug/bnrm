import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Sparkles, DollarSign } from "lucide-react";
import { SimpleMultiSelect } from "@/components/ui/simple-multi-select";
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

  const isLoading = isLoadingEquipment || isLoadingServices;

  // Calcul du total
  const calculateTotal = () => {
    let total = 0;
    
    // Coût des équipements
    if (equipment && data.equipment) {
      data.equipment.forEach(equipmentId => {
        const item = equipment.find(e => e.id === equipmentId);
        if (item && !item.is_included && item.additional_cost) {
          total += Number(item.additional_cost);
        }
      });
    }
    
    // Coût des services
    if (services && data.services) {
      data.services.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (service && service.base_cost) {
          total += Number(service.base_cost);
        }
      });
    }
    
    return total;
  };

  const total = calculateTotal();

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
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-semibold">
          <Package className="h-5 w-5 text-primary" />
          Équipements disponibles
        </Label>
        
        <SimpleMultiSelect
          placeholder="Sélectionnez les équipements..."
          options={equipment?.map(item => ({
            value: item.id,
            label: item.name,
            badge: item.is_included 
              ? { text: 'Inclus', variant: 'secondary' as const }
              : item.additional_cost 
                ? { text: `+${item.additional_cost} ${item.currency || 'MAD'}`, variant: 'outline' as const }
                : undefined,
            description: item.description || undefined
          })) || []}
          selected={data.equipment || []}
          onChange={(values) => onUpdate({ equipment: values })}
        />
      </div>

      <Separator />

      {/* Section Services additionnels */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          Services additionnels
        </Label>
        
        <SimpleMultiSelect
          placeholder="Sélectionnez les services..."
          options={services?.map(service => ({
            value: service.id,
            label: service.name,
            badge: { 
              text: `${service.base_cost} ${service.currency}/${service.unit_type}`, 
              variant: 'outline' as const 
            },
            description: service.description || undefined
          })) || []}
          selected={data.services || []}
          onChange={(values) => onUpdate({ services: values })}
        />
      </div>

      {/* Total à payer */}
      {total > 0 && (
        <>
          <Separator />
          <Card className="bg-primary/5 border-primary/20">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">Total estimé</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {total.toFixed(2)} MAD
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Équipements et services sélectionnés
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
