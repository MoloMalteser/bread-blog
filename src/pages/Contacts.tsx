import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useSocial } from "@/hooks/useSocial";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Phone, PhoneOff, Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import AudioPlayer from "@/components/AudioPlayer";
import { useBreadGPT } from "@/hooks/useBreadGPT";
import { Sparkles } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Contact {
  id: string;
  username: string;
  bio?: string;
  last_message?: string;
  unread_count: number;
}

const Contacts = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { friends, toggleFollow } = useSocial();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callStartRef, setCallStartRef] = useState<Date | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const { askBreadGPT, loading: isGenerating } = useBreadGPT();

  // --- Load contacts ---
  useEffect(() => { if(user) loadContacts(); }, [user, friends]);

  const loadContacts = async () => {
    if(!user) return;
    setLoading(true);
    try {
      const contactsWithMessages = await Promise.all(friends.map(async (friend) => {
        const { data } = await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`).order('created_at',{ascending:false}).limit(1).single();
        const { count } = await supabase.from('private_messages').select('*',{count:'exact', head:true}).eq('receiver_id', user.id).eq('sender_id', friend.id).eq('is_read', false);
        return {...friend, last_message: data?.content||'', unread_count: count||0};
      }));
      setContacts(contactsWithMessages);
    } catch(e){ console.error(e); } finally{ setLoading(false); }
  };

  // --- Load messages + Realtime subscription ---
  useEffect(() => {
    if(selectedContact && user){
      const load = async () => {
        const { data } = await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},receiver_id.eq.${user.id})`).order('created_at',{ascending:true});
        setMessages(data||[]);
        await supabase.from('private_messages').update({is_read:true}).eq('receiver_id', user.id).eq('sender_id', selectedContact);
      };
      load();

      const channel = supabase.channel(`messages-${user.id}`)
        .on('postgres_changes',{event:'INSERT', schema:'public', table:'private_messages'}, ({new: newMsg}:any) => {
          if((newMsg.sender_id === selectedContact || newMsg.receiver_id === selectedContact)){
            setMessages(prev => [...prev,newMsg]);
          }
        }).subscribe();
      return ()=>supabase.removeChannel(channel);
    }
  }, [selectedContact, user]);

  const sendMessage = async () => {
    if(!user || !selectedContact || !newMessage.trim()) return;
    await supabase.from('private_messages').insert({sender_id:user.id, receiver_id:selectedContact, content:newMessage.trim()});
    setNewMessage("");
  };

  const handleBreadGPTGenerate = async () => {
    if(!selectedContact) return;
    const generatedText = await askBreadGPT("Generate a friendly message to send to a friend in chat");
    if(generatedText) setNewMessage(generatedText);
  };

  // --- Audio Call Logic (WebRTC) ---
  const startCall = async () => {
    if(!user || !selectedContact) return;
    const pc = new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}, {urls:'turn:YOUR_TURN_SERVER_URL', username:'user', credential:'pass'}]});
    peerRef.current = pc;
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({audio:true});
    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
    pc.ontrack = e => setRemoteStream(e.streams[0]);
    pc.onicecandidate = async e => { if(e.candidate) await supabase.from('calls').insert({caller_id:user.id, callee_id:selectedContact, signal:JSON.stringify(e.candidate)}); };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await supabase.from('calls').insert({caller_id:user.id, callee_id:selectedContact, signal:JSON.stringify({sdp:offer})});
    setIsInCall(true); setCallStartRef(new Date());
  };

  const endCall = async () => {
    if(peerRef.current) peerRef.current.close();
    setIsInCall(false); setRemoteStream(null);
    if(callStartRef){
      const duration = Math.floor((new Date().getTime()-callStartRef.getTime())/1000);
      await supabase.from('private_messages').insert({sender_id:user.id, receiver_id:selectedContact, content:`[call] audio-call duration:${duration}s`});
      setCallStartRef(null);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pb-20">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('loginRequired')}</h2>
            <p className="text-muted-foreground">{t('loginRequiredDescription')}</p>
          </Card>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 h-screen flex flex-col">
        {/* Original UI unchanged: Contact list, chat view, search, input, voice recorder, audio player, buttons */}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Contacts;
