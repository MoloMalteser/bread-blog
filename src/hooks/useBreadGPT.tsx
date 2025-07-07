
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BreadGPTAnswer {
  id: string;
  type: string;
  text: string;
  keywords?: string[];
  is_easter_egg?: boolean;
  trigger_word?: string;
}

export const useBreadGPT = () => {
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const { user } = useAuth();

  const checkCooldown = async () => {
    if (!user) return false;

    const { data, error } = await supabase
      .from('breadgpt_cooldowns')
      .select('last_question_at')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking cooldown:', error);
      return false;
    }

    if (data) {
      const lastQuestion = new Date(data.last_question_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - lastQuestion.getTime()) / 1000;
      
      if (diffSeconds < 30) {
        const cooldownEnd = new Date(lastQuestion.getTime() + 30000);
        setCooldownUntil(cooldownEnd);
        return false;
      }
    }

    setCooldownUntil(null);
    return true;
  };

  const askBreadGPT = async (question: string): Promise<string | null> => {
    if (!user) return null;

    setLoading(true);

    // Check cooldown
    const canAsk = await checkCooldown();
    if (!canAsk) {
      setLoading(false);
      return null;
    }

    try {
      // Update cooldown
      await supabase
        .from('breadgpt_cooldowns')
        .upsert({
          user_id: user.id,
          last_question_at: new Date().toISOString()
        });

      // Get answer based on question
      const answer = await getAnswer(question);

      // Update user stats
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          breadgpt_questions: 1
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      setLoading(false);
      return answer;
    } catch (error) {
      console.error('Error asking BreadGPT:', error);
      setLoading(false);
      return null;
    }
  };

  const getAnswer = async (question: string): Promise<string> => {
    const lowerQuestion = question.toLowerCase();

    // Check for easter eggs first
    const { data: easterEggs } = await supabase
      .from('breadgpt_answers')
      .select('*')
      .eq('is_easter_egg', true);

    if (easterEggs) {
      for (const egg of easterEggs) {
        if (egg.trigger_word && lowerQuestion.includes(egg.trigger_word.toLowerCase())) {
          return egg.text;
        }
      }
    }

    // Analyze question for category
    const category = analyzeQuestion(lowerQuestion);

    // Get random answer from category
    const { data: answers } = await supabase
      .from('breadgpt_answers')
      .select('*')
      .eq('type', category)
      .eq('is_easter_egg', false);

    if (answers && answers.length > 0) {
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      return randomAnswer.text;
    }

    return 'Hmm... *Brotkrümel fallen* ... Ich verstehe nicht ganz. Probiere eine andere Frage! 🥖';
  };

  const analyzeQuestion = (question: string): string => {
    // Simple keyword analysis
    const darkWords = ['angst', 'tod', 'trauer', 'dunkel', 'traurig', 'verzweifelt', 'einsam'];
    const funnyWords = ['lustig', 'witzig', 'spaß', 'humor', 'lachen', 'freude'];
    const philosophicalWords = ['leben', 'sinn', 'philosophie', 'existenz', 'warum', 'wie', 'bedeutung'];
    const glitchWords = ['fehler', 'kaputt', 'bug', 'error', 'system', 'computer'];

    if (darkWords.some(word => question.includes(word))) return 'dunkel';
    if (funnyWords.some(word => question.includes(word))) return 'witzig';
    if (philosophicalWords.some(word => question.includes(word))) return 'philosophisch';
    if (glitchWords.some(word => question.includes(word))) return 'glitchy';

    return 'random';
  };

  return {
    askBreadGPT,
    loading,
    cooldownUntil,
    checkCooldown
  };
};
