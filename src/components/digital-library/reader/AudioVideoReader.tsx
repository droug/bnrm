import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  FileText,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Subtitles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface DocumentData {
  id: string;
  title: string;
  author?: string;
  publication_year?: number;
  document_type: 'audio' | 'video';
  pdf_url: string;
  cover_image_url?: string;
}

interface AudioVideoReaderProps {
  documentData: DocumentData;
  onBack?: () => void;
}



export default function AudioVideoReader({ documentData, onBack }: AudioVideoReaderProps) {
  const { toast } = useToast();
  
  // Media state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Transcription state (read-only from database)
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptionLoaded, setTranscriptionLoaded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("");
  
  // Teleprompter state
  const [autoScroll, setAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  
  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Check if media is audio or video
  const isVideo = documentData.document_type === 'video';

  // Load existing transcription from database
  useEffect(() => {
    const loadTranscription = async () => {
      const { data, error } = await supabase
        .from('digital_library_pages')
        .select('ocr_text, page_number')
        .eq('document_id', documentData.id)
        .order('page_number');
      
      if (data && data.length > 0) {
        const fullText = data.map(p => p.ocr_text).join('\n');
        setTranscript(fullText);
        
        // Create segments from pages - timestamps will be recalculated when duration is known
        const segs: TranscriptSegment[] = data.map((p, idx) => ({
          id: `seg-${idx}`,
          text: p.ocr_text || '',
          startTime: 0,
          endTime: 0
        }));
        setSegments(segs);
        setTranscriptionLoaded(true);
      }
    };
    
    loadTranscription();
  }, [documentData.id]);

  // Track if timestamps have been calculated
  const [timestampsCalculated, setTimestampsCalculated] = useState(false);

  // Recalculate segment timestamps when duration is known
  useEffect(() => {
    if (duration > 0 && segments.length > 0 && !timestampsCalculated) {
      console.log('📊 Calculating segment timestamps:', { duration, segmentsCount: segments.length });
      const segmentDuration = duration / segments.length;
      const updatedSegments = segments.map((seg, idx) => ({
        ...seg,
        startTime: idx * segmentDuration,
        endTime: (idx + 1) * segmentDuration
      }));
      console.log('📊 Updated segments:', updatedSegments.slice(0, 3));
      setSegments(updatedSegments);
      setTimestampsCalculated(true);
    }
  }, [duration, segments.length, timestampsCalculated]);

  // Update active subtitle text based on currentTime
  useEffect(() => {
    if (segments.length === 0 || !timestampsCalculated) {
      setActiveSubtitle("");
      return;
    }
    
    const active = segments.find(
      s => currentTime >= s.startTime && currentTime < s.endTime
    );
    
    if (active) {
      console.log('🎬 Active subtitle:', { currentTime, segment: active.text.substring(0, 30) });
    }
    
    setActiveSubtitle(active?.text || "");
  }, [currentTime, segments, timestampsCalculated]);

  // Media event handlers
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update playback speed
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Auto-scroll transcript
  useEffect(() => {
    if (!autoScroll || !transcriptRef.current || segments.length === 0) return;
    
    const activeSegment = segments.find(
      s => currentTime >= s.startTime && currentTime < s.endTime
    );
    
    if (activeSegment) {
      const element = window.document.getElementById(`segment-${activeSegment.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, segments, autoScroll]);

  // Toggle play/pause
  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  // Seek to position
  const handleSeek = (time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = time;
    setCurrentTime(time);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const newTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
    media.currentTime = newTime;
  };

  // Volume control
  const handleVolumeChange = (value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    setVolume(value);
    media.volume = value;
    setIsMuted(value === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };


  // Copy transcript
  const copyTranscript = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    toast({
      title: "Copié",
      description: "Transcription copiée dans le presse-papiers"
    });
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get active segment index
  const getActiveSegmentIndex = (): number => {
    return segments.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime);
  };

  return (
    <div ref={containerRef} className={cn(
      "flex flex-col flex-1 bg-background overflow-auto",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="font-semibold text-lg line-clamp-1">{documentData.title}</h1>
            {documentData.author && (
              <p className="text-sm text-muted-foreground">{documentData.author}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {isVideo ? 'Vidéo' : 'Audio'}
          </Badge>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main content - Vertical layout for better video visibility */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
        {/* Media Player - Full width */}
        <Card className="shrink-0">
          <CardContent className="p-4">
            {/* Video element - Full width with proper aspect ratio */}
            {isVideo && (
              <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={documentData.pdf_url}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  poster={documentData.cover_image_url}
                  controls={false}
                />
                
                {/* Subtitles overlay - Always visible when enabled */}
                {transcriptionLoaded && showSubtitles && activeSubtitle && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
                    <div
                      className="bg-black/85 text-white px-6 py-3 rounded-lg max-w-[95%] text-center shadow-lg"
                      style={{ 
                        fontSize: `${Math.max(fontSize, 18)}px`,
                        lineHeight: 1.5,
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                      }}
                      dir="auto"
                    >
                      {activeSubtitle}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audio element */}
            {!isVideo && (
              <div className="flex items-center justify-center py-8 mb-4">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Volume2 className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-lg font-medium">{documentData.title}</p>
                  <p className="text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</p>
                </div>
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={documentData.pdf_url}
                  preload="metadata"
                  className="hidden"
                />
              </div>
            )}

            {/* Controls */}
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 font-mono">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  onValueChange={([v]) => handleSeek(v)}
                  max={duration || 100}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => skip(-10)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="icon" 
                    onClick={togglePlay}
                    className="h-12 w-12"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button variant="outline" size="icon" onClick={() => skip(10)}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback speed */}
                  <Select value={String(playbackSpeed)} onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Subtitles toggle */}
                  {transcriptionLoaded && isVideo && (
                    <Button 
                      variant={showSubtitles ? "default" : "outline"} 
                      size="icon"
                      onClick={() => setShowSubtitles(!showSubtitles)}
                      title={showSubtitles ? "Masquer les sous-titres" : "Afficher les sous-titres"}
                    >
                      <Subtitles className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={([v]) => handleVolumeChange(v)}
                      max={1}
                      step={0.1}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcription Panel - Toggle to show/hide existing transcription */}
        {(transcript || transcriptionLoaded) && (
          <Card className="shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Transcription
                  {transcriptionLoaded && (
                    <Badge variant="secondary" className="text-xs">Disponible</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {transcript && (
                    <Button variant="ghost" size="icon" onClick={copyTranscript}>
                      {copiedText ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant={showTranscript ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowTranscript(!showTranscript)}
                  >
                    {showTranscript ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Afficher
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <Collapsible open={showTranscript}>
              <CollapsibleContent>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  {/* Font size control */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Taille du texte:</span>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([v]) => setFontSize(v)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">{fontSize}px</span>
                  </div>

                  <Separator className="mb-3" />

                  {/* Transcript display */}
                  <ScrollArea className="flex-1 h-[300px]" ref={transcriptRef}>
                    {segments.length > 0 ? (
                      <div className="space-y-2 pr-4">
                        {segments.map((segment, idx) => {
                          const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
                          const isPast = currentTime >= segment.endTime;
                          
                          return (
                            <div
                              key={segment.id}
                              id={`segment-${segment.id}`}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-all",
                                isActive && "bg-primary/10 border-l-4 border-primary",
                                isPast && !isActive && "opacity-60",
                                !isActive && !isPast && "hover:bg-muted/50"
                              )}
                              style={{ fontSize: `${fontSize}px` }}
                              onClick={() => handleSeek(segment.startTime)}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground font-mono mt-1">
                                  {formatTime(segment.startTime)}
                                </span>
                                <p className="flex-1 leading-relaxed">{segment.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : transcript ? (
                      <p 
                        className="whitespace-pre-wrap leading-relaxed pr-4"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {transcript}
                      </p>
                    ) : null}
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </div>
  );
}
