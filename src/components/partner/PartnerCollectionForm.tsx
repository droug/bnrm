import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Mail, Phone, Globe } from 'lucide-react';

const collectionSchema = z.object({
  institution_name: z.string().min(3, "Le nom de l'institution doit contenir au moins 3 caractères"),
  institution_code: z.string().min(2, "Le code institution doit contenir au moins 2 caractères"),
  contact_person: z.string().min(2, "Le nom du contact est requis"),
  contact_email: z.string().email("Email invalide"),
  contact_phone: z.string().optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  website_url: z.string().url("URL invalide").optional().or(z.literal('')),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export function PartnerCollectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
  });

  const onSubmit = async (data: CollectionFormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_collections')
        .insert([{
          institution_name: data.institution_name,
          institution_code: data.institution_code,
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          description: data.description || null,
          website_url: data.website_url || null,
        }]);

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de collection a été soumise pour approbation BNRM"
      });

      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur création collection:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la collection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Créer une collection partenaire
        </CardTitle>
        <CardDescription>
          Soumettez votre collection pour approbation BNRM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="institution_name">Nom de l'institution *</Label>
            <Input
              id="institution_name"
              {...register('institution_name')}
              placeholder="Bibliothèque Nationale..."
            />
            {errors.institution_name && (
              <p className="text-sm text-destructive mt-1">{errors.institution_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="institution_code">Code institution *</Label>
            <Input
              id="institution_code"
              {...register('institution_code')}
              placeholder="BN-XXX"
            />
            {errors.institution_code && (
              <p className="text-sm text-destructive mt-1">{errors.institution_code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_person">Personne de contact *</Label>
            <Input
              id="contact_person"
              {...register('contact_person')}
              placeholder="Nom complet"
            />
            {errors.contact_person && (
              <p className="text-sm text-destructive mt-1">{errors.contact_person.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email de contact *
            </Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              placeholder="contact@institution.ma"
            />
            {errors.contact_email && (
              <p className="text-sm text-destructive mt-1">{errors.contact_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone
            </Label>
            <Input
              id="contact_phone"
              {...register('contact_phone')}
              placeholder="+212..."
            />
            {errors.contact_phone && (
              <p className="text-sm text-destructive mt-1">{errors.contact_phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="website_url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site web
            </Label>
            <Input
              id="website_url"
              {...register('website_url')}
              placeholder="https://..."
            />
            {errors.website_url && (
              <p className="text-sm text-destructive mt-1">{errors.website_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Décrivez votre collection et vos objectifs..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi en cours..." : "Soumettre pour approbation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}