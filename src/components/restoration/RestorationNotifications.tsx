import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle, Clock, AlertCircle, Package, DollarSign, Wrench, FileCheck, ExternalLink, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  request_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  restoration_requests?: {
    request_number: string;
    manuscript_title: string;
    status: string;
    quote_amount?: number;
  };
}

export function RestorationNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [actionNotes, setActionNotes] = useState('');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['restoration-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('restoration_notifications')
        .select(`
          *,
          restoration_requests (
            request_number,
            manuscript_title,
            status,
            quote_amount
          )
        `)
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('restoration-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restoration_notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification change detected:', payload);
          // Refresh notifications when any change occurs
          queryClient.invalidateQueries({ queryKey: ['restoration-notifications', user.id] });
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            toast({
              title: "Nouvelle notification",
              description: newNotification.title,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('restoration_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restoration-notifications'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('restoration_notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restoration-notifications'] });
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    }
  });

  const handleQuoteAction = useMutation({
    mutationFn: async ({ requestId, accept, notes }: { requestId: string; accept: boolean; notes?: string }) => {
      const newStatus = accept ? 'paiement_en_attente' : 'devis_refuse';
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (accept) {
        updateData.quote_accepted_at = new Date().toISOString();
      } else {
        updateData.quote_rejected_at = new Date().toISOString();
        updateData.quote_rejection_reason = notes;
      }

      const { error } = await supabase
        .from('restoration_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restoration-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests'] });
      setActionDialogOpen(false);
      setActionNotes('');
      toast({
        title: "Succès",
        description: actionType === 'accept' 
          ? "Devis accepté. Vous recevrez prochainement le lien de paiement." 
          : "Devis refusé. Votre demande a été clôturée.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre réponse",
        variant: "destructive",
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_received':
      case 'request_authorized':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'request_rejected':
      case 'quote_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'provide_artwork':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'quote_sent':
      case 'quote_accepted':
      case 'payment_link':
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case 'restoration_started':
      case 'restoration_completed':
        return <Wrench className="h-5 w-5 text-purple-500" />;
      case 'artwork_ready':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionButtons = (notification: Notification) => {
    switch (notification.notification_type) {
      case 'quote_sent':
        if (notification.restoration_requests?.status === 'devis_en_attente') {
          return (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  setCurrentNotification(notification);
                  setActionType('accept');
                  setActionDialogOpen(true);
                }}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Accepter le devis
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setCurrentNotification(notification);
                  setActionType('reject');
                  setActionDialogOpen(true);
                }}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          );
        }
        return null;

      case 'payment_link':
        if (notification.restoration_requests?.status === 'paiement_en_attente') {
          return (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                // Rediriger vers la page de paiement ou ouvrir le lien
                toast({
                  title: "Paiement",
                  description: "Fonctionnalité de paiement à implémenter",
                });
              }}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Procéder au paiement
            </Button>
          );
        }
        return null;

      case 'restoration_completed':
        return (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              toast({
                title: "Rapport de restauration",
                description: "Consultez les détails dans l'onglet 'Mes demandes'",
              });
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Voir le rapport
          </Button>
        );

      case 'artwork_ready':
        return (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              toast({
                title: "Informations de retrait",
                description: "Consultez les détails dans l'onglet 'Mes demandes'",
              });
            }}
          >
            <Package className="h-4 w-4 mr-1" />
            Voir les détails de retrait
          </Button>
        );

      default:
        return null;
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications de restauration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications de restauration
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!notifications || notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Aucune notification pour le moment
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.is_read
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          Demande: {notification.restoration_requests?.request_number} - {notification.restoration_requests?.manuscript_title}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.sent_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                       <div className="text-sm text-foreground mt-2">
                        {notification.message}
                      </div>
                      {notification.restoration_requests?.quote_amount && 
                       notification.notification_type === 'quote_sent' && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-base font-semibold">
                            Montant: {notification.restoration_requests.quote_amount} DH
                          </Badge>
                        </div>
                      )}
                      {getActionButtons(notification)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Dialog pour accepter/refuser le devis */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accepter le devis' : 'Refuser le devis'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' 
                ? 'En acceptant ce devis, vous vous engagez à procéder au paiement pour la restauration.'
                : 'Veuillez indiquer la raison du refus (optionnel).'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentNotification && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Demande:</strong> {currentNotification.restoration_requests?.request_number}
                </p>
                <p className="text-sm">
                  <strong>Manuscrit:</strong> {currentNotification.restoration_requests?.manuscript_title}
                </p>
                {currentNotification.restoration_requests?.quote_amount && (
                  <p className="text-sm">
                    <strong>Montant:</strong> {currentNotification.restoration_requests.quote_amount} DH
                  </p>
                )}
              </div>
            )}
            {actionType === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="notes">Raison du refus (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Expliquez pourquoi vous refusez ce devis..."
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant={actionType === 'accept' ? 'default' : 'destructive'}
              onClick={() => {
                if (currentNotification) {
                  handleQuoteAction.mutate({
                    requestId: currentNotification.request_id,
                    accept: actionType === 'accept',
                    notes: actionNotes
                  });
                }
              }}
              disabled={handleQuoteAction.isPending}
            >
              {actionType === 'accept' ? 'Confirmer l\'acceptation' : 'Confirmer le refus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
