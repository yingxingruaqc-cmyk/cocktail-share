-- 数据库迁移：添加新字段
-- 运行此文件以更新现有数据库

-- 1. 更新 recipes 表，添加新字段
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS base_spirit VARCHAR(50),
ADD COLUMN IF NOT EXISTS flavor_tags TEXT[],
ADD COLUMN IF NOT EXISTS texture_tag VARCHAR(50),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- 2. 更新 ingredients 结构（JSONB 字段，不需要 ALTER，应用层处理）
-- 新的 ingredients 结构: [{ name: string, amount: number, unit: string }]

-- 3. 添加新索引
CREATE INDEX IF NOT EXISTS idx_recipes_base_spirit ON recipes(base_spirit);
CREATE INDEX IF NOT EXISTS idx_recipes_view_count ON recipes(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_approved ON recipes(is_approved);

-- 4. 更新 RLS 策略（如果需要的话，现有策略应该已经适用）

-- 注意：如果需要更复杂的 flavor_tags 查询，可以使用 GIN 索引：
-- CREATE INDEX IF NOT EXISTS idx_recipes_flavor_tags ON recipes USING GIN(flavor_tags);
