import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, Palette, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites, Website } from '@/hooks/useWebsites';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

// Simple template-based website builder

const WebBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const { saveWebsite, publishWebsite, websites } = useWebsites();
  
  const [title, setTitle] = useState('Meine Website');
  const [slug, setSlug] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#007bff');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Load existing website if editing
    if (id && websites.length > 0) {
      const website = websites.find(w => w.id === id);
      if (website) {
        setTitle(website.title);
        setSlug(website.slug);
        setIsPublished(website.is_published);
        // Extract primary color from content if available
        const content = website.content;
        if (content && content.primaryColor) {
          setPrimaryColor(content.primaryColor);
        }
      }
    }
  }, [user, navigate, id, websites]);

  // Create a blog template with customizable title and color
  const createBlogTemplate = () => {
    return {
      title,
      primaryColor,
      hasLogin: true,
      hasBlog: true,
      hasAbout: true,
      hasContact: true
    };
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte gib einen Titel und Slug ein",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    const websiteData: Partial<Website> = {
      ...(id && { id }),
      title,
      slug,
      content: createBlogTemplate(),
      html_content: generateHTML(),
      is_published: isPublished
    };

    const result = await saveWebsite(websiteData);
    if (result && !id) {
      navigate(`/webbuilder/${result.id}`);
    }
    
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte gib einen Titel und Slug ein",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);

    try {
      // First save the website
      const websiteData: Partial<Website> = {
        ...(id && { id }),
        title,
        slug,
        content: createBlogTemplate(),
        html_content: generateHTML(),
        is_published: false
      };

      let websiteId = id;
      if (!websiteId) {
        const result = await saveWebsite(websiteData);
        websiteId = result?.id;
        if (websiteId) {
          navigate(`/webbuilder/${websiteId}`);
        }
      } else {
        await saveWebsite(websiteData);
      }

      // Then publish it
      if (websiteId) {
        await publishWebsite(websiteId);
        setIsPublished(true);
        toast({
          title: "Website veröffentlicht!",
          description: `Deine Website ist jetzt unter /pages/${slug} erreichbar`,
        });
      }
    } catch (error) {
      toast({
        title: "Fehler beim Veröffentlichen",
        description: "Es gab ein Problem beim Veröffentlichen der Website",
        variant: "destructive"
      });
    }

    setIsPublishing(false);
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${title} - Powered by Bread">
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
            <div class="logo">${title}</div>
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
                <h1>Willkommen bei ${title}</h1>
                <p>Entdecke unsere neuesten Blog-Artikel und bleibe auf dem Laufenden</p>
                <a href="#blog" class="btn">Zum Blog</a>
            </div>
        </section>

        <section class="blog-section" id="blog">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 3rem; color: ${primaryColor};">Neueste Blog-Artikel</h2>
                <div id="blog-posts">
                    <!-- Blog posts will be loaded here -->
                    <div class="blog-post">
                        <h2>Willkommen auf unserer Website!</h2>
                        <div class="blog-meta">Erstellt mit Bread</div>
                        <p>Dies ist deine neue Website. Erstelle Blog-Artikel über das Dashboard und sie werden hier automatisch angezeigt.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer id="contact">
        <div class="container">
            <p>&copy; 2024 ${title}. Erstellt mit ❤️ und Bread.</p>
        </div>
    </footer>

    <div class="bread-branding">🍞 Made with Bread</div>
</body>
</html>`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Website Builder</h1>
            <p className="text-muted-foreground">Erstelle deine Blog-Website mit fertigen Templates</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Website Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Website Name</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Meine Blog Website"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">URL-Name (Slug)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="meine-website"
                  />
                  {slug && (
                    <p className="text-xs text-muted-foreground mt-1">
                      bread-blog.lovable.app/pages/{slug}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="color">Primärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#007bff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Speichern...' : 'Speichern'}
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {isPublishing ? 'Veröffentlichen...' : 'Veröffentlichen'}
                </Button>
                
                {isPublished && slug && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/pages/${slug}`, '_blank')}
                    className="w-full mt-2"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Website ansehen
                  </Button>
                )}
                
                {isPublished && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Website ist veröffentlicht!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg overflow-hidden bg-white" 
                  style={{ height: '400px' }}
                >
                  <div 
                    className="h-16 flex items-center justify-between px-4 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="font-bold">{title || 'Meine Website'}</div>
                    <div className="flex gap-4 text-sm">
                      <span>Home</span>
                      <span>Blog</span>
                      <span>Kontakt</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Willkommen bei {title || 'Meine Website'}</h2>
                    <p className="text-muted-foreground mb-4">
                      Dies ist eine Vorschau deiner Blog-Website. Sie enthält:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>Automatische Blog-Integration</li>
                      <li>Responsive Design</li>
                      <li>Login-System</li>
                      <li>Anpassbare Farben</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default WebBuilder;