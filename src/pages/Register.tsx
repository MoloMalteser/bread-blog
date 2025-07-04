
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo registration - in real app this would connect to authentication service
    setTimeout(() => {
      if (email && username && password) {
        localStorage.setItem('bread-user', JSON.stringify({
          id: 'demo-user',
          email,
          username,
          displayName: displayName || username
        }));
        toast({
          title: "Account erstellt",
          description: "Willkommen bei Bread! Du kannst jetzt loslegen.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Fehler",
          description: "Bitte alle Pflichtfelder ausfüllen",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <BreadLogo className="justify-center mb-4" />
          <h2 className="text-2xl font-semibold">Bei Bread registrieren</h2>
          <p className="text-muted-foreground mt-2">
            Erstelle deinen Account und teile deine Gedanken
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrieren</CardTitle>
            <CardDescription>
              Kostenlos - dauert nur eine Minute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Benutzername *</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="deinusername"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Deine URL: bread.blog/{username || 'deinusername'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Anzeigename</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Name (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Account wird erstellt...' : 'Kostenlosen Account erstellen'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Bereits registriert? </span>
              <Link to="/login" className="text-primary hover:underline">
                Jetzt anmelden
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
