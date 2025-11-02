import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle, Clock, AlertCircle, Package, DollarSign, Wrench, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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
  };
}

export function RestorationNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            manuscript_title
          )
        `)
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user
  });

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_received':
      case 'request_authorized':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'request_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'provide_artwork':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'quote_sent':
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
                      <div className="text-sm text-foreground mt-2 line-clamp-3">
                        {notification.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
