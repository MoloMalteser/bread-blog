
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !('Notification' in window)) return;

    // Listen for new posts from followed users
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
