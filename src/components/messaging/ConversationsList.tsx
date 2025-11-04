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
  searchQuery?: string;
  filter?: "all" | "unread" | "priority" | "groups";
}

export default function ConversationsList({ 
  selectedId, 
  onSelect,
  searchQuery = "",
  filter = "all"
}: ConversationsListProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', searchQuery, filter],
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
      let result = data?.map(conv => ({
        ...conv,
        lastMessage: conv.messages?.[conv.messages.length - 1] || null,
      })) || [];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(conv => 
          conv.title?.toLowerCase().includes(query) ||
          conv.lastMessage?.content?.toLowerCase().includes(query)
        );
      }

      return result;
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

  // Filter conversations based on filter type
  const filteredConversations = conversations?.filter((conv: any) => {
    if (filter === "unread") {
      return getUnreadCount(conv.id) > 0;
    }
    if (filter === "groups") {
      return conv.conversation_type === "group";
    }
    // "all" and "priority" show all for now
    return true;
  }) || [];

  return (
    <div className="divide-y divide-[hsl(var(--bnrm-border))]">
      {filteredConversations.map((conversation: any) => {
        const unreadCount = getUnreadCount(conversation.id);
        const isSelected = selectedId === conversation.id;

        return (
          <div
            key={conversation.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-white/60 transition-all duration-200",
              "border-l-4 border-transparent",
              isSelected && "bg-white/80 border-l-[hsl(var(--bnrm-accent))]"
            )}
            onClick={() => onSelect(conversation.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(conversation.id);
              }
            }}
            aria-label={`Conversation ${conversation.title || 'sans titre'}`}
            aria-pressed={isSelected}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--bnrm-accent))]/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-[hsl(var(--bnrm-accent))]" />
                  </div>
                  <h3 className="font-semibold truncate flex-1 text-[hsl(var(--bnrm-text))]">
                    {conversation.title || 'Conversation'}
                  </h3>
                  {unreadCount > 0 && (
                    <Badge 
                      className="h-5 min-w-[20px] px-1.5 animate-scale-in bg-[hsl(var(--bnrm-accent))] text-[hsl(var(--bnrm-accent-foreground))]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-[hsl(var(--bnrm-muted))] truncate ml-10">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.last_message_at && (
                <span className="text-xs text-[hsl(var(--bnrm-timestamp))] whitespace-nowrap ml-2 mt-1">
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
