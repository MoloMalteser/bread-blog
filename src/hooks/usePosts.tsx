
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  is_public: boolean;
  author_id: string;
  profiles?: {
    username: string;
    bio?: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPublicPosts = async () => {
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
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Fehler beim Laden der Posts",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
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
      toast({
        title: "Fehler beim Laden deiner Posts",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const createPost = async (title: string, content: string, isPublic: boolean = true) => {
    if (!user) return null;

    // Generate slug from title
    const { data: slugData } = await supabase.rpc('generate_slug', { title });
    const slug = slugData || 'untitled';

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        slug,
        is_public: isPublic,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler beim Erstellen des Posts",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Post erstellt",
      description: isPublic ? "Dein Post ist jetzt öffentlich sichtbar" : "Post als Entwurf gespeichert"
    });

    return data;
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .eq('author_id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler beim Aktualisieren des Posts",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Post aktualisiert",
      description: "Änderungen wurden gespeichert"
    });

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
      toast({
        title: "Fehler beim Löschen des Posts",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Post gelöscht",
      description: "Der Post wurde erfolgreich gelöscht"
    });

    return true;
  };

  const getPostBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          bio
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    return data;
  };

  return {
    posts,
    loading,
    fetchPublicPosts,
    fetchUserPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug
  };
};
