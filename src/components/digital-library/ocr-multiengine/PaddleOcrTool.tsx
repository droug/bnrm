/**
 * PaddleOcrTool — Interface de test pour PaddleOCR
 * Outil dédié au test et à la configuration du moteur PaddleOCR
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { PaddleOcrProvider, PaddleOcrResult, PaddleOcrOptions } from "./providers/PaddleOcrProvider";
import { CheckCircle2, AlertTriangle, Info, Download, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaddleOcrToolProps {
  onSuccess?: () => void;
}

type PaddleLanguage = 'ar' | 'fr' | 'en' | 'ar+fr' | 'ar+en' | 'ar+fr+en';
type DetModel = 'DB_server' | 'DB_mobile';
type RecModel = 'SVTR_LCNet' | 'PP-OCRv4';

export default function PaddleOcrTool({ onSuccess }: PaddleOcrToolProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<(PaddleOcrResult & { fileName: string })[]>([]);
  const [serverUrl, setServerUrl] = useState('');
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  // Options PaddleOCR
  const [language, setLanguage] = useState<PaddleLanguage>('ar');
  const [useAngleClassifier, setUseAngleClassifier] = useState(true);
  const [detModel, setDetModel] = useState<DetModel>('DB_server');
  const [recModel, setRecModel] = useState<RecModel>('PP-OCRv4');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleCheckServer = async () => {
    if (!serverUrl) return;
    setIsCheckingServer(true);
    const isOnline = await PaddleOcrProvider.checkServerHealth(serverUrl);
    setServerStatus(isOnline ? 'online' : 'offline');
    setIsCheckingServer(false);
    toast({
      title: isOnline ? 'Serveur en ligne' : 'Serveur non accessible',
      description: isOnline
        ? `PaddleOCR Server répond sur ${serverUrl}`
        : `Impossible de joindre ${serverUrl}`,
      variant: isOnline ? 'default' : 'destructive',
    });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const options: Partial<PaddleOcrOptions> = {
      language,
      useAngleClassifier,
      detModel,
      recModel,
      serverUrl: serverUrl || undefined,
    };

    try {
      const newResults: (PaddleOcrResult & { fileName: string })[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await PaddleOcrProvider.recognize(file, options);
        newResults.push({ ...result, fileName: file.name });
        setProgress(((i + 1) / files.length) * 100);
      }

      setResults(newResults);
      onSuccess?.();

      toast({
        title: 'OCR PaddleOCR terminé',
        description: `${files.length} fichier(s) traité(s) avec succès`,
      });
    } catch (error: any) {
      console.error('[PaddleOCR] Erreur:', error);
      toast({
        title: 'Erreur PaddleOCR',
        description: error.message || 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Texte copié dans le presse-papiers' });
  };

  const handleDownloadText = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, '') + '_paddleocr.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge variant="outline" className="border-primary/40 text-primary">{confidence.toFixed(1)}%</Badge>;
    if (confidence >= 70) return <Badge variant="secondary">{confidence.toFixed(1)}%</Badge>;
    return <Badge variant="destructive" className="opacity-80">{confidence.toFixed(1)}%</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md">
              <Icon icon="simple-icons:paddlepaddle" className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                PaddleOCR
                <Badge variant="outline" className="text-xs font-normal">TEST</Badge>
              </CardTitle>
              <CardDescription>
                Moteur OCR haute performance (Baidu PaddlePaddle) — PP-OCRv4 — Support arabe, français, multilingue
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info TEST MODE */}
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-foreground">Mode Test activé</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              PaddleOCR fonctionne en mode simulation. Pour activer le traitement réel, déployez un serveur PaddleOCR
              (<code className="bg-muted px-1 rounded text-xs">docker run -p 8866:8866 paddlepaddle/paddleocr:latest</code>)
              et renseignez son URL ci-dessous.
            </AlertDescription>
          </Alert>

          {/* Configuration serveur */}
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-2">
              <Icon icon="mdi:server" className="h-4 w-4" />
              URL du serveur PaddleOCR (optionnel)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="http://localhost:8866"
                value={serverUrl}
                onChange={(e) => { setServerUrl(e.target.value); setServerStatus('unknown'); }}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={handleCheckServer}
                disabled={!serverUrl || isCheckingServer}
                className="shrink-0"
              >
                {isCheckingServer ? (
                  <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon icon="mdi:check-network" className="h-4 w-4" />
                )}
                <span className="ml-1">Tester</span>
              </Button>
            </div>
            {serverStatus === 'online' && (
              <div className="flex items-center gap-1 text-sm text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Serveur en ligne — Mode réel activé
              </div>
            )}
            {serverStatus === 'offline' && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" /> Serveur non accessible — Mode test utilisé
              </div>
            )}
          </div>

          <Separator />

          {/* Options OCR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Langue(s)</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as PaddleLanguage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">🇲🇦 Arabe</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 Anglais</SelectItem>
                  <SelectItem value="ar+fr">🇲🇦+🇫🇷 Arabe + Français</SelectItem>
                  <SelectItem value="ar+en">🇲🇦+🇬🇧 Arabe + Anglais</SelectItem>
                  <SelectItem value="ar+fr+en">🌐 Multilingue (AR+FR+EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modèle de détection</Label>
              <Select value={detModel} onValueChange={(v) => setDetModel(v as DetModel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DB_server">DB_server (haute qualité)</SelectItem>
                  <SelectItem value="DB_mobile">DB_mobile (rapide)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modèle de reconnaissance</Label>
              <Select value={recModel} onValueChange={(v) => setRecModel(v as RecModel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PP-OCRv4">PP-OCRv4 (recommandé)</SelectItem>
                  <SelectItem value="SVTR_LCNet">SVTR_LCNet (léger)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Classificateur d'angle</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={useAngleClassifier} onCheckedChange={setUseAngleClassifier} />
                <span className="text-sm text-muted-foreground">{useAngleClassifier ? 'Activé' : 'Désactivé'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Zone d'upload */}
          <div className="space-y-3">
            <Label className="font-semibold">Fichiers à analyser</Label>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors bg-muted/20">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="paddle-ocr-files"
              />
              <label htmlFor="paddle-ocr-files" className="cursor-pointer">
                <Icon icon="mdi:file-image-plus" className="h-12 w-12 mx-auto text-primary/50" />
                <p className="mt-2 font-medium text-foreground">Glissez vos fichiers ou cliquez pour sélectionner</p>
                <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG, TIFF — Illimité</p>
              </label>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {files.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      <Icon icon="mdi:file" className="h-3 w-3" />
                      {f.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Traitement PaddleOCR en cours... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={files.length === 0 || isProcessing}
            className="w-full gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Icon icon="simple-icons:paddlepaddle" className="h-5 w-5" />
                Lancer PaddleOCR
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Résultats PaddleOCR — {results.length} fichier(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="result-0">
              <TabsList className="flex-wrap h-auto gap-1 mb-4">
                {results.map((r, i) => (
                  <TabsTrigger key={i} value={`result-${i}`} className="text-xs">
                    {r.fileName.length > 20 ? r.fileName.substring(0, 20) + '…' : r.fileName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.map((result, i) => (
                <TabsContent key={i} value={`result-${i}`} className="space-y-4">
                  {/* Méta */}
                  <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Icon icon="mdi:robot" className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Modèle :</span>
                      <span className="font-medium">{result.model}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Icon icon="mdi:translate" className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Langue :</span>
                      <span className="font-medium">{result.language}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Icon icon="mdi:timer" className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="font-medium">{result.processingTimeMs}ms</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Icon icon="mdi:percent" className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Confiance :</span>
                      {getConfidenceBadge(result.confidence)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Icon icon="mdi:format-list-bulleted" className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Lignes :</span>
                      <span className="font-medium">{result.lines.length}</span>
                    </div>
                  </div>

                  {/* Texte extrait */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Texte extrait</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyText(result.text)}
                          className="gap-1"
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          Copier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadText(result.text, result.fileName)}
                          className="gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Télécharger .txt
                        </Button>
                      </div>
                    </div>
                    <div
                      className="bg-muted/40 p-4 rounded-lg max-h-80 overflow-auto text-sm leading-relaxed font-mono border"
                      dir={language.startsWith('ar') ? 'rtl' : 'ltr'}
                    >
                      <pre className="whitespace-pre-wrap">{result.text}</pre>
                    </div>
                  </div>

                  {/* Détail par ligne */}
                  {result.lines.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-semibold">Détail par ligne ({result.lines.length})</Label>
                      <div className="max-h-64 overflow-auto space-y-1 border rounded-lg p-2">
                        {result.lines.map((line, li) => (
                          <div key={li} className="flex items-start gap-3 p-2 rounded hover:bg-muted/40 text-sm">
                            <span className="shrink-0 text-xs text-muted-foreground w-6 text-right">{li + 1}</span>
                            <span className="flex-1" dir={language.startsWith('ar') ? 'rtl' : 'ltr'}>{line.text}</span>
                            {getConfidenceBadge(line.confidence)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
