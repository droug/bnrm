import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";

interface PrinterFormData {
  logoFile?: File;
  nameAr: string;
  nameFr: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  commerceRegistry: string;
  contactPerson: string;
}

const PrinterSignupForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PrinterFormData>({
    nameAr: "",
    nameFr: "",
    email: "",
    phone: "",
    address: "",
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
    
    // Validation basique
    if (!formData.nameAr || !formData.nameFr || !formData.email || !formData.phone || !formData.address || !formData.commerceRegistry) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Ici, vous pourriez envoyer les données à votre API
    console.log("Données du formulaire imprimeur:", formData);
    
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

          {/* Nom de l'imprimeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr">Nom de l'imprimeur (Arabe) *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                placeholder="اسم المطبعة"
                dir="rtl"
                required
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

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations de contact</h3>
            
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
              <Label htmlFor="address">Adresse physique *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète de l'imprimerie"
                rows={3}
                required
              />
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
            <h3 className="text-lg font-semibold border-b pb-2">Informations légales</h3>
            
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