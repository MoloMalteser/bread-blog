
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, Heart, Coffee, Users } from 'lucide-react';

const About = () => {
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
          <div className="text-6xl mb-6">🍞</div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Über Bread
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Brot für den Kopf – eine Plattform, die Blogging neu denkt
          </p>
        </div>

        {/* Story */}
        <div className="prose prose-lg max-w-none mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Unsere Geschichte</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Bread entstand aus der Überzeugung, dass Blogging wieder einfach werden sollte. 
                Während andere Plattformen immer komplexer werden, wollten wir zurück zu den Wurzeln: 
                schöne Texte, klares Design, keine Ablenkungen.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Inspiriert vom puristischen Design der Apple-Welt und der Einfachheit von Brot, 
                haben wir eine Plattform geschaffen, die sich auf das Wesentliche konzentriert: 
                deine Gedanken und Geschichten.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Bread ist nicht laut, nicht überladen – es ist wie ein weißes Blatt Papier mit Seele. 
                Ein Ort, wo Worte Raum haben und Gedanken wachsen können.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Mit Liebe gemacht</h3>
              <p className="text-sm text-muted-foreground">
                Jede Zeile Code, jedes Design-Element wird mit Sorgfalt und Leidenschaft erstellt.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Einfachheit</h3>
              <p className="text-sm text-muted-foreground">
                Komplexität verstecken, Einfachheit zeigen. So einfach wie Brot backen.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Bread lebt von seiner Community. Jeder Nutzer macht die Plattform besser.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission */}
        <Card className="mb-16">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Unsere Mission</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wir möchten eine Welt schaffen, in der jeder seine Gedanken frei und schön teilen kann. 
              Ohne Barrieren, ohne Kosten, ohne Kompromisse bei der Qualität.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Teil der Story werden</h2>
          <p className="text-muted-foreground mb-6">
            Starte noch heute und teile deine Gedanken mit der Welt
          </p>
          <Link to="/register">
            <Button size="lg">
              Kostenlos registrieren
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;
