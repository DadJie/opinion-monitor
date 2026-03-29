"""
舆情数据爬虫模块 - 真实 API 版本
从各大平台抓取热点舆情数据
"""

import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import json
import re

class OpinionCrawler:
    """舆情爬虫类"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        
        # 平台 API 端点
        self.platforms = {
            'weibo': 'https://m.weibo.cn/api/container/getIndex?containerid=102803',
            'zhihu': 'https://www.zhihu.com/api/v3/feed/topstory/hot-list?limit=20&reverse_order=0',
            'baidu': 'https://top.baidu.com/board?tab=realtime',
            'toutiao': 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
        }
    
    async def fetch_weibo_hot(self) -> List[Dict]:
        """抓取微博热搜"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                # 微博热搜 API
                url = 'https://weibo.com/ajax/side/hotSearch'
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return self.parse_weibo_data(data.get('data', {}).get('realtime', []))
        except Exception as e:
            print(f"抓取微博热搜失败：{e}")
        return []
    
    def parse_weibo_data(self, data: List) -> List[Dict]:
        """解析微博数据"""
        results = []
        for item in data[:15]:  # 取前 15 条
            try:
                results.append({
                    'title': item.get('note', ''),
                    'source': '微博热搜',
                    'heat': int(item.get('num', 0)),
                    'url': f"https://s.weibo.com/weibo?q={item.get('note', '')}",
                    'rank': item.get('rank', 0),
                    'trend': item.get('flag', 0)
                })
            except Exception as e:
                print(f"解析微博数据失败：{e}")
        return results
    
    async def fetch_zhihu_hot(self) -> List[Dict]:
        """抓取知乎热榜"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-list?limit=20&reverse_order=0'
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return self.parse_zhihu_data(data.get('data', []))
        except Exception as e:
            print(f"抓取知乎热榜失败：{e}")
        return []
    
    def parse_zhihu_data(self, data: List) -> List[Dict]:
        """解析知乎数据"""
        results = []
        for item in data[:15]:
            try:
                target = item.get('target', {})
                results.append({
                    'title': target.get('title', ''),
                    'source': '知乎热榜',
                    'heat': int(target.get('followerCount', 0)),
                    'url': f"https://www.zhihu.com/question/{target.get('id', '')}",
                    'excerpt': target.get('excerpt', '')[:100]
                })
            except Exception as e:
                print(f"解析知乎数据失败：{e}")
        return results
    
    async def fetch_baidu_hot(self) -> List[Dict]:
        """抓取百度热搜"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                # 百度热搜 API
                url = 'https://top.baidu.com/board?tab=realtime'
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        return self.parse_baidu_data(html)
        except Exception as e:
            print(f"抓取百度热搜失败：{e}")
        return []
    
    def parse_baidu_data(self, html: str) -> List[Dict]:
        """解析百度数据（从 HTML 中提取）"""
        results = []
        try:
            # 简单正则提取（实际项目建议使用 BeautifulSoup）
            pattern = r'data-index="(\d+)".*?class="c-single-text-ellipsis".*?>([^<]+)'
            matches = re.findall(pattern, html)
            for rank, title in matches[:15]:
                results.append({
                    'title': title.strip(),
                    'source': '百度热搜',
                    'heat': 0,  # 百度数据需要更复杂的解析
                    'url': f"https://www.baidu.com/s?wd={title}",
                    'rank': int(rank)
                })
        except Exception as e:
            print(f"解析百度数据失败：{e}")
        return results
    
    async def fetch_toutiao_hot(self) -> List[Dict]:
        """抓取今日头条热榜"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                url = 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc'
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return self.parse_toutiao_data(data.get('data', []))
        except Exception as e:
            print(f"抓取今日头条失败：{e}")
        return []
    
    def parse_toutiao_data(self, data: List) -> List[Dict]:
        """解析今日头条数据"""
        results = []
        for item in data[:15]:
            try:
                title = item.get('Title', '')
                item_id = item.get('ItemId', '')
                # 生成 URL，如果 ItemId 为空则使用搜索 URL
                if item_id:
                    url = f"https://www.toutiao.com/item/{item_id}/"
                else:
                    # 使用搜索 URL 作为备选
                    import urllib.parse
                    url = f"https://www.toutiao.com/search/?keyword={urllib.parse.quote(title)}"
                
                results.append({
                    'title': title,
                    'source': '今日头条',
                    'heat': int(item.get('HotValue', 0)),
                    'url': url,
                    'excerpt': item.get('Summary', '')[:100]
                })
            except Exception as e:
                print(f"解析今日头条数据失败：{e}")
        return results
    
    async def crawl_all(self) -> List[Dict]:
        """抓取所有平台"""
        tasks = [
            self.fetch_weibo_hot(),
            self.fetch_zhihu_hot(),
            self.fetch_baidu_hot(),
            self.fetch_toutiao_hot(),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 合并结果
        all_opinions = []
        for result in results:
            if isinstance(result, list):
                all_opinions.extend(result)
        
        return all_opinions
    
    def analyze_sentiment(self, text: str) -> str:
        """
        简单情感分析
        返回：'positive', 'negative', 'neutral'
        """
        positive_words = ['好', '优秀', '支持', '点赞', '成功', '突破', '利好', '喜', '贺', '庆', ' triumph', 'win']
        negative_words = ['坏', '差', '反对', '批评', '失败', '事故', '风险', '悲', '亡', '灾', '祸', '调查', '涉嫌']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return 'positive'
        elif neg_count > pos_count:
            return 'negative'
        else:
            return 'neutral'
    
    def assess_risk(self, opinion: Dict) -> str:
        """
        风险评估
        返回：'high', 'medium', 'low'
        """
        high_risk_words = ['事故', '伤亡', '调查', '违规', '风险', '危机', '涉嫌', '违法', '犯罪']
        medium_risk_words = ['争议', '冲突', '抗议', '不满', '质疑']
        
        title = opinion.get('title', '').lower()
        
        if any(word in title for word in high_risk_words):
            return 'high'
        elif any(word in title for word in medium_risk_words) or opinion.get('heat', 0) > 8000000:
            return 'medium'
        else:
            return 'low'
    
    def generate_opinion(self, raw_data: Dict, index: int) -> Dict:
        """生成完整舆情对象"""
        title = raw_data.get('title', '')
        now = datetime.now()
        
        return {
            'id': index + 1,
            'title': title,
            'category': self.categorize(title),
            'source': raw_data.get('source', '未知'),
            'publishTime': now.strftime('%Y-%m-%d %H:%M:%S'),
            'heat': raw_data.get('heat', 0),
            'trend': self.analyze_trend(raw_data),
            'sentiment': self.analyze_sentiment(title),
            'riskLevel': self.assess_risk(raw_data),
            'isHot': raw_data.get('heat', 0) > 5000000,
            'isNew': True,
            'excerpt': raw_data.get('excerpt', title[:50] + '...'),
            'keywords': self.extract_keywords(title),
            'url': raw_data.get('url', '#'),
            'timeline': [
                {
                    'time': now.strftime('%H:%M'),
                    'title': '事件发现',
                    'desc': f'{raw_data.get("source", "系统")} 监测到该热点',
                    'isKey': True
                }
            ],
            'analysis': {
                'sentiment': self.analyze_sentiment(title),
                'sentimentScore': 0.65,
                'riskAssessment': self.assess_risk(raw_data),
                'trendPrediction': '待观察',
                'keyPoints': [
                    '事件正在发展中',
                    '需持续关注官方通报',
                    '建议跟踪后续报道'
                ]
            }
        }
    
    def categorize(self, title: str) -> str:
        """简单分类"""
        categories = {
            '经济': ['经济', '股市', '股票', '金融', '银行', '保险', '基金', '投资', '理财', '政策', '税收'],
            '科技': ['科技', 'AI', '人工智能', '互联网', '手机', '数码', '芯片', '软件', '系统'],
            '娱乐': ['娱乐', '明星', '演员', '歌手', '电影', '电视', '综艺', '演唱会'],
            '社会': ['社会', '事故', '天气', '交通', '安全', '民生', '教育', '医疗'],
            '体育': ['体育', '足球', '篮球', '奥运', '比赛', '冠军', '运动员'],
            '财经': ['财经', '油价', '房价', '物价', '消费', '市场'],
            '国际': ['国际', '外交', '战争', '总统', '联合国'],
        }
        
        title_lower = title.lower()
        for cat, keywords in categories.items():
            if any(kw in title_lower for kw in keywords):
                return cat
        return '社会'  # 默认分类
    
    def analyze_trend(self, raw_data: Dict) -> str:
        """分析趋势"""
        heat = raw_data.get('heat', 0)
        trend = raw_data.get('trend', 0)
        
        if trend > 0 or heat > 8000000:
            return 'rising'
        elif trend < 0:
            return 'falling'
        else:
            return 'stable'
    
    def extract_keywords(self, title: str) -> List[str]:
        """提取关键词（简单版）"""
        # 实际项目应该使用 Jieba 分词
        words = []
        if len(title) > 4:
            words.append(title[:4])
        if len(title) > 8:
            words.append(title[4:8])
        words.append(title.split('，')[0] if '，' in title else title[:6])
        return words[:3]


async def main():
    """主函数"""
    crawler = OpinionCrawler()
    
    print("开始抓取全网热点...")
    raw_data = await crawler.crawl_all()
    print(f"抓取到 {len(raw_data)} 条原始数据")
    
    # 生成完整舆情对象
    opinions = [crawler.generate_opinion(data, i) for i, data in enumerate(raw_data)]
    
    # 保存数据
    output_path = 'data/opinions.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(opinions, f, ensure_ascii=False, indent=2)
    
    print(f"数据已保存到 {output_path}")
    print(f"共 {len(opinions)} 条舆情")
    
    # 打印前 5 条
    for op in opinions[:5]:
        print(f"- [{op['category']}] {op['title']} ({op['source']})")


if __name__ == "__main__":
    asyncio.run(main())
