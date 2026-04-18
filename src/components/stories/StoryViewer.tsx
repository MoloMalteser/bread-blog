import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GroupedStories } from '@/hooks/useStories';
import AudioPlayer from '@/components/AudioPlayer';

interface Props {
  group: GroupedStories;
  onClose: () => void;
  onView: (storyId: string) => void;
  onDelete?: (id: string) => void;
}

const STORY_DURATION = 5000;

const StoryViewer = ({ group, onClose, onView, onDelete }: Props) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const story = group.stories[index];

  useEffect(() => {
    if (!story) return;
    onView(story.id);
    setProgress(0);
    if (story.type === 'video' || story.type === 'voice') return; // wait for media end
    const start = Date.now();
    const interval = setInterval(() => {
      const p = (Date.now() - start) / STORY_DURATION;
      if (p >= 1) {
        clearInterval(interval);
        next();
      } else setProgress(p);
    }, 50);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.id]);

  const next = () => {
    if (index < group.stories.length - 1) setIndex(index + 1);
    else onClose();
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
    >
      {/* Progress bars */}
      <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-white">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
            {group.username[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium">{group.username}</span>
        </div>
        <div className="flex gap-1">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 h-8 w-8"
              onClick={() => {
                onDelete(story.id);
                next();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tap zones */}
      <button
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        onClick={prev}
        aria-label="Previous"
      />
      <button
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        onClick={next}
        aria-label="Next"
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="w-full max-w-md aspect-[9/16] flex items-center justify-center rounded-2xl overflow-hidden mx-4"
          style={{ background: story.background_color || '#5227ff' }}
        >
          {story.type === 'image' && story.media_url && (
            <img src={story.media_url} alt="" className="w-full h-full object-contain" />
          )}
          {story.type === 'video' && story.media_url && (
            <video
              src={story.media_url}
              autoPlay
              playsInline
              onEnded={next}
              className="w-full h-full object-contain"
            />
          )}
          {story.type === 'text' && (
            <p className="text-white text-2xl font-semibold text-center px-8 leading-tight">
              {story.content}
            </p>
          )}
          {story.type === 'emoji' && (
            <div className="text-[140px] leading-none">{story.content}</div>
          )}
          {story.type === 'voice' && story.media_url && (
            <div className="w-full px-6 flex flex-col items-center gap-4">
              <div className="text-7xl">🎙️</div>
              <AudioPlayer url={story.media_url} />
              {story.content && (
                <p className="text-white/90 text-sm text-center">{story.content}</p>
              )}
            </div>
          )}
          {story.mood && (
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs">
              {story.mood}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryViewer;
