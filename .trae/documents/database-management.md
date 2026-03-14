# 数据库与赛事信息管理文档

本文档说明如何管理《SF6 街霸6 竞猜杯》的后台数据，包括修改选手信息、发布比赛结果以及管理赛事进程。

## 1. 数据库连接

您可以通过以下两种方式管理数据库：
1. **Supabase 控制台**：登录 [Supabase Dashboard](https://supabase.com/dashboard)，进入您的项目，使用 Table Editor 进行图形化操作。
2. **SQL Editor**：在 Supabase 控制台的 SQL Editor 中执行 SQL 语句。

## 2. 选手管理

### 修改选手 ID 或信息
如果需要修正选手的名字或 ID，可以直接在 `teams` 表中进行操作。

**SQL 示例**：
```sql
-- 修改选手名字
UPDATE teams 
SET name = '新名字' 
WHERE name = '旧名字';

-- 查看所有选手
SELECT * FROM teams;
```

### 添加新选手
```sql
INSERT INTO teams (name, seed) VALUES ('选手名字', 种子顺位);
```

## 3. 发布比赛胜负比分

比赛结果的发布主要通过更新 `matches` 表来实现。

### 字段说明
- `winner_id`: 获胜者的 `team_id`。
- `score`: 比分字符串（例如 "3:1"）。
- `status`: (可选) 如果有状态字段，可以更新为 'completed'。

### 操作步骤
1. 找到对应的比赛 ID (`match_id`)。可以通过小组 ID 或队伍 ID 查询。
2. 更新该比赛的获胜者和比分。

**SQL 示例**：
```sql
-- 1. 查找 A组 首轮第一场的 match_id
SELECT m.id, t1.name as team1, t2.name as team2 
FROM matches m
JOIN groups g ON m.group_id = g.id
LEFT JOIN teams t1 ON m.team1_id = t1.id
LEFT JOIN teams t2 ON m.team2_id = t2.id
WHERE g.name = 'A组' AND m.team1_id IS NOT NULL;

-- 2. 假设找到 match_id 为 '5555...11'，巴索克(team1) 3:0 战胜 纯爱(team2)
-- 首先需要获取获胜者(巴索克)的 ID
SELECT id FROM teams WHERE name = '巴索克';

-- 3. 更新比赛结果
UPDATE matches
SET 
  winner_id = '44444444-4444-4444-4444-444444444441', -- 巴索克的 ID
  score = '3:0'
WHERE id = '55555555-5555-5555-5555-555555555511';
```

### 自动晋级逻辑 (高级)
在实际运营中，当一场比赛结果更新后，通常需要将胜者和败者自动填入下一轮的对阵中（例如胜者进入胜者组决赛，败者进入败者组第一轮）。
目前系统是静态展示，如果您需要更新下一轮的对阵，需要手动更新下一轮比赛的 `team1_id` 或 `team2_id`。

**示例：将 A组首轮胜者填入胜者组决赛**
```sql
-- 假设胜者组决赛的 match_id 是 '...13'，且它是该组的第3场比赛
UPDATE matches
SET team1_id = '获胜者ID'
WHERE id = '...13';
```

## 4. 管理排行榜

排行榜是根据 `predictions` 表自动计算的。只要您正确更新了 `matches` 表的 `winner_id` 和 `score`，前端或后端逻辑会自动对比用户的预测与实际结果。

如果需要手动刷新排行榜数据（例如清理作弊数据）：
```sql
-- 删除特定用户的预测
DELETE FROM predictions WHERE user_id = '恶意用户ID';
```

## 5. 常见问题排查

**Q: 为什么更新了比赛结果，前端没有变化？**
A: 前端使用了 Supabase 的实时订阅或缓存。尝试刷新页面。如果使用了 React Context，确保 `winner_id` 字段已被正确获取。

**Q: 如何重置所有比赛？**
A: 可以将所有比赛的 `winner_id` 和 `score` 设置为 NULL。
```sql
UPDATE matches SET winner_id = NULL, score = NULL;
```
