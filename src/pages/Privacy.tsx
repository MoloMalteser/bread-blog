
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-4xl font-semibold mb-4">Datenschutzerklärung</h1>
          <p className="text-muted-foreground">
            Zuletzt aktualisiert: Januar 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">1. Einleitung</h2>
              <p className="text-muted-foreground mb-4">
                Bei Bread nehmen wir den Schutz deiner persönlichen Daten sehr ernst. 
                Diese Datenschutzerklärung erklärt, welche Informationen wir sammeln, 
                wie wir sie verwenden und welche Rechte du hast.
              </p>
              <p className="text-muted-foreground">
                Bread ist eine kostenlose Blogging-Plattform, die darauf ausgelegt ist, 
                so wenig Daten wie möglich zu sammeln.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">2. Welche Daten sammeln wir?</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong className="text-foreground">Account-Daten:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>E-Mail-Adresse (für Login und Kommunikation)</li>
                    <li>Benutzername (öffentlich sichtbar)</li>
                    <li>Anzeigename (optional, öffentlich sichtbar)</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-foreground">Inhalte:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Deine Blog-Posts und Entwürfe</li>
                    <li>Tags und Kategorien</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-foreground">Technische Daten:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>IP-Adresse (nur zur Sicherheit)</li>
                    <li>Browser-Informationen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">3. Wie verwenden wir deine Daten?</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Bereitstellung und Verbesserung unserer Dienste</li>
                <li>Kommunikation mit dir über wichtige Updates</li>
                <li>Schutz vor Missbrauch und Spam</li>
                <li>Anonyme Statistiken zur Plattform-Verbesserung</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">4. Cookies und Tracking</h2>
              <p className="text-muted-foreground mb-4">
                Bread verwendet nur notwendige Cookies für:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Anmelde-Session</li>
                <li>Theme-Einstellungen (Dark/Light Mode)</li>
                <li>Lokale Entwürfe (gespeichert in deinem Browser)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Wir verwenden <strong>keine</strong> Tracking-Cookies von Drittanbietern.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">5. Deine Rechte</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Zugriff:</strong> Du kannst jederzeit deine Daten einsehen</li>
                <li><strong className="text-foreground">Korrektur:</strong> Du kannst deine Daten bearbeiten</li>
                <li><strong className="text-foreground">Löschung:</strong> Du kannst deinen Account löschen</li>
                <li><strong className="text-foreground">Datenübertragung:</strong> Du kannst deine Posts exportieren</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">6. Datensicherheit</h2>
              <p className="text-muted-foreground">
                Wir verwenden moderne Sicherheitsmaßnahmen zum Schutz deiner Daten, 
                einschließlich Verschlüsselung bei der Übertragung und sicherer Speicherung. 
                Dennoch können wir absolute Sicherheit nicht garantieren.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">7. Kontakt</h2>
              <p className="text-muted-foreground">
                Bei Fragen zum Datenschutz kannst du uns unter{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  privacy@bread.blog
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

export default Privacy;
