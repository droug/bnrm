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

const authorSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  nationality: z.string().min(1, "Nationalité requise"),
  address: z.string().min(5, "Adresse complète requise"),
  literaryGenre: z.string().min(1, "Genre littéraire requis"),
  previousWorks: z.string().optional(),
  biography: z.string().min(50, "Biographie d'au moins 50 caractères requise"),
  publishingGoals: z.string().min(1, "Objectifs de publication requis"),
});

type AuthorFormData = z.infer<typeof authorSchema>;

const AuthorSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
  });

  const onSubmit = async (data: AuthorFormData) => {
    setIsSubmitting(true);
    try {
      // Form data NOT logged for privacy - contains personal information
      toast({
        title: "Demande d'inscription envoyée",
        description: "Votre demande d'inscription en tant qu'auteur a été envoyée. Vous recevrez une confirmation par email.",
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
        <CardTitle>Inscription Auteur</CardTitle>
        <CardDescription>
          Rejoignez notre communauté d'auteurs et publiez vos œuvres
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
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
              <Label htmlFor="lastName">Nom *</Label>
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="votre.email@exemple.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="dateOfBirth">Date de naissance *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationalité *</Label>
            <Input
              id="nationality"
              {...register("nationality")}
              placeholder="Marocaine"
            />
            {errors.nationality && (
              <p className="text-sm text-destructive">{errors.nationality.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse complète *</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Votre adresse complète"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="literaryGenre">Genre littéraire principal *</Label>
            <Select onValueChange={(value) => setValue("literaryGenre", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre genre principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roman">Roman</SelectItem>
                <SelectItem value="poesie">Poésie</SelectItem>
                <SelectItem value="nouvelles">Nouvelles</SelectItem>
                <SelectItem value="essai">Essai</SelectItem>
                <SelectItem value="theatre">Théâtre</SelectItem>
                <SelectItem value="jeunesse">Littérature jeunesse</SelectItem>
                <SelectItem value="biographie">Biographie</SelectItem>
                <SelectItem value="autres">Autres</SelectItem>
              </SelectContent>
            </Select>
            {errors.literaryGenre && (
              <p className="text-sm text-destructive">{errors.literaryGenre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousWorks">Œuvres précédentes (optionnel)</Label>
            <Textarea
              id="previousWorks"
              {...register("previousWorks")}
              placeholder="Listez vos publications précédentes s'il y en a"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biographie *</Label>
            <Textarea
              id="biography"
              {...register("biography")}
              placeholder="Parlez-nous de vous, votre parcours, vos influences..."
              rows={4}
            />
            {errors.biography && (
              <p className="text-sm text-destructive">{errors.biography.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishingGoals">Objectifs de publication *</Label>
            <Select onValueChange={(value) => setValue("publishingGoals", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Que souhaitez-vous publier ?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premier-livre">Mon premier livre</SelectItem>
                <SelectItem value="nouveau-livre">Un nouveau livre</SelectItem>
                <SelectItem value="reedition">Réédition d'une œuvre</SelectItem>
                <SelectItem value="collection">Une collection d'œuvres</SelectItem>
              </SelectContent>
            </Select>
            {errors.publishingGoals && (
              <p className="text-sm text-destructive">{errors.publishingGoals.message}</p>
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

export default AuthorSignupForm;