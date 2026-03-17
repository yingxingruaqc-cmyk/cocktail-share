import { useState, useMemo, useEffect } from 'react';
import { RecipeCard, LoadingSpinner } from '../components';
import { useRecipes } from '../hooks/useRecipes';
import {
  BASE_SPIRITS,
  FLAVOR_TAGS,
  TEXTURE_TAGS,
  SORT_OPTIONS,
  SORT_ORDERS,
  type SearchFilters,
  type FlavorTag,
  type SortOption,
  type SortOrder,
  type Recipe,
} from '../types';

export function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    ai_query: '',
    style: '',
    base_spirit: '',
    flavor_tags: [],
    texture_tag: '',
    sort_by: '热度',
    sort_order: '降序',
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const { recipes, loading, error, fetchRecipes } = useRecipes();

  // 初始加载配方
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleReset = () => {
    setFilters({
      query: '',
      ai_query: '',
      style: '',
      base_spirit: '',
      flavor_tags: [],
      texture_tag: '',
      sort_by: '热度',
      sort_order: '降序',
    });
  };

  // 过滤和排序配方
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // 只展示已审核通过的配方
    result = result.filter((r) => r.is_approved !== false);

    // 搜索查询
    if (filters.query.trim()) {
      const lowerQuery = filters.query.toLowerCase().trim();
      result = result.filter((recipe) =>
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // 按基底筛选
    if (filters.base_spirit) {
      result = result.filter((recipe) => recipe.base_spirit === filters.base_spirit);
    }

    // 按风味筛选（多选，包含所有选中的风味）
    if (filters.flavor_tags.length > 0) {
      result = result.filter((recipe) =>
        filters.flavor_tags.every((tag) =>
          (recipe.flavor_tags || []).includes(tag)
        )
      );
    }

    // 按口感筛选
    if (filters.texture_tag) {
      result = result.filter((recipe) => recipe.texture_tag === filters.texture_tag);
    }

    // 排序
    result.sort((a: Recipe, b: Recipe) => {
      let comparison = 0;
      if (filters.sort_by === '热度') {
        comparison = (a.view_count || 0) - (b.view_count || 0);
      } else if (filters.sort_by === '发布时间') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return filters.sort_order === '降序' ? -comparison : comparison;
    });

    return result;
  }, [recipes, filters]);

  // 切换风味标签选择
  const toggleFlavorTag = (tag: FlavorTag) => {
    setFilters((prev) => ({
      ...prev,
      flavor_tags: prev.flavor_tags.includes(tag)
        ? prev.flavor_tags.filter((t) => t !== tag)
        : [...prev.flavor_tags, tag],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchRecipes()}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          发现属于你的鸡尾酒配方
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          调酒爱好者的分享社区，探索经典与创新的鸡尾酒世界
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 mb-6">
        {/* 搜索框 */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="输入鸡尾酒名称或描述，如'果香金酒'..."
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsFilterPanelOpen(false);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(false)}
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              搜索
            </button>
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              筛选
              {(filters.base_spirit || filters.texture_tag || filters.flavor_tags.length > 0) && (
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {isFilterPanelOpen && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              重置
            </button>
          </div>

          <div className="space-y-6">
            {/* 排序 */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">排序：</span>
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value as SortOption }))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                value={filters.sort_order}
                onChange={(e) => setFilters((f) => ({ ...f, sort_order: e.target.value as SortOrder }))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
              >
                {SORT_ORDERS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 基底属性 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基底属性
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, base_spirit: '' }))}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    !filters.base_spirit
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {BASE_SPIRITS.map((spirit) => (
                  <button
                    key={spirit}
                    onClick={() => setFilters((f) => ({ ...f, base_spirit: spirit }))}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.base_spirit === spirit
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {spirit}
                  </button>
                ))}
              </div>
            </div>

            {/* 主调风味（多选） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主调风味（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_TAGS.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => toggleFlavorTag(flavor)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.flavor_tags.includes(flavor)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* 口感气质 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                口感气质
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, texture_tag: '' }))}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    !filters.texture_tag
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {TEXTURE_TAGS.map((texture) => (
                  <button
                    key={texture}
                    onClick={() => setFilters((f) => ({ ...f, texture_tag: texture }))}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.texture_tag === texture
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {texture}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            没有找到配方
          </h3>
          <p className="text-gray-500">
            试试其他搜索词或筛选条件
          </p>
        </div>
      )}
    </div>
  );
}
