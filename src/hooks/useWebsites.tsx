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
    // Fetch all published posts from the main posts table for the owner of this website
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username
        )
      `)
      .eq('author_id', website.user_id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    const content = website.content || {};
    const primaryColor = content.primaryColor || '#007bff';
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.title}</title>
    <meta name="description" content="${website.title} - Powered by Bread">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}11 100%);
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${primaryColor};
        }
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        .nav-links a {
            text-decoration: none;
            color: #666;
            transition: color 0.3s;
        }
        .nav-links a:hover { color: ${primaryColor}; }
        
        .hero {
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
            color: white;
            text-align: center;
            padding: 4rem 0;
        }
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            background: white;
            color: ${primaryColor};
            padding: 0.8rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.3s;
        }
        .btn:hover { transform: translateY(-2px); }
        
        .blog-section {
            padding: 4rem 0;
            background: white;
        }
        .blog-post {
            background: #f8f9fa;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .blog-post h2 {
            color: ${primaryColor};
            margin-bottom: 1rem;
        }
        .blog-meta {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        .blog-content {
            white-space: pre-wrap;
            line-height: 1.6;
        }
        
        footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 2rem 0;
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
            z-index: 1000;
        }
        
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .hero h1 { font-size: 2rem; }
            .container { padding: 0 15px; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${website.title}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#about">Über uns</a></li>
                <li><a href="#contact">Kontakt</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero" id="home">
            <div class="container">
                <h1>Willkommen bei ${website.title}</h1>
                <p>Entdecke unsere neuesten Blog-Artikel und bleibe auf dem Laufenden</p>
                <a href="#blog" class="btn">Zum Blog</a>
            </div>
        </section>

        <section class="blog-section" id="blog">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 3rem; color: ${primaryColor};">Neueste Blog-Artikel</h2>
                <div class="blog-posts">
                    ${posts && posts.length > 0 ? 
                      posts.map(post => {
                        const postDate = new Date(post.created_at).toLocaleDateString('de-DE');
                        return `
                          <article class="blog-post">
                            <h2>${post.title}</h2>
                            <div class="blog-meta">Von ${post.profiles?.username || 'Unbekannt'} am ${postDate}</div>
                            <div class="blog-content">${post.content}</div>
                          </article>
                        `;
                      }).join('') :
                      `<div class="blog-post">
                        <h2>Willkommen auf unserer Website!</h2>
                        <div class="blog-meta">Erstellt mit Bread</div>
                        <div class="blog-content">Dies ist deine neue Website. Erstelle Blog-Artikel über das Dashboard und sie werden hier automatisch angezeigt.</div>
                      </div>`
                    }
                </div>
            </div>
        </section>
    </main>

    <footer id="contact">
        <div class="container">
            <p>&copy; 2024 ${website.title}. Erstellt mit ❤️ und Bread.</p>
        </div>
    </footer>

    <div class="bread-branding">🍞 Made with Bread</div>
</body>
</html>`;
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