
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useBreadGPT } from '@/hooks/useBreadGPT';
import { useToast } from '@/hooks/use-toast';

interface EditorBreadGPTProps {
  onInsertText: (text: string) => void;
}

const EditorBreadGPT = ({ onInsertText }: EditorBreadGPTProps) => {
  const [question, setQuestion] = useState('');
  const { askBreadGPT, loading, cooldownUntil } = useBreadGPT();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    if (cooldownUntil && new Date() < cooldownUntil) {
      const remainingSeconds = Math.ceil((cooldownUntil.getTime() - new Date().getTime()) / 1000);
      toast({
        title: "Brot braucht eine Pause! 🥖",
        description: `Noch ${remainingSeconds} Sekunden warten...`,
        variant: "destructive"
      });
      return;
    }

    const response = await askBreadGPT(question.trim());
    if (response) {
      onInsertText(response);
      setQuestion('');
      toast({
        title: "Text eingefügt! 🍞",
        description: "BreadGPT hat Text zu deinem Artikel hinzugefügt",
      });
    } else {
      toast({
        title: "Brot ist müde 😴",
        description: "Versuche es in 30 Sekunden nochmal!",
        variant: "destructive"
      });
    }
  };

  const getCooldownText = () => {
    if (!cooldownUntil) return null;
    const now = new Date();
    if (now >= cooldownUntil) return null;
    
    const remainingSeconds = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
    return `${remainingSeconds}s`;
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium">Write with BreadGPT</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Frage BreadGPT um Hilfe beim Schreiben..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading || (cooldownUntil && new Date() < cooldownUntil)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!question.trim() || loading || (cooldownUntil && new Date() < cooldownUntil)}
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🍞'}
          </Button>
        </div>
        
        {getCooldownText() && (
          <div className="text-sm text-orange-600 text-center">
            Cooldown: {getCooldownText()}
          </div>
        )}
      </form>
      
      <p className="text-xs text-muted-foreground mt-2">
        BreadGPT kann dir beim Schreiben helfen. Der Text wird automatisch eingefügt.
      </p>
    </Card>
  );
};

export default EditorBreadGPT;
