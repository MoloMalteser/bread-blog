
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useDrawing = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'sticker'>('pen');
  const [lineWidth, setLineWidth] = useState(2);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const { user } = useAuth();

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'sticker') {
      addBreadSticker(x, y);
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const addBreadSticker = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stickers = ['🥖', '🍞', '🥯', '🧈', '🍰'];
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
    
    ctx.font = '30px Arial';
    ctx.fillText(randomSticker, x - 15, y + 10);
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryStep(historyStep - 1);
      ctx.putImageData(history[historyStep - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryStep(historyStep + 1);
      ctx.putImageData(history[historyStep + 1], 0, 0);
    }
  };

  const saveDrawing = async (title: string): Promise<boolean> => {
    if (!user || !canvasRef.current) return false;

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();

      const { error } = await supabase
        .from('drawings')
        .insert({
          user_id: user.id,
          title: title || 'Unbenannte Zeichnung',
          canvas_data: dataUrl,
          is_public: true
        });

      if (error) {
        console.error('Error saving drawing:', error);
        return false;
      }

      // Update user stats
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          drawings_created: 1
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      return true;
    } catch (error) {
      console.error('Error saving drawing:', error);
      return false;
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  return {
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
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1
  };
};
