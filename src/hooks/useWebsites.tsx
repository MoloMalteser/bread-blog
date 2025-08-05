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
    if (!user) return false;

    try {
      // First generate the HTML content for the website
      const website = websites.find(w => w.id === id);
      if (!website) {
        throw new Error('Website nicht gefunden');
      }

      // Generate complete HTML including embedded posts
      const htmlContent = await generateCompleteHTML(website);

      // Update website with HTML content and publish
      const { error } = await supabase
        .from('websites')
        .update({ 
          is_published: true,
          html_content: htmlContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Website veröffentlicht",
        description: "Website ist jetzt öffentlich verfügbar"
      });
      
      fetchWebsites();
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

  const unpublishWebsite = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('websites')
        .update({ 
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Website zurückgezogen",
        description: "Website ist nicht mehr öffentlich sichtbar"
      });
      
      fetchWebsites();
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

  const generateCompleteHTML = async (website: Website): Promise<string> => {
    // Fetch published posts for this website
    const { data: posts } = await (supabase as any)
      .from('website_posts')
      .select('*')
      .eq('website_id', website.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const elements = Array.isArray(website.content) ? website.content : [];
    
    let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.title}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .bread-branding {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .powered-by {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .powered-by:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(238, 90, 36, 0.6);
        }
        .blog-posts {
            margin: 20px;
            max-width: 800px;
        }
        .blog-post {
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .blog-post h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 24px;
        }
        .blog-post .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .blog-post .content {
            color: #444;
            line-height: 1.6;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>`;

    // Add website elements
    elements.forEach((element: any) => {
      const { styles } = element;
      const styleString = `
        position: ${styles.position};
        left: ${styles.left}px;
        top: ${styles.top}px;
        width: ${styles.width}px;
        height: ${styles.height}px;
        font-size: ${styles.fontSize}px;
        color: ${styles.color};
        background-color: ${styles.backgroundColor};
        padding: ${styles.padding}px;
        border-radius: ${styles.borderRadius}px;
        font-weight: ${styles.fontWeight};
        text-align: ${styles.textAlign};
        z-index: ${styles.zIndex};
        border: none;
        cursor: ${element.type === 'button' ? 'pointer' : 'default'};
        display: flex;
        align-items: center;
        justify-content: ${styles.textAlign === 'center' ? 'center' : 'flex-start'};
      `;

      switch (element.type) {
        case 'text':
          html += `<div style="${styleString}">${element.content}</div>`;
          break;
        case 'image':
          html += `<img src="${element.props?.src}" alt="${element.props?.alt}" style="${styleString}; object-fit: cover;" />`;
          break;
        case 'button':
          html += `<button style="${styleString}" onclick="alert('Button geklickt!')">${element.content}</button>`;
          break;
        case 'container':
          html += `<div style="${styleString}; border: 2px solid #e0e0e0;">${element.content}</div>`;
          break;
        case 'blog':
          // Add blog posts section
          if (posts && posts.length > 0) {
            html += `<div class="blog-posts" style="${styleString}">`;
            posts.forEach(post => {
              const postDate = new Date(post.created_at).toLocaleDateString('de-DE');
              html += `
                <article class="blog-post">
                  <h2>${post.title}</h2>
                  <div class="meta">Veröffentlicht am ${postDate}</div>
                  <div class="content">${post.content}</div>
                </article>
              `;
            });
            html += `</div>`;
          } else {
            html += `<div style="${styleString}">Keine Blog-Artikel verfügbar</div>`;
          }
          break;
      }
    });

    html += `
    <div class="bread-branding">🍞 Made with Bread</div>
    <a href="https://bread-blog.lovable.app/auth" class="powered-by">
        Powered with ❤️ by Bread
    </a>
</body>
</html>`;

    return html;
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
    unpublishWebsite,
    fetchWebsites
  };
};