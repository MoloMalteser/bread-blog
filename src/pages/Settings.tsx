
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Bell, Globe, Moon, Sun, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationToggle = async () => {
    if (!notifications && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        toast({
          title: "Benachrichtigungen aktiviert",
          description: "Du erhältst jetzt Benachrichtigungen für neue Posts"
        });
      }
    } else {
      setNotifications(!notifications);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Einstellungen</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>E-Mail</Label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <Label>Benutzername</Label>
                <p className="text-muted-foreground">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push-Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalte Benachrichtigungen für neue Posts
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Sprache
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={language === 'de' ? 'default' : 'outline'}
                  onClick={() => setLanguage('de')}
                >
                  Deutsch
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
              >
                Abmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
