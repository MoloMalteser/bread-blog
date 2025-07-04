
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { PlusCircle, Edit3, Eye, Calendar } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
  tags: string[];
  views: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('bread-user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Load demo posts
    const savedPosts = localStorage.getItem('bread-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Demo posts
      const demoPosts: Post[] = [
        {
          id: '1',
          title: 'Mein erster Gedanke',
          content: 'Heute hatte ich einen wunderbaren Gedanken über die Schönheit des Einfachen...',
          excerpt: 'Heute hatte ich einen wunderbaren Gedanken über die Schönheit des Einfachen...',
          published: true,
          createdAt: '2024-01-15',
          tags: ['gedanken', 'einfachheit'],
          views: 42
        },
        {
          id: '2',
          title: 'Entwurf: Über das Schreiben',
          content: 'Schreiben ist wie Brot backen - es braucht Zeit, Geduld und die richtigen Zutaten...',
          excerpt: 'Schreiben ist wie Brot backen - es braucht Zeit, Geduld...',
          published: false,
          createdAt: '2024-01-10',
          tags: ['schreiben', 'kreativität'],
          views: 0
        }
      ];
      setPosts(demoPosts);
      localStorage.setItem('bread-posts', JSON.stringify(demoPosts));
    }
  }, [navigate]);

  const publishedPosts = posts.filter(post => post.published);
  const draftPosts = posts.filter(post => !post.published);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            Willkommen zurück, {user.displayName}!
          </h1>
          <p className="text-muted-foreground">
            Dein persönlicher Schreibbereich bei Bread
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/editor')}>
            <CardContent className="p-6 text-center">
              <PlusCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Neuer Post</h3>
              <p className="text-sm text-muted-foreground">Teile deine Gedanken</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Mein Profil</h3>
              <p className="text-sm text-muted-foreground">bread.blog/{user.username}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Statistiken</h3>
              <p className="text-sm text-muted-foreground">
                {publishedPosts.reduce((sum, post) => sum + post.views, 0)} Aufrufe gesamt
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
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span>{post.views} Aufrufe</span>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/${post.id}`)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
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
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline" className="text-xs">Entwurf</Badge>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/${post.id}`)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
