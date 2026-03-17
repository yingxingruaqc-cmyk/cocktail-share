-- Cocktails App 示例数据
-- 10个经典鸡尾酒配方

-- 注意：此脚本需要先运行 schema.sql 创建表结构
-- 需要在 Supabase SQL Editor 中运行

-- 首先创建一个演示用户（实际使用时用户通过注册创建）
-- 这里我们只是准备配方数据，用户数据会在注册时自动创建

-- 插入10个经典鸡尾酒配方（需要先有一个用户，这里使用一个占位UUID，实际使用时替换为真实用户ID）
-- 你需要先注册一个用户，然后用该用户的ID替换下面的 '00000000-0000-0000-0000-000000000000'

/*

-- 使用说明：
-- 1. 先注册一个用户
-- 2. 从 profiles 表中获取该用户的 ID
-- 3. 替换下面的 user_id 为实际的用户 ID
-- 4. 取消注释并运行以下 INSERT 语句

INSERT INTO recipes (user_id, title, image_url, style, description, ingredients, steps, rating, review) VALUES
-- 1. 曼哈顿
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '曼哈顿', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80', '古典', '经典威士忌鸡尾酒，被誉为鸡尾酒之王',
'[{"name":"波本威士忌","amount":"60ml"},{"name":"甜苦艾酒","amount":"30ml"},{"name":"安格斯特拉苦精","amount":"2滴"},{"name":"马拉斯奇诺樱桃","amount":"1颗"}]',
'[{"order":1,"description":"在调酒杯中加入冰块"},{"order":2,"description":"倒入威士忌、甜苦艾酒和苦精"},{"order":3,"description":"轻轻搅拌约20秒至充分冷却"},{"order":4,"description":"滤入冰镇的鸡尾酒杯中"},{"order":5,"description":"用马拉斯奇诺樱桃装饰"}]',
5, '曼哈顿是最经典的威士忌鸡尾酒之一，甜苦艾酒的甘甜与威士忌的醇厚完美平衡，适合慢慢品味。'),

-- 2. 尼格罗尼
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '尼格罗尼', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80', '古典', '意大利经典鸡尾酒，金酒、甜苦艾酒与金巴利的完美结合',
'[{"name":"金酒","amount":"30ml"},{"name":"甜苦艾酒","amount":"30ml"},{"name":"金巴利","amount":"30ml"},{"name":"橙皮","amount":"1片"}]',
'[{"order":1,"description":"在冰杯中加入冰块"},{"order":2,"description":"将金酒、甜苦艾酒和金巴利按1:1:1的比例倒入"},{"order":3,"description":"轻轻搅拌均匀"},{"order":4,"description":"用橙皮扭出香气并装饰"}]',
5, '尼格罗尼是意大利最具代表性的鸡尾酒，金巴利的苦味与甜苦艾酒的甜味形成完美对比，适合喜欢苦味的朋友。'),

-- 3. 干马天尼
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '干马天尼', 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=800&q=80', '古典', '007的最爱，最经典的鸡尾酒之一',
'[{"name":"琴酒","amount":"60ml"},{"name":"干味美思","amount":"10ml"},{"name":"绿橄榄","amount":"3颗"}]',
'[{"order":1,"description":"在调酒杯中加入冰块"},{"order":2,"description":"倒入琴酒和干味美思"},{"order":3,"description":"轻轻搅拌（或摇晃，如果是007的话）"},{"order":4,"description":"滤入冰镇的马天尼杯中"},{"order":5,"description":"用橄榄串装饰"}]',
4, '干马天尼是经典中的经典，可以根据个人口味调整味美思的比例，甚至可以不加。'),

-- 4. 威士忌酸
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '威士忌酸', 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80', '酸酒', '酸甜平衡的经典威士忌鸡尾酒',
'[{"name":"波本威士忌","amount":"60ml"},{"name":"新鲜柠檬汁","amount":"30ml"},{"name":"简单糖浆","amount":"20ml"},{"name":"柠檬片","amount":"1片"}]',
'[{"order":1,"description":"在摇壶中加入所有液体原料"},{"order":2,"description":"加入冰块"},{"order":3,"description":"用力摇晃约15秒"},{"order":4,"description":"滤入装满碎冰的古典杯中"},{"order":5,"description":"用柠檬片装饰"}]',
5, '威士忌酸是最经典的酸酒之一，酸甜平衡，非常易饮。可以加蛋白做泡沫层，称为"波士顿酸"。'),

-- 5. 旧时尚
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '旧时尚', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80', '古典', '最古老的鸡尾酒之一，简单而优雅',
'[{"name":"波本威士忌","amount":"60ml"},{"name":"方糖","amount":"1颗"},{"name":"安格斯特拉苦精","amount":"2滴"},{"name":"苏打水","amount":"少量"},{"name":"橙皮","amount":"1片"}]',
'[{"order":1,"description":"在古典杯中放入方糖"},{"order":2,"description":"加入苦精和少量苏打水"},{"order":3,"description":"用搅棒将糖碾碎并搅拌均匀"},{"order":4,"description":"加入冰块"},{"order":5,"description":"倒入威士忌，轻轻搅拌"},{"order":6,"description":"用橙皮扭出香气并装饰"}]',
5, '旧时尚是真正的经典，简单纯粹，让威士忌的风味得到最好的展现。'),

-- 6. 莫斯科骡子
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '莫斯科骡子', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', '其他', '伏特加与姜啤的清爽组合，标志性的铜杯',
'[{"name":"伏特加","amount":"45ml"},{"name":"青柠汁","amount":"20ml"},{"name":"姜啤","amount":"90ml"},{"name":"青柠角","amount":"1角"},{"name":"薄荷叶","amount":"数片"}]',
'[{"order":1,"description":"在铜杯中加入冰块"},{"order":2,"description":"倒入伏特加和青柠汁"},{"order":3,"description":"加入姜啤至八分满"},{"order":4,"description":"轻轻搅拌"},{"order":5,"description":"用青柠角和薄荷叶装饰"}]',
4, '莫斯科骡子口感清爽，姜啤的辛辣与青柠的酸味完美搭配，用铜杯饮用更是仪式感满满。'),

-- 7. 边车
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '边车', 'https://images.unsplash.com/photo-1582057402876-e8f99b6f64a8?w=800&q=80', '酸酒', '干邑与君度的优雅组合',
'[{"name":"干邑白兰地","amount":"45ml"},{"name":"君度橙酒","amount":"20ml"},{"name":"新鲜柠檬汁","amount":"20ml"},{"name":"糖边","amount":"可选"}]',
'[{"order":1,"description":"可选：将鸡尾酒杯边缘沾上柠檬汁，再蘸上细砂糖做糖边"},{"order":2,"description":"在摇壶中加入所有液体原料"},{"order":3,"description":"加入冰块，用力摇晃约15秒"},{"order":4,"description":"滤入准备好的鸡尾酒杯中"}]',
4, '边车是一款优雅的经典鸡尾酒，干邑的醇厚与君度的橙香相得益彰。'),

-- 8. 吉姆雷特
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '吉姆雷特', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', '酸酒', '金酒与青柠的简单组合，清爽易饮',
'[{"name":"琴酒","amount":"60ml"},{"name":"青柠汁","amount":"30ml"},{"name":"简单糖浆","amount":"15ml"},{"name":"青柠片","amount":"1片"}]',
'[{"order":1,"description":"在摇壶中加入所有液体原料"},{"order":2,"description":"加入冰块"},{"order":3,"description":"用力摇晃约15秒"},{"order":4,"description":"滤入冰镇的鸡尾酒杯或加冰块的古典杯中"},{"order":5,"description":"用青柠片装饰"}]',
4, '吉姆雷特非常简单但非常好喝，金酒的草本香气与青柠的清新完美结合。'),

-- 9. 飞天海马
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '飞天海马', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80', '提拉', '龙舌兰与葡萄柚的清爽组合',
'[{"name":"白龙舌兰","amount":"60ml"},{"name":"葡萄柚汁","amount":"90ml"},{"name":"青柠汁","amount":"15ml"},{"name":"盐边","amount":"可选"}]',
'[{"order":1,"description":"可选：将古典杯边缘沾上青柠汁，再蘸上细盐做盐边"},{"order":2,"description":"在杯中加入冰块"},{"order":3,"description":"倒入龙舌兰和青柠汁"},{"order":4,"description":"加入葡萄柚汁至八分满"},{"order":5,"description":"轻轻搅拌均匀"}]',
4, '飞天海马来自墨西哥，清爽的葡萄柚与龙舌兰完美搭配，是炎炎夏日的绝佳选择。'),

-- 10. 长岛冰茶
('7f172e9c-29a2-4c69-9f5f-00b5daf16e5e', '长岛冰茶', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', '其他', '看起来像茶，实际是五种烈酒的强劲组合',
'[{"name":"伏特加","amount":"15ml"},{"name":"朗姆酒","amount":"15ml"},{"name":"金酒","amount":"15ml"},{"name":"龙舌兰","amount":"15ml"},{"name":"君度橙酒","amount":"15ml"},{"name":"柠檬汁","amount":"25ml"},{"name":"简单糖浆","amount":"15ml"},{"name":"可乐","amount":"适量"},{"name":"柠檬片","amount":"1片"}]',
'[{"order":1,"description":"在高球杯中加入冰块"},{"order":2,"description":"倒入所有烈酒、柠檬汁和糖浆"},{"order":3,"description":"轻轻搅拌均匀"},{"order":4,"description":"加入可乐至八分满"},{"order":5,"description":"用柠檬片装饰"}]',
3, '长岛冰茶虽然名字叫茶，但完全不含茶。五种烈酒混合，口感却很清爽，切记不要贪杯！');

*/

-- 提示：
-- 1. 你需要先注册一个账户
-- 2. 在 Supabase 的 Table Editor 中查看 profiles 表，复制你的用户ID
-- 3. 将上面所有 INSERT 语句中的 '00000000-0000-0000-0000-000000000000' 替换为你的用户ID
-- 4. 取消注释 INSERT 语句，然后在 SQL Editor 中运行
