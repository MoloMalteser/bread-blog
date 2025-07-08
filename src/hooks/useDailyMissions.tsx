
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyMission {
  id: string;
  title: string;
  description: string;
  mission_type: string;
  target_count: number;
  reward_points: number;
  is_active: boolean;
}

interface MissionProgress {
  id: string;
  mission_id: string;
  current_count: number;
  completed_at: string | null;
  date: string;
}

export const useDailyMissions = () => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [progress, setProgress] = useState<MissionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMissions();
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('is_active', true)
        .order('reward_points', { ascending: false });

      if (error) {
        console.error('Error fetching missions:', error);
        setMissions([]);
      } else {
        setMissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
      setMissions([]);
    }
  };

  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_mission_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) {
        console.error('Error fetching progress:', error);
        setProgress([]);
      } else {
        setProgress(data || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const updateMissionProgress = async (missionType: string, count: number = 1) => {
    if (!user) return;

    try {
      const mission = missions.find(m => m.mission_type === missionType);
      if (!mission) return;

      const today = new Date().toISOString().split('T')[0];
      const existingProgress = progress.find(p => p.mission_id === mission.id);

      if (existingProgress) {
        const newCount = existingProgress.current_count + count;
        const isCompleted = newCount >= mission.target_count;

        const { error } = await supabase
          .from('user_mission_progress')
          .update({
            current_count: newCount,
            completed_at: isCompleted && !existingProgress.completed_at ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        // Award points if just completed
        if (isCompleted && !existingProgress.completed_at) {
          await supabase
            .from('user_stats')
            .upsert({
              user_id: user.id,
              total_points: mission.reward_points
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
        }
      } else {
        const isCompleted = count >= mission.target_count;
        
        const { error } = await supabase
          .from('user_mission_progress')
          .insert({
            user_id: user.id,
            mission_id: mission.id,
            current_count: count,
            completed_at: isCompleted ? new Date().toISOString() : null,
            date: today
          });

        if (error) throw error;

        // Award points if completed
        if (isCompleted) {
          await supabase
            .from('user_stats')
            .upsert({
              user_id: user.id,
              total_points: mission.reward_points
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
        }
      }

      await fetchProgress();
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  const getMissionProgress = (missionId: string) => {
    return progress.find(p => p.mission_id === missionId);
  };

  const getCompletedMissions = () => {
    return progress.filter(p => p.completed_at !== null).length;
  };

  const getTotalPoints = async () => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching total points:', error);
        return 0;
      }
      return data?.total_points || 0;
    } catch (error) {
      console.error('Error fetching total points:', error);
      return 0;
    }
  };

  return {
    missions,
    progress,
    loading,
    updateMissionProgress,
    getMissionProgress,
    getCompletedMissions,
    getTotalPoints,
    refreshProgress: fetchProgress
  };
};
