# MySQL 架构与存储引擎

> **系列**: MySQL 系列第 1 篇  
> **难度**: ⭐⭐ 基础  
> **阅读时间**: 约 20 分钟  
> **上一篇**: 无 | **下一篇**: 索引原理与 B+ 树详解（待发布）

---

## 引言

MySQL 是全球最流行的开源关系型数据库，从创业公司到互联网巨头，几乎无处不在。然而，很多开发者使用 MySQL 多年，却对其内部架构一知半解。

**为什么需要理解 MySQL 架构？**

- 写出更高效的 SQL
- 快速定位性能问题
- 合理设计表结构和索引
- 选择正确的存储引擎

本文将从宏观到微观，全面解析 MySQL 的整体架构和核心存储引擎，帮你建立系统的知识框架。

---

## 一、MySQL 整体架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      应用层                              │
│                 (Java/Python/Go/...)                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   连接层 (Connection)                    │
│   • 连接管理  • 身份认证  • 权限验证  • 线程池          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 服务层 (Server Layer)                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              SQL 接口                            │    │
│  │  • 解析器 (Parser)                               │    │
│  │  • 分析器 (Analyzer)                             │    │
│  │  • 优化器 (Optimizer)                            │    │
│  │  • 缓存 (Query Cache - 8.0 已移除)               │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              内置函数                            │    │
│  │  • 日期函数  • 数学函数  • 加密函数  • ...       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 引擎层 (Storage Engine)                  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│  │InnoDB │ │ MyISAM│ │Memory │ │Archive│ │ ...  │    │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               存储层 (File System)                       │
│   • 数据文件 (.ibd)  • 日志文件  • 配置文件             │
└─────────────────────────────────────────────────────────┘
```

### 1.2 各层职责

#### 连接层
负责处理客户端连接，包括：
- **连接管理**: 维护连接池，复用连接
- **身份认证**: 验证用户名密码
- **权限验证**: 检查用户是否有执行权限
- **线程管理**: 为每个连接分配线程（一连接一线程模型）

#### 服务层
MySQL 的"大脑"，处理所有 SQL 操作：

**1. 解析器 (Parser)**
```sql
SELECT * FROM users WHERE id = 1;
```
解析器将 SQL 文本解析成**语法树**，检查语法是否正确。

**2. 分析器 (Analyzer)**
- 检查表是否存在
- 检查字段是否存在
- 验证权限

**3. 优化器 (Optimizer)**
- 选择使用哪个索引
- 决定表连接顺序
- 生成执行计划

**4. 执行器 (Executor)**
- 调用存储引擎接口
- 返回结果给客户端

#### 引擎层
负责**数据的存储和提取**，不同引擎有不同特性：
- InnoDB: 支持事务、行锁（默认）
- MyISAM: 不支持事务、表锁
- Memory: 内存存储、速度快
- Archive: 归档存储、压缩率高

#### 存储层
操作系统文件系统，负责实际数据存储。

---

## 二、存储引擎详解

### 2.1 InnoDB（默认引擎）

MySQL 5.5+ 的默认引擎，支持事务和行级锁。

**核心特性**:
- ✅ 支持 ACID 事务
- ✅ 支持行级锁
- ✅ 支持外键约束
- ✅ 支持 MVCC（多版本并发控制）
- ✅ 崩溃恢复能力强

**适用场景**:
- 需要事务支持的业务（订单、支付）
- 高并发读写
- 数据一致性要求高

**表创建示例**:
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**物理存储结构**:
```
ibdata1          # 系统表空间（共享）
ib_logfile0      # 重做日志
ib_logfile1      # 重做日志
table_name.ibd   # 表空间文件（每表一个）
```

### 2.2 MyISAM（ legacy 引擎）

MySQL 5.5 之前的默认引擎，现在已不推荐使用。

**核心特性**:
- ❌ 不支持事务
- ❌ 不支持行级锁（只有表锁）
- ❌ 不支持外键
- ✅ 读性能较好
- ✅ 存储空间较小

**适用场景**:
- 只读或读多写少
- 不需要事务
- 历史数据归档

**查看表引擎**:
```sql
SHOW TABLE STATUS LIKE 'table_name';
SHOW CREATE TABLE table_name;
```

### 2.3 其他引擎

| 引擎 | 特点 | 适用场景 |
|------|------|----------|
| Memory | 数据存储在内存 | 临时表、缓存 |
| Archive | 高压缩比 | 历史数据归档 |
| CSV | CSV 格式存储 | 数据交换 |
| Federated | 远程表访问 | 分布式查询 |

---

## 三、InnoDB 核心机制

### 3.1 事务（Transaction）

事务是 InnoDB 最核心的特性，保证数据的 ACID 属性。

**ACID 四特性**:

| 特性 | 含义 | 实现机制 |
|------|------|----------|
| **A**tomicity（原子性） | 要么全做，要么全不做 | Undo Log |
| **C**onsistency（一致性） | 数据从一个一致状态到另一个一致状态 | 约束 + 触发器 |
| **I**solation（隔离性） | 事务之间互不干扰 | 锁 + MVCC |
| **D**urability（持久性） | 提交后永久保存 | Redo Log |

**事务示例**:
```sql
-- 开启事务
START TRANSACTION;

-- 扣减库存
UPDATE products SET stock = stock - 1 WHERE id = 1001;

-- 创建订单
INSERT INTO orders (product_id, user_id) VALUES (1001, 5001);

-- 提交事务
COMMIT;

-- 或者回滚
-- ROLLBACK;
```

### 3.2 锁机制

InnoDB 支持多种锁：

**1. 行锁（Row Lock）**
```sql
-- 共享锁（读锁）
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁（写锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;
```

**2. 表锁（Table Lock）**
```sql
LOCK TABLES users WRITE;
-- 操作...
UNLOCK TABLES;
```

**3. 意向锁（Intention Lock）**
- 事务在获取行锁前，先获取表的意向锁
- 用于判断表是否可以加表锁

**锁粒度对比**:
| 锁类型 | 粒度 | 并发度 | 开销 |
|--------|------|--------|------|
| 表锁 | 整张表 | 低 | 小 |
| 行锁 | 单行 | 高 | 大 |
| 间隙锁 | 索引间隙 | 中 | 中 |

### 3.3 MVCC（多版本并发控制）

MVCC 让读写操作不冲突，大幅提升并发性能。

**原理**:
- 每行数据有多个版本
- 读操作读取历史版本，不阻塞写
- 写操作创建新版本

**隐藏字段**:
每行记录有三个隐藏字段：
- `DB_TRX_ID`: 最近修改事务的 ID
- `DB_ROLL_PTR`: 回滚指针，指向 Undo Log
- `DB_ROW_ID`: 隐藏的行 ID

**读视图（Read View）**:
- 事务启动时创建
- 记录当前活跃事务列表
- 判断哪个版本的数据可见

### 3.4 日志系统

InnoDB 有三种日志：

**1. Redo Log（重做日志）**
- 记录数据修改
- 崩溃恢复用
- 循环写入（固定大小）
- WAL（Write-Ahead Logging）技术

**2. Undo Log（回滚日志）**
- 记录反向操作
- 事务回滚用
- MVCC 版本链

**3. Binlog（归档日志）**
- Server 层产生
- 记录所有修改
- 主从复制用
- 追加写入

**Redo Log vs Binlog**:
| 特性 | Redo Log | Binlog |
|------|----------|--------|
| 产生层 | 引擎层 | Server 层 |
| 写入方式 | 循环写 | 追加写 |
| 用途 | 崩溃恢复 | 主从复制、数据恢复 |
| 格式 | 物理日志 | 逻辑日志 |

---

## 四、实战：查看和分析

### 4.1 查看引擎信息

```sql
-- 查看所有支持的引擎
SHOW ENGINES;

-- 查看默认引擎
SHOW VARIABLES LIKE 'storage_engine';

-- 查看表的引擎
SELECT table_name, engine 
FROM information_schema.tables 
WHERE table_schema = 'your_database';
```

### 4.2 查看事务状态

```sql
-- 查看活跃事务
SELECT * FROM information_schema.innodb_trx;

-- 查看锁等待
SELECT * FROM information_schema.innodb_lock_waits;

-- 查看锁信息
SELECT * FROM performance_schema.data_locks;
```

### 4.3 查看日志配置

```sql
-- Redo Log 配置
SHOW VARIABLES LIKE 'innodb_log_file_size';
SHOW VARIABLES LIKE 'innodb_log_files_in_group';

-- Binlog 配置
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';

-- 查看 Binlog 文件
SHOW BINARY LOGS;
```

### 4.4 性能监控

```sql
-- 查看 InnoDB 状态
SHOW ENGINE INNODB STATUS\G

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看当前连接
SHOW PROCESSLIST;
```

---

## 五、最佳实践

### 5.1 引擎选择

```sql
-- ✅ 推荐：明确指定引擎
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    amount DECIMAL(10,2)
) ENGINE=InnoDB;

-- ❌ 避免：依赖默认值（可能变化）
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    amount DECIMAL(10,2)
);
```

### 5.2 事务使用

```sql
-- ✅ 推荐：短事务
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- ❌ 避免：长事务（占用资源）
START TRANSACTION;
SELECT * FROM huge_table;  -- 耗时很长
-- ... 其他操作
COMMIT;
```

### 5.3 锁优化

```sql
-- ✅ 推荐：精确锁（走索引）
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- ❌ 避免：全表锁（不走索引）
SELECT * FROM users WHERE name = '张三' FOR UPDATE;
-- 如果 name 没有索引，会锁全表
```

### 5.4 配置优化

```ini
# my.cnf 推荐配置
[mysqld]
# InnoDB 缓冲池（物理内存的 50-70%）
innodb_buffer_pool_size = 4G

# Redo Log 大小
innodb_log_file_size = 512M

# 日志缓冲区
innodb_log_buffer_size = 64M

# 刷新策略（1=最安全，0=性能最好）
innodb_flush_log_at_trx_commit = 1

# 最大连接数
max_connections = 500
```

---

## 六、常见问题

### Q1: 为什么我的表不支持事务？

**A**: 检查表的存储引擎：
```sql
SHOW CREATE TABLE your_table;
```
如果不是 InnoDB，转换引擎：
```sql
ALTER TABLE your_table ENGINE=InnoDB;
```

### Q2: 死锁怎么解决？

**A**: 
1. 查看死锁信息：`SHOW ENGINE INNODB STATUS\G`
2. 常见原因：
   - 事务交叉更新多行
   - 索引使用不当导致锁升级
3. 解决方案：
   - 固定访问顺序
   - 减少事务粒度
   - 添加合适索引

### Q3: Redo Log 满了会怎样？

**A**: 数据库会暂停，等待 Redo Log 刷盘。解决方法：
- 增大 Redo Log 文件
- 优化大事务，拆分成小事务
- 调整 `innodb_log_file_size`

### Q4: 如何选择事务隔离级别？

**A**: MySQL 支持四种隔离级别：
```sql
-- 查看当前级别
SELECT @@tx_isolation;

-- 设置级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

| 级别 | 脏读 | 不可重复读 | 幻读 | 推荐 |
|------|------|------------|------|------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ | 不推荐 |
| READ COMMITTED | ❌ | ✅ | ✅ | 一般 |
| REPEATABLE READ（默认）| ❌ | ❌ | ✅ | 推荐 |
| SERIALIZABLE | ❌ | ❌ | ❌ | 特殊场景 |

---

## 总结

本文介绍了 MySQL 的整体架构和存储引擎：

**核心要点**:
1. MySQL 采用分层架构：连接层 → 服务层 → 引擎层 → 存储层
2. InnoDB 是默认引擎，支持事务、行锁、MVCC
3. 事务保证 ACID，通过日志系统实现
4. 锁机制影响并发性能，要合理使用
5. Redo Log 用于崩溃恢复，Binlog 用于主从复制

**知识框架**:
```
MySQL 架构
├── 连接层（连接管理、权限验证）
├── 服务层（SQL 解析、优化、执行）
├── 引擎层（InnoDB、MyISAM...）
│   ├── 事务（ACID）
│   ├── 锁（行锁、表锁、间隙锁）
│   ├── MVCC（多版本并发控制）
│   └── 日志（Redo、Undo、Binlog）
└── 存储层（文件系统）
```

---

## 延伸学习

- 下一篇：**索引原理与 B+ 树详解**（待发布）
- 官方文档：https://dev.mysql.com/doc/
- 推荐书籍：《MySQL 技术内幕：InnoDB 存储引擎》

---

*本文是 MySQL 系列第 1 篇，下一篇将深入讲解索引原理和 B+ 树。*
