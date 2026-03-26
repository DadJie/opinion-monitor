# 舆情眼 - 运行指南

## 🚨 重要：需要同时运行两个服务！

舆情眼项目需要**两个独立的服务**：

| 服务 | 端口 | 用途 | 命令 |
|------|------|------|------|
| **后端 API** | 8001 | 提供数据接口 | `python3 -m uvicorn main:app --port 8001` |
| **前端静态文件** | 3000 | 提供 HTML/CSS/JS | `python3 -m http.server 3000` |

## ⚡ 快速启动（推荐）

```bash
cd /home/admin/openclaw/workspace/opinion-monitor
./start.sh
```

启动后访问：
- **首页**: http://localhost:3000/index.html
- **详情页**: http://localhost:3000/detail.html?id=1
- **API 文档**: http://localhost:8001/docs

## 📋 手动启动

### 1. 启动后端 API（终端 1）
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001
```

### 2. 启动前端静态文件（终端 2）
```bash
cd /home/admin/openclaw/workspace/opinion-monitor
python3 -m http.server 3000
```

### 3. 访问页面
浏览器打开：http://localhost:3000/index.html

## 🛑 停止服务

```bash
./stop.sh
```

或手动停止：
```bash
# 找到进程 PID
lsof -i :8001
lsof -i :3000

# 停止进程
kill <PID>
```

## 🔍 故障排查

### 问题 1: 详情页一直加载中

**症状**: 打开 `detail.html` 后一直显示"正在加载事件详情..."

**原因**: 后端 API 未启动或无法访问

**解决**:
1. 检查 API 是否运行：`curl http://localhost:8001/`
2. 如果没有响应，启动 API：`cd backend && python3 -m uvicorn main:app --port 8001`
3. 检查浏览器控制台（F12）的错误信息

### 问题 2: 页面显示但数据不加载

**症状**: 页面能打开，但数据列表为空

**原因**: 
- 前端访问了错误的 API 地址
- CORS 问题

**解决**:
1. 打开浏览器控制台（F12）
2. 查看 Network 标签，检查 API 请求是否成功
3. 确认 API 地址是 `http://localhost:8001`

### 问题 3: 端口被占用

**症状**: 启动时提示 "Address already in use"

**解决**:
```bash
# 停止占用端口的进程
./stop.sh

# 或手动查找并停止
lsof -i :8001
kill <PID>
```

### 问题 4: 缺少依赖

**症状**: `ModuleNotFoundError: No module named 'fastapi'`

**解决**:
```bash
pip3 install fastapi uvicorn
```

## 📊 服务架构

```
┌──────────────────────────────────────────┐
│           浏览器访问                      │
│    http://localhost:3000/index.html      │
└─────────────────┬────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────┐
│      前端静态文件服务 (Python HTTP)       │
│           端口：3000                      │
│   提供：HTML, CSS, JavaScript 文件        │
└─────────────────┬────────────────────────┘
                  │
                  │ fetch() API 请求
                  ↓
┌──────────────────────────────────────────┐
│       后端 API 服务 (FastAPI)             │
│           端口：8001                      │
│   提供：/api/opinions 等数据接口          │
│   数据源：data/opinions.json              │
└──────────────────────────────────────────┘
```

## 🔗 常用链接

| 页面 | URL |
|------|-----|
| 首页 | http://localhost:3000/index.html |
| 舆情详情 | http://localhost:3000/detail.html?id=1 |
| 数据看板 | http://localhost:3000/dashboard.html |
| API 文档 | http://localhost:8001/docs |
| API 测试 | http://localhost:8001/api/opinions |

## 📝 日志文件

- **API 日志**: `logs/api.log`
- **前端日志**: `logs/frontend.log`

查看日志：
```bash
tail -f logs/api.log
tail -f logs/frontend.log
```

## 🚀 生产环境部署

如果要部署到生产环境：

1. **使用 Nginx 反向代理**
2. **使用 Gunicorn 运行 FastAPI**
3. **配置域名和 HTTPS**
4. **使用 systemd 管理进程**

详见：`DEPLOY.md`

---

**更新时间**: 2026-03-26  
**版本**: v1.1
