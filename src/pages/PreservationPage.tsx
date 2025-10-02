import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreservationManager from '@/components/PreservationManager';

const PreservationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PreservationManager />
      </main>
      <Footer />
    </div>
  );
};

export default PreservationPage;
