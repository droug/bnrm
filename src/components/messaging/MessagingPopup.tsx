import { useState, useEffect } from "react";
import { X, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConversationsList from "./ConversationsList";
import ConversationView from "./ConversationView";
import NewConversationDialog from "./NewConversationDialog";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useMessaging";
import { Badge } from "@/components/ui/badge";

interface MessagingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagingPopup({ isOpen, onClose }: MessagingPopupProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { data: unreadData } = useUnreadCount();

  // Reset selected conversation when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedConversationId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div
        className={cn(
          "fixed top-1/2 -translate-y-1/2 right-6 z-50",
          "w-[90vw] md:w-[600px] lg:w-[800px]",
          "h-[85vh] max-h-[800px]",
          "animate-slide-in-right"
        )}
      >
        <Card className="h-full flex flex-col shadow-2xl border-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Messagerie</h2>
                {unreadData && unreadData.total > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadData.total} message{unreadData.total > 1 ? 's' : ''} non lu{unreadData.total > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewConversation(true)}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouveau</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            <div
              className={cn(
                "border-r overflow-y-auto transition-all duration-300",
                selectedConversationId
                  ? "hidden md:block md:w-[280px] lg:w-[320px]"
                  : "w-full"
              )}
            >
              <ConversationsList
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
              />
            </div>

            {/* Conversation View */}
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                selectedConversationId ? "block" : "hidden md:flex md:items-center md:justify-center"
              )}
            >
              {selectedConversationId ? (
                <div className="h-full flex flex-col">
                  {/* Mobile back button */}
                  <div className="md:hidden border-b p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversationId(null)}
                    >
                      ← Retour
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ConversationView conversationId={selectedConversationId} />
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[300px]">
                    Choisissez une conversation dans la liste ou créez-en une nouvelle
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={(id) => {
          setSelectedConversationId(id);
          setShowNewConversation(false);
        }}
      />
    </>
  );
}
