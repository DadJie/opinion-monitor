# 舆情眼 - 快速部署脚本

#!/bin/bash

echo "🚀 开始部署舆情监控系统到 GitHub..."

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 获取用户名
echo "请输入你的 GitHub 用户名:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

REPO_NAME="opinion-monitor"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📦 仓库信息:"
echo "   用户名：${GITHUB_USERNAME}"
echo "   仓库名：${REPO_NAME}"
echo "   仓库 URL: ${REPO_URL}"
echo ""

# 初始化 Git
echo "🔧 初始化 Git..."
git init
git branch -M main

# 添加所有文件
echo "📝 添加文件..."
git add .
git commit -m "Initial commit - 舆情监控系统"

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin "${REPO_URL}" 2>/dev/null || git remote set-url origin "${REPO_URL}"

# 推送代码
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo ""
echo "✅ 代码推送完成！"
echo ""
echo "📋 接下来的步骤："
echo ""
echo "1. 启用 GitHub Actions:"
echo "   访问 https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/actions"
echo "   点击 'I understand my workflows, go ahead and enable them'"
echo ""
echo "2. 配置 GitHub Pages:"
echo "   Settings → Pages → Source: GitHub Actions → Save"
echo ""
echo "3. 手动触发数据更新:"
echo "   Actions → Update Hot News → Run workflow"
echo ""
echo "4. 部署到 GitHub Pages:"
echo "   Actions → Deploy to GitHub Pages → Run workflow"
echo ""
echo "🌐 部署完成后，访问地址:"
echo "   https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"
echo ""
echo "📖 详细文档请查看 DEPLOY.md"
echo ""
