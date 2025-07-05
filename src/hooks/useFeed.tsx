
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/hooks/usePosts';

export const useFeed = () => {
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch posts from followed users
  const fetchFeedPosts = async () => {
    if (!user) return;

    setLoading(true);
    
    // Get users that the current user follows
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (!follows || follows.length === 0) {
      setFeedPosts([]);
      setLoading(false);
      return;
    }

    const followingIds = follows.map(f => f.following_id);

    // Get posts from followed users
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          bio
        )
      `)
      .in('author_id', followingIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feed posts:', error);
    } else {
      setFeedPosts(posts || []);
    }
    
    setLoading(false);
  };

  // Fetch all public posts
  const fetchAllPosts = async () => {
    setLoading(true);
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          bio
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all posts:', error);
    } else {
      setAllPosts(posts || []);
    }
    
    setLoading(false);
  };

  return {
    feedPosts,
    allPosts,
    loading,
    fetchFeedPosts,
    fetchAllPosts
  };
};
