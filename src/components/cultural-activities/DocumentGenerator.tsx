import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { addBNRMHeader, addBNRMFooter } from "@/lib/pdfHeaderUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DocumentTemplate {
  id: string;
  template_name: string;
  template_code: string;
  document_type: string;
  content_template: string;
  variables: any;
  signature_required: boolean;
}

interface DocumentGeneratorProps {
  module: string;
  referenceType: string;
  referenceId: string;
  data: Record<string, any>;
}

export const DocumentGenerator = ({
  module,
  referenceType,
  referenceId,
  data,
}: DocumentGeneratorProps) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [signatureDialog, setSignatureDialog] = useState(false);
  const [signature, setSignature] = useState("");
  const [signerName, setSignerName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [module]);

  const fetchTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("module", module)
        .eq("is_active", true);

      if (error) throw error;
      setTemplates(templatesData || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const replaceVariables = (template: string, data: Record<string, any>): string => {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
      result = result.replace(regex, value);
    });
    
    return result;
  };

  const generateDocument = async (template: DocumentTemplate) => {
    if (template.signature_required) {
      setSelectedTemplate(template);
      setSignatureDialog(true);
      return;
    }

    await createPDF(template, null);
  };

  const createPDF = async (template: DocumentTemplate, signatureData: { name: string; signature: string } | null) => {
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      const startY = await addBNRMHeader(doc);
      let currentY = startY + 10;

      // Titre du document
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const titleMap: Record<string, string> = {
        'lettre_confirmation': 'LETTRE DE CONFIRMATION',
        'lettre_rejet': 'LETTRE DE REJET',
        'contrat': 'CONTRAT',
        'facture': 'FACTURE',
        'etat_lieux': 'ÉTAT DES LIEUX',
        'compte_rendu': 'COMPTE RENDU D\'ACTIVITÉ'
      };
      const docTitle = titleMap[template.document_type] || 'DOCUMENT';
      doc.text(docTitle, 105, currentY, { align: 'center' });
      currentY += 12;

      // Date et lieu
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Rabat, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 20, currentY);
      currentY += 15;

      // Contenu du document avec variables remplacées
      const content = replaceVariables(template.content_template, data);
      const maxWidth = 170;
      
      content.split('\n').forEach(line => {
        if (line.trim() === '') {
          currentY += 5;
          return;
        }

        const lines = doc.splitTextToSize(line, maxWidth);
        
        // Check if we need a new page
        if (currentY + (lines.length * 7) > 270) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(lines, 20, currentY);
        currentY += lines.length * 7;
      });

      // Signature si requise
      if (signatureData) {
        currentY += 15;
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text("Signature :", 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "italic");
        doc.text(signatureData.signature, 20, currentY);
        currentY += 7;
        doc.setFont("helvetica", "normal");
        doc.text(signatureData.name, 20, currentY);
      }

      // Pied de page
      addBNRMFooter(doc, 1);

      // Sauvegarder l'historique
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: saveError } = await supabase
        .from("generated_documents")
        .insert({
          template_id: template.id,
          reference_type: referenceType,
          reference_id: referenceId,
          generated_by: user?.id || '',
          document_data: data as any,
          signature_data: signatureData as any,
          document_type: template.document_type,
          module: module,
        } as any);

      if (saveError) throw saveError;

      // Télécharger le PDF
      const fileName = `${template.template_code}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);

      toast({
        title: "Document généré",
        description: "Le document a été généré avec succès",
      });

      setSignatureDialog(false);
      setSignature("");
      setSignerName("");
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = () => {
    if (!signerName.trim() || !signature.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez remplir tous les champs de signature",
        variant: "destructive",
      });
      return;
    }

    if (selectedTemplate) {
      createPDF(selectedTemplate, { name: signerName, signature });
    }
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            📄 Générer document
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Documents disponibles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => generateDocument(template)}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template.template_name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Signature Dialog */}
      <Dialog open={signatureDialog} onOpenChange={setSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signature du document</DialogTitle>
            <DialogDescription>
              Ce document nécessite une signature électronique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signerName">Nom du signataire *</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Ex: Dr. Fatima El Amrani"
              />
            </div>
            <div>
              <Label htmlFor="signature">Fonction/Titre *</Label>
              <Input
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Ex: Directrice du Département des Activités Culturelles"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSign} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Signer et générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};