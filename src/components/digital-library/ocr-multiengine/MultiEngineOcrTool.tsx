import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@iconify/react";
import { useOcrProviders } from "./hooks/useOcrProviders";
import { TesseractProvider } from "./providers/TesseractProvider";
import { PaddleOcrProvider } from "./providers/PaddleOcrProvider";
import PaddleOcrTool from "./PaddleOcrTool";
import { OcrDocumentType, OcrProvider } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Extend OcrProvider type to include paddleocr
type ExtendedOcrProvider = OcrProvider | 'paddleocr';

interface MultiEngineOcrToolProps {
  onSuccess?: () => void;
}

export default function MultiEngineOcrTool({ onSuccess }: MultiEngineOcrToolProps) {
  const { providers, isLoading } = useOcrProviders();
  const [documentType, setDocumentType] = useState<OcrDocumentType>('printed');
  const [selectedProvider, setSelectedProvider] = useState<OcrProvider | 'auto'>('auto');
  const [cloudAllowed, setCloudAllowed] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("none");
  const [batchDocuments, setBatchDocuments] = useState<any[]>([]);

  // Fetch distinct batch names
  const { data: batchNames } = useQuery({
    queryKey: ['ocr-batch-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('batch_name')
        .not('batch_name', 'is', null)
        .order('batch_name');
      if (error) throw error;
      const unique = [...new Set((data || []).map(d => d.batch_name).filter(Boolean))];
      return unique as string[];
    }
  });

  // Fetch documents for selected batch
  useEffect(() => {
    if (selectedBatch && selectedBatch !== "none") {
      supabase
        .from('digital_library_documents')
        .select('id, title, document_type, file_url, thumbnail_url, pages_count')
        .eq('batch_name', selectedBatch)
        .order('title')
        .then(({ data }) => setBatchDocuments(data || []));
    } else {
      setBatchDocuments([]);
    }
  }, [selectedBatch]);

  const getRecommendedProvider = (): OcrProvider => {
    if (documentType === 'handwritten') return 'escriptorium';
    return 'tesseract';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const provider = selectedProvider === 'auto' ? getRecommendedProvider() : selectedProvider;
      
      if (provider === 'tesseract') {
        for (let i = 0; i < files.length; i++) {
          const result = await TesseractProvider.recognize(files[i], { languages: ['ara'] });
          setResults(prev => [...prev, { page: i + 1, ...result }]);
          setProgress(((i + 1) / files.length) * 100);
        }
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
      await TesseractProvider.terminate();
    }
  };

  const enabledProviders = providers?.filter(p => p.is_enabled) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Icon icon="mdi:text-recognition" className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>OCR Multi-Moteurs Arabe</CardTitle>
              <CardDescription>Tesseract (imprimé) • Sanad.ai (cloud) • eScriptorium/Kraken (manuscrits) • PaddleOCR (multilingue)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de document</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as OcrDocumentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="printed">📄 Imprimé</SelectItem>
                  <SelectItem value="handwritten">✍️ Manuscrit (HTR)</SelectItem>
                  <SelectItem value="mixed">📑 Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Moteur OCR</Label>
              <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as OcrProvider | 'auto')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🤖 AUTO (recommandé: {getRecommendedProvider()})</SelectItem>
                  <SelectItem value="tesseract">Tesseract (local)</SelectItem>
                  <SelectItem value="sanad" disabled={!cloudAllowed}>Sanad.ai (cloud)</SelectItem>
                  <SelectItem value="escriptorium">eScriptorium/Kraken</SelectItem>
                  <SelectItem value="paddleocr">🏓 PaddleOCR (multilingue)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cloud autorisé</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={cloudAllowed} onCheckedChange={setCloudAllowed} />
                <span className="text-sm text-muted-foreground">{cloudAllowed ? 'Oui' : 'Non'}</span>
              </div>
            </div>
          </div>

          {/* Sélection par Lot */}
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:folder-multiple" className="h-5 w-5 text-primary" />
                <Label className="font-semibold">Charger un lot de documents</Label>
              </div>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un lot..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucun lot —</SelectItem>
                  {(batchNames || []).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {batchDocuments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {batchDocuments.length} document(s) dans ce lot
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {batchDocuments.map(doc => (
                      <Badge key={doc.id} variant="outline" className="text-xs">
                        {doc.title} {doc.pages_count ? `(${doc.pages_count}p)` : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload manuel */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="ocr-files" />
            <label htmlFor="ocr-files" className="cursor-pointer">
              <Icon icon="mdi:cloud-upload" className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 font-medium">Glissez vos fichiers ou cliquez pour sélectionner</p>
              <p className="text-sm text-muted-foreground">PDF, JPG, PNG, TIFF</p>
            </label>
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {files.map((f, i) => (
                  <Badge key={i} variant="secondary">{f.name}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">Traitement en cours... {Math.round(progress)}%</p>
            </div>
          )}

          <Button onClick={handleProcess} disabled={files.length === 0 || isProcessing} className="w-full">
            {isProcessing ? 'Traitement...' : 'Lancer l\'OCR'}
          </Button>

          {/* Résultats */}
          {results.length > 0 && (
            <Tabs defaultValue="text" className="mt-6">
              <TabsList>
                <TabsTrigger value="text">Texte</TabsTrigger>
                <TabsTrigger value="quality">Qualité</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto" dir="rtl">
                  {results.map((r, i) => (
                    <div key={i} className="mb-4">
                      <Badge className="mb-2">Page {r.page}</Badge>
                      <p className="whitespace-pre-wrap font-arabic">{r.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="quality" className="mt-4">
                {results.map((r, i) => (
                  <Alert key={i} className="mb-2">
                    <AlertDescription>
                      Page {r.page}: Confiance {r.confidence?.toFixed(1)}% • {r.processingTimeMs}ms
                    </AlertDescription>
                  </Alert>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Section PaddleOCR dédiée */}
      <div className="border rounded-lg p-1 bg-muted/10">
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Icon icon="simple-icons:paddlepaddle" className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">PaddleOCR — Outil de test dédié</span>
          <Badge variant="outline" className="text-xs">PP-OCRv4</Badge>
        </div>
        <div className="p-4">
          <PaddleOcrTool onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
