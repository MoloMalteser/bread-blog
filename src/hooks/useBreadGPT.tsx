
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDailyMissions } from '@/hooks/useDailyMissions';

export const useBreadGPT = () => {
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const { user } = useAuth();
  const { updateMissionProgress } = useDailyMissions();

  const checkCooldown = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('breadgpt_cooldowns')
        .select('last_question_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking cooldown:', error);
        return true;
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
    } catch (error) {
      console.error('Error checking cooldown:', error);
      return false;
    }
  };

  const askBreadGPT = async (question: string): Promise<string | null> => {
    if (!user) return null;

    setLoading(true);

    // Check cooldown first
    const canAsk = await checkCooldown();
    if (!canAsk) {
      setLoading(false);
      return null;
    }

    try {
      // Update cooldown immediately
      await supabase
        .from('breadgpt_cooldowns')
        .upsert({
          user_id: user.id,
          last_question_at: new Date().toISOString()
        });

      // Set cooldown for UI
      setCooldownUntil(new Date(Date.now() + 30000));

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('breadgpt-chat', {
        body: { question }
      });

      if (error) {
        console.error('Edge function error:', error);
        return 'Mein Ofen ist gerade kaputt... Versuche es später nochmal! 🥖';
      }

      // Update user stats and mission progress
      await updateMissionProgress('breadgpt_question', 1);
      
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('breadgpt_questions')
        .eq('user_id', user.id)
        .single();

      const currentQuestions = statsData?.breadgpt_questions || 0;
      
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          breadgpt_questions: currentQuestions + 1
        });

      setLoading(false);
      return data?.text || 'Hmm... *Brotkrümel fallen* ... Ich verstehe nicht ganz. Probiere eine andere Frage! 🥖';
    } catch (error) {
      console.error('Error asking BreadGPT:', error);
      setLoading(false);
      return 'Meine Krümel sind heute besonders störrisch... 🍞';
    }
  };

  // Auto-update cooldown timer
  useEffect(() => {
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      if (new Date() >= cooldownUntil) {
        setCooldownUntil(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  return {
    askBreadGPT,
    loading,
    cooldownUntil,
    checkCooldown
  };
};
