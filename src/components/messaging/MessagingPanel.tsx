import { useState, useEffect, useRef } from "react";
import { X, MessageSquarePlus, Search, Users, Bell, BellOff, Pin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useMessaging";
import { messagingConfig, type MessagingFilter } from "@/config/messaging";
import ConversationsList from "./ConversationsList";
import ConversationView from "./ConversationView";
import NewConversationDialog from "./NewConversationDialog";

interface MessagingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "panel" | "overlay";
}

export default function MessagingPanel({ 
  isOpen, 
  onClose,
  mode = messagingConfig.presentationMode 
}: MessagingPanelProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MessagingFilter>("all");
  const { data: unreadData } = useUnreadCount();
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedConversationId(null);
      setSearchQuery("");
      setActiveFilter("all");
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        if (selectedConversationId) {
          setSelectedConversationId(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedConversationId, onClose]);

  if (!isOpen) return null;

  const panelClasses = cn(
    "flex flex-col bg-[hsl(var(--bnrm-bg))] border-[hsl(var(--bnrm-border))]",
    mode === "overlay" ? [
      "fixed right-0 top-1/2 -translate-y-1/2 z-[var(--z-modal)]",
      "animate-slide-in-right",
      `w-[${messagingConfig.panelWidth}px] max-w-[90vw]`,
      `max-h-[${messagingConfig.overlayMaxHeightVh}vh]`,
      "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.15)] border rounded-l-lg"
    ] : [
      "sticky top-0 h-screen",
      `w-[${messagingConfig.panelWidth}px] max-w-full`,
      "border-l shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]"
    ]
  );

  return (
    <>
      {/* Overlay backdrop for overlay mode */}
      {mode === "overlay" && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[var(--z-modal-backdrop)] animate-fade-in"
          onClick={onClose}
          aria-label="Fermer la messagerie"
        />
      )}

      {/* Main panel */}
      <div
        ref={panelRef}
        className={panelClasses}
        role="dialog"
        aria-label="Panneau de messagerie"
        aria-modal={mode === "overlay"}
      >
        {/* Header */}
        <header className="flex-shrink-0 px-4 py-3 border-b border-[hsl(var(--bnrm-border))] bg-white/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[hsl(var(--bnrm-text))]">
                Messagerie
              </h2>
              {unreadData && unreadData.total > 0 && (
                <Badge 
                  className="bg-[hsl(var(--bnrm-accent))] text-[hsl(var(--bnrm-accent-foreground))] h-5 min-w-5"
                >
                  {unreadData.total > 99 ? '99+' : unreadData.total}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowNewConversation(true)}
                className="gap-2 bg-[hsl(var(--bnrm-accent))] hover:bg-[hsl(var(--bnrm-accent))]/90 text-[hsl(var(--bnrm-accent-foreground))]"
                aria-label="Créer une nouvelle conversation"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Créer</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-destructive/10 hover:text-destructive"
                aria-label="Fermer la messagerie"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--bnrm-muted))]" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[hsl(var(--bnrm-border))]"
              aria-label="Rechercher une conversation"
            />
          </div>

          {/* Filters */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as MessagingFilter)}>
            <TabsList className="w-full bg-white/70 p-1">
              <TabsTrigger value="all" className="flex-1 text-xs">Tous</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 text-xs">Non lus</TabsTrigger>
              <TabsTrigger value="priority" className="flex-1 text-xs">Prioritaires</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1 text-xs">Groupes</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Conversations list */}
          <div
            className={cn(
              "flex-shrink-0 border-r border-[hsl(var(--bnrm-border))] overflow-hidden transition-all duration-300",
              selectedConversationId
                ? "hidden md:flex md:flex-col md:w-[280px]"
                : "flex flex-col w-full"
            )}
          >
            <ScrollArea className="flex-1">
              <ConversationsList
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
                searchQuery={searchQuery}
                filter={activeFilter}
              />
            </ScrollArea>
          </div>

          {/* Conversation view */}
          <div
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all duration-300",
              selectedConversationId ? "flex" : "hidden md:flex"
            )}
          >
            {selectedConversationId ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden border-b border-[hsl(var(--bnrm-border))] p-2 bg-white/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversationId(null)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Retour
                  </Button>
                </div>
                <ConversationView 
                  conversationId={selectedConversationId}
                  onClose={() => setSelectedConversationId(null)}
                />
              </>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center p-8 text-center flex-1">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--bnrm-accent))]/10 flex items-center justify-center mb-4">
                  <MessageSquarePlus className="h-8 w-8 text-[hsl(var(--bnrm-accent))]" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--bnrm-text))] mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-sm text-[hsl(var(--bnrm-muted))] max-w-[300px]">
                  Choisissez une conversation dans la liste ou créez-en une nouvelle
                </p>
              </div>
            )}
          </div>
        </div>
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
