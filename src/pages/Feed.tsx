
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import RichContentRenderer from '@/components/RichContentRenderer';
import { useFeed } from '@/hooks/useFeed';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart, MessageCircle, Eye, Calendar, User, Send, Plus, Search, Repeat2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Feed = () => {
  const [currentView, setCurrentView] = useState<'feed' | 'all'>('all'); // Default to 'all' for anonymous users
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [reposts, setReposts] = useState<Record<string, { count: number; isReposted: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { feedPosts, allPosts, loading, fetchFeedPosts, fetchAllPosts } = useFeed();
  const { toggleLike, getLikeInfo, addComment, getComments, incrementViewCount } = useSocial();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();

  // Check if user is anonymous
  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';

  const currentPosts = currentView === 'feed' ? feedPosts : allPosts;
  const dateLocale = language === 'de' ? de : enUS;

  // Filter posts based on search query
  const filteredPosts = currentPosts.filter(post => 
    searchQuery === '' || 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // For anonymous users, always show 'all' posts and hide 'feed' option
    if (isAnonymousUser) {
      setCurrentView('all');
      fetchAllPosts();
    } else if (user) {
      if (currentView === 'feed') {
        fetchFeedPosts();
      } else {
        fetchAllPosts();
      }
    }
  }, [currentView, user, isAnonymousUser]);

  // Load like info and comments for visible posts
  useEffect(() => {
    const loadPostData = async () => {
      for (const post of filteredPosts) {
        // Load like info only for authenticated users
        if (user) {
          const info = await getLikeInfo(post.id);
          setLikeInfo(prev => ({ ...prev, [post.id]: info }));
        }

        // Load comments for everyone
        const postComments = await getComments(post.id);
        setComments(prev => ({ ...prev, [post.id]: postComments }));
      }
    };

    if (filteredPosts.length > 0) {
      loadPostData();
    }
  }, [filteredPosts, user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Posts zu liken",
        variant: "destructive"
      });
      return;
    }

    const newLikedState = await toggleLike(postId);
    
    // Update like info locally
    setLikeInfo(prev => ({
      ...prev,
      [postId]: {
        count: prev[postId] ? (newLikedState ? prev[postId].count + 1 : prev[postId].count - 1) : 1,
        isLiked: newLikedState
      }
    }));
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um zu kommentieren",
        variant: "destructive"
      });
      return;
    }

    const content = newComment[postId];
    if (!content?.trim()) return;

    const comment = await addComment(postId, content);
    if (comment) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handlePostClick = async (postId: string) => {
    await incrementViewCount(postId);
  };

  const handleRepost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Posts zu teilen",
        variant: "destructive"
      });
      return;
    }
    
    // Toggle repost status
    const newRepostState = !reposts[postId]?.isReposted;
    
    setReposts(prev => ({
      ...prev,
      [postId]: {
        count: newRepostState ? (prev[postId]?.count || 0) + 1 : Math.max(0, (prev[postId]?.count || 0) - 1),
        isReposted: newRepostState
      }
    }));

    toast({
      title: newRepostState ? "Post geteilt" : "Geteilter Post entfernt",
      description: newRepostState ? "Der Post wurde in deinem Feed geteilt" : "Der Post wurde aus deinem Feed entfernt",
    });
  };

  const handleAddFriend = () => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Freunde hinzuzufügen",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Freunde hinzufügen",
      description: "Diese Funktion wird bald verfügbar sein!",
    });
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Show content for both authenticated and anonymous users
  if (!user && !isAnonymousUser) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 flex items-center justify-center min-h-[80vh]">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">{t('loginRequired')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('loginRequiredDescription')}
            </p>
            <Link to={`/${language}/auth`}>
              <Button>{t('loginNow')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Pills with additional buttons */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user ? (
              <Select value={currentView} onValueChange={(value: 'feed' | 'all') => setCurrentView(value)}>
                <SelectTrigger className="w-48 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">📱 Mein Feed</SelectItem>
                  <SelectItem value="all">🌍 Allgemein</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <span className="text-sm">🌍 Allgemein (Anonym)</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={handleAddFriend}>
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" className="rounded-full" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            <Link to={`/${language}/editor`}>
              <Button size="sm" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Posts durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Posts werden geladen...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">
                {searchQuery ? '🔍' : (currentView === 'feed' ? '📱' : '🌍')}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'Keine Posts gefunden' : (currentView === 'feed' ? 'Dein Feed ist leer' : 'Keine Posts gefunden')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Versuche einen anderen Suchbegriff' : (currentView === 'feed' ? 'Folge anderen Nutzern um Posts in deinem Feed zu sehen' : 'Noch keine Posts vorhanden')}
              </p>
              {currentView === 'feed' && !searchQuery && (
                <Button onClick={() => setCurrentView('all')} variant="outline">
                  Alle Posts anzeigen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {post.is_anonymous ? (
                        <span className="text-lg">🥖</span>
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      {post.is_anonymous ? (
                        <span className="font-semibold text-muted-foreground">Anonym</span>
                      ) : (
                        <Link 
                          to={`/${language}/profile/${post.profiles?.username}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {post.profiles?.username}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(post.created_at), 'PPP', { locale: dateLocale })}
                        </span>
                        <span>•</span>
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count || 0} Aufrufe</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <Link 
                    to={`/${language}/post/${post.slug}`}
                    onClick={() => handlePostClick(post.id)}
                    className="block mb-4"
                  >
                    <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <div className="text-muted-foreground">
                      <RichContentRenderer content={post.content.substring(0, 200) + '...'} />
                    </div>
                  </Link>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pb-4 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2"
                      disabled={!user}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          likeInfo[post.id]?.isLiked 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                      <span>{likeInfo[post.id]?.count || 0}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(prev => ({ 
                        ...prev, 
                        [post.id]: !prev[post.id] 
                      }))}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{comments[post.id]?.length || 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRepost(post.id)}
                      className="flex items-center gap-2"
                      disabled={!user}
                    >
                      <Repeat2 
                        className={`h-4 w-4 ${
                          reposts[post.id]?.isReposted 
                            ? 'text-green-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                      <span>{reposts[post.id]?.count || 0}</span>
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="mt-4 space-y-4">
                      {/* Existing Comments */}
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.profiles?.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), 'PPp', { locale: dateLocale })}
                              </span>
                            </div>
                            <RichContentRenderer content={comment.content} className="text-sm" />
                          </div>
                        </div>
                      ))}

                      {/* Add Comment - only for authenticated users */}
                      {user && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              placeholder="Kommentar schreiben..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ 
                                ...prev, 
                                [post.id]: e.target.value 
                              }))}
                              className="min-h-[60px] resize-none"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
