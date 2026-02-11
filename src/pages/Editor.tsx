
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Globe, Theater, Image, Mic, BarChart3, Type, Sparkles } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import RichContentRenderer from '@/components/RichContentRenderer';
import { usePolls } from '@/hooks/usePolls';
import { useLanguage } from '@/hooks/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';

type ContentType = 'text' | 'image' | 'voice' | 'poll';

const CONTENT_TYPES = [
  { id: 'text' as ContentType, icon: Type, label: 'Text', emoji: '✍️' },
  { id: 'image' as ContentType, icon: Image, label: 'Photo', emoji: '📸' },
  { id: 'voice' as ContentType, icon: Mic, label: 'Voice', emoji: '🎙️' },
  { id: 'poll' as ContentType, icon: BarChart3, label: 'Poll', emoji: '📊' },
];

const Editor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { posts, createPost, updatePost } = usePosts();
  const { createPoll } = usePolls();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';

  useEffect(() => {
    if (!user && !isAnonymousUser) {
      navigate(`/${language}/auth`);
      return;
    }
    if (postId && user) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setIsPublic(post.is_public);
        setIsAnonymous(post.is_anonymous || false);
      }
    }
  }, [postId, posts, user, isAnonymousUser, navigate, language]);

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({ title: language === 'de' ? "Titel fehlt" : "Title required", variant: "destructive" });
      return;
    }

    if (isAnonymousUser) {
      toast({ title: language === 'de' ? "Bitte anmelden" : "Please sign in", variant: "destructive" });
      navigate(`/${language}/auth`);
      return;
    }

    if (!user) return;
    setIsSaving(true);

    try {
      let finalContent = content;
      
      if (contentType === 'poll' && pollOptions.filter(o => o.trim()).length >= 2) {
        finalContent = `**📊 ${title}**\n${pollOptions.filter(o => o.trim()).map(opt => `🔘 ${opt}`).join('\n')}`;
      }

      if (postId) {
        await updatePost(postId, title.trim(), finalContent.trim(), true, isAnonymous);
      } else {
        await createPost(title.trim(), finalContent.trim(), true, isAnonymous);
      }

      toast({ title: language === 'de' ? "Veröffentlicht! 🥥" : "Published! 🥥" });
      navigate(`/${language}/feed`);
    } catch {
      toast({ title: language === 'de' ? "Fehler" : "Error", variant: "destructive" });
    }
    
    setIsSaving(false);
  };

  if (!user && !isAnonymousUser) return null;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Glass Header */}
      <header className="glass-effect sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <h1 className="font-semibold text-sm">
            {language === 'de' ? 'Erstellen' : 'Create'}
          </h1>

          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!title.trim() || isSaving}
            className="rounded-full gradient-primary text-primary-foreground px-5"
          >
            <Send className="h-4 w-4 mr-1" />
            {language === 'de' ? 'Posten' : 'Post'}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Content Type Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-5 overflow-x-auto pb-1"
        >
          {CONTENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setContentType(type.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                contentType === type.id 
                  ? 'glass-card shadow-sm ring-1 ring-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <span>{type.emoji}</span>
              {type.label}
            </button>
          ))}
        </motion.div>

        {/* Title Input */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Input
            type="text"
            placeholder={language === 'de' ? "Was gibt's Neues?" : "What's happening?"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none px-0 focus-visible:ring-0 h-auto py-2 bg-transparent"
          />
        </motion.div>

        {/* Content Area based on type */}
        <AnimatePresence mode="wait">
          <motion.div
            key={contentType}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {contentType === 'text' && (
              <Textarea
                placeholder={language === 'de' 
                  ? "Teile deine Gedanken...\n\n✨ Markdown wird unterstützt" 
                  : "Share your thoughts...\n\n✨ Markdown supported"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] border-none px-0 resize-none focus-visible:ring-0 text-base leading-relaxed bg-transparent"
              />
            )}

            {contentType === 'image' && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Bild-URL einfügen' : 'Paste image URL'}
                  </p>
                </div>
                <Input
                  placeholder={language === 'de' ? "Bild-URL..." : "Image URL..."}
                  onChange={(e) => setContent(`![Image](${e.target.value})`)}
                  className="rounded-xl"
                />
                <Textarea
                  placeholder={language === 'de' ? "Bildunterschrift..." : "Caption..."}
                  value={content.replace(/!\[.*\]\(.*\)\n?/, '')}
                  onChange={(e) => {
                    const urlMatch = content.match(/!\[.*\]\(.*\)/);
                    setContent((urlMatch?.[0] || '') + '\n' + e.target.value);
                  }}
                  className="min-h-[80px] rounded-xl resize-none"
                  rows={2}
                />
              </div>
            )}

            {contentType === 'voice' && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-8 text-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-5xl mb-3"
                  >
                    🎙️
                  </motion.div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === 'de' ? 'Sprachnotiz-Feature kommt bald' : 'Voice note feature coming soon'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'de' ? 'Schreibe stattdessen einen Text-Post' : 'Write a text post instead'}
                  </p>
                </div>
                <Textarea
                  placeholder={language === 'de' ? "Dein Text..." : "Your text..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
            )}

            {contentType === 'poll' && (
              <div className="space-y-3">
                {pollOptions.map((option, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Input
                      placeholder={`${language === 'de' ? 'Option' : 'Option'} ${i + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[i] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      className="rounded-xl"
                    />
                  </motion.div>
                ))}
                {pollOptions.length < 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="rounded-full text-xs"
                  >
                    + {language === 'de' ? 'Option hinzufügen' : 'Add option'}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Preview */}
        {content && contentType === 'text' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
              {language === 'de' ? 'Vorschau' : 'Preview'}
            </p>
            <div className="glass-card rounded-2xl p-4">
              <RichContentRenderer content={content} />
            </div>
          </motion.div>
        )}

        {/* Privacy Toggle */}
        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
            <div className="glass-card rounded-2xl p-1 flex">
              <button
                onClick={() => { setIsAnonymous(false); setIsPublic(true); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !isAnonymous ? 'gradient-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Globe className="h-4 w-4" />
                {language === 'de' ? 'Öffentlich' : 'Public'}
              </button>
              <button
                onClick={() => { setIsAnonymous(true); setIsPublic(true); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isAnonymous ? 'gradient-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Theater className="h-4 w-4" />
                {language === 'de' ? 'Anonym' : 'Anonymous'}
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Editor;
