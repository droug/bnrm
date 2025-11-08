import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";

interface Step3CatalogueCBMProps {
  volumetrie: Record<string, string>;
  setVolumetrie: (value: Record<string, string>) => void;
  nombreDocuments: number;
  sigb: string;
  normesCatalogag: string;
  urlCatalogue: string;
  onFieldChange: (field: string, value: string | number | boolean) => void;
}

export default function Step3CatalogueCBM({ 
  volumetrie, 
  setVolumetrie, 
  nombreDocuments, 
  sigb, 
  normesCatalogag, 
  urlCatalogue,
  onFieldChange 
}: Step3CatalogueCBMProps) {

  const sumVolumetrie = useMemo(() => {
    return Object.values(volumetrie).reduce((sum, val) => {
      const num = parseInt(val) || 0;
      return sum + num;
    }, 0);
  }, [volumetrie]);

  const isVolumetrieValid = useMemo(() => {
    if (!nombreDocuments) return true;
    return sumVolumetrie === nombreDocuments;
  }, [sumVolumetrie, nombreDocuments]);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-cbm-primary">Infrastructure Technique</h3>
      
      <div className="space-y-2">
        <Label htmlFor="sigb">Système de Gestion (SIGB) *</Label>
        <div className="relative">
          <Input 
            id="sigb" 
            readOnly 
            placeholder="Sélectionnez votre SIGB"
            className="cursor-pointer"
            value={sigb}
            onClick={() => document.getElementById('sigb-list')?.classList.toggle('hidden')}
          />
          <div id="sigb-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg z-50">
            {["Koha", "PMB", "Virtua", "Aleph", "Sierra", "Alma", "Symphony", "Autre"].map((sigbOption) => (
              <div 
                key={sigbOption}
                className="p-2 hover:bg-muted cursor-pointer" 
                onClick={() => {
                  onFieldChange('sigb', sigbOption);
                  document.getElementById('sigb-list')?.classList.add('hidden');
                }}
              >
                {sigbOption}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="collection">Nombre de Documents *</Label>
        <Input 
          id="collection" 
          type="number" 
          required 
          placeholder="Volume approximatif de la collection"
          value={nombreDocuments || ''}
          onChange={(e) => onFieldChange('nombre_documents', parseInt(e.target.value) || 0)}
          className={!isVolumetrieValid ? "border-destructive" : ""}
        />
        {!isVolumetrieValid && nombreDocuments && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>
              La somme de la volumétrie ({sumVolumetrie}) doit être égale au nombre total de documents ({nombreDocuments})
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="normes">Système de classification adopté</Label>
        <Input 
          id="normes" 
          placeholder="Expl: CDD, Autre"
          value={normesCatalogag}
          onChange={(e) => onFieldChange('normes_catalogage', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Nature Fond documentaire et Volumétrie</Label>
        <Accordion type="single" collapsible className="w-full border rounded-lg">
          <AccordionItem value="volumetrie" className="border-none">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
              <span className="text-sm font-medium">
                Types de documents et volumétrie {sumVolumetrie > 0 && `(Total: ${sumVolumetrie})`}
              </span>
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
        <p className="text-xs text-muted-foreground">
          Indiquez la volumétrie pour chaque type de document de votre collection. 
          La somme doit correspondre au nombre total de documents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalogue-url">URL du Catalogue en ligne</Label>
        <Input 
          id="catalogue-url" 
          type="url" 
          placeholder="https://exemple.ma/catalogue"
          value={urlCatalogue}
          onChange={(e) => onFieldChange('url_catalogue', e.target.value)}
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
