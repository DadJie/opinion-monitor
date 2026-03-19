#!/bin/bash

echo "🚀 更新舆情监控系统数据源..."
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📦 安装依赖..."
pip3 install aiohttp -q

echo ""
echo "🕷️ 开始抓取全网热点..."
echo "=================================================="

# 运行爬虫
cd backend
python3 crawler_full.py

echo ""
echo "=================================================="
echo "✅ 数据更新完成！"
echo ""
echo "📊 查看数据："
echo "   cat ../data/opinions.json | head -50"
echo ""
echo "🌐 访问网站："
echo "   python3 -m http.server 8000"
echo "   访问 http://localhost:8000"
echo ""
