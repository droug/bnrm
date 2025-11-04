import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversationsList from "@/components/messaging/ConversationsList";
import ConversationView from "@/components/messaging/ConversationView";
import NewConversationDialog from "@/components/messaging/NewConversationDialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function MessagingPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messagerie</h1>
          <Button onClick={() => setShowNewConversation(true)}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          <div className="md:col-span-1 overflow-y-auto border rounded-lg">
            <ConversationsList
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
            />
          </div>
          <div className="md:col-span-2 border rounded-lg">
            {selectedConversationId ? (
              <ConversationView conversationId={selectedConversationId} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sélectionnez une conversation pour commencer
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={(id) => {
          setSelectedConversationId(id);
          setShowNewConversation(false);
        }}
      />
    </div>
  );
}
