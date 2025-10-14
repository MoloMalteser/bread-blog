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
  online?: boolean;
}

const VAPID_PUBLIC_KEY = "BF6fFacvNWq3K24CSRelyFz1FMyYEYk2mNU6G6mIOsZ5M8JeAkoN5ArWBaihuupGEpp5M-ONDYzDp00l-z_FDx4";

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
  const [callChannel, setCallChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const { askBreadGPT, loading: isGenerating } = useBreadGPT();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, friends]);

  useEffect(() => {
    if (selectedContact && user) {
      loadMessages(selectedContact);

      // Supabase Realtime for messages
      const messageChannel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "private_messages",
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new.sender_id === selectedContact) {
              setMessages(prev => [...prev, payload.new as Message]);
              showNotification(`New message from ${contacts.find(c => c.id === selectedContact)?.username}`);
            }
          }
        )
        .subscribe();

      // Supabase Realtime for online status
      const presenceChannel = supabase
        .channel("presence")
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          setContacts(prev =>
            prev.map(c => ({
              ...c,
              online: !!state[c.id]
            }))
          );
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(presenceChannel);
      };
    }
  }, [selectedContact, user, contacts]);

  // --- Helpers ---
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
  };

  const showNotification = (title: string) => {
    if (Notification.permission === "granted") {
      new Notification(title);
    }
  };

  const loadContacts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const contactsWithMessages = await Promise.all(
        friends.map(async friend => {
          const { data } = await supabase
            .from("private_messages")
            .select("*")
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from("private_messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("sender_id", friend.id)
            .eq("is_read", false);

          return {
            ...friend,
            last_message: data?.content || "",
            unread_count: count || 0
          };
        })
      );
      setContacts(contactsWithMessages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("private_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      await supabase
        .from("private_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", contactId);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    try {
      const { error } = await supabase
        .from("private_messages")
        .insert({ sender_id: user.id, receiver_id: selectedContact, content: newMessage.trim() });
      if (error) throw error;
      setNewMessage("");
      loadMessages(selectedContact);
      loadContacts();
    } catch (err) {
      console.error(err);
      toast({ title: t("error"), description: "Failed to send message", variant: "destructive" });
    }
  };

  // --- Voice Call Logic with TURN ---
  const startCall = async () => {
    if (!user || !selectedContact) return;
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "turn:breadcall.metered.live:3478", username: "d23c3e32e0bbccf26678ef0e", credential: "Db/aW+i4Ipnma3Nk" }
        ]
      });
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      pc.ontrack = e => {
        const audioEl = document.getElementById("remoteAudio") as HTMLAudioElement;
        if (audioEl) audioEl.srcObject = e.streams[0];
      };
      pc.onicecandidate = e => {
        if (e.candidate) {
          callChannel?.send({ type: "ice-candidate", candidate: e.candidate });
        }
      };
      peerConnectionRef.current = pc;

      const channel = supabase.channel(`call:${user.id}-${selectedContact}`, { config: { broadcast: { self: true } } });
      channel.on("broadcast", { event: "call-signal" }, async ({ payload }) => {
        if (payload.sdp) {
          await pc.setRemoteDescription(payload.sdp);
          if (payload.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.send({ type: "broadcast", event: "call-signal", payload: { sdp: answer } });
          }
        } else if (payload.candidate) {
          await pc.addIceCandidate(payload.candidate);
        }
      }).subscribe();
      setCallChannel(channel);
      setIsInCall(true);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channel.send({ type: "broadcast", event: "call-signal", payload: { sdp: offer } });
    } catch (err) {
      console.error("Call error:", err);
      toast({ title: "Error", description: "Cannot start call", variant: "destructive" });
    }
  };

  const endCall = async () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (callChannel) await supabase.removeChannel(callChannel);
    setIsInCall(false);
    setCallChannel(null);
  };

  // --- Search + Add Contacts ---
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user.id)
        .limit(10);
      if (error) throw error;
      setSearchResults(data?.map(p => ({ ...p, last_message: "", unread_count: 0 })) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddContact = async (userId: string) => {
    await toggleFollow(userId);
    loadContacts();
    setSearchResults([]);
    setSearchQuery("");
  };

  // --- Voice Message Handler ---
  const handleVoiceMessageSent = async (url: string) => {
    if (!user || !selectedContact) return;
    try {
      const { error } = await supabase.from("private_messages").insert({ sender_id: user.id, receiver_id: selectedContact, content: url });
      if (error) throw error;
      loadMessages(selectedContact);
      loadContacts();
    } catch (err) {
      console.error(err);
      toast({ title: t("error"), description: "Failed to send voice message", variant: "destructive" });
    }
  };

  if (!user) return <><Header /><div className="min-h-screen flex items-center justify-center pb-20"><Card className="p-8 text-center"><h2 className="text-2xl font-bold mb-4">{t("loginRequired")}</h2><p className="text-muted-foreground">{t("loginRequiredDescription")}</p></Card></div><BottomNavigation /></>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          {!selectedContact ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex gap-2">
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSearch()} placeholder="Search users..." className="flex-1" />
                  <Button onClick={handleSearch} size="icon"><Search className="h-4 w-4" /></Button>
                </div>
                {searchResults.length > 0 && <div className="mt-2 space-y-2">{searchResults.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback>{r.username[0].toUpperCase()}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{r.username}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAddContact(r.id)}><UserPlus className="h-4 w-4" /></Button>
                  </div>
                ))}</div>}
              </div>
              <ScrollArea className="flex-1">
                {loading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : contacts.length === 0 ? <div className="p-8 text-center"><p className="text-muted-foreground mb-4">No contacts yet</p><p className="text-sm text-muted-foreground">Add friends to start messaging</p></div> : <div className="p-2 space-y-1">{contacts.map(contact => (
                  <button key={contact.id} onClick={() => setSelectedContact(contact.id)} className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="relative">
                        <AvatarFallback>{contact.username[0].toUpperCase()}</AvatarFallback>
                        {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></span>}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{contact.username}</div>
                        {contact.last_message && <div className="text-sm text-muted-foreground truncate">{contact.last_message}</div>}
                      </div>
                      {contact.unread_count > 0 && <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">{contact.unread_count}</div>}
                    </div>
                  </button>
                ))}</div>}
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}><ArrowLeft className="h-5 w-5" /></Button>
                  <Avatar><AvatarFallback>{contacts.find(c => c.id === selectedContact)?.username[0].toUpperCase()}</AvatarFallback></Avatar>
                  <h3 className="font-semibold">{contacts.find(c => c.id === selectedContact)?.username}</h3>
                </div>
                <Button variant={isInCall ? "destructive" : "default"} size="icon" onClick={isInCall ? endCall : startCall}>
                  {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">{messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {msg.content.startsWith("https://") && msg.content.includes("supabase.co/storage") ? <AudioPlayer url={msg.content} /> : <p className="break-words">{msg.content}</p>}
                      <p className="text-xs mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}</div>
              </ScrollArea>
              <div className="p-4 border-t bg-background/95 backdrop-blur">
                <div className="flex gap-2 items-end">
                  <VoiceRecorder onVoiceMessageSent={handleVoiceMessageSent} />
                  <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1" />
                  <Button onClick={async () => { if(selectedContact) setNewMessage(await askBreadGPT("Generate friendly message")) }} size="icon" variant="outline" disabled={isGenerating} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"><Sparkles className="h-4 w-4" /></Button>
                  <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
              <audio id="remoteAudio" autoPlay />
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Contacts;
