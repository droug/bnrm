import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationsListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationsList({ selectedId, onSelect }: ConversationsListProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id, last_read_at),
          messages(id, content, created_at, sender_id)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      // Get last message for each conversation
      return data?.map(conv => ({
        ...conv,
        lastMessage: conv.messages?.[conv.messages.length - 1] || null,
      })) || [];
    },
  });

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unread_count');
      if (error) throw error;
      
      const total = data?.reduce((sum, item) => sum + Number(item.unread_count), 0) || 0;
      return {
        total,
        byConversation: data || [],
      };
    },
  });

  const getUnreadCount = (conversationId: string) => {
    const item = unreadData?.byConversation.find(
      (c) => c.conversation_id === conversationId
    );
    return Number(item?.unread_count || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucune conversation</p>
        <p className="text-sm text-muted-foreground mt-2">
          Créez une nouvelle conversation pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation: any) => {
        const unreadCount = getUnreadCount(conversation.id);
        const isSelected = selectedId === conversation.id;

        return (
          <div
            key={conversation.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-accent/50 transition-all duration-200",
              "border-l-4 border-transparent",
              isSelected && "bg-accent border-l-primary"
            )}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold truncate flex-1">
                    {conversation.title || 'Conversation'}
                  </h3>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5 animate-scale-in">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate ml-10">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.last_message_at && (
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 mt-1">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
