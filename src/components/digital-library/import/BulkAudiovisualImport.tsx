import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Upload, 
  Video, 
  Music,
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileDown,
  Trash2,
  Film,
  Mic,
  FileText
} from "lucide-react";
import * as XLSX from 'xlsx';

interface ImportResult {
  fileName: string;
  title: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  mediaType?: string;
  duration?: string;
  transcription?: string;
}

interface BulkAudiovisualImportProps {
  onSuccess?: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac'];

const getMediaTypeFromMime = (mimeType: string): 'video' | 'audio' | null => {
  if (ACCEPTED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ACCEPTED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return null;
};

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const isValidMediaFile = (file: File): boolean => {
  const mimeValid = [...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_AUDIO_TYPES].includes(file.type);
  const extValid = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mp3', 'wav', 'aac', 'flac', 'm4a'].includes(getFileExtension(file.name));
  return mimeValid || extValid;
};

export default function BulkAudiovisualImport({ onSuccess }: BulkAudiovisualImportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("");
  const [results, setResults] = useState<ImportResult[]>([]);
  const [defaultMediaType, setDefaultMediaType] = useState<string>("video");
  
  // Transcription options
  const [enableTranscription, setEnableTranscription] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("fr");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const speechRecognitionSupported = !!SpeechRecognition;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(e.target.files || []);
    if (pickedFiles.length === 0) return;

    e.target.value = "";

    const validFiles = pickedFiles.filter(isValidMediaFile);

    if (validFiles.length !== pickedFiles.length) {
      toast({
        title: "Attention",
        description: `${pickedFiles.length - validFiles.length} fichier(s) non audio/vidéo ont été ignorés`,
        variant: "destructive",
      });
    }

    const merged = (() => {
      const byKey = new Map<string, File>();
      [...mediaFiles, ...validFiles].forEach((f) => {
        byKey.set(`${f.name}-${f.size}-${f.lastModified}`, f);
      });
      return Array.from(byKey.values());
    })();

    setMediaFiles(merged);
    setResults([]);

    toast({
      title: "Fichiers ajoutés",
      description: `${merged.length} fichier(s) audio/vidéo sélectionné(s)`,
    });
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setMediaFiles([]);
    setResults([]);
  };

  // Transcribe audio/video using Web Speech API (FREE)
  // NOTE: This requires microphone permission which may not work in iframes
  const transcribeMedia = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
        resolve('');
        return;
      }

      const mediaType = getMediaTypeFromMime(file.type) || 
        (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(getFileExtension(file.name)) ? 'audio' : 'video');

      // Create media element
      const element = document.createElement(mediaType) as HTMLMediaElement;
      element.preload = 'auto';
      element.src = URL.createObjectURL(file);
      element.muted = false;
      element.volume = 0.1; // Low volume to not disturb

      let recognition: any = null;
      let transcript = '';
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let recognitionFailed = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (recognition) {
          try { recognition.stop(); } catch (e) { /* ignore */ }
        }
        try { element.pause(); } catch (e) { /* ignore */ }
        URL.revokeObjectURL(element.src);
      };

      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = transcriptionLanguage === 'fr' ? 'fr-FR' : 
                           transcriptionLanguage === 'ar' ? 'ar-MA' :
                           transcriptionLanguage === 'en' ? 'en-US' : 'es-ES';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Recognition error:', event.error);
          // Critical errors that should stop the process
          if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
            recognitionFailed = true;
            cleanup();
            resolve(''); // Resolve immediately on permission errors
          }
        };

        recognition.onend = () => {
          // Only restart if media is still playing and recognition hasn't failed
          if (!element.paused && !element.ended && !recognitionFailed) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore restart errors
            }
          }
        };

      } catch (e) {
        console.error('Failed to create recognition:', e);
        URL.revokeObjectURL(element.src);
        resolve('');
        return;
      }

      element.onloadedmetadata = () => {
        const duration = element.duration;
        
        // Set a timeout based on media duration (max 2 minutes for transcription)
        const maxTranscriptionTime = Math.min(duration * 1000, 120000);
        
        timeoutId = setTimeout(() => {
          cleanup();
          resolve(transcript.trim());
        }, maxTranscriptionTime + 5000);

        // Start playback and recognition
        element.play().then(() => {
          if (recognitionFailed) {
            cleanup();
            resolve('');
            return;
          }
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to start recognition:', e);
            cleanup();
            resolve('');
          }
        }).catch(err => {
          console.error('Failed to play media:', err);
          cleanup();
          resolve('');
        });
      };

      element.onended = () => {
        cleanup();
        resolve(transcript.trim());
      };

      element.onerror = () => {
        cleanup();
        resolve('');
      };
    });
  };

  const getMediaDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const mediaType = getMediaTypeFromMime(file.type) || 
        (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(getFileExtension(file.name)) ? 'audio' : 'video');
      
      const element = document.createElement(mediaType);
      element.preload = 'metadata';
      
      element.onloadedmetadata = () => {
        const duration = element.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        URL.revokeObjectURL(element.src);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      element.onerror = () => {
        URL.revokeObjectURL(element.src);
        resolve('N/A');
      };
      
      element.src = URL.createObjectURL(file);
    });
  };

  const processImport = async () => {
    if (mediaFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const importResults: ImportResult[] = [];

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const fileName = file.name;
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const extension = getFileExtension(fileName).toUpperCase();
      
      setCurrentFile(fileName);
      setProgress(Math.round((i / mediaFiles.length) * 100));

      try {
        // Get media duration
        setCurrentStep("Analyse de la durée...");
        const duration = await getMediaDuration(file);
        
        // Determine media type
        const detectedType = getMediaTypeFromMime(file.type) || 
          (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(getFileExtension(fileName)) ? 'audio' : 'video');
        
        const documentType = detectedType === 'audio' ? 'audio' : 'video';

        // Transcription (if enabled) - with timeout protection
        let transcription = '';
        if (enableTranscription && speechRecognitionSupported) {
          setCurrentStep("Transcription en cours...");
          setIsTranscribing(true);
          try {
            // Add a global timeout to prevent infinite waiting
            transcription = await Promise.race([
              transcribeMedia(file),
              new Promise<string>((resolve) => setTimeout(() => resolve(''), 30000)) // 30s max
            ]);
          } catch (e) {
            console.warn('Transcription failed:', e);
            transcription = '';
          }
          setIsTranscribing(false);
        }

        // Upload file
        setCurrentStep("Téléversement...");

        // Sanitize filename for storage
        setCurrentStep("Enregistrement...");
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `audiovisual/${Date.now()}-${sanitizedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(storagePath);

        const mediaUrl = urlData?.publicUrl;

        // Create CBN document entry
        const { data: newCbn, error: cbnError } = await supabase
          .from('cbn_documents')
          .insert({
            cote: `AV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: baseName,
            document_type: documentType,
            support_type: detectedType === 'audio' ? 'audio' : 'video',
            is_digitized: true,
          })
          .select('id')
          .single();

        if (cbnError) throw cbnError;

        // Create digital library document
        const { error: docError } = await supabase
          .from('digital_library_documents')
          .insert({
            cbn_document_id: newCbn.id,
            title: baseName,
            document_type: documentType,
            pdf_url: mediaUrl, // Reusing pdf_url field for media URL
            file_format: extension,
            file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
            digitization_source: 'internal',
            publication_status: 'draft',
            pages_count: 1, // Not applicable for AV, set to 1
          });

        if (docError) throw docError;

        // Save transcription as OCR page if available
        if (transcription) {
          const { data: docData } = await supabase
            .from('digital_library_documents')
            .select('id')
            .eq('cbn_document_id', newCbn.id)
            .single();

          if (docData) {
            await supabase
              .from('digital_library_pages')
              .insert({
                document_id: docData.id,
                page_number: 1,
                ocr_text: transcription
              });

            await supabase
              .from('digital_library_documents')
              .update({ ocr_processed: true })
              .eq('id', docData.id);
          }
        }

        importResults.push({
          fileName,
          title: baseName,
          status: 'success',
          message: transcription ? `Importé avec transcription (${duration})` : `Importé avec succès (${duration})`,
          mediaType: documentType,
          duration,
          transcription: transcription ? transcription.substring(0, 100) + (transcription.length > 100 ? '...' : '') : undefined,
        });

      } catch (error: any) {
        console.error(`Error importing ${fileName}:`, error);
        importResults.push({
          fileName,
          title: baseName,
          status: 'error',
          message: error.message || 'Erreur inconnue',
        });
      }
    }

    setProgress(100);
    setResults(importResults);
    setIsProcessing(false);
    setIsTranscribing(false);
    setCurrentFile("");
    setCurrentStep("");
    setCurrentFile("");

    const successCount = importResults.filter(r => r.status === 'success').length;
    const errorCount = importResults.filter(r => r.status === 'error').length;

    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });

    toast({
      title: "Import terminé",
      description: `${successCount} fichier(s) importé(s), ${errorCount} erreur(s)`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    if (successCount > 0) {
      onSuccess?.();
    }
  };

  const exportResultsReport = () => {
    if (results.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      'Fichier': r.fileName,
      'Titre': r.title,
      'Type': r.mediaType || '-',
      'Durée': r.duration || '-',
      'Statut': r.status === 'success' ? 'Succès' : 'Erreur',
      'Message': r.message,
      'Transcription': r.transcription || '-',
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_import_audiovisuel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  const getFileIcon = (file: File) => {
    const type = getMediaTypeFromMime(file.type) || 
      (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(getFileExtension(file.name)) ? 'audio' : 'video');
    return type === 'audio' ? <Music className="h-4 w-4 text-muted-foreground shrink-0" /> 
                            : <Video className="h-4 w-4 text-muted-foreground shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <Film className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <strong>Formats supportés :</strong> MP4, WebM, MOV, AVI (vidéo) | MP3, WAV, AAC, FLAC, M4A (audio)
        </AlertDescription>
      </Alert>

      {/* Transcription Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Options de transcription
          </CardTitle>
          <CardDescription>
            Transcription automatique gratuite via la reconnaissance vocale du navigateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-transcription" className="text-base">
                Activer la transcription automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                {speechRecognitionSupported 
                  ? "Le fichier sera lu et transcrit pendant l'import (max 2 min par fichier)"
                  : "Non supporté par ce navigateur (utilisez Chrome, Edge ou Safari)"}
              </p>
            </div>
            <Switch
              id="enable-transcription"
              checked={enableTranscription}
              onCheckedChange={setEnableTranscription}
              disabled={!speechRecognitionSupported}
            />
          </div>

          {enableTranscription && (
            <div className="flex items-center gap-4 pt-2 border-t">
              <Label htmlFor="transcription-language" className="shrink-0">Langue :</Label>
              <Select value={transcriptionLanguage} onValueChange={setTranscriptionLanguage}>
                <SelectTrigger id="transcription-language" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!speechRecognitionSupported && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La transcription automatique nécessite Chrome, Edge ou Safari.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Film className="h-5 w-5" />
            Sélectionner les fichiers audio/vidéo
          </CardTitle>
          <CardDescription>
            Le nom du fichier sera utilisé comme titre provisoire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Video className="h-10 w-10 text-muted-foreground" />
              <Music className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Cliquez pour sélectionner vos fichiers audio/vidéo
            </p>
            <p className="text-xs text-muted-foreground">Sélection multiple autorisée</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/flac,audio/x-m4a,.mp3,.mp4,.wav,.webm,.ogg,.mov,.avi,.aac,.flac,.m4a,.mkv"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
            {mediaFiles.length > 0 && (
              <Badge variant="secondary" className="mt-2">
                {mediaFiles.length} fichier(s) sélectionné(s)
              </Badge>
            )}
          </div>

          {/* File List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Fichiers à importer :</p>
                <Button variant="ghost" size="sm" onClick={clearAllFiles}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Tout effacer
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-1">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-sm p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file)}
                        <span className="font-mono truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(idx)}
                        className="shrink-0"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{currentFile || "Import en cours..."}</span>
                  {isTranscribing && (
                    <Badge variant="secondary" className="animate-pulse shrink-0">
                      <Mic className="h-3 w-3 mr-1" />
                      Transcription
                    </Badge>
                  )}
                </div>
                <span className="shrink-0">{progress}%</span>
              </div>
              {currentStep && (
                <p className="text-xs text-muted-foreground">{currentStep}</p>
              )}
              <Progress value={progress} />
            </div>
          )}

          <Button
            onClick={processImport}
            disabled={mediaFiles.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importer {mediaFiles.length} fichier(s)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Résultats de l'import</CardTitle>
              <CardDescription>
                {successCount} succès, {errorCount} erreurs
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportResultsReport}>
              <FileDown className="h-4 w-4 mr-2" />
              Exporter le rapport
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-20">Durée</TableHead>
                    <TableHead className="w-24">Statut</TableHead>
                    <TableHead>Message</TableHead>
                    {enableTranscription && <TableHead className="w-40">Transcription</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {result.fileName}
                      </TableCell>
                      <TableCell>
                        {result.mediaType === 'audio' ? (
                          <Badge variant="outline" className="gap-1">
                            <Music className="h-3 w-3" /> Audio
                          </Badge>
                        ) : result.mediaType === 'video' ? (
                          <Badge variant="outline" className="gap-1">
                            <Video className="h-3 w-3" /> Vidéo
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {result.duration || '-'}
                      </TableCell>
                      <TableCell>
                        {result.status === 'success' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erreur
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.message}
                      </TableCell>
                      {enableTranscription && (
                        <TableCell className="text-sm">
                          {result.transcription ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3 text-green-600" />
                              <span className="truncate max-w-32" title={result.transcription}>
                                {result.transcription}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
