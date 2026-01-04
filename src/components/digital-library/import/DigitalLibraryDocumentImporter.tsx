import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, FileSearch, UploadCloud } from "lucide-react";
import SingleDocumentImport from "./SingleDocumentImport";
import BulkDocumentImport from "./BulkDocumentImport";
import OcrImportTool from "./OcrImportTool";

interface DigitalLibraryDocumentImporterProps {
  defaultTab?: string;
  onSuccess?: () => void;
}

export default function DigitalLibraryDocumentImporter({ 
  defaultTab = "single",
  onSuccess 
}: DigitalLibraryDocumentImporterProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
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
        </CardHeader>
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Import unitaire</span>
            <span className="sm:hidden">Unitaire</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import en masse</span>
            <span className="sm:hidden">Masse</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Indexation OCR</span>
            <span className="sm:hidden">OCR</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <SingleDocumentImport onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkDocumentImport onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="ocr">
          <OcrImportTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
