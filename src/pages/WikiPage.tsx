
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import { BookOpen, Edit2, History, Plus, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WikiPage {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface WikiEdit {
  id: string;
  word_position: number;
  old_word: string | null;
  new_word: string;
  created_at: string;
  user_id: string;
}

const WikiPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [editingWord, setEditingWord] = useState<number | null>(null);
  const [newWord, setNewWord] = useState('');
  const [lastEdit, setLastEdit] = useState<Date | null>(null);
  const [edits, setEdits] = useState<WikiEdit[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchEdits(selectedPage.id);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
      if (data && data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching wiki pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEdits = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('wiki_edits')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEdits(data || []);
    } catch (error) {
      console.error('Error fetching edits:', error);
    }
  };

  const canEdit = () => {
    if (!user) return false;
    if (!lastEdit) return true;
    const now = new Date();
    const timeDiff = (now.getTime() - lastEdit.getTime()) / 1000;
    return timeDiff >= 30;
  };

  const handleWordClick = (wordIndex: number, word: string) => {
    if (!canEdit()) {
      const timeLeft = 30 - Math.floor((new Date().getTime() - (lastEdit?.getTime() || 0)) / 1000);
      toast({
        title: "Cooldown aktiv",
        description: `Du kannst in ${timeLeft} Sekunden das nächste Wort bearbeiten.`,
        variant: "destructive"
      });
      return;
    }

    setEditingWord(wordIndex);
    setNewWord(word);
  };

  const handleWordSave = async () => {
    if (!selectedPage || !user || editingWord === null) return;

    const words = selectedPage.content.split(/(\s+)/);
    const oldWord = words[editingWord];

    if (newWord.trim() === oldWord.trim()) {
      setEditingWord(null);
      return;
    }

    try {
      // Record the edit
      const { error: editError } = await supabase
        .from('wiki_edits')
        .insert({
          page_id: selectedPage.id,
          user_id: user.id,
          word_position: editingWord,
          old_word: oldWord,
          new_word: newWord.trim()
        });

      if (editError) throw editError;

      // Update the page content
      words[editingWord] = newWord.trim();
      const newContent = words.join('');

      const { error: updateError } = await supabase
        .from('wiki_pages')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (updateError) throw updateError;

      // Update local state
      setSelectedPage({
        ...selectedPage,
        content: newContent,
        updated_at: new Date().toISOString()
      });

      setLastEdit(new Date());
      setEditingWord(null);
      fetchEdits(selectedPage.id);

      // Update user stats
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          wiki_contributions: 1
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      toast({
        title: "Wort geändert!",
        description: `"${oldWord}" wurde zu "${newWord.trim()}" geändert.`
      });

    } catch (error) {
      console.error('Error updating word:', error);
      toast({
        title: "Fehler",
        description: "Das Wort konnte nicht geändert werden.",
        variant: "destructive"
      });
    }
  };

  const createNewPage = async () => {
    if (!user || !newPageTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('wiki_pages')
        .insert({
          title: newPageTitle.trim(),
          content: 'Diese Seite wartet darauf, von der Community bearbeitet zu werden. Klicke auf ein Wort, um es zu ändern!'
        });

      if (error) throw error;

      setNewPageTitle('');
      await fetchPages();
      toast({
        title: "Seite erstellt!",
        description: `Die Wiki-Seite "${newPageTitle.trim()}" wurde erstellt.`
      });
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Fehler",
        description: "Die Seite konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const renderEditableContent = (content: string) => {
    const words = content.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.trim() === '') return <span key={index}>{word}</span>;
      
      const isEditing = editingWord === index;
      
      if (isEditing) {
        return (
          <Input
            key={index}
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onBlur={handleWordSave}
            onKeyPress={(e) => e.key === 'Enter' && handleWordSave()}
            className="inline-block w-auto min-w-[50px] h-auto p-1 mx-1 text-sm"
            autoFocus
          />
        );
      }

      return (
        <span
          key={index}
          onClick={() => handleWordClick(index, word)}
          className={`cursor-pointer hover:bg-primary/10 px-1 rounded transition-colors ${
            user ? 'hover:shadow-sm' : 'cursor-default'
          }`}
          title={user ? 'Klicken zum Bearbeiten' : 'Anmeldung erforderlich'}
        >
          {word}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-20 flex items-center justify-center">
          <p className="text-muted-foreground">Lade Wiki...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Community Wiki
          </h1>
          <p className="text-muted-foreground">
            Gemeinsam erstelltes Wissen. Jeder kann alle 30 Sekunden ein Wort bearbeiten.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with pages */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Wiki-Seiten</h2>
                {user && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Neue Wiki-Seite</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Seitentitel..."
                          value={newPageTitle}
                          onChange={(e) => setNewPageTitle(e.target.value)}
                        />
                        <Button onClick={createNewPage} className="w-full">
                          Seite erstellen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-2">
                {pages.map((page) => (
                  <Button
                    key={page.id}
                    variant={selectedPage?.id === page.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedPage(page)}
                  >
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(page.updated_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {selectedPage ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPage.title}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        {edits.length} Änderungen
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="text-base leading-relaxed">
                        {renderEditableContent(selectedPage.content)}
                      </div>
                    </div>
                    
                    {!user && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Melde dich an, um Wörter zu bearbeiten und zur Community beizutragen!
                        </p>
                      </div>
                    )}
                    
                    {user && !canEdit() && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Cooldown aktiv. Du kannst in {30 - Math.floor((new Date().getTime() - (lastEdit?.getTime() || 0)) / 1000)} Sekunden das nächste Wort bearbeiten.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent edits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Letzte Änderungen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {edits.length > 0 ? (
                      <div className="space-y-3">
                        {edits.slice(0, 10).map((edit) => (
                          <div key={edit.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {edit.old_word ? (
                                  <>
                                    "<span className="line-through text-muted-foreground">{edit.old_word}</span>" → 
                                    "<span className="font-medium">{edit.new_word}</span>"
                                  </>
                                ) : (
                                  <>Neues Wort: "<span className="font-medium">{edit.new_word}</span>"</>
                                )}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(edit.created_at).toLocaleString('de-DE')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Noch keine Änderungen an dieser Seite.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Wähle eine Wiki-Seite</h3>
                  <p className="text-muted-foreground">
                    Wähle eine Seite aus der Seitenleiste aus, um sie zu lesen und zu bearbeiten.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WikiPage;
