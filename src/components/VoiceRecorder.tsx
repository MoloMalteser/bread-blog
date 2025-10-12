import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onVoiceMessageSent: (url: string, duration: number) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceMessageSent }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    try {
      const fileName = `voice-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`voice-messages/${fileName}`, audioBlob, {
          contentType: 'audio/webm'
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      onVoiceMessageSent(publicUrl, recordingDuration);
      setAudioBlob(null);
      setRecordingDuration(0);

      toast({
        title: 'Success',
        description: 'Voice message sent'
      });
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: 'Error',
        description: 'Could not send voice message',
        variant: 'destructive'
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !audioBlob && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={startRecording}
          className="h-9 w-9 p-0"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}

      {isRecording && (
        <>
          <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full">
            <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatDuration(recordingDuration)}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={stopRecording}
            className="h-9 w-9 p-0"
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}

      {audioBlob && (
        <>
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-9" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={sendVoiceMessage}
            className="h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAudioBlob(null);
              setRecordingDuration(0);
            }}
            className="h-9 w-9 p-0"
          >
            ×
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
