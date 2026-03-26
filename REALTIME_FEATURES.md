# 实时获取与自动刷新功能说明

## ✅ 已实现功能

### 1. 实时 API 数据获取
- 前端从后端 API (`http://localhost:8001`) 实时获取数据
- 不再依赖静态 JSON 文件
- 支持降级模式：API 失败时自动切换到本地文件

### 2. 自动刷新
- **默认间隔**: 30 秒
- **自动启动**: 页面加载后自动开始
- **状态提示**: 显示刷新中/已更新/加载失败状态

### 3. 手动刷新
- 点击顶部「🔄 刷新」按钮可立即刷新
- 刷新中时防止重复请求

### 4. 刷新状态显示
- 🔄 刷新中...
- ✅ 已更新 HH:MM:SS
- ❌ 加载失败 HH:MM:SS（自动降级到本地数据）

## 🔧 配置选项

### 修改自动刷新间隔

编辑 `js/main.js`，修改以下常量：

```javascript
const AUTO_REFRESH_INTERVAL = 30000; // 单位：毫秒
```

常用间隔：
- 15 秒：`15000`
- 30 秒：`30000`（默认）
- 1 分钟：`60000`
- 5 分钟：`300000`

### 修改 API 地址

编辑 `js/main.js`，修改以下常量：

```javascript
const API_BASE_URL = 'http://localhost:8001';
```

部署到服务器时，改为实际地址：
```javascript
const API_BASE_URL = 'https://your-domain.com';
```

## 🚀 启动步骤

### 1. 启动后端 API

```bash
cd /home/admin/openclaw/workspace/opinion-monitor/backend
python3 main.py
```

或使用 uvicorn 直接运行：
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. 打开前端页面

在浏览器中打开：
```
http://localhost:8001/index.html
```

或使用 Live Server 等工具提供静态文件服务。

### 3. 验证功能

打开浏览器控制台（F12），你应该看到：
```
舆情眼初始化完成
API 地址：http://localhost:8001
自动刷新间隔：30 秒
成功加载 XX 条舆情数据
自动刷新触发
成功加载 XX 条舆情数据
...
```

## 🛡️ 容错机制

### API 不可用时
- 自动降级到本地 `data/opinions.json` 文件
- 显示「❌ 加载失败」提示
- 控制台输出错误信息

### 刷新中防抖
- `isRefreshing` 标志防止重复请求
- 刷新期间点击按钮无效
- 控制台输出「正在刷新中，跳过本次请求」

## 📊 性能优化建议

### 1. 调整刷新频率
- 数据量大时，增加刷新间隔（如 60 秒）
- 数据量小时，可减少刷新间隔（如 15 秒）

### 2. 限制数据量
- API 默认返回 100 条数据
- 可在请求时指定：`/api/opinions?limit=50`

### 3. 页面可见性优化（可选）
添加以下代码，在页面不可见时暂停刷新：

```javascript
// 页面可见性变化时暂停/恢复刷新
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopAutoRefresh();
    console.log('页面隐藏，暂停自动刷新');
  } else {
    startAutoRefresh();
    console.log('页面显示，恢复自动刷新');
  }
});
```

## 🔍 调试技巧

### 检查 API 状态
```bash
curl http://localhost:8001/api/opinions?limit=5
```

### 查看浏览器网络请求
- 打开开发者工具（F12）
- 切换到 Network 标签
- 筛选 `opinions` 请求
- 查看响应时间和数据

### 查看日志
- 后端日志：终端输出
- 前端日志：浏览器控制台

## 📝 待扩展功能

- [ ] WebSocket 实时推送（替代轮询）
- [ ] 增量更新（只获取新数据）
- [ ] 刷新间隔 UI 设置
- [ ] 离线缓存（Service Worker）
- [ ] 推送通知（新舆情提醒）

---

**更新时间**: 2026-03-26  
**版本**: v1.0
