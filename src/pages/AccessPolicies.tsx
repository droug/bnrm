import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AccessPolicyInfo } from "@/components/AccessPolicyInfo";

export default function AccessPolicies() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-moroccan font-bold text-foreground mb-2">
              Politiques d'Accès
            </h1>
            <p className="text-muted-foreground text-lg">
              Comprendre les niveaux d'accès et permissions aux ressources numériques de la BNRM
            </p>
          </div>

          <AccessPolicyInfo />
        </div>
      </main>

      <Footer />
    </div>
  );
}
