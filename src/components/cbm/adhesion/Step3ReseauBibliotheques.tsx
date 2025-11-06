import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Step3ReseauBibliothequesProps {
  volumetrie: Record<string, string>;
  setVolumetrie: (value: Record<string, string>) => void;
}

export default function Step3ReseauBibliotheques({ volumetrie, setVolumetrie }: Step3ReseauBibliothequesProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-cbm-primary">Infrastructure Technique - Réseau des Bibliothèques</h3>
      
      <div className="space-y-2">
        <Label htmlFor="recensement">Moyens de recensement du fond documentaire *</Label>
        <div className="relative">
          <Input 
            id="recensement" 
            readOnly 
            placeholder="Sélectionnez le moyen de recensement"
            className="cursor-pointer"
            onClick={() => document.getElementById('recensement-list')?.classList.toggle('hidden')}
          />
          <div id="recensement-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg z-50">
            {[
              "Fichiers Excel", 
              "BD Access", 
              "Manuel", 
              "Registres papier", 
              "Système local non SIGB", 
              "Tableur Google Sheets", 
              "Base de données simple", 
              "Fiches cartonnées",
              "Cahiers de prêt",
              "Autre"
            ].map((option) => (
              <div 
                key={option}
                className="p-2 hover:bg-muted cursor-pointer" 
                onClick={() => {
                  (document.getElementById('recensement') as HTMLInputElement).value = option;
                  document.getElementById('recensement-list')?.classList.add('hidden');
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="informatisation">En cours d'informatisation *</Label>
        <div className="relative">
          <Input 
            id="informatisation" 
            readOnly 
            placeholder="Sélectionnez Oui ou Non"
            className="cursor-pointer"
            onClick={() => document.getElementById('informatisation-list')?.classList.toggle('hidden')}
          />
          <div id="informatisation-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg z-50">
            {["Oui", "Non"].map((option) => (
              <div 
                key={option}
                className="p-2 hover:bg-muted cursor-pointer" 
                onClick={() => {
                  (document.getElementById('informatisation') as HTMLInputElement).value = option;
                  document.getElementById('informatisation-list')?.classList.add('hidden');
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="collection">Nombre de Documents *</Label>
        <Input id="collection" type="number" required placeholder="Volume approximatif de la collection" />
      </div>

      <div className="space-y-2">
        <Label>Nature Fond documentaire et Volumétrie</Label>
        <Accordion type="single" collapsible className="w-full border rounded-lg">
          <AccordionItem value="volumetrie" className="border-none">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
              <span className="text-sm font-medium">Types de documents et volumétrie</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid gap-3 mt-2">
                {Object.keys(volumetrie).map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <Label htmlFor={`vol-${type}`} className="min-w-[200px] text-sm">
                      {type}
                    </Label>
                    <Input
                      id={`vol-${type}`}
                      type="number"
                      min="0"
                      placeholder="Quantité"
                      value={volumetrie[type]}
                      onChange={(e) => setVolumetrie({...volumetrie, [type]: e.target.value})}
                      className="max-w-[200px]"
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <p className="text-xs text-muted-foreground">Indiquez la volumétrie pour chaque type de document de votre collection</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalogue-url">URL du Catalogue en ligne</Label>
        <Input 
          id="catalogue-url" 
          type="url" 
          placeholder="https://exemple.ma/catalogue" 
        />
        <p className="text-xs text-muted-foreground">Lien vers votre catalogue en ligne (si disponible)</p>
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
  );
}
