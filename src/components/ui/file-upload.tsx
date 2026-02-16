import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Download, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onChange: (file: File | null) => void;
  onDownloadTemplate?: () => void;
  templateLabel?: string;
  className?: string;
}

export function FileUpload({
  label,
  accept = ".xlsx,.xls,.csv",
  maxSize = 5,
  value,
  onChange,
  onDownloadTemplate,
  templateLabel = "Télécharger le canevas",
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Le fichier ne doit pas dépasser ${maxSize} MB`);
      return;
    }

    // Vérifier le type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (accept && !accept.split(",").some(ext => ext.trim() === fileExtension)) {
      toast.error(`Type de fichier non accepté. Formats acceptés: ${accept}`);
      return;
    }

    onChange(file);
    toast.success("Fichier sélectionné avec succès");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      {onDownloadTemplate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownloadTemplate}
          className="mb-2"
        >
          <Download className="w-4 h-4 mr-2" />
          {templateLabel}
        </Button>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center justify-between gap-4 p-3 bg-accent rounded-md">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(value.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">
                Glissez-déposez votre fichier ici ou
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
              >
                Parcourir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Formats acceptés : PDF, JPEG, EPUB etc. (max. {maxSize} MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
