import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
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

  const depositTypeLabels = {
    monographie: "Monographies",
    periodique: "Publications Périodiques",
    bd_logiciels: "Bases de données, Logiciels et Documents audiovisuels",
    collections_specialisees: "Collections spécialisées"
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

    // Submit form data
    console.log("Submitting declaration:", {
      type: depositType,
      editor: editorData,
      printer: printerData,
      declaration: formData
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
          <CardTitle>Authentification Imprimeur</CardTitle>
          <CardDescription>
            {userType === "editor" ? 
              "En attente de l'identification de l'imprimeur partenaire" : 
              "Veuillez vous identifier en tant qu'imprimeur"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userType === "editor" ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                En attente de la confirmation de l'imprimeur partenaire...
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handlePartnerConfirmation}
              >
                Simuler la confirmation de l'imprimeur
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="printer-name">Nom de l'imprimerie</Label>
                <Input id="printer-name" placeholder="Nom de l'imprimerie" />
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
      <Card className="w-full max-w-4xl mx-auto">
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
              Imprimeur confirmé
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
          {/* Section Auteur */}
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
                    <SelectItem value="morale">Personne morale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nom de l'auteur</Label>
                <Input placeholder="Nom complet de l'auteur" />
              </div>
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
            </div>
          </div>

          <Separator />

          {/* Section Publication */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Identification de la publication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Titre de {depositType === "periodique" ? "la publication" : "l'ouvrage"}</Label>
                <Input placeholder="Titre complet" />
              </div>
              
              {depositType !== "bd_logiciels" && (
                <div className="space-y-2">
                  <Label>Type de support</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le support" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="papier">Papier</SelectItem>
                      <SelectItem value="numerique">Numérique</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {depositType === "periodique" && (
                <>
                  <div className="space-y-2">
                    <Label>Périodicité</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Fréquence de publication" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quotidien">Quotidien</SelectItem>
                        <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                        <SelectItem value="mensuel">Mensuel</SelectItem>
                        <SelectItem value="trimestriel">Trimestriel</SelectItem>
                        <SelectItem value="semestriel">Semestriel</SelectItem>
                        <SelectItem value="annuel">Annuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fascicule N°</Label>
                    <Input placeholder="Numéro du fascicule" />
                  </div>
                </>
              )}

              {depositType === "monographie" && (
                <>
                  <div className="space-y-2">
                    <Label>Nombre de volumes</Label>
                    <Input type="number" placeholder="Nombre de volumes" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre de pages</Label>
                    <Input type="number" placeholder="Nombre total de pages" />
                  </div>
                  <div className="space-y-2">
                    <Label>Première demande d'ISBN</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Oui / Non" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oui">Oui</SelectItem>
                        <SelectItem value="non">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Langue</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Langue principale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="es">Espagnol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Disciplines</Label>
                <Input placeholder="Domaine(s) de la publication" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Mots clés</Label>
                <Input placeholder="Mots clés séparés par des virgules" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Résumé de {depositType === "periodique" ? "la publication" : "l'ouvrage"}</Label>
                <Textarea 
                  placeholder="Résumé détaillé du contenu" 
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section Pièces à fournir */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pièces à fournir</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="cover" />
                <Label htmlFor="cover">Couverture (format JPG, moins de 1 Mo)</Label>
              </div>
              
              {(depositType === "monographie" || depositType === "periodique") && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="summary" />
                  <Label htmlFor="summary">Sommaire (format PDF, moins de 2 Mo)</Label>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox id="cin" />
                <Label htmlFor="cin">
                  Copie de la CIN de {depositType === "periodique" ? "directeur de publication" : "l'auteur"}
                </Label>
              </div>

              {depositType === "periodique" && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="court-decision" />
                  <Label htmlFor="court-decision">
                    Décision du tribunal de première instance (pour éditeurs non-étatiques)
                  </Label>
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
              Les informations recueillies font l'objet d'un traitement destiné à la Gestion des attributions 
              des numéros du Dépôt Légal et des numéros ISBN et ISSN. Conformément à la loi n° 09-08, 
              vous bénéficiez d'un droit d'accès et de rectification.
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
            Votre déclaration de dépôt légal a été enregistrée. Vous recevrez une confirmation par email.
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