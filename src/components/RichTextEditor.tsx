import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, Heading2, Image as ImageIcon, BarChart3, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ImageUploadDialog from './ImageUploadDialog';
import PollConfigDialog from './PollConfigDialog';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);

  const applyFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    if (selectedText) {
      const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
      onChange(newText);
      setTimeout(() => {
        textarea.setSelectionRange(start, start + prefix.length + selectedText.length + suffix.length);
        textarea.focus();
      }, 0);
    } else {
      const newText = `${beforeText}${prefix}${suffix}${afterText}`;
      onChange(newText);
      setTimeout(() => {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        textarea.focus();
      }, 0);
    }
  };

  const handleImageInsert = (url: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const imageMarkdown = `\n![Image](${url})\n`;
    const newText = value.substring(0, start) + imageMarkdown + value.substring(start);
    onChange(newText);
    setShowImageDialog(false);
  };

  const handlePollCreate = (title: string, options: string[]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const pollMarkdown = `\n\n**📊 ${title}**\n${options.map(opt => `🔘 ${opt}`).join('\n')}\n\n`;
    const newText = value.substring(0, start) + pollMarkdown + value.substring(start);
    onChange(newText);
    setShowPollDialog(false);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg border flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('**')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('*')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('~~')}
          className="h-8 w-8 p-0"
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const newText = value.substring(0, start) + '\n## Heading\n' + value.substring(start);
            onChange(newText);
          }}
          className="h-8 w-8 p-0"
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          className="h-8 w-8 p-0"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPollDialog(true)}
          className="h-8 w-8 p-0"
          title="Create Poll"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your content...'}
        className="w-full min-h-[400px] p-4 bg-background border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 text-base leading-relaxed"
      />

      {/* Dialogs */}
      {showImageDialog && (
        <ImageUploadDialog 
          onImageUploaded={(url) => {
            handleImageInsert(url);
            setShowImageDialog(false);
          }}
        />
      )}

      {showPollDialog && (
        <PollConfigDialog
          onPollCreated={(title, options) => {
            handlePollCreate(title, options);
            setShowPollDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
