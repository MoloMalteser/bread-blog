import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save } from 'lucide-react';

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
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  element,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [editedElement, setEditedElement] = useState<Element | null>(null);

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
          {/* Content */}
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