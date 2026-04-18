import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, X, Image as ImageIcon, Type, Mic, Video, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStories, type GroupedStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';

const StoriesBar = () => {
  const { user } = useAuth();
  const { grouped, markViewed, deleteStory } = useStories();
  const [viewing, setViewing] = useState<GroupedStories | null>(null);
  const [creating, setCreating] = useState(false);

  const myGroup = grouped.find((g) => g.user_id === user?.id);
  const others = grouped.filter((g) => g.user_id !== user?.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4"
      >
        <div className="flex gap-3 pb-1">
          {/* Add story */}
          {user && (
            <button
              onClick={() => setCreating(true)}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-border/50">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent">
                    {user.email?.[0].toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full gradient-primary flex items-center justify-center ring-2 ring-background">
                  <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground max-w-[72px] truncate">
                Your moment
              </span>
            </button>
          )}

          {/* My existing story */}
          {myGroup && (
            <StoryAvatar group={myGroup} onClick={() => setViewing(myGroup)} isMe />
          )}

          {others.map((g) => (
            <StoryAvatar key={g.user_id} group={g} onClick={() => setViewing(g)} />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {viewing && (
          <StoryViewer
            group={viewing}
            onClose={() => setViewing(null)}
            onView={markViewed}
            onDelete={user?.id === viewing.user_id ? deleteStory : undefined}
          />
        )}
        {creating && <StoryCreator onClose={() => setCreating(false)} />}
      </AnimatePresence>
    </>
  );
};

const StoryAvatar = ({
  group,
  onClick,
  isMe,
}: {
  group: GroupedStories;
  onClick: () => void;
  isMe?: boolean;
}) => {
  const ringClass = group.hasUnviewed
    ? 'ring-2 ring-transparent bg-gradient-to-tr from-primary via-accent-foreground to-primary p-[2px]'
    : 'ring-2 ring-border/40 p-[2px]';
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0 group"
    >
      <div className={`rounded-full ${ringClass}`}>
        <Avatar className="h-[60px] w-[60px] ring-2 ring-background">
          <AvatarFallback className="bg-gradient-to-br from-muted to-background text-sm">
            {group.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-[10px] max-w-[72px] truncate text-foreground/80">
        {isMe ? 'You' : group.username}
      </span>
    </button>
  );
};

export default StoriesBar;
