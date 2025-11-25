import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Accessibility } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import SmartChatBot from "@/components/SmartChatBot";

export function FloatingButtons() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating buttons container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {/* Accessibility button - scrolls to top where accessibility tools are */}
        <Button
          size="lg"
          onClick={scrollToTop}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 bg-primary/90 hover:bg-primary"
          title={language === 'ar' ? 'أدوات إمكانية الوصول' : 'Outils d\'accessibilité'}
        >
          <Accessibility className="h-6 w-6" />
        </Button>

        {/* Chatbot button */}
        <Button
          size="lg"
          onClick={() => setIsChatBotOpen(!isChatBotOpen)}
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 relative ${
            isChatBotOpen ? 'bg-[#e67e22]' : 'bg-[#e67e22]/90'
          }`}
          title={language === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
        >
          <Bot className="h-6 w-6" />
          {!isChatBotOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
          )}
        </Button>
      </div>

      {/* Chatbot */}
      {isChatBotOpen && (
        <SmartChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
    </>
  );
}
