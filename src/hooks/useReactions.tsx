import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ReactionMap = Record<string, { count: number; mine: boolean }>;

export const useReactions = (postId: string) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionMap>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);
    const map: ReactionMap = {};
    (data || []).forEach((r: any) => {
      const e = r.emoji;
      if (!map[e]) map[e] = { count: 0, mine: false };
      map[e].count += 1;
      if (user && r.user_id === user.id) map[e].mine = true;
    });
    setReactions(map);
  }, [postId, user]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_reactions', filter: `post_id=eq.${postId}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [postId, load]);

  const toggle = async (emoji: string) => {
    if (!user) return;
    const mine = reactions[emoji]?.mine;
    if (mine) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
    } else {
      await supabase.from('post_reactions').insert({ post_id: postId, user_id: user.id, emoji });
    }
    // Optimistic
    setReactions((prev) => {
      const next = { ...prev };
      const cur = next[emoji] || { count: 0, mine: false };
      next[emoji] = {
        count: mine ? Math.max(0, cur.count - 1) : cur.count + 1,
        mine: !mine,
      };
      return next;
    });
  };

  return { reactions, toggle };
};
