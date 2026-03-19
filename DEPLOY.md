# 舆情眼 - GitHub Pages 部署指南

## 📋 部署步骤

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`opinion-monitor`
3. 描述：国内重点舆情实时监控平台
4. 设为 **Public**
5. 点击 "Create repository"

### 步骤 2: 推送代码到 GitHub

```bash
# 进入项目目录
cd /home/admin/openclaw/workspace/opinion-monitor

# 初始化 Git（如果还没有）
git init
git branch -M main

# 添加所有文件
git add .
git commit -m "Initial commit - 舆情监控系统"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/YOUR_USERNAME/opinion-monitor.git

# 推送代码
git push -u origin main
```

### 步骤 3: 启用 GitHub Actions

1. 进入你的仓库 → **Actions** 标签页
2. 点击 **"I understand my workflows, go ahead and enable them"**
3. 确认 `update-data.yml` 工作流已启用

### 步骤 4: 配置 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择：**GitHub Actions**
3. 点击 **Save**

### 步骤 5: 手动触发首次数据更新

1. 进入 **Actions** → **Update Hot News**
2. 点击 **Run workflow** → **Run workflow**
3. 等待工作流完成（约 1-2 分钟）
4. 检查 `data/opinions.json` 是否已更新

### 步骤 6: 部署到 GitHub Pages

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

然后：
1. 提交并推送这个文件
2. 进入 **Actions** → **Deploy to GitHub Pages**
3. 点击 **Run workflow**
4. 部署完成后，你会收到一个 URL

---

## 🌐 访问地址

部署成功后，你的网站将通过以下地址访问：

```
https://YOUR_USERNAME.github.io/opinion-monitor/
```

---

## ⚙️ 配置说明

### 数据更新频率

默认每 30 分钟更新一次数据。修改 `.github/workflows/update-data.yml`：

```yaml
on:
  schedule:
    # 每小时整点更新
    - cron: "0 * * * *"
    
    # 每 15 分钟更新
    - cron: "*/15 * * * *"
    
    # 每天 9:00、12:00、18:00 更新
    - cron: "0 1,4,10 * * *"
```

### 数据源配置

编辑 `backend/crawler_real.py` 可以：

- 添加/删除数据源
- 调整抓取策略
- 修改情感分析逻辑

---

## 🔧 故障排查

### 问题 1: Actions 不运行

**解决**：
1. 检查 Settings → Actions → General
2. 确保 "Allow all actions" 已启用
3. 手动触发一次 workflow

### 问题 2: 抓取失败

**查看日志**：
1. Actions → Update Hot News → 最近一次运行
2. 查看 "Run crawler" 步骤的日志
3. 检查错误信息

**常见原因**：
- API 限流（等待一段时间后重试）
- 网络问题（GitHub Actions 网络波动）
- API 变更（需要更新爬虫代码）

### 问题 3: Pages 不更新

**解决**：
1. 检查 deploy workflow 是否运行
2. 查看 Pages 设置中的部署状态
3. 清除浏览器缓存后重试

---

## 📊 监控和维护

### 查看更新状态

```bash
# 查看最近一次更新时间
cat data/opinions.json | jq '.[0].publishTime'
```

### 手动更新数据

1. Actions → Update Hot News
2. Run workflow
3. 等待完成

### 监控 GitHub Actions 使用量

访问：https://github.com/settings/billing

- GitHub Actions 每月免费额度：2000 分钟
- 每次运行约 1-2 分钟
- 每 30 分钟运行一次 ≈ 100 分钟/天 ≈ 3000 分钟/月

**建议**：
- 如果超出免费额度，减少更新频率
- 或考虑使用 Docker 部署到自有服务器

---

## 🚀 高级配置

### 添加更多数据源

编辑 `backend/crawler_real.py`，添加新的抓取方法：

```python
async def fetch_douyin_hot(self) -> List[Dict]:
    """抓取抖音热榜"""
    # 实现代码
    pass

# 在 crawl_all 方法中添加
tasks = [
    self.fetch_weibo_hot(),
    self.fetch_zhihu_hot(),
    self.fetch_douyin_hot(),  # 新增
]
```

### 自定义情感分析

修改 `analyze_sentiment` 方法，添加更多关键词：

```python
def analyze_sentiment(self, text: str) -> str:
    positive_words = ['好', '优秀', '成功', '突破', ...]
    negative_words = ['坏', '事故', '调查', '涉嫌', ...]
    # ...
```

### 添加通知功能

在 workflow 中添加通知：

```yaml
- name: Notify on failure
  if: failure()
  run: |
    # 发送通知（如钉钉、企业微信）
    curl -X POST "your-webhook-url" \
      -H "Content-Type: application/json" \
      -d '{"text": "舆情数据更新失败"}'
```

---

## 📝 注意事项

1. **API 限流**：不要过于频繁地抓取，避免被封 IP
2. **数据准确性**：爬虫代码可能需要根据平台 API 变更进行调整
3. **成本控制**：监控 GitHub Actions 使用量，避免超出免费额度
4. **合规性**：确保爬虫行为符合各平台 robots.txt 和使用条款

---

## 🤝 支持

如有问题，请：
1. 查看 GitHub Actions 日志
2. 检查本部署指南
3. 提交 Issue 到项目仓库

---

**祝部署顺利！** 🎉
