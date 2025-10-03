import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen } from 'lucide-react';

const submissionSchema = z.object({
  collection_id: z.string().min(1, "Sélectionnez une collection"),
  title: z.string().min(3, "Le titre est requis"),
  author: z.string().optional(),
  description: z.string().min(10, "La description est requise"),
  language: z.string().min(1, "La langue est requise"),
  period: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  inventory_number: z.string().optional(),
  page_count: z.number().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface Collection {
  id: string;
  institution_name: string;
  is_approved: boolean;
}

export function PartnerManuscriptSubmissionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  useEffect(() => {
    loadCollections();
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('partner_collections')
        .select('id, institution_name, is_approved')
        .eq('created_by', user.id)
        .eq('is_approved', true);

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Erreur chargement collections:', error);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_manuscript_submissions')
        .insert([{
          collection_id: data.collection_id || null,
          title: data.title,
          author: data.author || null,
          description: data.description || null,
          language: data.language,
          period: data.period || null,
          material: data.material || null,
          dimensions: data.dimensions || null,
          inventory_number: data.inventory_number || null,
          page_count: data.page_count || null,
        }]);

      if (error) throw error;

      toast({
        title: "Manuscrit soumis",
        description: "Votre manuscrit a été soumis pour révision BNRM"
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Vous devez d'abord créer et faire approuver une collection avant de soumettre des manuscrits.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Soumettre un manuscrit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="collection_id">Collection *</Label>
            <Select onValueChange={(value) => setValue('collection_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.institution_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.collection_id && (
              <p className="text-sm text-destructive mt-1">{errors.collection_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="author">Auteur</Label>
            <Input id="author" {...register('author')} />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register('description')} rows={4} />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="language">Langue *</Label>
            <Input id="language" {...register('language')} placeholder="Arabe, Français..." />
            {errors.language && (
              <p className="text-sm text-destructive mt-1">{errors.language.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">Période</Label>
              <Input id="period" {...register('period')} />
            </div>
            <div>
              <Label htmlFor="material">Matériau</Label>
              <Input id="material" {...register('material')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input id="dimensions" {...register('dimensions')} />
            </div>
            <div>
              <Label htmlFor="inventory_number">N° Inventaire</Label>
              <Input id="inventory_number" {...register('inventory_number')} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi en cours..." : "Soumettre le manuscrit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}