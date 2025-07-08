
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useBreadGPT } from '@/hooks/useBreadGPT';
import { useToast } from '@/hooks/use-toast';

const BreadGPT = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { askBreadGPT, loading, cooldownUntil, checkCooldown } = useBreadGPT();
  const { toast } = useToast();

  useEffect(() => {
    checkCooldown();
  }, []);

  // Typing effect - FIXED: Start from index 0 instead of 1
  useEffect(() => {
    if (answer && !isTyping) {
      setIsTyping(true);
      setDisplayedAnswer('');
      let index = 0;
      const interval = setInterval(() => {
        if (index < answer.length) {
          setDisplayedAnswer(prev => prev + answer[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [answer]);

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
      setAnswer(response);
      setQuestion('');
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
    return `Cooldown: ${remainingSeconds}s`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🥖</div>
        <h1 className="text-3xl font-bold mb-2">BreadGPT</h1>
        <p className="text-muted-foreground">
          Ein philosophisch-albernes, KI-ähnliches sprechendes Brot
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Stelle dem Brot eine Frage..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading || (cooldownUntil && new Date() < cooldownUntil)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!question.trim() || loading || (cooldownUntil && new Date() < cooldownUntil)}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🍞'}
            </Button>
          </div>
          
          {getCooldownText() && (
            <div className="text-sm text-orange-600 text-center">
              {getCooldownText()}
            </div>
          )}
        </form>

        {displayedAnswer && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${isTyping ? 'animate-bounce' : ''}`}>🥖</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 mb-1">BreadGPT sagt:</p>
                <p className="text-gray-700">
                  {displayedAnswer}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>🕒 Eine Frage alle 30 Sekunden • 🎭 Verschiedene Stimmungen je nach Frage</p>
        <p>✨ Probiere Wörter wie "toast", "baguette" oder "lovable" aus!</p>
      </div>
    </div>
  );
};

export default BreadGPT;
