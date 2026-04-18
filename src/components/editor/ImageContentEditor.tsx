import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface Props {
  content: string;
  setContent: (v: string) => void;
  language: string;
}

const extractUrl = (s: string) => s.match(/!\[.*?\]\((.*?)\)/)?.[1] || '';
const extractCaption = (s: string) => s.replace(/!\[.*?\]\(.*?\)\n?/, '').trim();

const ImageContentEditor = ({ content, setContent, language }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useMediaUpload('uploads');
  const url = extractUrl(content);
  const caption = extractCaption(content);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const u = await upload(f);
    if (u) setContent(`![Image](${u})\n${caption}`);
  };

  const setCap = (cap: string) => setContent(`![Image](${url})\n${cap}`);
  const clear = () => setContent('');

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {url ? (
        <div className="relative rounded-2xl overflow-hidden glass-card">
          <img src={url} alt="" className="w-full max-h-[400px] object-contain bg-muted/30" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 rounded-full h-8 w-8"
            onClick={clear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full glass-card rounded-2xl p-8 text-center hover:bg-muted/20 transition-colors"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            {uploading
              ? `${language === 'de' ? 'Lädt hoch' : 'Uploading'}... ${progress}%`
              : language === 'de'
              ? 'Bild auswählen'
              : 'Pick an image'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG · JPG · GIF · WebP</p>
        </button>
      )}
      <Textarea
        placeholder={language === 'de' ? 'Bildunterschrift...' : 'Caption...'}
        value={caption}
        onChange={(e) => setCap(e.target.value)}
        className="rounded-xl resize-none"
        rows={2}
      />
    </div>
  );
};

export default ImageContentEditor;
