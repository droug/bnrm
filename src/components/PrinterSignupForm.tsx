import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Printer, AlertCircle, MapPin, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { ArabicInputWithKeyboard } from "@/components/ui/arabic-keyboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { uploadProfessionalDocuments } from "@/lib/professionalFileUpload";

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

interface PrinterFormData {
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
  nameAr: string;
  nameFr: string;
  commerceRegistry: string;
  commerceRegistryFile?: File;
  contactPerson: string;
  
  // Personne physique
  cin?: string;
  printerNameAr?: string;
  printerNameFr?: string;
  cinFile?: File;
  otherContact?: string;
}

interface PrinterSignupFormProps {
  prefillEmail?: string;
  prefillName?: string;
}

const PrinterSignupForm = ({ prefillEmail, prefillName }: PrinterSignupFormProps) => {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PrinterFormData>({
    type: "morale",
    nature: "",
    nameAr: "",
    nameFr: prefillName || "",
    email: prefillEmail || "",
    phone: "+212 ",
    address: "",
    googleMapsLink: "",
    region: "",
    city: "",
    commerceRegistry: "",
    contactPerson: "",
  });

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields: string[] = [];
    
    // Validation des champs communs
    if (!formData.nature) missingFields.push("Nature de l'imprimeur");
    if (!formData.email) missingFields.push("Adresse email");
    if (!formData.phone || formData.phone.trim() === "+212" || formData.phone.trim() === "+212 ") {
      missingFields.push("Téléphone");
    }
    if (!formData.address) missingFields.push("Adresse");
    if (!formData.region) missingFields.push("Région");
    if (!formData.city) missingFields.push("Ville");
    
    // Validation personne morale uniquement
    if (!formData.nameFr) missingFields.push("Nom de l'imprimeur (Français)");
    if (!formData.commerceRegistry) missingFields.push("Registre de commerce");
    
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setValidationErrors([]);
    
    try {
      setIsSubmitting(true);

      // Generate a temporary reference number
      const tempRefNumber = `REQ-PR-${Date.now().toString(36).toUpperCase()}`;

      // Upload files to storage
      const fileUrls = await uploadProfessionalDocuments(
        {
          logoFile: formData.logoFile,
          commerceRegistryFile: formData.commerceRegistryFile,
          cinFile: formData.cinFile,
        },
        'printer',
        tempRefNumber
      );

      // Prepare registration data with file URLs
      const registrationData = {
        type: 'morale',
        nature: formData.nature,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        google_maps_link: formData.googleMapsLink || null,
        region: formData.region,
        city: formData.city,
        contact_name: formData.contactPerson,
        // Include file URLs
        ...fileUrls,
        name_ar: formData.nameAr,
        name_fr: formData.nameFr,
        commerce_registry: formData.commerceRegistry,
      };

      const companyName = formData.nameFr || formData.nameAr;

      // Insert into professional_registration_requests
      const { error } = await supabase
        .from('professional_registration_requests')
        .insert({
          professional_type: 'printer',
          verified_deposit_number: tempRefNumber,
          company_name: companyName,
          registration_data: registrationData,
          cndp_acceptance: true,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande soumise",
        description: "Votre demande d'inscription imprimeur a été soumise avec succès. Vous recevrez une notification après validation par la BNRM.",
      });
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-6 w-6" />
          Inscription Compte Imprimeur
        </CardTitle>
        <CardDescription>
          Créez votre compte imprimeur pour accéder aux services de dépôt légal
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
          
          {/* Nature de l'imprimeur */}
          <div className="space-y-2">
            <Label htmlFor="nature">Nature de l'imprimeur *</Label>
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

          {/* Formulaire personne morale */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">Nom de l'imprimeur (Arabe)</Label>
                <ArabicInputWithKeyboard
                  value={formData.nameAr}
                  onChange={(value) => setFormData(prev => ({ ...prev, nameAr: value }))}
                  placeholder="اسم المطبعة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameFr">Nom de l'imprimeur (Français) *</Label>
                <Input
                  id="nameFr"
                  value={formData.nameFr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameFr: e.target.value }))}
                  placeholder="Nom de l'imprimeur"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo de l'imprimeur</Label>
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
                  {formData.logoFile && (
                    <span className="text-sm text-green-600">Fichier sélectionné: {formData.logoFile.name}</span>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commerceRegistry">Registre de commerce *</Label>
                <Input
                  id="commerceRegistry"
                  value={formData.commerceRegistry}
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
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="Nom de la personne de contact"
              />
            </div>
          </div>

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

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
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

export default PrinterSignupForm;