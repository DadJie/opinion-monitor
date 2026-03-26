#!/bin/bash
# 舆情眼 API 测试脚本

API_URL="http://localhost:8001"

echo "🧪 舆情眼 API 测试"
echo "=================="
echo ""

# 测试 1: API 根路径
echo "测试 1: API 根路径"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" ${API_URL}/)
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo "✅ 通过 (HTTP $http_code)"
    echo "响应：$(echo $body | head -c 100)..."
else
    echo "❌ 失败 (HTTP $http_code)"
fi
echo ""

# 测试 2: 获取舆情列表
echo "测试 2: 获取舆情列表 (/api/opinions?limit=3)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_URL}/api/opinions?limit=3")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo "✅ 通过 (HTTP $http_code)"
    echo "响应：$(echo $body | head -c 200)..."
else
    echo "❌ 失败 (HTTP $http_code)"
fi
echo ""

# 测试 3: 获取统计数据
echo "测试 3: 获取统计数据 (/api/stats)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" ${API_URL}/api/stats)
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo "✅ 通过 (HTTP $http_code)"
    echo "响应：$body"
else
    echo "❌ 失败 (HTTP $http_code)"
fi
echo ""

# 测试 4: 获取分类列表
echo "测试 4: 获取分类列表 (/api/categories)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" ${API_URL}/api/categories)
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo "✅ 通过 (HTTP $http_code)"
    echo "响应：$body"
else
    echo "❌ 失败 (HTTP $http_code)"
fi
echo ""

# 测试 5: 搜索舆情
echo "测试 5: 搜索舆情 (/api/search?q=小米)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_URL}/api/search?q=小米")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo "✅ 通过 (HTTP $http_code)"
    echo "响应：$(echo $body | head -c 200)..."
else
    echo "❌ 失败 (HTTP $http_code)"
fi
echo ""

echo "=================="
echo "测试完成"
