
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
import { Bell, Globe, Moon, Sun, Shield, Smartphone, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { requestNotificationPermission } = useNotifications();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [password, setPassword] = useState('');

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
      logout: 'Abmelden',
      devices: 'Geräte',
      lastActive: 'Zuletzt aktiv',
      deleteDevice: 'Gerät löschen',
      enterPassword: 'Passwort eingeben',
      password: 'Passwort',
      confirm: 'Bestätigen',
      cancel: 'Abbrechen'
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
      logout: 'Sign Out',
      devices: 'Devices',
      lastActive: 'Last active',
      deleteDevice: 'Delete device',
      enterPassword: 'Enter password',
      password: 'Password',
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotifications(Notification.permission === 'granted');
    }
    loadDevices();
  }, []);

  const loadDevices = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
      
      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete || !password) return;

    try {
      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password
      });

      if (signInError) {
        toast({
          title: 'Fehler',
          description: 'Falsches Passwort',
          variant: 'destructive'
        });
        return;
      }

      // Delete device
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceToDelete);

      if (error) throw error;

      toast({ title: 'Gerät gelöscht' });
      loadDevices();
      setShowPasswordDialog(false);
      setPassword('');
      setDeviceToDelete(null);
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({ title: 'Fehler', variant: 'destructive' });
    }
  };

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

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">{t.notifications}</TabsTrigger>
            <TabsTrigger value="devices">{t.devices}</TabsTrigger>
            <TabsTrigger value="language">{t.language}</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t.devices}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Geräte gefunden
                </p>
              ) : (
                devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{device.device_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.lastActive}: {new Date(device.last_active).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeviceToDelete(device.id);
                        setShowPasswordDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
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

        </TabsContent>
        </Tabs>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.enterPassword}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t.password}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDeleteDevice} className="flex-1">
                  {t.confirm}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword('');
                    setDeviceToDelete(null);
                  }}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
