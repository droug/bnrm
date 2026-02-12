import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Building, X, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArabicInputWithKeyboard } from "@/components/ui/arabic-keyboard";
import { uploadProfessionalDocuments } from "@/lib/professionalFileUpload";
import { checkProfessionalEmailUniqueness } from "@/lib/checkProfessionalEmailUniqueness";

// Mapping des régions vers leurs villes
const citiesByRegion: Record<string, Array<{ value: string; label: string }>> = {
  "casablanca-settat": [
    { value: "casablanca", label: "Casablanca" },
    { value: "mohammedia", label: "Mohammedia" },
    { value: "el-jadida", label: "El Jadida" },
    { value: "settat", label: "Settat" },
    { value: "berrechid", label: "Berrechid" },
    { value: "benslimane", label: "Benslimane" },
    { value: "mediouna", label: "Médiouna" },
    { value: "nouaceur", label: "Nouaceur" },
  ],
  "rabat-sale-kenitra": [
    { value: "rabat", label: "Rabat" },
    { value: "sale", label: "Salé" },
    { value: "kenitra", label: "Kénitra" },
    { value: "temara", label: "Témara" },
    { value: "skhirat", label: "Skhirat" },
    { value: "khemisset", label: "Khémisset" },
    { value: "sidi-kacem", label: "Sidi Kacem" },
    { value: "sidi-slimane", label: "Sidi Slimane" },
  ],
  "marrakech-safi": [
    { value: "marrakech", label: "Marrakech" },
    { value: "safi", label: "Safi" },
    { value: "essaouira", label: "Essaouira" },
    { value: "el-kelaa-des-sraghna", label: "El Kelâa des Sraghna" },
    { value: "chichaoua", label: "Chichaoua" },
    { value: "youssoufia", label: "Youssoufia" },
    { value: "rehamna", label: "Rehamna" },
  ],
  "fes-meknes": [
    { value: "fes", label: "Fès" },
    { value: "meknes", label: "Meknès" },
    { value: "taza", label: "Taza" },
    { value: "ifrane", label: "Ifrane" },
    { value: "sefrou", label: "Sefrou" },
    { value: "moulay-yacoub", label: "Moulay Yacoub" },
    { value: "el-hajeb", label: "El Hajeb" },
    { value: "taounate", label: "Taounate" },
    { value: "boulemane", label: "Boulemane" },
  ],
  "tanger-tetouan-alhoceima": [
    { value: "tanger", label: "Tanger" },
    { value: "tetouan", label: "Tétouan" },
    { value: "al-hoceima", label: "Al Hoceïma" },
    { value: "larache", label: "Larache" },
    { value: "chefchaouen", label: "Chefchaouen" },
    { value: "fnideq", label: "Fnideq" },
    { value: "martil", label: "Martil" },
    { value: "mdiq", label: "M'diq" },
    { value: "ouazzane", label: "Ouazzane" },
  ],
  "souss-massa": [
    { value: "agadir", label: "Agadir" },
    { value: "inezgane", label: "Inezgane" },
    { value: "ait-melloul", label: "Aït Melloul" },
    { value: "taroudant", label: "Taroudant" },
    { value: "tiznit", label: "Tiznit" },
    { value: "chtouka-ait-baha", label: "Chtouka Aït Baha" },
    { value: "tata", label: "Tata" },
  ],
  "oriental": [
    { value: "oujda", label: "Oujda" },
    { value: "nador", label: "Nador" },
    { value: "berkane", label: "Berkane" },
    { value: "taourirt", label: "Taourirt" },
    { value: "jerada", label: "Jerada" },
    { value: "driouch", label: "Driouch" },
    { value: "figuig", label: "Figuig" },
    { value: "guercif", label: "Guercif" },
  ],
  "beni-mellal-khenifra": [
    { value: "beni-mellal", label: "Béni Mellal" },
    { value: "khouribga", label: "Khouribga" },
    { value: "fquih-ben-salah", label: "Fquih Ben Salah" },
    { value: "azilal", label: "Azilal" },
    { value: "khenifra", label: "Khénifra" },
    { value: "kasba-tadla", label: "Kasba Tadla" },
  ],
  "draa-tafilalet": [
    { value: "errachidia", label: "Errachidia" },
    { value: "ouarzazate", label: "Ouarzazate" },
    { value: "tinghir", label: "Tinghir" },
    { value: "zagora", label: "Zagora" },
    { value: "midelt", label: "Midelt" },
  ],
  "laayoune-sakia-elhamra": [
    { value: "laayoune", label: "Laâyoune" },
    { value: "boujdour", label: "Boujdour" },
    { value: "smara", label: "Smara" },
    { value: "tarfaya", label: "Tarfaya" },
  ],
  "guelmim-oued-noun": [
    { value: "guelmim", label: "Guelmim" },
    { value: "tan-tan", label: "Tan-Tan" },
    { value: "assa-zag", label: "Assa-Zag" },
    { value: "sidi-ifni", label: "Sidi Ifni" },
  ],
  "dakhla-oued-eddahab": [
    { value: "dakhla", label: "Dakhla" },
    { value: "aousserd", label: "Aousserd" },
  ],
};

interface EditorFormData {
  type: "morale" | "physique";
  nature: string;
  // Commun
  email: string;
  phone: string;
  address: string;
  googleMapsLink: string;
  region: string;
  city: string;
  
  // Personne morale
  logoFile?: File;
  nameAr?: string;
  nameFr?: string;
  commerceRegistry?: string;
  commerceRegistryFile?: File;
  contactPerson?: string;
  selectedEditor?: string;
  isOtherEditor?: boolean;
  
  // Personne physique
  cin?: string;
  editorNameAr?: string;
  editorNameFr?: string;
  cinFile?: File;
  photoFile?: File;
  otherContact?: string;
}

interface EditorSignupFormProps {
  prefillEmail?: string;
  prefillName?: string;
}

const EditorSignupForm = ({ prefillEmail, prefillName }: EditorSignupFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditorFormData>({
    type: "morale",
    nature: "",
    email: prefillEmail || "",
    phone: "+212 ",
    address: "",
    googleMapsLink: "",
    region: "",
    city: "",
    isOtherEditor: false,
    // Pré-remplir le nom si fourni
    nameFr: prefillName || "",
  });
  const [editors, setEditors] = useState<Array<{ id: string; name: string }>>([]);
  const [editorSearch, setEditorSearch] = useState("");
  const [showEditorDropdown, setShowEditorDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    const { data, error } = await supabase
      .from('publishers')
      .select('id, name')
      .order('name');
    
    if (!error && data) {
      setEditors(data);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields: string[] = [];
    
    // Validation des champs communs
    if (!formData.nature) missingFields.push(formData.type === "physique" ? "Genre" : "Nature de l'éditeur");
    if (!formData.email) missingFields.push("Adresse email");
    if (!formData.phone || formData.phone.trim() === "+212" || formData.phone.trim() === "+212 ") {
      missingFields.push("Téléphone");
    }
    if (!formData.address) missingFields.push("Adresse");
    if (!formData.region) missingFields.push("Région");
    if (!formData.city) missingFields.push("Ville");
    
    // Validation selon le type d'éditeur
    if (formData.type === "morale") {
      // Nom arabe optionnel
      if (!formData.nameFr) missingFields.push("Nom de l'éditeur (Français)");
      if (!formData.commerceRegistry) missingFields.push("Registre de commerce");
      // Google Maps n'est plus obligatoire
    } else {
      // Personne physique - Nom arabe optionnel
      if (!formData.editorNameFr) missingFields.push("Nom de l'éditeur (Français)");
      if (!formData.cin) missingFields.push("Numéro CIN");
      if (!formData.cinFile) missingFields.push("Copie numérisée de la CNIE");
    }
    
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      // Scroll to top to ensure user sees the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Clear errors if validation passes
    setValidationErrors([]);

    try {
      setIsSubmitting(true);

      // Vérifier l'unicité de l'email
      const emailCheck = await checkProfessionalEmailUniqueness(formData.email, 'editor');
      if (!emailCheck.allowed) {
        toast({
          title: "Email déjà utilisé",
          description: emailCheck.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate a temporary reference number
      const tempRefNumber = `REQ-ED-${Date.now().toString(36).toUpperCase()}`;

      // Upload files to storage
      const fileUrls = await uploadProfessionalDocuments(
        {
          logoFile: formData.logoFile,
          commerceRegistryFile: formData.commerceRegistryFile,
          cinFile: formData.cinFile,
          photoFile: formData.photoFile,
        },
        'editor',
        tempRefNumber
      );

      // Prepare registration data with file URLs
      const registrationData = {
        type: formData.type,
        nature: formData.nature,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        google_maps_link: formData.googleMapsLink || null,
        region: formData.region,
        city: formData.city,
        contact_name: formData.type === "morale" ? formData.contactPerson : formData.otherContact,
        // Include file URLs
        ...fileUrls,
        ...(formData.type === "morale" ? {
          name_ar: formData.nameAr,
          name_fr: formData.nameFr,
          commerce_registry: formData.commerceRegistry,
          selected_editor: formData.selectedEditor,
        } : {
          name_ar: formData.editorNameAr,
          name_fr: formData.editorNameFr,
          cin: formData.cin,
        })
      };

      const companyName = formData.type === "morale" 
        ? formData.nameFr || formData.nameAr 
        : formData.editorNameFr || formData.editorNameAr;

      // Insert into professional_registration_requests
      const { error } = await supabase
        .from('professional_registration_requests')
        .insert({
          professional_type: 'editor',
          verified_deposit_number: tempRefNumber,
          company_name: companyName,
          registration_data: registrationData,
          cndp_acceptance: true,
          status: 'pending'
        });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEditors = editors.filter(editor =>
    editor.name.toLowerCase().includes(editorSearch.toLowerCase())
  );

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center">Demande envoyée avec succès</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Votre demande d'inscription a été envoyée pour validation par la BNRM. 
            Vous recevrez une notification par email une fois votre compte validé.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Le délai de traitement est de 10 jours ouvrables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          Inscription Compte Éditeur
        </CardTitle>
        <CardDescription>
          Créez votre compte éditeur pour accéder aux services de dépôt légal
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-2">
          <span className="text-destructive font-medium">Note :</span> Les nouveaux comptes seront validés par la BNRM.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message d'erreur de validation */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Champs obligatoires manquants</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Veuillez remplir les champs suivants :</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="font-medium">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Type d'éditeur */}
          <div className="space-y-3">
            <Label>Type d'éditeur</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={(value: "morale" | "physique") => 
                setFormData(prev => ({ ...prev, type: value }))
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morale" id="morale" />
                <Label htmlFor="morale" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Personne morale
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="physique" id="physique" />
                <Label htmlFor="physique" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personne physique
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nature de l'éditeur / Genre */}
          <div className="space-y-2">
            <Label htmlFor="nature">
              {formData.type === "physique" ? "Genre *" : "Nature de l'éditeur *"}
            </Label>
            <Select 
              value={formData.nature}
              onValueChange={(value) => setFormData(prev => ({ ...prev, nature: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.type === "physique" ? "Sélectionnez le genre" : "Sélectionnez la nature"} />
              </SelectTrigger>
              <SelectContent>
                {formData.type === "physique" ? (
                  <>
                    <SelectItem value="homme">Homme</SelectItem>
                    <SelectItem value="femme">Femme</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="publique">Publique</SelectItem>
                    <SelectItem value="prive">Privé</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={formData.type} className="w-full">
            <TabsContent value="morale" className="space-y-4">
              {/* Formulaire personne morale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Nom de l'éditeur (Arabe)</Label>
                  <ArabicInputWithKeyboard
                    value={formData.nameAr || ""}
                    onChange={(value) => setFormData(prev => ({ ...prev, nameAr: value }))}
                    placeholder="اسم الناشر"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameFr">Nom de l'éditeur (Français) *</Label>
                  <Input
                    id="nameFr"
                    value={formData.nameFr || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameFr: e.target.value }))}
                    placeholder="Nom de l'éditeur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l'éditeur</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("logoFile", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="logo" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Cliquez pour télécharger le logo</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commerceRegistry">Registre de commerce *</Label>
                  <Input
                    id="commerceRegistry"
                    value={formData.commerceRegistry || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, commerceRegistry: e.target.value }))}
                    placeholder="Numéro du registre de commerce"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commerceRegistryFile">Pièce jointe RC *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                    <input
                      type="file"
                      id="commerceRegistryFile"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("commerceRegistryFile", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="commerceRegistryFile" className="cursor-pointer flex flex-col items-center gap-1">
                      {formData.commerceRegistryFile ? (
                        <>
                          <Upload className="h-5 w-5 text-primary" />
                          <span className="text-xs text-primary font-medium truncate max-w-full">{formData.commerceRegistryFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-600">Télécharger le RC</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Personne à contacter</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nom de la personne de contact"
                />
              </div>
            </TabsContent>

            <TabsContent value="physique" className="space-y-4">
              {/* Formulaire personne physique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editorNameAr">Nom de l'éditeur (Arabe)</Label>
                  <ArabicInputWithKeyboard
                    value={formData.editorNameAr || ""}
                    onChange={(value) => setFormData(prev => ({ ...prev, editorNameAr: value }))}
                    placeholder="اسم الناشر"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editorNameFr">Nom de l'éditeur (Français) *</Label>
                  <Input
                    id="editorNameFr"
                    value={formData.editorNameFr || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, editorNameFr: e.target.value }))}
                    placeholder="Nom de l'éditeur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cin">Numéro CIN *</Label>
                <Input
                  id="cin"
                  value={formData.cin || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, cin: e.target.value }))}
                  placeholder="Numéro de la carte d'identité nationale"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinFile">Copie numérisée de la CNIE *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="cinFile"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload("cinFile", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="cinFile" className="cursor-pointer flex flex-col items-center gap-2">
                    {formData.cinFile ? (
                      <>
                        <Upload className="h-8 w-8 text-primary" />
                        <span className="text-sm text-primary font-medium">{formData.cinFile.name}</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span className="text-sm text-gray-600">Télécharger la copie de la CNIE</span>
                        <span className="text-xs text-gray-500">Recto et verso de votre carte nationale</span>
                      </>
                    )}
                  </label>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="otherContact">Autre contact</Label>
                <Input
                  id="otherContact"
                  value={formData.otherContact || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherContact: e.target.value }))}
                  placeholder="Contact supplémentaire"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Informations communes */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-2xl font-semibold">Informations de contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg bg-muted/30 min-w-[100px]">
                    <span className="text-lg">🇲🇦</span>
                    <span className="text-sm font-medium">+212</span>
                  </div>
                  <Input
                    id="phone"
                    value={formData.phone.replace('+212', '').trim()}
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^\d\s]/g, '');
                      setFormData(prev => ({ ...prev, phone: `+212 ${phoneNumber}` }));
                    }}
                    placeholder="6 XX XX XX XX"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Indicatif du Maroc (+212) uniquement
                </p>
              </div>
            </div>

            {/* Adresse au Maroc */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse au Maroc *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète de l'établissement"
              />
            </div>

            {formData.type === "morale" && (
              <div className="space-y-2">
                <Label htmlFor="googleMapsLink">Lien Google Maps (optionnel)</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 py-2 border border-input rounded-lg bg-muted/30">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="googleMapsLink"
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                    placeholder="https://maps.google.com/?q=..."
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Collez le lien de localisation Google Maps de votre établissement (facultatif)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région *</Label>
                <Select 
                  value={formData.region}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value, city: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casablanca-settat">Casablanca-Settat</SelectItem>
                    <SelectItem value="rabat-sale-kenitra">Rabat-Salé-Kénitra</SelectItem>
                    <SelectItem value="marrakech-safi">Marrakech-Safi</SelectItem>
                    <SelectItem value="fes-meknes">Fès-Meknès</SelectItem>
                    <SelectItem value="tanger-tetouan-alhoceima">Tanger-Tétouan-Al Hoceïma</SelectItem>
                    <SelectItem value="souss-massa">Souss-Massa</SelectItem>
                    <SelectItem value="oriental">Oriental</SelectItem>
                    <SelectItem value="beni-mellal-khenifra">Béni Mellal-Khénifra</SelectItem>
                    <SelectItem value="draa-tafilalet">Drâa-Tafilalet</SelectItem>
                    <SelectItem value="laayoune-sakia-elhamra">Laâyoune-Sakia El Hamra</SelectItem>
                    <SelectItem value="guelmim-oued-noun">Guelmim-Oued Noun</SelectItem>
                    <SelectItem value="dakhla-oued-eddahab">Dakhla-Oued Ed-Dahab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Select 
                  value={formData.city}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                  disabled={!formData.region}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.region ? "Sélectionnez une ville" : "Sélectionnez d'abord une région"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {formData.region && citiesByRegion[formData.region]?.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Note importante :</h4>
            <p className="text-sm text-muted-foreground">
              Votre demande sera examinée par nos services dans un délai de 10 jours ouvrables. 
              Vous recevrez une confirmation par email une fois votre compte validé.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Soumettre la demande d'inscription
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditorSignupForm;