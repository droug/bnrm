import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BNRMServicesPublic } from "@/components/bnrm/BNRMServicesPublic";

export default function PublicServices() {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("type"); // "abonnements" ou "location"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <BNRMServicesPublic filterType={serviceType || undefined} />
      </main>
      <Footer />
    </div>
  );
}
