-- Cocktails App 示例数据 - 已配置用户ID
-- 10个经典鸡尾酒配方
-- 直接在 Supabase SQL Editor 中运行即可

-- 先确保用户 profile 存在
INSERT INTO profiles (id, username, avatar_url, bio)
VALUES ('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '鸡尾酒大师', null, '热爱调酒，分享经典配方')
ON CONFLICT (id) DO NOTHING;

-- 插入10个经典鸡尾酒配方
INSERT INTO recipes (user_id, title, image_url, style, base_spirit, flavor_tags, texture_tag, description, ingredients, steps, rating, review, view_count, is_approved) VALUES

-- 1. 曼哈顿
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '曼哈顿', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800', '古典', '威士忌', '{"焦糖","草本"}', '顺滑', '经典的曼哈顿鸡尾酒，威士忌与甜苦艾酒的完美结合',
'[{"name":"波本威士忌","amount":60,"unit":"ml"},{"name":"甜苦艾酒","amount":30,"unit":"ml"},{"name":"安哥斯图拉苦精","amount":2,"unit":"滴"},{"name":"马拉斯奇诺樱桃","amount":1,"unit":"个"}]',
'[{"order":1,"description":"在调酒杯中加入冰块"},{"order":2,"description":"依次倒入威士忌、甜苦艾酒和苦精"},{"order":3,"description":"搅拌约20秒至充分冷却"},{"order":4,"description":"过滤到预冷的鸡尾酒杯中"},{"order":5,"description":"用马拉斯奇诺樱桃装饰"}]',
5, '经典永不过时，曼哈顿是鸡尾酒中的绅士。', 1280, true),

-- 2. 尼格罗尼
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '尼格罗尼', 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', '古典', '金酒', '{"草本","焦糖"}', '顺滑', '意大利经典鸡尾酒，金酒、甜苦艾酒与金巴利的完美平衡',
'[{"name":"伦敦干金酒","amount":30,"unit":"ml"},{"name":"甜苦艾酒","amount":30,"unit":"ml"},{"name":"金巴利","amount":30,"unit":"ml"},{"name":"橙皮","amount":1,"unit":"片"}]',
'[{"order":1,"description":"在岩石杯中放入大块冰块"},{"order":2,"description":"将金酒、甜苦艾酒和金巴利按1:1:1的比例倒入"},{"order":3,"description":"轻轻搅拌混合"},{"order":4,"description":"用橙皮扭出香精油并装饰"}]',
4, '苦中带甜，适合慢慢品味的傍晚。', 956, true),

-- 3. 干马天尼
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '干马天尼', 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=800', '古典', '金酒', '{"草本"}', '清爽', '007的最爱，最经典的鸡尾酒之一',
'[{"name":"伦敦干金酒","amount":75,"unit":"ml"},{"name":"干苦艾酒","amount":15,"unit":"ml"},{"name":"橄榄","amount":3,"unit":"个"}]',
'[{"order":1,"description":"在调酒杯中放入冰块"},{"order":2,"description":"加入金酒和干苦艾酒"},{"order":3,"description":"快速搅拌约15秒"},{"order":4,"description":"过滤到冰镇的马天尼杯中"},{"order":5,"description":"用橄榄装饰"}]',
5, '简单而纯粹，马天尼是鸡尾酒之王。', 2100, true),

-- 4. 威士忌酸
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '威士忌酸', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', '酸酒', '威士忌', '{"果香"}', '酸口', '清爽酸甜的经典威士忌鸡尾酒',
'[{"name":"波本威士忌","amount":60,"unit":"ml"},{"name":"新鲜柠檬汁","amount":30,"unit":"ml"},{"name":"单糖浆","amount":20,"unit":"ml"},{"name":"蛋白","amount":1,"unit":"个"}]',
'[{"order":1,"description":"将所有材料放入摇酒器中（不加冰）"},{"order":2,"description":"干摇约10秒（如果使用蛋白）"},{"order":3,"description":"加入冰块再摇约15秒至充分冷却"},{"order":4,"description":"过滤到冰镇的鸡尾酒杯中"},{"order":5,"description":"可在表面加少许 Angostura 苦精装饰"}]',
4, '酸甜平衡，清爽怡人，适合任何场合。', 1580, true),

-- 5. 旧时尚
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '旧时尚', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800', '古典', '威士忌', '{"焦糖","草本"}', '顺滑', '最古老的鸡尾酒之一，简单而优雅',
'[{"name":"波本威士忌","amount":60,"unit":"ml"},{"name":"方糖","amount":1,"unit":"个"},{"name":"安哥斯图拉苦精","amount":3,"unit":"滴"},{"name":"橙皮","amount":1,"unit":"片"}]',
'[{"order":1,"description":"在岩石杯中放入方糖"},{"order":2,"description":"滴入苦精和少许水"},{"order":3,"description":"用搅拌棒将方糖捣碎溶解"},{"order":4,"description":"加入一块大冰块"},{"order":5,"description":"倒入威士忌，轻轻搅拌"},{"order":6,"description":"用橙皮装饰"}]',
5, '返璞归真，品味最纯粹的威士忌。', 1890, true),

-- 6. 莫斯科骡子
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '莫斯科骡子', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800', '酸酒', '伏特加', '{"果香","薄荷"}', '清爽', '伏特加与姜汁啤酒的清爽组合',
'[{"name":"伏特加","amount":45,"unit":"ml"},{"name":"新鲜青柠汁","amount":15,"unit":"ml"},{"name":"姜汁啤酒","amount":120,"unit":"ml"},{"name":"青柠片","amount":1,"unit":"片"}]',
'[{"order":1,"description":"在铜杯（或高球杯）中放入冰块"},{"order":2,"description":"倒入伏特加和青柠汁"},{"order":3,"description":"加入姜汁啤酒至满"},{"order":4,"description":"轻轻搅拌一下"},{"order":5,"description":"用青柠片装饰"}]',
4, '清爽带劲，铜杯让这杯酒更加特别。', 2340, true),

-- 7. 边车
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '边车', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800', '酸酒', '白兰地', '{"果香"}', '酸口', '干邑与橙味利口酒的经典组合',
'[{"name":"干邑白兰地","amount":45,"unit":"ml"},{"name":"君度橙酒","amount":20,"unit":"ml"},{"name":"新鲜柠檬汁","amount":20,"unit":"ml"}]',
'[{"order":1,"description":"将所有材料放入摇酒器中"},{"order":2,"description":"加冰摇匀约15秒"},{"order":3,"description":"过滤到冰镇的鸡尾酒杯中"},{"order":4,"description":"可选择杯口沾糖圈"}]',
4, '优雅平衡，是经典鸡尾酒中的珍品。', 890, true),

-- 8. 吉姆雷特
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '吉姆雷特', 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800', '酸酒', '金酒', '{"果香"}', '清爽', '简单清爽的金酒鸡尾酒',
'[{"name":"伦敦干金酒","amount":60,"unit":"ml"},{"name":"青柠汁","amount":30,"unit":"ml"},{"name":"单糖浆","amount":15,"unit":"ml"}]',
'[{"order":1,"description":"将所有材料放入摇酒器中"},{"order":2,"description":"加冰摇匀约15秒"},{"order":3,"description":"过滤到冰镇的鸡尾酒杯或高球杯中"},{"order":4,"description":"用青柠片装饰"}]',
3, '简单直接，金酒与青柠的纯粹组合。', 720, true),

-- 9. 飞天海马
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '飞天海马', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', '提拉', '朗姆', '{"咖啡","奶油"}', '绵密', '层次分明的经典提拉鸡尾酒',
'[{"name":"黑朗姆酒","amount":30,"unit":"ml"},{"name":"咖啡利口酒","amount":30,"unit":"ml"},{"name":"淡奶油","amount":30,"unit":"ml"}]',
'[{"order":1,"description":"先将咖啡利口酒倒入利口酒杯中"},{"order":2,"description":"将吧勺背面贴在杯壁，慢慢倒入黑朗姆酒"},{"order":3,"description":"最后同样方法倒入淡奶油在最上层"},{"order":4,"description":"动作要轻，保持层次分明"}]',
4, '视觉效果极佳，三层风味完美融合。', 1650, true),

-- 10. 长岛冰茶
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '长岛冰茶', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', '酸酒', '伏特加', '{"果香","焦糖"}', '清爽', '看似温和实则强劲的经典鸡尾酒',
'[{"name":"伏特加","amount":15,"unit":"ml"},{"name":"朗姆酒","amount":15,"unit":"ml"},{"name":"金酒","amount":15,"unit":"ml"},{"name":"龙舌兰","amount":15,"unit":"ml"},{"name":"君度橙酒","amount":10,"unit":"ml"},{"name":"柠檬汁","amount":25,"unit":"ml"},{"name":"单糖浆","amount":15,"unit":"ml"}]',
'[{"order":1,"description":"在高球杯中放入冰块"},{"order":2,"description":"将所有烈酒、柠檬汁和糖浆倒入"},{"order":3,"description":"轻轻搅拌混合"},{"order":4,"description":"加可乐至8分满"},{"order":5,"description":"用柠檬片装饰"}]',
4, '看起来像冰茶，喝起来可完全不一样！', 3200, true);
