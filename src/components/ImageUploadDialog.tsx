import React, { useRef, useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadDialogProps {
  open?: boolean;
  onClose?: () => void;
  onImageUploaded: (url: string, type?: 'image' | 'video' | 'file') => void;
  type?: 'image' | 'video' | 'file';
  className?: string;
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({ 
  open, 
  onClose, 
  onImageUploaded, 
  type = 'image',
  className = '' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const [isOpen, setIsOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : isOpen;
  const setDialogOpen = isControlled ? (onClose || (() => {})) : (value: boolean) => setIsOpen(value);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      onImageUploaded(url, type);
      if (isControlled && onClose) {
        onClose();
      } else {
        setIsOpen(false);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*';
  const Icon = type === 'image' ? Image : type === 'video' ? Upload : Upload;
  const title = type === 'image' ? 'Bild hochladen' : type === 'video' ? 'Video hochladen' : 'Datei hochladen';

  return (
    <Dialog open={dialogOpen} onOpenChange={isControlled ? onClose : setDialogOpen}>
      {!isControlled && <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Bild hochladen"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Wähle eine Datei von deinem Gerät aus.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div 
            onClick={triggerFileSelect}
            className="w-full max-w-sm h-48 border-2 border-dashed border-border rounded-2xl bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">Klicke hier oder ziehe ein Bild hinein</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF bis zu 5MB</p>
              </>
            )}
          </div>
          
          <Button
            onClick={triggerFileSelect}
            disabled={uploading}
            className="w-full max-w-sm"
          >
            {uploading ? 'Wird hochgeladen...' : 'Datei auswählen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;