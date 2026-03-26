#!/bin/bash
# 舆情眼 - 完整启动脚本

echo "🚀 启动舆情眼服务..."
echo ""

# 检查端口占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 停止旧进程
echo "📋 检查旧进程..."
if check_port 8001; then
    echo "   停止 8001 端口的进程..."
    kill $(lsof -t -i:8001) 2>/dev/null
fi
if check_port 3000; then
    echo "   停止 3000 端口的进程..."
    kill $(lsof -t -i:3000) 2>/dev/null
fi
sleep 1

# 创建日志目录
mkdir -p logs

# 启动后端 API (端口 8001)
echo ""
echo "📡 启动后端 API 服务 (端口 8001)..."
cd backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 > ../logs/api.log 2>&1 &
API_PID=$!
cd ..
echo "   ✅ API 服务已启动 (PID: $API_PID)"

# 等待 API 启动
sleep 2

# 检查 API 是否启动成功
if curl -s http://localhost:8001/ >/dev/null 2>&1; then
    echo "   ✅ API 服务运行正常"
else
    echo "   ❌ API 服务启动失败，请检查日志：logs/api.log"
    cat logs/api.log
    exit 1
fi

# 启动前端静态文件服务 (端口 3000)
echo ""
echo "🌐 启动前端静态文件服务 (端口 3000)..."
nohup python3 -m http.server 3000 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
sleep 1

# 检查前端是否启动成功
if curl -s http://localhost:3000/ >/dev/null 2>&1; then
    echo "   ✅ 前端服务运行正常"
else
    echo "   ❌ 前端服务启动失败"
    exit 1
fi

# 显示访问信息
echo ""
echo "=========================================="
echo "✅ 服务启动成功！"
echo "=========================================="
echo ""
echo "📊 访问地址:"
echo "   首页：http://localhost:3000/index.html"
echo "   详情页示例：http://localhost:3000/detail.html?id=1"
echo "   数据看板：http://localhost:3000/dashboard.html"
echo ""
echo "🔧 API 端点:"
echo "   API 根路径：http://localhost:8001/"
echo "   API 文档：http://localhost:8001/docs"
echo "   舆情列表：http://localhost:8001/api/opinions"
echo ""
echo "📝 日志文件:"
echo "   API 日志：logs/api.log"
echo "   前端日志：logs/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   kill $API_PID $FRONTEND_PID"
echo "   或运行：./stop.sh"
echo ""
echo "=========================================="
echo ""
echo "按 Ctrl+C 退出（服务会在后台继续运行）"

# 保持脚本运行
wait
