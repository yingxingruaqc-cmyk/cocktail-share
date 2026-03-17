import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe, SearchFilters, CreateRecipeFormData } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有配方
  const fetchRecipes = useCallback(async (filters?: Partial<SearchFilters>) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('recipes')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      // 应用筛选条件
      if (filters?.style) {
        query = query.eq('style', filters.style);
      }

      if (filters?.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecipes(data as Recipe[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取配方失败');
      console.error('获取配方失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取单个配方详情
  const fetchRecipeById = useCallback(async (id: string): Promise<Recipe | null> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Recipe;
    } catch (err) {
      console.error('获取配方详情失败:', err);
      return null;
    }
  }, []);

  // 获取用户发布的配方
  const fetchUserRecipes = useCallback(async (userId: string): Promise<Recipe[]> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Recipe[];
    } catch (err) {
      console.error('获取用户配方失败:', err);
      return [];
    }
  }, []);

  // 创建新配方
  const createRecipe = useCallback(async (userId: string, formData: CreateRecipeFormData): Promise<string | null> => {
    try {
      console.log('=== 开始创建配方 ===');
      console.log('用户ID:', userId);
      console.log('完整配方数据:', JSON.stringify(formData, null, 2));

      // 准备插入数据，确保字段存在
      const insertData: any = {
        user_id: userId,
        title: formData.title,
        image_url: formData.image_url,
        style: formData.style,
        description: formData.description || null,
        ingredients: formData.ingredients,
        steps: formData.steps,
        rating: formData.rating || null,
        review: formData.review || null,
      };

      // 尝试添加新字段（如果数据库表有这些字段）
      insertData.base_spirit = formData.base_spirit;
      insertData.flavor_tags = formData.flavor_tags;
      insertData.texture_tag = formData.texture_tag;
      insertData.view_count = 0;
      insertData.is_approved = true;

      console.log('准备插入的数据:', insertData);

      const { data, error } = await supabase
        .from('recipes')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Supabase 插入错误:', error);
        console.error('错误代码:', error.code);
        console.error('错误详情:', error.details);
        console.error('错误提示:', error.hint);
        throw new Error(`数据库错误: ${error.message} (${error.code})`);
      }

      console.log('✅ 配方创建成功，ID:', data.id);
      return data.id;
    } catch (err: any) {
      console.error('❌ 创建配方失败:', err);
      throw err;
    }
  }, []);

  // 更新配方
  const updateRecipe = useCallback(async (recipeId: string, formData: Partial<CreateRecipeFormData>): Promise<void> => {
    try {
      console.log('正在更新配方，ID:', recipeId);
      console.log('更新数据:', formData);

      const { error } = await supabase
        .from('recipes')
        .update({
          title: formData.title,
          image_url: formData.image_url,
          style: formData.style,
          base_spirit: formData.base_spirit,
          flavor_tags: formData.flavor_tags,
          texture_tag: formData.texture_tag,
          description: formData.description || null,
          ingredients: formData.ingredients,
          steps: formData.steps,
          rating: formData.rating || null,
          review: formData.review || null,
          // 注意：不更新 view_count 和 created_at
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId);

      if (error) {
        console.error('Supabase 更新错误:', error);
        throw error;
      }

      console.log('配方更新成功');
    } catch (err) {
      console.error('更新配方失败:', err);
      throw err;
    }
  }, []);

  // 删除配方
  const deleteRecipe = useCallback(async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
    } catch (err) {
      console.error('删除配方失败:', err);
      throw err;
    }
  }, []);

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    fetchUserRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
