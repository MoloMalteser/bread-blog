
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import { BookOpen, Edit2, History, Plus, Clock, User, Search, Shuffle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDailyMissions } from '@/hooks/useDailyMissions';

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
  const { updateMissionProgress } = useDailyMissions();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [editingWord, setEditingWord] = useState<number | null>(null);
  const [newWord, setNewWord] = useState('');
  const [lastEdit, setLastEdit] = useState<Date | null>(null);
  const [edits, setEdits] = useState<WikiEdit[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchEdits(selectedPage.id);
    }
  }, [selectedPage]);

  useEffect(() => {
    // Filter pages based on search query
    if (searchQuery.trim() === '') {
      setFilteredPages(pages);
    } else {
      const filtered = pages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    }
  }, [searchQuery, pages]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
      setFilteredPages(data || []);
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

      // Update mission progress
      await updateMissionProgress('wiki_edit', 1);

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

  const addWordAfter = (wordIndex: number) => {
    if (!canEdit()) {
      const timeLeft = 30 - Math.floor((new Date().getTime() - (lastEdit?.getTime() || 0)) / 1000);
      toast({
        title: "Cooldown aktiv",
        description: `Du kannst in ${timeLeft} Sekunden ein Wort hinzufügen.`,
        variant: "destructive"
      });
      return;
    }

    const words = selectedPage?.content.split(/(\s+)/) || [];
    const insertIndex = wordIndex + 1;
    
    // Insert a space and then allow editing of a new word
    words.splice(insertIndex, 0, ' ', '');
    setEditingWord(insertIndex + 1);
    setNewWord('');
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

  const getRandomPage = () => {
    if (filteredPages.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredPages.length);
    setSelectedPage(filteredPages[randomIndex]);
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
        <span key={index} className="relative group">
          <span
            onClick={() => handleWordClick(index, word)}
            className={`cursor-pointer hover:bg-primary/10 px-1 rounded transition-colors ${
              user ? 'hover:shadow-sm' : 'cursor-default'
            }`}
            title={user ? 'Klicken zum Bearbeiten' : 'Anmeldung erforderlich'}
          >
            {word}
          </span>
          {user && (
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 absolute -top-6 left-0 h-5 w-5 p-0 text-xs"
              onClick={() => addWordAfter(index)}
              title="Wort nach diesem hinzufügen"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
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
        {/* Logo und Titel */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥖</div>
          <h1 className="text-4xl font-bold mb-4">Breadipedia</h1>
          
          {/* Suchleiste */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Artikel suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={getRandomPage} title="Zufälliger Artikel">
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Erklärung */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>So funktioniert's:</strong> Klicke auf ein Wort um es zu bearbeiten. 
                Nutze die <Plus className="inline h-3 w-3" />-Buttons um neue Wörter hinzuzufügen. 
                Nur ein Edit alle 30 Sekunden möglich. Hilf mit, das Wissen der Community zu erweitern!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mit Seiten */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Artikel ({filteredPages.length})</h2>
                {user && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Neuer Artikel</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Titel des Artikels..."
                          value={newPageTitle}
                          onChange={(e) => setNewPageTitle(e.target.value)}
                        />
                        <Button onClick={createNewPage} className="w-full">
                          Artikel erstellen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPages.map((page) => (
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

          {/* Hauptinhalt */}
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

                {/* Letzte Änderungen */}
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
                        Noch keine Änderungen an diesem Artikel.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Wähle einen Artikel</h3>
                  <p className="text-muted-foreground">
                    Wähle einen Artikel aus der Seitenleiste aus, um ihn zu lesen und zu bearbeiten.
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
