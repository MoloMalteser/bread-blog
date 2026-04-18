import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Type, Mic, Video, Smile, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStories } from '@/hooks/useStories';
import { useMediaUpload } from '@/hooks/useMediaUpload';

type Mode = 'text' | 'image' | 'video' | 'voice' | 'emoji';

const COLORS = [
  '#5227ff', '#ff5757', '#22c55e', '#f59e0b',
  '#ec4899', '#06b6d4', '#000000', '#7c3aed',
];

const MOODS = ['✨ Vibing', '😎 Chill', '🔥 Hyped', '💭 Thinking', '🌧️ Mood', '🌈 Happy'];

const StoryCreator = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('');
  const [bg, setBg] = useState(COLORS[0]);
  const [mood, setMood] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { upload, uploading } = useMediaUpload('stories');
  const { createStory } = useStories();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f);
    if (url) setMediaUrl(url);
  };

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        const url = await upload(file);
        if (url) setMediaUrl(url);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // ignored
    }
  };
  const stopVoice = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    let payload: any = { type: mode, mood: mood || undefined };
    if (mode === 'text') {
      if (!text.trim()) return;
      payload.content = text;
      payload.background_color = bg;
    } else if (mode === 'emoji') {
      if (!emoji) return;
      payload.content = emoji;
      payload.background_color = bg;
    } else {
      if (!mediaUrl) return;
      payload.media_url = mediaUrl;
      if (text.trim()) payload.content = text;
    }
    const res = await createStory(payload);
    if (res) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h3 className="text-white font-semibold">Create moment</h3>
        <Button
          size="sm"
          className="rounded-full"
          onClick={submit}
          disabled={uploading || (mode !== 'text' && mode !== 'emoji' && !mediaUrl) || (mode === 'text' && !text.trim()) || (mode === 'emoji' && !emoji)}
        >
          <Check className="h-4 w-4 mr-1" /> Post
        </Button>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([
          ['text', Type, 'Text'],
          ['image', ImageIcon, 'Photo'],
          ['video', Video, 'Video'],
          ['voice', Mic, 'Voice'],
          ['emoji', Smile, 'Emoji'],
        ] as const).map(([m, Icon, label]) => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'outline'}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => {
              setMode(m);
              setMediaUrl(null);
            }}
          >
            <Icon className="h-3.5 w-3.5 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* Preview */}
      <div
        className="flex-1 max-w-md mx-auto w-full aspect-[9/16] rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: bg }}
      >
        {mode === 'text' && (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your moment..."
            className="bg-transparent border-0 text-white text-2xl text-center font-semibold placeholder:text-white/50 resize-none focus-visible:ring-0 px-8"
          />
        )}
        {mode === 'emoji' && (
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
            placeholder="😊"
            className="bg-transparent border-0 text-white text-[140px] text-center w-full outline-none"
          />
        )}
        {mode === 'image' && mediaUrl && (
          <img src={mediaUrl} alt="" className="w-full h-full object-contain" />
        )}
        {mode === 'video' && mediaUrl && (
          <video src={mediaUrl} autoPlay loop className="w-full h-full object-contain" />
        )}
        {mode === 'voice' && (
          <div className="text-center text-white">
            <div className="text-7xl mb-4">🎙️</div>
            {mediaUrl ? <p>Recording ready</p> : <p>{recording ? 'Recording...' : 'Tap mic to record'}</p>}
          </div>
        )}

        {(mode === 'image' || mode === 'video') && !mediaUrl && (
          <div className="text-center text-white/80">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Tap upload below</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3 max-w-md mx-auto w-full">
        {(mode === 'text' || mode === 'emoji') && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setBg(c)}
                className={`h-8 w-8 rounded-full shrink-0 ring-2 ${bg === c ? 'ring-white' : 'ring-white/20'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        {mode === 'image' || mode === 'video' ? (
          <Button
            variant="secondary"
            className="w-full rounded-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading...' : mediaUrl ? 'Change media' : `Upload ${mode}`}
          </Button>
        ) : null}

        {mode === 'voice' && (
          <Button
            variant={recording ? 'destructive' : 'secondary'}
            className="w-full rounded-full"
            onClick={recording ? stopVoice : startVoice}
            disabled={uploading}
          >
            {recording ? 'Stop' : mediaUrl ? 'Re-record' : 'Record'}
          </Button>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(mood === m ? null : m)}
              className={`px-3 py-1 rounded-full text-xs shrink-0 transition-all ${
                mood === m ? 'bg-white text-black' : 'bg-white/15 text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={mode === 'video' ? 'video/*' : 'image/*'}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </motion.div>
  );
};

export default StoryCreator;
