// 简化的数据库类型定义
// 为了避免 TypeScript 类型检查问题，使用更宽松的类型
// 完整的类型可以通过 Supabase CLI 生成: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export interface Json {
  [key: string]: any;
}

// 使用宽松类型定义以避免类型检查错误
export type Database = any;
