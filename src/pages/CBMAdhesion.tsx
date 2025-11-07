import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, CheckCircle2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Step3CatalogueCBM from "@/components/cbm/adhesion/Step3CatalogueCBM";
import Step3ReseauBibliotheques from "@/components/cbm/adhesion/Step3ReseauBibliotheques";

export default function CBMAdhesion() {
  const [step, setStep] = useState(0);
  const [typeAdhesion, setTypeAdhesion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [volumetrie, setVolumetrie] = useState<Record<string, string>>({
    "Monographies": "",
    "Périodiques": "",
    "Manuscrits": "",
    "BD & Logiciels": "",
    "Cartes & Plans": "",
    "Partitions & Audio": "",
    "Images & Visuels": "",
    "Documents Électroniques": "",
    "Thèses & Mémoires": "",
    "Brochures & Dépliants": "",
    "Rapports & Documents Officiels": "",
    "Microformes": "",
    "Documents Audiovisuels (DVD/CD)": "",
    "Jeux & Puzzles": "",
    "Autre": ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const regionsData = {
    "Tanger-Tétouan-Al Hoceïma": ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Chefchaouen", "Ouazzane", "Asilah"],
    "L'Oriental": ["Oujda", "Nador", "Berkane", "Taourirt", "Guercif", "Jerada"],
    "Fès-Meknès": ["Fès", "Meknès", "Ifrane", "Sefrou", "Taza", "El Hajeb", "Boulemane"],
    "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra", "Témara", "Khémisset", "Skhirat", "Sidi Kacem"],
    "Béni Mellal-Khénifra": ["Béni Mellal", "Khénifra", "Khouribga", "Azilal", "Fquih Ben Salah"],
    "Casablanca-Settat": ["Casablanca", "Mohammedia", "Settat", "El Jadida", "Berrechid", "Benslimane", "Sidi Bennour"],
    "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira", "El Kelâa des Sraghna", "Youssoufia", "Chichaoua"],
    "Drâa-Tafilalet": ["Errachidia", "Ouarzazate", "Zagora", "Tinghir", "Midelt"],
    "Souss-Massa": ["Agadir", "Inezgane", "Tiznit", "Taroudant", "Ouled Teïma", "Tata"],
    "Guelmim-Oued Noun": ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa"],
    "Laâyoune-Sakia El Hamra": ["Laâyoune", "Boujdour", "Tarfaya", "Es-Semara"],
    "Dakhla-Oued Ed-Dahab": ["Dakhla", "Aousserd"]
  };

  const regions = Object.keys(regionsData);
  const villes = selectedRegion ? regionsData[selectedRegion as keyof typeof regionsData] : [];

  const criteresCatalogue = [
    "Être une bibliothèque institutionnelle reconnue (publique, universitaire, spécialisée)",
    "Disposer d'un système informatisé de gestion bibliothéconomique (SIGB)",
    "S'engager à respecter les normes de catalogage définies par le réseau",
    "Accepter les conditions de partage et d'échange de données",
    "Désigner un référent technique et un responsable de catalogage"
  ];

  const criteresReseau = [
    "Être une bibliothèque institutionnelle reconnue (publique, universitaire, spécialisée)",
    "Disponibilité d'un Fond documentaire",
    "Accepter les conditions de partage et d'échange de données",
    "Désigner un référent technique et un responsable de catalogage",
    "S'engager à participer aux activités du réseau",
    "Participer aux formations et aux échanges d'expérience"
  ];

  const criteres = typeAdhesion === "reseau" ? criteresReseau : criteresCatalogue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Récupération des données du formulaire avec les bons IDs
      const adhesionData = {
        nom_bibliotheque: (document.getElementById('nom') as HTMLInputElement)?.value,
        type_bibliotheque: (document.getElementById('type') as HTMLInputElement)?.value,
        tutelle: (document.getElementById('tutelle') as HTMLInputElement)?.value,
        adresse: (document.getElementById('adresse') as HTMLInputElement)?.value,
        region: (document.getElementById('region') as HTMLInputElement)?.value,
        ville: (document.getElementById('ville') as HTMLInputElement)?.value,
        url_maps: (document.getElementById('url-maps') as HTMLInputElement)?.value,
        directeur: (document.getElementById('directeur') as HTMLInputElement)?.value,
        email: (document.getElementById('email') as HTMLInputElement)?.value,
        telephone: (document.getElementById('tel') as HTMLInputElement)?.value,
        referent_technique: (document.getElementById('referent') as HTMLInputElement)?.value,
        responsable_catalogage: (document.getElementById('catalogueur') as HTMLInputElement)?.value,
        nombre_documents: parseInt((document.getElementById('collection') as HTMLInputElement)?.value || '0'),
        volumetrie: volumetrie,
        url_catalogue: (document.getElementById('catalogue-url') as HTMLInputElement)?.value,
        engagement_charte: (document.getElementById('engagement') as HTMLInputElement)?.checked,
        engagement_partage_donnees: (document.getElementById('donnees') as HTMLInputElement)?.checked,
      };

      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (typeAdhesion === "reseau") {
        // Insertion dans cbm_adhesions_reseau
        const { error } = await supabase
          .from('cbm_adhesions_reseau')
          .insert({
            ...adhesionData,
            user_id: user?.id,
            moyens_recensement: (document.getElementById('recensement') as HTMLInputElement)?.value,
            en_cours_informatisation: (document.getElementById('informatisation') as HTMLInputElement)?.value,
          });
        
        if (error) throw error;
      } else {
        // Insertion dans cbm_adhesions_catalogue
        const { error } = await supabase
          .from('cbm_adhesions_catalogue')
          .insert({
            ...adhesionData,
            user_id: user?.id,
            sigb: (document.getElementById('sigb') as HTMLInputElement)?.value,
            normes_catalogage: (document.getElementById('normes') as HTMLInputElement)?.value,
          });
        
        if (error) throw error;
      }

      toast({
        title: "Demande envoyée avec succès",
        description: "Votre dossier sera examiné par le Bureau CBM sous 15 jours ouvrables.",
      });
      setStep(4);
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission.",
        variant: "destructive",
      });
    }
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
          {/* Sidebar - Conditions (masqué à l'étape 0) */}
          {step > 0 && (
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
          )}

          {/* Main Content - Formulaire */}
          <div className={step > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
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
                          <div className="relative">
                            <Input 
                              id="type" 
                              readOnly 
                              placeholder="Sélectionnez un type"
                              className="cursor-pointer"
                              onClick={() => document.getElementById('type-list')?.classList.toggle('hidden')}
                            />
                            <div id="type-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg">
                              <div className="p-2 hover:bg-muted cursor-pointer" onClick={() => {
                                (document.getElementById('type') as HTMLInputElement).value = 'Bibliothèque Publique';
                                document.getElementById('type-list')?.classList.add('hidden');
                              }}>
                                Bibliothèque Publique
                              </div>
                              <div className="p-2 hover:bg-muted cursor-pointer" onClick={() => {
                                (document.getElementById('type') as HTMLInputElement).value = 'Bibliothèque Universitaire';
                                document.getElementById('type-list')?.classList.add('hidden');
                              }}>
                                Bibliothèque Universitaire
                              </div>
                              <div className="p-2 hover:bg-muted cursor-pointer" onClick={() => {
                                (document.getElementById('type') as HTMLInputElement).value = 'Bibliothèque Spécialisée';
                                document.getElementById('type-list')?.classList.add('hidden');
                              }}>
                                Bibliothèque Spécialisée
                              </div>
                              <div className="p-2 hover:bg-muted cursor-pointer" onClick={() => {
                                (document.getElementById('type') as HTMLInputElement).value = 'Bibliothèque Scolaire';
                                document.getElementById('type-list')?.classList.add('hidden');
                              }}>
                                Bibliothèque Scolaire
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="region">Région *</Label>
                            <div className="relative">
                              <Input 
                                id="region" 
                                readOnly 
                                placeholder="Sélectionnez une région"
                                className="cursor-pointer"
                                onClick={() => document.getElementById('region-list')?.classList.toggle('hidden')}
                                value={selectedRegion}
                              />
                              <div id="region-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto z-10">
                                {regions.map((region) => (
                                  <div 
                                    key={region}
                                    className="p-2 hover:bg-muted cursor-pointer" 
                                    onClick={() => {
                                      setSelectedRegion(region);
                                      (document.getElementById('region') as HTMLInputElement).value = region;
                                      (document.getElementById('ville') as HTMLInputElement).value = '';
                                      document.getElementById('region-list')?.classList.add('hidden');
                                    }}
                                  >
                                    {region}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ville">Ville *</Label>
                            <div className="relative">
                              <Input 
                                id="ville" 
                                readOnly 
                                placeholder={selectedRegion ? "Sélectionnez une ville" : "Sélectionnez d'abord une région"}
                                className="cursor-pointer"
                                onClick={() => selectedRegion && document.getElementById('ville-list')?.classList.toggle('hidden')}
                                disabled={!selectedRegion}
                              />
                              {selectedRegion && (
                                <div id="ville-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto z-10">
                                  {villes.map((ville) => (
                                    <div 
                                      key={ville}
                                      className="p-2 hover:bg-muted cursor-pointer" 
                                      onClick={() => {
                                        (document.getElementById('ville') as HTMLInputElement).value = ville;
                                        document.getElementById('ville-list')?.classList.add('hidden');
                                      }}
                                    >
                                      {ville}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="url-maps">URL Google Maps</Label>
                          <Input id="url-maps" type="url" placeholder="https://maps.google.com/..." />
                          <p className="text-xs text-muted-foreground">Lien vers la localisation de votre bibliothèque sur Google Maps</p>
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
                      <>
                        {typeAdhesion === "reseau" ? (
                          <Step3ReseauBibliotheques 
                            volumetrie={volumetrie}
                            setVolumetrie={setVolumetrie}
                          />
                        ) : (
                          <Step3CatalogueCBM 
                            volumetrie={volumetrie}
                            setVolumetrie={setVolumetrie}
                          />
                        )}
                      </>
                    )}
                  </CardContent>

                  {/* Boutons de navigation */}
                  <div className="p-6 border-t bg-background">
                    <div className="flex justify-between items-center">
                      {step > 0 && (
                        <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                          Précédent
                        </Button>
                      )}
                      
                      {step === 0 && (
                        <Button 
                          type="button" 
                          onClick={() => typeAdhesion && setStep(1)} 
                          className={`ml-auto px-8 py-3 font-semibold ${typeAdhesion ? '!bg-blue-600 hover:!bg-blue-700 !text-white' : '!bg-gray-400 !text-gray-700 cursor-not-allowed'}`}
                          style={{ backgroundColor: typeAdhesion ? '#2563eb' : '#9ca3af', color: typeAdhesion ? '#ffffff' : '#374151' }}
                        >
                          Suivant
                        </Button>
                      )}
                      
                      {step > 0 && step < 3 && (
                        <Button 
                          type="button" 
                          onClick={() => setStep(step + 1)} 
                          className="ml-auto px-8 py-3 font-semibold !bg-blue-600 hover:!bg-blue-700 !text-white"
                          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                        >
                          Suivant
                        </Button>
                      )}
                      
                      {step === 3 && (
                        <Button 
                          type="submit" 
                          className="ml-auto px-8 py-3 font-semibold !bg-green-600 hover:!bg-green-700 !text-white"
                          style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                        >
                          Soumettre la Demande
                        </Button>
                      )}
                    </div>
                  </div>
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
