import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Mail, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ProgramContributionConfirmation = () => {
  const [searchParams] = useSearchParams();
  const contributionId = searchParams.get("id");
  const [contribution, setContribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContribution = async () => {
      if (!contributionId) return;

      try {
        const { data, error } = await supabase
          .from("program_contributions")
          .select("*")
          .eq("id", contributionId)
          .single();

        if (error) throw error;
        setContribution(data);
      } catch (error) {
        console.error("Error fetching contribution:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContribution();
  }, [contributionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="min-h-screen bg-[#FAF9F5]">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto rounded-2xl border-[#333333]/10">
            <CardContent className="p-8 text-center">
              <p className="text-[#333333]">Proposition introuvable</p>
              <Link to="/activites-culturelles">
                <Button className="mt-4 bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl">
                  Retour aux activités culturelles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-['Segoe_UI','Noto_Sans',sans-serif]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto rounded-2xl shadow-lg border-[#333333]/10 animate-fade-in">
          <CardHeader className="text-center border-b border-[#333333]/10 bg-gradient-to-r from-[#FAF9F5] to-white p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-[#333333]">
              Proposition soumise avec succès !
            </CardTitle>
            <p className="text-[#333333]/70 mt-2">
              Votre proposition d'activité culturelle a bien été enregistrée
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="bg-[#D4AF37]/10 rounded-xl p-6 text-center border border-[#D4AF37]/20">
              <p className="text-sm text-[#333333]/70 mb-2">Numéro de référence</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{contribution.numero_reference}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-[#FAF9F5] rounded-xl">
                <FileText className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#333333] mb-1">Titre de l'activité</h3>
                  <p className="text-[#333333]/80">{contribution.titre}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[#FAF9F5] rounded-xl">
                <Calendar className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#333333] mb-1">Date et heure proposées</h3>
                  <p className="text-[#333333]/80">
                    {format(new Date(contribution.date_proposee), 'dd MMMM yyyy', { locale: fr })} à {contribution.heure_proposee}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[#FAF9F5] rounded-xl">
                <Mail className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#333333] mb-1">Confirmation envoyée à</h3>
                  <p className="text-[#333333]/80">{contribution.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-[#333333] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Prochaines étapes
              </h3>
              <ul className="space-y-2 text-sm text-[#333333]/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] font-bold">1.</span>
                  <span>Votre dossier sera examiné par le Département des Activités Culturelles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] font-bold">2.</span>
                  <span>Une évaluation de la faisabilité technique et logistique sera effectuée</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] font-bold">3.</span>
                  <span>Vous serez notifié(e) de la décision par email</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link to="/activites-culturelles" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-[#333333]/20 hover:bg-[#333333]/5 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux activités culturelles
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button 
                  className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white rounded-xl transition-all duration-300"
                >
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProgramContributionConfirmation;
