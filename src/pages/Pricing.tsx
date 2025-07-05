
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { Check, ArrowLeft } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <BreadLogo />
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Zurück
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Preise</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Einfach. Transparent. Kostenlos.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bread ist und bleibt für alle kostenlos. Keine versteckten Gebühren, 
            keine Limits, keine Premium-Features.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🍞</div>
              <CardTitle className="text-2xl">Bread Free</CardTitle>
              <CardDescription>
                Für alle, für immer
              </CardDescription>
              <div className="text-4xl font-bold">0€</div>
              <p className="text-muted-foreground">kostenlos</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unbegrenzte Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Eigene Profil-URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dark & Light Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Responsive Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Automatisches Speichern</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Tags & Kategorien</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Öffentliche Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sharing-Features</span>
                </div>
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Kostenlos starten
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-8">Häufige Fragen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Warum ist Bread kostenlos?</h3>
                <p className="text-muted-foreground text-sm">
                  Wir glauben, dass jeder das Recht hat, seine Gedanken zu teilen. 
                  Bread wird durch freiwillige Spenden und unser Engagement für die Community finanziert.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Gibt es versteckte Kosten?</h3>
                <p className="text-muted-foreground text-sm">
                  Nein! Bread ist und bleibt komplett kostenlos. Keine Werbung, 
                  keine Premium-Features, keine Überraschungen.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Wie finanziert sich Bread?</h3>
                <p className="text-muted-foreground text-sm">
                  Durch freiwillige Spenden unserer Community und unsere Leidenschaft 
                  für schönes, einfaches Blogging.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Kann ich Bread unterstützen?</h3>
                <p className="text-muted-foreground text-sm">
                  Ja! Teile Bread mit Freunden, schreibe großartige Inhalte 
                  und hilf uns dabei, die Plattform zu verbessern.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
