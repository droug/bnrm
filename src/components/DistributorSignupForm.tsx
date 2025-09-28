import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const distributorSchema = z.object({
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  legalForm: z.string().min(1, "Forme juridique requise"),
  registrationNumber: z.string().min(1, "Numéro d'enregistrement requis"),
  taxNumber: z.string().min(1, "Numéro fiscal requis"),
  address: z.string().min(5, "Adresse complète requise"),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().min(1, "Code postal requis"),
  contactFirstName: z.string().min(2, "Prénom du contact requis"),
  contactLastName: z.string().min(2, "Nom du contact requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  website: z.string().url("Site web invalide").optional().or(z.literal("")),
  distributionNetwork: z.string().min(1, "Réseau de distribution requis"),
  territorialCoverage: z.string().min(1, "Couverture territoriale requise"),
  storageCapacity: z.string().min(1, "Capacité de stockage requise"),
  clientTypes: z.array(z.string()).min(1, "Au moins un type de client requis"),
  experience: z.string().min(1, "Expérience requise"),
  references: z.string().optional(),
  services: z.array(z.string()).min(1, "Au moins un service requis"),
});

type DistributorFormData = z.infer<typeof distributorSchema>;

const DistributorSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
  });

  const clientTypes = [
    "Librairies indépendantes",
    "Grandes surfaces culturelles",
    "Librairies en ligne",
    "Bibliothèques",
    "Établissements scolaires",
    "Kiosques à journaux"
  ];

  const services = [
    "Distribution physique",
    "Distribution numérique",
    "Stockage et logistique",
    "Marketing et promotion",
    "Gestion des retours",
    "Suivi des ventes"
  ];

  const handleClientTypeChange = (clientType: string, checked: boolean) => {
    const updated = checked
      ? [...selectedClientTypes, clientType]
      : selectedClientTypes.filter(type => type !== clientType);
    setSelectedClientTypes(updated);
    setValue("clientTypes", updated);
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    const updated = checked
      ? [...selectedServices, service]
      : selectedServices.filter(s => s !== service);
    setSelectedServices(updated);
    setValue("services", updated);
  };

  const onSubmit = async (data: DistributorFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual signup logic with Supabase
      console.log("Distributor signup data:", data);
      toast({
        title: "Demande d'inscription envoyée",
        description: "Votre demande d'inscription en tant que distributeur a été envoyée. Vous recevrez une confirmation par email.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Inscription Distributeur</CardTitle>
        <CardDescription>
          Rejoignez notre réseau de partenaires distributeurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations sur l'entreprise</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  placeholder="Nom de votre entreprise"
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalForm">Forme juridique *</Label>
                <Select onValueChange={(value) => setValue("legalForm", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la forme juridique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarl">SARL</SelectItem>
                    <SelectItem value="sa">SA</SelectItem>
                    <SelectItem value="sas">SAS</SelectItem>
                    <SelectItem value="eurl">EURL</SelectItem>
                    <SelectItem value="entreprise-individuelle">Entreprise individuelle</SelectItem>
                  </SelectContent>
                </Select>
                {errors.legalForm && (
                  <p className="text-sm text-destructive">{errors.legalForm.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Numéro d'enregistrement *</Label>
                <Input
                  id="registrationNumber"
                  {...register("registrationNumber")}
                  placeholder="RC ou numéro CNSS"
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">Numéro fiscal *</Label>
                <Input
                  id="taxNumber"
                  {...register("taxNumber")}
                  placeholder="Identifiant fiscal"
                />
                {errors.taxNumber && (
                  <p className="text-sm text-destructive">{errors.taxNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse du siège social *</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Adresse complète du siège social"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Ville"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="Code postal"
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact principal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactFirstName">Prénom *</Label>
                <Input
                  id="contactFirstName"
                  {...register("contactFirstName")}
                  placeholder="Prénom du contact"
                />
                {errors.contactFirstName && (
                  <p className="text-sm text-destructive">{errors.contactFirstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactLastName">Nom *</Label>
                <Input
                  id="contactLastName"
                  {...register("contactLastName")}
                  placeholder="Nom du contact"
                />
                {errors.contactLastName && (
                  <p className="text-sm text-destructive">{errors.contactLastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="contact@entreprise.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+212 5 XX XX XX XX"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web (optionnel)</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://www.votre-site.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations sur l'activité</h3>
            
            <div className="space-y-2">
              <Label htmlFor="distributionNetwork">Réseau de distribution *</Label>
              <Select onValueChange={(value) => setValue("distributionNetwork", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de réseau de distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="regional">Régional</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
              {errors.distributionNetwork && (
                <p className="text-sm text-destructive">{errors.distributionNetwork.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="territorialCoverage">Couverture territoriale *</Label>
              <Textarea
                id="territorialCoverage"
                {...register("territorialCoverage")}
                placeholder="Décrivez votre zone de couverture géographique"
                rows={3}
              />
              {errors.territorialCoverage && (
                <p className="text-sm text-destructive">{errors.territorialCoverage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageCapacity">Capacité de stockage *</Label>
              <Select onValueChange={(value) => setValue("storageCapacity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Capacité de stockage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moins-1000">Moins de 1 000 ouvrages</SelectItem>
                  <SelectItem value="1000-5000">1 000 - 5 000 ouvrages</SelectItem>
                  <SelectItem value="5000-20000">5 000 - 20 000 ouvrages</SelectItem>
                  <SelectItem value="plus-20000">Plus de 20 000 ouvrages</SelectItem>
                </SelectContent>
              </Select>
              {errors.storageCapacity && (
                <p className="text-sm text-destructive">{errors.storageCapacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Types de clients ciblés *</Label>
              <div className="grid grid-cols-2 gap-2">
                {clientTypes.map((clientType) => (
                  <div key={clientType} className="flex items-center space-x-2">
                    <Checkbox
                      id={clientType}
                      checked={selectedClientTypes.includes(clientType)}
                      onCheckedChange={(checked) => handleClientTypeChange(clientType, checked as boolean)}
                    />
                    <Label htmlFor={clientType} className="text-sm">{clientType}</Label>
                  </div>
                ))}
              </div>
              {errors.clientTypes && (
                <p className="text-sm text-destructive">{errors.clientTypes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Expérience dans la distribution *</Label>
              <Select onValueChange={(value) => setValue("experience", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Années d'expérience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debutant">Moins de 2 ans</SelectItem>
                  <SelectItem value="intermediaire">2 - 5 ans</SelectItem>
                  <SelectItem value="experimente">5 - 10 ans</SelectItem>
                  <SelectItem value="expert">Plus de 10 ans</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience && (
                <p className="text-sm text-destructive">{errors.experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="references">Références clients (optionnel)</Label>
              <Textarea
                id="references"
                {...register("references")}
                placeholder="Listez quelques clients ou partenaires significatifs"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Services proposés *</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={selectedServices.includes(service)}
                      onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
              {errors.services && (
                <p className="text-sm text-destructive">{errors.services.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer la demande d'inscription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DistributorSignupForm;