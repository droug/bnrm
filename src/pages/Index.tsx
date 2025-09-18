import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Collections from "@/components/Collections";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <Collections />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
