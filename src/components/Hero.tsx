
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const Hero = () => {
  const { language } = useLanguage();
  const langPrefix = `/${language}`;

  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-4 pt-16 pb-24 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-breathe" />
        <div className="absolute bottom-32 -right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-breathe" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm text-muted-foreground mb-8">
            <span>🥥</span>
            <span>A new kind of social</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-6 leading-[0.95]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="block">Share</span>
          <span className="block bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            everything.
          </span>
        </motion.h1>
        
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          A glassy, fluid social feed where your posts, stories, and moments come alive.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to={`${langPrefix}/auth`}>
            <Button 
              size="lg" 
              className="text-base px-8 py-3 rounded-full gradient-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              {language === 'de' ? 'Jetzt starten' : 'Get Started'}
            </Button>
          </Link>
          <a href="#features">
            <Button 
              variant="outline" 
              size="lg"
              className="text-base px-8 py-3 rounded-full glass-effect border-border/40 hover:bg-accent/50 transition-colors"
            >
              {language === 'de' ? 'Entdecken' : 'Explore'}
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
