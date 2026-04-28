import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plus, Users, Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useVibeRoomAudio } from '@/hooks/useVibeRoomAudio';

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

interface Participant {
  user_id: string;
  username: string;
}

const VibeRooms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<VibeRoom[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { speakingPeers, muted, toggleMute, connected } = useVibeRoomAudio(activeRoom);

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

  const loadParticipants = async (roomId: string) => {
    const { data } = await supabase
      .from('vibe_room_participants')
      .select('user_id')
      .eq('room_id', roomId);
    if (!data) return setParticipants([]);
    const ids = data.map((d) => d.user_id);
    if (ids.length === 0) return setParticipants([]);
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', ids);
    setParticipants(
      ids.map((id) => ({
        user_id: id,
        username: profs?.find((p) => p.id === id)?.username || 'guest',
      }))
    );
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('vibe-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vibe_rooms' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vibe_room_participants' }, () => {
        load();
        if (activeRoom) loadParticipants(activeRoom);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeRoom]);

  useEffect(() => {
    if (activeRoom) loadParticipants(activeRoom);
    else setParticipants([]);
  }, [activeRoom]);

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

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

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
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => (activeRoom === r.id ? null : joinRoom(r.id))}
                className={`shrink-0 rounded-2xl p-3 min-w-[160px] text-left transition-all ${
                  activeRoom === r.id
                    ? 'bg-gradient-to-br from-primary to-info text-primary-foreground'
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
                  {activeRoom === r.id ? '✓ In room' : 'Tap to join'}
                </p>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active room sheet */}
      <AnimatePresence>
        {activeRoom && activeRoomData && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 inset-x-0 mx-auto max-w-sm px-4 z-40"
          >
            <div className="glass-heavy rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-destructive mb-0.5">
                    <Radio className="h-3 w-3 animate-pulse" />
                    {connected ? 'CONNECTED' : 'CONNECTING…'}
                  </div>
                  <p className="text-sm font-semibold line-clamp-1">{activeRoomData.title}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={leaveRoom}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mb-3 min-h-[60px]">
                {participants.map((p) => {
                  const speaking = !!speakingPeers[p.user_id];
                  return (
                    <div key={p.user_id} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        {speaking && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-primary/40"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                        <Avatar
                          className={`h-12 w-12 ring-2 transition-all ${
                            speaking ? 'ring-primary scale-105' : 'ring-border/50'
                          }`}
                        >
                          <AvatarFallback className="text-sm bg-gradient-to-br from-primary/30 to-accent">
                            {p.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {p.user_id === activeRoomData.host_id && (
                          <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[60px]">
                        {p.username}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant={muted ? 'destructive' : 'default'}
                className="w-full rounded-full gap-2"
                onClick={toggleMute}
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {muted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VibeRooms;
