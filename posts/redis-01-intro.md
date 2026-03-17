# Redis 入门：数据结构与应用场景

> **系列**: Redis 系列第 1 篇  
> **难度**: ⭐ 入门  
> **阅读时间**: 约 15 分钟  
> **上一篇**: 无 | **下一篇**: Redis 持久化：RDB 与 AOF 详解（待发布）

---

## 引言

在现代 Web 开发中，性能优化是永恒的主题。当你的应用用户量增长、请求量上升时，数据库往往成为第一个瓶颈。这时，引入缓存层就成了必然选择。

**Redis**（Remote Dictionary Server）作为一个开源的内存数据存储系统，自 2009 年发布以来，已成为构建高性能应用的核心组件之一。它不仅能做缓存，还能处理消息队列、实时分析、会话管理等多种场景。

本文将带你全面了解 Redis 的核心数据结构，并通过实际场景演示如何选择合适的数据类型解决问题。

---

## 一、Redis 核心概念

### 1.1 什么是 Redis？

Redis 是一个基于内存的 **Key-Value 存储系统**，具有以下特点：

- **高性能**: 读操作可达 11 万次/秒，写操作可达 8.1 万次/秒
- **持久化**: 支持 RDB 快照和 AOF 日志两种持久化方式
- **丰富的数据结构**: 不仅仅是字符串，还支持列表、集合、哈希等
- **原子操作**: 所有单个命令都是原子执行的
- **发布订阅**: 支持消息队列场景
- **Lua 脚本**: 支持复杂的事务逻辑

### 1.2 Redis vs Memcached

| 特性 | Redis | Memcached |
|------|-------|-----------|
| 数据结构 | 丰富（5 种+） | 仅字符串 |
| 持久化 | 支持 | 不支持 |
| 分布式 | 原生支持 Cluster | 需要客户端实现 |
| 事务 | 支持 | 不支持 |
| 内存管理 | 动态分配 | 预分配 |
| 适用场景 | 多样化 | 纯缓存 |

**结论**: 除非你有特殊需求，否则优先选择 Redis。

---

## 二、Redis 五大数据结构

### 2.1 String（字符串）

最基础的数据类型，可以存储字符串、整数或浮点数。

```bash
# 基本操作
SET name "张三"
GET name
# > "张三"

# 原子递增（适合计数器）
SET views 0
INCR views
INCR views
GET views
# > "2"

# 批量操作
MSET key1 "value1" key2 "value2"
MGET key1 key2

# 设置过期时间（秒）
SET session:123 "user_data" EX 3600
```

**应用场景**:
- 缓存用户信息、配置项
- 计数器（点赞数、浏览量）
- 分布式锁（SETNX）
- 会话存储

### 2.2 Hash（哈希）

适合存储对象，可以单独修改某个字段。

```bash
# 存储用户对象
HSET user:1001 name "张三" age 25 email "zhangsan@example.com"

# 获取单个字段
HGET user:1001 name
# > "张三"

# 获取所有字段
HGETALL user:1001

# 批量设置
HMSET user:1002 name "李四" age 28 city "北京"

# 字段自增
HINCRBY user:1001 score 10

# 判断字段是否存在
HEXISTS user:1001 email
# > 1
```

**应用场景**:
- 用户信息存储
- 商品详情
- 配置项分组

### 2.3 List（列表）

双向链表，支持从两端插入和弹出。

```bash
# 从右侧插入
LPUSH tasks "task1" "task2" "task3"

# 从左侧弹出（FIFO 队列）
LPOP tasks
# > "task1"

# 从右侧弹出（栈）
RPOP tasks
# > "task3"

# 获取列表长度
LLEN tasks

# 获取指定范围
LRANGE tasks 0 -1

# 阻塞式弹出（消息队列）
BRPOP tasks 0
# 阻塞等待直到有元素
```

**应用场景**:
- 消息队列
- 最新动态列表
- 任务队列
- 栈和队列实现

### 2.4 Set（集合）

无序不重复的元素集合，支持交集、并集、差集运算。

```bash
# 添加元素
SADD tags "redis" "mysql" "nginx"

# 判断元素是否存在
SISMEMBER tags "redis"
# > 1

# 获取所有元素
SMEMBERS tags

# 集合运算
SADD user:A:likes "music" "movie" "sports"
SADD user:B:likes "movie" "book" "sports"

# 交集（共同喜好）
SINTER user:A:likes user:B:likes
# > "sports" "movie"

# 并集（所有喜好）
SUNION user:A:likes user:B:likes

# 差集（A 有 B 没有）
SDIFF user:A:likes user:B:likes
# > "music"
```

**应用场景**:
- 标签系统
- 好友关系（共同好友）
- 抽奖（随机抽取）
- 去重统计

### 2.5 ZSet（有序集合）

带分数的集合，元素自动按分数排序。

```bash
# 添加元素（带分数）
ZADD leaderboard 1000 "player1" 1500 "player2" 800 "player3"

# 获取排名（从 0 开始）
ZRANK leaderboard "player1"
# > 1

# 获取前 3 名
ZREVRANGE leaderboard 0 2 WITHSCORES
# > "player2" "1500" "player1" "1000" "player3" "800"

# 分数增加
ZINCRBY leaderboard 100 "player1"

# 获取指定分数范围的元素
ZRANGEBYSCORE leaderboard 900 1200

# 获取元素的排名和分数
ZREVRANK leaderboard "player2"
ZSCORE leaderboard "player2"
```

**应用场景**:
- 排行榜
- 优先级队列
- 延迟队列（分数=时间戳）
- 带权重的推荐列表

---

## 三、实战场景

### 场景 1: 用户会话管理

```bash
# 登录时创建会话
SET session:abc123 "{\"userId\": 1001, \"username\": \"张三\"}" EX 7200

# 每次访问时验证
GET session:abc123

# 退出登录时删除
DEL session:abc123

# 续期
EXPIRE session:abc123 7200
```

### 场景 2: 文章点赞计数器

```bash
# 用户点赞（防止重复）
SADD article:1001:likes "user:1001"
# 如果返回 1 表示成功，0 表示已点过

# 获取点赞总数
SCARD article:1001:likes

# 检查用户是否点过赞
SISMEMBER article:1001:likes "user:1001"

# 取消点赞
SREM article:1001:likes "user:1001"
```

### 场景 3: 最新文章列表（最新 10 篇）

```bash
# 发布文章时
LPUSH articles:latest "article:1001" "article:1002" "article:1003"
LTRIM articles:latest 0 9  # 只保留最新 10 篇

# 获取最新文章列表
LRANGE articles:latest 0 -1
```

### 场景 4: 热搜排行榜

```bash
# 搜索时增加热度
ZINCRBY hot:search 1 "关键词 1"
ZINCRBY hot:search 1 "关键词 2"

# 获取实时热搜 Top 10
ZREVRANGE hot:search 0 9 WITHSCORES

# 设置过期时间（24 小时后自动过期）
EXPIRE hot:search 86400
```

### 场景 5: 分布式锁

```bash
# 加锁（NX=不存在时才设置，EX=过期时间）
SET lock:order:1001 "worker:1" NX EX 30
# 返回 OK 表示成功，nil 表示失败

# 解锁（需要 Lua 脚本保证原子性）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

---

## 四、最佳实践

### 4.1 Key 命名规范

```
✅ 推荐:
user:1001:profile
article:1001:comments
session:abc123

❌ 避免:
user_1001  # 不统一
1001       # 无意义
a:b:c      # 过于简短
```

**原则**:
- 使用冒号 `:` 作为分隔符
- 包含业务前缀
- 语义清晰

### 4.2 设置过期时间

```bash
# 缓存数据必须设置过期时间
SET cache:data "value" EX 3600

# 或者单独设置
SET key "value"
EXPIRE key 3600
```

**注意**: 防止缓存堆积导致内存爆炸。

### 4.3 批量操作

```bash
# 避免多次网络往返
MGET key1 key2 key3 key4 key5

# 使用 Pipeline（客户端支持）
redis.multi do |redis|
  5000.times do |i|
    redis.set "key#{i}", "value#{i}"
  end
end
```

### 4.4 内存优化

```bash
# 使用 Hash 而不是多个 String
# ❌ 浪费内存
SET user:1001:name "张三"
SET user:1001:age "25"
SET user:1001:email "xxx@example.com"

# ✅ 节省内存
HSET user:1001 name "张三" age 25 email "xxx@example.com"
```

---

## 五、常见问题

### Q1: Redis 数据丢失怎么办？

**A**: Redis 提供两种持久化方式：
- **RDB**: 定期快照，恢复快但可能丢失最后几分钟数据
- **AOF**: 记录每条写操作，更安全但恢复慢

生产环境建议**同时开启**，详见下篇《Redis 持久化：RDB 与 AOF 详解》。

### Q2: Redis 内存满了会怎样？

**A**: 取决于配置的淘汰策略：
- `noeviction`: 拒绝写入（默认）
- `allkeys-lru`: 淘汰最近最少使用的 key
- `volatile-lru`: 淘汰设置了过期时间的 key
- `allkeys-random`: 随机淘汰

### Q3: 如何监控 Redis 状态？

```bash
# 查看服务器信息
INFO

# 查看内存使用
INFO memory

# 实时监控命令
MONITOR  # 生产环境慎用

# 查看慢查询
SLOWLOG GET 10
```

---

## 总结

本文介绍了 Redis 的五大数据结构及其应用场景：

| 数据结构 | 核心特点 | 典型场景 |
|----------|----------|----------|
| String | 简单 KV、原子计数 | 缓存、计数器、分布式锁 |
| Hash | 字段级操作 | 对象存储、用户信息 |
| List | 双向链表 | 消息队列、最新动态 |
| Set | 去重、集合运算 | 标签、好友关系、抽奖 |
| ZSet | 自动排序 | 排行榜、优先级队列 |

**核心要点**:
1. 根据场景选择合适的数据结构
2. Key 命名要规范，便于维护
3. 缓存数据必须设置过期时间
4. 批量操作减少网络开销

---

## 延伸学习

- 下一篇：**Redis 持久化：RDB 与 AOF 详解**（待发布）
- 官方文档：https://redis.io/documentation
- 实战练习：安装 Redis，完成本文所有示例

---

*本文是 Redis 系列第 1 篇，下一篇将深入讲解 Redis 持久化机制。*
