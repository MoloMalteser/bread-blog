
import React from 'react';
import BreadGPT from '@/components/BreadGPT';
import Header from '@/components/Header';

const BreadGPTPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <BreadGPT />
      </main>
    </div>
  );
};

export default BreadGPTPage;
