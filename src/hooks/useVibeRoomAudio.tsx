import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Tiny WebRTC audio mesh over a Supabase Realtime broadcast channel.
 * Each participant sends an SDP offer to every other participant they see in the room.
 * Speaking detection runs on the local mic stream and broadcasts a low-frequency `speaking` ping.
 */

interface PeerInfo {
  pc: RTCPeerConnection;
  audio: HTMLAudioElement;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useVibeRoomAudio(roomId: string | null) {
  const { user } = useAuth();
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const peersRef = useRef<Map<string, PeerInfo>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const speakingTimeoutRef = useRef<Map<string, any>>(new Map());

  const cleanup = useCallback(() => {
    peersRef.current.forEach(({ pc, audio }) => {
      pc.close();
      audio.pause();
      audio.remove();
    });
    peersRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setConnected(false);
    setSpeakingPeers({});
  }, []);

  const createPeer = useCallback(
    (peerId: string, channel: ReturnType<typeof supabase.channel>, isInitiator: boolean) => {
      if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!.pc;
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const audio = new Audio();
      audio.autoplay = true;

      localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
      };
      pc.onicecandidate = (e) => {
        if (e.candidate && user) {
          channel.send({
            type: 'broadcast',
            event: 'webrtc',
            payload: { to: peerId, from: user.id, kind: 'ice', data: e.candidate },
          });
        }
      };

      peersRef.current.set(peerId, { pc, audio });

      if (isInitiator && user) {
        (async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: 'broadcast',
            event: 'webrtc',
            payload: { to: peerId, from: user.id, kind: 'offer', data: offer },
          });
        })();
      }
      return pc;
    },
    [user]
  );

  const setSpeaking = (peerId: string, on: boolean) => {
    setSpeakingPeers((prev) => (prev[peerId] === on ? prev : { ...prev, [peerId]: on }));
    if (on) {
      const existing = speakingTimeoutRef.current.get(peerId);
      if (existing) clearTimeout(existing);
      speakingTimeoutRef.current.set(
        peerId,
        setTimeout(() => {
          setSpeakingPeers((prev) => ({ ...prev, [peerId]: false }));
        }, 800)
      );
    }
  };

  const startVoiceDetection = (stream: MediaStream, channel: ReturnType<typeof supabase.channel>) => {
    if (!user) return;
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastSent = 0;
      const tick = () => {
        if (!localStreamRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const speaking = avg > 18 && !muted;
        if (speaking) setSpeaking(user.id, true);
        const now = Date.now();
        if (speaking && now - lastSent > 400) {
          lastSent = now;
          channel.send({
            type: 'broadcast',
            event: 'speaking',
            payload: { user_id: user.id },
          });
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('voice detection failed', e);
    }
  };

  useEffect(() => {
    if (!roomId || !user) return;
    let cancelled = false;

    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (e) {
        console.warn('mic permission denied', e);
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;

      const channel = supabase.channel(`vibe-room-${roomId}`, {
        config: { presence: { key: user.id } },
      });
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState() as Record<string, any[]>;
          const peerIds = Object.keys(state).filter((id) => id !== user.id);
          // Initiate to peers with greater id (deterministic to avoid double-offer)
          peerIds.forEach((pid) => {
            if (user.id < pid) createPeer(pid, channel, true);
          });
          // Drop peers no longer present
          peersRef.current.forEach((info, pid) => {
            if (!peerIds.includes(pid)) {
              info.pc.close();
              info.audio.remove();
              peersRef.current.delete(pid);
            }
          });
        })
        .on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
          if (payload.to !== user.id) return;
          const fromId: string = payload.from;
          const pc = createPeer(fromId, channel, false);
          if (payload.kind === 'offer') {
            await pc.setRemoteDescription(payload.data);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.send({
              type: 'broadcast',
              event: 'webrtc',
              payload: { to: fromId, from: user.id, kind: 'answer', data: answer },
            });
          } else if (payload.kind === 'answer') {
            await pc.setRemoteDescription(payload.data);
          } else if (payload.kind === 'ice') {
            try {
              await pc.addIceCandidate(payload.data);
            } catch {}
          }
        })
        .on('broadcast', { event: 'speaking' }, ({ payload }) => {
          if (payload.user_id !== user.id) setSpeaking(payload.user_id, true);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: user.id, joined_at: Date.now() });
            setConnected(true);
            startVoiceDetection(stream, channel);
          }
        });
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  return { speakingPeers, muted, toggleMute, connected };
}
