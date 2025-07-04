
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EditorPreview = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Heute hatte ich einen wunderbaren Gedanken über die Schönheit des Einfachen...';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typedText.length < fullText.length) {
        setTypedText(fullText.substring(0, typedText.length + 1));
      }
    }, 80);
    
    return () => clearTimeout(timer);
  }, [typedText, fullText]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Schreiben neu erleben
          </h2>
          <p className="text-lg text-muted-foreground">
            Ein Editor, der dich inspiriert statt ablenkt
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Editor Mockup */}
          <Card className="p-6 glass-effect border shadow-xl">
            <div className="space-y-4">
              {/* Editor Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-muted-foreground">Entwurf gespeichert</div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Dein Titel hier..."
                  className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground"
                  defaultValue="Die Kraft der Einfachheit"
                />
                
                <div className="min-h-[200px] space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {typedText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Badge variant="secondary">#einfachheit</Badge>
                  <Badge variant="secondary">#gedanken</Badge>
                  <Badge variant="outline">+ Tag hinzufügen</Badge>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live-Vorschau</h3>
                <p className="text-sm text-muted-foreground">
                  Sieh sofort, wie dein Artikel aussehen wird - in Light oder Dark Mode.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">💾</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Auto-Save</h3>
                <p className="text-sm text-muted-foreground">
                  Deine Gedanken gehen nie verloren - automatisches Speichern in der Cloud.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">⌨️</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Shortcuts</h3>
                <p className="text-sm text-muted-foreground">
                  Markdown-Unterstützung und praktische Tastenkombinationen für schnelles Schreiben.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fokus-Modus</h3>
                <p className="text-sm text-muted-foreground">
                  Ablenkungsfreies Schreiben - nur du und deine Gedanken.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorPreview;
