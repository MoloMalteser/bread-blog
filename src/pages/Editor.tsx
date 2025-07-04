
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
  tags: string[];
  views: number;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
}

const Editor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('bread-user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(userData);
    setUser(currentUser);

    // Load existing post if editing
    if (postId) {
      const savedPosts = localStorage.getItem('bread-posts');
      if (savedPosts) {
        const posts: Post[] = JSON.parse(savedPosts);
        const post = posts.find(p => p.id === postId && p.authorId === currentUser.id);
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags);
          setIsPublished(post.published);
        } else {
          // Post not found or not owned by user
          navigate('/dashboard');
        }
      }
    }
  }, [postId, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (title || content) {
      const timer = setTimeout(() => {
        handleSave(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [title, content, tags]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async (showToast = true) => {
    if (!title.trim() || !user) return;

    setIsSaving(true);
    
    const post: Post = {
      id: postId || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().substring(0, 120) + (content.length > 120 ? '...' : ''),
      published: isPublished,
      createdAt: postId ? new Date().toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE'),
      tags,
      views: 0,
      authorId: user.id,
      authorUsername: user.username,
      authorDisplayName: user.displayName
    };

    // Save to localStorage
    const savedPosts = localStorage.getItem('bread-posts');
    let posts: Post[] = savedPosts ? JSON.parse(savedPosts) : [];
    
    if (postId) {
      posts = posts.map(p => p.id === postId && p.authorId === user.id ? post : p);
    } else {
      posts.unshift(post);
    }
    
    localStorage.setItem('bread-posts', JSON.stringify(posts));
    setLastSaved(new Date());
    setIsSaving(false);

    if (showToast) {
      toast({
        title: isPublished ? "Post veröffentlicht" : "Entwurf gespeichert",
        description: isPublished ? "Dein Post ist jetzt öffentlich sichtbar" : "Änderungen wurden gespeichert",
      });
    }
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

    setIsPublished(true);
    await handleSave();
    navigate('/dashboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
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
                variant="outline"
                size="sm"
                disabled={!title.trim() || !content.trim()}
              >
                <Eye className="h-4 w-4 mr-1" />
                Vorschau
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!title.trim() || !content.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                {isPublished ? 'Update' : 'Veröffentlichen'}
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

          {/* Tags */}
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium">Tags</h3>
              
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tag hinzufügen..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim().toLowerCase())}
                >
                  Hinzufügen
                </Button>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-2">✨ Schreibtipps</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verwende Markdown: **fett**, *kursiv*, `code`</li>
              <li>• Deine Posts werden automatisch gespeichert</li>
              <li>• Tags helfen anderen, deine Gedanken zu finden</li>
              <li>• Einfach schreiben - Bread kümmert sich um den Rest</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Editor;
