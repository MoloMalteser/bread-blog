
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, Type, Sparkles } from 'lucide-react';
import EditorBreadGPT from './EditorBreadGPT';

interface EditorToolbarProps {
  onInsertText: (text: string) => void;
  onFormatText: (format: string) => void;
}

const EditorToolbar = ({ onInsertText, onFormatText }: EditorToolbarProps) => {
  const [showBreadGPT, setShowBreadGPT] = useState(false);

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-1 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('strikethrough')}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('heading')}
          className="h-8 w-8 p-0"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('sparkle')}
          className="h-8 w-8 p-0"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 h-4 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBreadGPT(!showBreadGPT)}
          className="h-8 px-2 animate-gentle-bounce"
        >
          <span className="text-base">🍞</span>
          <span className="ml-1 text-xs">AI</span>
        </Button>
      </div>
      
      {showBreadGPT && (
        <div className="px-4 pb-4">
          <EditorBreadGPT onInsertText={onInsertText} />
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
