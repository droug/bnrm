import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Collections from "@/components/Collections";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/hooks/useLanguage";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <Collections />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
