import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Website {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: any;
  html_content?: string;
  is_published: boolean;
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

export const useWebsites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWebsite = async (websiteData: Partial<Website>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('websites')
        .upsert({
          ...websiteData,
          user_id: user.id,
          title: websiteData.title || '',
          slug: websiteData.slug || '',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Website gespeichert",
        description: `${websiteData.title} wurde erfolgreich gespeichert`
      });
      
      fetchWebsites(); // Refresh list
      return data;
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Website gelöscht",
        description: "Website wurde erfolgreich gelöscht"
      });
      
      fetchWebsites(); // Refresh list
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const publishWebsite = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('websites')
        .update({ is_published: true })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Website veröffentlicht",
        description: "Website ist jetzt öffentlich verfügbar"
      });
      
      fetchWebsites(); // Refresh list
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

  useEffect(() => {
    fetchWebsites();
  }, [user]);

  return {
    websites,
    loading,
    saveWebsite,
    deleteWebsite,
    publishWebsite,
    fetchWebsites
  };
};