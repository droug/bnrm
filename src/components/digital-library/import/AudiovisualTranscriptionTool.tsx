import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic, 
  FileAudio, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Languages,
  Upload,
  Video,
  Music,
  Type,
  Maximize2,
  Minimize2,
  Gauge,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

// Web Speech API recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function AudiovisualTranscriptionTool() {
  const { toast } = useToast();
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [transcript, setTranscript] = useState<string>("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(!!SpeechRecognition);
  
  // Media player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Teleprompter state
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaSourceRef = useRef<string | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Language options
  const languageOptions = [
    { value: "fr-FR", label: "Français" },
    { value: "ar-SA", label: "Arabe" },
    { value: "en-US", label: "Anglais (US)" },
    { value: "en-GB", label: "Anglais (UK)" },
    { value: "es-ES", label: "Espagnol" },
    { value: "de-DE", label: "Allemand" },
    { value: "it-IT", label: "Italien" },
    { value: "pt-PT", label: "Portugais" },
    { value: "la", label: "Latin" },
  ];

  // Load documents from database
  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('id, title, document_type, pdf_url')
        .in('document_type', ['audio', 'video'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedDocumentId("");
      resetTranscription();
      
      // Revoke old URL
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(mediaSourceRef.current);
      }
      mediaSourceRef.current = URL.createObjectURL(file);
    }
  };

  // Handle document selection from DB
  const handleDocumentSelect = (docId: string) => {
    setSelectedDocumentId(docId);
    setSelectedFile(null);
    resetTranscription();
    
    const doc = documents.find(d => d.id === docId);
    if (doc?.pdf_url) {
      mediaSourceRef.current = doc.pdf_url;
    }
  };

  // Get media source
  const getMediaSource = () => mediaSourceRef.current || "";

  // Determine if video
  const isVideo = selectedFile?.type.startsWith('video/') || 
    documents.find(d => d.id === selectedDocumentId)?.document_type === 'video';

  // Find active segment
  const activeSegmentIndex = segments.findIndex(
    seg => currentTime >= seg.startTime && currentTime < seg.endTime
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (!isAutoScroll || !activeSegmentRef.current) return;
    
    activeSegmentRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, [activeSegmentIndex, isAutoScroll]);

  // Media time update handler
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
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
  }, [getMediaSource()]);

  // Start transcription
  const startTranscription = async () => {
    if (!SpeechRecognition) {
      setError("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.");
      return;
    }

    setIsTranscribing(true);
    setProgress(0);
    setStatus("Initialisation de la reconnaissance vocale...");
    setError(null);
    setTranscript("");
    setSegments([]);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const newSegments: TranscriptSegment[] = [];
      let currentText = "";
      let lastFinalTime = 0;

      recognition.onstart = () => {
        setStatus("Reconnaissance vocale en cours...");
        const media = mediaRef.current;
        if (media) {
          media.currentTime = 0;
          media.play();
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        const media = mediaRef.current;
        const currentMediaTime = media?.currentTime || 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            
            const segment: TranscriptSegment = {
              id: `seg-${newSegments.length}`,
              text: result[0].transcript.trim(),
              startTime: lastFinalTime,
              endTime: currentMediaTime
            };
            
            if (segment.text) {
              newSegments.push(segment);
              setSegments([...newSegments]);
            }
            
            lastFinalTime = currentMediaTime;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        currentText += finalTranscript;
        setTranscript(currentText + (interimTranscript ? ` [${interimTranscript}]` : ""));

        if (media && media.duration) {
          setProgress(Math.round((currentMediaTime / media.duration) * 100));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') return;
        setError(`Erreur de reconnaissance: ${event.error}`);
      };

      recognition.onend = () => {
        const media = mediaRef.current;
        
        if (media && !media.paused && !media.ended) {
          recognition.start();
          return;
        }

        setIsTranscribing(false);
        setProgress(100);
        setStatus("Transcription terminée");
        
        const cleanTranscript = transcript.replace(/\s*\[.*?\]\s*/g, " ").trim();
        setTranscript(cleanTranscript || currentText);

        toast({
          title: "Transcription terminée",
          description: `${newSegments.length} segments transcrits`
        });
      };

      recognition.start();

    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err.message || "Erreur lors de la transcription");
      setIsTranscribing(false);
    }
  };

  // Stop transcription
  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const media = mediaRef.current;
    if (media) {
      media.pause();
    }
    setIsTranscribing(false);
  };

  // Reset
  const resetTranscription = () => {
    stopTranscription();
    setTranscript("");
    setSegments([]);
    setProgress(0);
    setStatus("");
    setError(null);
    setCurrentTime(0);
  };

  // Media controls
  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const handleSeek = (time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const newTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
    media.currentTime = newTime;
  };

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

  // Copy and download
  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    toast({ title: "Copié", description: "Transcription copiée" });
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save transcription to database
  const saveTranscription = async () => {
    if (!selectedDocumentId || !transcript) return;

    try {
      // Save as OCR text in digital_library_pages (reusing existing table)
      const pageData = segments.map((seg, idx) => ({
        document_id: selectedDocumentId,
        page_number: idx + 1,
        ocr_text: seg.text,
        ocr_language: language.split('-')[0],
        ocr_confidence: 0.9,
      }));

      const { error } = await supabase
        .from('digital_library_pages')
        .upsert(pageData, { onConflict: 'document_id,page_number' });

      if (error) throw error;

      // Update document as OCR processed
      await supabase
        .from('digital_library_documents')
        .update({ ocr_processed: true })
        .eq('id', selectedDocumentId);

      toast({
        title: "Transcription sauvegardée",
        description: `${segments.length} segments enregistrés`
      });
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: "Erreur de sauvegarde",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const mediaSrc = getMediaSource();

  return (
    <div className="space-y-6">
      {/* Browser Support Warning */}
      {!isSupported && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre navigateur ne supporte pas la reconnaissance vocale Web Speech API.
            Veuillez utiliser Google Chrome ou Microsoft Edge.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Mic className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Transcription vocale :</strong> Sélectionnez un fichier audio/vidéo ou un document existant, 
          puis lancez la transcription pour générer le texte avec le téléprompteur synchronisé.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Source Selection & Controls */}
        <div className="space-y-4">
          {/* Source Selection */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                Source audio/vidéo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner un fichier
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile && (
                  <Badge variant="secondary" className="mt-2">
                    {selectedFile.name}
                  </Badge>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              {/* Document Selection */}
              <div className="space-y-2">
                <Label>Sélectionner un document existant</Label>
                <Select 
                  value={selectedDocumentId} 
                  onValueChange={handleDocumentSelect}
                  disabled={loadingDocs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un document audio/vidéo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <span className="flex items-center gap-2">
                          {doc.document_type === 'audio' ? (
                            <Music className="h-4 w-4" />
                          ) : (
                            <Video className="h-4 w-4" />
                          )}
                          {doc.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language & Controls */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={isTranscribing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end gap-2">
                  {!isTranscribing ? (
                    <Button 
                      onClick={startTranscription} 
                      disabled={!mediaSrc || !isSupported}
                      className="flex-1"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Transcrire
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopTranscription} 
                      variant="destructive"
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Arrêter
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={resetTranscription}
                    disabled={!transcript && segments.length === 0}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress */}
              {isTranscribing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {status}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Media Player */}
          {mediaSrc && (
            <Card>
              <CardContent className="p-4 space-y-4">
                {isVideo && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={mediaRef as React.RefObject<HTMLVideoElement>}
                      src={mediaSrc}
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                  </div>
                )}

                {!isVideo && (
                  <audio
                    ref={mediaRef as React.RefObject<HTMLAudioElement>}
                    src={mediaSrc}
                    preload="metadata"
                    className="hidden"
                  />
                )}

                {/* Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-10">
                      {formatTime(currentTime)}
                    </span>
                    <Slider
                      value={[currentTime]}
                      onValueChange={([v]) => handleSeek(v)}
                      max={duration || 100}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={() => skip(-10)}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button variant="default" size="icon" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => skip(10)}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Teleprompter */}
        <div ref={containerRef} className={cn(isFullscreen && "fixed inset-0 z-50 bg-background p-4")}>
          <Card className="h-full">
            <CardHeader className="border-b bg-muted/30 py-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Téléprompteur
                </CardTitle>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[fontSize]}
                      onValueChange={([v]) => setFontSize(v)}
                      min={14}
                      max={36}
                      step={2}
                      className="w-20"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant={isAutoScroll ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAutoScroll(!isAutoScroll)}
                    >
                      {isAutoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea 
                className={cn("p-4", isFullscreen ? "h-[calc(100vh-140px)]" : "h-[400px]")}
                ref={teleprompterRef}
              >
                {segments.length > 0 ? (
                  <div className="space-y-3">
                    {segments.map((segment, index) => {
                      const isActive = index === activeSegmentIndex;
                      const isPast = currentTime > segment.endTime;
                      
                      return (
                        <div
                          key={segment.id}
                          ref={isActive ? activeSegmentRef : null}
                          onClick={() => handleSeek(segment.startTime)}
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
                              className="shrink-0 text-xs font-mono"
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
                ) : transcript ? (
                  <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                    {transcript}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <Type className="h-12 w-12 mb-4 opacity-50" />
                    <p>Aucune transcription disponible</p>
                    <p className="text-sm">Lancez la transcription pour afficher le texte ici</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Actions */}
            {transcript && (
              <div className="border-t p-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyTranscript}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copier
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTranscript}>
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
                
                {selectedDocumentId && (
                  <Button size="sm" onClick={saveTranscription}>
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Success Badge */}
      {!isTranscribing && transcript && (
        <div className="flex items-center justify-center">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {segments.length} segments transcrits • {transcript.split(' ').filter(Boolean).length} mots
          </Badge>
        </div>
      )}
    </div>
  );
}
