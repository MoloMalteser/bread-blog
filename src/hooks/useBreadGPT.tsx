
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDailyMissions } from '@/hooks/useDailyMissions';

// Global cooldown state
let globalCooldownUntil: Date | null = null;
let globalCooldownCallbacks: Set<(cooldown: Date | null) => void> = new Set();

const updateGlobalCooldown = (cooldown: Date | null) => {
  globalCooldownUntil = cooldown;
  globalCooldownCallbacks.forEach(callback => callback(cooldown));
};

export const useBreadGPT = () => {
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(globalCooldownUntil);
  const { user } = useAuth();
  const { updateMissionProgress } = useDailyMissions();

  // Subscribe to global cooldown updates
  useEffect(() => {
    const callback = (cooldown: Date | null) => setCooldownUntil(cooldown);
    globalCooldownCallbacks.add(callback);
    
    return () => {
      globalCooldownCallbacks.delete(callback);
    };
  }, []);

  const checkCooldown = async () => {
    if (!user) return true;

    try {
      // Check if user is a supporter (no cooldown)
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscription?.plan === 'supporter') {
        updateGlobalCooldown(null);
        return true;
      }

      const { data, error } = await supabase
        .from('breadgpt_cooldowns')
        .select('last_question_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking cooldown:', error);
        return true;
      }

      if (data) {
        const lastQuestion = new Date(data.last_question_at);
        const now = new Date();
        const diffSeconds = (now.getTime() - lastQuestion.getTime()) / 1000;
        
        // 1 hour cooldown for non-supporters
        if (diffSeconds < 3600) {
          const cooldownEnd = new Date(lastQuestion.getTime() + 3600000);
          updateGlobalCooldown(cooldownEnd);
          return false;
        }
      }

      updateGlobalCooldown(null);
      return true;
    } catch (error) {
      console.error('Error checking cooldown:', error);
      return true;
    }
  };

  // Check cooldown on mount and when user changes
  useEffect(() => {
    if (user) {
      checkCooldown();
    }
  }, [user]);

  // Auto-update cooldown timer
  useEffect(() => {
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= cooldownUntil) {
        updateGlobalCooldown(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const askBreadGPT = async (question: string): Promise<string | null> => {
    if (!user) return null;
    if (loading) return null;

    // Check cooldown before proceeding
    const canAsk = await checkCooldown();
    if (!canAsk) {
      return null;
    }

    setLoading(true);

    try {
      // Update cooldown in database
      await supabase
        .from('breadgpt_cooldowns')
        .upsert({
          user_id: user.id,
          last_question_at: new Date().toISOString()
        });

      // Set global cooldown (1 hour for non-supporters, checked by checkCooldown)
      await checkCooldown();

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('breadgpt-chat', {
        body: { question }
      });

      if (error) {
        console.error('Edge function error:', error);
        return 'Entschuldigung, ich kann momentan nicht antworten. Versuche es später nochmal.';
      }

      // Update mission progress
      await updateMissionProgress('breadgpt_question', 1);
      
      // Update user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('breadgpt_questions')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentQuestions = statsData?.breadgpt_questions || 0;
      
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          breadgpt_questions: currentQuestions + 1
        });

      return data?.text || 'Ich konnte keine passende Antwort finden. Versuche es mit einer anderen Frage.';
    } catch (error) {
      console.error('Error asking BreadGPT:', error);
      return 'Es gab einen technischen Fehler. Bitte versuche es erneut.';
    } finally {
      setLoading(false);
    }
  };

  return {
    askBreadGPT,
    loading,
    cooldownUntil,
    checkCooldown
  };
};
