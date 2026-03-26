#!/bin/bash
# 舆情眼 - 停止服务脚本

echo "🛑 停止舆情眼服务..."

# 停止 8001 端口 (API)
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   停止 API 服务 (端口 8001)..."
    kill $(lsof -t -i:8001) 2>/dev/null
    echo "   ✅ API 服务已停止"
else
    echo "   ℹ️  端口 8001 未使用"
fi

# 停止 3000 端口 (前端)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   停止前端服务 (端口 3000)..."
    kill $(lsof -t -i:3000) 2>/dev/null
    echo "   ✅ 前端服务已停止"
else
    echo "   ℹ️  端口 3000 未使用"
fi

echo ""
echo "✅ 所有服务已停止"
