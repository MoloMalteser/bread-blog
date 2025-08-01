
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Send, Globe, Theater } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import EditorToolbar from '@/components/EditorToolbar';

const Editor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { posts, createPost, updatePost } = usePosts();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Check if user is anonymous
  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';

  useEffect(() => {
    if (!user && !isAnonymousUser) {
      navigate('/auth');
      return;
    }

    // Load existing post if editing
    if (postId && user) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setIsPublic(post.is_public);
        setIsAnonymous(post.is_anonymous || false);
      } else {
        navigate('/dashboard');
      }
    }
  }, [postId, posts, user, isAnonymousUser, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (title || content) {
      const timer = setTimeout(() => {
        if (title.trim() && user) {
          handleAutoSave();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [title, content, user]);

  const handleAutoSave = async () => {
    if (!title.trim() || !user) return;

    setIsSaving(true);
    
    try {
      if (postId) {
        await updatePost(postId, title.trim(), content.trim(), false, isAnonymous);
      } else {
        const newPost = await createPost(title.trim(), content.trim(), false, isAnonymous);
        if (newPost) {
          window.history.replaceState(null, '', `/editor/${newPost.id}`);
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
    
    setIsSaving(false);
  };

  const handleSave = async (showToast = true) => {
    if (!title.trim() || !user) return;

    setIsSaving(true);
    
    try {
      if (postId) {
        await updatePost(postId, title.trim(), content.trim(), false, isAnonymous);
      } else {
        const newPost = await createPost(title.trim(), content.trim(), false, isAnonymous);
        if (newPost) {
          navigate(`/editor/${newPost.id}`, { replace: true });
        }
      }
      
      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Entwurf gespeichert",
          description: "Änderungen wurden als Entwurf gespeichert",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Entwurf konnte nicht gespeichert werden",
        variant: "destructive"
      });
    }
    
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Fehlende Inhalte",
        description: "Bitte füge einen Titel und Inhalt hinzu",
        variant: "destructive"
      });
      return;
    }

    // Handle anonymous publishing - allow anonymous users to publish posts
    if (isAnonymousUser) {
      toast({
        title: "Anonymes Posten noch nicht verfügbar",
        description: "Diese Funktion wird bald implementiert. Bitte melde dich an um zu posten.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!user) return;

    setIsSaving(true);
    
    try {
      // Fix publishing logic
      const shouldPublishPublic = isPublic && !isAnonymous;
      const shouldPublishAnonymous = isAnonymous;
      const isPublishing = shouldPublishPublic || shouldPublishAnonymous;
      
      if (postId) {
        await updatePost(postId, title.trim(), content.trim(), isPublishing, isAnonymous);
      } else {
        const newPost = await createPost(title.trim(), content.trim(), isPublishing, isAnonymous);
        if (newPost) {
          navigate(`/editor/${newPost.id}`, { replace: true });
        }
      }
      
      const publishType = shouldPublishAnonymous ? "anonym" : shouldPublishPublic ? "öffentlich" : "als Entwurf";
      
      toast({
        title: `Post ${publishType} veröffentlicht`,
        description: isPublishing ? `Dein Post ist jetzt ${publishType} sichtbar` : "Post wurde als Entwurf gespeichert",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Fehler beim Veröffentlichen",
        description: "Post konnte nicht veröffentlicht werden",
        variant: "destructive"
      });
    }
    
    setIsSaving(false);
  };

  const handleInsertText = (text: string) => {
    setContent(prev => prev + (prev ? '\n\n' : '') + text);
  };

  const handleFormatText = (format: string) => {
    // Simple formatting helpers
    switch (format) {
      case 'bold':
        setContent(prev => prev + '**fetter Text**');
        break;
      case 'italic':
        setContent(prev => prev + '*kursiver Text*');
        break;
      case 'strikethrough':
        setContent(prev => prev + '~~durchgestrichener Text~~');
        break;
      case 'heading':
        setContent(prev => prev + '\n## Überschrift\n');
        break;
      case 'sparkle':
        setContent(prev => prev + '✨ *magischer Text* ✨');
        break;
    }
  };

  if (!user && !isAnonymousUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Editor Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(user ? '/dashboard' : '/feed')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Zuletzt gespeichert: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              {isSaving && (
                <span className="text-xs text-muted-foreground">Speichert...</span>
              )}

              {isAnonymousUser && (
                <span className="text-xs text-orange-600">Anonym-Modus: Schreiben erlaubt</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!title.trim() || !content.trim() || isSaving}
              >
                <Send className="h-4 w-4 mr-1" />
                {isSaving ? 'Veröffentlichen...' : 
                 isAnonymousUser ? 'Anonym veröffentlichen' : 
                 isAnonymous ? 'Anonym veröffentlichen' : 
                 isPublic ? 'Veröffentlichen' : 'Als Entwurf speichern'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Input
              type="text"
              placeholder="Dein Titel hier..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
            />
          </div>

          {/* Toolbar - only for authenticated users */}
          {user && (
            <EditorToolbar 
              onInsertText={handleInsertText} 
              onFormatText={handleFormatText}
            />
          )}

          {/* Content with Tabs for Editor/Preview */}
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vorschau</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor">
              <Textarea
                placeholder="Teile deine Gedanken... \n\nDu kannst Markdown verwenden:\n**fett**, *kursiv*, `code`, [Link](https://example.com)\n# Überschrift 1\n## Überschrift 2\n### Überschrift 3"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] border-none px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
              />
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="min-h-[400px] p-4 border rounded-lg bg-background">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground">Schreibe etwas im Editor, um die Vorschau zu sehen...</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Publishing Options - New Island Design */}
          {user && (
            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="font-medium mb-4 text-center">Veröffentlichungs-Optionen</h3>
              
              {/* Toggle Island */}
              <div className="relative bg-background rounded-xl p-1 shadow-sm border">
                <div className="grid grid-cols-2 relative">
                  {/* Sliding Selection Indicator */}
                  <div 
                    className={`absolute top-1 bottom-1 bg-primary rounded-lg transition-transform duration-200 ease-in-out ${
                      isAnonymous ? 'translate-x-full' : 'translate-x-0'
                    }`}
                    style={{ width: 'calc(50% - 4px)', left: '4px' }}
                  />
                  
                  {/* Options */}
                  <button
                    onClick={() => {
                      setIsAnonymous(false);
                      setIsPublic(true);
                    }}
                    className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors duration-200 ${
                      !isAnonymous ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Öffentlich</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsAnonymous(true);
                      setIsPublic(true);
                    }}
                    className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors duration-200 ${
                      isAnonymous ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Theater className="h-4 w-4" />
                    <span className="font-medium">Anonym</span>
                  </button>
                </div>
              </div>
              
              {isAnonymous && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <span className="text-lg mr-1">🎭</span>
                    Wenn aktiviert, wird dein Post ohne deinen Namen veröffentlicht.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Anonymous User Info */}
          {isAnonymousUser && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🥖</span>
                <h4 className="font-medium">Anonym posten</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Als anonymer Nutzer wird dein Post ohne deinen Namen veröffentlicht. 
                Der Autor wird als "Anonym" angezeigt.
              </p>
            </Card>
          )}

          {/* Tips */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-2">✨ Schreibtipps</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verwende Markdown: **fett**, *kursiv*, `code`</li>
              {user && <li>• Deine Posts werden automatisch als Entwurf gespeichert</li>}
              {user && <li>• Nutze "Write with BreadGPT" für Schreibhilfe</li>}
              <li>• Anonyme Posts zeigen deinen Namen nicht an</li>
              <li>• Nutze die Vorschau um dein Markdown zu prüfen</li>
              {user && <li>• Klicke "Veröffentlichen" wenn du bereit bist</li>}
              {isAnonymousUser && <li>• Als anonymer Nutzer kannst du direkt veröffentlichen</li>}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Editor;
