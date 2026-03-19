"""
舆情眼 - FastAPI 后端服务
提供舆情数据的 API 接口
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json
import os

app = FastAPI(
    title="舆情眼 API",
    description="国内重点舆情实时监控平台 - 后端 API 服务",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class Opinion(BaseModel):
    id: int
    title: str
    category: str
    source: str
    publishTime: str
    heat: int
    trend: str
    sentiment: str
    riskLevel: str
    isHot: bool
    isNew: bool
    excerpt: str
    keywords: List[str]
    timeline: List[Dict]
    analysis: Dict

class OpinionSummary(BaseModel):
    id: int
    title: str
    category: str
    source: str
    heat: int
    sentiment: str
    isHot: bool

class Stats(BaseModel):
    total: int
    hot: int
    positive: int
    highRisk: int

# 加载数据
def load_data():
    """加载舆情数据"""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'opinions.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载数据失败：{e}")
        return []

# API 路由
@app.get("/")
async def root():
    """API 根路径"""
    return {
        "message": "欢迎使用舆情眼 API",
        "version": "1.0.0",
        "endpoints": [
            "/api/opinions - 获取舆情列表",
            "/api/opinions/{id} - 获取舆情详情",
            "/api/stats - 获取统计数据",
            "/api/categories - 获取分类列表",
            "/api/search?q=keyword - 搜索舆情"
        ]
    }

@app.get("/api/opinions", response_model=List[OpinionSummary])
async def get_opinions(
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    limit: int = 50
):
    """
    获取舆情列表
    
    - **category**: 分类筛选（可选）
    - **sentiment**: 情感筛选（可选）
    - **limit**: 返回数量限制（默认 50）
    """
    data = load_data()
    
    # 筛选
    if category:
        data = [o for o in data if o['category'] == category]
    if sentiment:
        data = [o for o in data if o['sentiment'] == sentiment]
    
    # 按热度排序
    data = sorted(data, key=lambda x: x['heat'], reverse=True)
    
    # 限制数量
    data = data[:limit]
    
    # 返回简化版
    return [
        {
            "id": o['id'],
            "title": o['title'],
            "category": o['category'],
            "source": o['source'],
            "heat": o['heat'],
            "sentiment": o['sentiment'],
            "isHot": o['isHot']
        }
        for o in data
    ]

@app.get("/api/opinions/{opinion_id}", response_model=Opinion)
async def get_opinion_detail(opinion_id: int):
    """
    获取舆情详情
    
    - **opinion_id**: 舆情 ID
    """
    data = load_data()
    
    for opinion in data:
        if opinion['id'] == opinion_id:
            return opinion
    
    raise HTTPException(status_code=404, detail="舆情未找到")

@app.get("/api/stats", response_model=Stats)
async def get_stats():
    """获取统计数据"""
    data = load_data()
    
    return {
        "total": len(data),
        "hot": len([o for o in data if o['isHot']]),
        "positive": len([o for o in data if o['sentiment'] == 'positive']),
        "highRisk": len([o for o in data if o['riskLevel'] == 'high'])
    }

@app.get("/api/categories")
async def get_categories():
    """获取分类列表"""
    data = load_data()
    
    categories = {}
    for opinion in data:
        cat = opinion['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    return categories

@app.get("/api/search")
async def search_opinions(q: str, limit: int = 20):
    """
    搜索舆情
    
    - **q**: 搜索关键词
    - **limit**: 返回数量限制（默认 20）
    """
    data = load_data()
    
    results = []
    for opinion in data:
        # 搜索标题、摘要、关键词
        if (q.lower() in opinion['title'].lower() or
            q.lower() in opinion['excerpt'].lower() or
            any(q.lower() in kw.lower() for kw in opinion['keywords'])):
            results.append(opinion)
    
    # 按热度排序
    results = sorted(results, key=lambda x: x['heat'], reverse=True)
    
    return results[:limit]

@app.get("/api/timeline/{opinion_id}")
async def get_opinion_timeline(opinion_id: int):
    """获取舆情时间线"""
    data = load_data()
    
    for opinion in data:
        if opinion['id'] == opinion_id:
            return opinion['timeline']
    
    raise HTTPException(status_code=404, detail="舆情未找到")

@app.get("/api/analysis/{opinion_id}")
async def get_opinion_analysis(opinion_id: int):
    """获取舆情 AI 分析"""
    data = load_data()
    
    for opinion in data:
        if opinion['id'] == opinion_id:
            return opinion['analysis']
    
    raise HTTPException(status_code=404, detail="舆情未找到")

# 运行服务
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
