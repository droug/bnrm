import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, FileText, Upload, X, File, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface LegalDepositDeclarationProps {
  depositType: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees";
  onClose: () => void;
}

export default function LegalDepositDeclaration({ depositType, onClose }: LegalDepositDeclarationProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState<"type_selection" | "editor_auth" | "printer_auth" | "form_filling" | "confirmation">("type_selection");
  const [userType, setUserType] = useState<"editor" | "printer" | null>(null);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [editorData, setEditorData] = useState<any>({});
  const [printerData, setPrinterData] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [naturePublication, setNaturePublication] = useState<string>("");

  const depositTypeLabels = {
    monographie: "Monographies",
    periodique: "Publications Périodiques",
    bd_logiciels: "Bases de données, Logiciels et Documents audiovisuels",
    collections_specialisees: "Collections spécialisées"
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    if (!file) return;

    // Validate file type and size
    const allowedTypes = {
      cover: ['image/jpeg', 'image/jpg'],
      summary: ['application/pdf'],
      cin: ['image/jpeg', 'image/jpg', 'application/pdf'],
      'court-decision': ['application/pdf'],
      'thesis-recommendation': ['application/pdf'],
      'quran-authorization': ['application/pdf']
    };

    const maxSizes = {
      cover: 1 * 1024 * 1024, // 1MB
      summary: 2 * 1024 * 1024, // 2MB
      cin: 2 * 1024 * 1024, // 2MB
      'court-decision': 5 * 1024 * 1024, // 5MB
      'thesis-recommendation': 5 * 1024 * 1024, // 5MB
      'quran-authorization': 5 * 1024 * 1024 // 5MB
    };

    const allowedTypesForDoc = allowedTypes[documentType as keyof typeof allowedTypes] || [];
    const maxSize = maxSizes[documentType as keyof typeof maxSizes] || 5 * 1024 * 1024;

    if (!allowedTypesForDoc.includes(file.type)) {
      toast.error(`Type de fichier non autorisé pour ${documentType}. Types acceptés: ${allowedTypesForDoc.join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux. Taille maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast.success(`Fichier "${file.name}" ajouté avec succès`);
  };

  const handleRemoveFile = (documentType: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });

    // Reset the file input
    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType]!.value = '';
    }

    toast.success("Fichier supprimé");
  };

  const renderFileUpload = (documentType: string, label: string, required: boolean = false, acceptedTypes: string = "*") => {
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
            <Label htmlFor={documentType} className={required ? "font-medium" : ""}>
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
                {language === 'ar' ? 'اختيار ملف' : 'Choisir fichier'}
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

  const renderFrenchForm = () => {
    const renderFormsByType = () => {
      if (depositType === "monographie") {
        return (
          <>
            {/* Identification de l'auteur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'auteur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                <div className="space-y-2">
                  <Label>Type de l'auteur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physique">Personne physique</SelectItem>
                      <SelectItem value="morale">Personne morale (collectivités)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nom de la collectivité / Nom de l'auteur</Label>
                  <Input placeholder="Nom complet" />
                </div>

                <div className="space-y-2">
                  <Label>Sigle</Label>
                  <Input placeholder="Sigle" />
                </div>

                <div className="space-y-2">
                  <Label>Nature du déclarant</Label>
                  <Input placeholder="Nature du déclarant" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Numéro de téléphone" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Adresse email" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse complète" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre de l'ouvrage</Label>
                  <Input placeholder="Titre de l'ouvrage" />
                </div>

                <div className="space-y-2">
                  <Label>Type de support</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="printed">Imprimé</SelectItem>
                      <SelectItem value="electronic">Électronique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Titre de la collection</Label>
                  <Input placeholder="Titre de la collection" />
                </div>

                <div className="space-y-2">
                  <Label>Numéro dans la collection</Label>
                  <Input placeholder="Numéro dans la collection" />
                </div>

                <div className="space-y-2">
                  <Label>Disciplines de l'ouvrage</Label>
                  <Input placeholder="Disciplines de l'ouvrage" />
                </div>

                <div className="space-y-2">
                  <Label>Mots clés</Label>
                  <Input placeholder="Mots clés" />
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ber">Amazigh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nombre de volumes</Label>
                  <Input type="number" placeholder="Nombre de volumes" />
                </div>

                <div className="space-y-2">
                  <Label>Nombre de pages</Label>
                  <Input type="number" placeholder="Nombre de pages" />
                </div>

                <div className="space-y-2">
                  <Label>Première demande d'ISBN</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Oui</SelectItem>
                      <SelectItem value="no">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Résumé de l'ouvrage</Label>
                  <Textarea placeholder="Résumé de l'ouvrage" rows={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur</Label>
                  <Input placeholder="Nom de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <Input type="month" placeholder="Date prévue de parution" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'imprimeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'imprimeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imprimerie</Label>
                  <Input placeholder="Nom de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Chiffre de tirage</Label>
                  <Input type="number" placeholder="Chiffre de tirage" />
                </div>
              </div>
            </div>

            <Separator />
          </>
        );
      }

      if (depositType === "periodique") {
        return (
          <>
            {/* Directeur de la publication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Directeur de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom et prénom</Label>
                  <Input placeholder="Nom et prénom" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse" />
                </div>

                <div className="space-y-2">
                  <Label>Pseudonyme</Label>
                  <Input placeholder="Pseudonyme" />
                </div>

                <div className="space-y-2">
                  <Label>Profession</Label>
                  <Input placeholder="Profession" />
                </div>

                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input type="date" placeholder="Date de naissance" />
                </div>

                <div className="space-y-2">
                  <Label>Lieu de naissance</Label>
                  <Input placeholder="Lieu de naissance" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Résumé de l'ouvrage</Label>
                  <Textarea placeholder="Résumé de l'ouvrage" rows={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal">Journal</SelectItem>
                      <SelectItem value="revue">Revue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nature publication</Label>
                  <Select onValueChange={setNaturePublication} value={naturePublication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la nature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="etatique">Étatique</SelectItem>
                      <SelectItem value="non-etatique">Non étatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {naturePublication === "non-etatique" && (
                  <div className="space-y-2">
                    <Label>Décision du Tribunal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload('court-decision', file);
                          }
                        }}
                        ref={(el) => fileInputRefs.current['court-decision'] = el}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current['court-decision']?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadedFiles['court-decision'] ? uploadedFiles['court-decision'].name : "Choisir un fichier PDF"}
                      </Button>
                      {uploadedFiles['court-decision'] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newFiles = { ...uploadedFiles };
                            delete newFiles['court-decision'];
                            setUploadedFiles(newFiles);
                            if (fileInputRefs.current['court-decision']) {
                              fileInputRefs.current['court-decision'].value = '';
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Titre du périodique</Label>
                  <Input placeholder="Titre du périodique" />
                </div>

                <div className="space-y-2">
                  <Label>Type de support</Label>
                  <Select 
                    onValueChange={(value) => setFormData({ ...formData, supportType: value })}
                    value={formData.supportType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="printed">Imprimé</SelectItem>
                      <SelectItem value="electronic">Électronique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.supportType === "electronic" && (
                  <div className="space-y-2">
                    <Label>URL Opérationnelle</Label>
                    <Input 
                      type="url" 
                      placeholder="https://exemple.com" 
                      value={formData.operationalUrl || ''}
                      onChange={(e) => setFormData({ ...formData, operationalUrl: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Input placeholder="Discipline" />
                </div>

                <div className="space-y-2">
                  <Label>Fascicule N°</Label>
                  <Input placeholder="Numéro du fascicule" />
                </div>

                <div className="space-y-2">
                  <Label>Périodicité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la périodicité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ber">Amazigh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mention d'édition</Label>
                  <Input placeholder="Mention d'édition" />
                </div>

                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input type="url" placeholder="URL du site web" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur</Label>
                  <Input placeholder="Nom de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="Email de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <Input type="month" placeholder="Date prévue de parution" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Imprimeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Imprimeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imprimerie</Label>
                  <Input placeholder="Nom de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Chiffre de tirage</Label>
                  <Input type="number" placeholder="Chiffre de tirage" />
                </div>
              </div>
            </div>

            <Separator />
          </>
        );
      }

      if (depositType === "bd_logiciels") {
        return (
          <>
            {/* Identification de l'auteur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'auteur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de l'auteur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physique">Personne physique</SelectItem>
                      <SelectItem value="morale">Personne morale (collectivités)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nom de la collectivité / Nom de l'Auteur</Label>
                  <Input placeholder="Nom complet" />
                </div>

                <div className="space-y-2">
                  <Label>Sigle</Label>
                  <Input placeholder="Sigle" />
                </div>

                <div className="space-y-2">
                  <Label>Nature du déclarant</Label>
                  <Input placeholder="Nature du déclarant" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Numéro de téléphone" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Adresse email" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse complète" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre de la publication</Label>
                  <Input placeholder="Titre de la publication" />
                </div>

                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="database">Base de données</SelectItem>
                      <SelectItem value="software">Logiciel</SelectItem>
                      <SelectItem value="audiovisual">Document audiovisuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ber">Amazigh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Disciplines de la publication</Label>
                  <Input placeholder="Disciplines de la publication" />
                </div>

                <div className="space-y-2">
                  <Label>Mots clés</Label>
                  <Input placeholder="Mots clés" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Résumé de la publication</Label>
                  <Textarea placeholder="Résumé de la publication" rows={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur</Label>
                  <Input placeholder="Nom de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <Input type="month" placeholder="Date prévue de parution" />
                </div>

                <div className="space-y-2">
                  <Label>Mention d'Edition</Label>
                  <Input placeholder="Mention d'Edition" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de distributeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de distributeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de distributeur</Label>
                  <Input placeholder="Nom du distributeur" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email du distributeur" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone du distributeur" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse du distributeur" />
                </div>

                <div className="space-y-2">
                  <Label>Chiffre de tirage</Label>
                  <Input type="number" placeholder="Chiffre de tirage" />
                </div>
              </div>
            </div>

            <Separator />
          </>
        );
      }

      if (depositType === "collections_specialisees") {
        return (
          <>
            {/* Identification de l'auteur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'auteur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de l'auteur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physique">Personne physique</SelectItem>
                      <SelectItem value="morale">Personne morale (collectivités)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nom de la collectivité / Nom de l'auteur</Label>
                  <Input placeholder="Nom complet" />
                </div>

                <div className="space-y-2">
                  <Label>Sigle</Label>
                  <Input placeholder="Sigle" />
                </div>

                <div className="space-y-2">
                  <Label>Nature du déclarant</Label>
                  <Input placeholder="Nature du déclarant" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Numéro de téléphone" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Adresse email" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse complète" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <Input placeholder="Type de publication" />
                </div>

                <div className="space-y-2">
                  <Label>Titre de la publication</Label>
                  <Input placeholder="Titre de la publication" />
                </div>

                <div className="space-y-2">
                  <Label>Titre de la collection</Label>
                  <Input placeholder="Titre de la collection" />
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ber">Amazigh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Disciplines de la publication</Label>
                  <Input placeholder="Disciplines de la publication" />
                </div>

                <div className="space-y-2">
                  <Label>Mots clés</Label>
                  <Input placeholder="Mots clés" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Résumé de la publication</Label>
                  <Textarea placeholder="Résumé de la publication" rows={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur</Label>
                  <Input placeholder="Nom de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'éditeur" />
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <Input type="month" placeholder="Date prévue de parution" />
                </div>

                <div className="space-y-2">
                  <Label>Mention d'édition</Label>
                  <Input placeholder="Mention d'édition" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Imprimeur */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identification de l'Imprimeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imprimerie</Label>
                  <Input placeholder="Nom de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="Téléphone de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea placeholder="Adresse de l'imprimerie" />
                </div>

                <div className="space-y-2">
                  <Label>Chiffre de tirage</Label>
                  <Input type="number" placeholder="Chiffre de tirage" />
                </div>
              </div>
            </div>

            <Separator />
          </>
        );
      }

      return null;
    };

    return (
      <>
        {renderFormsByType()}
        
        {/* Pièces à fournir */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Pièces à fournir</h3>
          <div className="space-y-4">
            {renderFileUpload("cover", "Joindre la couverture (format « jpg » moins de 1 MO)", true, "image/jpeg")}
            
            {(depositType === "monographie" || depositType === "periodique") && (
              renderFileUpload("summary", "Joindre le sommaire (format « PDF » moins de 2 MO)", true, "application/pdf")
            )}
            
            {renderFileUpload("cin", "Envoyer une copie de la CIN de l'auteur", true, "image/jpeg,application/pdf")}
            

            {depositType === "monographie" && (
              <>
                {renderFileUpload(
                  "thesis-recommendation", 
                  "Recommandation de publication (pour les thèses)", 
                  false, 
                  "application/pdf"
                )}
                {renderFileUpload(
                  "quran-authorization", 
                  "Autorisation de publication de la Fondation Mohammed VI (pour les Corans)", 
                  false, 
                  "application/pdf"
                )}
              </>
            )}
          </div>

          {/* Résumé des fichiers joints */}
          {Object.keys(uploadedFiles).length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Documents joints :</h4>
              <div className="space-y-1">
                {Object.entries(uploadedFiles).map(([type, file]) => (
                  <div key={type} className="flex items-center text-sm text-green-700">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    <span className="font-medium">{type}:</span>
                    <span className="ml-1">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">Adresse d'envoi :</h4>
            <p className="text-sm text-muted-foreground">
              Les pièces doivent être envoyées à l'adresse e-mail suivante : <strong>depot.legal@bnrm.ma</strong>
            </p>
          </div>

          <div className="mt-4 p-4 bg-accent/10 rounded-lg">
            <h4 className="font-semibold mb-2">Modalités et nombre d'exemplaires à déposer :</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Une fois l'ouvrage publié, les exemplaires doivent être déposés à l'Agence Bibliographique Nationale :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {depositType === "monographie" && (
                <>
                  <li>• 4 exemplaires pour les monographies imprimées</li>
                  <li>• 2 exemplaires pour les e-books</li>
                </>
              )}
              {depositType === "periodique" && (
                <li>• 4 exemplaires pour les périodiques imprimés</li>
              )}
              {(depositType === "bd_logiciels" || depositType === "collections_specialisees") && (
                <li>• 2 exemplaires de format identique (CD, DVD, clés USB, etc.)</li>
              )}
            </ul>
            
            {depositType === "monographie" && (
              <div className="mt-3 p-3 bg-background/50 rounded border-l-4 border-primary">
                <h5 className="font-medium text-sm mb-1">Pour les e-books :</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Déposer deux exemplaires sur le même type de support</li>
                  <li>• Munir chaque exemplaire d'une pochette avec le titre et les numéros obtenus (DL, ISBN)</li>
                  <li>• Inclure le résumé sous format texte (Word par exemple)</li>
                  <li>• Recommandation : utiliser des USB au format carte pour une meilleure préservation</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Clause de protection des données */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Clause de protection de données à caractère personnel
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Les informations recueillies sur le site www.bnrm.ma font l'objet d'un traitement destiné à la Gestion des attributions 
            des numéros du Dépôt Légal et des numéros ISBN et ISSN. Le destinataire des données est le service de dépôt légal.
            Conformément à la loi n° 09-08 promulguée par le Dahir 1-09-15 du 18 février 2009, relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, 
            vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent, 
            que vous pouvez exercer en vous adressant à depot.legal@bnrm.ma.
            Ce traitement a été notifié par la CNDP au titre du récépissé n°D-90/2023 du 18/01/2023.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="privacy" 
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
            />
            <Label htmlFor="privacy" className="text-sm">
              J'ai lu et j'accepte la clause de protection de données à caractère personnel
            </Label>
          </div>
        </div>
      </>
    );
  };

  const renderPrivacyClauseArabic = () => (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        شرط حماية البيانات الشخصية
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        تخضع المعلومات التي تم جمعها على موقع www.bnrm.ma للمعالجة المخصصة لإدارة تخصيص أرقام الإيداع القانوني وأرقام ISBN و ISSN. 
        متلقي البيانات هو خدمة الإيداع القانوني.
        وفقا للقانون رقم 08-09 الصادر بموجب الظهير الشريف 1-09-15 المؤرخ في 18 فبراير 2009، المتعلق بحماية الأفراد فيما يتعلق بمعالجة البيانات الشخصية، 
        لك الحق في الوصول إلى المعلومات المتعلقة بك وتصحيحها، والتي يمكنك ممارستها عن طريق الاتصال بـ depot.legal@bnrm.ma.
        يمكنك أيضا معارضة معالجة البيانات المتعلقة بك، لأسباب مشروعة.
        تم إخطار CNDP بهذه المعالجة بموجب رقم الاستلام D-90/2023 بتاريخ 01/18/2023.
      </p>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="privacy-ar" 
          checked={acceptedPrivacy}
          onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
        />
        <Label htmlFor="privacy-ar" className="text-sm">
          لقد قرأت وقبلت شرط حماية البيانات الشخصية
        </Label>
      </div>
    </div>
  );

  const renderMonographieArabicForm = () => (
    <>
      {/* التعريف بالمؤلف */}
      <div>
        <h3 className="text-lg font-semibold mb-4">التعريف بالمؤلف</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع المؤلف</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physique">شخص مادي</SelectItem>
                <SelectItem value="morale">شخص معنوي (هيئة)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>اسم المؤلف / اسم الهيئة</Label>
            <Input placeholder="الاسم الكامل" />
          </div>

          <div className="space-y-2">
            <Label>اختصار اسم الهيئة</Label>
            <Input placeholder="اختصار اسم الهيئة" />
          </div>

          <div className="space-y-2">
            <Label>نوع المصرح</Label>
            <Input placeholder="نوع المصرح" />
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input placeholder="رقم الهاتف" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="البريد الإلكتروني" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>العنوان</Label>
            <Textarea placeholder="العنوان الكامل" />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالوثيقة */}
      <div>
        <h3 className="text-lg font-semibold mb-4">التعريف بالوثيقة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>عنوان الكتاب</Label>
            <Input placeholder="عنوان الكتاب" />
          </div>

          <div className="space-y-2">
            <Label>نوع الحامل</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحامل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="printed">مطبوع</SelectItem>
                <SelectItem value="electronic">إلكتروني</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>عنوان السلسلة</Label>
            <Input placeholder="عنوان السلسلة" />
          </div>

          <div className="space-y-2">
            <Label>الرقم في السلسلة</Label>
            <Input placeholder="الرقم في السلسلة" />
          </div>

          <div className="space-y-2">
            <Label>موضوع الكتاب</Label>
            <Input placeholder="موضوع الكتاب" />
          </div>

          <div className="space-y-2">
            <Label>رؤوس للمواضيع</Label>
            <Input placeholder="رؤوس للمواضيع" />
          </div>

          <div className="space-y-2">
            <Label>اللغة</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="fr">الفرنسية</SelectItem>
                <SelectItem value="en">الإنجليزية</SelectItem>
                <SelectItem value="ber">الأمازيغية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>عدد الأجزاء</Label>
            <Input type="number" placeholder="عدد الأجزاء" />
          </div>

          <div className="space-y-2">
            <Label>عدد الصفحات</Label>
            <Input type="number" placeholder="عدد الصفحات" />
          </div>

          <div className="space-y-2">
            <Label>أول طلب للردمك</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>ملخص الكتاب</Label>
            <Textarea placeholder="ملخص الكتاب" rows={4} />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالناشر */}
      <div>
        <h3 className="text-lg font-semibold mb-4">التعريف بالناشر</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم الناشر بالعربية والفرنسية</Label>
            <Input placeholder="اسم الناشر" />
          </div>

          <div className="space-y-2">
            <Label>العنوان بالعربية والفرنسية</Label>
            <Textarea placeholder="عنوان الناشر" />
          </div>

          <div className="space-y-2">
            <Label>الهاتف</Label>
            <Input placeholder="رقم هاتف الناشر" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="بريد الناشر الإلكتروني" />
          </div>

          <div className="space-y-2">
            <Label>التاريخ المتوقع للإصدار (الشهر / السنة)</Label>
            <Input type="month" />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالطابع */}
      <div>
        <h3 className="text-lg font-semibold mb-4">التعريف بالطابع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم المطبعة</Label>
            <Input placeholder="اسم المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="بريد المطبعة الإلكتروني" />
          </div>

          <div className="space-y-2">
            <Label>الهاتف</Label>
            <Input placeholder="هاتف المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>العنوان</Label>
            <Textarea placeholder="عنوان المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>عدد النسخ المطبوعة</Label>
            <Input type="number" placeholder="عدد النسخ" />
          </div>
        </div>
      </div>

      <Separator />

      {/* الوثائق المطلوب تقديمها */}
      <div>
        <h3 className="text-lg font-semibold mb-4">الوثائق المطلوب تقديمها</h3>
        <div className="space-y-4">
          {renderFileUpload("cover", "إرفاق الغلاف (Format « jpg » moins de 1 MO)", true, "image/jpeg")}
          {renderFileUpload("summary", "إرفاق الفهرس (Format « PDF » moins de 2 MO)", true, "application/pdf")}
          {renderFileUpload("cin", "إرسال نسخة من البطاقة الوطنية للمؤلف", true, "image/jpeg,application/pdf")}
          {renderFileUpload("thesis-recommendation", "إرسال توصية النشر (للأطروحات)", false, "application/pdf")}
          {renderFileUpload("quran-authorization", "إرسال توصية النشر من مؤسسة محمد السادس لنشر القرآن الكريم (للمصاحف)", false, "application/pdf")}
        </div>

        {Object.keys(uploadedFiles).length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">الوثائق المرفقة:</h4>
            <div className="space-y-1">
              {Object.entries(uploadedFiles).map(([type, file]) => (
                <div key={type} className="flex items-center text-sm text-green-700">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  <span className="font-medium">{type}:</span>
                  <span className="ml-1">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">عنوان الإرسال:</h4>
          <p className="text-sm text-muted-foreground">
            يجب إرسال الوثائق إلى العنوان الإلكتروني التالي: <strong>depot.legal@bnrm.ma</strong>
          </p>
        </div>

        <div className="mt-4 p-4 bg-accent/10 rounded-lg">
          <h4 className="font-semibold mb-2">طرائق وعدد النسخ الواجب إيداعها:</h4>
          <p className="text-sm text-muted-foreground mb-2">
            بعد نشر الكتاب، يجب إيداع النسخ في الوكالة الببليوغرافية الوطنية:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 4 نسخ للكتب المطبوعة</li>
            <li>• نسختان للكتب الإلكترونية</li>
          </ul>
        </div>
      </div>

      <Separator />

      {renderPrivacyClauseArabic()}
    </>
  );

  const renderArabicForm = () => {
    if (depositType === "monographie") {
      return renderMonographieArabicForm();
    }
    // Simplified for other types for now
    return renderMonographieArabicForm();
  };

  const handleAuthentication = async (type: "editor" | "printer", credentials: any) => {
    // Simulate authentication
    console.log(`Authenticating ${type}:`, credentials);
    
    if (type === "editor") {
      setEditorData(credentials);
      toast.success("Éditeur authentifié avec succès");
      // Si l'utilisateur est un éditeur, passer à l'authentification de l'imprimeur
      if (userType === "editor") {
        setCurrentStep("printer_auth");
      }
    } else {
      setPrinterData(credentials);
      toast.success("Imprimeur authentifié avec succès");
      // Après l'authentification de l'imprimeur, passer au formulaire
      setCurrentStep("form_filling");
    }
  };

  const handlePartnerConfirmation = () => {
    setPartnerConfirmed(true);
    setCurrentStep("form_filling");
    toast.success("Confirmation réciproque validée");
  };

  const handleFormSubmit = async () => {
    if (!acceptedPrivacy) {
      toast.error(language === 'ar' ? "يجب قبول شرط حماية البيانات" : "Vous devez accepter la clause de protection des données");
      return;
    }

    if (!partnerConfirmed) {
      toast.error(language === 'ar' ? "تأكيد الشراكة مطلوب" : "La confirmation réciproque entre éditeur et imprimeur est requise");
      return;
    }

    // Check required documents
    const requiredDocs = ['cover', 'cin'];
    if (depositType === "monographie" || depositType === "periodique") {
      requiredDocs.push('summary');
    }

    const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc]);
    if (missingDocs.length > 0) {
      toast.error(`Documents manquants requis: ${missingDocs.join(', ')}`);
      return;
    }

    // Submit form data with files
    console.log("Submitting declaration:", {
      type: depositType,
      editor: editorData,
      printer: printerData,
      declaration: formData,
      documents: Object.keys(uploadedFiles).map(key => ({
        type: key,
        file: uploadedFiles[key],
        name: uploadedFiles[key].name,
        size: uploadedFiles[key].size
      }))
    });

    toast.success(language === 'ar' ? "تم إرسال التصريح بنجاح" : "Déclaration de dépôt légal soumise avec succès");
    setCurrentStep("confirmation");
  };

  if (currentStep === "type_selection") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'ar' ? 'نوع المستخدم' : 'Type d\'utilisateur'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'ar' ? 
              'اختر نوع المستخدم للمتابعة' : 
              'Sélectionnez votre type d\'utilisateur pour continuer'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => {
              setUserType("editor");
              setCurrentStep("editor_auth");
            }}
            className="w-full h-20 text-lg flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-8 w-8" />
            {language === 'ar' ? 'ناشر' : 'Éditeur'}
          </Button>
          
          <Button 
            onClick={() => {
              setUserType("printer");
              setCurrentStep("printer_auth");
            }}
            className="w-full h-20 text-lg flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-8 w-8" />
            {language === 'ar' ? 'طابع' : 'Imprimeur/Distributeur'}
          </Button>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={onClose} className="w-full">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "editor_auth") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {language === 'ar' ? 'تحديد هوية الناشر' : 'Identification de l\'éditeur'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 
              'يرجى تقديم معلومات الناشر للمصادقة' :
              'Veuillez fournir les informations de l\'éditeur pour authentification'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم' : 'Nom'}</Label>
              <Input placeholder={language === 'ar' ? 'اسم الناشر' : 'Nom de l\'éditeur'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان' : 'Adresse'}</Label>
              <Input placeholder={language === 'ar' ? 'العنوان' : 'Adresse'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
              <Input placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Adresse email'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ النشر المتوقع' : 'Date de publication prévue'}</Label>
              <Input type="date" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep("type_selection")}>
              {language === 'ar' ? 'رجوع' : 'Retour'}
            </Button>
            <Button onClick={() => handleAuthentication("editor", {
              name: "",
              address: "",
              phone: "",
              email: "",
              publicationDate: ""
            })}>
              {language === 'ar' ? 'متابعة' : 'Continuer'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "printer_auth") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {language === 'ar' ? 'تحديد هوية الطابع/الموزع' : 'Identification de l\'imprimeur/distributeur'}
          </CardTitle>
          <CardDescription>
            {userType === "editor" ? 
              (language === 'ar' ? 
                'الآن نحتاج لمعلومات الطابع/الموزع' :
                'Nous avons maintenant besoin des informations de l\'imprimeur/distributeur'
              ) :
              (language === 'ar' ?
                'يرجى تقديم معلومات الطابع/الموزع للمصادقة' :
                'Veuillez fournir les informations de l\'imprimeur/distributeur pour authentification'
              )
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم' : 'Nom'}</Label>
              <Input placeholder={language === 'ar' ? 'اسم الطابع/الموزع' : 'Nom de l\'imprimeur/distributeur'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان' : 'Adresse'}</Label>
              <Input placeholder={language === 'ar' ? 'العنوان' : 'Adresse'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
              <Input placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Adresse email'} />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'عدد النسخ' : 'Tirage'}</Label>
              <Input type="number" placeholder={language === 'ar' ? 'عدد النسخ' : 'Nombre d\'exemplaires'} />
            </div>
          </div>

          {userType === "printer" && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-medium">
                  {language === 'ar' ? 'تأكيد التعاون' : 'Confirmation de partenariat'}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ar' ? 
                  'في انتظار تأكيد الناشر للتعاون المتبادل' :
                  'En attente de la confirmation réciproque de l\'éditeur'
                }
              </p>
              <Button onClick={handlePartnerConfirmation} size="sm">
                {language === 'ar' ? 'تأكيد التعاون' : 'Confirmer le partenariat'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep(userType === "editor" ? "editor_auth" : "type_selection")}>
              {language === 'ar' ? 'رجوع' : 'Retour'}
            </Button>
            <Button onClick={() => handleAuthentication("printer", {
              name: "",
              address: "",
              phone: "",
              email: "",
              printRun: ""
            })}>
              {language === 'ar' ? 'متابعة' : 'Continuer'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "form_filling") {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'رجوع' : 'Retour'}
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'ar' ? 
                  `تصريح الإيداع القانوني - ${depositTypeLabels[depositType]}` :
                  `Déclaration de dépôt légal - ${depositTypeLabels[depositType]}`
                }
              </div>
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 
                'يرجى ملء جميع الحقول المطلوبة' :
                'Veuillez remplir tous les champs requis'
              }
            </CardDescription>
          </CardHeader>
        
        <CardContent className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {language === 'ar' ? renderArabicForm() : renderFrenchForm()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep("printer_auth")}>
              {language === 'ar' ? 'رجوع' : 'Retour'}
            </Button>
            <Button 
              onClick={handleFormSubmit}
              disabled={!acceptedPrivacy || !partnerConfirmed}
            >
              {language === 'ar' ? 'إرسال التصريح' : 'Soumettre la déclaration'}
            </Button>
          </div>
        </CardFooter>
        </Card>
      </div>
    );
  }

  if (currentStep === "confirmation") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">
              {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Soumission réussie !'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 
                'تم إرسال تصريح الإيداع القانوني بنجاح' :
                'Votre déclaration de dépôt légal a été soumise avec succès'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              {language === 'ar' ? 
                'ستتلقى رقم الإيداع القانوني قريباً عبر البريد الإلكتروني' :
                'Vous recevrez bientôt votre numéro de dépôt légal par email'
              }
            </p>
          </div>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="mr-2">
              {language === 'ar' ? 'نوع الإيداع' : 'Type de dépôt'}: {depositTypeLabels[depositType]}
            </Badge>
            <Badge variant="secondary">
              {language === 'ar' ? 'الوثائق المرفقة' : 'Documents joints'}: {Object.keys(uploadedFiles).length}
            </Badge>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={onClose} className="w-full">
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
