import { useState, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const { askBreadGPT, loading: isGenerating } = useBreadGPT();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, friends]);

  useEffect(() => {
    if (selectedContact && user) {
      loadMessages(selectedContact);
      
      // Subscribe to new messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new.sender_id === selectedContact) {
              setMessages(prev => [...prev, payload.new as Message]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedContact, user]);

  const loadContacts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load friends as contacts with last message info
      const contactsWithMessages = await Promise.all(
        friends.map(async (friend) => {
          const { data } = await supabase
            .from('private_messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from('private_messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('sender_id', friend.id)
            .eq('is_read', false);

          return {
            ...friend,
            last_message: data?.content || '',
            unread_count: count || 0
          };
        })
      );

      setContacts(contactsWithMessages);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', contactId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedContact,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedContact);
      loadContacts();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('error'),
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleBreadGPTGenerate = async () => {
    if (!selectedContact) return;
    
    try {
      const prompt = "Generate a friendly message to send to a friend in chat";
      const generatedText = await askBreadGPT(prompt);
      
      if (generatedText) {
        setNewMessage(generatedText);
      }
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: 'Error',
        description: 'Could not generate message',
        variant: 'destructive'
      });
    }
  };

  const handleVoiceMessageSent = async (url: string, duration: number) => {
    if (!user || !selectedContact) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedContact,
          content: url
        });

      if (error) throw error;

      loadMessages(selectedContact);
      loadContacts();
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: t('error'),
        description: "Failed to send voice message",
        variant: "destructive"
      });
    }
  };

  const startCall = async () => {
    if (!user || !selectedContact) return;

    try {
      const channel = supabase.channel(`call:${user.id}-${selectedContact}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id }
        }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Call presence:', state);
        })
        .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
          console.log('Call signal received:', payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString(), calling: true });
            setIsInCall(true);
            setCallChannel(channel);
          }
        });

      toast({
        title: 'Call Started',
        description: 'Live call feature initiated'
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Error',
        description: 'Could not start call',
        variant: 'destructive'
      });
    }
  };

  const endCall = async () => {
    if (callChannel) {
      await callChannel.untrack();
      await supabase.removeChannel(callChannel);
      setIsInCall(false);
      setCallChannel(null);
      
      toast({
        title: 'Call Ended',
        description: 'Call has been terminated'
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      
      setSearchResults(data?.map(profile => ({
        ...profile,
        last_message: '',
        unread_count: 0
      })) || []);
    } catch (error) {
      console.error('Error searching:', error);
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
        {/* Mobile: Contact List or Chat */}
        <div className="flex-1 overflow-hidden">
          {!selectedContact ? (
            // Contact List
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search users..."
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Search Results */}
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

              {/* Contacts List */}
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
                          <Avatar>
                            <AvatarFallback>{contact.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{contact.username}</div>
                            {contact.last_message && (
                              <div className="text-sm text-muted-foreground truncate">
                                {contact.last_message}
                              </div>
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
            // Chat View
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedContact(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarFallback>
                      {contacts.find(c => c.id === selectedContact)?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">
                    {contacts.find(c => c.id === selectedContact)?.username}
                  </h3>
                </div>
                <Button
                  variant={isInCall ? "destructive" : "default"}
                  size="icon"
                  onClick={isInCall ? endCall : startCall}
                >
                  {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content.startsWith('https://') && msg.content.includes('supabase.co/storage') ? (
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

              {/* Message Input */}
              <div className="p-4 border-t bg-background/95 backdrop-blur">
                <div className="flex gap-2 items-end">
                  <VoiceRecorder onVoiceMessageSent={handleVoiceMessageSent} />
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Contacts;
