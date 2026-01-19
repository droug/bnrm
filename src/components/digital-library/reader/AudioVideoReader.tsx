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
  Download,
  Share2,
  ArrowLeft,
  Mic,
  MicOff,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Settings
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

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
  
  // Transcription state
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("fr-FR");
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptionLoaded, setTranscriptionLoaded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  
  // Teleprompter state
  const [autoScroll, setAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  
  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
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
        
        // Create segments from pages
        const segs: TranscriptSegment[] = data.map((p, idx) => ({
          id: `seg-${idx}`,
          text: p.ocr_text || '',
          startTime: idx * 30,
          endTime: (idx + 1) * 30
        }));
        setSegments(segs);
        setTranscriptionLoaded(true);
      }
    };
    
    loadTranscription();
  }, [documentData.id]);

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

  // Start transcription
  const startTranscription = () => {
    if (!SpeechRecognition) {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par ce navigateur",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = transcriptionLanguage;

    let currentText = transcript;
    let currentSegments = [...segments];

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
          
          // Add new segment
          const newSegment: TranscriptSegment = {
            id: `seg-${Date.now()}-${i}`,
            text: result[0].transcript,
            startTime: currentTime,
            endTime: currentTime + 5
          };
          currentSegments.push(newSegment);
          setSegments([...currentSegments]);
        } else {
          interimText += result[0].transcript;
        }
      }
      
      if (finalText) {
        currentText += finalText;
        setTranscript(currentText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Transcription error:', event.error);
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      if (isTranscribing && isPlaying) {
        recognition.start();
      } else {
        setIsTranscribing(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsTranscribing(true);

    // Start media playback
    if (mediaRef.current && !isPlaying) {
      mediaRef.current.play();
    }
  };

  // Stop transcription
  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
  };

  // Save transcription
  const saveTranscription = async () => {
    try {
      // Delete existing pages
      await supabase
        .from('digital_library_pages')
        .delete()
        .eq('document_id', documentData.id);

      // Save transcript as pages
      const pages = transcript.split('\n').filter(t => t.trim());
      const pageRecords = pages.map((text, idx) => ({
        document_id: documentData.id,
        page_number: idx + 1,
        ocr_text: text
      }));

      if (pageRecords.length > 0) {
        await supabase.from('digital_library_pages').insert(pageRecords);
      }

      // Mark document as OCR processed
      await supabase
        .from('digital_library_documents')
        .update({ ocr_processed: true })
        .eq('id', documentData.id);

      toast({
        title: "Transcription sauvegardée",
        description: "La transcription a été enregistrée avec succès"
      });
    } catch (error) {
      console.error('Error saving transcription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la transcription",
        variant: "destructive"
      });
    }
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

        {/* Transcription Panel - Always visible */}
        <Card className="shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transcription
                {!SpeechRecognition && (
                  <Badge variant="destructive" className="text-xs">Non supporté</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {transcript && (
                  <Button variant="ghost" size="icon" onClick={copyTranscript}>
                    {copiedText ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Collapsible open={showTranscript}>
            <CollapsibleContent>
              <CardContent className="pt-0 flex-1 flex flex-col">
                {/* Transcription controls */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Select value={transcriptionLanguage} onValueChange={setTranscriptionLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr-FR">Français</SelectItem>
                      <SelectItem value="ar-MA">العربية</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>

                  {!isTranscribing ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={startTranscription}
                      disabled={!SpeechRecognition}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Transcrire
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={stopTranscription}
                    >
                      <MicOff className="h-4 w-4 mr-2" />
                      Arrêter
                    </Button>
                  )}

                  {transcript && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={saveTranscription}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setTranscript(''); setSegments([]); }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </>
                  )}
                </div>

                {/* Font size control */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Taille:</span>
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
                  {!transcript && !transcriptionLoaded && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune transcription disponible</p>
                      <p className="text-sm mt-1">
                        Cliquez sur "Transcrire" pour démarrer la reconnaissance vocale
                      </p>
                    </div>
                  )}
                  
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
      </div>
    </div>
  );
}
