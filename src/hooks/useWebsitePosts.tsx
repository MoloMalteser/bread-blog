import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WebsitePost {
  id: string;
  website_id: string;
  author_id: string;
  title: string;
  content: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useWebsitePosts = (websiteId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<WebsitePost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!websiteId) return;
    
    setLoading(true);
    try {
      // Use any for now until types are updated after migration
      const { data, error } = await (supabase as any)
        .from('website_posts')
        .select('*')
        .eq('website_id', websiteId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden der Artikel",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: { title: string; content: string; slug: string }): Promise<WebsitePost | null> => {
    if (!user || !websiteId) return null;

    try {
      // Use any for now until types are updated after migration
      const { data, error } = await (supabase as any)
        .from('website_posts')
        .insert({
          website_id: websiteId,
          author_id: user.id,
          title: postData.title,
          content: postData.content,
          slug: postData.slug,
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Artikel erstellt",
        description: `"${postData.title}" wurde erfolgreich erstellt`
      });
      
      fetchPosts();
      return data;
    } catch (error: any) {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updatePost = async (postId: string, updates: Partial<WebsitePost>): Promise<boolean> => {
    try {
      // Use any for now until types are updated after migration
      const { error } = await (supabase as any)
        .from('website_posts')
        .update(updates)
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Artikel aktualisiert",
        description: "Die Änderungen wurden gespeichert"
      });
      
      fetchPosts();
      return true;
    } catch (error: any) {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      // Use any for now until types are updated after migration
      const { error } = await (supabase as any)
        .from('website_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Artikel gelöscht",
        description: "Der Artikel wurde erfolgreich gelöscht"
      });
      
      fetchPosts();
      return true;
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const publishPost = async (postId: string): Promise<boolean> => {
    try {
      // Use any for now until types are updated after migration
      const { error } = await (supabase as any)
        .from('website_posts')
        .update({ is_published: true })
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Artikel veröffentlicht",
        description: "Der Artikel ist jetzt öffentlich sichtbar"
      });
      
      fetchPosts();
      return true;
    } catch (error: any) {
      toast({
        title: "Fehler beim Veröffentlichen",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const unpublishPost = async (postId: string): Promise<boolean> => {
    try {
      // Use any for now until types are updated after migration
      const { error } = await (supabase as any)
        .from('website_posts')
        .update({ is_published: false })
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Artikel zurückgezogen",
        description: "Der Artikel ist nicht mehr öffentlich sichtbar"
      });
      
      fetchPosts();
      return true;
    } catch (error: any) {
      toast({
        title: "Fehler beim Zurückziehen",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (websiteId) {
      fetchPosts();
    }
  }, [websiteId]);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    fetchPosts
  };
};