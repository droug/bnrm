import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/useMessaging";
import MessagingPanel from "./MessagingPanel";
import { cn } from "@/lib/utils";

interface MessagingButtonProps {
  className?: string;
  isHomePage?: boolean;
}

export default function MessagingButton({ className, isHomePage }: MessagingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useUnreadCount();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-2 relative transition-all duration-200",
          isOpen && "bg-primary/10",
          isHomePage && "text-white hover:bg-white/20",
          className
        )}
        title="Messagerie"
      >
        <MessageCircle className="h-4 w-4" />
        {unreadData && unreadData.total > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
          >
            {unreadData.total > 99 ? '99+' : unreadData.total}
          </Badge>
        )}
      </Button>

      <MessagingPanel isOpen={isOpen} onClose={() => setIsOpen(false)} mode="overlay" />
    </>
  );
}
