import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Printer, AlertCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { ArabicInputWithKeyboard } from "@/components/ui/arabic-keyboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PrinterFormData {
  logoFile?: File;
  nameAr: string;
  nameFr: string;
  email: string;
  phone: string;
  googleMapsLink: string;
  region: string;
  city: string;
  commerceRegistry: string;
  contactPerson: string;
}

const PrinterSignupForm = () => {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<PrinterFormData>({
    nameAr: "",
    nameFr: "",
    email: "",
    phone: "",
    googleMapsLink: "",
    region: "",
    city: "",
    commerceRegistry: "",
    contactPerson: "",
  });

  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({ ...prev, logoFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields: string[] = [];
    
    if (!formData.nameAr) missingFields.push("Nom de l'imprimeur (Arabe)");
    if (!formData.nameFr) missingFields.push("Nom de l'imprimeur (Français)");
    if (!formData.email) missingFields.push("Adresse email");
    if (!formData.phone) missingFields.push("Téléphone");
    if (!formData.googleMapsLink) missingFields.push("Lien Google Maps");
    if (!formData.region) missingFields.push("Région");
    if (!formData.city) missingFields.push("Ville");
    if (!formData.commerceRegistry) missingFields.push("Registre de commerce");
    
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setValidationErrors([]);
    
    toast({
      title: "Demande soumise",
      description: "Votre demande d'inscription imprimeur a été soumise avec succès.",
    });
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
          
          {/* Nom de l'imprimeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr">Nom de l'imprimeur (Arabe) *</Label>
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
                required
              />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo de l'imprimeur</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
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

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold border-b pb-2">Informations de contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <PhoneInput
                  id="phone"
                  defaultCountry="MA"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  placeholder="6 XX XX XX XX"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  L'indicatif du pays est ajouté automatiquement selon votre sélection.
                </p>
              </div>
            </div>

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
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations légales */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold border-b pb-2">Informations légales</h3>
            
            <div className="space-y-2">
              <Label htmlFor="commerceRegistry">Registre de commerce *</Label>
              <Input
                id="commerceRegistry"
                value={formData.commerceRegistry}
                onChange={(e) => setFormData(prev => ({ ...prev, commerceRegistry: e.target.value }))}
                placeholder="Numéro du registre de commerce"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Personne à contacter</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="Nom et fonction de la personne de contact"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Note importante :</h4>
            <p className="text-sm text-muted-foreground">
              Votre demande sera examinée par nos services dans un délai de 5 à 10 jours ouvrables. 
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