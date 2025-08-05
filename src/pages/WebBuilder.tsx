import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, Eye, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites, Website } from '@/hooks/useWebsites';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ElementToolbar from '@/components/webbuilder/ElementToolbar';
import ElementEditor from '@/components/webbuilder/ElementEditor';
import Canvas from '@/components/webbuilder/Canvas';

interface Element {
  id: string;
  type: string;
  content: string;
  styles: {
    position: 'absolute';
    left: number;
    top: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    zIndex: number;
  };
  props?: any;
}

const WebBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const { saveWebsite, publishWebsite, websites } = useWebsites();
  
  const [title, setTitle] = useState('Meine Website');
  const [slug, setSlug] = useState('');
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

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
        setElements(Array.isArray(website.content) ? website.content : []);
        setIsPublished(website.is_published);
      }
    }
  }, [user, navigate, id, websites]);

  const createNewElement = (type: string): Element => {
    const getRandomPosition = () => ({
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50
    });

    const position = getRandomPosition();
    
    const baseElement = {
      id: Date.now().toString(),
      type,
      styles: {
        position: 'absolute' as const,
        left: position.x,
        top: position.y,
        padding: 10,
        borderRadius: 4,
        fontWeight: 'normal' as const,
        textAlign: 'left' as const,
        zIndex: elements.length + 1
      }
    };

    switch (type) {
      case 'text':
        return {
          ...baseElement,
          content: 'Klick mich zum Bearbeiten',
          styles: {
            ...baseElement.styles,
            width: 200,
            height: 40,
            fontSize: 16,
            color: '#000000',
            backgroundColor: 'transparent'
          }
        };
      case 'image':
        return {
          ...baseElement,
          content: '',
          styles: {
            ...baseElement.styles,
            width: 200,
            height: 150,
            fontSize: 16,
            color: '#000000',
            backgroundColor: 'transparent'
          },
          props: { src: 'https://via.placeholder.com/200x150?text=Bild', alt: 'Bild' }
        };
      case 'button':
        return {
          ...baseElement,
          content: 'Button',
          styles: {
            ...baseElement.styles,
            width: 120,
            height: 40,
            fontSize: 16,
            color: '#ffffff',
            backgroundColor: '#007bff',
            borderRadius: 8
          }
        };
      case 'container':
        return {
          ...baseElement,
          content: 'Container',
          styles: {
            ...baseElement.styles,
            width: 200,
            height: 100,
            fontSize: 14,
            color: '#666666',
            backgroundColor: '#f8f9fa',
            borderRadius: 8
          }
        };
      case 'blog':
        return {
          ...baseElement,
          content: 'Blog Artikel',
          styles: {
            ...baseElement.styles,
            width: 400,
            height: 300,
            fontSize: 14,
            color: '#333333',
            backgroundColor: '#ffffff',
            borderRadius: 12
          }
        };
      default:
        return baseElement as Element;
    }
  };

  const addElement = (type: string) => {
    const newElement = createNewElement(type);
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setIsEditorOpen(true);
    setSidebarOpen(false);
  };

  const updateElement = (updatedElement: Element) => {
    setElements(elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
    setSelectedElement(updatedElement);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleElementClick = (element: Element | null) => {
    if (element) {
      setSelectedElement(element);
      setIsEditorOpen(true);
    } else {
      setSelectedElement(null);
      setIsEditorOpen(false);
    }
  };

  const handleElementMove = (id: string, x: number, y: number) => {
    setElements(elements.map(el => 
      el.id === id 
        ? { ...el, styles: { ...el.styles, left: x, top: y } }
        : el
    ));
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
      content: elements,
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
        content: elements,
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
    let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .bread-login-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        }
        .bread-login-widget:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,123,255,0.4);
        }
        .made-with-bread {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(40,167,69,0.3);
        }
    </style>
</head>
<body>
    <div class="made-with-bread">🍞 Made with Bread</div>`;

    elements.forEach(element => {
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
          html += `<div style="${styleString}; border: 2px solid #e0e0e0; overflow-y: auto;">
            <div style="padding: 10px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
              <strong>Blog Artikel</strong>
            </div>
            <div style="padding: 10px; color: #666;">
              Die Blog-Artikel werden beim Veröffentlichen automatisch hier angezeigt.
            </div>
          </div>`;
          break;
      }
    });

    html += `
    <a href="https://bread-blog.lovable.app/auth" class="bread-login-widget">
        🍞 Login with Bread
    </a>
</body>
</html>`;

    return html;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20 lg:pb-0 flex flex-col lg:flex-row h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-24 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:relative 
          top-20 lg:top-0 
          left-0 
          w-80 
          bg-muted/50 
          border-r 
          p-4 
          space-y-6 
          overflow-y-auto 
          z-40 
          transition-transform 
          duration-300 
          h-full
        `}>
          {/* Website Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Website Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Meine Website"
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
              
              <div className="flex gap-2">
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
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {isPublishing ? 'Veröffentlichen...' : 'Veröffentlichen'}
                </Button>
                {isPublished && slug && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/pages/${slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ansehen
                  </Button>
                )}
              </div>
              
              {isPublished && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Website ist veröffentlicht!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Element Toolbar */}
          <ElementToolbar onAddElement={addElement} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30 top-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Canvas */}
        <Canvas
          elements={elements}
          selectedElement={selectedElement}
          onElementClick={handleElementClick}
          onElementMove={handleElementMove}
          dragMode={dragMode}
          setDragMode={setDragMode}
          draggedElement={draggedElement}
          setDraggedElement={setDraggedElement}
        />

        {/* Element Editor Dialog */}
          <ElementEditor
            element={selectedElement}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={updateElement}
            onDelete={deleteElement}
            websiteId={id}
          />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default WebBuilder;