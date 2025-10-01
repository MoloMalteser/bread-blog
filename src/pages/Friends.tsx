
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, UserMinus, Users, MessageCircle, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
}

const Friends = () => {
  const { user } = useAuth();
  const { friends, following, loading, toggleFollow, getFollowStatus } = useSocial();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user) {
      updateFollowingStatus();
      fetchSuggestions();
    }
  }, [friends, user]);

  const fetchSuggestions = async () => {
    if (!user) return;
    
    try {
      // Get random users that the current user doesn't follow
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(6);
        
      if (error) throw error;
      
      const filtered = data?.filter(profile => 
        !friends.some(friend => friend.id === profile.id)
      ) || [];
      
      setSuggestions(filtered);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

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
          <Link to={`/${language}/auth`}>
            <Button>{t('loginNow')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Freunde & Community</h1>
          <p className="text-muted-foreground">
            Entdecke neue Freunde, verwalte deine Kontakte und baue dein Netzwerk auf
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Suchen
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Freunde ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Empfehlungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Nutzer suchen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="space-y-3">
                    <h3 className="font-medium">Suchergebnisse:</h3>
                    <div className="grid gap-3">
                      {searchResults.map((profile) => (
                        <Card key={profile.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
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
                              {profile.id !== user?.id && (
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
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Deine Freunde ({friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Lade Freunde...</p>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold mb-2">Noch keine Freunde</h3>
                    <p className="text-muted-foreground mb-6">
                      Nutze die Suche oder Empfehlungen, um neue Freunde zu finden und ihnen zu folgen.
                    </p>
                    <Button onClick={() => {
                      const searchTab = document.querySelector('[value="search"]') as HTMLButtonElement;
                      searchTab?.click();
                    }}>
                      Jetzt Freunde finden
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {friends.map((friend) => (
                      <Card key={friend.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friend.username}</p>
                              {friend.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{friend.bio}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link to={`/profile/${friend.username}`}>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFollow(friend.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Empfohlene Nutzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌟</div>
                    <h3 className="text-xl font-semibold mb-2">Keine neuen Empfehlungen</h3>
                    <p className="text-muted-foreground">
                      Schaue später nochmal vorbei für neue Nutzervorschläge.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-4 text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarFallback className="text-lg">
                            {suggestion.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className="font-medium mb-1">{suggestion.username}</h4>
                        {suggestion.bio && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {suggestion.bio}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Link to={`/profile/${suggestion.username}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Profil
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleFollow(suggestion.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Folgen
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;
