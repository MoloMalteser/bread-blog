// Single-file React component with Supabase Realtime Messaging + Audio Call
// Using your existing framework (Next.js + Shadcn/UI + Tailwind)

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Phone, PhoneOff, Search, UserPlus } from "lucide-react";

// --- Interfaces ---
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
  last_message?: string;
  unread_count: number;
}

// --- Main Component ---
export default function ChatWithAudioCall({ user, friends }: { user: any; friends: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  // --- Audio Call State ---
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callStartRef = useRef<Date | null>(null);

  // --- Load contacts ---
  useEffect(() => { if(user) loadContacts(); }, [user, friends]);

  async function loadContacts() {
    const contactsWithMessages = await Promise.all(friends.map(async (friend) => {
      const { data } = await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`).order('created_at', {ascending:false}).limit(1).single();
      const { count } = await supabase.from('private_messages').select('*', {count:'exact', head:true}).eq('receiver_id', user.id).eq('sender_id', friend.id).eq('is_read', false);
      return {...friend, last_message:data?.content||'', unread_count: count||0};
    }));
    setContacts(contactsWithMessages);
  }

  // --- Load messages ---
  useEffect(() => { if(selectedContact) loadMessages(selectedContact); }, [selectedContact]);

  async function loadMessages(contactId:string) {
    const { data } = await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`).order('created_at',{ascending:true});
    setMessages(data||[]);
    await supabase.from('private_messages').update({is_read:true}).eq('receiver_id', user.id).eq('sender_id', contactId);
    setContacts(prev => prev.map(c => c.id===contactId?{...c, unread_count:0}:c));
  }

  // --- Realtime messaging ---
  useEffect(() => {
    if(!user) return;
    const channel = supabase.channel(`messages-global-${user.id}`);
    channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'private_messages'},({new:newMsg}:any)=>{
      if(newMsg.sender_id===user.id || newMsg.receiver_id===user.id){
        if(newMsg.sender_id!==user.id && newMsg.receiver_id===user.id){
          setContacts(prev=>prev.map(c=>c.id===newMsg.sender_id?{...c,last_message:newMsg.content,unread_count:c.unread_count+1}:c));
        } else if(newMsg.sender_id===user.id){
          setContacts(prev=>prev.map(c=>c.id===newMsg.receiver_id?{...c,last_message:newMsg.content}:c));
        }
        if(selectedContact && (newMsg.sender_id===selectedContact || newMsg.receiver_id===selectedContact)){
          setMessages(prev=>[...prev,newMsg]);
        }
      }
    }).subscribe();

    return ()=>supabase.removeChannel(channel);
  },[user,selectedContact]);

  // --- Send message ---
  async function sendMessage(){
    if(!newMessage.trim()||!selectedContact) return;
    await supabase.from('private_messages').insert({sender_id:user.id,receiver_id:selectedContact,content:newMessage.trim()});
    setNewMessage("");
  }

  // --- WebRTC Audio Call Functions ---
  async function startCall(){
    if(!selectedContact) return;
    const pc = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'turn:breadcall.metered.live', username: 'd23c3e32e0bbccf26678ef0e', credential: 'Db/aW+i4Ipnma3Nk'}
      ]
    });

    peerRef.current = pc;

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({audio:true});
    localStreamRef.current.getTracks().forEach(track=>pc.addTrack(track,localStreamRef.current!));

    pc.ontrack = e=>setRemoteStream(e.streams[0]);

    pc.onicecandidate = async e=>{ if(e.candidate) await supabase.from('calls').insert({caller_id:user.id,callee_id:selectedContact,signal:JSON.stringify(e.candidate)}); };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await supabase.from('calls').insert({caller_id:user.id,callee_id:selectedContact,signal:JSON.stringify({sdp:offer})});

    setIsInCall(true); callStartRef.current=new Date();
  }

  async function endCall(){
    if(peerRef.current) peerRef.current.close();
    setIsInCall(false); setRemoteStream(null);
    if(callStartRef.current){
      const duration = Math.floor((new Date().getTime()-callStartRef.current.getTime())/1000);
      await supabase.from('private_messages').insert({sender_id:user.id,receiver_id:selectedContact,content:`[call] audio-call duration:${duration}s`});
      callStartRef.current=null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b flex justify-between items-center">
        {!selectedContact ? <h2>Contacts</h2> : <div className="flex items-center gap-3"><Button variant="ghost" onClick={()=>setSelectedContact(null)}><ArrowLeft /></Button><span>{contacts.find(c=>c.id===selectedContact)?.username}</span></div>}
        {selectedContact && <Button variant={isInCall?'destructive':'default'} onClick={isInCall?endCall:startCall}>{isInCall?<PhoneOff/>:<Phone/>}</Button>}
      </div>

      {!selectedContact ? (
        <ScrollArea className="p-2 flex-1">
          {contacts.map(c=>(
            <Button key={c.id} variant="ghost" className="w-full text-left" onClick={()=>setSelectedContact(c.id)}>
              {c.username} {c.unread_count>0 && `(${c.unread_count})`}
            </Button>
          ))}
        </ScrollArea>
      ):(
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            {messages.map(m=>(<div key={m.id} className={m.sender_id===user.id?'text-right':'text-left'}>{m.content}</div>))}
          </ScrollArea>
          <div className="flex gap-2 p-4">
            <Input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyPress={e=>e.key==='Enter'&&sendMessage()} placeholder="Type message" />
            <Button onClick={sendMessage}><Send/></Button>
          </div>
          {remoteStream && <audio autoPlay ref={el=>{if(el)el.srcObject=remoteStream}} />}
        </div>
      )}
    </div>
  );
}
