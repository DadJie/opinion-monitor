# 🚀 GitHub 部署指南

## 当前状态

✅ 代码已本地提交（27 个文件，5913 行代码）
⚠️ 需要 GitHub 认证才能推送

---

## 方式一：使用 Personal Access Token（推荐）

### 步骤 1：创建 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 填写说明（如：opinion-monitor deploy）
4. 勾选权限：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. 点击 **Generate token**
6. **复制生成的 token**（只显示一次，保存好！）

### 步骤 2：使用 Token 推送

```bash
cd /home/admin/openclaw/workspace/opinion-monitor

# 移除旧的 remote（如果有）
git remote remove origin 2>/dev/null

# 添加 remote（使用 Token）
git remote add origin https://YOUR_TOKEN@github.com/DadJie/opinion-monitor.git

# 推送
git push -u origin main
```

**注意**：将 `YOUR_TOKEN` 替换为你刚生成的 token。

---

## 方式二：使用 SSH（如果你配置了 SSH Key）

### 步骤 1：检查 SSH Key

```bash
ls -la ~/.ssh/id_rsa.pub
```

如果没有，生成一个：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### 步骤 2：添加 SSH Key 到 GitHub

1. 复制公钥内容：
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

2. 访问：https://github.com/settings/keys
3. 点击 **New SSH key**
4. 粘贴公钥内容，保存

### 步骤 3：使用 SSH 推送

```bash
cd /home/admin/openclaw/workspace/opinion-monitor

# 使用 SSH remote
git remote add origin git@github.com:DadJie/opinion-monitor.git

# 推送
git push -u origin main
```

---

## 方式三：在 GitHub 创建仓库后直接推送

### 步骤 1：在 GitHub 创建空仓库

1. 访问：https://github.com/new
2. 仓库名：`opinion-monitor`
3. 设为 **Public**
4. **不要** 勾选 "Add a README file"
5. 点击 **Create repository**

### 步骤 2：按照 GitHub 提示推送

GitHub 会显示推送命令：

```bash
git remote add origin https://github.com/DadJie/opinion-monitor.git
git branch -M main
git push -u origin main
```

执行时会提示输入用户名和密码：
- 用户名：你的 GitHub 用户名
- 密码：使用 Personal Access Token（不是 GitHub 密码）

---

## 推送成功后的步骤

### 1️⃣ 启用 GitHub Actions

访问：https://github.com/DadJie/opinion-monitor/actions

点击 **"I understand my workflows, go ahead and enable them"**

### 2️⃣ 配置 GitHub Pages

1. Settings → Pages
2. **Build and deployment**
   - Source: **GitHub Actions**
3. 点击 **Save**

### 3️⃣ 手动触发数据更新

1. Actions → **Update Hot News**
2. 点击 **Run workflow**
3. 等待 1-2 分钟完成

### 4️⃣ 部署网站

1. Actions → **Deploy to GitHub Pages**
2. 点击 **Run workflow**
3. 等待完成

### 5️⃣ 访问网站

```
https://DadJie.github.io/opinion-monitor/
```

---

## 快速命令汇总

```bash
# 进入项目目录
cd /home/admin/openclaw/workspace/opinion-monitor

# 查看远程仓库
git remote -v

# 如果已有 remote，先移除
git remote remove origin

# 添加 remote（使用 Token）
git remote add origin https://YOUR_TOKEN@github.com/DadJie/opinion-monitor.git

# 推送
git push -u origin main

# 查看推送状态
git status
```

---

## 常见问题

### Q1: 提示 "could not read Username"

**解决**：使用 Personal Access Token，不是 GitHub 密码。

### Q2: 提示 "repository not found"

**解决**：先在 GitHub 创建空仓库 `opinion-monitor`。

### Q3: Token 权限不足

**解决**：确保勾选了 `repo` 和 `workflow` 权限。

### Q4: 推送被拒绝

**解决**：
```bash
# 强制推送（慎用）
git push -f origin main
```

---

## 需要帮助？

告诉我你遇到的问题，我会帮你解决！

---

**下一步**：选择一个部署方式，完成推送后告诉我，我会指导你完成后续配置。
