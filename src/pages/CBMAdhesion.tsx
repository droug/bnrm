import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, CheckCircle2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CBMAdhesion() {
  const [step, setStep] = useState(0);
  const [typeAdhesion, setTypeAdhesion] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const criteres = [
    "Être une bibliothèque institutionnelle reconnue (publique, universitaire, spécialisée)",
    "Disposer d'un système informatisé de gestion bibliothéconomique (SIGB)",
    "S'engager à respecter les normes de catalogage définies par le réseau",
    "Accepter les conditions de partage et d'échange de données",
    "Désigner un référent technique et un responsable de catalogage"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande envoyée avec succès",
      description: "Votre dossier sera examiné par le Bureau CBM sous 15 jours ouvrables.",
    });
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Adhésion au Réseau CBM
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Rejoignez le réseau national des bibliothèques marocaines
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - Conditions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-cbm-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl text-cbm-primary flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Conditions d'Adhésion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {criteres.map((critere, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cbm-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{critere}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-cbm-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg">Avantages Membres</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>✓ Accès au catalogue collectif national</p>
                <p>✓ Prêt entre bibliothèques gratuit</p>
                <p>✓ Formations continues offertes</p>
                <p>✓ Support technique dédié</p>
                <p>✓ Participation aux groupes de travail</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Formulaire */}
          <div className="lg:col-span-2">
            {step !== 4 ? (
              <Card className="border-2 border-cbm-accent/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl text-cbm-accent">Formulaire d'Adhésion</CardTitle>
                    {step > 0 && <span className="text-sm text-muted-foreground">Étape {step}/3</span>}
                  </div>
                  {/* Progress Bar */}
                  {step > 0 && (
                    <div className="w-full h-2 bg-cbm-accent/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cbm-accent to-cbm-secondary transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                      />
                    </div>
                  )}
                </CardHeader>
                
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    {step === 0 && (
                      <div className="space-y-6">
                        <h3 className="font-semibold text-lg text-cbm-primary">Type d'Adhésion</h3>
                        <p className="text-sm text-muted-foreground">
                          Sélectionnez le type d'adhésion qui correspond à vos besoins
                        </p>
                        
                        <RadioGroup value={typeAdhesion} onValueChange={setTypeAdhesion}>
                          <div className="space-y-4">
                            <Card 
                              className={`border-2 transition-all cursor-pointer ${typeAdhesion === 'reseau' ? 'border-cbm-primary bg-cbm-primary/5' : 'border-border hover:border-cbm-primary/50'}`}
                              onClick={() => setTypeAdhesion('reseau')}
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                  <RadioGroupItem 
                                    value="reseau" 
                                    id="adhesion-reseau"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1" onClick={() => setTypeAdhesion('reseau')}>
                                    <Label htmlFor="adhesion-reseau" className="text-base font-semibold cursor-pointer">
                                      Adhésion au réseau des Bibliothèques Marocaines
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Rejoignez le réseau national des Bibliothéques Marocaines pour bénéficier du prêt entre bibliothèques, 
                                      des formations et du support technique dédié.
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <div className="relative flex items-center justify-center py-2">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                              </div>
                              <div className="relative bg-background px-4">
                                <span className="text-sm font-medium text-muted-foreground">OU</span>
                              </div>
                            </div>

                            <Card 
                              className={`border-2 transition-all cursor-pointer ${typeAdhesion === 'catalogue' ? 'border-cbm-secondary bg-cbm-secondary/5' : 'border-border hover:border-cbm-secondary/50'}`}
                              onClick={() => setTypeAdhesion('catalogue')}
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                  <RadioGroupItem 
                                    value="catalogue" 
                                    id="adhesion-catalogue"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1" onClick={() => setTypeAdhesion('catalogue')}>
                                    <Label htmlFor="adhesion-catalogue" className="text-base font-semibold cursor-pointer">
                                      Adhésion au catalogue CBM
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Intégrez vos notices bibliographiques au catalogue collectif national 
                                      et rendez vos collections visibles au niveau national.
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </RadioGroup>

                        {!typeAdhesion && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              Veuillez sélectionner un type d'adhésion pour continuer
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-cbm-primary">Informations de l'Institution</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom de la Bibliothèque *</Label>
                          <Input id="nom" required placeholder="Ex: Médiathèque Municipale de Fès" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Type d'Institution *</Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="publique">Bibliothèque Publique</SelectItem>
                              <SelectItem value="universitaire">Bibliothèque Universitaire</SelectItem>
                              <SelectItem value="specialisee">Bibliothèque Spécialisée</SelectItem>
                              <SelectItem value="scolaire">Bibliothèque Scolaire</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ville">Ville *</Label>
                            <Input id="ville" required placeholder="Rabat" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="region">Région *</Label>
                            <Input id="region" required placeholder="Rabat-Salé-Kénitra" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="adresse">Adresse Complète *</Label>
                          <Textarea id="adresse" required placeholder="Adresse postale détaillée" />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-cbm-primary">Contact et Responsables</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="directeur">Directeur/Directrice *</Label>
                          <Input id="directeur" required placeholder="Nom complet" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Officiel *</Label>
                            <Input id="email" type="email" required placeholder="contact@bibliotheque.ma" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tel">Téléphone *</Label>
                            <Input id="tel" type="tel" required placeholder="+212 5XX-XXXXXX" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="referent">Référent Technique *</Label>
                          <Input id="referent" required placeholder="Nom du responsable SIGB" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="catalogueur">Responsable Catalogage *</Label>
                          <Input id="catalogueur" required placeholder="Nom du bibliothécaire catalogueur" />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-cbm-primary">Infrastructure Technique</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="sigb">Système de Gestion (SIGB) *</Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre SIGB" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="koha">Koha</SelectItem>
                              <SelectItem value="pmb">PMB</SelectItem>
                              <SelectItem value="virtua">Virtua</SelectItem>
                              <SelectItem value="aleph">Aleph</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="collection">Nombre de Documents *</Label>
                          <Input id="collection" type="number" required placeholder="Volume approximatif de la collection" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="normes">Normes de Catalogage Utilisées</Label>
                          <Input id="normes" placeholder="Ex: UNIMARC, RDA, Dewey" />
                        </div>

                        <div className="space-y-4 pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox id="engagement" required />
                            <Label htmlFor="engagement" className="text-sm cursor-pointer">
                              Je certifie que les informations fournies sont exactes et m'engage à respecter la Charte du Réseau CBM et son Règlement Intérieur
                            </Label>
                          </div>
                          <div className="flex items-start gap-3">
                            <Checkbox id="donnees" required />
                            <Label htmlFor="donnees" className="text-sm cursor-pointer">
                              J'accepte le partage des métadonnées bibliographiques dans le respect des standards du réseau
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    {step > 0 && (
                      <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                        Précédent
                      </Button>
                    )}
                    
                    {step === 0 && (
                      <Button 
                        type="button" 
                        onClick={() => setStep(1)} 
                        className="ml-auto bg-cbm-accent hover:bg-cbm-accent/90"
                        disabled={!typeAdhesion}
                      >
                        Suivant
                      </Button>
                    )}
                    
                    {step > 0 && step < 3 && (
                      <Button type="button" onClick={() => setStep(step + 1)} className="ml-auto bg-cbm-accent hover:bg-cbm-accent/90">
                        Suivant
                      </Button>
                    )}
                    
                    {step === 3 && (
                      <Button type="submit" className="ml-auto bg-cbm-primary hover:bg-cbm-primary/90">
                        Soumettre la Demande
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <Card className="border-2 border-cbm-secondary/40 bg-cbm-secondary/5">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-cbm-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-cbm-secondary" />
                  </div>
                  <CardTitle className="text-2xl text-cbm-secondary">Demande Envoyée !</CardTitle>
                  <CardDescription>Votre dossier d'adhésion a été transmis au Bureau CBM</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center">
                    Vous recevrez une confirmation par email sous 48h et une décision finale sous 15 jours ouvrables.
                  </p>
                  <div className="bg-cbm-primary/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Prochaines Étapes :</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Examen du dossier par le Comité Technique</li>
                      <li>Validation par le Bureau CBM</li>
                      <li>Signature de la convention d'adhésion</li>
                      <li>Formation et mise en production</li>
                    </ol>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/cbm')}>
                    Retour au Portail CBM
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
