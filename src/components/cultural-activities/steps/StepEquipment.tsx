import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";
import type { BookingData } from "../BookingWizard";

interface StepEquipmentProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepEquipment({ data, onUpdate }: StepEquipmentProps) {
  const { data: equipment, isLoading } = useQuery({
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

  const toggleEquipment = (equipmentId: string) => {
    const currentEquipment = data.equipment || [];
    const newEquipment = currentEquipment.includes(equipmentId)
      ? currentEquipment.filter(id => id !== equipmentId)
      : [...currentEquipment, equipmentId];
    
    onUpdate({ equipment: newEquipment });
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
        <h2 className="text-2xl font-bold mb-2">Équipements</h2>
        <p className="text-muted-foreground">
          Sélectionnez les équipements nécessaires pour votre événement
        </p>
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
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{item.name}</span>
                  </div>
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
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun équipement disponible pour le moment</p>
        </div>
      )}
    </div>
  );
}
