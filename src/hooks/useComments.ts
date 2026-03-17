import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取配方评论
  const fetchComments = useCallback(async (recipeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (err) {
      console.error('获取评论失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加评论
  const addComment = useCallback(async (userId: string, recipeId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
          content,
        })
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data as Comment]);
      return data as Comment;
    } catch (err) {
      console.error('添加评论失败:', err);
      throw err;
    }
  }, []);

  // 删除评论
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('删除评论失败:', err);
      throw err;
    }
  }, []);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
  };
}
