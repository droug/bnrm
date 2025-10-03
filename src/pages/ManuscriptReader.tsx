import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ManuscriptViewer } from "@/components/manuscripts/ManuscriptViewer";

const ManuscriptReader = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ManuscriptViewer />
      <Footer />
    </div>
  );
};

export default ManuscriptReader;
