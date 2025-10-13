
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Globe, UserX } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('de');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const t = {
    de: {
      welcomeTitle: 'Willkommen bei Bread',
      welcomeSubtitle: 'Teile deine Gedanken mit der Welt',
      login: 'Anmelden',
      register: 'Registrieren',
      anonymous: 'Anonym',
      email: 'E-Mail',
      password: 'Passwort',
      username: 'Benutzername',
      loginButton: 'Anmelden',
      registerButton: 'Registrieren',
      anonymousButton: 'Anonym weitermachen',
      loginLoading: 'Anmelden...',
      registerLoading: 'Registrieren...',
      anonymousLoading: 'Anonym anmelden...',
      back: 'Zurück',
      anonymousDesc: 'Lese Posts ohne Anmeldung (nur lesen möglich)'
    },
    en: {
      welcomeTitle: 'Welcome to Bread',
      welcomeSubtitle: 'Share your thoughts with the world',
      login: 'Login',
      register: 'Register',
      anonymous: 'Anonymous',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      loginButton: 'Login',
      registerButton: 'Register',
      anonymousButton: 'Continue anonymously',
      loginLoading: 'Logging in...',
      registerLoading: 'Registering...',
      anonymousLoading: 'Logging in anonymously...',
      back: 'Back',
      anonymousDesc: 'Read posts without registration (read-only)'
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate(`/${language}/feed`);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, username);
    
    if (!error) {
      navigate(`/${language}/feed`);
    }
    
    setLoading(false);
  };

  const handleAnonymousLogin = () => {
    setLoading(true);
    // Store anonymous session
    localStorage.setItem('anonymous-session', 'true');
    setTimeout(() => {
      navigate(`/${language}/feed`);
      setLoading(false);
    }, 1000);
  };

  const text = t[language as keyof typeof t];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <BreadLogo />
            </Link>
            
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {text.back}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{text.welcomeTitle}</CardTitle>
            <p className="text-muted-foreground">
              {text.welcomeSubtitle}
            </p>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">{text.login}</TabsTrigger>
                <TabsTrigger value="register">{text.register}</TabsTrigger>
                <TabsTrigger value="anonymous">{text.anonymous}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder={text.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder={text.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? text.loginLoading : text.loginButton}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder={text.username}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder={text.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder={text.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? text.registerLoading : text.registerButton}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="anonymous">
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <UserX className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {text.anonymousDesc}
                    </p>
                  </div>
                  <Button 
                    onClick={handleAnonymousLogin} 
                    className="w-full" 
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? text.anonymousLoading : text.anonymousButton}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
