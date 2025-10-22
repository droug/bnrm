import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, User, Mail, Phone, MapPin, Globe, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { BookingData } from "../BookingWizard";

interface StepContactInfoProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepContactInfo({ data, onUpdate }: StepContactInfoProps) {
  const isPublicOrganizer = data.organizerType === 'public';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'statusDocument' | 'authorizationDocument') => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Format non supporté. Veuillez utiliser PDF, Word ou Image (JPG, PNG)");
        e.target.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 MB");
        e.target.value = '';
        return;
      }
      
      onUpdate({ [field]: file });
      toast.success("Document ajouté");
    }
  };

  // Validation du format de téléphone (format marocain ou international)
  const validatePhone = (phone: string) => {
    // Formats acceptés: +212XXXXXXXXX, 0XXXXXXXXX, ou format international
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informations du demandeur</h2>
        <p className="text-muted-foreground">
          Renseignez les coordonnées de l'organisme demandeur
        </p>
      </div>

      {/* Nom de l'organisme */}
      <div className="space-y-2">
        <Label htmlFor="organizationName" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Nom de l'organisme *
        </Label>
        <Input
          id="organizationName"
          placeholder="Ex: Association culturelle de Rabat"
          value={data.contactOrganizationName || ""}
          onChange={(e) => onUpdate({ contactOrganizationName: e.target.value })}
          required
        />
      </div>

      {/* Personne de contact */}
      <div className="space-y-2">
        <Label htmlFor="contactPerson" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Personne de contact *
        </Label>
        <Input
          id="contactPerson"
          placeholder="Nom complet"
          value={data.contactPerson || ""}
          onChange={(e) => onUpdate({ contactPerson: e.target.value })}
          required
        />
      </div>

      {/* Email et Téléphone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email de contact *
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="contact@exemple.ma"
            value={data.contactEmail || ""}
            onChange={(e) => onUpdate({ contactEmail: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone de contact *
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+212 6XX XXX XXX"
            value={data.contactPhone || ""}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            className={data.contactPhone && !validatePhone(data.contactPhone) ? "border-destructive" : ""}
            required
          />
          {data.contactPhone && !validatePhone(data.contactPhone) && (
            <p className="text-xs text-destructive">Format de téléphone invalide</p>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-2">
        <Label htmlFor="contactAddress" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Adresse de l'organisme *
        </Label>
        <Textarea
          id="contactAddress"
          placeholder="Adresse complète"
          value={data.contactAddress || ""}
          onChange={(e) => onUpdate({ contactAddress: e.target.value })}
          rows={2}
          required
        />
      </div>

      {/* Ville et Pays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactCity">Ville *</Label>
          <Input
            id="contactCity"
            placeholder="Ex: Rabat"
            value={data.contactCity || ""}
            onChange={(e) => onUpdate({ contactCity: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactCountry">Pays *</Label>
          <Input
            id="contactCountry"
            placeholder="Ex: Maroc"
            value={data.contactCountry || ""}
            onChange={(e) => onUpdate({ contactCountry: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Site web (optionnel) */}
      <div className="space-y-2">
        <Label htmlFor="contactWebsite" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Site web (optionnel)
        </Label>
        <Input
          id="contactWebsite"
          type="url"
          placeholder="https://www.exemple.ma"
          value={data.contactWebsite || ""}
          onChange={(e) => onUpdate({ contactWebsite: e.target.value })}
        />
      </div>

      {/* Documents spécifiques aux organismes publics */}
      {isPublicOrganizer && (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              En tant qu'organisme public, vous devez fournir les documents suivants
            </AlertDescription>
          </Alert>

          {/* Document de statut */}
          <div className="space-y-2">
            <Label htmlFor="statusDocument" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Document de statut *
            </Label>
            <Input
              id="statusDocument"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'statusDocument')}
              className="cursor-pointer"
              required
            />
            {data.statusDocument && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fichier ajouté: {(data.statusDocument as File).name}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Document officiel justifiant le statut de l'organisme
            </p>
          </div>

          {/* Autorisation supérieure (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="authorizationDocument" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Autorisation supérieure (optionnel)
            </Label>
            <Input
              id="authorizationDocument"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'authorizationDocument')}
              className="cursor-pointer"
            />
            {data.authorizationDocument && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fichier ajouté: {(data.authorizationDocument as File).name}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Autorisation de la hiérarchie si nécessaire
            </p>
          </div>
        </>
      )}
    </div>
  );
}
