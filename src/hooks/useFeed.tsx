
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/hooks/usePosts';

export const useFeed = () => {
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, Post[]>>(new Map());
  const { user } = useAuth();

  // Fetch posts from followed users
  const fetchFeedPosts = async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `feed_${user.id}`;
    
    // Check cache first
    if (!forceRefresh && cache.has(cacheKey)) {
      setFeedPosts(cache.get(cacheKey) || []);
      return;
    }

    setLoading(true);
    try {
      // Get users that the current user follows
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!follows || follows.length === 0) {
        setFeedPosts([]);
        return;
      }

      const followingIds = follows.map(f => f.following_id);

      // Get posts from followed users with increased limit
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
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching feed posts:', error);
      } else {
        const fetchedPosts = posts || [];
        setFeedPosts(fetchedPosts);
        setCache(prev => new Map(prev).set(cacheKey, fetchedPosts));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all public posts
  const fetchAllPosts = async (forceRefresh = false) => {
    const cacheKey = 'all_posts';
    
    // Check cache first
    if (!forceRefresh && cache.has(cacheKey)) {
      setAllPosts(cache.get(cacheKey) || []);
      return;
    }

    setLoading(true);
    try {
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
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) {
        console.error('Error fetching all posts:', error);
      } else {
        const fetchedPosts = posts || [];
        setAllPosts(fetchedPosts);
        setCache(prev => new Map(prev).set(cacheKey, fetchedPosts));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    feedPosts,
    allPosts,
    loading,
    fetchFeedPosts,
    fetchAllPosts
  };
};
