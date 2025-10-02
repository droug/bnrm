import React from 'react';
import PreservationManager from '@/components/PreservationManager';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PreservationPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PreservationManager />
      </main>
      <Footer />
    </div>
  );
};

export default PreservationPage;