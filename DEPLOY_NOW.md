# 🚀 手动部署命令

## 方式一：告诉我你的 GitHub 用户名

直接回复我你的 GitHub 用户名，我会帮你自动部署。

## 方式二：手动执行命令

```bash
# 1. 进入项目目录
cd /home/admin/openclaw/workspace/opinion-monitor

# 2. 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/opinion-monitor.git

# 3. 推送代码
git push -u origin main

# 4. 如果提示仓库不存在，先在 GitHub 创建空仓库
# 访问：https://github.com/new
# 仓库名：opinion-monitor
# 然后重新执行步骤 2-3
```

## 方式三：使用部署脚本

```bash
cd /home/admin/openclaw/workspace/opinion-monitor
./deploy-quick.sh
# 然后输入你的 GitHub 用户名
```

---

## 推送完成后的步骤

1. **启用 Actions**
   - 访问：`https://github.com/YOUR_USERNAME/opinion-monitor/actions`
   - 点击 "I understand my workflows, go ahead and enable them"

2. **配置 Pages**
   - Settings → Pages
   - Source: GitHub Actions
   - Save

3. **触发数据更新**
   - Actions → Update Hot News → Run workflow

4. **部署网站**
   - Actions → Deploy to GitHub Pages → Run workflow

5. **访问网站**
   - `https://YOUR_USERNAME.github.io/opinion-monitor/`

---

**请告诉我你的 GitHub 用户名，我会帮你自动完成部署！**
