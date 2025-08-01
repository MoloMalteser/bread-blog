import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Globe, Layout, Type, Image, Code } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const WebBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Available element types
  const elementTypes = [
    {
      type: 'heading',
      icon: Type,
      name: 'Überschrift',
      default: { text: 'Neue Überschrift', level: 1 }
    },
    {
      type: 'paragraph',
      icon: Type,
      name: 'Text',
      default: { text: 'Neuer Textabsatz' }
    },
    {
      type: 'image',
      icon: Image,
      name: 'Bild',
      default: { src: 'https://via.placeholder.com/400x200', alt: 'Bild' }
    },
    {
      type: 'button',
      icon: Layout,
      name: 'Button',
      default: { text: 'Klick mich', link: '#' }
    }
  ];

  const addElement = (type: string) => {
    const elementType = elementTypes.find(t => t.type === type);
    if (!elementType) return;

    const newElement = {
      id: Date.now().toString(),
      type,
      ...elementType.default,
      styles: {
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: '8px',
        margin: '8px 0'
      }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (id: string, updates: any) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const generateHTML = () => {
    let html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
`;

    elements.forEach(element => {
      const styles = Object.entries(element.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');

      switch (element.type) {
        case 'heading':
          html += `        <h${element.level} style="${styles}">${element.text}</h${element.level}>\n`;
          break;
        case 'paragraph':
          html += `        <p style="${styles}">${element.text}</p>\n`;
          break;
        case 'image':
          html += `        <img src="${element.src}" alt="${element.alt}" style="${styles}; max-width: 100%; height: auto;" />\n`;
          break;
        case 'button':
          html += `        <a href="${element.link}" style="${styles}; display: inline-block; text-decoration: none; padding: 12px 24px; background-color: #007bff; color: white; border-radius: 4px;">${element.text}</a>\n`;
          break;
      }
    });

    html += `
    </div>
    <div class="footer">
        <p>Powered with ❤️ by Bread</p>
        <p>Made in WebBuilder 🏗️</p>
    </div>
</body>
</html>
`;

    return html;
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

    try {
      const htmlContent = generateHTML();
      
      // TODO: Implement Supabase integration when database is ready
      console.log('Website saved:', { title, slug, htmlContent });
      
      toast({
        title: "Website gespeichert",
        description: `Deine Website wird verfügbar sein unter: bread-blog.lovable.app/pages/${slug}`,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Website konnte nicht gespeichert werden",
        variant: "destructive"
      });
    }

    setIsSaving(false);
  };

  const renderElement = (element: any, isPreview = false) => {
    const styles = element.styles || {};
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    const commonProps = {
      key: element.id,
      style: styles,
      onClick: !isPreview ? () => setSelectedElement(element) : undefined,
      className: !isPreview && selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''
    };

    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.level}` as keyof JSX.IntrinsicElements;
        return <HeadingTag {...commonProps}>{element.text}</HeadingTag>;
      case 'paragraph':
        return <p {...commonProps}>{element.text}</p>;
      case 'image':
        return <img {...commonProps} src={element.src} alt={element.alt} style={{ ...styles, maxWidth: '100%', height: 'auto' }} />;
      case 'button':
        return <button {...commonProps} style={{ ...styles, padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>{element.text}</button>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <div>
              <h1 className="text-3xl font-semibold">WebBuilder 🏗️</h1>
              <p className="text-muted-foreground">Erstelle deine eigene Website per Drag & Drop</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Einstellungen</CardTitle>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elemente hinzufügen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {elementTypes.map((type) => (
                    <Button
                      key={type.type}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(type.type)}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <type.icon className="h-4 w-4" />
                      <span className="text-xs">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedElement && (
              <Card>
                <CardHeader>
                  <CardTitle>Element bearbeiten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedElement.type === 'heading' && (
                    <>
                      <div>
                        <Label>Text</Label>
                        <Input
                          value={selectedElement.text}
                          onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Größe</Label>
                        <select
                          value={selectedElement.level}
                          onChange={(e) => updateElement(selectedElement.id, { level: parseInt(e.target.value) })}
                          className="w-full p-2 border rounded"
                        >
                          <option value={1}>H1 (Sehr groß)</option>
                          <option value={2}>H2 (Groß)</option>
                          <option value={3}>H3 (Mittel)</option>
                          <option value={4}>H4 (Klein)</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {selectedElement.type === 'paragraph' && (
                    <div>
                      <Label>Text</Label>
                      <Textarea
                        value={selectedElement.text}
                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {selectedElement.type === 'image' && (
                    <>
                      <div>
                        <Label>Bild URL</Label>
                        <Input
                          value={selectedElement.src}
                          onChange={(e) => updateElement(selectedElement.id, { src: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Alt Text</Label>
                        <Input
                          value={selectedElement.alt}
                          onChange={(e) => updateElement(selectedElement.id, { alt: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedElement.type === 'button' && (
                    <>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={selectedElement.text}
                          onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Link</Label>
                        <Input
                          value={selectedElement.link}
                          onChange={(e) => updateElement(selectedElement.id, { link: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Textfarbe</Label>
                    <Input
                      type="color"
                      value={selectedElement.styles?.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, color: e.target.value }
                      })}
                    />
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteElement(selectedElement.id)}
                    className="w-full"
                  >
                    Element löschen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Editor/Preview */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Vorschau</TabsTrigger>
                <TabsTrigger value="code">HTML Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="mt-4">
                <Card className="min-h-[600px]">
                  <CardContent className="p-8">
                    {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
                    
                    {elements.length === 0 ? (
                      <div className="text-center text-muted-foreground py-20">
                        <Layout className="h-12 w-12 mx-auto mb-4" />
                        <p>Klicke links auf ein Element, um mit dem Aufbau zu beginnen</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {elements.map(element => renderElement(element))}
                      </div>
                    )}
                    
                    <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
                      <p>Powered with ❤️ by Bread</p>
                      <p>Made in WebBuilder 🏗️</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <Card className="min-h-[600px]">
                  <CardContent className="p-8">
                    {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
                    
                    <div className="space-y-4">
                      {elements.map(element => renderElement(element, true))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
                      <p>Powered with ❤️ by Bread</p>
                      <p>Made in WebBuilder 🏗️</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="code" className="mt-4">
                <Card className="min-h-[600px]">
                  <CardContent className="p-4">
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                      <code>{generateHTML()}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default WebBuilder;