import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateConversation } from "@/hooks/useMessaging";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  
  const createConversation = useCreateConversation();

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
    if (selectedUsers.length === 0) return;

    const conversation = await createConversation.mutateAsync({
      title: title || undefined,
      participantIds: selectedUsers,
      conversationType: selectedUsers.length === 1 ? 'direct' : 'group',
    });

    onConversationCreated(conversation.id);
    setTitle("");
    setSelectedUsers([]);
    onOpenChange(false);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Sélectionnez les participants pour démarrer une nouvelle conversation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre (optionnel)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de la conversation"
            />
          </div>

          <div>
            <Label htmlFor="search">Rechercher un utilisateur</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou prénom..."
            />
          </div>

          <div>
            <Label>Participants ({selectedUsers.length})</Label>
            <ScrollArea className="h-[300px] border rounded-md p-4 mt-2">
              <div className="space-y-2">
                {users?.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.user_id}
                      checked={selectedUsers.includes(user.user_id)}
                      onCheckedChange={() => toggleUser(user.user_id)}
                    />
                    <label
                      htmlFor={user.user_id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={selectedUsers.length === 0 || createConversation.isPending}
            >
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
