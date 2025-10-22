import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, GraduationCap, Briefcase, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { BookingData } from "../BookingWizard";

interface StepOrganizerTypeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

const ORGANIZER_TYPES = [
  { 
    value: "association", 
    label: "Association",
    icon: Users,
    description: "Association culturelle ou artistique" 
  },
  { 
    value: "institution", 
    label: "Institution publique",
    icon: Building2,
    description: "Ministère, collectivité territoriale, etc." 
  },
  { 
    value: "educational", 
    label: "Établissement d'enseignement",
    icon: GraduationCap,
    description: "Université, école, centre de formation" 
  },
  { 
    value: "company", 
    label: "Entreprise privée",
    icon: Briefcase,
    description: "Société, start-up, etc." 
  }
];

export default function StepOrganizerType({ data, onUpdate }: StepOrganizerTypeProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        toast.error("Veuillez sélectionner un fichier PDF");
        e.target.value = '';
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 MB");
        e.target.value = '';
        return;
      }
      
      onUpdate({ justificationDocument: file });
      toast.success("Pièce justificative ajoutée");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Type d'organisateur</h2>
        <p className="text-muted-foreground">
          Sélectionnez le type d'organisation qui souhaite réserver un espace
        </p>
      </div>

      <div className="space-y-4">
        <Label>Type d'organisation *</Label>
        <RadioGroup
          value={data.organizerType}
          onValueChange={(value) => onUpdate({ organizerType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {ORGANIZER_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className={`relative cursor-pointer transition-all hover:shadow-md ${
                  data.organizerType === type.value
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <label
                  htmlFor={type.value}
                  className="flex items-start gap-4 p-4 cursor-pointer"
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{type.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              </Card>
            );
          })}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Nom de l'organisation *</Label>
        <Input
          id="organizationName"
          placeholder="Ex: Association Culturelle Al Amal"
          value={data.organizationName || ""}
          onChange={(e) => onUpdate({ organizationName: e.target.value })}
        />
      </div>

      {/* Champ upload PDF si institution publique */}
      {data.organizerType === 'institution' && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="justification" className="text-base font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Pièce justificative (obligatoire)
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Document officiel attestant du statut d'organisme public (Format PDF, max 10 MB)
              </p>
            </div>
            
            <Input
              id="justification"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            
            {data.justificationDocument && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fichier ajouté: {(data.justificationDocument as File).name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
