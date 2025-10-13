
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Globe, Moon, Sun, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { requestNotificationPermission } = useNotifications();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(false);

  const text = {
    de: {
      title: 'Einstellungen',
      account: 'Account',
      email: 'E-Mail',
      username: 'Benutzername',
      notifications: 'Benachrichtigungen',
      pushNotifications: 'Push-Benachrichtigungen',
      pushNotificationsDesc: 'Erhalte Benachrichtigungen für neue Posts von Freunden',
      notificationsDisabled: 'Benachrichtigungen deaktiviert',
      notificationsDisabledDesc: 'Du erhältst keine Benachrichtigungen mehr. Du kannst sie in den Browser-Einstellungen wieder aktivieren.',
      language: 'Sprache',
      logout: 'Abmelden'
    },
    en: {
      title: 'Settings',
      account: 'Account',
      email: 'Email',
      username: 'Username',
      notifications: 'Notifications',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Receive notifications for new posts from friends',
      notificationsDisabled: 'Notifications disabled',
      notificationsDisabledDesc: 'You will no longer receive notifications. You can enable them again in your browser settings.',
      language: 'Language',
      logout: 'Sign Out'
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotifications(Notification.permission === 'granted');
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!notifications) {
      const granted = await requestNotificationPermission();
      setNotifications(granted);
    } else {
      setNotifications(false);
      toast({
        title: t.notificationsDisabled,
        description: t.notificationsDisabledDesc,
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">{t.title}</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.account}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.email}</Label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <Label>{t.username}</Label>
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
                {t.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t.pushNotifications}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.pushNotificationsDesc}
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
                {t.language}
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
                {t.logout}
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
