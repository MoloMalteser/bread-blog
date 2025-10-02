import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: { username: string };
  receiver?: { username: string };
}

interface Conversation {
  user_id: string;
  username: string;
  last_message: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages(selectedUser);
      
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
            if (payload.new.sender_id === selectedUser) {
              setMessages(prev => [...prev, payload.new as Message]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser, user]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation and fetch usernames
      const convMap = new Map<string, Conversation>();
      
      for (const msg of data || []) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!convMap.has(otherUserId)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', otherUserId)
            .single();
          
          const otherUsername = profile?.username || 'Unknown';
        
          convMap.set(otherUserId, {
            user_id: otherUserId,
            username: otherUsername,
            last_message: msg.content,
            unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
          });
        }
      }

      setConversations(Array.from(convMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUser,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedUser);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('error'),
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('loginRequired')}</h2>
            <p className="text-muted-foreground">{t('loginRequiredDescription')}</p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className={`${selectedUser ? 'hidden md:block' : 'block'} p-4`}>
            <h2 className="text-xl font-bold mb-4">{t('messages')}</h2>
            <ScrollArea className="h-full">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('noMessages')}</div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.user_id}
                      onClick={() => setSelectedUser(conv.user_id)}
                      className={`w-full p-3 rounded-lg text-left hover:bg-muted transition-colors ${
                        selectedUser === conv.user_id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{conv.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{conv.username}</div>
                          <div className="text-sm text-muted-foreground truncate">{conv.last_message}</div>
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className={`${selectedUser ? 'block' : 'hidden md:block'} md:col-span-2 flex flex-col`}>
            {selectedUser ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedUser(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarFallback>
                      {conversations.find(c => c.user_id === selectedUser)?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">
                    {conversations.find(c => c.user_id === selectedUser)?.username}
                  </h3>
                </div>

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
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('typeMessage')}
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                {t('startConversation')}
              </div>
            )}
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
