import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface IncomingCall {
  id: string;
  caller_id: string;
  callee_id: string;
  signal: any;
  accepted: boolean | null;
  created_at: string;
  caller_name?: string;
}

export const useIncomingCalls = () => {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user) return;

    const enrich = async (call: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', call.caller_id)
        .maybeSingle();
      setIncoming({ ...call, caller_name: profile?.username || 'Unknown' });
    };

    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `callee_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.accepted === null) enrich(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `callee_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.accepted !== null) setIncoming(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const accept = async (id: string) => {
    await supabase.from('calls').update({ accepted: true }).eq('id', id);
    setIncoming(null);
  };
  const decline = async (id: string) => {
    await supabase.from('calls').update({ accepted: false }).eq('id', id);
    setIncoming(null);
  };

  return { incoming, accept, decline, dismiss: () => setIncoming(null) };
};
