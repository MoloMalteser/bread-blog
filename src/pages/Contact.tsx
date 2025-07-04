
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, MessageCircle, Heart } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo contact form
    setTimeout(() => {
      toast({
        title: "Nachricht gesendet",
        description: "Danke für deine Nachricht! Wir melden uns bald bei dir.",
      });
      setName('');
      setEmail('');
      setMessage('');
      setIsLoading(false);
    }, 1000);
  };

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
          <div className="text-4xl mb-4">💌</div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Kontakt
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hast du Fragen, Feedback oder möchtest einfach Hallo sagen? 
            Wir freuen uns über jede Nachricht!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Schreib uns</CardTitle>
              <CardDescription>
                Wir antworten normalerweise innerhalb von 24 Stunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
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
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Was möchtest du uns mitteilen?"
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Wird gesendet...' : 'Nachricht senden'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">E-Mail</h3>
                    <p className="text-muted-foreground text-sm">
                      hello@bread.blog
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Für alle Fragen und Anregungen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Feedback</h3>
                    <p className="text-muted-foreground text-sm">
                      feedback@bread.blog
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Hilf uns, Bread zu verbessern
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Community</h3>
                    <p className="text-muted-foreground text-sm">
                      Folge uns für Updates und News
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Twitter</Button>
                      <Button variant="outline" size="sm">GitHub</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">💡 Tipp</h3>
                <p className="text-sm text-muted-foreground">
                  Du kannst auch direkt auf unseren Posts kommentieren oder 
                  uns über dein Profil eine Nachricht schicken!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
