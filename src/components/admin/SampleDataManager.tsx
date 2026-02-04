import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SampleDataManager() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sampleRequests = [
    {
      manuscript_title: "مخطوط تفسير القرآن الكريم",
      manuscript_cote: "MS-AR-2024-001",
      damage_description: "تلف في الغلاف الخارجي وتآكل في الأوراق الأولى بسبب الرطوبة. بعض الصفحات منفصلة عن الكتاب.",
      urgency_level: "elevee",
      user_notes: "مخطوط نادر يحتاج إلى تدخل عاجل للحفاظ عليه",
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      manuscript_title: "ديوان شعري من القرن 18",
      manuscript_cote: "MS-AR-2024-045",
      damage_description: "تمزقات كبيرة في عدة صفحات، حبر باهت يصعب قراءته. الجلد متآكل بشدة.",
      urgency_level: "critique",
      user_notes: "يحتاج إلى ترميم شامل وإعادة تجليد",
      submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      manuscript_title: "مخطوط في الفقه المالكي",
      manuscript_cote: "MS-AR-2023-078",
      damage_description: "تلف طفيف في الهوامش، بعض البقع على الصفحات الأخيرة.",
      urgency_level: "moyenne",
      user_notes: "حالة جيدة نسبياً",
      submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      manuscript_title: "كتاب تاريخ الأندلس",
      manuscript_cote: "MS-AR-2023-156",
      damage_description: "انفصال الأوراق عن الخيوط، تلف في الجلد المغربي التقليدي.",
      urgency_level: "elevee",
      user_notes: "يتطلب إعادة تجليد كاملة",
      submitted_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      manuscript_title: "مجموع في الحديث النبوي",
      manuscript_cote: "MS-AR-2023-089",
      damage_description: "تآكل في الحواف، بقع ماء على عدة صفحات، حبر متلاشي في بعض المواضع.",
      urgency_level: "elevee",
      user_notes: "يتطلب تقييم دقيق للأضرار",
      submitted_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleAddSampleData = async () => {
    setIsAdding(true);
    try {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Obtenir le dernier numéro de demande pour générer les nouveaux numéros
      const { data: lastRequest } = await supabase
        .from('restoration_requests')
        .select('request_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;
      if (lastRequest?.request_number) {
        const match = lastRequest.request_number.match(/REST-2025-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Insérer les demandes d'exemple avec des numéros séquentiels
      const requestsToInsert = sampleRequests.map((req, index) => ({
        ...req,
        user_id: user.id,
        status: 'soumise',
        request_number: `REST-2025-${String(nextNumber + index).padStart(6, '0')}`
      }));

      const { error } = await supabase
        .from('restoration_requests')
        .insert(requestsToInsert);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${sampleRequests.length} demandes d'exemple ont été ajoutées.`,
      });

      // Rafraîchir la page pour voir les nouvelles données
      window.location.reload();
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les données d'exemple.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // Supprimer toutes les demandes de restauration
      const { error } = await supabase
        .from('restoration_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout sauf une condition impossible

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Toutes les données ont été supprimées.",
      });

      setShowDeleteConfirm(false);
      
      // Rafraîchir la page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gestion des données d'exemple
          </CardTitle>
          <CardDescription>
            Ajouter ou supprimer des données de test pour le système
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={handleAddSampleData}
            disabled={isAdding}
            className="flex-1 min-w-[200px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Ajout en cours..." : "Ajouter données d'exemple"}
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            variant="destructive"
            className="flex-1 min-w-[200px]"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer toutes les données
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement toutes les demandes de restauration de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer tout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
