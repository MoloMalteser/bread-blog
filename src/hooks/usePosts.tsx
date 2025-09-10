
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  is_public: boolean;
  is_anonymous?: boolean;
  created_at: string;
  author_id: string;
  view_count: number | null;
  profiles?: {
    username: string;
    bio?: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, Post[]>>(new Map());
  const { user } = useAuth();

  const fetchPosts = async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `posts_${user.id}`;
    
    // Check cache first
    if (!forceRefresh && cache.has(cacheKey)) {
      setPosts(cache.get(cacheKey) || []);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            bio
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        const fetchedPosts = data || [];
        setPosts(fetchedPosts);
        setCache(prev => new Map(prev).set(cacheKey, fetchedPosts));
      }
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title: string, content: string, isPublic: boolean = true, isAnonymous: boolean = false) => {
    if (!user) return null;

    try {
      const { data: slugData } = await supabase.rpc('generate_slug', { title });
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          slug: slugData,
          is_public: isPublic,
          author_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      await fetchPosts(true);
      return data;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  };

  const updatePost = async (id: string, title: string, content: string, isPublic: boolean = true, isAnonymous: boolean = false) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          is_public: isPublic
        })
        .eq('id', id)
        .eq('author_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      await fetchPosts(true);
      return data;
    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    fetchPosts(true);
    return true;
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  };
};
