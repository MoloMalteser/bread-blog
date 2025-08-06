import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Type, Image, MousePointer, Square, FileText } from 'lucide-react';

interface QuickStartGuideProps {
  onStepClick: (step: string) => void;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onStepClick }) => {
  const steps = [
    {
      id: 'text',
      icon: Type,
      title: 'Text hinzufügen',
      description: 'Füge Überschriften, Beschreibungen oder andere Texte hinzu',
      color: 'bg-blue-500'
    },
    {
      id: 'image',
      icon: Image,
      title: 'Bilder einfügen',
      description: 'Lade Bilder hoch oder verlinke sie direkt',
      color: 'bg-green-500'
    },
    {
      id: 'button',
      icon: MousePointer,
      title: 'Buttons erstellen',
      description: 'Interaktive Schaltflächen für Aktionen',
      color: 'bg-purple-500'
    },
    {
      id: 'container',
      icon: Square,
      title: 'Container nutzen',
      description: 'Organisiere deine Inhalte in Bereichen',
      color: 'bg-orange-500'
    },
    {
      id: 'blog',
      icon: FileText,
      title: 'Blog hinzufügen',
      description: 'Erstelle und verwalte Blog-Artikel',
      color: 'bg-red-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚀 Quick Start Guide
          <Badge variant="secondary" className="text-xs">2 Min</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Erstelle deine Website in wenigen Schritten:
        </p>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onStepClick(step.id)}
              >
                <div className={`p-2 rounded-lg ${step.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Schritt {index + 1}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary font-medium">
            💡 Tipp: Klicke auf ein Element um es zu bearbeiten, ziehe es um es zu verschieben!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStartGuide;