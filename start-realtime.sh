#!/bin/bash
# 舆情眼 - 快速启动脚本（实时获取 + 自动刷新）

echo "🚀 启动舆情眼实时服务..."
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python3"
    exit 1
fi

# 检查 uvicorn
if ! command -v uvicorn &> /dev/null; then
    echo "⚠️  未找到 uvicorn，尝试安装..."
    pip3 install uvicorn fastapi
fi

# 进入后端目录
cd "$(dirname "$0")/backend"

echo "📡 启动后端 API 服务..."
echo "   地址：http://localhost:8001"
echo "   API 文档：http://localhost:8001/docs"
echo ""

# 启动后端（后台运行）
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload > ../logs/api.log 2>&1 &
API_PID=$!

echo "✅ 后端服务已启动 (PID: $API_PID)"
echo ""

# 等待 2 秒让服务启动
sleep 2

# 检查服务是否启动成功
if curl -s http://localhost:8001/ > /dev/null; then
    echo "✅ API 服务运行正常"
    echo ""
    echo "📊 访问方式:"
    echo "   前端页面：http://localhost:8001/../index.html"
    echo "   API 文档：http://localhost:8001/docs"
    echo "   API 测试：http://localhost:8001/api/opinions?limit=5"
    echo ""
    echo "🔄 实时功能已启用:"
    echo "   - 自动刷新间隔：30 秒"
    echo "   - 手动刷新：点击顶部「🔄 刷新」按钮"
    echo "   - 状态显示：查看顶部更新时间"
    echo ""
    echo "📝 日志文件：logs/api.log"
    echo "🛑 停止服务：kill $API_PID"
else
    echo "❌ API 服务启动失败，请检查日志："
    echo "   logs/api.log"
    cat ../logs/api.log 2>/dev/null || echo "   (日志文件不存在)"
fi

echo ""
echo "按 Ctrl+C 退出"
