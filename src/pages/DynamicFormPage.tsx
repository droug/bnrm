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
      // Créer une demande de dépôt légal avec les données du formulaire
      const { error } = await supabase
        .from("legal_deposit_requests")
        .insert({
          form_data: data,
          monograph_type: formKey.includes("monograph") ? "livres" : "other",
          status: "pending",
        } as any);

      if (error) throw error;

      toast.success("Demande soumise avec succès");
      navigate("/mon-compte");
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      throw error;
    }
  };

  const normalizedLanguage = language === "ber" || language === "en" ? "fr" : language;

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
            onBack={() => navigate(-1)}
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
