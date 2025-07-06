
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, UserMinus, Users } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  bio?: string;
  created_at: string;
}

const Friends = () => {
  const { user } = useAuth();
  const { toggleFollow, getFollowStatus } = useSocial();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const { data: follows, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            username,
            bio,
            created_at
          )
        `)
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error loading friends:', error);
        return;
      }

      const friendsList = follows?.map(follow => follow.profiles).filter(Boolean) || [];
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, bio, created_at')
        .eq('username', searchQuery.trim())
        .single();

      if (error || !profile) {
        toast({
          title: "Nutzer nicht gefunden :(",
          description: `Es gibt keinen Nutzer mit dem Namen "${searchQuery}"`,
          variant: "destructive"
        });
        return;
      }

      if (profile.id === user?.id) {
        toast({
          title: "Das bist du selbst!",
          description: "Du kannst dir nicht selbst folgen",
          variant: "destructive"
        });
        return;
      }

      setSearchResult(profile);
      
      // Check if already following
      const followStatus = await getFollowStatus(profile.id);
      setIsFollowing(followStatus);

    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: "Fehler bei der Suche",
        description: "Etwas ist schiefgelaufen",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const result = await toggleFollow(userId);
    setIsFollowing(result);
    
    if (result) {
      // Reload friends list to show new friend
      loadFriends();
    } else {
      // Remove from friends list
      setFriends(friends.filter(friend => friend.id !== userId));
    }
  };

  const handleUnfollow = async (friendId: string) => {
    await toggleFollow(friendId);
    setFriends(friends.filter(friend => friend.id !== friendId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Lade Freunde...</div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Freunde</h1>
            <p className="text-muted-foreground">
              Verwalte deine Freunde und finde neue Nutzer
            </p>
          </div>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Nutzer suchen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nutzername eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? 'Suche...' : 'Suchen'}
                </Button>
              </div>

              {searchResult && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">@{searchResult.username}</h3>
                        {searchResult.bio && (
                          <p className="text-sm text-muted-foreground">{searchResult.bio}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Dabei seit {new Date(searchResult.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleToggleFollow(searchResult.id)}
                        variant={isFollowing ? 'outline' : 'default'}
                        size="sm"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-1" />
                            Entfolgen
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Folgen
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deine Freunde ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">Noch keine Freunde</h3>
                  <p className="text-muted-foreground">
                    Suche nach Nutzern und folge ihnen, um sie hier zu sehen
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <Card key={friend.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">@{friend.username}</h3>
                            {friend.bio && (
                              <p className="text-sm text-muted-foreground">{friend.bio}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Dabei seit {new Date(friend.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Freund</Badge>
                            <Button
                              onClick={() => handleUnfollow(friend.id)}
                              variant="outline"
                              size="sm"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Entfolgen
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Friends;
