import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HelpCenter from '@/components/HelpCenter';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <HelpCenter />
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
