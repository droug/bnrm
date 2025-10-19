import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditorFormData {
  type: "morale" | "physique";
  // Commun
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  
  // Personne morale
  logoFile?: File;
  nameAr?: string;
  nameFr?: string;
  commerceRegistry?: string;
  contactPerson?: string;
  
  // Personne physique
  cin?: string;
  editorNameAr?: string;
  editorNameFr?: string;
  cinFile?: File;
  otherContact?: string;
}

const EditorSignupForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditorFormData>({
    type: "morale",
    email: "",
    phone: "+212 ",
    address: "",
    region: "",
    city: "",
  });

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Form data NOT logged for privacy - contains personal/business information
    
    toast({
      title: "Demande soumise",
      description: "Votre demande d'inscription éditeur a été soumise avec succès.",
    });
  };

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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Tabs value={formData.type} className="w-full">
            <TabsContent value="morale" className="space-y-4">
              {/* Formulaire personne morale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Nom de l'éditeur (Arabe) *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="اسم الناشر"
                    dir="rtl"
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
              <div className="space-y-2">
                <Label htmlFor="cin">Numéro CIN *</Label>
                <Input
                  id="cin"
                  value={formData.cin || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, cin: e.target.value }))}
                  placeholder="Numéro de la carte d'identité nationale"
                />
              </div>

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
                <Label htmlFor="cinFile">Copie numérisée de la CIN *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="cinFile"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload("cinFile", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="cinFile" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Télécharger la copie de la CIN</span>
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

            <div className="space-y-2">
              <Label htmlFor="address">Adresse physique *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète"
                rows={3}
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
                />
              </div>
            </div>
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