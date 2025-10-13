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

const TURN_SERVERS = [
  {
    urls: ["turn:breadcall.metered.live:3478?transport=udp", "turn:breadcall.metered.live:3478?transport=tcp"],
    username: "d23c3e32e0bbccf26678ef0e",
    credential: "Db/aW+i4Ipnma3Nk"
  }
];

const Contacts = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { friends, toggleFollow } = useSocial();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callChannel, setCallChannel] = useState<any>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const { askBreadGPT, loading: isGenerating } = useBreadGPT();
  const [isOnline, setIsOnline] = useState(false);

  // Load contacts
  useEffect(() => {
    if (user) loadContacts();
  }, [user, friends]);

  // Presence tracking (Online green dot)
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(`presence:${user.id}`, {
      config: { presence: { key: user.id } }
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setIsOnline(Boolean(state[user.id]));
      })
      .subscribe();

    return () => supabase.removeChannel(presenceChannel);
  }, [user]);

  // Realtime messages subscription
  useEffect(() => {
    if (!selectedContact || !user) return;

    loadMessages(selectedContact);

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
            setMessages((prev) => [...prev, payload.new as Message]);
            notify("New Message", payload.new.content);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(messageChannel);
  }, [selectedContact, user]);

  // Realtime incoming call notifications
  useEffect(() => {
    if (!user) return;

    const callNotifChannel = supabase
      .channel("incoming_calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "calls",
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          notify("Incoming Call", `${payload.new.sender_name} is calling`);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(callNotifChannel);
  }, [user]);

  // Notifications helper
  const notify = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") new Notification(title, { body });
      });
    }
  };

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

          return {
            ...friend,
            last_message: data?.content || "",
            unread_count: count || 0
          };
        })
      );

      setContacts(contactsWithMessages);
    } catch (error) {
      console.error("Error loading contacts:", error);
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

      // Mark as read
      await supabase
        .from("private_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", contactId);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from("private_messages").insert({
        sender_id: user.id,
        receiver_id: selectedContact,
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage("");
      loadMessages(selectedContact);
      loadContacts();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: t("error"), description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleBreadGPTGenerate = async () => {
    if (!selectedContact) return;
    try {
      const prompt = "Generate a friendly message to send to a friend in chat";
      const generatedText = await askBreadGPT(prompt);
      if (generatedText) setNewMessage(generatedText);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({ title: "Error", description: "Could not generate message", variant: "destructive" });
    }
  };

  const handleVoiceMessageSent = async (url: string) => {
    if (!user || !selectedContact) return;

    try {
      const { error } = await supabase.from("private_messages").insert({
        sender_id: user.id,
        receiver_id: selectedContact,
        content: url
      });
      if (error) throw error;
      loadMessages(selectedContact);
      loadContacts();
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({ title: t("error"), description: "Failed to send voice message", variant: "destructive" });
    }
  };

  // --- WebRTC Audio Call Logic ---
  const startCall = async () => {
    if (!user || !selectedContact) return;

    const pc = new RTCPeerConnection({ iceServers: TURN_SERVERS });
    setPeerConnection(pc);

    try {
      // Get local audio
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      // Remote audio
      pc.ontrack = (event) => {
        const audioEl = document.getElementById("remote-audio") as HTMLAudioElement;
        if (audioEl) audioEl.srcObject = event.streams[0];
      };

      // ICE Candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate && callChannel) {
          callChannel.send({ type: "ice-candidate", candidate: event.candidate });
        }
      };

      // Setup Supabase broadcast channel for call signaling
      const channel = supabase.channel(`call:${user.id}-${selectedContact}`, {
        config: { broadcast: { self: true }, presence: { key: user.id } }
      });

      channel.on("broadcast", { event: "call-signal" }, async ({ payload }) => {
        if (!pc) return;
        if (payload.sdp) {
          await pc.setRemoteDescription(payload.sdp);
          if (payload.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.send({ type: "call-signal", sdp: answer });
          }
        } else if (payload.candidate) {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch {}
        }
      });

      channel.subscribe();
      setCallChannel(channel);
      setIsInCall(true);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channel.send({ type: "call-signal", sdp: offer });

      notify("Call Started", `You are calling ${contacts.find(c => c.id === selectedContact)?.username}`);
    } catch (error) {
      console.error("Error starting call:", error);
      toast({ title: "Error", description: "Could not start call", variant: "destructive" });
    }
  };

  const endCall = async () => {
    if (peerConnection) {
      peerConnection.getTracks().forEach((t) => t.stop());
      peerConnection.close();
      setPeerConnection(null);
    }

    if (callChannel) {
      await callChannel.unsubscribe();
      setCallChannel(null);
    }

    setIsInCall(false);
    notify("Call Ended", "Call has been terminated");
  };

  // --- Search and Add Contact ---
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
      setSearchResults(
        data?.map((profile) => ({ ...profile, last_message: "", unread_count: 0 })) || []
      );
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleAddContact = async (userId: string) => {
    await toggleFollow(userId);
    loadContacts();
    setSearchResults([]);
    setSearchQuery("");
  };

  if (!user) {
    return (
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
  }

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
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg relative"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 relative">
                            <AvatarFallback>{result.username[0].toUpperCase()}</AvatarFallback>
                            {/* Online green dot */}
                            {result.isOnline && (
                              <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border border-white" />
                            )}
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
                        className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors relative"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="relative">
                            <AvatarFallback>{contact.username[0].toUpperCase()}</AvatarFallback>
                            {isOnline && (
                              <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border border-white" />
                            )}
                          </Avatar>
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
              <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="relative">
                    <AvatarFallback>
                      {contacts.find((c) => c.id === selectedContact)?.username[0].toUpperCase()}
                    </AvatarFallback>
                    {isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border border-white" />
                    )}
                  </Avatar>
                  <h3 className="font-semibold">{contacts.find((c) => c.id === selectedContact)?.username}</h3>
                </div>
                <Button
                  variant={isInCall ? "destructive" : "default"}
                  size="icon"
                  onClick={isInCall ? endCall : startCall}
                >
                  {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
                    >
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
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
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

              <audio id="remote-audio" autoPlay />
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Contacts;
