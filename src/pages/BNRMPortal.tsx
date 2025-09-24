import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BNRMManager } from "@/components/BNRMManager";

const BNRMPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BNRMManager />
      </main>
      <Footer />
    </div>
  );
};

export default BNRMPortal;