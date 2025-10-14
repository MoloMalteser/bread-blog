import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<'free' | 'supporter'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }

        setPlan((data?.plan as 'free' | 'supporter') || 'free');
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setPlan('free');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const upgradeToSupporter = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan: 'supporter',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error upgrading to supporter:', error);
        return false;
      }

      setPlan('supporter');
      return true;
    } catch (error) {
      console.error('Error upgrading to supporter:', error);
      return false;
    }
  };

  return {
    plan,
    loading,
    isSupporter: plan === 'supporter',
    upgradeToSupporter
  };
};
