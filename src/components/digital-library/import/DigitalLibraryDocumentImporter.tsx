import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Upload, FileSearch, UploadCloud, Wand2, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, Film, Mic, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import BulkDocumentImport from "./BulkDocumentImport";
import BulkPdfImport from "./BulkPdfImport";
import BulkAudiovisualImport from "./BulkAudiovisualImport";
import OcrImportTool from "./OcrImportTool";
import AudiovisualTranscriptionTool from "./AudiovisualTranscriptionTool";
import { MultiEngineOcrTool } from "../ocr-multiengine";

interface DigitalLibraryDocumentImporterProps {
  defaultTab?: string;
  onSuccess?: () => void;
}

export default function DigitalLibraryDocumentImporter({ 
  defaultTab = "single",
  onSuccess 
}: DigitalLibraryDocumentImporterProps) {
  const { toast } = useToast();
  const [batchOcrRunning, setBatchOcrRunning] = useState(false);
  const [batchOcrResult, setBatchOcrResult] = useState<any>(null);

  const handleBatchOcr = async () => {
    setBatchOcrRunning(true);
    setBatchOcrResult(null);

    try {
      // Utiliser l'URL de base du site
      const baseUrl = window.location.origin;

      const { data, error } = await supabase.functions.invoke('batch-ocr-indexing', {
        body: {
          language: 'ar',
          baseUrl
        }
      });

      if (error) {
        throw error;
      }

      setBatchOcrResult(data);
      toast({
        title: "Indexation OCR terminée",
        description: `${data.totalPagesProcessed} pages traitées`
      });
    } catch (error: any) {
      console.error('Batch OCR error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      setBatchOcrResult({ error: error.message });
    } finally {
      setBatchOcrRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600">
                <UploadCloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Import de documents</CardTitle>
                <CardDescription>
                  Importez des documents dans la bibliothèque numérique avec leurs métadonnées
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleBatchOcr}
              disabled={batchOcrRunning}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {batchOcrRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  OCR en cours...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  OCR Auto (tous)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {batchOcrResult && (
          <CardContent>
            {batchOcrResult.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{batchOcrResult.error}</AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Indexation terminée</AlertTitle>
                <AlertDescription className="text-green-700">
                  <p>{batchOcrResult.totalPagesProcessed} pages traitées sur {batchOcrResult.maxPagesPerRun} max par exécution.</p>
                  {batchOcrResult.documents?.map((doc: any, i: number) => (
                    <div key={i} className="mt-1 text-xs">
                      • <strong>{doc.title}</strong>: {doc.pagesProcessed} pages indexées
                      {doc.errors?.length > 0 && ` (${doc.errors.length} erreurs)`}
                    </div>
                  ))}
                  {batchOcrResult.totalPagesProcessed >= batchOcrResult.maxPagesPerRun && (
                    <p className="mt-2 font-medium">Relancez pour continuer l'indexation des pages restantes.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="bulk-pdf" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Document</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-av" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Audio/Vidéo</span>
            <span className="sm:hidden">AV</span>
          </TabsTrigger>
          <TabsTrigger value="transcription" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Transcription</span>
            <span className="sm:hidden">STT</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">OCR</span>
          </TabsTrigger>
          <TabsTrigger value="ocr-multi" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">Multi-OCR</span>
            <span className="sm:hidden">HTR</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-pdf">
          <BulkPdfImport onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="bulk-av">
          <BulkAudiovisualImport onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="transcription">
          <AudiovisualTranscriptionTool />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkDocumentImport onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="ocr">
          <OcrImportTool />
        </TabsContent>

        <TabsContent value="ocr-multi">
          <MultiEngineOcrTool onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
