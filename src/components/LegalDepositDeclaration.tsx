import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, FileText, Upload, X, File } from "lucide-react";
import { toast } from "sonner";

interface LegalDepositDeclarationProps {
  depositType: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees";
  onClose: () => void;
}

export default function LegalDepositDeclaration({ depositType, onClose }: LegalDepositDeclarationProps) {
  const [currentStep, setCurrentStep] = useState<"type_selection" | "editor_auth" | "printer_auth" | "form_filling" | "confirmation">("type_selection");
  const [userType, setUserType] = useState<"editor" | "printer" | null>(null);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [editorData, setEditorData] = useState<any>({});
  const [printerData, setPrinterData] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleAuthentication = async (type: "editor" | "printer", credentials: any) => {
    // Simulate authentication
    console.log(`Authenticating ${type}:`, credentials);
    
    if (type === "editor") {
      setEditorData(credentials);
    } else {
      setPrinterData(credentials);
    }
    
    toast.success(`${type === "editor" ? "Éditeur" : "Imprimeur"} authentifié avec succès`);
    
    if (userType === "editor") {
      setCurrentStep("printer_auth");
    } else {
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
      toast.error("Vous devez accepter la clause de protection des données");
      return;
    }

    if (!partnerConfirmed) {
      toast.error("La confirmation réciproque entre éditeur et imprimeur est requise");
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

    toast.success("Déclaration de dépôt légal soumise avec succès");
    setCurrentStep("confirmation");
  };

  if (currentStep === "type_selection") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Identification du Type d'Utilisateur</CardTitle>
          <CardDescription>
            Sélectionnez votre profil pour la déclaration de dépôt légal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => {
              setUserType("editor");
              setCurrentStep("editor_auth");
            }}
          >
            <FileText className="h-6 w-6" />
            <span>Je suis un Éditeur</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => {
              setUserType("printer");
              setCurrentStep("printer_auth");
            }}
          >
            <FileText className="h-6 w-6" />
            <span>Je suis un Imprimeur</span>
          </Button>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Annuler
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "editor_auth") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Authentification Éditeur</CardTitle>
          <CardDescription>
            Veuillez vous identifier en tant qu'éditeur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editor-name">Nom de l'éditeur</Label>
            <Input id="editor-name" placeholder="Nom de l'éditeur" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editor-address">Adresse</Label>
            <Textarea id="editor-address" placeholder="Adresse complète" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editor-phone">Téléphone</Label>
              <Input id="editor-phone" placeholder="Numéro de téléphone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editor-email">Email</Label>
              <Input id="editor-email" type="email" placeholder="Email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publication-date">Date prévue de parution</Label>
            <Input id="publication-date" type="date" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep("type_selection")}
          >
            Retour
          </Button>
          <Button
            onClick={() => handleAuthentication("editor", {
              name: (document.getElementById("editor-name") as HTMLInputElement)?.value,
              address: (document.getElementById("editor-address") as HTMLTextAreaElement)?.value,
              phone: (document.getElementById("editor-phone") as HTMLInputElement)?.value,
              email: (document.getElementById("editor-email") as HTMLInputElement)?.value,
              publicationDate: (document.getElementById("publication-date") as HTMLInputElement)?.value,
            })}
            className="flex-1"
          >
            Confirmer l'identification
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "printer_auth") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            {depositType === "bd_logiciels" ? "Authentification Distributeur" : "Authentification Imprimeur"}
          </CardTitle>
          <CardDescription>
            {userType === "editor" ? 
              `En attente de l'identification du ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"} partenaire` : 
              `Veuillez vous identifier en tant que ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userType === "editor" ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                En attente de la confirmation du {depositType === "bd_logiciels" ? "distributeur" : "imprimeur"} partenaire...
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handlePartnerConfirmation}
              >
                Simuler la confirmation du {depositType === "bd_logiciels" ? "distributeur" : "imprimeur"}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="printer-name">
                  {depositType === "bd_logiciels" ? "Nom de distributeur" : "Nom de l'imprimerie"}
                </Label>
                <Input id="printer-name" placeholder={depositType === "bd_logiciels" ? "Nom de distributeur" : "Nom de l'imprimerie"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printer-address">Adresse</Label>
                <Textarea id="printer-address" placeholder="Adresse complète" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-phone">Téléphone</Label>
                  <Input id="printer-phone" placeholder="Numéro de téléphone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printer-email">Email</Label>
                  <Input id="printer-email" type="email" placeholder="Email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-run">Chiffre de tirage</Label>
                <Input id="print-run" type="number" placeholder="Nombre d'exemplaires" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(userType === "editor" ? "editor_auth" : "type_selection")}
          >
            Retour
          </Button>
          {userType === "printer" && (
            <Button
              onClick={() => handleAuthentication("printer", {
                name: (document.getElementById("printer-name") as HTMLInputElement)?.value,
                address: (document.getElementById("printer-address") as HTMLTextAreaElement)?.value,
                phone: (document.getElementById("printer-phone") as HTMLInputElement)?.value,
                email: (document.getElementById("printer-email") as HTMLInputElement)?.value,
                printRun: (document.getElementById("print-run") as HTMLInputElement)?.value,
              })}
              className="flex-1"
            >
              Confirmer l'identification
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "form_filling") {
    return (
      <Card className="w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Déclaration de Dépôt Légal - {depositTypeLabels[depositType]}
          </CardTitle>
          <CardDescription>
            Remplissez le formulaire de déclaration pour obtenir le numéro de dépôt légal
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Éditeur confirmé
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {depositType === "bd_logiciels" ? "Distributeur" : "Imprimeur"} confirmé
            </Badge>
            {partnerConfirmed && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Confirmation réciproque
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Auteur/Directeur selon le type */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {depositType === "periodique" ? "Directeur de la publication" : "Identification de l'auteur"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {depositType !== "periodique" && (
                <div className="space-y-2">
                  <Label>Type de l'auteur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="physique">Personne physique</SelectItem>
                      <SelectItem value="morale">Personne morale (collectivités)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>
                  {depositType === "periodique" ? "Nom et prénom" : 
                   depositType === "bd_logiciels" ? "Nom de la collectivité / Nom de l'Auteur" :
                   "Nom de la collectivité / Nom de l'auteur"}
                </Label>
                <Input placeholder="Nom complet" />
              </div>

              {depositType !== "periodique" && (
                <div className="space-y-2">
                  <Label>Sigle</Label>
                  <Input placeholder="Sigle de l'organisation" />
                </div>
              )}

              {depositType !== "periodique" && (
                <div className="space-y-2">
                  <Label>Nature du déclarant</Label>
                  <Input placeholder="Nature du déclarant" />
                </div>
              )}

              {depositType === "periodique" && (
                <>
                  <div className="space-y-2">
                    <Label>Pseudonyme</Label>
                    <Input placeholder="Pseudonyme (optionnel)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Profession</Label>
                    <Input placeholder="Profession" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu de naissance</Label>
                    <Input placeholder="Lieu de naissance" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input placeholder="Numéro de téléphone" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Adresse email" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Adresse</Label>
                <Textarea placeholder="Adresse complète" />
              </div>

              {depositType === "periodique" && (
                <div className="md:col-span-2 space-y-2">
                  <Label>Résumé de l'ouvrage</Label>
                  <Textarea placeholder="Résumé détaillé" className="min-h-[100px]" />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section Publication */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {depositType === "periodique" && (
                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de publication" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="magazine">Magazine</SelectItem>
                      <SelectItem value="journal">Journal</SelectItem>
                      <SelectItem value="revue">Revue</SelectItem>
                      <SelectItem value="bulletin">Bulletin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={`space-y-2 ${depositType === "periodique" ? "" : "md:col-span-2"}`}>
                <Label>
                  {depositType === "periodique" ? "Titre du périodique" : 
                   depositType === "monographie" ? "Titre de l'ouvrage" :
                   "Titre de la publication"}
                </Label>
                <Input placeholder="Titre complet" />
              </div>
              
              <div className="space-y-2">
                <Label>Type de support</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le support" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="papier">Papier</SelectItem>
                    <SelectItem value="numerique">Numérique</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(depositType === "monographie" || depositType === "collections_specialisees") && (
                <div className="space-y-2">
                  <Label>Titre de la collection</Label>
                  <Input placeholder="Titre de la collection" />
                </div>
              )}

              {depositType === "periodique" && (
                <>
                  <div className="space-y-2">
                    <Label>Numéro</Label>
                    <Input placeholder="Numéro du périodique" />
                  </div>
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input placeholder="Volume" />
                  </div>
                  <div className="space-y-2">
                    <Label>Périodicité</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Fréquence de parution" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="quotidien">Quotidien</SelectItem>
                        <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                        <SelectItem value="mensuel">Mensuel</SelectItem>
                        <SelectItem value="trimestriel">Trimestriel</SelectItem>
                        <SelectItem value="semestriel">Semestriel</SelectItem>
                        <SelectItem value="annuel">Annuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Date de parution</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Langue</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Langue de publication" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="arabe">Arabe</SelectItem>
                    <SelectItem value="francais">Français</SelectItem>
                    <SelectItem value="anglais">Anglais</SelectItem>
                    <SelectItem value="berbere">Berbère</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre de pages</Label>
                <Input type="number" placeholder="Nombre de pages" />
              </div>

              {depositType !== "periodique" && (
                <div className="space-y-2">
                  <Label>Format (dimensions)</Label>
                  <Input placeholder="ex: 21 x 29,7 cm" />
                </div>
              )}

              {depositType === "bd_logiciels" && (
                <>
                  <div className="space-y-2">
                    <Label>Type de produit</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de produit" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="base_donnees">Base de données</SelectItem>
                        <SelectItem value="logiciel">Logiciel</SelectItem>
                        <SelectItem value="audiovisuel">Document audiovisuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Configuration requise</Label>
                    <Textarea placeholder="Configuration système requise" />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Section Éditeur */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Identification de l'éditeur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l'éditeur</Label>
                <Input defaultValue={editorData.name} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={editorData.email} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input defaultValue={editorData.phone} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Date prévue de parution</Label>
                <Input defaultValue={editorData.publicationDate} className="bg-muted" readOnly />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Adresse</Label>
                <Textarea defaultValue={editorData.address} className="bg-muted" readOnly />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section Imprimeur/Distributeur */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {depositType === "bd_logiciels" ? "Identification du distributeur" : "Identification de l'imprimeur"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {depositType === "bd_logiciels" ? "Nom du distributeur" : "Nom de l'imprimerie"}
                </Label>
                <Input defaultValue={printerData.name} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={printerData.email} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input defaultValue={printerData.phone} className="bg-muted" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Chiffre de tirage</Label>
                <Input defaultValue={printerData.printRun} className="bg-muted" readOnly />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Adresse</Label>
                <Textarea defaultValue={printerData.address} className="bg-muted" readOnly />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section Pièces à fournir avec upload */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pièces à fournir</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Vous pouvez maintenant joindre directement vos documents au formulaire. 
                Les documents marqués d'un astérisque (*) sont obligatoires.
              </p>
            </div>
            
            <div className="space-y-4">
              {renderFileUpload(
                "cover", 
                "Joindre la couverture (format JPG, moins de 1 MO)", 
                true, 
                "image/jpeg,image/jpg"
              )}
              
              {(depositType === "monographie" || depositType === "periodique") && 
                renderFileUpload(
                  "summary", 
                  "Joindre le sommaire (format PDF, moins de 2 MO)", 
                  true, 
                  "application/pdf"
                )
              }
              
              {renderFileUpload(
                "cin", 
                `Copie de la CIN de ${depositType === "periodique" ? "directeur de publication" : "l'auteur"}`, 
                true, 
                "image/jpeg,image/jpg,application/pdf"
              )}

              {depositType === "periodique" && (
                <>
                  {renderFileUpload(
                    "court-decision", 
                    "Décision du tribunal de première instance (pour les éditeurs non étatiques)", 
                    false, 
                    "application/pdf"
                  )}
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded">
                    <Checkbox id="active-url" />
                    <Label htmlFor="active-url" className="text-sm">
                      Pour les périodiques électroniques, confirmer que l'URL du site web est active et inclut les articles du premier numéro
                    </Label>
                  </div>
                </>
              )}

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
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleFormSubmit} className="flex-1">
            Soumettre la déclaration
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "confirmation") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <CardTitle>Déclaration soumise avec succès</CardTitle>
          <CardDescription>
            Votre déclaration de dépôt légal a été enregistrée. Vous recevrez une confirmation par email avec le numéro de dépôt légal attribué.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}