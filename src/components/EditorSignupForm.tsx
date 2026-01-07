import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Building, X, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArabicInputWithKeyboard } from "@/components/ui/arabic-keyboard";

interface EditorFormData {
  type: "morale" | "physique";
  nature: string;
  // Commun
  email: string;
  phone: string;
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

const EditorSignupForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditorFormData>({
    type: "morale",
    nature: "",
    email: "",
    phone: "+212 ",
    googleMapsLink: "",
    region: "",
    city: "",
    isOtherEditor: false,
  });
  const [editors, setEditors] = useState<Array<{ id: string; name: string }>>([]);
  const [editorSearch, setEditorSearch] = useState("");
  const [showEditorDropdown, setShowEditorDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
    if (!formData.nature) missingFields.push("Nature de l'éditeur");
    if (!formData.email) missingFields.push("Adresse email");
    if (!formData.phone || formData.phone.trim() === "+212" || formData.phone.trim() === "+212 ") {
      missingFields.push("Téléphone");
    }
    if (!formData.region) missingFields.push("Région");
    if (!formData.city) missingFields.push("Ville");
    
    // Validation selon le type d'éditeur
    if (formData.type === "morale") {
      if (!formData.nameAr) missingFields.push("Nom de l'éditeur (Arabe)");
      if (!formData.nameFr) missingFields.push("Nom de l'éditeur (Français)");
      if (!formData.commerceRegistry) missingFields.push("Registre de commerce");
      if (!formData.googleMapsLink) missingFields.push("Lien Google Maps");
    } else {
      // Personne physique
      if (!formData.editorNameAr) missingFields.push("Nom de l'éditeur (Arabe)");
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

    // Form data NOT logged for privacy - contains personal/business information
    
    toast({
      title: "Demande soumise",
      description: "Votre demande d'inscription éditeur a été soumise avec succès.",
    });
  };

  const filteredEditors = editors.filter(editor =>
    editor.name.toLowerCase().includes(editorSearch.toLowerCase())
  );

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

          {/* Nature de l'éditeur */}
          <div className="space-y-2">
            <Label htmlFor="nature">Nature de l'éditeur *</Label>
            <Select 
              value={formData.nature}
              onValueChange={(value) => setFormData(prev => ({ ...prev, nature: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la nature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publique">Publique</SelectItem>
                <SelectItem value="prive">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={formData.type} className="w-full">
            <TabsContent value="morale" className="space-y-4">
              {/* Formulaire personne morale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Nom de l'éditeur (Arabe) *</Label>
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
                  <Label htmlFor="editorNameAr">Nom de l'éditeur (Arabe) *</Label>
                  <Input
                    id="editorNameAr"
                    value={formData.editorNameAr || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, editorNameAr: e.target.value }))}
                    placeholder="اسم الناشر"
                    dir="rtl"
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

            {formData.type === "morale" && (
              <div className="space-y-2">
                <Label htmlFor="googleMapsLink">Lien Google Maps *</Label>
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
                  Collez le lien de localisation Google Maps de votre établissement
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
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
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Nom de la ville"
                />
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