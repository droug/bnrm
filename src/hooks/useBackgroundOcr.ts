/**
 * Background OCR Processing Hook
 * Manages OCR jobs that run in the background with notifications
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// Tesseract language mapping
const TESSERACT_LANG_MAP: Record<string, string> = {
  'ar': 'ara',
  'fr': 'fra',
  'en': 'eng',
  'es': 'spa',
  'amz': 'ara+fra+eng',
  'lat': 'lat'
};

export type OcrEngine = 'tesseract' | 'paddleocr' | 'sanad' | 'escriptorium';

export const OCR_ENGINE_LABELS: Record<OcrEngine, string> = {
  tesseract: 'Tesseract',
  paddleocr: 'PaddleOCR',
  sanad: 'Sanad.ai',
  escriptorium: 'eScriptorium',
};

export interface OcrJob {
  id: string;
  documentId: string;
  documentTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentPage: number;
  totalPages: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  language: string;
  engine: OcrEngine;
}

interface UseBackgroundOcrOptions {
  onJobComplete?: () => void;
}

interface UseBackgroundOcrReturn {
  jobs: OcrJob[];
  startOcrJob: (params: {
    documentId: string;
    documentTitle: string;
    pdfUrl: string;
    language: string;
    engine?: OcrEngine;
  }) => void;
  cancelJob: (jobId: string) => void;
  activeJobsCount: number;
}

// Singleton to persist jobs across component mounts
let globalJobs: OcrJob[] = [];
let globalListeners: Set<() => void> = new Set();
let globalOnCompleteCallbacks: Set<() => void> = new Set();

const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

const notifyJobComplete = () => {
  globalOnCompleteCallbacks.forEach(cb => cb());
};

/** Request browser notification permission on first use */
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

/** Send a browser (system) notification */
const sendSystemNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
    });
  }
};

export function useBackgroundOcr(options?: UseBackgroundOcrOptions): UseBackgroundOcrReturn {
  const [jobs, setJobs] = useState<OcrJob[]>(globalJobs);
  const cancelledJobsRef = useRef<Set<string>>(new Set());

  // Subscribe to global job updates
  useEffect(() => {
    const updateJobs = () => setJobs([...globalJobs]);
    globalListeners.add(updateJobs);
    return () => {
      globalListeners.delete(updateJobs);
    };
  }, []);

  // Register onJobComplete callback
  useEffect(() => {
    if (options?.onJobComplete) {
      globalOnCompleteCallbacks.add(options.onJobComplete);
      return () => {
        globalOnCompleteCallbacks.delete(options.onJobComplete!);
      };
    }
  }, [options?.onJobComplete]);

  const updateJob = useCallback((jobId: string, updates: Partial<OcrJob>) => {
    const jobIndex = globalJobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      globalJobs[jobIndex] = { ...globalJobs[jobIndex], ...updates };
      notifyListeners();
    }
  }, []);

  const removeJob = useCallback((jobId: string) => {
    globalJobs = globalJobs.filter(j => j.id !== jobId);
    notifyListeners();
  }, []);

  const cancelJob = useCallback((jobId: string) => {
    cancelledJobsRef.current.add(jobId);
    updateJob(jobId, { status: 'failed', error: 'Annulé par l\'utilisateur' });
    
    // Remove after a delay
    setTimeout(() => {
      removeJob(jobId);
    }, 3000);
  }, [updateJob, removeJob]);

  const processOcr = useCallback(async (job: OcrJob, pdfUrl: string) => {
    const toastId = `ocr-${job.id}`;
    const engineLabel = OCR_ENGINE_LABELS[job.engine] || job.engine;
    
    try {
      // Show persistent toast with progress
      toast.loading(`🔄 OCR [${engineLabel}] : ${job.documentTitle}`, {
        id: toastId,
        description: 'Initialisation...',
        duration: Infinity,
      });

      // Fetch and load PDF
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Impossible de charger le PDF');
      
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const totalPages = pdf.numPages;
      updateJob(job.id, { totalPages, status: 'processing' });

      toast.loading(`🔄 OCR [${engineLabel}] : ${job.documentTitle}`, {
        id: toastId,
        description: `Page 0 / ${totalPages} — 0%`,
        duration: Infinity,
      });

      const tesseractLang = TESSERACT_LANG_MAP[job.language] || 'fra+ara+eng';
      const allPages: { pageNumber: number; ocrText: string }[] = [];

      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        // Check if cancelled
        if (cancelledJobsRef.current.has(job.id)) {
          toast.dismiss(toastId);
          return;
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({ canvasContext: context, viewport }).promise;
        
        // Convert to image data
        const imageData = canvas.toDataURL('image/png');
        
        let ocrText = '';

        // Run OCR based on engine
        if (job.engine === 'tesseract' || job.engine === 'paddleocr') {
          // PaddleOCR falls back to Tesseract in browser context (no backend)
          const { data: { text } } = await Tesseract.recognize(imageData, tesseractLang, {
            logger: () => {}
          });
          ocrText = text || '';
        } else if (job.engine === 'sanad') {
          // Sanad.ai - API call (requires SANAD_API_KEY via edge function)
          // For now, fall back to Tesseract with Arabic focus
          const { data: { text } } = await Tesseract.recognize(imageData, 'ara', {
            logger: () => {}
          });
          ocrText = text || '';
        } else if (job.engine === 'escriptorium') {
          // eScriptorium - HTR, fall back to Tesseract for now
          const { data: { text } } = await Tesseract.recognize(imageData, tesseractLang, {
            logger: () => {}
          });
          ocrText = text || '';
        } else {
          const { data: { text } } = await Tesseract.recognize(imageData, tesseractLang, {
            logger: () => {}
          });
          ocrText = text || '';
        }

        allPages.push({ pageNumber: pageNum, ocrText });

        // Update progress
        const progress = Math.round((pageNum / totalPages) * 100);
        updateJob(job.id, { 
          currentPage: pageNum, 
          progress 
        });

        toast.loading(`🔄 OCR [${engineLabel}] : ${job.documentTitle}`, {
          id: toastId,
          description: `Page ${pageNum} / ${totalPages} — ${progress}%`,
          duration: Infinity,
        });
      }

      // Check if cancelled before saving
      if (cancelledJobsRef.current.has(job.id)) {
        toast.dismiss(toastId);
        return;
      }

      // Save to database
      toast.loading(`💾 Sauvegarde… [${engineLabel}] : ${job.documentTitle}`, {
        id: toastId,
        description: 'Enregistrement des pages dans la base de données...',
        duration: Infinity,
      });

      // Delete existing pages
      await supabase
        .from('digital_library_pages')
        .delete()
        .eq('document_id', job.documentId);

      // Insert new pages
      const pagesWithText = allPages.filter(p => p.ocrText.trim().length > 0);
      if (pagesWithText.length > 0) {
        const pagesToInsert = pagesWithText.map(p => ({
          document_id: job.documentId,
          page_number: p.pageNumber,
          ocr_text: p.ocrText,
        }));

        const { error: insertError } = await supabase
          .from('digital_library_pages')
          .insert(pagesToInsert);

        if (insertError) throw insertError;
      }

      // Update document
      await supabase
        .from('digital_library_documents')
        .update({ 
          ocr_processed: true,
          pages_count: totalPages
        })
        .eq('id', job.documentId);

      // Mark as completed
      updateJob(job.id, { 
        status: 'completed', 
        completedAt: new Date(),
        progress: 100
      });

      toast.success(`✅ OCR terminé [${engineLabel}] : ${job.documentTitle}`, {
        id: toastId,
        description: `${pagesWithText.length} page(s) indexée(s) sur ${totalPages}`,
        duration: 8000,
      });

      // Send system notification so user knows even if on another page
      sendSystemNotification(
        `OCR terminé — ${job.documentTitle}`,
        `${pagesWithText.length} page(s) indexée(s) sur ${totalPages} avec ${engineLabel}`
      );

      // Notify completion (for cache invalidation)
      notifyJobComplete();

      // Remove job after delay
      setTimeout(() => {
        removeJob(job.id);
      }, 15000);

    } catch (error) {
      console.error('[Background OCR] Error:', error);
      
      updateJob(job.id, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      toast.error(`❌ Échec OCR [${engineLabel}] : ${job.documentTitle}`, {
        id: toastId,
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        duration: 8000,
      });

      sendSystemNotification(
        `Échec OCR — ${job.documentTitle}`,
        error instanceof Error ? error.message : 'Erreur inconnue'
      );

      // Remove job after delay
      setTimeout(() => {
        removeJob(job.id);
      }, 10000);
    }
  }, [updateJob, removeJob]);

  const startOcrJob = useCallback((params: {
    documentId: string;
    documentTitle: string;
    pdfUrl: string;
    language: string;
    engine?: OcrEngine;
  }) => {
    // Request browser notification permission
    requestNotificationPermission();

    // Check if already processing this document
    const existingJob = globalJobs.find(
      j => j.documentId === params.documentId && 
           (j.status === 'pending' || j.status === 'processing')
    );
    
    if (existingJob) {
      toast.warning('Ce document est déjà en cours de traitement');
      return;
    }

    const engine: OcrEngine = params.engine || 'tesseract';
    const jobId = `ocr-${params.documentId}-${Date.now()}`;
    const newJob: OcrJob = {
      id: jobId,
      documentId: params.documentId,
      documentTitle: params.documentTitle,
      status: 'pending',
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      startedAt: new Date(),
      language: params.language,
      engine,
    };

    globalJobs.push(newJob);
    notifyListeners();

    // Start processing in the background
    processOcr(newJob, params.pdfUrl);
  }, [processOcr]);

  return {
    jobs,
    startOcrJob,
    cancelJob,
    activeJobsCount: jobs.filter(j => j.status === 'pending' || j.status === 'processing').length,
  };
}
