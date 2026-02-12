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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { checkProfessionalEmailUniqueness } from "@/lib/checkProfessionalEmailUniqueness";

const producerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  companyRegistrationNumber: z.string().min(1, "Numéro d'enregistrement requis"),
  taxIdentificationNumber: z.string().min(1, "Identifiant fiscal requis"),
  address: z.string().min(5, "Adresse complète requise"),
  googleMapsLink: z.string().optional().or(z.literal("")),
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
    setValidationErrors([]);
    setIsSubmitting(true);
    try {
      // Vérifier l'unicité de l'email
      const emailCheck = await checkProfessionalEmailUniqueness(data.email, 'producer');
      if (!emailCheck.allowed) {
        toast({
          title: "Email déjà utilisé",
          description: emailCheck.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      // Prepare registration data
      const registrationData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        company_registration_number: data.companyRegistrationNumber,
        tax_identification_number: data.taxIdentificationNumber,
        address: data.address,
        google_maps_link: data.googleMapsLink || null,
        city: data.city,
        production_type: data.productionType,
        production_capacity: data.productionCapacity,
        website: data.website,
        years_of_experience: data.yearsOfExperience,
        description: data.description,
        contact_name: `${data.firstName} ${data.lastName}`,
      };

      // Generate a temporary reference number
      const tempRefNumber = `REQ-PD-${Date.now().toString(36).toUpperCase()}`;

      // Insert into professional_registration_requests
      const { error } = await supabase
        .from('professional_registration_requests')
        .insert({
          professional_type: 'producer',
          verified_deposit_number: tempRefNumber,
          company_name: data.companyName,
          registration_data: registrationData,
          cndp_acceptance: true,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande d'inscription envoyée",
        description: "Votre demande d'inscription en tant que producteur a été envoyée. Vous recevrez une notification après validation par la BNRM.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: any) => {
    const errorMessages: string[] = [];
    if (formErrors.firstName) errorMessages.push("Prénom du responsable");
    if (formErrors.lastName) errorMessages.push("Nom du responsable");
    if (formErrors.email) errorMessages.push("Email professionnel");
    if (formErrors.phone) errorMessages.push("Téléphone");
    if (formErrors.companyName) errorMessages.push("Nom de l'entreprise");
    if (formErrors.companyRegistrationNumber) errorMessages.push("Numéro RC");
    if (formErrors.taxIdentificationNumber) errorMessages.push("Identifiant fiscal");
    if (formErrors.address) errorMessages.push("Adresse de l'entreprise");
    if (formErrors.city) errorMessages.push("Ville");
    if (formErrors.productionType) errorMessages.push("Type de production");
    if (formErrors.productionCapacity) errorMessages.push("Capacité de production");
    if (formErrors.yearsOfExperience) errorMessages.push("Années d'expérience");
    if (formErrors.description) errorMessages.push("Présentation de l'entreprise");
    
    setValidationErrors(errorMessages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Inscription Producteur</CardTitle>
        <CardDescription>
          Rejoignez notre réseau de producteurs de contenus éditoriaux
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-2">
          <span className="text-destructive font-medium">Note :</span> Les nouveaux comptes seront validés par la BNRM.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Message d'erreur de validation */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Champs obligatoires manquants</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Veuillez remplir les champs suivants :</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="font-medium">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
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
            <Label htmlFor="googleMapsLink">Lien Google Maps (optionnel)</Label>
            <Input
              id="googleMapsLink"
              {...register("googleMapsLink")}
              placeholder="https://maps.google.com/?q=..."
            />
            <p className="text-xs text-muted-foreground">
              Collez le lien de localisation Google Maps de votre établissement (facultatif)
            </p>
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

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Note importante :</h4>
            <p className="text-sm text-muted-foreground">
              Votre demande sera examinée par nos services dans un délai de 10 jours ouvrables. 
              Vous recevrez une confirmation par email une fois votre compte validé.
            </p>
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
