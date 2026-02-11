
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';

import { useLanguage } from '@/hooks/useLanguage';
import { useIPLanguage } from '@/hooks/useIPLanguage';

const Index = () => {
  const { language, t } = useLanguage();
  useIPLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        
        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('ctaDescription')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={`/${language}/auth`}>
                <Button size="lg" className="px-8">
                  {t('getStarted')}
                </Button>
              </Link>
              <Link to={`/${language}/feed`}>
                <Button size="lg" variant="outline" className="px-8">
                  {t('viewDemo')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Language Selector at bottom */}
      <div className="fixed bottom-4 right-4 z-50">
        <LanguageSelector />
      </div>

    </div>
  );
};

export default Index;
