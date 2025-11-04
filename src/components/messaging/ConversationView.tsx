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
    <div className="flex flex-col h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">
          {conversation?.title || getParticipantsNames() || 'Conversation'}
        </CardTitle>
      </CardHeader>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message: any) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = isOwn
              ? "Vous"
              : `${message.profiles?.first_name || ''} ${message.profiles?.last_name || ''}`.trim() || message.sender?.email;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {senderName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1 opacity-70",
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

      <CardContent className="border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
