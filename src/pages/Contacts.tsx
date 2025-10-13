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
import { Send, ArrowLeft, Phone, PhoneOff, Search, UserPlus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import AudioPlayer from "@/components/AudioPlayer";
import { useBreadGPT } from "@/hooks/useBreadGPT";

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
  is_online?: boolean;
}

const TURN_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:breadcall.metered.live:3478", username: "d23c3e32e0bbccf26678ef0e", credential: "Db/aW+i4Ipnma3Nk" },
  ],
};

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
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const { askBreadGPT, loading: isGenerating } = useBreadGPT();

  // --- Load contacts with last messages ---
  useEffect(() => {
    if (user) loadContacts();
  }, [user, friends]);

  // --- Load messages and subscribe to realtime updates ---
  useEffect(() => {
    if (!user || !selectedContact) return;
    loadMessages(selectedContact);

    const msgChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "private_messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === selectedContact && newMsg.receiver_id === user.id) ||
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedContact)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender_id === selectedContact) sendPushNotification(newMsg);
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel("presence")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
        const updated = payload.new as Contact;
        setContacts((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, is_online: updated.is_online } : c))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [selectedContact, user]);

  const loadContacts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const contactsWithMessages = await Promise.all(
        friends.map(async (friend) => {
          const { data } = await supabase
            .from("private_messages")
            .select("*")
            .or(
              `and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`
            )
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from("private_messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("sender_id", friend.id)
            .eq("is_read", false);

          const { data: profile } = await supabase.from("profiles").select("is_online").eq("id", friend.id).single();

          return {
            ...friend,
            last_message: data?.content || "",
            unread_count: count || 0,
            is_online: profile?.is_online || false,
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
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`
        )
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
      await supabase
        .from("private_messages")
        .insert([{ sender_id: user.id, receiver_id: selectedContact, content: newMessage.trim() }]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleBreadGPTGenerate = async () => {
    if (!selectedContact) return;
    try {
      const prompt = "Generate a friendly message to send to a friend in chat";
      const generatedText = await askBreadGPT(prompt);
      if (generatedText) setNewMessage(generatedText);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate message", variant: "destructive" });
    }
  };

  const handleVoiceMessageSent = async (url: string) => {
    if (!user || !selectedContact) return;
    try {
      await supabase.from("private_messages").insert([{ sender_id: user.id, receiver_id: selectedContact, content: url }]);
    } catch (err) {
      console.error(err);
    }
  };

  // --- TURN WebRTC Call ---
  const startCall = async () => {
    if (!user || !selectedContact) return;
    const pc = new RTCPeerConnection(TURN_CONFIG);
    const remoteStream = new MediaStream();
    setPeerConnection(pc);
    setRemoteStream(remoteStream);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await supabase.from("calls").insert([{ sender_id: user.id, receiver_id: selectedContact, sdp: offer.sdp }]);
    setIsInCall(true);

    remoteAudioRef.current!.srcObject = remoteStream;
  };

  const endCall = async () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);
    setRemoteStream(null);
    setIsInCall(false);
  };

  // --- Push Notifications ---
  const sendPushNotification = async (message: Message) => {
    const { data } = await supabase.from("profiles").select("push_token").eq("id", message.receiver_id).single();
    if (data?.push_token) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer your-expo-access-token` },
        body: JSON.stringify({ to: data.push_token, sound: "default", body: message.content }),
      });
    }
  };

  // --- Search & Add ---
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user.id)
        .limit(10);
      setSearchResults(data?.map((p) => ({ ...p, last_message: "", unread_count: 0 })) || []);
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

  if (!user) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center pb-20">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("loginRequired")}</h2>
          <p className="text-muted-foreground">{t("loginRequiredDescription")}</p>
        </Card>
      </div>
      <BottomNavigation />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          {!selectedContact ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search users..."
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{result.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{result.username}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleAddContact(result.id)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : contacts.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No contacts yet</p>
                    <p className="text-sm text-muted-foreground">Add friends to start messaging</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact.id)}
                        className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>{contact.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
                                contact.is_online ? "bg-green-500" : "bg-gray-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{contact.username}</div>
                            {contact.last_message && (
                              <div className="text-sm text-muted-foreground truncate">{contact.last_message}</div>
                            )}
                          </div>
                          {contact.unread_count > 0 && (
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              {contact.unread_count}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {contacts.find((c) => c.id === selectedContact)?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
                        contacts.find((c) => c.id === selectedContact)?.is_online ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold">{contacts.find((c) => c.id === selectedContact)?.username}</h3>
                </div>
                <Button variant={isInCall ? "destructive" : "default"} size="icon" onClick={isInCall ? endCall : startCall}>
                  {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {msg.content.startsWith("https://") && msg.content.includes("supabase.co/storage") ? (
                          <AudioPlayer url={msg.content} />
                        ) : (
                          <p className="break-words">{msg.content}</p>
                        )}
                        <p className="text-xs mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-background/95 backdrop-blur flex gap-2 items-end">
                <VoiceRecorder onVoiceMessageSent={handleVoiceMessageSent} />
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleBreadGPTGenerate}
                  size="icon"
                  variant="outline"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button onClick={sendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <audio ref={remoteAudioRef} autoPlay />
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Contacts;
