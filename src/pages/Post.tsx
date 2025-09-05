
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, Calendar, Eye, Edit3, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
  tags: string[];
  views: number;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
}

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        // Try to fetch from Supabase first
        const { data: supabaseData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username,
              bio
            )
          `)
          .eq('id', postId)
          .eq('is_public', true)
          .single();

        if (supabaseData) {
          const mappedPost: Post = {
            id: supabaseData.id,
            title: supabaseData.title,
            content: supabaseData.content,
            excerpt: supabaseData.content.substring(0, 150) + '...',
            published: supabaseData.is_public,
            createdAt: new Date(supabaseData.created_at).toLocaleDateString('de-DE'),
            tags: [], // Add tags if needed
            views: supabaseData.view_count || 0,
            authorId: supabaseData.author_id,
            authorUsername: supabaseData.profiles?.username || 'unknown',
            authorDisplayName: supabaseData.profiles?.username || 'Anonym'
          };
          
          setPost(mappedPost);
          
          // Check if current user is owner
          const currentUser = supabase.auth.getUser();
          setIsOwner((await currentUser).data.user?.id === mappedPost.authorId);
          return;
        }
      } catch (error) {
        console.error('Error fetching post from Supabase:', error);
      }

      // Fallback to localStorage
      const savedPosts = localStorage.getItem('bread-posts');
      if (savedPosts) {
        const posts: Post[] = JSON.parse(savedPosts);
        const foundPost = posts.find(p => p.id === postId);
        
        if (foundPost) {
          foundPost.views += 1;
          const updatedPosts = posts.map(p => p.id === postId ? foundPost : p);
          localStorage.setItem('bread-posts', JSON.stringify(updatedPosts));
          
          setPost(foundPost);
          
          const userData = localStorage.getItem('bread-user');
          if (userData) {
            const user = JSON.parse(userData);
            setIsOwner(user.id === foundPost.authorId);
          }
        }
      }
    };

    fetchPost();
  }, [postId]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link kopiert",
          description: "Der Link wurde in die Zwischenablage kopiert",
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert",
        description: "Der Link wurde in die Zwischenablage kopiert",
      });
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Post nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">
            Der angeforderte Post existiert nicht oder ist nicht öffentlich.
          </p>
          <Link to="/">
            <Button>Zur Startseite</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!post.published && !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Post nicht verfügbar</h2>
          <p className="text-muted-foreground mb-4">
            Dieser Post ist noch nicht veröffentlicht.
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
            <Link to="/">
              <BreadLogo />
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Post Header */}
        <header className="mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link 
                to={`/profile/${post.authorUsername}`}
                className="hover:text-foreground transition-colors"
              >
                Von {post.authorDisplayName}
              </Link>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.createdAt}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views} Aufrufe</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Teilen
              </Button>
              
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/editor/${post.id}`)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} className="leading-relaxed" />
        </div>

        {/* Post Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Geschrieben mit 🍞 und Liebe bei Bread
            </p>
            
            <div>
              <Link 
                to={`/profile/${post.authorUsername}`}
                className="text-primary hover:underline"
              >
                Mehr Posts von {post.authorDisplayName} →
              </Link>
            </div>
          </div>
        </footer>
      </article>

      {/* Related Posts */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Entdecke mehr Gedanken</h3>
            <p className="text-muted-foreground mb-4">
              Stöbere durch weitere Posts und lass dich inspirieren
            </p>
            <Link to="/">
              <Button variant="outline">Zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Post;
