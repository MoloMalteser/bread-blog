import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDailyMissions } from '@/hooks/useDailyMissions';

export const useBreadGPT = () => {
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const { user } = useAuth();
  const { updateMissionProgress } = useDailyMissions();

  // Optional: statisch oder dynamisch per Supabase (hier als Fallback)
  const [hfToken, setHfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('key', 'HUGGINGFACE_TOKEN')
        .single();

      if (!error && data?.value) {
        setHfToken(data.value);
      } else {
        console.warn('Could not load Hugging Face token from Supabase, falling back to env');
        setHfToken(import.meta.env.VITE_HUGGINGFACE_TOKEN || null); // falls du Vite verwendest
      }
    };

    fetchToken();
  }, []);

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
    if (!user || !hfToken) return null;

    setLoading(true);
    const canAsk = await checkCooldown();
    if (!canAsk) {
      setLoading(false);
      return null;
    }

    try {
      await supabase.from('breadgpt_cooldowns').upsert({
        user_id: user.id,
        last_question_at: new Date().toISOString()
      });
      setCooldownUntil(new Date(Date.now() + 30000));

      const breadPrompt = `Du bist BreadGPT, ein philosophisches sprechendes Brot. Antworte in maximal 2-3 Sätzen auf Deutsch. Sei kreativ, manchmal witzig, manchmal tiefgreifend. Verwende gelegentlich Brot-Metaphern und Brot-Emojis. Frage: ${question}`;

      const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen1.5-4B-Chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: breadPrompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
            top_p: 0.9,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        console.error('Hugging Face API error:', response.status);
        setLoading(false);
        return 'Mein Ofen ist gerade kaputt... Versuche es später nochmal! 🥖';
      }

      const data = await response.json();
      let generatedText = '';

      if (Array.isArray(data) && data[0]?.generated_text) {
        generatedText = data[0].generated_text.replace(breadPrompt, '').trim();
      } else if (data.generated_text) {
        generatedText = data.generated_text.replace(breadPrompt, '').trim();
      }

      generatedText = generatedText.replace(/^[\s\n]*/, '').replace(/^\w+:\s*/, '');

      if (!generatedText || generatedText.length < 10) {
        const fallbackResponses = [
          'Das Leben ist wie Brot backen – es braucht Zeit, Geduld und die richtige Temperatur! 🥖',
          'Manchmal muss man sich fallen lassen, wie eine Scheibe Toast in den Toaster. 🍞',
          'Jeder Krümel erzählt eine Geschichte... Was ist deine? ✨',
          'In der Wärme des Ofens finde ich meine Antworten. Und du? 🔥'
        ];
        generatedText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

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
      return generatedText;
    } catch (error) {
      console.error('Fehler beim Aufruf der AI:', error);
      setLoading(false);
      return 'Meine Krümel sind heute besonders störrisch... 🍞';
    }
  };

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
