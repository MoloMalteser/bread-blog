
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !('Notification' in window)) return;

    // Request permission for notifications
    const requestPermission = async () => {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Benachrichtigungen aktiviert",
            description: "Du erhältst jetzt Benachrichtigungen für neue Posts von Freunden",
          });
        }
      }
    };

    requestPermission();

    // Listen for new posts from followed users
    const postsChannel = supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `is_public=eq.true`
        },
        async (payload) => {
          // Check if the post is from a followed user
          const { data: follows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

          if (follows?.some(f => f.following_id === payload.new.author_id)) {
            // Get author info
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.author_id)
              .single();

            if (Notification.permission === 'granted') {
              new Notification(`Neuer Post von ${profile?.username}`, {
                body: payload.new.title,
                icon: '/favicon.ico',
                tag: 'new-post'
              });
            }
          }
        }
      )
      .subscribe();

    // Listen for new direct messages
    const messagesChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          // Get sender info
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.sender_id)
            .single();

          if (Notification.permission === 'granted') {
            const notification = new Notification(`New message from ${profile?.username}`, {
              body: payload.new.content.substring(0, 100),
              icon: '/favicon.ico',
              tag: 'new-message',
              requireInteraction: true
            });

            notification.onclick = () => {
              window.focus();
              window.location.href = `/contacts?chat=${payload.new.sender_id}`;
            };
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, toast]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Benachrichtigungen nicht unterstützt",
        description: "Dein Browser unterstützt keine Push-Benachrichtigungen",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Benachrichtigungen blockiert",
        description: "Bitte erlaube Benachrichtigungen in deinen Browser-Einstellungen",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Benachrichtigungen aktiviert",
        description: "Du erhältst jetzt Benachrichtigungen für neue Posts",
      });
      return true;
    }

    return false;
  };

  return { requestNotificationPermission };
};
