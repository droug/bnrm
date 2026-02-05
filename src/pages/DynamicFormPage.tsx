import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DynamicFormRenderer } from "@/components/dynamic-form/DynamicFormRenderer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DynamicFormPage() {
  const [searchParams] = useSearchParams();
  const formKey = searchParams.get("formKey") || "";
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      if (!user) {
        toast.error("Vous devez être connecté pour soumettre une demande");
        return;
      }

      // Récupérer l'ID du registre professionnel de l'utilisateur
      const { data: professionalData, error: professionalError } = await supabase
        .from('professional_registry')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (professionalError || !professionalData) {
        toast.error("Vous devez être enregistré comme professionnel pour soumettre une déclaration");
        return;
      }

      // Créer une demande de dépôt légal avec les données du formulaire
      const { error } = await supabase
        .from("legal_deposit_requests")
        .insert({
          initiator_id: professionalData.id,
          title: data.publication_title || 'Sans titre',
          author_name: data.author_name || '',
          support_type: 'imprime' as const,
          monograph_type: formKey.includes("monograph") ? "livres" : 
                          formKey.includes("bd_software") ? "bd_logiciels" :
                          formKey.includes("special_collections") ? "collections_specialisees" : "other",
          status: 'soumis' as const,
          submission_date: new Date().toISOString(),
          metadata: {
            customFields: data, // Toutes les données du formulaire dynamique
            formKey: formKey
          }
        } as any);

      if (error) throw error;

      toast.success("Demande soumise avec succès");
      navigate("/mon-compte");
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      throw error;
    }
  };

  const normalizedLanguage = language === "amz" || language === "en" || language === "es" ? "fr" : language;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {formKey ? (
          <DynamicFormRenderer
            formKey={formKey}
            language={normalizedLanguage}
            onSubmit={handleSubmit}
            submitLabel={language === "ar" ? "إرسال الطلب" : "Soumettre la demande"}
            showBackButton
            onBack={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun formulaire sélectionné
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
