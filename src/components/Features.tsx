
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: '✍️',
      title: 'Fokussiertes Schreiben',
      description: 'Ein Editor wie Bear oder iA Writer - nur das Wesentliche, keine Ablenkungen.'
    },
    {
      icon: '🎨',
      title: 'Apple-inspiriertes Design',
      description: 'Puristisches Schwarz-Weiß mit sanften Animationen und eleganten Übergängen.'
    },
    {
      icon: '🌓',
      title: 'Dark & Light Mode',
      description: 'Automatische Anpassung an deine Systemeinstellungen oder manuell wählbar.'
    },
    {
      icon: '📱',
      title: 'Vollständig Responsive',
      description: 'Perfekt optimiert für Smartphone, Tablet und Desktop - überall elegant.'
    },
    {
      icon: '🔗',
      title: 'Eigene Profile-URL',
      description: 'Deine persönliche URL wie bread.blog/username - teilbar ohne Anmeldung nötig.'
    },
    {
      icon: '🆓',
      title: 'Kostenlos Lesen',
      description: 'Alle Artikel sind öffentlich lesbar - keine Paywall, keine Popups, nur Storys.'
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Blogging für alle, die Stil schätzen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ohne Schnickschnack, ohne Lärm. Bread verbindet Ästhetik mit Funktionalität.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border glass-effect"
            >
              <CardContent className="p-6">
                <div className="text-3xl mb-4 group-hover:animate-gentle-bounce">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
