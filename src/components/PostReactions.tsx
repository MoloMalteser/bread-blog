import { motion, AnimatePresence } from 'framer-motion';
import { useReactions } from '@/hooks/useReactions';

const REACTIONS = ['❤️', '🔥', '😂', '👍', '⚡'];

interface Props {
  postId: string;
  disabled?: boolean;
}

export const PostReactions = ({ postId, disabled }: Props) => {
  const { reactions, toggle } = useReactions(postId);

  return (
    <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
      {REACTIONS.map((emoji) => {
        const r = reactions[emoji];
        const mine = r?.mine;
        const count = r?.count || 0;
        return (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.85 }}
            disabled={disabled}
            onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200 text-sm ${
              mine
                ? 'bg-primary/15 ring-1 ring-primary/30 scale-105'
                : 'hover:bg-muted/50 hover:scale-105'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-base leading-none">{emoji}</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs font-medium tabular-nums"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};

export default PostReactions;
