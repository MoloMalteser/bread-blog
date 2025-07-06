import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { Check, ArrowLeft, X } from 'lucide-react';

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
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Preise</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Einfach. Transparent. Für jeden.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bread bietet für jeden das richtige Paket - von kostenlosen persönlichen Blogs 
            bis hin zu professionellen Unternehmenslösungen.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
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
                  <span>Likes & Kommentare</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Follow-System</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Push-Benachrichtigungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Anonyme Posts</span>
                </div>
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Kostenlos starten
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Anonymous Plan */}
          <Card>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🎭</div>
              <CardTitle className="text-2xl">Bread Anonymous</CardTitle>
              <CardDescription>
                Nur lesen, anonym
              </CardDescription>
              <div className="text-4xl font-bold">0€</div>
              <p className="text-muted-foreground">kostenlos</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Alle Posts lesen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dark & Light Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Keine Posts erstellen</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Keine Interaktionen</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Kein Profil</span>
                </div>
              </div>
              
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  Anonym durchstöbern
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-orange-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white">Bald verfügbar</Badge>
            </div>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏢</div>
              <CardTitle className="text-2xl">Bread Pro</CardTitle>
              <CardDescription>
                Für Unternehmen
              </CardDescription>
              <div className="text-4xl font-bold">0€</div>
              <p className="text-muted-foreground">kostenlos (Beta)</p>
            </CardHeader>
            <CardContent className="space-y-4 opacity-75">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Alle Free Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Google SSO</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Team-Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom Branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority Support</span>
                </div>
              </div>
              
              <Button className="w-full" disabled>
                Bald verfügbar
              </Button>
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
