import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  user_id: string;
  type: 'image' | 'text' | 'voice' | 'video' | 'emoji';
  content: string | null;
  media_url: string | null;
  background_color: string | null;
  mood: string | null;
  created_at: string;
  expires_at: string;
  profiles?: { username: string; badges: string[] | null };
}

export interface GroupedStories {
  user_id: string;
  username: string;
  badges: string[] | null;
  stories: Story[];
  hasUnviewed: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [grouped, setGrouped] = useState<GroupedStories[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Stories fetch error:', error);
      setLoading(false);
      return;
    }

    const userIds = [...new Set((data || []).map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, badges')
      .in('id', userIds);

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));
    const enriched: Story[] = (data || []).map((s: any) => ({
      ...s,
      profiles: profilesMap.get(s.user_id),
    }));

    let viewed: Set<string> = new Set();
    if (user) {
      const { data: views } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', user.id);
      viewed = new Set((views || []).map((v) => v.story_id));
      setViewedIds(viewed);
    }

    // Group by user
    const byUser = new Map<string, GroupedStories>();
    enriched.forEach((s) => {
      if (!byUser.has(s.user_id)) {
        byUser.set(s.user_id, {
          user_id: s.user_id,
          username: s.profiles?.username || 'unknown',
          badges: s.profiles?.badges || null,
          stories: [],
          hasUnviewed: false,
        });
      }
      const g = byUser.get(s.user_id)!;
      g.stories.push(s);
      if (!viewed.has(s.id)) g.hasUnviewed = true;
    });

    // Sort: own first, then unviewed, then viewed
    const arr = Array.from(byUser.values()).sort((a, b) => {
      if (user && a.user_id === user.id) return -1;
      if (user && b.user_id === user.id) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    setStories(enriched);
    setGrouped(arr);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStories();

    const channel = supabase
      .channel('stories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories' },
        () => fetchStories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStories]);

  const createStory = async (
    payload: {
      type: Story['type'];
      content?: string;
      media_url?: string;
      background_color?: string;
      mood?: string;
    }
  ) => {
    if (!user) {
      toast({ title: 'Login required', variant: 'destructive' });
      return null;
    }
    const { data, error } = await supabase
      .from('stories')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Failed to post story', description: error.message, variant: 'destructive' });
      return null;
    }
    toast({ title: '✨ Story posted!' });
    fetchStories();
    return data;
  };

  const markViewed = async (storyId: string) => {
    if (!user || viewedIds.has(storyId)) return;
    setViewedIds((prev) => new Set(prev).add(storyId));
    await supabase
      .from('story_views')
      .insert({ story_id: storyId, viewer_id: user.id });
  };

  const deleteStory = async (id: string) => {
    if (!user) return;
    await supabase.from('stories').delete().eq('id', id).eq('user_id', user.id);
    fetchStories();
  };

  return { stories, grouped, viewedIds, loading, createStory, markViewed, deleteStory, refetch: fetchStories };
};
