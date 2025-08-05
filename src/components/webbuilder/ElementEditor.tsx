import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Plus, Edit, Globe } from 'lucide-react';
import { useWebsitePosts } from '@/hooks/useWebsitePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ElementEditorProps {
  element: Element | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (element: Element) => void;
  onDelete: (id: string) => void;
  websiteId?: string;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  element,
  isOpen,
  onClose,
  onSave,
  onDelete,
  websiteId
}) => {
  const [editedElement, setEditedElement] = useState<Element | null>(null);
  const [showPostManager, setShowPostManager] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSlug, setNewPostSlug] = useState('');
  
  const { posts, createPost, publishPost, unpublishPost, deletePost } = useWebsitePosts(websiteId);

  useEffect(() => {
    setEditedElement(element);
  }, [element]);

  if (!editedElement) return null;

  const updateElement = (updates: Partial<Element>) => {
    setEditedElement(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateStyles = (styleUpdates: Partial<Element['styles']>) => {
    setEditedElement(prev => prev ? {
      ...prev,
      styles: { ...prev.styles, ...styleUpdates }
    } : null);
  };

  const updateProps = (propUpdates: any) => {
    setEditedElement(prev => prev ? {
      ...prev,
      props: { ...prev.props, ...propUpdates }
    } : null);
  };

  const handleSave = () => {
    if (editedElement) {
      onSave(editedElement);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(editedElement.id);
    onClose();
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostSlug.trim()) return;
    
    const success = await createPost({
      title: newPostTitle,
      content: newPostContent,
      slug: newPostSlug
    });
    
    if (success) {
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostSlug('');
      setShowPostManager(false);
    }
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setNewPostTitle(title);
    if (!newPostSlug) {
      setNewPostSlug(generateSlugFromTitle(title));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Element bearbeiten</DialogTitle>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Blog Posts Manager */}
          {editedElement.type === 'blog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Blog Artikel verwalten</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPostManager(!showPostManager)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Neuer Artikel
                </Button>
              </div>

              {showPostManager && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Neuen Artikel erstellen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Titel</Label>
                      <Input
                        value={newPostTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Artikel Titel..."
                      />
                    </div>
                    <div>
                      <Label>URL-Name (Slug)</Label>
                      <Input
                        value={newPostSlug}
                        onChange={(e) => setNewPostSlug(e.target.value)}
                        placeholder="artikel-url-name"
                      />
                    </div>
                    <div>
                      <Label>Inhalt</Label>
                      <Textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Artikel Inhalt..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreatePost} className="flex-1">
                        <Save className="h-4 w-4 mr-1" />
                        Erstellen
                      </Button>
                      <Button variant="outline" onClick={() => setShowPostManager(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {posts.map(post => (
                  <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{post.title}</h4>
                      <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Live" : "Entwurf"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => post.is_published ? unpublishPost(post.id) : publishPost(post.id)}
                      >
                        <Globe className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Artikel erstellt
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Content for other element types */}
          {editedElement.type !== 'blog' && (
            <div>
              <Label>Inhalt</Label>
              {editedElement.type === 'image' ? (
                <Input
                  value={editedElement.props?.src || ''}
                  onChange={(e) => updateProps({ src: e.target.value })}
                  placeholder="Bild URL eingeben..."
                />
              ) : (
                <Textarea
                  value={editedElement.content}
                  onChange={(e) => updateElement({ content: e.target.value })}
                  placeholder="Text eingeben..."
                  rows={3}
                />
              )}
            </div>
          )}

          {/* Position & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Breite (px)</Label>
              <Input
                type="number"
                value={editedElement.styles.width}
                onChange={(e) => updateStyles({ width: parseInt(e.target.value) || 100 })}
              />
            </div>
            <div>
              <Label>Höhe (px)</Label>
              <Input
                type="number"
                value={editedElement.styles.height}
                onChange={(e) => updateStyles({ height: parseInt(e.target.value) || 40 })}
              />
            </div>
          </div>

          {/* Text Styling */}
          {(editedElement.type === 'text' || editedElement.type === 'button') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Schriftgröße</Label>
                  <Input
                    type="number"
                    value={editedElement.styles.fontSize}
                    onChange={(e) => updateStyles({ fontSize: parseInt(e.target.value) || 16 })}
                  />
                </div>
                <div>
                  <Label>Textausrichtung</Label>
                  <Select value={editedElement.styles.textAlign} onValueChange={(value: any) => updateStyles({ textAlign: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Links</SelectItem>
                      <SelectItem value="center">Mitte</SelectItem>
                      <SelectItem value="right">Rechts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Textfarbe</Label>
                  <Input
                    type="color"
                    value={editedElement.styles.color}
                    onChange={(e) => updateStyles({ color: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Schriftstärke</Label>
                  <Select value={editedElement.styles.fontWeight} onValueChange={(value: any) => updateStyles({ fontWeight: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Fett</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Background & Border */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hintergrundfarbe</Label>
              <Input
                type="color"
                value={editedElement.styles.backgroundColor}
                onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
              />
            </div>
            <div>
              <Label>Abrundung (px)</Label>
              <Input
                type="number"
                value={editedElement.styles.borderRadius}
                onChange={(e) => updateStyles({ borderRadius: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Innenabstand (px)</Label>
            <Input
              type="number"
              value={editedElement.styles.padding}
              onChange={(e) => updateStyles({ padding: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElementEditor;