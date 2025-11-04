import { useConversations, useUnreadCount } from "@/hooks/useMessaging";
import { Card } from "@/components/ui/card";
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
  const { data: conversations, isLoading } = useConversations();
  const { data: unreadData } = useUnreadCount();

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
          <Card
            key={conversation.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-accent transition-colors border-0 rounded-none",
              isSelected && "bg-accent"
            )}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {conversation.title || 'Conversation'}
                  </h3>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.last_message_at && (
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
