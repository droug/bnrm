import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface AudioVideoTranscriberProps {
  file?: File;
  mediaUrl?: string;
  onTranscriptionComplete?: (transcript: string, segments: TranscriptSegment[]) => void;
}

// Web Speech API recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function AudioVideoTranscriber({
  file,
  mediaUrl,
  onTranscriptionComplete
}: AudioVideoTranscriberProps) {
  const { toast } = useToast();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [transcript, setTranscript] = useState<string>("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(!!SpeechRecognition);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaSourceRef = useRef<string | null>(null);

  // Supported languages for Web Speech API
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

  // Create object URL from file
  const getMediaSource = useCallback(() => {
    if (file && !mediaSourceRef.current) {
      mediaSourceRef.current = URL.createObjectURL(file);
    }
    return mediaSourceRef.current || mediaUrl || "";
  }, [file, mediaUrl]);

  // Start transcription using Web Speech API
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
      let segmentStartTime = 0;
      let lastFinalTime = 0;

      recognition.onstart = () => {
        setStatus("Reconnaissance vocale en cours...");
        // Start playing the media
        const media = audioRef.current || videoRef.current;
        if (media) {
          media.play();
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        const media = audioRef.current || videoRef.current;
        const currentMediaTime = media?.currentTime || 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            
            // Create a new segment
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

        // Update progress based on media time
        if (media && media.duration) {
          setProgress(Math.round((currentMediaTime / media.duration) * 100));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Continue even without speech detected
          return;
        }
        setError(`Erreur de reconnaissance: ${event.error}`);
      };

      recognition.onend = () => {
        const media = audioRef.current || videoRef.current;
        
        // If media is still playing, restart recognition
        if (media && !media.paused && !media.ended) {
          recognition.start();
          return;
        }

        setIsTranscribing(false);
        setProgress(100);
        setStatus("Transcription terminée");
        
        // Clean up interim text markers
        const cleanTranscript = transcript.replace(/\s*\[.*?\]\s*/g, " ").trim();
        setTranscript(cleanTranscript || currentText);
        
        // Notify parent
        if (onTranscriptionComplete) {
          onTranscriptionComplete(cleanTranscript || currentText, newSegments);
        }

        toast({
          title: "Transcription terminée",
          description: `${newSegments.length} segments transcrits`
        });
      };

      // Set up media end handler
      const media = audioRef.current || videoRef.current;
      if (media) {
        media.onended = () => {
          recognition.stop();
        };
        media.currentTime = 0;
      }

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
    const media = audioRef.current || videoRef.current;
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
  };

  // Copy transcript
  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    toast({
      title: "Copié",
      description: "Transcription copiée dans le presse-papiers"
    });
  };

  // Download transcript
  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine media type
  const isVideo = file?.type.startsWith('video/') || 
    (mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.mov')));

  const mediaSrc = getMediaSource();

  return (
    <div className="space-y-4">
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

      {/* Language Selection */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Paramètres de transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Langue de reconnaissance</Label>
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
                  Démarrer la transcription
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

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Hidden Media Player */}
      {mediaSrc && (
        <div className="hidden">
          {isVideo ? (
            <video ref={videoRef} src={mediaSrc} preload="metadata" />
          ) : (
            <audio ref={audioRef} src={mediaSrc} preload="metadata" />
          )}
        </div>
      )}

      {/* Transcript Output */}
      {(transcript || segments.length > 0) && (
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                Transcription
              </CardTitle>
              <CardDescription>
                {segments.length} segment(s) • {transcript.split(' ').filter(Boolean).length} mots
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyTranscript}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTranscript}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="La transcription apparaîtra ici..."
            />
          </CardContent>
        </Card>
      )}

      {/* Success Badge */}
      {!isTranscribing && transcript && (
        <div className="flex items-center justify-center">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Transcription complète
          </Badge>
        </div>
      )}
    </div>
  );
}
