
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
import RichContentRenderer from '@/components/RichContentRenderer';
import { usePolls } from '@/hooks/usePolls';
import EditorToolbar from '@/components/EditorToolbar';
import { useLanguage } from '@/hooks/useLanguage';


const Editor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { posts, createPost, updatePost } = usePosts();
  const { createPoll } = usePolls();
  
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
      navigate(`/${language}/auth`);
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
        navigate(`/${language}/dashboard`);
      }
    }
  }, [postId, posts, user, isAnonymousUser, navigate, language]);

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
      navigate(`/${language}/auth`);
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
      
      navigate(`/${language}/dashboard`);
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

  const handleImageInsert = (url: string) => {
    const imageMarkdown = `![Bild](${url})`;
    setContent(prev => prev + '\n' + imageMarkdown);
  };

  const handlePollCreate = async (title: string, options: string[]) => {
    // For now, just show in content as placeholder
    // Real poll will be created when post is published
    const pollMarkdown = `\n\n**📊 ${title}**\n${options.map(opt => `🔘 ${opt}`).join('\n')}\n`;
    setContent(prev => prev + pollMarkdown);
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleFormatText = (format: string, selectedText?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;
    
    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        if (selectedText) {
          formattedText = `**${selectedText}**`;
          newCursorPos = start + formattedText.length;
        } else {
          // Insert markdown markers for persistent formatting
          formattedText = '****';
          newCursorPos = start + 2; // Position cursor between **|**
        }
        break;
      case 'italic':
        if (selectedText) {
          formattedText = `*${selectedText}*`;
          newCursorPos = start + formattedText.length;
        } else {
          // Insert markdown markers for persistent formatting
          formattedText = '**';
          newCursorPos = start + 1; // Position cursor between *|*
        }
        break;
      case 'strikethrough':
        if (selectedText) {
          formattedText = `~~${selectedText}~~`;
          newCursorPos = start + formattedText.length;
        } else {
          // Insert markdown markers for persistent formatting
          formattedText = '~~~~';
          newCursorPos = start + 2; // Position cursor between ~~|~~
        }
        break;
      case 'heading':
        formattedText = '\n## Überschrift\n';
        newCursorPos = start + 4; // Position after "## "
        break;
      case 'sparkle':
        if (selectedText) {
          formattedText = `✨ ${selectedText} ✨`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '✨ magischer Text ✨';
          newCursorPos = start + 2;
        }
        break;
      case 'image':
        formattedText = '\n![Bildbeschreibung](https://beispiel.com/bild.jpg)\n';
        newCursorPos = start + 3; // Position at description
        break;
      case 'poll':
        formattedText = '\n**📊 Umfrage**\n\n🔘 Option 1\n🔘 Option 2\n🔘 Option 3\n';
        newCursorPos = start + formattedText.length;
        break;
      default:
        return;
    }

    const newContent = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
    setContent(newContent);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  if (!user && !isAnonymousUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Editor Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 rounded-b-xl">
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
              onImageInsert={handleImageInsert}
              onPollCreate={handlePollCreate}
              textareaRef={textareaRef}
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
                ref={textareaRef}
                placeholder="Teile deine Gedanken... \n\nDu kannst Markdown verwenden:\n**fett**, *kursiv*, `code`, [Link](https://example.com)\n# Überschrift 1\n## Überschrift 2\n### Überschrift 3\n\n📊 Umfragen: **📊 Titel** mit 🔘 Optionen\n🖼️ Bilder: ![Alt-Text](URL)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] border-none px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed rounded-xl"
              />
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="min-h-[400px] p-6 border rounded-xl bg-background/50">
                {content ? (
                  <RichContentRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground">Schreibe etwas im Editor, um die Vorschau zu sehen...</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Publishing Options - New Island Design */}
          {user && (
            <div className="bg-muted/30 rounded-2xl p-6 border">
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
          <Card className="p-4 bg-muted/30 border rounded-xl">
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
