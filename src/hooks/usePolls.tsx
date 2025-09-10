import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Poll {
  id: string;
  post_id: string;
  title: string;
  options: string[];
  votes: Record<string, number>;
  created_at: string;
  expires_at?: string;
}

interface PollRow {
  id: string;
  post_id: string;
  title: string;
  options: any;
  votes: any;
  created_at: string;
  expires_at?: string;
}

export const usePolls = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPoll = async (postId: string, title: string, options: string[]): Promise<Poll | null> => {
    if (!user) return null;

    if (options.length < 2) {
      toast({
        title: "Fehler",
        description: "Eine Umfrage braucht mindestens 2 Optionen",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          post_id: postId,
          title,
          options,
          votes: {}
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        options: Array.isArray(data.options) ? data.options : [],
        votes: typeof data.votes === 'object' && data.votes ? data.votes : {}
      } as Poll;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Umfrage",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPollsForPost = async (postId: string): Promise<Poll[]> => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;
      return (data || []).map((row: PollRow) => ({
        ...row,
        options: Array.isArray(row.options) ? row.options : [],
        votes: typeof row.votes === 'object' && row.votes ? row.votes : {}
      })) as Poll[];
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  };

  const voteOnPoll = async (pollId: string, optionIndex: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Fehler", 
        description: "Du musst angemeldet sein, um abzustimmen",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('vote_on_poll', {
        poll_id: pollId,
        option_index: optionIndex
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Deine Stimme wurde abgegeben"
      });
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Abstimmen",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPollResults = (poll: Poll) => {
    const totalVotes = Object.keys(poll.votes).length;
    const optionCounts = new Array(poll.options.length).fill(0);
    
    Object.values(poll.votes).forEach((optionIndex) => {
      if (optionIndex >= 0 && optionIndex < poll.options.length) {
        optionCounts[optionIndex]++;
      }
    });

    return {
      totalVotes,
      optionCounts,
      percentages: optionCounts.map(count => 
        totalVotes > 0 ? (count / totalVotes) * 100 : 0
      )
    };
  };

  const hasUserVoted = (poll: Poll): number | null => {
    if (!user) return null;
    const userVote = poll.votes[user.id];
    return userVote !== undefined ? userVote : null;
  };

  return {
    createPoll,
    getPollsForPost,
    voteOnPoll,
    getPollResults,
    hasUserVoted,
    loading
  };
};