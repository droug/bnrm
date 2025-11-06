import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Step3CatalogueCBMProps {
  volumetrie: Record<string, string>;
  setVolumetrie: (value: Record<string, string>) => void;
}

export default function Step3CatalogueCBM({ volumetrie, setVolumetrie }: Step3CatalogueCBMProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-cbm-primary">Infrastructure Technique - Catalogue Collectif CBM</h3>
      
      <div className="space-y-2">
        <Label htmlFor="sigb">Système de Gestion (SIGB) *</Label>
        <div className="relative">
          <Input 
            id="sigb" 
            readOnly 
            placeholder="Sélectionnez votre SIGB"
            className="cursor-pointer"
            onClick={() => document.getElementById('sigb-list')?.classList.toggle('hidden')}
          />
          <div id="sigb-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg z-50">
            {["Koha", "PMB", "Virtua", "Aleph", "Sierra", "Alma", "Symphony", "Autre"].map((sigb) => (
              <div 
                key={sigb}
                className="p-2 hover:bg-muted cursor-pointer" 
                onClick={() => {
                  (document.getElementById('sigb') as HTMLInputElement).value = sigb;
                  document.getElementById('sigb-list')?.classList.add('hidden');
                }}
              >
                {sigb}
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
        <Label htmlFor="normes">Normes de Catalogage Utilisées</Label>
        <Input id="normes" placeholder="Ex: UNIMARC, RDA, Dewey" />
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
