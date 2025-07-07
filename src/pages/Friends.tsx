
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, UserMinus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
}

const Friends = () => {
  const { user } = useAuth();
  const { friends, following, loading, toggleFollow, getFollowStatus } = useSocial();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      updateFollowingStatus();
    }
  }, [friends, user]);

  const updateFollowingStatus = async () => {
    if (!user) return;
    const followingIds = await Promise.all(
      searchResults.map(async (profile) => {
        const isFollowing = await getFollowStatus(profile.id);
        return isFollowing ? profile.id : null;
      })
    );
    setFollowingUsers(followingIds.filter(id => id !== null) as string[]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Fehler bei der Suche",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setSearchResults(data || []);
      if (data && data.length === 0) {
        toast({
          title: "Nutzer nicht gefunden",
          description: "Keine Nutzer mit diesem Namen gefunden",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (userId: string) => {
    const result = await toggleFollow(userId);
    if (result !== undefined) {
      await updateFollowingStatus();
      toast({
        title: result ? "Gefolgt" : "Nicht mehr gefolgt",
        description: result ? "Du folgst diesem Nutzer jetzt" : "Du folgst diesem Nutzer nicht mehr"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Anmeldung erforderlich</h2>
          <p className="text-muted-foreground mb-4">
            Du musst angemeldet sein, um Freunde zu finden.
          </p>
          <Link to="/auth">
            <Button>Anmelden</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Freunde</h1>
          <p className="text-muted-foreground">
            Finde neue Freunde und verwalte deine Kontakte
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Nutzer suchen</h2>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Benutzername eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? 'Suchen...' : 'Suchen'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Suchergebnisse:</h3>
                {searchResults.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🍞</div>
                      <div>
                        <p className="font-medium">{profile.username}</p>
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${profile.username}`}>
                        <Button variant="outline" size="sm">
                          Profil ansehen
                        </Button>
                      </Link>
                      {profile.id !== user.id && (
                        <Button
                          size="sm"
                          variant={followingUsers.includes(profile.id) ? "outline" : "default"}
                          onClick={() => handleFollow(profile.id)}
                        >
                          {followingUsers.includes(profile.id) ? (
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Deine Freunde ({friends.length})</h2>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Lade Freunde...</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold mb-2">Noch keine Freunde</h3>
                <p className="text-muted-foreground">
                  Nutze die Suche oben, um neue Freunde zu finden und ihnen zu folgen.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🍞</div>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        {friend.bio && (
                          <p className="text-sm text-muted-foreground">{friend.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${friend.username}`}>
                        <Button variant="outline" size="sm">
                          Profil ansehen
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollow(friend.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Entfolgen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Friends;
