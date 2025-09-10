
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, Type, Sparkles } from 'lucide-react';
import EditorBreadGPT from './EditorBreadGPT';
import ImageUpload from '@/components/ImageUpload';
import PollCreator from '@/components/PollCreator';

interface EditorToolbarProps {
  onInsertText: (text: string) => void;
  onFormatText: (format: string, selectedText?: string) => void;
  onImageInsert: (url: string) => void;
  onPollCreate: (title: string, options: string[]) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const EditorToolbar = ({ onInsertText, onFormatText, onImageInsert, onPollCreate, textareaRef }: EditorToolbarProps) => {
  const [showBreadGPT, setShowBreadGPT] = useState(false);

  const handleFormat = (format: string) => {
    if (textareaRef?.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        onFormatText(format, selectedText);
      } else {
        onFormatText(format);
      }
    } else {
      onFormatText(format);
    }
  };

  return (
    <div className="bg-muted/30 rounded-xl border mb-4">
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Fett"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Kursiv"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('strikethrough')}
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Durchgestrichen"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('heading')}
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Überschrift"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 h-4 w-px bg-border" />
        
        <ImageUpload 
          onImageUploaded={onImageInsert}
        />
        
        <PollCreator 
          onPollCreated={onPollCreate}
        />
        
        <div className="mx-2 h-4 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('sparkle')}
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Sparkle"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 h-4 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBreadGPT(!showBreadGPT)}
          className="h-9 px-3 rounded-lg hover:bg-background animate-gentle-bounce"
          title="BreadGPT AI-Assistent"
        >
          <span className="text-base">🍞</span>
          <span className="ml-1 text-xs font-medium">AI</span>
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
