import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, User, Mail, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleDropdown } from "@/components/ui/simple-dropdown";

export default function RestorationRequest() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    statutDemandeur: "",
    name: "",
    cnie: "",
    email: "",
    phone: "",
    region: "",
    ville: "",
    documentType: "",
    description: "",
    urgency: "normal"
  });

  // Options pour les régions du Maroc
  const regionsMaroc = [
    { value: "tanger-tetouan-al-hoceima", label: "Tanger-Tétouan-Al Hoceïma" },
    { value: "oriental", label: "L'Oriental" },
    { value: "fes-meknes", label: "Fès-Meknès" },
    { value: "rabat-sale-kenitra", label: "Rabat-Salé-Kénitra" },
    { value: "beni-mellal-khenifra", label: "Béni Mellal-Khénifra" },
    { value: "casablanca-settat", label: "Casablanca-Settat" },
    { value: "marrakech-safi", label: "Marrakech-Safi" },
    { value: "draa-tafilalet", label: "Drâa-Tafilalet" },
    { value: "souss-massa", label: "Souss-Massa" },
    { value: "guelmim-oued-noun", label: "Guelmim-Oued Noun" },
    { value: "laayoune-sakia-el-hamra", label: "Laâyoune-Sakia El Hamra" },
    { value: "dakhla-oued-ed-dahab", label: "Dakhla-Oued Ed-Dahab" }
  ];

  // Options pour les villes (exemple simplifié, à compléter selon les besoins)
  const villesMaroc = [
    { value: "rabat", label: "Rabat" },
    { value: "casablanca", label: "Casablanca" },
    { value: "fes", label: "Fès" },
    { value: "marrakech", label: "Marrakech" },
    { value: "tanger", label: "Tanger" },
    { value: "agadir", label: "Agadir" },
    { value: "meknes", label: "Meknès" },
    { value: "oujda", label: "Oujda" },
    { value: "kenitra", label: "Kénitra" },
    { value: "tetouan", label: "Tétouan" },
    { value: "sale", label: "Salé" },
    { value: "temara", label: "Témara" },
    { value: "safi", label: "Safi" },
    { value: "mohammedia", label: "Mohammedia" },
    { value: "khouribga", label: "Khouribga" },
    { value: "beni-mellal", label: "Béni Mellal" },
    { value: "el-jadida", label: "El Jadida" },
    { value: "nador", label: "Nador" },
    { value: "settat", label: "Settat" },
    { value: "larache", label: "Larache" }
  ];
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.statutDemandeur || !formData.name || !formData.email || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez uploader au moins une image de l'œuvre",
        variant: "destructive"
      });
      return;
    }

    // Simulate submission
    toast({
      title: "Demande envoyée",
      description: "Votre demande de restauration a été envoyée avec succès. Nous vous contacterons bientôt.",
    });

    setIsOpen(false);
    setTimeout(() => navigate("/"), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Service de Restauration</h1>
            <p className="text-lg text-muted-foreground">
              Confiez-nous la restauration de vos documents et œuvres précieuses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Équipe de restaurateurs qualifiés avec des années d'expérience
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Techniques</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Méthodes traditionnelles et technologies modernes de restauration
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Préservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Respect du patrimoine et conservation à long terme
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => setIsOpen(true)}
              className="px-8"
            >
              <FileText className="mr-2 h-5 w-5" />
              Demande de restauration
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Demande de Restauration</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour soumettre votre demande de restauration
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Vos informations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="statutDemandeur">Statut demandeur *</Label>
                  <select
                    id="statutDemandeur"
                    name="statutDemandeur"
                    value={formData.statutDemandeur}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Sélectionnez un statut</option>
                    <option value="particulier">Particulier</option>
                    <option value="institution">Institution</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    required
                  />
                </div>

                {formData.statutDemandeur === "particulier" && (
                  <div className="space-y-2">
                    <Label htmlFor="cnie">Numéro CNIE</Label>
                    <Input
                      id="cnie"
                      name="cnie"
                      value={formData.cnie}
                      onChange={handleInputChange}
                      placeholder="Ex: AB123456"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+212 600 000 000"
                  />
                </div>

                {formData.statutDemandeur === "particulier" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="region">Région</Label>
                      <SimpleDropdown
                        value={formData.region}
                        onChange={(value) => handleDropdownChange("region", value)}
                        options={regionsMaroc}
                        placeholder="Sélectionnez une région"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ville">Ville</Label>
                      <SimpleDropdown
                        value={formData.ville}
                        onChange={(value) => handleDropdownChange("ville", value)}
                        options={villesMaroc}
                        placeholder="Sélectionnez une ville"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgence</Label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="normal">Normale</option>
                    <option value="urgent">Urgente</option>
                    <option value="very-urgent">Très urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informations sur l'œuvre */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations sur l'œuvre
              </h3>

              <div className="space-y-2">
                <Label htmlFor="documentType">Type de document/œuvre *</Label>
                <Input
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  placeholder="Ex: Manuscrit, livre ancien, peinture, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez l'état du document, les dommages observés, l'historique, etc."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </div>

            {/* Upload de fichiers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Photos de l'œuvre *
              </h3>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  id="files"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                />
                <Label
                  htmlFor="files"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Cliquez pour uploader des images ou PDF
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, PDF (Max 20MB par fichier)
                  </span>
                </Label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Fichiers sélectionnés ({selectedFiles.length})</Label>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-accent/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  navigate(-1);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                Envoyer la demande
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
