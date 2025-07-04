
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';

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

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // In real app, this would fetch user data from API
    const userData = localStorage.getItem('bread-user');
    if (userData) {
      const currentUser = JSON.parse(userData);
      setIsOwner(currentUser.username === username);
      
      // For demo, we use the same user data
      setUser(currentUser);
    } else {
      // Demo user for public viewing
      setUser({
        id: 'demo',
        username: username || 'demo',
        displayName: username || 'Demo User',
        email: 'demo@bread.blog'
      });
    }

    // Load posts
    const savedPosts = localStorage.getItem('bread-posts');
    if (savedPosts) {
      const allPosts: Post[] = JSON.parse(savedPosts);
      const publishedPosts = allPosts.filter(post => post.published);
      setPosts(publishedPosts);
    }
  }, [username]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Benutzer nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">
            Der Benutzer @{username} existiert nicht.
          </p>
          <Link to="/">
            <Button>Zur Startseite</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <BreadLogo />
              </Link>
              <div className="text-sm text-muted-foreground">
                bread.blog/{user.username}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {!isOwner && (
                <Link to="/">
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
          <h1 className="text-3xl font-semibold">{user.displayName}</h1>
          <p className="text-lg text-muted-foreground">@{user.username}</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Dabei seit Januar 2024</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{posts.reduce((sum, post) => sum + post.views, 0)} Aufrufe</span>
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
            Gedanken und Geschichten von {user.displayName}
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
                  : `${user.displayName} hat noch keine Posts veröffentlicht.`
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
              <Link key={post.id} to={`/post/${post.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{post.createdAt}</span>
                          <span>•</span>
                          <span>{post.views} Aufrufe</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
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
    </div>
  );
};

export default Profile;
