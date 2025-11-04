import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateConversation, useSendMessage } from "@/hooks/useMessaging";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const { data: users } = useQuery({
    queryKey: ['users-list', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('user_id, first_name, last_name');

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un participant",
        variant: "destructive",
      });
      return;
    }

    if (!initialMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message initial",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create conversation
      const conversation = await createConversation.mutateAsync({
        title: title || undefined,
        participantIds: selectedUsers,
        conversationType: selectedUsers.length === 1 ? 'direct' : 'group',
      });

      // Send initial message
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: initialMessage.trim(),
      });

      // Reset form
      setTitle("");
      setSelectedUsers([]);
      setInitialMessage("");
      setSearchTerm("");
      
      // Notify parent and close
      onConversationCreated(conversation.id);
      onOpenChange(false);
      
      toast({
        title: "Succès",
        description: "Conversation créée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la conversation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const isFormValid = selectedUsers.length > 0 && initialMessage.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Sélectionnez les participants et écrivez votre premier message
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre (optionnel)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nom de la conversation"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="search">Rechercher un utilisateur</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, prénom ou rôle..."
                className="mt-1.5"
              />
            </div>

            <div className="flex-1 min-h-0">
              <Label>Participants ({selectedUsers.length})</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4 mt-1.5">
                <div className="space-y-3">
                  {users?.map((user) => (
                    <div key={user.user_id} className="flex items-start space-x-3">
                      <Checkbox
                        id={user.user_id}
                        checked={selectedUsers.includes(user.user_id)}
                        onCheckedChange={() => toggleUser(user.user_id)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={user.user_id}
                        className="flex-1 cursor-pointer font-medium text-sm"
                      >
                        {user.first_name} {user.last_name}
                      </label>
                    </div>
                  ))}
                  {users?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun utilisateur trouvé
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div>
              <Label htmlFor="initialMessage">
                Message initial <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="initialMessage"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Écrivez votre premier message..."
                className="mt-1.5 min-h-[100px] resize-none"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-[hsl(var(--bnrm-accent))] hover:bg-[hsl(var(--bnrm-accent))]/90 text-[hsl(var(--bnrm-accent-foreground))]"
            >
              {isSubmitting ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
