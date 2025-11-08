import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";

interface Step3ReseauBibliothequesProps {
  volumetrie: Record<string, string>;
  setVolumetrie: (value: Record<string, string>) => void;
  nombreDocuments: number;
  moyensRecensement: string;
  enCoursInformatisation: string;
  onFieldChange: (field: string, value: string | number | boolean) => void;
}

export default function Step3ReseauBibliotheques({ 
  volumetrie, 
  setVolumetrie,
  nombreDocuments,
  moyensRecensement,
  enCoursInformatisation,
  onFieldChange
}: Step3ReseauBibliothequesProps) {
  const [selectedRecensements, setSelectedRecensements] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recensementOptions = [
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
  ];

  // Charger les valeurs initiales depuis les props
  useEffect(() => {
    if (moyensRecensement) {
      setSelectedRecensements(moyensRecensement.split(', ').filter(Boolean));
    }
  }, []);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour le champ caché et l'état parent quand la sélection change
  useEffect(() => {
    const newValue = selectedRecensements.join(', ');
    onFieldChange('moyens_recensement', newValue);
  }, [selectedRecensements, onFieldChange]);

  const toggleRecensement = (option: string) => {
    setSelectedRecensements(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const removeRecensement = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecensements(prev => prev.filter(item => item !== option));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-cbm-primary">Infrastructure Technique</h3>
      
      <div className="space-y-2">
        <Label htmlFor="recensement">Moyens de recensement du fond documentaire *</Label>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-2 items-center justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex flex-wrap gap-2 flex-1">
              {selectedRecensements.length === 0 ? (
                <span className="text-muted-foreground">Sélectionnez un ou plusieurs moyens</span>
              ) : (
                selectedRecensements.map((item) => (
                  <span 
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-cbm-primary/10 text-cbm-primary rounded-md text-xs font-medium"
                  >
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-cbm-primary/70" 
                      onClick={(e) => removeRecensement(item, e)}
                    />
                  </span>
                ))
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          <Input 
            id="recensement" 
            type="hidden"
            value={selectedRecensements.join(', ')}
          />
          {isDropdownOpen && (
            <div className="absolute mt-1 w-full border rounded-lg bg-background shadow-lg z-50 max-h-60 overflow-y-auto">
              {recensementOptions.map((option) => (
                <label 
                  key={option}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                >
                  <Checkbox 
                    checked={selectedRecensements.includes(option)}
                    onCheckedChange={() => toggleRecensement(option)}
                  />
                  <span className="text-sm flex-1">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Vous pouvez sélectionner plusieurs options</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="informatisation">En cours d'informatisation *</Label>
        <div className="relative">
          <Input 
            id="informatisation" 
            readOnly 
            placeholder="Sélectionnez Oui ou Non"
            className="cursor-pointer"
            value={enCoursInformatisation}
            onClick={() => document.getElementById('informatisation-list')?.classList.toggle('hidden')}
          />
          <div id="informatisation-list" className="hidden mt-1 border rounded-lg bg-background shadow-lg z-50">
            {["Oui", "Non"].map((option) => (
              <div 
                key={option}
                className="p-2 hover:bg-muted cursor-pointer" 
                onClick={() => {
                  onFieldChange('en_cours_informatisation', option);
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
        <Input 
          id="collection" 
          type="number" 
          required 
          placeholder="Volume approximatif de la collection"
          value={nombreDocuments || ''}
          onChange={(e) => onFieldChange('nombre_documents', parseInt(e.target.value) || 0)}
        />
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
