
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            Bread is
            <span className="block font-semibold">digital blogging</span>
            <span className="block text-muted-foreground font-light">reimagined</span>
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A purist black-and-white design meets Apple-inspired elegance. 
            Write without distraction. Share with style.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center mb-12" style={{animationDelay: '0.4s'}}>
          <Button 
            size="lg" 
            className="text-base px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 focus-ring transition-all duration-200 hover:scale-105"
          >
            Start Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-base px-8 py-3 focus-ring transition-all duration-200 hover:scale-105"
          >
            View Demo
          </Button>
        </div>
        
        {/* Preview Card */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <Card className="max-w-2xl mx-auto p-8 glass-effect border shadow-2xl">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full"></div>
                <div>
                  <div className="font-medium">@yourusername</div>
                  <div className="text-sm text-muted-foreground">2 minutes ago</div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">
                On the Art of Minimalist Writing
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                Sometimes less is more. In a world full of distractions, we need places 
                that help us find peace. Bread is such a place...
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>✨ 42 Reactions</span>
                <span>📖 3 Min. Read</span>
                <span>#minimalism #writing</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Tagline */}
        <div className="animate-fade-in-up mt-12" style={{animationDelay: '0.8s'}}>
          <p className="text-sm text-muted-foreground italic">
            Simply you. Your thoughts. Your bread.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
