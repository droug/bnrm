import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Users, Clock } from "lucide-react";
import { useBookingCart } from "@/contexts/BookingCartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function BookingCart() {
  const { cartItems, removeFromCart, clearCart } = useBookingCart();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: spaces } = useQuery({
    queryKey: ['cultural-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  if (cartItems.length === 0) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Votre panier est vide</p>
          <p className="text-sm text-muted-foreground mt-2">
            Ajoutez des espaces à votre panier pour les réserver ensemble
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Panier de réservation
          </h3>
          <p className="text-sm text-muted-foreground">
            {cartItems.length} espace{cartItems.length > 1 ? 's' : ''} sélectionné{cartItems.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearCart()}
          className="text-destructive hover:text-destructive"
        >
          Vider le panier
        </Button>
      </div>

      <div className="space-y-3">
        {cartItems.map((item) => {
          const space = spaces?.find(s => s.id === item.spaceId);
          
          return (
            <Card key={item.cartItemId} className="border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{space?.name || 'Espace non trouvé'}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.organizerType === 'public' ? 'Public' : 'Privé'}
                      </Badge>
                    </div>

                    {item.eventTitle && (
                      <p className="text-sm font-medium text-primary">
                        {item.eventTitle}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {item.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(item.startDate, 'dd MMM yyyy', { locale: fr })}
                            {item.endDate && item.endDate.getTime() !== item.startDate.getTime() && (
                              <> - {format(item.endDate, 'dd MMM yyyy', { locale: fr })}</>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {item.startTime && item.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                      )}

                      {item.expectedAttendees && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{item.expectedAttendees} participant{item.expectedAttendees > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {item.eventSlots && item.eventSlots.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {item.eventSlots.length} créneaux horaires
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItemToDelete(item.cartItemId)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer du panier</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer cet espace de votre panier ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  removeFromCart(itemToDelete);
                  setItemToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
