import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, Layout, Type, Image, Move, Trash2, Plus, Settings, Maximize2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites, Website } from '@/hooks/useWebsites';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

interface Element {
  id: string;
  type: string;
  content: string;
  styles: {
    position: 'absolute' | 'relative';
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
  const { saveWebsite, websites } = useWebsites();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('Meine Website');
  const [slug, setSlug] = useState('');
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      }
    }
  }, [user, navigate, id, websites]);

  // Element types for the toolbar
  const elementTypes = [
    { type: 'heading', icon: Type, label: 'Überschrift' },
    { type: 'paragraph', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Bild' },
    { type: 'button', icon: Layout, label: 'Button' }
  ];

  const createNewElement = (type: string, x = 50, y = 50): Element => ({
    id: Date.now().toString(),
    type,
    content: type === 'heading' ? 'Neue Überschrift' : 
             type === 'paragraph' ? 'Neuer Text' :
             type === 'button' ? 'Button' : '',
    styles: {
      position: 'absolute',
      left: x,
      top: y,
      width: type === 'image' ? 200 : 150,
      height: type === 'image' ? 150 : type === 'paragraph' ? 100 : 40,
      fontSize: type === 'heading' ? 24 : 16,
      color: '#000000',
      backgroundColor: type === 'button' ? '#007bff' : 'transparent',
      padding: 10,
      borderRadius: 4,
      fontWeight: type === 'heading' ? 'bold' : 'normal',
      textAlign: 'left',
      zIndex: elements.length + 1
    },
    props: type === 'image' ? { src: 'https://via.placeholder.com/200x150', alt: 'Bild' } : {}
  });

  const addElement = (type: string) => {
    const newElement = createNewElement(type);
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
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

  const handleElementClick = (element: Element, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
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
      is_published: false
    };

    const result = await saveWebsite(websiteData);
    if (result && !id) {
      navigate(`/webbuilder/${result.id}`);
    }
    
    setIsSaving(false);
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
        }
        .bread-login-widget:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>`;

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
      `;

      switch (element.type) {
        case 'heading':
          html += `<h1 style="${styleString}">${element.content}</h1>`;
          break;
        case 'paragraph':
          html += `<p style="${styleString}">${element.content}</p>`;
          break;
        case 'image':
          html += `<img src="${element.props?.src}" alt="${element.props?.alt}" style="${styleString}" />`;
          break;
        case 'button':
          html += `<button style="${styleString}" onclick="alert('Button geklickt!')">${element.content}</button>`;
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

  const renderElement = (element: Element, isCanvas = false) => {
    const { styles } = element;
    const isSelected = selectedElement?.id === element.id;
    
    const elementStyle = {
      position: styles.position as 'absolute',
      left: `${styles.left}px`,
      top: `${styles.top}px`,
      width: `${styles.width}px`,
      height: element.type === 'image' ? `${styles.height}px` : 'auto',
      minHeight: element.type !== 'image' ? `${styles.height}px` : undefined,
      fontSize: `${styles.fontSize}px`,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      padding: `${styles.padding}px`,
      borderRadius: `${styles.borderRadius}px`,
      fontWeight: styles.fontWeight,
      textAlign: styles.textAlign,
      zIndex: styles.zIndex,
      border: isSelected ? '2px dashed #007bff' : '1px solid transparent',
      cursor: isCanvas ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: styles.textAlign === 'center' ? 'center' : 'flex-start',
      overflow: 'hidden'
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!isCanvas) return;
      e.stopPropagation();
      setDraggedElement(element.id);
      setDragMode(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!dragMode || !draggedElement || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updateElement(draggedElement, {
        styles: {
          ...elements.find(el => el.id === draggedElement)?.styles!,
          left: Math.max(0, x - 75),
          top: Math.max(0, y - 20)
        }
      });
    }, [dragMode, draggedElement, elements, updateElement]);

    const handleMouseUp = useCallback(() => {
      setDragMode(false);
      setDraggedElement(null);
    }, []);

    useEffect(() => {
      if (dragMode) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [dragMode, handleMouseMove, handleMouseUp]);

    const commonProps = {
      style: elementStyle,
      onClick: isCanvas ? (e: React.MouseEvent) => handleElementClick(element, e) : undefined,
      onMouseDown: isCanvas ? handleMouseDown : undefined
    };

    switch (element.type) {
      case 'heading':
        return <h1 key={element.id} {...commonProps}>{element.content}</h1>;
      case 'paragraph':
        return <p key={element.id} {...commonProps}>{element.content}</p>;
      case 'image':
        return <img key={element.id} {...commonProps} src={element.props?.src} alt={element.props?.alt} />;
      case 'button':
        return <button key={element.id} {...commonProps}>{element.content}</button>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'overflow-hidden' : ''}`}>
      {!isFullscreen && <Header />}
      
      <main className={`${!isFullscreen ? 'pt-20 pb-20' : ''} flex`}>
        {/* Sidebar */}
        {!isFullscreen && (
          <div className="w-80 bg-muted/50 border-r p-4 space-y-6 overflow-y-auto">
            {/* Website Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Website Einstellungen
                </CardTitle>
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
                  <Button variant="outline" onClick={handleSave} disabled={isSaving} className="flex-1">
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Speichern...' : 'Speichern'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Element Toolbar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Elemente hinzufügen
                </CardTitle>
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
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Element Properties */}
            {selectedElement && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Element bearbeiten
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Inhalt</Label>
                    {selectedElement.type === 'image' ? (
                      <Input
                        value={selectedElement.props?.src || ''}
                        onChange={(e) => updateElement(selectedElement.id, {
                          props: { ...selectedElement.props, src: e.target.value }
                        })}
                        placeholder="Bild URL"
                      />
                    ) : (
                      <Textarea
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        placeholder="Text eingeben..."
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Breite</Label>
                      <Input
                        type="number"
                        value={selectedElement.styles.width}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, width: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Höhe</Label>
                      <Input
                        type="number"
                        value={selectedElement.styles.height}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, height: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Schriftgröße</Label>
                      <Input
                        type="number"
                        value={selectedElement.styles.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, fontSize: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Textfarbe</Label>
                      <Input
                        type="color"
                        value={selectedElement.styles.color}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, color: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Hintergrundfarbe</Label>
                    <Input
                      type="color"
                      value={selectedElement.styles.backgroundColor}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-background border-b p-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">WebBuilder 🏗️</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                {isFullscreen ? 'Beenden' : 'Vollbild'}
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white relative overflow-auto">
            <div
              ref={canvasRef}
              className="relative min-h-[600px] w-full"
              style={{ minWidth: '800px' }}
              onClick={handleCanvasClick}
            >
              {elements.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Layout className="h-12 w-12 mx-auto mb-4" />
                    <p>Ziehe Elemente hierher, um deine Website zu erstellen</p>
                  </div>
                </div>
              ) : (
                elements.map(element => renderElement(element, true))
              )}
              
              {/* Bread Login Widget Preview */}
              <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                🍞 Login with Bread
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isFullscreen && <BottomNavigation />}
    </div>
  );
};

export default WebBuilder;