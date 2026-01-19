import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown,
  Maximize2,
  Minimize2,
  Type,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number;
}

interface TeleprompterProps {
  transcript: string;
  segments?: TranscriptSegment[];
  currentTime?: number; // Current playback time in seconds
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

export default function Teleprompter({
  transcript,
  segments = [],
  currentTime = 0,
  isPlaying = false,
  onSeek,
  className
}: TeleprompterProps) {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(50); // 1-100
  const [fontSize, setFontSize] = useState(24); // px
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [manualScrolling, setManualScrolling] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Find active segment based on current time
  const activeSegmentIndex = segments.findIndex(
    seg => currentTime >= seg.startTime && currentTime < seg.endTime
  );

  // Auto-scroll to active segment when time changes
  useEffect(() => {
    if (!isAutoScroll || manualScrolling || !activeSegmentRef.current) return;
    
    activeSegmentRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, [activeSegmentIndex, isAutoScroll, manualScrolling]);

  // Continuous auto-scroll for playback
  useEffect(() => {
    if (!isPlaying || !isAutoScroll || segments.length === 0) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    // For segment-based scrolling, we scroll to segments
    // For continuous text, we use speed-based scrolling
    if (segments.length === 0 && scrollRef.current) {
      const scrollElement = scrollRef.current;
      const scrollStep = (scrollSpeed / 100) * 2; // pixels per frame

      scrollIntervalRef.current = setInterval(() => {
        if (scrollElement) {
          scrollElement.scrollTop += scrollStep;
        }
      }, 50);
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPlaying, isAutoScroll, scrollSpeed, segments.length]);

  // Handle manual scroll
  const handleScroll = useCallback(() => {
    setManualScrolling(true);
    // Reset after a delay
    setTimeout(() => setManualScrolling(false), 2000);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Reset scroll position
  const resetScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    if (onSeek) {
      onSeek(0);
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render segments or plain text
  const renderContent = () => {
    if (segments.length > 0) {
      return (
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const isActive = index === activeSegmentIndex;
            const isPast = currentTime > segment.endTime;
            
            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => onSeek?.(segment.startTime)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-300",
                  isActive && "bg-primary/20 border-l-4 border-primary scale-[1.02]",
                  isPast && "opacity-50",
                  !isActive && !isPast && "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Badge 
                    variant={isActive ? "default" : "outline"} 
                    className="shrink-0 text-xs"
                  >
                    {formatTime(segment.startTime)}
                  </Badge>
                  <p 
                    className={cn(
                      "leading-relaxed transition-all",
                      isActive && "font-medium text-primary"
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {segment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Plain text mode
    return (
      <p 
        className="leading-relaxed whitespace-pre-wrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {transcript}
      </p>
    );
  };

  return (
    <Card 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5" />
            Téléprompteur
          </CardTitle>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={16}
                max={48}
                step={2}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground w-8">{fontSize}px</span>
            </div>

            {/* Scroll Speed */}
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scrollSpeed]}
                onValueChange={([v]) => setScrollSpeed(v)}
                min={10}
                max={100}
                step={5}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground w-8">{scrollSpeed}%</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant={isAutoScroll ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                title={isAutoScroll ? "Désactiver le défilement auto" : "Activer le défilement auto"}
              >
                {isAutoScroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetScroll}
                title="Retour au début"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea 
          className={cn(
            "p-6",
            isFullscreen ? "h-[calc(100vh-80px)]" : "h-[400px]"
          )}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {transcript || segments.length > 0 ? (
            renderContent()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Type className="h-12 w-12 mb-4 opacity-50" />
              <p>Aucune transcription disponible</p>
              <p className="text-sm">Lancez la transcription pour afficher le texte ici</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Current time indicator */}
      {segments.length > 0 && (
        <div className="absolute bottom-4 right-4">
          <Badge variant="secondary" className="font-mono">
            {formatTime(currentTime)}
          </Badge>
        </div>
      )}
    </Card>
  );
}
