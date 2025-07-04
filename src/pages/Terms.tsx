
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">Nutzungsbedingungen</h1>
          <p className="text-muted-foreground">
            Zuletzt aktualisiert: Januar 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">1. Willkommen bei Bread</h2>
              <p className="text-muted-foreground">
                Diese Nutzungsbedingungen regeln deine Nutzung von Bread, einer kostenlosen 
                Blogging-Plattform. Durch die Nutzung von Bread stimmst du diesen Bedingungen zu.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">2. Kostenlose Nutzung</h2>
              <p className="text-muted-foreground mb-4">
                Bread ist und bleibt kostenlos. Du kannst:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Unbegrenzt Posts erstellen und veröffentlichen</li>
                <li>Dein eigenes Profil gestalten</li>
                <li>Alle Features ohne Einschränkungen nutzen</li>
                <li>Deine Posts jederzeit löschen oder bearbeiten</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">3. Deine Inhalte</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Du behältst alle Rechte</strong> an deinen Inhalten. 
                  Bread beansprucht keine Eigentumsrechte an deinen Posts.
                </p>
                <p>
                  Du gibst uns jedoch die Erlaubnis, deine öffentlichen Posts auf der Plattform anzuzeigen 
                  und sie für andere Nutzer zugänglich zu machen.
                </p>
                <p>
                  Du bist verantwortlich für die Inhalte, die du veröffentlichst.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">4. Verbotene Inhalte</h2>
              <p className="text-muted-foreground mb-4">
                Auf Bread sind folgende Inhalte nicht erlaubt:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Hassrede oder diskriminierende Inhalte</li>
                <li>Spam oder irreführende Informationen</li>
                <li>Urheberrechtsverletzungen</li>
                <li>Illegale Inhalte oder Aktivitäten</li>
                <li>Belästigung oder Mobbing</li>
                <li>Explizite oder schädliche Inhalte</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">5. Account-Verantwortung</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Du bist für die Sicherheit deines Accounts verantwortlich</li>
                <li>Ein Account pro Person</li>
                <li>Wahre Angaben bei der Registrierung</li>
                <li>Sofortige Meldung bei unbefugtem Zugriff</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">6. Plattform-Verfügbarkeit</h2>
              <p className="text-muted-foreground">
                Wir bemühen uns, Bread rund um die Uhr verfügbar zu halten, können jedoch 
                keine 100%ige Verfügbarkeit garantieren. Wartungsarbeiten werden 
                nach Möglichkeit angekündigt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">7. Änderungen</h2>
              <p className="text-muted-foreground">
                Wir können diese Nutzungsbedingungen jederzeit ändern. Wichtige Änderungen 
                werden per E-Mail oder über die Plattform kommuniziert. Die weitere Nutzung 
                nach Änderungen gilt als Zustimmung.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">8. Kündigung</h2>
              <p className="text-muted-foreground">
                Du kannst deinen Account jederzeit löschen. Wir können Accounts bei 
                Verstößen gegen diese Bedingungen sperren oder löschen. 
                Bei Account-Löschung werden deine Daten entsprechend unserer 
                Datenschutzerklärung behandelt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">9. Kontakt</h2>
              <p className="text-muted-foreground">
                Bei Fragen zu diesen Nutzungsbedingungen kannst du uns unter{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  legal@bread.blog
                </Link>{' '}
                kontaktieren.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
