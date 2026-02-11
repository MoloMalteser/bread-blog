
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, UserMinus, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
}

const Friends = () => {
  const { user } = useAuth();
  const { friends, following, loading, toggleFollow, getFollowStatus } = useSocial();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'friends'>('discover');

  useEffect(() => {
    if (user) {
      updateFollowingStatus();
      fetchSuggestions();
    }
  }, [friends, user]);

  const fetchSuggestions = async () => {
    if (!user) return;
    try {
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
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
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
        title: result 
          ? (language === 'de' ? 'Gefolgt ✨' : 'Followed ✨')
          : (language === 'de' ? 'Entfolgt' : 'Unfollowed')
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Header />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center max-w-md mx-4 mt-20">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">
            {language === 'de' ? 'Anmeldung erforderlich' : 'Login required'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'de' ? 'Melde dich an um Freunde zu finden' : 'Sign in to find friends'}
          </p>
          <Link to={`/${language}/auth`}>
            <Button className="rounded-full gradient-primary text-primary-foreground px-6">
              {language === 'de' ? 'Anmelden' : 'Sign In'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />
      
      <main className="pt-20 max-w-lg mx-auto px-4">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="glass-effect rounded-2xl p-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground ml-1" />
            <Input
              placeholder={language === 'de' ? "Nutzer suchen..." : "Search people..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-0 bg-transparent focus-visible:ring-0 h-8 text-sm"
            />
            {searchQuery && (
              <Button size="sm" onClick={handleSearch} disabled={searching} className="rounded-full h-7 text-xs px-3">
                {searching ? '...' : '🔍'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'discover' ? 'glass-card ring-1 ring-primary/20' : 'text-muted-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {language === 'de' ? 'Entdecken' : 'Discover'}
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'friends' ? 'glass-card ring-1 ring-primary/20' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            {language === 'de' ? 'Freunde' : 'Friends'} ({friends.length})
          </button>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-1">
                {language === 'de' ? 'Ergebnisse' : 'Results'}
              </p>
              {searchResults.map((profile, i) => (
                <motion.div key={profile.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <UserCard
                    profile={profile}
                    isFollowing={followingUsers.includes(profile.id)}
                    onFollow={handleFollow}
                    isSelf={profile.id === user?.id}
                    language={language}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-1 mb-3">
                {language === 'de' ? 'Vorgeschlagen' : 'Suggested for you'}
              </p>
              {suggestions.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl">
                  <div className="text-4xl mb-3">🌟</div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Keine neuen Vorschläge' : 'No new suggestions'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl p-4 text-center interactive-card"
                    >
                      <Avatar className="h-14 w-14 mx-auto mb-2 ring-2 ring-primary/10">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent font-semibold">
                          {s.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-medium text-sm mb-1 truncate">{s.username}</h4>
                      {s.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.bio}</p>}
                      <Button
                        size="sm"
                        className="rounded-full w-full text-xs h-8 gradient-primary text-primary-foreground"
                        onClick={() => handleFollow(s.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {language === 'de' ? 'Folgen' : 'Follow'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="flex justify-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : friends.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-semibold mb-1">
                    {language === 'de' ? 'Noch keine Freunde' : 'No friends yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'de' ? 'Entdecke neue Leute!' : 'Discover new people!'}
                  </p>
                  <Button onClick={() => setActiveTab('discover')} className="rounded-full" variant="outline">
                    {language === 'de' ? 'Entdecken' : 'Discover'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend, i) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <UserCard
                        profile={friend}
                        isFollowing={true}
                        onFollow={handleFollow}
                        isSelf={false}
                        language={language}
                        showUnfollow
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

interface UserCardProps {
  profile: UserProfile;
  isFollowing: boolean;
  onFollow: (id: string) => void;
  isSelf: boolean;
  language: string;
  showUnfollow?: boolean;
}

const UserCard = ({ profile, isFollowing, onFollow, isSelf, language, showUnfollow }: UserCardProps) => (
  <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
    <Link to={`/${language}/profile/${profile.username}`}>
      <Avatar className="h-11 w-11 ring-2 ring-primary/10">
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-sm font-semibold">
          {profile.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/${language}/profile/${profile.username}`} className="font-medium text-sm hover:text-primary transition-colors">
        {profile.username}
      </Link>
      {profile.bio && <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>}
    </div>
    {!isSelf && (
      <Button
        size="sm"
        variant={isFollowing || showUnfollow ? "outline" : "default"}
        className="rounded-full text-xs h-8 px-3"
        onClick={() => onFollow(profile.id)}
      >
        {isFollowing || showUnfollow ? (
          <><UserMinus className="h-3 w-3 mr-1" />{language === 'de' ? 'Entfolgen' : 'Unfollow'}</>
        ) : (
          <><UserPlus className="h-3 w-3 mr-1" />{language === 'de' ? 'Folgen' : 'Follow'}</>
        )}
      </Button>
    )}
  </div>
);

export default Friends;
