import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { useFollows } from '../hooks/useFollows';
import { useComments } from '../hooks/useComments';
import { Button, LoadingSpinner, StarRating } from '../components';
import type { Recipe } from '../types';
import { seedRecipes } from '../data/seedRecipes';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchRecipeById, deleteRecipe } = useRecipes();
  const { isFavorited, toggleFavorite } = useFavorites(user?.id || null);
  const { isFollowing, toggleFollow } = useFollows(user?.id || null);
  const { comments, loading: commentsLoading, fetchComments, addComment, deleteComment } = useComments();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadRecipe = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    // 首先从静态数据中查找
    const staticRecipe = seedRecipes.find(r => r.id === id);
    if (staticRecipe) {
      setRecipe(staticRecipe);
      setLoading(false);
      return;
    }

    // 如果静态数据中没有，尝试从 Supabase 加载
    const data = await fetchRecipeById(id);
    setRecipe(data);
    if (data) {
      fetchComments(data.id);
    }
    setLoading(false);
  }, [id, fetchRecipeById, fetchComments]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const handleToggleFavorite = async () => {
    if (!user || !recipe) return;
    try {
      await toggleFavorite(recipe.id);
    } catch (err) {
      alert('操作失败，请先登录');
    }
  };

  const handleToggleFollow = async () => {
    if (!user || !recipe) return;
    try {
      await toggleFollow(recipe.user_id);
    } catch (err) {
      alert('操作失败，请先登录');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipe || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(user.id, recipe.id, commentText.trim());
      setCommentText('');
    } catch (err) {
      alert('评论失败，请重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await deleteComment(commentId);
    } catch (err) {
      alert('删除失败，请重试');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    try {
      await deleteRecipe(recipe.id);
      navigate('/');
    } catch (err) {
      alert('删除失败，请重试');
    }
  };

  const handleEditRecipe = () => {
    if (!recipe) return;
    navigate(`/create?edit=${recipe.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">配方不存在</h2>
        <p className="text-gray-600 mb-4">您访问的配方可能已被删除</p>
        <Link to="/" className="text-gray-900 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;
  const favorited = isFavorited(recipe.id);
  const following = isFollowing(recipe.user_id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              确定要删除这个配方吗？
            </h3>
            <p className="text-gray-600 mb-6">
              删除后无法恢复，相关的评论和收藏也会被删除。
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteRecipe();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="aspect-[16/9] bg-gray-100">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {/* 基底属性 */}
                <span className="px-3 py-1 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-md">
                  {recipe.base_spirit || recipe.style}
                </span>
                {/* 主调风味 */}
                {recipe.flavor_tags?.map((flavor) => (
                  <span
                    key={flavor}
                    className="px-3 py-1 bg-gray-700 text-sm font-medium text-white rounded-md"
                  >
                    {flavor}
                  </span>
                ))}
                {/* 口感气质 */}
                {recipe.texture_tag && (
                  <span className="px-3 py-1 bg-gray-900 text-sm font-medium text-white rounded-md">
                    {recipe.texture_tag}
                  </span>
                )}
                {recipe.rating && (
                  <div className="ml-2">
                    <StarRating rating={recipe.rating} readonly size="sm" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-gray-600">{recipe.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-md border transition-colors ${
                  favorited
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={favorited ? '取消收藏' : '收藏'}
              >
                <svg
                  className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`}
                  fill={favorited ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={handleEditRecipe}
                    className="p-2 rounded-md border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-900 hover:bg-gray-50"
                    title="编辑配方"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-md border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                    title="删除配方"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Author */}
          {recipe.profile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${recipe.profile.id}`}
                  className="flex items-center space-x-3 hover:opacity-80"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {recipe.profile.avatar_url ? (
                      <img
                        src={recipe.profile.avatar_url}
                        alt={recipe.profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {recipe.profile.username[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {recipe.profile.username}
                    </p>
                    <p className="text-sm text-gray-500">配方作者</p>
                  </div>
                </Link>
                {!isOwner && user && (
                  <Button
                    variant={following ? 'outline' : 'primary'}
                    size="sm"
                    onClick={handleToggleFollow}
                  >
                    {following ? '已关注' : '关注'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">配料清单</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-900">{ingredient.name}</span>
                  <span className="text-gray-500 font-medium">{ingredient.amount} {ingredient.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Author Review */}
          {recipe.review && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">作者点评</h2>
              <p className="text-gray-600">{recipe.review}</p>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">制作步骤</h2>
            <ol className="space-y-6">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.order}
                  </div>
                  <p className="pt-1 text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              评论 ({comments.length})
            </h2>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写下您的评论..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                  >
                    {submittingComment ? '发布中...' : '发布评论'}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-gray-500 mb-6">
                <Link to="/login" className="text-gray-900 hover:underline">
                  登录
                </Link>
                {' '}后发表评论
              </p>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无评论</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {comment.profile?.avatar_url ? (
                        <img
                          src={comment.profile.avatar_url}
                          alt={comment.profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs font-medium">
                          {comment.profile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.profile?.username}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {user?.id === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
