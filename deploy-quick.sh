#!/bin/bash

echo "🚀 一键部署到 GitHub"
echo "========================================"
echo ""

# 获取 GitHub 用户名
echo "请输入你的 GitHub 用户名:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

REPO_NAME="opinion-monitor"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📦 部署信息:"
echo "   用户名：${GITHUB_USERNAME}"
echo "   仓库名：${REPO_NAME}"
echo "   仓库 URL: ${REPO_URL}"
echo ""

# 检查是否已有远程仓库
if git remote -v | grep -q origin; then
    echo "⚠️ 已存在远程仓库，是否覆盖？(y/n)"
    read -r confirm
    if [ "$confirm" = "y" ]; then
        git remote remove origin
    else
        echo "❌ 取消部署"
        exit 1
    fi
fi

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin "${REPO_URL}"

# 推送代码
echo "📤 推送代码到 GitHub..."
echo "   首次推送可能需要输入 GitHub 用户名和密码"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送完成！"
    echo ""
    echo "========================================"
    echo "📋 接下来的步骤:"
    echo ""
    echo "1️⃣  启用 GitHub Actions:"
    echo "   访问：https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/actions"
    echo "   点击 'I understand my workflows, go ahead and enable them'"
    echo ""
    echo "2️⃣  配置 GitHub Pages:"
    echo "   Settings → Pages → Source: GitHub Actions → Save"
    echo ""
    echo "3️⃣  手动触发数据更新:"
    echo "   Actions → Update Hot News → Run workflow"
    echo ""
    echo "4️⃣  部署网站:"
    echo "   Actions → Deploy to GitHub Pages → Run workflow"
    echo ""
    echo "🌐 部署完成后，访问地址:"
    echo "   https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"
    echo ""
    echo "📖 详细文档:"
    echo "   - QUICKSTART.md - 快速部署指南"
    echo "   - DEPLOY.md - 详细部署文档"
    echo "   - FINAL_REPORT.md - 完成报告"
    echo ""
    echo "========================================"
else
    echo ""
    echo "❌ 推送失败，请检查:"
    echo "   1. GitHub 用户名是否正确"
    echo "   2. 仓库是否已创建"
    echo "   3. 是否有访问权限"
    echo ""
    echo "💡 解决方法:"
    echo "   1. 在 GitHub 创建空仓库：${REPO_NAME}"
    echo "   2. 重新运行此脚本"
    exit 1
fi
