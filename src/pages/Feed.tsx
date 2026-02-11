
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Header from '@/components/Header';
import AdBanner from '@/components/AdBanner';
import RichContentRenderer from '@/components/RichContentRenderer';
import { PollDisplay } from '@/components/PollDisplay';
import TranslateButton from '@/components/TranslateButton';
import { useFeed } from '@/hooks/useFeed';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart, MessageCircle, Eye, Send, Search, Repeat2, Sparkles, Flame, Laugh, ThumbsUp, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = [
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '🔥', icon: Flame, label: 'Fire' },
  { emoji: '😂', icon: Laugh, label: 'Haha' },
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '⚡', icon: Zap, label: 'Mind-blown' },
];

const Feed = () => {
  const [currentView, setCurrentView] = useState<'feed' | 'all'>('all');
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [reposts, setReposts] = useState<Record<string, { count: number; isReposted: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, { title: string; content: string }>>({});
  const [activeReactions, setActiveReactions] = useState<Record<string, string>>({});
  
  const { feedPosts, allPosts, loading, fetchFeedPosts, fetchAllPosts } = useFeed();
  const { toggleLike, getLikeInfo, addComment, getComments, incrementViewCount } = useSocial();
  const { user } = useAuth();
  const { showAds } = useSubscription();
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';
  const currentPosts = currentView === 'feed' ? feedPosts : allPosts;
  const dateLocale = language === 'de' ? de : enUS;

  const filteredPosts = currentPosts.filter(post => 
    searchQuery === '' || 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
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

  useEffect(() => {
    const loadPostData = async () => {
      for (const post of filteredPosts) {
        if (user) {
          const info = await getLikeInfo(post.id);
          setLikeInfo(prev => ({ ...prev, [post.id]: info }));
        }
        const postComments = await getComments(post.id);
        setComments(prev => ({ ...prev, [post.id]: postComments }));
      }
    };
    if (filteredPosts.length > 0) loadPostData();
  }, [filteredPosts, user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({ title: language === 'de' ? "Anmeldung erforderlich" : "Login required", variant: "destructive" });
      return;
    }
    const newLikedState = await toggleLike(postId);
    setLikeInfo(prev => ({
      ...prev,
      [postId]: {
        count: prev[postId] ? (newLikedState ? prev[postId].count + 1 : prev[postId].count - 1) : 1,
        isLiked: newLikedState
      }
    }));
  };

  const handleAddComment = async (postId: string) => {
    if (!user) return;
    const content = newComment[postId];
    if (!content?.trim()) return;
    const comment = await addComment(postId, content);
    if (comment) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handlePostClick = async (postId: string) => {
    await incrementViewCount(postId);
  };

  const handleRepost = async (postId: string) => {
    if (!user) return;
    const newRepostState = !reposts[postId]?.isReposted;
    setReposts(prev => ({
      ...prev,
      [postId]: {
        count: newRepostState ? (prev[postId]?.count || 0) + 1 : Math.max(0, (prev[postId]?.count || 0) - 1),
        isReposted: newRepostState
      }
    }));
    toast({ title: newRepostState ? "Shared ✨" : "Unshared" });
  };

  const handleTranslate = (postId: string, content: string, title: string) => {
    setTranslatedPosts(prev => ({ ...prev, [postId]: { content, title } }));
  };

  const handleReaction = (postId: string, emoji: string) => {
    setActiveReactions(prev => ({
      ...prev,
      [postId]: prev[postId] === emoji ? '' : emoji
    }));
  };

  if (!user && !isAnonymousUser) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center max-w-md mx-4">
            <div className="text-5xl mb-4">🥥</div>
            <h2 className="text-2xl font-semibold mb-2">{t('loginRequired')}</h2>
            <p className="text-muted-foreground mb-6">{t('loginRequiredDescription')}</p>
            <Link to={`/${language}/auth`}>
              <Button className="rounded-full gradient-primary text-primary-foreground px-8">{t('loginNow')}</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {showAds && <AdBanner />}
      
      <main className="pt-20 pb-28 max-w-lg mx-auto px-4">
        {/* Sticky Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-30 py-3"
        >
          <div className="glass-effect rounded-2xl p-3 flex items-center gap-2">
            {user && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={currentView === 'all' ? 'default' : 'ghost'} 
                  className="rounded-full text-xs h-8"
                  onClick={() => setCurrentView('all')}
                >
                  🌍 {language === 'de' ? 'Alle' : 'All'}
                </Button>
                <Button 
                  size="sm" 
                  variant={currentView === 'feed' ? 'default' : 'ghost'} 
                  className="rounded-full text-xs h-8"
                  onClick={() => setCurrentView('feed')}
                >
                  ✨ {language === 'de' ? 'Für dich' : 'For You'}
                </Button>
              </div>
            )}
            <div className="flex-1" />
            <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Input
                  type="text"
                  placeholder={language === 'de' ? "Suchen..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2 rounded-xl glass-effect border-0"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center mt-4">
            <div className="text-5xl mb-4">🥥</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? (language === 'de' ? 'Nichts gefunden' : 'Nothing found') : (language === 'de' ? 'Noch keine Posts' : 'No posts yet')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentView === 'feed' && !searchQuery 
                ? (language === 'de' ? 'Folge anderen Nutzern um deinen Feed zu füllen' : 'Follow others to fill your feed')
                : (language === 'de' ? 'Sei der Erste!' : 'Be the first!')}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 mt-2">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <div className="glass-card overflow-hidden interactive-card">
                    <div className="p-5">
                      {/* User Row */}
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-sm font-semibold">
                            {post.is_anonymous ? '🎭' : (post.profiles?.username?.[0]?.toUpperCase() || '?')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {post.is_anonymous ? (
                            <span className="font-medium text-muted-foreground text-sm">Anonymous</span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link 
                                to={`/${language}/profile/${post.profiles?.username}`}
                                className="font-semibold text-sm hover:text-primary transition-colors"
                              >
                                {post.profiles?.username}
                              </Link>
                              {post.profiles?.badges?.includes('supporter') && (
                                <Badge variant="default" className="text-[10px] h-4 px-1.5 rounded-full">⭐</Badge>
                              )}
                              {post.profiles?.badges?.includes('admin') && (
                                <Badge variant="destructive" className="text-[10px] h-4 px-1.5 rounded-full">👑</Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{format(new Date(post.created_at), 'PP', { locale: dateLocale })}</span>
                            <span>·</span>
                            <Eye className="h-3 w-3" />
                            <span>{post.view_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <Link 
                        to={`/${language}/post/${post.slug}`}
                        onClick={() => handlePostClick(post.id)}
                        className="block mb-3"
                      >
                        <h3 className="text-base font-semibold mb-1.5 hover:text-primary transition-colors leading-snug">
                          {translatedPosts[post.id]?.title || post.title}
                        </h3>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          <RichContentRenderer 
                            content={(translatedPosts[post.id]?.content || post.content).substring(0, 200)} 
                          />
                        </div>
                      </Link>

                      {language === 'en' && !translatedPosts[post.id] && (
                        <div className="mb-3">
                          <TranslateButton
                            content={post.content}
                            title={post.title}
                            onTranslated={(content, title) => handleTranslate(post.id, content, title)}
                          />
                        </div>
                      )}

                      <PollDisplay postId={post.id} />

                      {/* Reactions Row */}
                      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                        {REACTIONS.map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => handleReaction(post.id, r.emoji)}
                            className={`text-lg px-2 py-1 rounded-full transition-all duration-200 ${
                              activeReactions[post.id] === r.emoji 
                                ? 'bg-primary/15 scale-110' 
                                : 'hover:bg-muted/50 hover:scale-105'
                            }`}
                          >
                            {r.emoji}
                          </button>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 border-t border-border/30 pt-3">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} disabled={!user} className="rounded-full h-8 text-xs gap-1.5 flex-1">
                          <Heart className={`h-4 w-4 ${likeInfo[post.id]?.isLiked ? 'fill-destructive text-destructive' : ''}`} />
                          {likeInfo[post.id]?.count || 0}
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="rounded-full h-8 text-xs gap-1.5 flex-1">
                          <MessageCircle className="h-4 w-4" />
                          {comments[post.id]?.length || 0}
                        </Button>

                        <Button variant="ghost" size="sm" onClick={() => handleRepost(post.id)} disabled={!user} className="rounded-full h-8 text-xs gap-1.5 flex-1">
                          <Repeat2 className={`h-4 w-4 ${reposts[post.id]?.isReposted ? 'text-primary' : ''}`} />
                          {reposts[post.id]?.count || 0}
                        </Button>
                      </div>

                      {/* Comments */}
                      <AnimatePresence>
                        {showComments[post.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 space-y-3 overflow-hidden"
                          >
                            {comments[post.id]?.map(comment => (
                              <div key={comment.id} className="flex gap-2.5">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xs bg-muted">
                                    {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/30 rounded-2xl px-3 py-2">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-medium text-xs">{comment.profiles?.username}</span>
                                    {comment.profiles?.badges?.includes('supporter') && <span className="text-[10px]">⭐</span>}
                                    <span className="text-[10px] text-muted-foreground">
                                      {format(new Date(comment.created_at), 'PP', { locale: dateLocale })}
                                    </span>
                                  </div>
                                  <RichContentRenderer content={comment.content} className="text-sm" />
                                </div>
                              </div>
                            ))}

                            {user && (
                              <div className="flex gap-2 items-end">
                                <Textarea
                                  placeholder={language === 'de' ? "Antworten..." : "Reply..."}
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  className="min-h-[40px] max-h-[80px] resize-none rounded-2xl text-sm"
                                  rows={1}
                                />
                                <Button
                                  size="sm"
                                  className="rounded-full h-9 w-9 p-0"
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
