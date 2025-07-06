
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Send, Globe, Theater } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load existing post if editing
    if (postId) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setIsPublic(post.is_public);
        // Check if post is anonymous (could be stored in metadata or separate field)
      } else {
        navigate('/dashboard');
      }
    }
  }, [postId, posts, user, navigate]);

  // Auto-save functionality - FIX: Don't navigate away after auto-save
  useEffect(() => {
    if (title || content) {
      const timer = setTimeout(() => {
        if (title.trim()) {
          handleAutoSave();
        }
      }, 3000); // Increased to 3 seconds to reduce frequency

      return () => clearTimeout(timer);
    }
  }, [title, content]);

  const handleAutoSave = async () => {
    if (!title.trim() || !user) return;

    setIsSaving(true);
    
    try {
      if (postId) {
        await updatePost(postId, title.trim(), content.trim(), false); // Save as draft
      } else {
        const newPost = await createPost(title.trim(), content.trim(), false); // Save as draft
        if (newPost) {
          // Replace current URL without navigation to set postId for future saves
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
        await updatePost(postId, title.trim(), content.trim(), false); // Save as draft
      } else {
        const newPost = await createPost(title.trim(), content.trim(), false); // Save as draft
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

    setIsSaving(true);
    
    try {
      if (postId) {
        await updatePost(postId, title.trim(), content.trim(), isPublic);
      } else {
        const newPost = await createPost(title.trim(), content.trim(), isPublic);
        if (newPost) {
          navigate(`/editor/${newPost.id}`, { replace: true });
        }
      }
      
      toast({
        title: isPublic ? "Post veröffentlicht" : "Entwurf gespeichert",
        description: isPublic ? "Dein Post ist jetzt öffentlich sichtbar" : "Post wurde als Entwurf gespeichert",
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

  if (!user) return null;

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
                onClick={() => navigate('/dashboard')}
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
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!title.trim() || !content.trim() || isSaving}
              >
                <Send className="h-4 w-4 mr-1" />
                {isPublic ? 'Veröffentlichen' : 'Als Entwurf speichern'}
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

          {/* Content with Tabs for Editor/Preview */}
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vorschau</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor">
              <Textarea
                placeholder="Teile deine Gedanken... 

Du kannst Markdown verwenden:
**fett**, *kursiv*, `code`, [Link](https://example.com)
# Überschrift 1
## Überschrift 2
### Überschrift 3"
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

          {/* Publishing Options */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Veröffentlichungs-Optionen</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label htmlFor="public">Öffentlich veröffentlichen</Label>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Theater className="h-4 w-4" />
                  <Label htmlFor="anonymous">Anonym veröffentlichen</Label>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-2">✨ Schreibtipps</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verwende Markdown: **fett**, *kursiv*, `code`</li>
              <li>• Deine Posts werden automatisch als Entwurf gespeichert</li>
              <li>• Anonyme Posts zeigen deinen Namen nicht an</li>
              <li>• Nutze die Vorschau um dein Markdown zu prüfen</li>
              <li>• Klicke "Veröffentlichen" wenn du bereit bist</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Editor;
