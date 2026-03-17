# ES 入门：核心概念与架构

> **系列**: Elasticsearch 系列第 1 篇  
> **难度**: ⭐⭐ 入门  
> **阅读时间**: 约 20 分钟  
> **上一篇**: 无 | **下一篇**: 索引设计与映射详解（待发布）

---

## 引言

在数据爆炸的时代，如何快速从海量数据中找到有价值的信息，是每个系统必须面对的挑战。传统的数据库模糊查询（`LIKE '%keyword%'`）不仅性能差，而且无法实现智能搜索。

**Elasticsearch**（简称 ES）是一个基于 Lucene 的分布式搜索和分析引擎，能够：
- 毫秒级搜索亿级数据
- 支持全文检索、模糊匹配、聚合分析
- 水平扩展，轻松应对数据增长

从 GitHub 的代码搜索，到电商的商品检索，再到日志分析（ELK Stack），ES 已成为现代架构的标配组件。

本文将带你全面了解 ES 的核心概念和架构设计，为后续深入学习打下坚实基础。

---

## 一、什么是 Elasticsearch？

### 1.1 核心定义

Elasticsearch 是一个**分布式、RESTful 风格的搜索和数据分析引擎**。

**关键特点**:
- 🚀 **快速**: 近实时搜索（写入后 1 秒可搜索）
- 🔍 **强大**: 全文检索、结构化搜索、分析聚合
- 📈 **可扩展**: 分布式架构，轻松水平扩展
- 🛠️ **易用**: RESTful API，多种语言客户端
- 📊 **可视化**: 配合 Kibana 实现数据可视化

### 1.2 典型应用场景

| 场景 | 说明 | 案例 |
|------|------|------|
| **全文搜索** | 商品、文章、代码搜索 | 淘宝商品搜索、GitHub 代码搜索 |
| **日志分析** | 收集、分析系统日志 | ELK Stack（Elasticsearch + Logstash + Kibana） |
| **指标监控** | 存储和查询时间序列数据 | 应用性能监控、业务指标分析 |
| **自动补全** | 搜索建议、拼写纠错 | 搜索框自动补全 |
| **数据分析** | 实时聚合分析 | 用户行为分析、销售数据统计 |

### 1.3 ES vs MySQL

| 特性 | Elasticsearch | MySQL |
|------|--------------|-------|
| **数据模型** | JSON 文档 | 关系表 |
| **查询方式** | DSL（领域特定语言） | SQL |
| **擅长场景** | 全文检索、聚合分析 | 事务、关联查询 |
| **扩展方式** | 天然分布式 | 需要分库分表 |
| **实时性** | 近实时（1 秒延迟） | 实时 |

**结论**: ES 和 MySQL 不是替代关系，而是互补关系。通常配合使用：MySQL 存储业务数据，ES 提供搜索能力。

---

## 二、核心概念

### 2.1 概念对比

理解 ES 的最好方式是类比关系型数据库：

| 关系型数据库 | Elasticsearch | 说明 |
|-------------|---------------|------|
| 数据库（Database） | 索引（Index） | 数据的逻辑分区 |
| 表（Table） | 类型（Type - 7.x 已废弃） | ES 7.x+ 一个索引只有一种类型 |
| 行（Row） | 文档（Document） | 基本数据单元 |
| 列（Column） | 字段（Field） | 数据的属性 |
| 模式（Schema） | 映射（Mapping） | 定义字段类型 |

### 2.2 索引（Index）

**索引**是 ES 存储数据的地方，类似数据库中的"数据库"概念。

```bash
# 创建索引
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 查看索引
GET /products

# 删除索引
DELETE /products
```

**索引命名规范**:
- ✅ 小写字母
- ✅ 不能以 `-`、`_`、`+` 开头
- ✅ 不能包含 `,`、`*`、`?`、`"`、`<`、`>`、`|`、` `（空格）
- ✅ 推荐格式：`业务名-类型-日期`，如 `logs-app-2026.03.17`

### 2.3 文档（Document）

**文档**是 ES 中最小的数据单元，必须是 JSON 格式。

```bash
# 创建文档（自动分配 ID）
POST /products/_doc
{
  "name": "iPhone 15 Pro",
  "price": 7999,
  "category": "手机",
  "tags": ["苹果", "5G", "A17"],
  "created_at": "2026-03-17"
}

# 创建文档（指定 ID）
PUT /products/_doc/1001
{
  "name": "MacBook Pro",
  "price": 12999,
  "category": "电脑"
}

# 获取文档
GET /products/_doc/1001

# 更新文档
POST /products/_doc/1001/_update
{
  "doc": {
    "price": 11999
  }
}

# 删除文档
DELETE /products/_doc/1001
```

**文档元数据**:
- `_index`: 所属索引
- `_id`: 文档唯一标识
- `_source`: 原始 JSON 数据
- `_version`: 版本号（乐观锁）

### 2.4 映射（Mapping）

**映射**定义文档中字段的类型和属性，类似数据库的 Schema。

```bash
# 查看映射
GET /products/_mapping

# 创建索引时定义映射
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "price": {
        "type": "integer"
      },
      "category": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date"
      }
    }
  }
}
```

**常用字段类型**:

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `text` | 分词文本 | 全文搜索（标题、内容） |
| `keyword` | 不分词 | 精确匹配（分类、标签） |
| `integer/long` | 整数 | 价格、数量 |
| `float/double` | 浮点数 | 价格、评分 |
| `date` | 日期 | 创建时间、更新时间 |
| `boolean` | 布尔值 | 是否上架 |
| `object` | 对象 | 嵌套结构 |
| `nested` | 嵌套对象 | 数组对象搜索 |

### 2.5 分词器（Analyzer）

**分词器**将文本拆分成单词（Term），是全文搜索的核心。

```bash
# 测试分词效果
POST /_analyze
{
  "analyzer": "standard",
  "text": "Elasticsearch is powerful"
}

# 输出
{
  "tokens": [
    { "token": "elasticsearch" },
    { "token": "is" },
    { "token": "powerful" }
  ]
}
```

**内置分词器**:
- `standard`: 默认分词器（英文友好）
- `simple`: 按非字母分割
- `whitespace`: 按空格分割
- `ik_max_word`: 中文分词（最细粒度）
- `ik_smart`: 中文分词（最少切分）

**中文分词**需要安装 IK 插件：
```bash
# 安装 IK 分词器
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.x.x/elasticsearch-analysis-ik-8.x.x.zip
```

---

## 三、架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端                              │
│            (REST API / Java / Python / ...)             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    协调节点                              │
│         (任意节点都可充当，负责请求路由)                 │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ 节点 1    │   │ 节点 2    │   │ 节点 3    │
    │ ┌──────┐ │   │ ┌──────┐ │   │ ┌──────┐ │
    │ │分片 A│ │   │ │分片 B│ │   │ │分片 C│ │
    │ │主分片│ │   │ │主分片│ │   │ │主分片│ │
    │ └──────┘ │   │ └──────┘ │   │ └──────┘ │
    │ ┌──────┐ │   │ ┌──────┐ │   │ ┌──────┐ │
    │ │分片 B│ │   │ │分片 C│ │   │ │分片 A│ │
    │ │副本  │ │   │ │副本  │ │   │ │副本  │ │
    │ └──────┘ │   │ └──────┘ │   │ └──────┘ │
    └──────────┘   └──────────┘   └──────────┘
```

### 3.2 节点（Node）

**节点**是 ES 集群中的一个服务器，可以存储数据并参与集群操作。

**节点类型**:
- **主节点（Master）**: 管理集群状态（创建/删除索引、节点加入/离开）
- **数据节点（Data）**: 存储数据，执行 CRUD、搜索、聚合
- **协调节点（Coordinator）**: 路由请求，聚合结果
- ** ingest 节点**: 预处理数据（类似 Logstash）

**生产环境建议**:
- 主节点和数据节点分离
- 至少 3 个主节点（防止脑裂）
- 数据节点根据数据量水平扩展

### 3.3 分片（Shard）

**分片**是 ES 数据分布的核心机制。

**为什么需要分片？**
1. **水平扩展**: 数据分布到多个节点
2. **并行处理**: 搜索操作并行执行
3. **突破限制**: 单节点资源有限

**分片类型**:
- **主分片（Primary Shard）**: 存储原始数据，创建索引时确定（不可修改）
- **副本分片（Replica Shard）**: 主分片的拷贝，可动态调整

**分片规则**:
```
索引数据量 = 主分片数 × 单分片大小
推荐单分片大小：30-50GB
```

**示例**:
```bash
# 创建索引时设置分片
PUT /products
{
  "settings": {
    "number_of_shards": 3,      # 3 个主分片
    "number_of_replicas": 1     # 每个主分片 1 个副本
  }
}

# 动态调整副本数
PUT /products/_settings
{
  "index": {
    "number_of_replicas": 2
  }
}
```

**分片与文档路由**:
```
文档存储位置 = hash(文档 ID) % 主分片数
```
这就是为什么主分片数创建后不能修改的原因。

### 3.4 副本（Replica）

**副本**提供高可用和读性能扩展。

**作用**:
1. **高可用**: 主分片故障，副本自动晋升
2. **读扩展**: 副本可以处理读请求
3. **负载均衡**: 搜索请求分散到多个副本

**注意事项**:
- 副本数必须是整数（0、1、2...）
- 副本不会分配到和主分片相同的节点
- 副本数越多，写入性能越差（需要同步）

### 3.5 集群健康状态

```bash
# 查看集群状态
GET /_cluster/health

# 输出
{
  "status": "green",           # 健康状态
  "number_of_nodes": 3,        # 节点数
  "number_of_data_nodes": 3,   # 数据节点数
  "active_primary_shards": 5,  # 活跃主分片
  "active_shards": 10,         # 活跃分片总数
  "unassigned_shards": 0       # 未分配分片
}
```

**健康状态**:
| 状态 | 含义 | 处理建议 |
|------|------|----------|
| 🟢 green | 所有分片正常 | 无需处理 |
| 🟡 yellow | 主分片正常，部分副本未分配 | 检查节点资源 |
| 🔴 red | 有主分片未分配 | 立即处理，数据不完整 |

---

## 四、实战：快速上手

### 4.1 安装和启动

```bash
# 下载（以 8.x 为例）
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.x.x-linux-x86_64.tar.gz

# 解压
tar -xzf elasticsearch-8.x.x-linux-x86_64.tar.gz

# 启动
./elasticsearch-8.x.x/bin/elasticsearch

# 后台启动
./elasticsearch-8.x.x/bin/elasticsearch -d
```

**Docker 启动**:
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.x.x
```

### 4.2 基本 CRUD 操作

```bash
# ========== 创建 ==========
# 自动分配 ID
POST /users/_doc
{
  "name": "张三",
  "age": 25,
  "email": "zhangsan@example.com"
}

# 指定 ID
PUT /users/_doc/1001
{
  "name": "李四",
  "age": 28
}

# ========== 读取 ==========
# 根据 ID 获取
GET /users/_doc/1001

# 搜索所有
GET /users/_search

# ========== 更新 ==========
# 全量更新
PUT /users/_doc/1001
{
  "name": "李四",
  "age": 29,
  "email": "lisi@example.com"
}

# 部分更新
POST /users/_doc/1001/_update
{
  "doc": {
    "age": 30
  }
}

# ========== 删除 ==========
DELETE /users/_doc/1001
```

### 4.3 简单搜索

```bash
# 匹配查询
GET /users/_search
{
  "query": {
    "match": {
      "name": "张三"
    }
  }
}

# 精确查询
GET /users/_search
{
  "query": {
    "term": {
      "age": 25
    }
  }
}

# 范围查询
GET /users/_search
{
  "query": {
    "range": {
      "age": {
        "gte": 20,
        "lte": 30
      }
    }
  }
}

# 分页
GET /users/_search
{
  "from": 0,
  "size": 10,
  "query": {
    "match_all": {}
  }
}
```

### 4.4 聚合分析

```bash
# 统计各年龄段人数
GET /users/_search
{
  "size": 0,
  "aggs": {
    "age_groups": {
      "range": {
        "field": "age",
        "ranges": [
          { "to": 20 },
          { "from": 20, "to": 30 },
          { "from": 30 }
        ]
      }
    }
  }
}

# 输出
{
  "aggregations": {
    "age_groups": {
      "buckets": [
        { "key": "*-20", "count": 15 },
        { "key": "20-30", "count": 45 },
        { "key": "30-*", "count": 30 }
      ]
    }
  }
}
```

---

## 五、最佳实践

### 5.1 索引设计

```bash
# ✅ 推荐：按时间分索引（日志场景）
logs-app-2026.03.17
logs-app-2026.03.18
logs-app-2026.03.19

# ✅ 推荐：按业务分索引
products-index
orders-index
users-index

# ❌ 避免：所有数据在一个索引
all-data
```

### 5.2 分片规划

```bash
# 预估数据量
日增数据：10GB
保留天数：30 天
总数据量：300GB

# 计算分片数
单分片目标：40GB
主分片数：300 / 40 ≈ 8 个

# 创建索引
PUT /logs-app
{
  "settings": {
    "number_of_shards": 8,
    "number_of_replicas": 1
  }
}
```

### 5.3 写入优化

```bash
# ✅ 推荐：批量写入
POST /_bulk
{ "index": { "_index": "products" } }
{ "name": "商品 1", "price": 100 }
{ "index": { "_index": "products" } }
{ "name": "商品 2", "price": 200 }
{ "index": { "_index": "products" } }
{ "name": "商品 3", "price": 300 }

# ❌ 避免：单条写入（性能差）
POST /products/_doc { ... }
POST /products/_doc { ... }
POST /products/_doc { ... }
```

### 5.4 查询优化

```bash
# ✅ 推荐：使用 filter（不计算评分）
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category": "手机" } },
        { "range": { "price": { "gte": 1000 } } }
      ]
    }
  }
}

# ❌ 避免：深度分页
GET /products/_search { "from": 10000, "size": 10 }

# ✅ 推荐：search_after
GET /products/_search
{
  "size": 10,
  "search_after": [1234567890],
  "sort": [{ "id": "asc" }]
}
```

---

## 六、常见问题

### Q1: ES 为什么搜索这么快？

**A**: 核心是**倒排索引**：
```
正向索引（文档→词）:
文档 1: [苹果，手机，5G]
文档 2: [苹果，电脑，M2]

倒排索引（词→文档）:
苹果: [文档 1, 文档 2]
手机: [文档 1]
电脑: [文档 2]
5G: [文档 1]
M2: [文档 2]
```
搜索"苹果"时，直接定位到文档 1 和 2，无需全表扫描。

### Q2: 分片数设置多少合适？

**A**: 经验公式：
```
分片数 = 总数据量 / 单分片目标大小
单分片目标：30-50GB
```
分片太小：管理开销大
分片太大：恢复慢、影响扩展

### Q3: 写入后为什么搜不到？

**A**: ES 是**近实时**搜索，默认 1 秒刷新一次。解决：
```bash
# 手动刷新
POST /_refresh

# 或调整刷新间隔
PUT /products/_settings
{
  "index": {
    "refresh_interval": "1s"  # 默认值
  }
}
```

### Q4: 如何监控 ES 集群？

```bash
# 集群健康
GET /_cluster/health

# 节点状态
GET /_cat/nodes?v

# 分片状态
GET /_cat/shards?v

# 索引大小
GET /_cat/indices?v

# 慢查询日志（配置）
PUT /_cluster/settings
{
  "index.search.slowlog.threshold.query.warn": "10s"
}
```

---

## 总结

本文介绍了 Elasticsearch 的核心概念和架构：

**核心概念**:
| 概念 | 说明 | 类比 MySQL |
|------|------|-----------|
| 索引 | 数据存储的逻辑分区 | 数据库 |
| 文档 | 最小数据单元（JSON） | 行 |
| 字段 | 数据的属性 | 列 |
| 映射 | 字段类型定义 | Schema |
| 分词器 | 文本切分工具 | - |

**架构组件**:
- **节点**: 集群中的服务器
- **分片**: 数据分布的基本单位
- **副本**: 提供高可用和读扩展
- **集群**: 一个或多个节点组成的整体

**关键要点**:
1. ES 适合全文搜索和聚合分析，不适合事务场景
2. 分片数创建后不可修改，要提前规划
3. 副本数可动态调整，影响读性能和高可用
4. 批量写入性能远高于单条写入
5. 使用 filter 代替 query 提升查询性能

---

## 延伸学习

- 下一篇：**索引设计与映射详解**（待发布）
- 官方文档：https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- 实战练习：安装 ES，完成本文所有示例

---

*本文是 Elasticsearch 系列第 1 篇，下一篇将深入讲解索引设计和映射配置。*
