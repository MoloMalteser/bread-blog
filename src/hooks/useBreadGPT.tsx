
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('breadgpt-chat', {
        body: { question }
      });

      if (error) {
        console.error('Edge function error:', error);
        return 'Mein Ofen ist gerade kaputt... Versuche es später nochmal! 🥖';
      }

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
      return data?.text || 'Hmm... *Brotkrümel fallen* ... Ich verstehe nicht ganz. Probiere eine andere Frage! 🥖';
    } catch (error) {
      console.error('Error asking BreadGPT:', error);
      setLoading(false);
      return 'Meine Krümel sind heute besonders störrisch... 🍞';
    }
  };

  return {
    askBreadGPT,
    loading,
    cooldownUntil,
    checkCooldown
  };
};
