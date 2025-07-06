
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Send, Globe, Mask } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

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

  // Auto-save functionality
  useEffect(() => {
    if (title || content) {
      const timer = setTimeout(() => {
        if (title.trim()) {
          handleSave(false);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [title, content]);

  const handleSave = async (showToast = true) => {
    if (!title.trim() || !user) return;

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
      
      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: isPublic ? "Post veröffentlicht" : "Entwurf gespeichert",
          description: isPublic ? "Dein Post ist jetzt öffentlich sichtbar" : "Änderungen wurden gespeichert",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Post konnte nicht gespeichert werden",
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

    setIsPublic(true);
    await handleSave();
    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
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
                disabled={!title.trim() || !content.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                {isPublic ? 'Update' : 'Veröffentlichen'}
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

          {/* Content */}
          <div>
            <Textarea
              placeholder="Teile deine Gedanken..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] border-none px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
            />
          </div>

          {/* Publishing Options */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Veröffentlichungs-Optionen</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label htmlFor="public">Öffentlich</Label>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mask className="h-4 w-4" />
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
              <li>• Deine Posts werden automatisch gespeichert</li>
              <li>• Anonyme Posts zeigen deinen Namen nicht an</li>
              <li>• Einfach schreiben - Bread kümmert sich um den Rest</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Editor;
