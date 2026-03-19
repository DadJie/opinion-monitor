# 舆情眼 - 数据源配置指南

## 📊 支持的数据源

### 已接入平台（10+）

| 平台 | 类型 | 状态 | 更新频率 |
|------|------|------|---------|
| **微博热搜** | 社交媒体 | ✅ | 实时 |
| **知乎热榜** | 问答社区 | ✅ | 实时 |
| **抖音热榜** | 短视频 | ✅ | 实时 |
| **快手热榜** | 短视频 | ✅ | 实时 |
| **B 站热榜** | 视频社区 | ✅ | 实时 |
| **虎扑热帖** | 体育社区 | ✅ | 实时 |
| **豆瓣电影** | 影视评分 | ✅ | 实时 |
| **百度热搜** | 搜索引擎 | ✅ | 实时 |
| **今日头条** | 新闻资讯 | ✅ | 实时 |

### 分类覆盖

- 📱 **社交媒体**：微博、知乎
- 🎬 **视频平台**：抖音、快手、B 站
- 📰 **新闻资讯**：今日头条、百度热搜
- 🎮 **垂直社区**：虎扑（体育）、豆瓣（影视）

---

## 🔧 自定义数据源

### 添加新平台

编辑 `backend/crawler_full.py`，添加新的抓取方法：

```python
async def fetch_new_platform_hot(self) -> List[Dict]:
    """抓取新平台热榜"""
    try:
        async with aiohttp.ClientSession(headers=self.headers) as session:
            url = 'https://api.example.com/hot-list'
            async with session.get(url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return self.parse_new_platform_data(data)
    except Exception as e:
        print(f"抓取新平台失败：{e}")
    return []

def parse_new_platform_data(self, data: List) -> List[Dict]:
    """解析新平台数据"""
    results = []
    for item in data[:20]:
        results.append({
            'title': item.get('title', ''),
            'source': '新平台',
            'heat': int(item.get('hot', 0)),
            'url': item.get('url', ''),
            'platform': 'new_platform'
        })
    return results

# 在 crawl_all 方法中添加
async def crawl_all(self) -> List[Dict]:
    tasks = [
        self.fetch_weibo_hot(),
        self.fetch_new_platform_hot(),  # 新增
    ]
```

### 调整更新频率

编辑 `.github/workflows/update-data.yml`：

```yaml
on:
  schedule:
    # 每 30 分钟更新（默认）
    - cron: "*/30 * * * *"
    
    # 每小时更新
    - cron: "0 * * * *"
    
    # 每 15 分钟更新（高频）
    - cron: "*/15 * * * *"
    
    # 仅高峰时段更新（9:00-22:00）
    - cron: "0 1-14 * * *"
```

### 配置平台权重

在 `generate_opinion` 方法中调整热度计算：

```python
# 不同平台的热度权重
platform_weights = {
    'weibo': 1.0,      # 微博
    'zhihu': 0.8,      # 知乎
    'douyin': 1.2,     # 抖音（权重更高）
    'bili': 0.9,       # B 站
}

weight = platform_weights.get(platform, 1.0)
heat = raw_heat * weight
```

---

## 📈 数据质量优化

### 去重策略

```python
def remove_duplicates(self, opinions: List[Dict]) -> List[Dict]:
    """去除重复舆情"""
    seen_titles = set()
    unique = []
    for op in opinions:
        title = op['title']
        if title not in seen_titles:
            seen_titles.add(title)
            unique.append(op)
    return unique
```

### 数据验证

```python
def validate_opinion(self, opinion: Dict) -> bool:
    """验证舆情数据有效性"""
    # 检查必填字段
    required = ['title', 'source', 'heat']
    if not all(k in opinion for k in required):
        return False
    
    # 检查标题长度
    if len(opinion.get('title', '')) < 2:
        return False
    
    # 检查热度值
    if opinion.get('heat', 0) < 0:
        return False
    
    return True
```

### 错误处理

```python
async def safe_fetch(self, func, platform: str) -> List[Dict]:
    """安全抓取（带重试）"""
    max_retries = 3
    for i in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if i == max_retries - 1:
                print(f"{platform} 抓取失败：{e}")
                return []
            await asyncio.sleep(2 ** i)  # 指数退避
    return []
```

---

## 🔍 监控和日志

### 查看抓取日志

```bash
# GitHub Actions 日志
Actions → Update Hot News → 最近一次运行 → 查看日志

# 本地运行日志
cd backend
python crawler_full.py
```

### 数据统计

每次运行后会输出：

```
🚀 开始抓取全网热点...
==================================================
✅ 抓取到 180 条原始数据
==================================================
📁 数据已保存到 data/opinions.json
📊 共 180 条舆情
==================================================
📈 平台分布:
   weibo: 20 条
   douyin: 20 条
   zhihu: 20 条
   bili: 20 条
   ...
```

---

## 🛠️ 故障排查

### 问题 1: 某平台抓取失败

**原因**：
- API 变更
- 网络问题
- 限流封禁

**解决**：
1. 检查 Actions 日志
2. 验证 API 端点是否可用
3. 更新解析逻辑
4. 使用备用 API

### 问题 2: 数据量少

**原因**：
- 部分平台抓取失败
- 过滤条件过严

**解决**：
1. 检查各平台返回数据
2. 调整抓取数量限制（从 20 改为 30）
3. 添加备用数据源

### 问题 3: 热度值异常

**原因**：
- 不同平台热度计算方式不同

**解决**：
```python
# 标准化热度值
def normalize_heat(self, heat: int, platform: str) -> int:
    weights = {
        'weibo': 1.0,
        'douyin': 0.5,    # 抖音热度值偏高，需要调整
        'zhihu': 2.0,     # 知乎热度值偏低
    }
    return int(heat * weights.get(platform, 1.0))
```

---

## 📊 平台 API 说明

### 微博热搜
- **API**: `https://weibo.com/ajax/side/hotSearch`
- **频率**: 实时
- **限制**: 无明显限制

### 知乎热榜
- **API**: `https://www.zhihu.com/api/v3/feed/topstory/hot-list`
- **频率**: 实时
- **限制**: 需要 User-Agent

### 抖音热榜
- **API**: `https://www.douyin.com/aweme/v1/web/hot/search/list/`
- **频率**: 实时
- **限制**: 需要设备参数

### B 站热榜
- **API**: `https://api.bilibili.com/x/web-interface/ranking/v2`
- **频率**: 每小时
- **限制**: 无认证要求

---

## 🚀 性能优化

### 并发抓取

```python
async def crawl_all(self) -> List[Dict]:
    tasks = [
        self.fetch_weibo_hot(),
        self.fetch_zhihu_hot(),
        # ... 所有平台
    ]
    # 并发执行
    results = await asyncio.gather(*tasks, return_exceptions=True)
```

### 缓存机制

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_parse(self, data: str) -> List[Dict]:
    """缓存解析结果"""
    return self.parse_data(data)
```

### 超时设置

```python
async with session.get(url, timeout=10) as resp:
    # 10 秒超时
```

---

## 📝 最佳实践

1. **多数据源**：至少配置 5+ 个平台，避免单点故障
2. **备用 API**：关键平台配置备用数据源
3. **错误处理**：所有抓取操作都要有 try-except
4. **日志记录**：记录每次抓取的详细信息
5. **监控告警**：连续失败时发送通知

---

## 🎯 扩展建议

### 添加更多平台

- 小红书
- 微信视频号
- 淘宝热搜
- 京东热榜
- 什么值得买

### 增强功能

- 评论情感分析
- 传播路径追踪
- KOL 影响力分析
- 跨平台对比

---

**持续更新中...** 🔄
