
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: '✍️',
      title: 'Focused Writing',
      description: 'An editor like Bear or iA Writer - only the essentials, no distractions.'
    },
    {
      icon: '🎨',
      title: 'Apple-Inspired Design',
      description: 'Purist black and white with smooth animations and elegant transitions.'
    },
    {
      icon: '🌓',
      title: 'Dark & Light Mode',
      description: 'Automatic adaptation to your system settings or manually selectable.'
    },
    {
      icon: '📱',
      title: 'Fully Responsive',
      description: 'Perfectly optimized for smartphone, tablet and desktop - elegant everywhere.'
    },
    {
      icon: '🔗',
      title: 'Custom Profile URL',
      description: 'Your personal URL like bread.blog/username - shareable without login required.'
    },
    {
      icon: '🆓',
      title: 'Free to Read',
      description: 'All articles are publicly readable - no paywall, no popups, just stories.'
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Blogging for Those Who Value Style
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No frills, no noise. Bread combines aesthetics with functionality.
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
