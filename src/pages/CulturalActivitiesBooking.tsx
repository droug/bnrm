import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/cultural-activities/BookingWizard";

export default function CulturalActivitiesBooking() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-gold via-gold-bright to-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">
                Réservation des espaces culturels
              </h1>
              <p className="text-lg opacity-90">
                Réservez nos espaces pour vos événements culturels et artistiques
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <BookingWizard />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
