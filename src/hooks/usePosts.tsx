
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  is_public: boolean;
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);
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
      setPosts(data || []);
    }
    setLoading(false);
  };

  const createPost = async (title: string, content: string, isPublic: boolean = true) => {
    if (!user) return null;

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
      return null;
    }

    fetchPosts();
    return data;
  };

  const updatePost = async (id: string, title: string, content: string, isPublic: boolean = true) => {
    if (!user) return null;

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
      return null;
    }

    fetchPosts();
    return data;
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

    fetchPosts();
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
