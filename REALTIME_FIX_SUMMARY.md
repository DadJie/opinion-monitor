# 实时获取与自动刷新功能 - 修复总结

## 📋 问题描述
项目原本从静态 JSON 文件 (`data/opinions.json`) 加载数据，没有实现实时获取和自动刷新功能。

## ✅ 修复内容

### 1. 前端修改 (`js/main.js`)

#### 新增配置项
```javascript
const API_BASE_URL = 'http://localhost:8001';
const AUTO_REFRESH_INTERVAL = 30000; // 30 秒
let autoRefreshTimer = null;
let isRefreshing = false;
```

#### 修改 `loadOpinions()` 函数
- ✅ 从 API 获取数据（而非静态 JSON）
- ✅ 添加刷新状态管理（防止重复请求）
- ✅ 添加降级模式（API 失败时加载本地文件）
- ✅ 添加刷新状态提示

#### 新增函数
- ✅ `updateRefreshStatus(status)` - 显示刷新状态
- ✅ `startAutoRefresh()` - 启动自动刷新定时器
- ✅ `stopAutoRefresh()` - 停止自动刷新
- ✅ 改进的 `refreshData()` - 手动刷新（带防抖）

#### 页面生命周期管理
- ✅ 页面加载时自动启动刷新
- ✅ 页面卸载时清理定时器

### 2. 后端修改 (`backend/main.py`)

#### 修改 `/api/opinions` 端点
- ✅ 返回完整数据（而非简化版）
- ✅ 包含所有字段：`trend`, `riskLevel`, `isNew`, `keywords`, `timeline`, `analysis`
- ✅ 默认 limit 从 50 改为 100

### 3. 新增文件

| 文件 | 用途 |
|------|------|
| `REALTIME_FEATURES.md` | 功能说明文档 |
| `start-realtime.sh` | 快速启动脚本 |
| `test-api.sh` | API 测试脚本 |

## 🎯 功能特性

### 实时获取
- 从后端 API 实时获取最新数据
- 支持完整字段（趋势、风险等级、情感分析等）
- 降级模式：API 不可用时自动切换到本地文件

### 自动刷新
- 默认 30 秒自动刷新一次
- 可配置刷新间隔（修改 `AUTO_REFRESH_INTERVAL`）
- 页面加载后自动启动
- 页面卸载时自动清理

### 手动刷新
- 点击顶部「🔄 刷新」按钮立即刷新
- 刷新中防止重复请求（防抖）
- 显示刷新状态提示

### 状态提示
| 状态 | 显示 |
|------|------|
| 刷新中 | 🔄 刷新中... HH:MM:SS |
| 成功 | ✅ 已更新 HH:MM:SS |
| 失败 | ❌ 加载失败 HH:MM:SS |

## 🚀 使用方法

### 快速启动
```bash
cd /home/admin/openclaw/workspace/opinion-monitor
./start-realtime.sh
```

### 手动启动
```bash
# 1. 启动后端
cd backend
python3 main.py

# 2. 打开前端页面
# 浏览器访问：http://localhost:8001/../index.html
```

### 测试 API
```bash
./test-api.sh
```

### 验证功能
1. 打开浏览器开发者工具（F12）
2. 查看控制台日志：
   ```
   舆情眼初始化完成
   API 地址：http://localhost:8001
   自动刷新间隔：30 秒
   成功加载 XX 条舆情数据
   自动刷新触发
   ...
   ```
3. 观察顶部更新时间是否每秒更新
4. 等待 30 秒，查看是否自动刷新

## 🔧 配置说明

### 修改刷新间隔
编辑 `js/main.js`:
```javascript
const AUTO_REFRESH_INTERVAL = 60000; // 改为 60 秒
```

### 修改 API 地址
编辑 `js/main.js`:
```javascript
const API_BASE_URL = 'https://your-domain.com';
```

## 📊 性能优化

### 已实现
- ✅ 防抖机制（防止重复刷新）
- ✅ 降级模式（API 失败时加载本地数据）
- ✅ 限制数据量（默认 100 条）

### 可选优化
- 页面不可见时暂停刷新
- 增量更新（只获取新数据）
- WebSocket 实时推送（替代轮询）
- Service Worker 离线缓存

## 🐛 故障排查

### API 无法连接
```bash
# 检查后端是否运行
curl http://localhost:8001/

# 查看后端日志
cat logs/api.log
```

### 数据不更新
1. 检查浏览器控制台是否有错误
2. 检查 Network 标签中的 API 请求
3. 确认后端数据源已更新

### 自动刷新不工作
1. 检查浏览器控制台日志
2. 确认页面未进入后台（某些浏览器会暂停后台页面）
3. 检查 `autoRefreshTimer` 是否被意外清除

## 📝 后续计划

- [ ] WebSocket 实时推送
- [ ] 增量更新（只获取新增数据）
- [ ] UI 设置刷新间隔
- [ ] 离线缓存（Service Worker）
- [ ] 推送通知（新舆情提醒）
- [ ] 页面可见性优化（后台暂停刷新）

---

**修复时间**: 2026-03-26  
**版本**: v1.0  
**状态**: ✅ 已完成
