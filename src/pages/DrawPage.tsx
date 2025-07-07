
import React from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Header from '@/components/Header';

const DrawPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <DrawingCanvas />
      </main>
    </div>
  );
};

export default DrawPage;
