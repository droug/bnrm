import { useEffect, useRef, useState } from "react";
import { useMessages, useSendMessage, useMarkAsRead, useConversation } from "@/hooks/useMessaging";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  conversationId: string;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const { user } = useAuth();
  const { data: conversation } = useConversation(conversationId);
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark as read when conversation is viewed
  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage.mutateAsync({
      conversationId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  const getParticipantsNames = () => {
    if (!conversation?.conversation_participants) return "";
    return conversation.conversation_participants
      .map((p: any) => `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim())
      .filter(Boolean)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <div className="border-b px-4 py-3 bg-background">
        <h3 className="font-semibold text-base">
          {conversation?.title || getParticipantsNames() || 'Conversation'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {conversation?.conversation_participants?.length || 0} participant(s)
        </p>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages?.map((message: any) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = isOwn
              ? "Vous"
              : `${message.profiles?.first_name || ''} ${message.profiles?.last_name || ''}`.trim() || message.sender?.email;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col animate-fade-in",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {!isOwn && (
                  <span className="text-xs font-medium text-muted-foreground mb-1 ml-1">
                    {senderName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                    "transition-all duration-200 hover:shadow-md",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border rounded-bl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1.5 opacity-60",
                      isOwn ? "text-right" : "text-left"
                    )}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={sendMessage.isPending}
            className="flex-1 rounded-full"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="rounded-full h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
