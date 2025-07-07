
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Eraser, Pen, Undo2, Redo2, Trash2, Save, Smile } from 'lucide-react';
import { useDrawing } from '@/hooks/useDrawing';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const DrawingCanvas = () => {
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    canvasRef,
    tool,
    setTool,
    lineWidth,
    setLineWidth,
    color,
    setColor,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    redo,
    saveDrawing,
    canUndo,
    canRedo
  } = useDrawing();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Zeichnungen zu speichern",
        variant: "destructive"
      });
      return;
    }

    const success = await saveDrawing(saveTitle);
    if (success) {
      toast({
        title: "Zeichnung gespeichert! 🎨",
        description: "Deine Kunstwerk wurde erfolgreich gespeichert"
      });
      setSaveTitle('');
      setShowSaveDialog(false);
    } else {
      toast({
        title: "Fehler beim Speichern",
        description: "Zeichnung konnte nicht gespeichert werden",
        variant: "destructive"
      });
    }
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎨 Zeichenfläche</h1>
        <p className="text-muted-foreground">Erstelle deine Strichmännchen-Kunstwerke!</p>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tools */}
          <div className="flex gap-2">
            <Button
              variant={tool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pen')}
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'sticker' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('sticker')}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Colors */}
          <div className="flex gap-1">
            {colors.map((clr) => (
              <button
                key={clr}
                className={`w-8 h-8 rounded border-2 ${color === clr ? 'border-gray-400' : 'border-gray-200'}`}
                style={{ backgroundColor: clr }}
                onClick={() => setColor(clr)}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Line Width */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{lineWidth}px</span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Speichern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zeichnung speichern</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Titel deiner Zeichnung..."
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1">
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Speichern
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-200 rounded cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>🎨 Verwende Stift, Radierer oder Brot-Sticker • 💾 Speichere deine Kunstwerke</p>
        <p>↩️ Undo/Redo verfügbar • 🌈 Verschiedene Farben wählbar</p>
      </div>
    </div>
  );
};

export default DrawingCanvas;
