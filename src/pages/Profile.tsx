import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { useFollows } from '../hooks/useFollows';
import { RecipeCard, LoadingSpinner } from '../components';
import { supabase } from '../lib/supabase';
import type { Recipe, Profile as ProfileType } from '../types';

type Tab = 'recipes' | 'favorites' | 'following' | 'followers';

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fetchUserRecipes } = useRecipes();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === id;
  const { favorites, loading: favoritesLoading, fetchFavorites } = useFavorites(isOwnProfile ? user?.id || null : null);
  const { followingList, followers, loading: followsLoading } = useFollows(isOwnProfile ? user?.id || null : null);

  // 加载用户资料
  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      // 从 Supabase 加载用户资料
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('加载用户资料失败:', profileError);
      } else {
        setProfile(profileData as ProfileType);
      }

      // 加载用户发布的配方
      const userRecipes = await fetchUserRecipes(id);
      setRecipes(userRecipes);
    } catch (err) {
      console.error('加载用户资料失败:', err);
    } finally {
      setLoading(false);
    }
  }, [id, fetchUserRecipes]);

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id, loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">用户不存在</h2>
        <p className="text-gray-600 mb-4">您访问的用户可能已被删除</p>
        <Link to="/" className="text-gray-900 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-3xl font-bold">
                {profile.username[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            {profile.bio && (
              <p className="text-gray-600 mt-1">{profile.bio}</p>
            )}
            <div className="flex gap-6 mt-3">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{recipes.length}</span> 配方
              </span>
              {isOwnProfile && (
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{favorites.length}</span> 收藏
                </span>
              )}
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{followingList.length}</span> 关注
              </span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{followers.length}</span> 粉丝
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'recipes'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            发布的配方
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              收藏的配方
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('following')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              关注的人
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              粉丝
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'recipes' && (
        <div>
          {recipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">还没有发布任何配方</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && isOwnProfile && (
        <div>
          {favoritesLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">还没有收藏任何配方</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'following' && isOwnProfile && (
        <div>
          {followsLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : followingList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">还没有关注任何人</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followingList.map((profile) => (
                <Link
                  key={profile.id}
                  to={`/profile/${profile.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-md shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xl font-bold">
                        {profile.username[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {profile.username}
                    </p>
                    {profile.bio && (
                      <p className="text-sm text-gray-500 truncate">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'followers' && isOwnProfile && (
        <div>
          {followsLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">还没有粉丝</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((profile) => (
                <Link
                  key={profile.id}
                  to={`/profile/${profile.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-md shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xl font-bold">
                        {profile.username[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {profile.username}
                    </p>
                    {profile.bio && (
                      <p className="text-sm text-gray-500 truncate">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
