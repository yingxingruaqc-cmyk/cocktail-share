import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export function useFollows(userId: string | null) {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [followingList, setFollowingList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取关注列表
  const fetchFollowing = useCallback(async () => {
    if (!userId) {
      setFollowing(new Set());
      setFollowingList([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:profiles!following_id(*)
        `)
        .eq('follower_id', userId);

      if (error) throw error;

      const profiles = data.map((item: any) => item.following).filter(Boolean);
      setFollowingList(profiles);
      setFollowing(new Set(profiles.map((p: Profile) => p.id)));
    } catch (err) {
      console.error('获取关注列表失败:', err);
    }
  }, [userId]);

  // 获取粉丝列表
  const fetchFollowers = useCallback(async () => {
    if (!userId) {
      setFollowers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follower_id(*)
        `)
        .eq('following_id', userId);

      if (error) throw error;

      const profiles = data.map((item: any) => item.follower).filter(Boolean);
      setFollowers(profiles);
    } catch (err) {
      console.error('获取粉丝列表失败:', err);
    }
  }, [userId]);

  // 检查是否已关注
  const isFollowing = useCallback((targetUserId: string) => {
    return following.has(targetUserId);
  }, [following]);

  // 关注用户
  const followUser = useCallback(async (targetUserId: string) => {
    if (!userId) throw new Error('请先登录');
    if (userId === targetUserId) throw new Error('不能关注自己');

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: targetUserId,
        });

      if (error) throw error;

      setFollowing(prev => new Set([...prev, targetUserId]));
      await fetchFollowing();
    } catch (err) {
      console.error('关注失败:', err);
      throw err;
    }
  }, [userId, fetchFollowing]);

  // 取消关注
  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!userId) throw new Error('请先登录');

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setFollowing(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      await fetchFollowing();
    } catch (err) {
      console.error('取消关注失败:', err);
      throw err;
    }
  }, [userId, fetchFollowing]);

  // 切换关注状态
  const toggleFollow = useCallback(async (targetUserId: string) => {
    if (isFollowing(targetUserId)) {
      await unfollowUser(targetUserId);
    } else {
      await followUser(targetUserId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchFollowing(), fetchFollowers()]);
    setLoading(false);
  }, [fetchFollowing, fetchFollowers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    following,
    followers,
    followingList,
    loading,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    fetchFollowing,
    fetchFollowers,
  };
}
