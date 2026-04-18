import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plus, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VibeRoom {
  id: string;
  host_id: string;
  title: string;
  topic: string | null;
  mood: string;
  is_active: boolean;
  created_at: string;
  participantCount?: number;
}

const VibeRooms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<VibeRoom[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('vibe_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    const withCounts = await Promise.all(
      (data || []).map(async (r) => {
        const { count } = await supabase
          .from('vibe_room_participants')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', r.id);
        return { ...r, participantCount: count || 0 };
      })
    );
    setRooms(withCounts);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('vibe-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vibe_rooms' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vibe_room_participants' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const createRoom = async () => {
    if (!user || !title.trim()) return;
    const { data, error } = await supabase
      .from('vibe_rooms')
      .insert({ host_id: user.id, title: title.trim(), topic: topic.trim() || null })
      .select()
      .single();
    if (error || !data) {
      toast({ title: 'Failed', variant: 'destructive' });
      return;
    }
    await supabase.from('vibe_room_participants').insert({ room_id: data.id, user_id: user.id });
    setActiveRoom(data.id);
    setCreating(false);
    setTitle('');
    setTopic('');
    toast({ title: '🎙️ Room live!' });
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;
    await supabase
      .from('vibe_room_participants')
      .insert({ room_id: roomId, user_id: user.id });
    setActiveRoom(roomId);
  };

  const leaveRoom = async () => {
    if (!user || !activeRoom) return;
    await supabase
      .from('vibe_room_participants')
      .delete()
      .eq('room_id', activeRoom)
      .eq('user_id', user.id);

    // If host, end room
    const room = rooms.find((r) => r.id === activeRoom);
    if (room?.host_id === user.id) {
      await supabase
        .from('vibe_rooms')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', activeRoom);
    }
    setActiveRoom(null);
  };

  if (rooms.length === 0 && !creating && !user) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-3 rounded-2xl mb-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Radio className="h-4 w-4 text-destructive" />
            </motion.div>
            <h3 className="text-sm font-semibold">Vibe Rooms</h3>
            <span className="text-[10px] text-muted-foreground">live audio</span>
          </div>
          {user && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-7 text-xs"
              onClick={() => setCreating((v) => !v)}
            >
              <Plus className="h-3 w-3 mr-1" /> Start
            </Button>
          )}
        </div>

        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-2 space-y-2"
            >
              <Input
                placeholder="Room title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl glass-effect border-0 h-9 text-sm"
              />
              <Input
                placeholder="Topic (optional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl glass-effect border-0 h-9 text-sm"
              />
              <Button size="sm" className="w-full rounded-full" onClick={createRoom}>
                Go live
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {rooms.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">
            No live rooms — be the first to start one ✨
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => (activeRoom === r.id ? leaveRoom() : joinRoom(r.id))}
                className={`shrink-0 rounded-2xl p-3 min-w-[160px] text-left transition-all ${
                  activeRoom === r.id
                    ? 'bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] mb-1 opacity-80">
                  <Radio className="h-3 w-3" /> LIVE · {r.participantCount}
                  <Users className="h-3 w-3 ml-0.5" />
                </div>
                <p className="text-sm font-semibold line-clamp-1">{r.title}</p>
                {r.topic && <p className="text-[11px] opacity-70 line-clamp-1">{r.topic}</p>}
                <p className="text-[10px] mt-1 opacity-80">
                  {activeRoom === r.id ? '✓ In room — tap to leave' : 'Tap to join'}
                </p>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default VibeRooms;
