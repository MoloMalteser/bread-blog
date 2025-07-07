
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
}

export const useSocial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch friends and following on component mount
  useEffect(() => {
    if (user) {
      fetchFriendsAndFollowing();
    }
  }, [user]);

  const fetchFriendsAndFollowing = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch following relationships
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            username,
            bio
          )
        `)
        .eq('follower_id', user.id);

      if (followsError) {
        console.error('Error fetching follows:', followsError);
        return;
      }

      if (followsData) {
        const friendProfiles = followsData
          .map(follow => follow.profiles)
          .filter(profile => profile !== null) as UserProfile[];
        
        const followingIds = followsData.map(follow => follow.following_id);
        
        setFriends(friendProfiles);
        setFollowing(followingIds);
      }
    } catch (error) {
      console.error('Error in fetchFriendsAndFollowing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Like functionality
  const toggleLike = async (postId: string) => {
    if (!user) return false;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Error unliking post:', error);
        return false;
      }
      return false; // unliked
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        console.error('Error liking post:', error);
        return false;
      }
      return true; // liked
    }
  };

  // Get like count and user's like status for a post
  const getLikeInfo = async (postId: string) => {
    const { data: likes, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching likes:', error);
      return { count: 0, isLiked: false };
    }

    const count = likes?.length || 0;
    const isLiked = user ? likes?.some(like => like.user_id === user.id) || false : false;

    return { count, isLiked };
  };

  // Comment functionality
  const addComment = async (postId: string, content: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      })
      .select(`
        *,
        profiles (
          username
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler beim Kommentieren",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    return data;
  };

  // Get comments for a post
  const getComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          username
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  };

  // Follow functionality
  const toggleFollow = async (userId: string) => {
    if (!user || user.id === userId) return false;

    setLoading(true);
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('id', existingFollow.id);

        if (error) {
          console.error('Error unfollowing user:', error);
          toast({
            title: "Fehler",
            description: error.message,
            variant: "destructive"
          });
          return false;
        }
        
        // Update local state
        await fetchFriendsAndFollowing();
        return false; // unfollowed
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) {
          console.error('Error following user:', error);
          toast({
            title: "Fehler",
            description: error.message,
            variant: "destructive"
          });
          return false;
        }

        // Update local state
        await fetchFriendsAndFollowing();
        return true; // followed
      }
    } finally {
      setLoading(false);
    }
  };

  // Get follow status
  const getFollowStatus = async (userId: string) => {
    if (!user || user.id === userId) return false;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    return !!data;
  };

  // Increment view count
  const incrementViewCount = async (postId: string) => {
    await supabase.rpc('increment_view_count', { post_id: postId });
  };

  return {
    friends,
    following,
    loading,
    toggleLike,
    getLikeInfo,
    addComment,
    getComments,
    toggleFollow,
    getFollowStatus,
    incrementViewCount
  };
};
