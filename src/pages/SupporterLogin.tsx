import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SupporterLogin = () => {
  const { language } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const text = {
    de: {
      title: '🎉 Supporter Login',
      subtitle: 'Melde dich an, um auf exklusive Supporter-Inhalte zuzugreifen',
      email: 'E-Mail',
      password: 'Passwort',
      login: 'Anmelden',
      loggingIn: 'Wird angemeldet...',
      success: 'Erfolgreich angemeldet!',
      error: 'Anmeldung fehlgeschlagen',
      backToHome: 'Zurück zur Startseite'
    },
    en: {
      title: '🎉 Supporter Login',
      subtitle: 'Sign in to access exclusive supporter content',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      loggingIn: 'Signing in...',
      success: 'Successfully signed in!',
      error: 'Sign in failed',
      backToHome: 'Back to Home'
    }
  };

  const t = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(t.error);
      setIsLoading(false);
      return;
    }

    toast.success(t.success);
    navigate('/supporter');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <Card className="p-8 max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground mb-6">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.loggingIn}
                </>
              ) : (
                t.login
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate(`/${language}`)}
            >
              {t.backToHome}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SupporterLogin;
