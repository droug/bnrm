import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PrivateFeedback {
  id: string;
  rating: number | null;
  comment: string | null;
  is_reviewed_by_admin: boolean;
  admin_response: string | null;
  created_at: string;
  content_id: string | null;
  manuscript_id: string | null;
}

export function MySpacePrivateFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<PrivateFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadFeedbacks();
    }
  }, [user]);

  const loadFeedbacks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_reviews')
        .insert({
          user_id: user.id,
          rating: newRating,
          comment: newComment.trim(),
          is_reviewed_by_admin: false
        });

      if (error) throw error;

      toast({
        title: "Évaluation envoyée",
        description: "Merci pour votre retour. L'équipe de la BNRM le traitera prochainement."
      });

      setShowNewDialog(false);
      setNewComment('');
      setNewRating(5);
      loadFeedbacks();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'évaluation",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number | null, interactive = false, onSelect?: (r: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110",
            i <= (rating || 0) ? "text-gold-bn-primary" : "text-muted-foreground/30"
          )}
          onClick={() => onSelect?.(i)}
        >
          <Icon 
            icon={i <= (rating || 0) ? "mdi:star" : "mdi:star-outline"} 
            className="h-5 w-5" 
          />
        </button>
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <Card className="border-bn-blue-primary/10">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bn-blue-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-bn-blue-primary/10 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
              <div className="p-2 rounded-lg bg-gold-bn-primary/10">
                <Icon icon="mdi:message-star" className="h-5 w-5 text-gold-bn-primary" />
              </div>
              <div>
                <span className="text-lg">Mes évaluations</span>
                {feedbacks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {feedbacks.length}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowNewDialog(true)}
              className="bg-gold-bn-primary hover:bg-gold-bn-primary/90 text-white gap-1"
            >
              <Icon icon="mdi:plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvelle évaluation</span>
            </Button>
          </div>
          <CardDescription className="mt-2 text-muted-foreground">
            <Icon icon="mdi:lock" className="h-3.5 w-3.5 inline mr-1" />
            Vos commentaires sont privés et réservés à l'équipe de la BNRM
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Icon icon="mdi:message-text-outline" className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Aucune évaluation pour le moment
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Partagez vos commentaires et suggestions avec l'équipe BNRM
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewDialog(true)}
                className="mt-2"
              >
                <Icon icon="mdi:message-plus" className="h-4 w-4 mr-2" />
                Laisser un commentaire
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[280px] pr-2">
              <div className="space-y-3">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      feedback.is_reviewed_by_admin 
                        ? "border-green-200 bg-green-50/30" 
                        : "border-border/50 bg-card"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(feedback.rating)}
                        {feedback.is_reviewed_by_admin && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                            <Icon icon="mdi:check-circle" className="h-3 w-3 mr-1" />
                            Traité
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(feedback.created_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>

                    {/* Comment */}
                    {feedback.comment && (
                      <p className="text-sm text-foreground mb-2">
                        {feedback.comment}
                      </p>
                    )}

                    {/* Admin response */}
                    {feedback.admin_response && (
                      <div className="mt-3 p-3 rounded-md bg-bn-blue-primary/5 border-l-2 border-bn-blue-primary">
                        <p className="text-xs font-medium text-bn-blue-primary mb-1 flex items-center gap-1">
                          <Icon icon="mdi:reply" className="h-3 w-3" />
                          Réponse de la BNRM
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feedback.admin_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* New Feedback Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="mdi:message-star" className="h-5 w-5 text-gold-bn-primary" />
              Laisser une évaluation
            </DialogTitle>
            <DialogDescription>
              Votre avis restera privé et sera uniquement visible par l'équipe de la Bibliothèque Numérique Marocaine.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre note</label>
              <div className="flex items-center gap-1">
                {renderStars(newRating, true, setNewRating)}
                <span className="text-sm text-muted-foreground ml-2">
                  {newRating}/5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre commentaire</label>
              <Textarea
                placeholder="Partagez votre expérience, vos suggestions ou signalez un problème..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Icon icon="mdi:shield-lock" className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Cette évaluation ne sera pas affichée publiquement. Elle est destinée uniquement aux gestionnaires de la plateforme pour améliorer les services.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={!newComment.trim() || submitting}
              className="bg-gold-bn-primary hover:bg-gold-bn-primary/90"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
