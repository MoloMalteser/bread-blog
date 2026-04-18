import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const BUCKETS = {
  uploads: 'uploads',
  stories: 'stories',
} as const;

export const useMediaUpload = (bucket: keyof typeof BUCKETS = 'uploads') => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const upload = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({ title: 'Login required', variant: 'destructive' });
      return null;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: 'File too large (max 25MB)', variant: 'destructive' });
      return null;
    }

    setUploading(true);
    setProgress(10);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      setProgress(40);
      const { error } = await supabase.storage
        .from(BUCKETS[bucket])
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      setProgress(90);
      const { data: urlData } = supabase.storage.from(BUCKETS[bucket]).getPublicUrl(path);
      setProgress(100);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setTimeout(() => setProgress(0), 500);
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
};
