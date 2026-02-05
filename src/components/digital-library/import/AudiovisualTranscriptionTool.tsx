import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useLocalWhisperTranscription } from "@/hooks/useLocalWhisperTranscription";
import { 
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
  Video,
  Music,
  Type,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Save,
  Wand2,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

export default function AudiovisualTranscriptionTool() {
  const { toast } = useToast();
  const { transcribe: localTranscribe, progress: localProgress, isTranscribing: isLocalTranscribing } = useLocalWhisperTranscription();
  
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
  const [language, setLanguage] = useState<string>("ar"); // Default to Arabic
  const [transcriptionMethod, setTranscriptionMethod] = useState<"local" | "gemini" | "openai">("gemini");
  const [transcript, setTranscript] = useState<string>("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
  const mediaSourceRef = useRef<string | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Language options for Whisper (auto-detected, but shown for user info)
  const languageOptions = [
    { value: "auto", label: "Détection automatique" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "Arabe" },
    { value: "en", label: "Anglais" },
    { value: "es", label: "Espagnol" },
    { value: "de", label: "Allemand" },
    { value: "it", label: "Italien" },
    { value: "pt", label: "Portugais" },
    { value: "amz", label: "Amazighe" },
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

  // Start transcription based on selected method
  const startTranscription = async () => {
    // We need either a file or a document with a URL
    if (!selectedFile && !selectedDocumentId) {
      setError("Veuillez sélectionner un fichier ou un document à transcrire.");
      return;
    }

    setIsTranscribing(true);
    setProgress(10);
    setStatus("Préparation du fichier audio...");
    setError(null);
    setTranscript("");
    setSegments([]);

    try {
      let audioBlob: Blob;

      if (selectedFile) {
        // Use the selected file directly
        audioBlob = selectedFile;
        setProgress(20);
      } else {
        // Download the audio from the document URL
        setStatus("Téléchargement du fichier média...");
        const doc = documents.find(d => d.id === selectedDocumentId);
        if (!doc?.pdf_url) {
          throw new Error("URL du document introuvable");
        }

        const response = await fetch(doc.pdf_url);
        if (!response.ok) {
          throw new Error("Impossible de télécharger le fichier média");
        }
        audioBlob = await response.blob();
        setProgress(30);
      }

      let result: { text: string; words?: any[] } | null = null;
      let usedMethod = transcriptionMethod;

      // Try the selected method, with fallback to local if needed
      if (transcriptionMethod === "local") {
        result = await performLocalTranscription(audioBlob);
      } else if (transcriptionMethod === "gemini") {
        result = await performGeminiTranscription(audioBlob, usedMethod);
      } else if (transcriptionMethod === "openai") {
        result = await performOpenAITranscription(audioBlob);
      }

      if (!result) {
        throw new Error("Aucun résultat de transcription");
      }

      // Process the response
      if (result.text) {
        setTranscript(result.text);

        // Create segments from words if available
        if (result.words && result.words.length > 0) {
          const newSegments: TranscriptSegment[] = [];
          let currentSegmentText = "";
          let segmentStartTime = 0;
          let wordCount = 0;

          result.words.forEach((word: any, index: number) => {
            currentSegmentText += (currentSegmentText ? " " : "") + word.text;
            wordCount++;

            // Create a segment every 10-15 words or at punctuation
            const isPunctuation = /[.!?]$/.test(word.text);
            const isLastWord = index === result!.words!.length - 1;

            if (wordCount >= 12 || isPunctuation || isLastWord) {
              newSegments.push({
                id: `seg-${newSegments.length}`,
                text: currentSegmentText.trim(),
                startTime: segmentStartTime,
                endTime: word.end || 0,
              });
              currentSegmentText = "";
              segmentStartTime = word.end || 0;
              wordCount = 0;
            }
          });

          setSegments(newSegments);
        } else {
          // Create simple segments from text if no word timestamps
          const sentences = result.text.split(/[.!?]+/).filter((s: string) => s.trim());
          const newSegments: TranscriptSegment[] = sentences.map((text: string, idx: number) => ({
            id: `seg-${idx}`,
            text: text.trim(),
            startTime: idx * 5,
            endTime: (idx + 1) * 5,
          }));
          setSegments(newSegments);
        }
      }

      setProgress(100);
      setStatus("Transcription terminée");
      setIsTranscribing(false);

      toast({
        title: "Transcription terminée",
        description: `${result.text?.split(' ').length || 0} mots transcrits avec succès`
      });

    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err.message || "Erreur lors de la transcription");
      setIsTranscribing(false);
      setProgress(0);
      setStatus("");
    }
  };

  // Local transcription using browser-based Whisper with AI validation
  const performLocalTranscription = async (audioBlob: Blob): Promise<{ text: string; words?: any[] } | null> => {
    setStatus("Transcription locale en cours (peut prendre quelques minutes)...");
    setProgress(30);

    const result = await localTranscribe(audioBlob, language);
    
    if (!result) {
      throw new Error("Échec de la transcription locale");
    }

    setProgress(60);
    setStatus("Correction intelligente du texte (reconstruction des mots et phrases)...");

    // Get session for AI validation
    const { data: { session } } = await supabase.auth.getSession();
    
    let validatedText = result.text;
    let corrections: Array<{ original: string; corrected: string; type: string }> = [];
    let qualityScore = 100;
    
    if (session && result.text.trim().length > 0) {
      try {
        const validateResponse = await fetch(
          `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/validate-transcription`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: result.text,
              language: language
            }),
          }
        );

        if (validateResponse.ok) {
          const validationResult = await validateResponse.json();
          if (validationResult.validatedText) {
            validatedText = validationResult.validatedText;
            corrections = validationResult.corrections || [];
            qualityScore = validationResult.qualityScore || 50;
            
            // Show appropriate message based on quality
            if (qualityScore < 40) {
              toast({
                title: "⚠️ Qualité de transcription faible",
                description: `Score: ${qualityScore}%. ${corrections.length} mot(s) corrigé(s). Pour de meilleurs résultats, utilisez Gemini ou OpenAI.`,
                variant: "destructive"
              });
            } else if (corrections.length > 0) {
              toast({
                title: "✓ Texte corrigé",
                description: `${corrections.length} correction(s) - Qualité: ${qualityScore}%`,
              });
            }
          }
        } else {
          console.warn("Validation failed, using original text");
          toast({
            title: "Validation non disponible",
            description: "Le texte brut est affiché. La qualité peut être limitée.",
            variant: "default"
          });
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
      }
    }

    setProgress(90);
    return {
      text: validatedText,
      words: result.chunks?.map((chunk) => ({
        text: chunk.text,
        start: chunk.timestamp[0],
        end: chunk.timestamp[1]
      }))
    };
  };

  // Gemini transcription via edge function with fallback
  const performGeminiTranscription = async (audioBlob: Blob, _method: string): Promise<{ text: string; words?: any[] } | null> => {
    setStatus("Envoi vers Gemini pour transcription...");
    setProgress(40);

    // Prepare form data for the edge function
    const formData = new FormData();
    formData.append("audio", audioBlob, selectedFile?.name || "audio.mp3");
    formData.append("language", language);

    // Get the session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Vous devez être connecté pour utiliser la transcription");
    }

    const transcribeResponse = await fetch(
      `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/whisper-transcribe`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    setProgress(70);
    setStatus("Traitement de la transcription...");

    if (!transcribeResponse.ok) {
      const errorData = await transcribeResponse.json().catch(() => ({}));
      const serverCode = (errorData as any)?.code as string | undefined;
      const serverMsg = ((errorData as any)?.message || (errorData as any)?.error || "") as string;

      const isWorkerLimit =
        transcribeResponse.status === 546 ||
        serverCode === "WORKER_LIMIT" ||
        /compute resources|memory/i.test(serverMsg);
      
      // If file is too large, fallback to local method
      if (transcribeResponse.status === 413 && errorData.fallbackToLocal) {
        toast({
          title: "Fichier volumineux",
          description: "Basculement automatique vers la méthode locale...",
          variant: "default"
        });
        return await performLocalTranscription(audioBlob);
      }

      // If the edge function runs out of resources, fallback to local method
      if (isWorkerLimit) {
        toast({
          title: "Serveur surchargé",
          description: "Ressources insuffisantes pour cette transcription. Basculement automatique vers la méthode locale...",
          variant: "default",
        });
        return await performLocalTranscription(audioBlob);
      }
      
      throw new Error(errorData.error || `Erreur de transcription: ${transcribeResponse.status}`);
    }

    const result = await transcribeResponse.json();
    setProgress(90);

    return {
      text: result.text,
      words: result.words
    };
  };

  // OpenAI Whisper transcription via edge function
  const performOpenAITranscription = async (audioBlob: Blob): Promise<{ text: string; words?: any[] } | null> => {
    setStatus("Envoi vers OpenAI Whisper pour transcription...");
    setProgress(40);

    // Prepare form data for the edge function
    const formData = new FormData();
    formData.append("audio", audioBlob, selectedFile?.name || "audio.mp3");
    formData.append("language", language);

    // Get the session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Vous devez être connecté pour utiliser la transcription");
    }

    const transcribeResponse = await fetch(
      `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/openai-whisper-transcribe`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    setProgress(70);
    setStatus("Traitement de la transcription...");

    if (!transcribeResponse.ok) {
      const errorData = await transcribeResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur de transcription: ${transcribeResponse.status}`);
    }

    const result = await transcribeResponse.json();
    setProgress(90);

    return {
      text: result.text,
      words: result.segments?.map((seg: any) => ({
        text: seg.text,
        start: seg.start,
        end: seg.end
      }))
    };
  };

  // Stop transcription (cancel the process)
  const stopTranscription = () => {
    setIsTranscribing(false);
    setStatus("Transcription annulée");
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
      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Wand2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Transcription automatique (ElevenLabs) :</strong> Sélectionnez un fichier audio/vidéo ou un document existant, 
          puis lancez la transcription automatique. Aucun microphone requis - le traitement se fait côté serveur.
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

                <div className="space-y-2">
                  <Label>Méthode de transcription</Label>
                  <Select 
                    value={transcriptionMethod} 
                    onValueChange={(v) => setTranscriptionMethod(v as "local" | "gemini" | "openai")} 
                    disabled={isTranscribing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">
                        <span className="flex items-center gap-2">
                          🖥️ Local (Gratuit, navigateur)
                        </span>
                      </SelectItem>
                      <SelectItem value="gemini">
                        <span className="flex items-center gap-2">
                          ✨ Gemini (&lt;10MB)
                        </span>
                      </SelectItem>
                      <SelectItem value="openai">
                        <span className="flex items-center gap-2">
                          🔑 OpenAI Whisper (Payant)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                
                <div className="flex items-end gap-2">
                  {!isTranscribing ? (
                    <Button 
                      onClick={startTranscription} 
                      disabled={!mediaSrc && !selectedFile}
                      className="flex-1"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Transcrire automatiquement
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
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {segments.length} segments transcrits • {transcript.split(' ').filter(Boolean).length} mots
          </Badge>
        </div>
      )}
    </div>
  );
}
