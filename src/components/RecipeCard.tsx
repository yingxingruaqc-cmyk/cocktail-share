import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group block bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {/* 三个分类标签在左上角：基底属性（浅）→ 主调风味（中）→ 口感气质（深） */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {/* 标签一：基底属性 - 浅色 */}
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded shadow-sm flex items-center justify-center">
            {recipe.base_spirit || recipe.style}
          </span>
          {/* 标签二：主调风味 - 中等色 */}
          {recipe.flavor_tags?.slice(0, 2).map((flavor) => (
            <span
              key={flavor}
              className="px-2 py-1 bg-gray-700/80 backdrop-blur-sm text-xs font-medium text-white rounded shadow-sm flex items-center justify-center"
            >
              {flavor}
            </span>
          ))}
          {/* 标签三：口感气质 - 深色 */}
          {recipe.texture_tag && (
            <span className="px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-white rounded shadow-sm flex items-center justify-center">
              {recipe.texture_tag}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
            {recipe.description}
          </p>
        )}

        {/* 制作者信息固定在卡片最底部 */}
        {recipe.profile && (
          <div className="flex items-center space-x-2 mt-auto pt-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {recipe.profile.avatar_url ? (
                <img
                  src={recipe.profile.avatar_url}
                  alt={recipe.profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-xs font-medium">
                  {recipe.profile.username[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {recipe.profile.username}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
