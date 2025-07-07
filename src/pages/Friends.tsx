
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Search, UserPlus, UserMinus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
}

const Friends = () => {
  const { user } = useAuth();
  const { friends, following, toggleFollow, loading } = useSocial();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, bio')
        .ilike('username', `%${searchQuery.trim()}%`)
        .neq('id', user?.id || '')
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
        toast({
          title: "Nutzer nicht gefunden :(",
          description: "Es wurde kein Nutzer mit diesem Namen gefunden.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Suchfehler",
        description: "Fehler beim Suchen nach Nutzern",
        variant: "destructive"
      });
    }
    setSearching(false);
  };

  const handleToggleFollow = async (targetUserId: string, username: string) => {
    const success = await toggleFollow(targetUserId);
    if (success) {
      const isFollowing = following.includes(targetUserId);
      toast({
        title: isFollowing ? "Entfolgt" : "Gefolgt",
        description: isFollowing ? `Du folgst ${username} nicht mehr` : `Du folgst jetzt ${username}`,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Freunde</h1>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Neue Freunde finden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Benutzername eingeben..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? 'Suchen...' : 'Suchen'}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Suchergebnisse:</h4>
                {searchResults.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">@{profile.username}</p>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      )}
                    </div>
                    <Button
                      variant={following.includes(profile.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleFollow(profile.id, profile.username)}
                      disabled={loading}
                    >
                      {following.includes(profile.id) ? (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meine Freunde ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p>Du hast noch keine Freunde.</p>
                <p className="text-sm">Suche nach Nutzern und folge ihnen!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">@{friend.username}</p>
                      {friend.bio && (
                        <p className="text-sm text-muted-foreground">{friend.bio}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Freund</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFollow(friend.id, friend.username)}
                        disabled={loading}
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
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Friends;
