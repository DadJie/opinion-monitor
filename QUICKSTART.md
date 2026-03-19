# 🚀 一键部署到 GitHub

## 方式一：自动脚本（推荐）

```bash
# 进入项目目录
cd /home/admin/openclaw/workspace/opinion-monitor

# 赋予执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

脚本会自动：
1. ✅ 初始化 Git 仓库
2. ✅ 提交所有文件
3. ✅ 添加远程仓库
4. ✅ 推送到 GitHub

然后按照提示完成后续步骤。

---

## 方式二：手动部署

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 上创建空仓库
# 访问：https://github.com/new
# 仓库名：opinion-monitor
# 设为 Public
```

### 2. 推送代码

```bash
cd /home/admin/openclaw/workspace/opinion-monitor

# 初始化 Git
git init
git branch -M main

# 添加文件
git add .
git commit -m "Initial commit - 舆情监控系统"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/YOUR_USERNAME/opinion-monitor.git

# 推送
git push -u origin main
```

### 3. 启用 GitHub Actions

1. 进入你的仓库 → **Actions** 标签页
2. 点击 **"I understand my workflows, go ahead and enable them"**

### 4. 配置 GitHub Pages

1. **Settings** → **Pages**
2. **Source** 选择：**GitHub Actions**
3. 点击 **Save**

### 5. 触发数据更新

1. **Actions** → **Update Hot News**
2. 点击 **Run workflow**
3. 等待完成（约 1-2 分钟）

### 6. 部署网站

1. **Actions** → **Deploy to GitHub Pages**
2. 点击 **Run workflow**
3. 等待完成

### 7. 访问网站

```
https://YOUR_USERNAME.github.io/opinion-monitor/
```

---

## 📊 数据更新

### 自动更新

默认每 30 分钟自动更新一次数据。

修改更新频率（`.github/workflows/update-data.yml`）：

```yaml
on:
  schedule:
    # 每小时更新
    - cron: "0 * * * *"
    
    # 每 15 分钟更新
    - cron: "*/15 * * * *"
```

### 手动更新

1. Actions → Update Hot News
2. Run workflow
3. 等待完成

---

## 🔧 故障排查

### Actions 不运行

```bash
# 检查 Settings → Actions → General
# 确保 "Allow all actions" 已启用
```

### 抓取失败

查看 Actions 日志：
1. Actions → Update Hot News → 最近一次运行
2. 查看 "Run crawler" 步骤

### Pages 不更新

1. 检查 deploy workflow 是否运行
2. 清除浏览器缓存

---

## 📋 完整检查清单

- [ ] 创建 GitHub 仓库
- [ ] 推送代码
- [ ] 启用 Actions
- [ ] 配置 Pages（GitHub Actions）
- [ ] 手动触发数据更新
- [ ] 部署网站
- [ ] 访问测试

---

## 🌐 访问地址

部署成功后：

```
https://YOUR_USERNAME.github.io/opinion-monitor/
```

---

## 💰 成本说明

**GitHub Actions 免费额度**：
- 每月 2000 分钟
- 每次运行约 1-2 分钟
- 每 30 分钟更新一次 ≈ 100 分钟/天

**建议**：
- 个人使用：每 30-60 分钟更新一次
- 如超出额度：减少更新频率或使用自有服务器

---

## 📖 详细文档

- [DEPLOY.md](DEPLOY.md) - 完整部署指南
- [README.md](README.md) - 项目说明

---

**部署完成！🎉**
