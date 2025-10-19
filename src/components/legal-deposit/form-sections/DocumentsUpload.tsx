import { UseFormReturn } from 'react-hook-form';
import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { MonographDepositFormData } from '@/schemas/legalDepositSchema';

interface DocumentsUploadProps {
  form: UseFormReturn<MonographDepositFormData>;
  uploadedFiles: Record<string, File>;
  setUploadedFiles: (files: Record<string, File>) => void;
  publicationType?: string;
}

export function DocumentsUpload({ 
  form, 
  uploadedFiles, 
  setUploadedFiles,
  publicationType 
}: DocumentsUploadProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = (documentType: string, file: File | null) => {
    if (!file) return;

    const allowedTypes: Record<string, string[]> = {
      cover: ['image/jpeg', 'image/jpg'],
      summary: ['application/pdf'],
      cin: ['image/jpeg', 'image/jpg', 'application/pdf'],
      'courtDecision': ['application/pdf'],
      'thesisRecommendation': ['application/pdf'],
      'quranAuthorization': ['application/pdf']
    };

    const maxSizes: Record<string, number> = {
      cover: 1 * 1024 * 1024,
      summary: 2 * 1024 * 1024,
      cin: 2 * 1024 * 1024,
      'courtDecision': 5 * 1024 * 1024,
      'thesisRecommendation': 5 * 1024 * 1024,
      'quranAuthorization': 5 * 1024 * 1024
    };

    const allowedTypesForDoc = allowedTypes[documentType] || [];
    const maxSize = maxSizes[documentType] || 5 * 1024 * 1024;

    if (!allowedTypesForDoc.includes(file.type)) {
      toast.error(`Type de fichier non autorisé. Types acceptés: ${allowedTypesForDoc.join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux. Taille maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploadedFiles({
      ...uploadedFiles,
      [documentType]: file
    });

    // Update form value
    form.setValue(`documents.${documentType}` as any, file);

    toast.success(`Fichier "${file.name}" ajouté avec succès`);
  };

  const handleRemoveFile = (documentType: string) => {
    const newFiles = { ...uploadedFiles };
    delete newFiles[documentType];
    setUploadedFiles(newFiles);

    // Reset form value
    form.setValue(`documents.${documentType}` as any, undefined);

    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType]!.value = '';
    }

    toast.success('Fichier supprimé');
  };

  const renderFileUpload = (
    documentType: string, 
    label: string, 
    required: boolean = false, 
    acceptedTypes: string = '*'
  ) => {
    const uploadedFile = uploadedFiles[documentType];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={documentType} 
              checked={!!uploadedFile}
              disabled={!!uploadedFile}
            />
            <Label htmlFor={documentType} className={required ? 'font-medium' : ''}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          {!uploadedFile && (
            <div>
              <input
                ref={(el) => {
                  if (el) fileInputRefs.current[documentType] = el;
                }}
                type="file"
                accept={acceptedTypes}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[documentType]?.click()}
                className="text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Choisir fichier
              </Button>
            </div>
          )}
        </div>
        
        {uploadedFile && (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <File className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
              <span className="text-xs text-green-600">
                ({Math.round(uploadedFile.size / 1024)}KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(documentType)}
              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Determine which documents are required based on publication type
  const isThesisRecommendationRequired = publicationType === 'these';
  const isQuranAuthorizationRequired = publicationType === 'coran';

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Documents à joindre</h3>
      <div className="space-y-3">
        {renderFileUpload('cover', 'Couverture du document', false, 'image/jpeg,image/jpg')}
        {renderFileUpload('summary', 'Résumé (PDF)', false, 'application/pdf')}
        {renderFileUpload('cin', 'CIN (JPEG ou PDF)', false, 'image/jpeg,image/jpg,application/pdf')}
        
        {/* Conditional documents based on publication type */}
        {isThesisRecommendationRequired && renderFileUpload(
          'thesisRecommendation', 
          'Recommandation (Thèse)', 
          true, 
          'application/pdf'
        )}
        
        {isQuranAuthorizationRequired && renderFileUpload(
          'quranAuthorization', 
          'Autorisation Fondation Mohammed VI (Coran)', 
          true, 
          'application/pdf'
        )}
      </div>
    </div>
  );
}
