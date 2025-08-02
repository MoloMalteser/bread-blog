
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import DailyMissions from '@/components/DailyMissions';
import { PlusCircle, Edit3, Eye, Calendar, Trash2, Trophy, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites } from '@/hooks/useWebsites';
import { Globe, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { posts, loading, deletePost } = usePosts();
  const { websites, deleteWebsite, publishWebsite } = useWebsites();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleDeletePost = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      toast({
        title: "Post gelöscht",
        description: "Der Post wurde erfolgreich gelöscht",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/editor/${postId}`);
  };

  const publishedPosts = posts.filter(post => post.is_public);
  const draftPosts = posts.filter(post => !post.is_public);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 pb-20 max-w-6xl mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            Willkommen zurück, {user.user_metadata?.username || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Dein persönlicher Schreibbereich bei Bread
          </p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Websites
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Missionen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/editor')}>
                <CardContent className="p-4 md:p-6 text-center">
                  <PlusCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">Neuer Post</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Teile deine Gedanken</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/webbuilder')}>
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-xl md:text-2xl mb-2 md:mb-3">🏗️</div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">Neue Website</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Erstelle eine Website</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${user.user_metadata?.username || user.email?.split('@')[0]}`)}>
                <CardContent className="p-4 md:p-6 text-center">
                  <Eye className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">Mein Profil</h3>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    bread.blog/{user.user_metadata?.username || user.email?.split('@')[0]}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6 text-center">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">Statistiken</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {publishedPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)} Aufrufe gesamt
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Posts Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Published Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Veröffentlichte Posts ({publishedPosts.length})</h2>
                </div>
                
                <div className="space-y-4">
                  {publishedPosts.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Noch keine veröffentlichten Posts.</p>
                        <Button className="mt-4" onClick={() => navigate('/editor')}>
                          Ersten Post schreiben
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    publishedPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
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
                              <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
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
                  <h2 className="text-xl font-semibold">Entwürfe ({draftPosts.length})</h2>
                </div>
                
                <div className="space-y-4">
                  {draftPosts.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Keine Entwürfe vorhanden.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    draftPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {post.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Badge variant="outline" className="text-xs">Entwurf</Badge>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
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
                <h2 className="text-2xl font-semibold">Meine Websites ({websites.length})</h2>
                <Button onClick={() => navigate('/webbuilder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Website
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websites.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg mb-2">Noch keine Websites erstellt</p>
                      <p className="mb-6">Erstelle deine erste Website mit dem WebBuilder</p>
                      <Button onClick={() => navigate('/webbuilder')}>
                        Website erstellen
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
                                {website.is_published ? "Veröffentlicht" : "Entwurf"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(website.updated_at).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/webbuilder/${website.id}`)}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Bearbeiten
                          </Button>
                          
                          {website.is_published ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`/pages/${website.slug}`, '_blank')}
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

          <TabsContent value="missions">
            <DailyMissions />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
