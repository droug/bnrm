import { useState, useCallback, useRef } from 'react';

interface TranscriptionResult {
  text: string;
  chunks?: Array<{
    text: string;
    timestamp: [number, number];
  }>;
}

interface TranscriptionProgress {
  status: 'idle' | 'loading-model' | 'transcribing' | 'complete' | 'error';
  progress: number;
  message: string;
}

/**
 * Hook for local Whisper transcription using Transformers.js
 * Runs entirely in the browser - no server required, 100% free
 */
export function useLocalWhisperTranscription() {
  const [progress, setProgress] = useState<TranscriptionProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const pipelineRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const transcribe = useCallback(async (
    audioSource: File | Blob | string,
    language?: string
  ): Promise<TranscriptionResult | null> => {
    setIsTranscribing(true);
    abortControllerRef.current = new AbortController();

    try {
      setProgress({
        status: 'loading-model',
        progress: 5,
        message: 'Chargement du modèle Whisper (première fois peut prendre 1-2 min)...'
      });

      // Dynamically import transformers.js to avoid loading on page load
      const { pipeline, read_audio } = await import('@huggingface/transformers');

      setProgress({
        status: 'loading-model',
        progress: 15,
        message: 'Téléchargement du modèle Whisper Tiny (39 MB)...'
      });

      // Create or reuse pipeline
      // Using whisper-tiny for fast browser performance (supports Arabic, French, English)
      if (!pipelineRef.current) {
        pipelineRef.current = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-tiny',
          {
            dtype: 'q8', // Quantized for smaller size and faster inference
            progress_callback: (info: any) => {
              if (info.status === 'progress' && info.progress) {
                setProgress({
                  status: 'loading-model',
                  progress: 15 + Math.min(info.progress * 0.3, 30),
                  message: `Téléchargement: ${Math.round(info.progress)}%`
                });
              }
            }
          }
        );
      }

      setProgress({
        status: 'transcribing',
        progress: 50,
        message: 'Préparation de l\'audio...'
      });

      // Get audio URL for read_audio function
      let audioUrl: string;
      
      if (typeof audioSource === 'string') {
        // Already a URL
        audioUrl = audioSource;
      } else {
        // File or Blob - create a blob URL
        audioUrl = URL.createObjectURL(audioSource);
      }

      // Use read_audio to properly decode the audio file to Float32Array
      // Whisper expects 16kHz audio
      console.log('Reading audio from URL:', audioUrl);
      const audioData = await read_audio(audioUrl, 16000);
      console.log('Audio data type:', audioData.constructor.name, 'length:', audioData.length);

      // Clean up blob URL if we created one
      if (typeof audioSource !== 'string') {
        URL.revokeObjectURL(audioUrl);
      }

      setProgress({
        status: 'transcribing',
        progress: 60,
        message: 'Transcription en cours...'
      });

      // Prepare transcription options
      const options: any = {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      };

      // Set language if specified (Whisper supports: ar, fr, en, etc.)
      if (language && language !== 'auto') {
        options.language = language;
        options.task = 'transcribe';
      }

      // Run transcription with properly decoded audio
      const result = await pipelineRef.current(audioData, options);

      setProgress({
        status: 'complete',
        progress: 100,
        message: 'Transcription terminée!'
      });

      // Format result
      const transcriptionResult: TranscriptionResult = {
        text: result.text || '',
        chunks: result.chunks?.map((chunk: any) => ({
          text: chunk.text,
          timestamp: chunk.timestamp
        }))
      };

      return transcriptionResult;

    } catch (error: any) {
      console.error('Local Whisper transcription error:', error);
      
      // Check for common errors
      let errorMessage = error.message || 'Erreur de transcription';
      
      if (error.message?.includes('WebGPU')) {
        errorMessage = 'WebGPU non supporté. La transcription utilise WASM.';
      } else if (error.message?.includes('SharedArrayBuffer')) {
        errorMessage = 'Certaines fonctionnalités du navigateur ne sont pas disponibles. Essayez avec Chrome ou Edge.';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Erreur d\'accès au fichier audio. Vérifiez les permissions.';
      } else if (error.message?.includes('read_audio') || error.message?.includes('decode')) {
        errorMessage = 'Format audio non supporté. Essayez avec un fichier MP3, WAV ou WebM.';
      }

      setProgress({
        status: 'error',
        progress: 0,
        message: errorMessage
      });

      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTranscribing(false);
    setProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  return {
    transcribe,
    cancel,
    reset,
    progress,
    isTranscribing
  };
}
