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
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";

const producerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  companyRegistrationNumber: z.string().min(1, "Numéro d'enregistrement requis"),
  taxIdentificationNumber: z.string().min(1, "Identifiant fiscal requis"),
  address: z.string().min(5, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  productionType: z.string().min(1, "Type de production requis"),
  productionCapacity: z.string().min(1, "Capacité de production requise"),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  yearsOfExperience: z.string().min(1, "Années d'expérience requises"),
  description: z.string().min(50, "Description d'au moins 50 caractères requise"),
});

type ProducerFormData = z.infer<typeof producerSchema>;

const ProducerSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProducerFormData>({
    resolver: zodResolver(producerSchema),
  });

  const onSubmit = async (data: ProducerFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual signup logic with Supabase
      console.log("Producer signup data:", data);
      toast({
        title: "Demande d'inscription envoyée",
        description: "Votre demande d'inscription en tant que producteur a été envoyée. Vous recevrez une confirmation par email.",
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Inscription Producteur</CardTitle>
        <CardDescription>
          Rejoignez notre réseau de producteurs de contenus éditoriaux
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom du responsable *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Votre prénom"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom du responsable *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Votre nom"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel *</Label>
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
            <PhoneInput
              id="phone"
              defaultCountry="MA"
              value={phoneValue}
              onChange={(value) => {
                setPhoneValue(value);
                setValue("phone", value);
              }}
              placeholder="6 XX XX XX XX"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              L'indicatif du pays est ajouté automatiquement selon votre sélection.
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyRegistrationNumber">Numéro RC *</Label>
              <Input
                id="companyRegistrationNumber"
                {...register("companyRegistrationNumber")}
                placeholder="Numéro du registre de commerce"
              />
              {errors.companyRegistrationNumber && (
                <p className="text-sm text-destructive">{errors.companyRegistrationNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxIdentificationNumber">Identifiant fiscal *</Label>
              <Input
                id="taxIdentificationNumber"
                {...register("taxIdentificationNumber")}
                placeholder="IF / ICE"
              />
              {errors.taxIdentificationNumber && (
                <p className="text-sm text-destructive">{errors.taxIdentificationNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse de l'entreprise *</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Adresse complète de l'entreprise"
              rows={2}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

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
            <Label htmlFor="productionType">Type de production *</Label>
            <Select onValueChange={(value) => setValue("productionType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de production" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audiovisuel">Production audiovisuelle</SelectItem>
                <SelectItem value="multimedia">Production multimédia</SelectItem>
                <SelectItem value="phonographique">Production phonographique</SelectItem>
                <SelectItem value="cinematographique">Production cinématographique</SelectItem>
                <SelectItem value="documentaire">Production documentaire</SelectItem>
                <SelectItem value="publicitaire">Production publicitaire</SelectItem>
                <SelectItem value="evenementiel">Production événementielle</SelectItem>
                <SelectItem value="autres">Autres</SelectItem>
              </SelectContent>
            </Select>
            {errors.productionType && (
              <p className="text-sm text-destructive">{errors.productionType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionCapacity">Capacité de production *</Label>
            <Select onValueChange={(value) => setValue("productionCapacity", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Capacité de production annuelle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petite">Petite (1-10 projets/an)</SelectItem>
                <SelectItem value="moyenne">Moyenne (10-50 projets/an)</SelectItem>
                <SelectItem value="grande">Grande (50+ projets/an)</SelectItem>
              </SelectContent>
            </Select>
            {errors.productionCapacity && (
              <p className="text-sm text-destructive">{errors.productionCapacity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Années d'expérience *</Label>
            <Select onValueChange={(value) => setValue("yearsOfExperience", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Années d'expérience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 ans</SelectItem>
                <SelectItem value="3-5">3-5 ans</SelectItem>
                <SelectItem value="6-10">6-10 ans</SelectItem>
                <SelectItem value="10+">Plus de 10 ans</SelectItem>
              </SelectContent>
            </Select>
            {errors.yearsOfExperience && (
              <p className="text-sm text-destructive">{errors.yearsOfExperience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web (optionnel)</Label>
            <Input
              id="website"
              type="url"
              {...register("website")}
              placeholder="https://www.exemple.com"
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Présentation de l'entreprise *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Décrivez votre entreprise, vos activités principales, vos références..."
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
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

export default ProducerSignupForm;
