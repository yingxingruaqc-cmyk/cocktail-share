import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types';

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 获取用户收藏的配方
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          recipe:recipes(*, profile:profiles(*))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favoriteRecipes = data
        .map((item: any) => item.recipe)
        .filter(Boolean);

      setFavorites(favoriteRecipes);
      setFavoriteIds(new Set(favoriteRecipes.map((r: Recipe) => r.id)));
    } catch (err) {
      console.error('获取收藏失败:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 检查是否已收藏
  const isFavorited = useCallback((recipeId: string) => {
    return favoriteIds.has(recipeId);
  }, [favoriteIds]);

  // 添加收藏
  const addFavorite = useCallback(async (recipeId: string) => {
    if (!userId) throw new Error('请先登录');

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
        });

      if (error) throw error;

      setFavoriteIds(prev => new Set([...prev, recipeId]));
      await fetchFavorites();
    } catch (err) {
      console.error('添加收藏失败:', err);
      throw err;
    }
  }, [userId, fetchFavorites]);

  // 取消收藏
  const removeFavorite = useCallback(async (recipeId: string) => {
    if (!userId) throw new Error('请先登录');

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });
      await fetchFavorites();
    } catch (err) {
      console.error('取消收藏失败:', err);
      throw err;
    }
  }, [userId, fetchFavorites]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (recipeId: string) => {
    if (isFavorited(recipeId)) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  }, [isFavorited, addFavorite, removeFavorite]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    fetchFavorites,
  };
}
