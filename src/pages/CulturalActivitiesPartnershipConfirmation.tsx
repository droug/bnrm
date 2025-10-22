import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CulturalActivitiesPartnershipConfirmation = () => {
  const [searchParams] = useSearchParams();
  const partnershipId = searchParams.get("id");
  const [partnership, setPartnership] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnership = async () => {
      if (!partnershipId) return;

      try {
        const { data, error } = await supabase
          .from("partnerships")
          .select("*")
          .eq("id", partnershipId)
          .maybeSingle();

        if (error) throw error;
        setPartnership(data);
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnership();
  }, [partnershipId]);

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p>Chargement...</p>
              </CardContent>
            </Card>
          ) : partnership ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-[#002B45] mb-2">
                  Demande soumise avec succès !
                </h1>
                <p className="text-lg text-muted-foreground">
                  Votre demande de partenariat a été transmise à la BNRM
                </p>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Référence de votre demande</CardTitle>
                  <CardDescription>
                    Conservez ce numéro pour le suivi de votre demande
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#FAF9F5] p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-[#002B45]">
                      {partnership.id}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Informations de votre demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Organisme</p>
                    <p className="text-lg">{partnership.nom_organisme}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Objet du partenariat</p>
                    <p className="text-lg">{partnership.objet_partenariat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Type de partenariat</p>
                    <p className="text-lg capitalize">{partnership.type_partenariat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Période souhaitée</p>
                    <p className="text-lg">
                      Du {new Date(partnership.date_debut).toLocaleDateString("fr-MA")} au{" "}
                      {new Date(partnership.date_fin).toLocaleDateString("fr-MA")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[#002B45] mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Email de confirmation</h3>
                      <p className="text-sm text-muted-foreground">
                        Un email de confirmation a été envoyé à{" "}
                        <span className="font-semibold">{partnership.email_officiel}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-[#002B45] mb-3">Prochaines étapes</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#002B45] mt-1">•</span>
                    <span>
                      Notre équipe examinera votre demande sous <strong>5 jours ouvrables</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#002B45] mt-1">•</span>
                    <span>
                      Vous recevrez un email de confirmation ou de demande de complément d'information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#002B45] mt-1">•</span>
                    <span>
                      En cas d'acceptation, nous vous contacterons pour finaliser les détails du partenariat
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Link to="/">
                  <Button size="lg">
                    <Home className="mr-2 h-5 w-5" />
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  Demande non trouvée
                </p>
                <Link to="/">
                  <Button>Retour à l'accueil</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesPartnershipConfirmation;
