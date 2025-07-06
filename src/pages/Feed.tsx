
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useFeed } from '@/hooks/useFeed';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart, MessageCircle, Eye, Calendar, User, Send, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

const Feed = () => {
  const [currentView, setCurrentView] = useState<'feed' | 'all'>('feed');
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  
  const { feedPosts, allPosts, loading, fetchFeedPosts, fetchAllPosts } = useFeed();
  const { toggleLike, getLikeInfo, addComment, getComments, incrementViewCount } = useSocial();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const currentPosts = currentView === 'feed' ? feedPosts : allPosts;
  const dateLocale = language === 'de' ? de : enUS;

  useEffect(() => {
    if (user) {
      if (currentView === 'feed') {
        fetchFeedPosts();
      } else {
        fetchAllPosts();
      }
    }
  }, [currentView, user]);

  // Load like info and comments for visible posts
  useEffect(() => {
    const loadPostData = async () => {
      for (const post of currentPosts) {
        // Load like info
        const info = await getLikeInfo(post.id);
        setLikeInfo(prev => ({ ...prev, [post.id]: info }));

        // Load comments
        const postComments = await getComments(post.id);
        setComments(prev => ({ ...prev, [post.id]: postComments }));
      }
    };

    if (currentPosts.length > 0) {
      loadPostData();
    }
  }, [currentPosts]);

  const handleLike = async (postId: string) => {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4">{t('loginRequired')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('loginRequiredDescription')}
              </p>
              <Link to="/auth">
                <Button>{t('loginNow')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Pills with additional buttons */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={currentView} onValueChange={(value: 'feed' | 'all') => setCurrentView(value)}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">📱 {t('feed')}</SelectItem>
                <SelectItem value="all">🌍 {t('general')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">{t('loadingPosts')}</div>
          </div>
        ) : currentPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">
                {currentView === 'feed' ? '📱' : '🌍'}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {currentView === 'feed' ? t('feedEmpty') : t('noPostsFound')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {currentView === 'feed' ? t('feedEmptyDescription') : t('noPostsFoundDescription')}
              </p>
              {currentView === 'feed' && (
                <Button onClick={() => setCurrentView('all')} variant="outline">
                  {t('showAllPosts')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {currentPosts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Link 
                        to={`/profile/${post.profiles?.username}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {post.profiles?.username}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(post.created_at), 'PPP', { locale: dateLocale })}
                        </span>
                        <span>•</span>
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count || 0} {t('views')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <Link 
                    to={`/post/${post.slug}`}
                    onClick={() => handlePostClick(post.id)}
                    className="block mb-4"
                  >
                    <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>
                  </Link>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pb-4 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2"
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
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 flex gap-2">
                          <Textarea
                            placeholder={t('writeComment')}
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
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Feed;
