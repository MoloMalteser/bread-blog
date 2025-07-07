
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Calendar, Eye, ArrowLeft, Share2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSocial } from '@/hooks/useSocial';

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  view_count: number;
}

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  created_at: string;
}

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { friends, following } = useSocial();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(profileData);
        setIsOwner(authUser?.id === profileData.id);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (postsData) {
          setPosts(postsData);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [username, authUser]);

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.username} auf Bread`,
          text: `Schau dir das Profil von ${user?.username} an`,
          url: url,
        });
      } catch (err) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link kopiert",
          description: "Der Profil-Link wurde in die Zwischenablage kopiert",
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert",
        description: "Der Profil-Link wurde in die Zwischenablage kopiert",
      });
    }
  };

  const friendsCount = friends.filter(friend => friend.id === user?.id).length + 
                     friends.filter(friend => following.includes(friend.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Nutzer nicht vorhanden :(</h2>
          <p className="text-muted-foreground mb-4">
            Der Benutzer @{username} existiert nicht.
          </p>
          <Link to="/feed">
            <Button>Zurück zum Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/feed">
                <BreadLogo />
              </Link>
              <div className="text-sm text-muted-foreground">
                bread.blog/{user?.username}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Teilen
              </Button>
              {!isOwner && (
                <Link to="/feed">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>
                </Link>
              )}
              {isOwner && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🍞</div>
          <h1 className="text-3xl font-semibold">{user?.username}</h1>
          <p className="text-lg text-muted-foreground">@{user?.username}</p>
          
          {user?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto">{user.bio}</p>
          )}
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Dabei seit {new Date(user.created_at).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{friendsCount} Freunde</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{posts.reduce((sum, post) => sum + (post.view_count || 0), 0)} Aufrufe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Alle Posts ({posts.length})
          </h2>
          <p className="text-muted-foreground">
            Gedanken und Geschichten von {user?.username}
          </p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">Noch keine Posts</h3>
              <p className="text-muted-foreground">
                {isOwner 
                  ? 'Schreibe deinen ersten Post und teile deine Gedanken mit der Welt!'
                  : `${user?.username} hat noch keine Posts veröffentlicht.`
                }
              </p>
              {isOwner && (
                <Link to="/editor">
                  <Button className="mt-4">Ersten Post schreiben</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <Link key={post.id} to={`/post/${post.slug}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      
                      <div className="text-muted-foreground leading-relaxed">
                        <MarkdownRenderer content={post.content.substring(0, 200) + '...'} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                          <span>•</span>
                          <span>{post.view_count || 0} Aufrufe</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
