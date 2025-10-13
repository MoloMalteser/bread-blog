
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import DailyMissions from '@/components/DailyMissions';
import { PlusCircle, Edit3, Eye, Calendar, Trash2, Trophy, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites } from '@/hooks/useWebsites';
import { Globe, Plus } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/hooks/useLanguage';
import BottomNavigation from '@/components/BottomNavigation';

const Dashboard = () => {
  const { user } = useAuth();
  const { posts, loading, deletePost } = usePosts();
  const { websites, deleteWebsite, publishWebsite } = useWebsites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate(`/${language}/auth`);
      return;
    }
  }, [user, navigate, language]);

  const handleDeletePost = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      toast({
        title: "Post deleted",
        description: "The Post was deleted succesfully",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/${language}/editor/${postId}`);
  };

  const publishedPosts = posts.filter(post => post.is_public);
  const draftPosts = posts.filter(post => !post.is_public);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 pb-20 max-w-6xl mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">
                Welcome back, {user.user_metadata?.username || user.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">
                Your personal Writing-Space at Bread
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${language}/settings`)}
                className="rounded-full"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 rounded-xl">
            <TabsTrigger value="posts" className="flex items-center gap-2 rounded-lg">
              <Edit3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2 rounded-lg">
              <Globe className="h-4 w-4" />
              Websites
            </TabsTrigger>
            <TabsTrigger value="wiki" className="flex items-center gap-2 rounded-lg">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Wiki
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 rounded-lg">
              <Target className="h-4 w-4" />
              Missionen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl border-2 border-transparent hover:border-primary/20" onClick={() => navigate('/en/editor')}>
                <CardContent className="p-4 md:p-6 text-center">
                  <PlusCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">New Post</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Share your thougts</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl border-2 border-transparent hover:border-primary/20" onClick={() => navigate('/en/webbuilder')}>
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-xl md:text-2xl mb-2 md:mb-3">🏗️</div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">New Blog-Website</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Create a new Blog-Website</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl border-2 border-transparent hover:border-primary/20" onClick={() => navigate(`/en/profile/${user.user_metadata?.username || user.email?.split('@')[0]}`)}>
                <CardContent className="p-4 md:p-6 text-center">
                  <Eye className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">My Profile</h3>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    bread.blog/{user.user_metadata?.username || user.email?.split('@')[0]}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-2 border-transparent">
                <CardContent className="p-4 md:p-6 text-center">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">Statistics</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {publishedPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)} Total Views
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Posts Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Published Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Published Posts ({publishedPosts.length})</h2>
                </div>
                
                <div className="space-y-4">
                  {publishedPosts.length === 0 ? (
                    <Card className="rounded-xl">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <p>No published Posts.</p>
                        <Button className="mt-4 rounded-lg" onClick={() => navigate('/en/editor')}>
                          Write your First Post
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    publishedPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow rounded-xl border-2 border-transparent hover:border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {post.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <span>{post.view_count || 0} Aufrufe</span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id)} className="rounded-lg">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Draft Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Drafts ({draftPosts.length})</h2>
                </div>
                
                <div className="space-y-4">
                  {draftPosts.length === 0 ? (
                    <Card className="rounded-xl">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <p>No existing Drafts.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    draftPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow rounded-xl border-2 border-transparent hover:border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {post.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Badge variant="outline" className="text-xs rounded-lg">Draft</Badge>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id)} className="rounded-lg">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="websites" className="space-y-8">
            {/* Websites Management */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">My Blog-Websites ({websites.length})</h2>
                <Button onClick={() => navigate('/en/webbuilder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websites.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg mb-2">You have 0 Blog-Websites created</p>
                      <p className="mb-6">Create your first Blog with the WebBuilder</p>
                      <Button onClick={() => navigate('/en/webbuilder')}>
                        Create Blog
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  websites.map(website => (
                    <Card key={website.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{website.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              /{website.slug}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant={website.is_published ? "default" : "secondary"}>
                                {website.is_published ? "Public" : "Draft"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(website.updated_at).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/en/webbuilder/${website.id}`)}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Bearbeiten
                          </Button>
                          
                          {website.is_published ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`/en/pages/${website.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ansehen
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => publishWebsite(website.id)}
                            >
                              <Globe className="h-4 w-4 mr-1" />
                              Veröffentlichen
                            </Button>
                          )}
                          
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => deleteWebsite(website.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wiki" className="space-y-8">
            {/* Wiki Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Wiki & Knowledge</h2>
                <Button onClick={() => navigate('/en/wiki')} className="rounded-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Zum Wiki
                </Button>
              </div>
              
              <Card className="rounded-xl border-2 border-transparent">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-lg mb-2">Creating knowledge together</p>
                  <p className="mb-6">Contribute to the community wiki and share your knowledge with others</p>
                  <Button onClick={() => navigate('/wiki')} className="rounded-lg">
                    Visit Wiki
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="missions">
            <DailyMissions />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Language Selector at bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
