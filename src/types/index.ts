// === 标签体系 ===

// 标签一：基底属性（单选）
export const BASE_SPIRITS = [
  '金酒',
  '伏特加',
  '朗姆',
  '威士忌',
  '龙舌兰',
  '白兰地',
  '无醇',
] as const;
export type BaseSpirit = typeof BASE_SPIRITS[number];

// 标签二：主调风味（多选）
export const FLAVOR_TAGS = [
  '果香',
  '茶香',
  '花香',
  '草本',
  '薄荷',
  '咖啡',
  '焦糖',
  '奶油',
] as const;
export type FlavorTag = typeof FLAVOR_TAGS[number];

// 标签三：口感气质（单选）
export const TEXTURE_TAGS = [
  '甜口',
  '酸口',
  '清爽',
  '绵密',
  '顺滑',
] as const;
export type TextureTag = typeof TEXTURE_TAGS[number];

// 配料单位
export const INGREDIENT_UNITS = ['ml', '个', '滴', 'g', '片', '勺'] as const;
export type IngredientUnit = typeof INGREDIENT_UNITS[number];

// 排序方式
export const SORT_OPTIONS = ['热度', '发布时间'] as const;
export type SortOption = typeof SORT_OPTIONS[number];

export const SORT_ORDERS = ['降序', '升序'] as const;
export type SortOrder = typeof SORT_ORDERS[number];

// === 保留旧的风格枚举（兼容）===
export const COCKTAIL_STYLES = [
  '古典',
  '甜口',
  '酸酒',
  '提拉',
  '无酒精',
  '其他',
] as const;
export type CocktailStyle = typeof COCKTAIL_STYLES[number];

// === 数据类型 ===

// 配料类型
export interface Ingredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
}

// 步骤类型
export interface Step {
  order: number;
  description: string;
}

// 用户资料类型
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

// 鸡尾酒配方类型
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  image_url: string;
  // 旧字段（兼容）
  style: CocktailStyle;
  // 新的三层标签体系
  base_spirit: BaseSpirit;
  flavor_tags: FlavorTag[];
  texture_tag: TextureTag;
  description: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  rating: number | null;
  review: string | null;
  // 新增字段
  view_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // 关联数据
  profile?: Profile;
}

// 评论类型
export interface Comment {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // 关联数据
  profile?: Profile;
}

// 收藏类型
export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

// 关注类型
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// 私信类型
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // 关联数据
  sender?: Profile;
  receiver?: Profile;
}

// 对话类型（用于消息列表）
export interface Conversation {
  user_id: string;
  profile: Profile;
  lastMessage: Message;
  last_message?: Message;
  unreadCount: number;
  unread_count?: number;
}

// 创建配方表单类型
export interface CreateRecipeFormData {
  title: string;
  image_url: string;
  // 旧字段（兼容）
  style: CocktailStyle;
  // 新的三层标签
  base_spirit: BaseSpirit;
  flavor_tags: FlavorTag[];
  texture_tag: TextureTag;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  rating: number;
  review: string;
}

// 搜索筛选条件类型
export interface SearchFilters {
  query: string;
  // AI 搜索
  ai_query: string;
  // 旧风格（兼容）
  style: CocktailStyle | '';
  // 新的三层筛选
  base_spirit: BaseSpirit | '';
  flavor_tags: FlavorTag[];
  texture_tag: TextureTag | '';
  // 排序
  sort_by: SortOption;
  sort_order: SortOrder;
}
