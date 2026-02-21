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
import { supabase } from "@/integrations/supabase/client";
import { ServicePageBackground } from "@/components/ServicePageBackground";

export default function RestorationRequest() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    statutDemandeur: "",
    name: "",
    cnie: "",
    typeInstitution: "",
    email: "",
    phone: "",
    region: "",
    ville: "",
    documentType: "",
    description: "",
    urgency: "normal",
    autorisation: "",
    autorisationPhoto: ""
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

  // Villes par région
  const villesParRegion: Record<string, { value: string; label: string }[]> = {
    "tanger-tetouan-al-hoceima": [
      { value: "tanger", label: "Tanger" },
      { value: "tetouan", label: "Tétouan" },
      { value: "al-hoceima", label: "Al Hoceïma" },
      { value: "larache", label: "Larache" },
      { value: "ksar-el-kebir", label: "Ksar El Kébir" },
      { value: "chefchaouen", label: "Chefchaouen" }
    ],
    "oriental": [
      { value: "oujda", label: "Oujda" },
      { value: "nador", label: "Nador" },
      { value: "berkane", label: "Berkane" },
      { value: "taourirt", label: "Taourirt" },
      { value: "jerada", label: "Jerada" }
    ],
    "fes-meknes": [
      { value: "fes", label: "Fès" },
      { value: "meknes", label: "Meknès" },
      { value: "taza", label: "Taza" },
      { value: "sefrou", label: "Sefrou" },
      { value: "el-hajeb", label: "El Hajeb" },
      { value: "ifrane", label: "Ifrane" }
    ],
    "rabat-sale-kenitra": [
      { value: "rabat", label: "Rabat" },
      { value: "sale", label: "Salé" },
      { value: "kenitra", label: "Kénitra" },
      { value: "temara", label: "Témara" },
      { value: "skhirat", label: "Skhirat" },
      { value: "khemisset", label: "Khémisset" }
    ],
    "beni-mellal-khenifra": [
      { value: "beni-mellal", label: "Béni Mellal" },
      { value: "khouribga", label: "Khouribga" },
      { value: "khenifra", label: "Khénifra" },
      { value: "azilal", label: "Azilal" },
      { value: "fquih-ben-salah", label: "Fquih Ben Salah" }
    ],
    "casablanca-settat": [
      { value: "casablanca", label: "Casablanca" },
      { value: "mohammedia", label: "Mohammedia" },
      { value: "el-jadida", label: "El Jadida" },
      { value: "settat", label: "Settat" },
      { value: "berrechid", label: "Berrechid" },
      { value: "benslimane", label: "Benslimane" }
    ],
    "marrakech-safi": [
      { value: "marrakech", label: "Marrakech" },
      { value: "safi", label: "Safi" },
      { value: "essaouira", label: "Essaouira" },
      { value: "el-kelaa-des-sraghna", label: "El Kelâa des Sraghna" },
      { value: "youssoufia", label: "Youssoufia" }
    ],
    "draa-tafilalet": [
      { value: "errachidia", label: "Errachidia" },
      { value: "ouarzazate", label: "Ouarzazate" },
      { value: "zagora", label: "Zagora" },
      { value: "tinghir", label: "Tinghir" },
      { value: "midelt", label: "Midelt" }
    ],
    "souss-massa": [
      { value: "agadir", label: "Agadir" },
      { value: "inezgane", label: "Inezgane" },
      { value: "tiznit", label: "Tiznit" },
      { value: "taroudant", label: "Taroudant" },
      { value: "ouled-teima", label: "Ouled Teïma" }
    ],
    "guelmim-oued-noun": [
      { value: "guelmim", label: "Guelmim" },
      { value: "tan-tan", label: "Tan-Tan" },
      { value: "sidi-ifni", label: "Sidi Ifni" }
    ],
    "laayoune-sakia-el-hamra": [
      { value: "laayoune", label: "Laâyoune" },
      { value: "boujdour", label: "Boujdour" },
      { value: "tarfaya", label: "Tarfaya" }
    ],
    "dakhla-oued-ed-dahab": [
      { value: "dakhla", label: "Dakhla" },
      { value: "aousserd", label: "Aousserd" }
    ]
  };

  // Obtenir les villes de la région sélectionnée
  const villesDisponibles = formData.region ? villesParRegion[formData.region] || [] : [];
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

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map urgency to database format
      const urgencyMap: Record<string, string> = {
        'normal': 'faible',
        'urgent': 'moyenne',
        'very-urgent': 'elevee'
      };

      // Insert into database
      const { data, error } = await supabase
        .from('restoration_requests')
        .insert([{
          user_id: user.id,
          manuscript_title: formData.documentType,
          manuscript_cote: '',
          damage_description: formData.description,
          urgency_level: urgencyMap[formData.urgency] || 'faible',
          status: 'soumise',
          user_notes: `Nom: ${formData.name}\nEmail: ${formData.email}\nTéléphone: ${formData.phone || 'Non fourni'}\nStatut: ${formData.statutDemandeur}${formData.typeInstitution ? `\nType institution: ${formData.typeInstitution}` : ''}${formData.region ? `\nRégion: ${formData.region}` : ''}${formData.ville ? `\nVille: ${formData.ville}` : ''}`,
          submitted_at: new Date().toISOString()
        }] as any)
        .select()
        .single();

      if (error) throw error;

      // Envoyer la notification par email
      if (data) {
        try {
          await supabase.functions.invoke('send-restoration-notification', {
            body: {
              requestId: data.id,
              recipientEmail: user.email,
              recipientId: user.id,
              notificationType: 'request_received',
              requestNumber: data.request_number,
              manuscriptTitle: formData.documentType
            }
          });
        } catch (emailError) {
          console.error('Erreur notification email:', emailError);
          // Ne pas bloquer même si l'email échoue
        }
      }

      toast({
        title: "Demande envoyée",
        description: "Votre demande de restauration a été envoyée avec succès. Nous vous contacterons bientôt.",
      });

      setIsOpen(false);
      setTimeout(() => navigate("/my-space"), 2000);
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
      [name]: value,
      // Réinitialiser la ville si on change de région
      ...(name === "region" && { ville: "" })
    }));
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ServicePageBackground />
      <Header />
      
      <main className="flex-1 py-16 relative z-10">
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

                {formData.statutDemandeur === "institution" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="typeInstitution">Type d'institution *</Label>
                    <select
                      id="typeInstitution"
                      name="typeInstitution"
                      value={formData.typeInstitution}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="bibliotheque-patrimoniale">Bibliothèque patrimoniale</option>
                      <option value="musee">Musée</option>
                      <option value="archive">Archive</option>
                      <option value="centre-culturel">Centre culturel</option>
                      <option value="universite">Université/Institut de recherche</option>
                      <option value="fondation">Fondation</option>
                      <option value="association-culturelle">Association culturelle</option>
                      <option value="ministere">Ministère</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                )}

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
                        options={villesDisponibles}
                        placeholder={formData.region ? "Sélectionnez une ville" : "Sélectionnez d'abord une région"}
                        disabled={!formData.region}
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
                Photos de l'œuvre
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

            {/* Autorisation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Autorisation</h3>
              
              <div className="space-y-3">
                <Label className="text-base">
                  Autorisez-vous la BNRM à conserver et exploiter une copie numérique de l'œuvre ?
                </Label>
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="autorisation"
                      value="oui"
                      checked={formData.autorisation === "oui"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-input focus:ring-2 focus:ring-ring"
                    />
                    <span>Oui</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="autorisation"
                      value="non"
                      checked={formData.autorisation === "non"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-input focus:ring-2 focus:ring-ring"
                    />
                    <span>Non</span>
                  </label>
                </div>
              </div>

              {formData.autorisation === "non" && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <Label className="text-base">
                    Autorisez-vous la prise d'une photographie de l'état de l'œuvre avant sa restauration, à des fins de comparaison avec l'état après restauration et d'utilisation non lucrative ?
                  </Label>
                  
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="autorisationPhoto"
                        value="oui"
                        checked={formData.autorisationPhoto === "oui"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-input focus:ring-2 focus:ring-ring"
                      />
                      <span>Oui</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="autorisationPhoto"
                        value="non"
                        checked={formData.autorisationPhoto === "non"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-input focus:ring-2 focus:ring-ring"
                      />
                      <span>Non</span>
                    </label>
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
                  window.history.length > 1 ? navigate(-1) : navigate('/');
                }}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
