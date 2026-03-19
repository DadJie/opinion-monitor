"""
舆情数据爬虫模块 - 最终优化版
包含所有改进：Jieba 分词、URL 修复、情感分析增强、跨平台去重
"""

import aiohttp
import asyncio
from datetime import datetime
from typing import List, Dict, Tuple
import json
import re
import os

# 尝试导入 Jieba
try:
    import jieba
    JIEBA_AVAILABLE = True
except ImportError:
    JIEBA_AVAILABLE = False
    print("⚠️ Jieba 未安装，使用简单分词模式")

class OpinionCrawler:
    """舆情爬虫类 - 最终优化版"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.google.com/',
        }
        
        # 加载停用词
        self.stopwords = self.load_stopwords()
        
        # 情感词典（增强版）
        self.positive_words = {
            '好', '优秀', '支持', '点赞', '成功', '突破', '利好', '喜', '贺', '庆',
            'win', 'triumph', '胜利', '赢', '进步', '发展', '提升', '改善', '优化',
            '创新', '领先', '第一', '首创', '重磅', '惊喜', '期待', '好评', '推荐',
            '赞赏', '认可', '肯定', '表扬', '鼓励', '祝福', '恭喜', '庆祝', '欢乐',
            '幸福', '美好', '精彩', '完美', '出色', '卓越', '优异', '杰出', '伟大',
            '光荣', '自豪', '骄傲', '满意', '放心', '安心', '稳定', '安全', '和谐'
        }
        
        self.negative_words = {
            '坏', '差', '反对', '批评', '失败', '事故', '风险', '悲', '亡', '灾',
            '祸', '调查', '涉嫌', '违法', '犯罪', '死亡', '受伤', '损失', '破坏',
            '冲突', '战争', '恐怖', '威胁', '危机', '困难', '问题', '投诉', '举报',
            '曝光', '揭露', '丑闻', '腐败', '贪污', '受贿', '诈骗', '盗窃', '抢劫',
            '杀人', '伤害', '虐待', '欺凌', '歧视', '争议', '质疑', '不满', '抗议',
            '示威', '罢工', '罢课', '请愿', '上诉', '诉讼', '判决', '制裁', '处罚',
            '警告', '通缉', '逮捕', '拘留', '判刑', '死刑', '自杀', '坠楼', '车祸',
            '爆炸', '火灾', '地震', '洪水', '台风', '疫情', '病毒', '感染', '确诊'
        }
        
        # 高风险词
        self.high_risk_words = {
            '事故', '伤亡', '调查', '违规', '风险', '危机', '涉嫌', '违法', '犯罪',
            '死亡', '杀人', '爆炸', '火灾', '地震', '洪水', '疫情', '病毒', '确诊',
            '自杀', '坠楼', '车祸', '恐怖', '威胁', '战争', '冲突', '腐败', '贪污',
            '受贿', '诈骗', '盗窃', '抢劫', '虐待', '欺凌', '死刑', '逮捕', '拘留'
        }
        
        # 中风险词
        self.medium_risk_words = {
            '争议', '冲突', '抗议', '不满', '质疑', '投诉', '举报', '曝光', '揭露',
            '丑闻', '处罚', '警告', '制裁', '诉讼', '判决', '罢工', '罢课', '示威'
        }
    
    def load_stopwords(self) -> set:
        """加载停用词表"""
        stopwords = set()
        try:
            stopwords_file = os.path.join(os.path.dirname(__file__), 'stopwords.txt')
            with open(stopwords_file, 'r', encoding='utf-8') as f:
                for line in f:
                    word = line.strip()
                    if word and not word.startswith('#'):
                        stopwords.add(word)
        except Exception as e:
            print(f"加载停用词失败：{e}，使用默认停用词")
            # 默认停用词
            stopwords = {'的', '了', '在', '是', '和', '就', '都', '而', '及', '与', '着', '被', '把', '将', '已', '但', '并', '或'}
        return stopwords
    
    # ==================== 各平台爬虫方法（保持原有实现） ====================
    # 为节省篇幅，这里省略各平台爬虫方法，与 crawler_full.py 相同
    # 实际使用时请复制 crawler_full.py 中的所有 fetch_* 和 parse_* 方法
    
    # ==================== 核心改进功能 ====================
    
    def extract_keywords_jieba(self, title: str, excerpt: str = '') -> List[str]:
        """使用 Jieba 提取关键词（改进版）"""
        if not JIEBA_AVAILABLE:
            return self.extract_keywords_simple(title)
        
        try:
            # 合并标题和摘要
            text = title + ' ' + excerpt
            
            # 使用 Jieba 分词
            words = jieba.lcut(text)
            
            # 过滤停用词和短词
            filtered_words = [
                word for word in words
                if len(word) >= 2
                and word not in self.stopwords
                and not re.match(r'^[^\u4e00-\u9fa5]+$', word)  # 排除纯非中文
            ]
            
            # 词频统计
            word_count = {}
            for word in filtered_words:
                word_count[word] = word_count.get(word, 0) + 1
            
            # 按词频排序，取前 5 个
            top_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:5]
            
            return [word for word, count in top_words]
        except Exception as e:
            print(f"Jieba 分词失败：{e}，使用简单分词")
            return self.extract_keywords_simple(title)
    
    def extract_keywords_simple(self, title: str) -> List[str]:
        """简单分词（备用方案）"""
        words = []
        if len(title) > 4:
            words.append(title[:4])
        if len(title) > 8:
            words.append(title[4:8])
        words.append(title.split('，')[0] if '，' in title else title[:6])
        return words[:3]
    
    def analyze_sentiment_enhanced(self, text: str) -> Tuple[str, float]:
        """增强情感分析（返回情感和置信度）"""
        text_lower = text.lower()
        
        # 统计情感词
        pos_count = sum(1 for word in self.positive_words if word in text_lower)
        neg_count = sum(1 for word in self.negative_words if word in text_lower)
        
        total = pos_count + neg_count
        
        if total == 0:
            return 'neutral', 0.5
        
        # 计算置信度
        confidence = max(pos_count, neg_count) / total
        
        # 平滑处理
        confidence = 0.5 + (confidence - 0.5) * 0.8  # 压缩到 0.5-0.9 范围
        
        if pos_count > neg_count:
            return 'positive', min(confidence + 0.1, 0.95)
        elif neg_count > pos_count:
            return 'negative', min(confidence + 0.1, 0.95)
        else:
            return 'neutral', 0.5
    
    def assess_risk_enhanced(self, title: str, heat: int = 0) -> str:
        """增强风险评估"""
        title_lower = title.lower()
        
        # 检查高风险词
        if any(word in title_lower for word in self.high_risk_words):
            return 'high'
        
        # 检查中风险词或超高热度
        if any(word in title_lower for word in self.medium_risk_words) or heat > 8000000:
            return 'medium'
        
        return 'low'
    
    def calculate_similarity(self, title1: str, title2: str) -> float:
        """计算标题相似度（简单 Jaccard 相似度）"""
        # 分词
        if JIEBA_AVAILABLE:
            words1 = set(jieba.lcut(title1))
            words2 = set(jieba.lcut(title2))
        else:
            words1 = set([title1[i:i+2] for i in range(0, len(title1), 2)])
            words2 = set([title2[i:i+2] for i in range(0, len(title2), 2)])
        
        # 过滤停用词
        words1 = {w for w in words1 if w not in self.stopwords and len(w) >= 2}
        words2 = {w for w in words2 if w not in self.stopwords and len(w) >= 2}
        
        if not words1 or not words2:
            return 0.0
        
        # Jaccard 相似度
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0
    
    def deduplicate_opinions(self, opinions: List[Dict], threshold: float = 0.7) -> List[Dict]:
        """跨平台去重（保留多源信息）"""
        if not opinions:
            return []
        
        unique = []
        for opinion in opinions:
            is_duplicate = False
            for existing in unique:
                similarity = self.calculate_similarity(opinion['title'], existing['title'])
                if similarity >= threshold:
                    # 发现重复，合并信息
                    if opinion['source'] not in existing.get('sources', []):
                        existing['sources'].append(opinion['source'])
                        existing['heat'] = max(existing['heat'], opinion['heat'])
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                # 添加 sources 字段
                opinion['sources'] = [opinion['source']]
                unique.append(opinion)
        
        return unique
    
    def fix_url(self, platform: str, raw_data: Dict) -> str:
        """修复各平台 URL"""
        platform = platform.lower()
        
        try:
            if platform == 'toutiao':
                item_id = raw_data.get('ItemId', '') or raw_data.get('item_id', '')
                if item_id:
                    return f"https://www.toutiao.com/item/{item_id}/"
            
            elif platform == 'douyin':
                sentence_id = raw_data.get('sentence_id', '')
                if sentence_id:
                    return f"https://www.douyin.com/hot/{sentence_id}"
            
            elif platform == 'weibo':
                note = raw_data.get('note', '')
                if note:
                    return f"https://s.weibo.com/weibo?q={note}"
            
            elif platform == 'zhihu':
                q_id = raw_data.get('id', '')
                if q_id:
                    return f"https://www.zhihu.com/question/{q_id}"
            
            elif platform == 'bili':
                bvid = raw_data.get('bvid', '')
                if bvid:
                    return f"https://www.bilibili.com/video/{bvid}"
            
            elif platform == 'hupu':
                post_id = raw_data.get('id', '')
                if post_id:
                    return f"https://bbs.hupu.com/{post_id}.html"
            
            elif platform == 'douban':
                subject_id = raw_data.get('id', '')
                if subject_id:
                    return f"https://movie.douban.com/subject/{subject_id}/"
        except Exception as e:
            print(f"修复 URL 失败：{e}")
        
        # 默认返回搜索链接
        title = raw_data.get('title', '')
        if title:
            return f"https://www.baidu.com/s?wd={title}"
        return '#'
    
    # ==================== 聚合所有平台 ====================
    async def crawl_all(self) -> List[Dict]:
        """抓取所有平台"""
        # 这里使用 crawler_full.py 中的实现
        # 为节省篇幅省略，实际使用时请复制
        tasks = []  # 所有平台的抓取任务
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_opinions = []
        for result in results:
            if isinstance(result, list):
                all_opinions.extend(result)
        
        all_opinions.sort(key=lambda x: x.get('heat', 0), reverse=True)
        
        return all_opinions
    
    # ==================== 生成完整舆情对象 ====================
    def generate_opinion(self, raw_data: Dict, index: int) -> Dict:
        """生成完整舆情对象（使用所有改进）"""
        title = raw_data.get('title', '')
        excerpt = raw_data.get('excerpt', '')
        now = datetime.now()
        platform = raw_data.get('platform', 'unknown')
        heat = raw_data.get('heat', 0)
        
        # 使用改进的功能
        sentiment, sentiment_score = self.analyze_sentiment_enhanced(title)
        risk_level = self.assess_risk_enhanced(title, heat)
        keywords = self.extract_keywords_jieba(title, excerpt)
        url = self.fix_url(platform, raw_data)
        
        return {
            'id': index + 1,
            'title': title,
            'category': self.categorize(title),
            'source': raw_data.get('source', '未知'),
            'publishTime': now.strftime('%Y-%m-%d %H:%M:%S'),
            'heat': heat,
            'trend': self.analyze_trend(raw_data),
            'sentiment': sentiment,
            'sentimentScore': round(sentiment_score, 2),
            'riskLevel': risk_level,
            'isHot': heat > 5000000,
            'isNew': True,
            'excerpt': excerpt or title[:80] + '...',
            'keywords': keywords,
            'platform': platform,
            'url': url,
            'timeline': [
                {
                    'time': now.strftime('%H:%M'),
                    'title': '事件发现',
                    'desc': f'{raw_data.get("source", "系统")} 监测到该热点',
                    'isKey': True
                }
            ],
            'analysis': {
                'sentiment': sentiment,
                'sentimentScore': round(sentiment_score, 2),
                'riskAssessment': risk_level,
                'trendPrediction': '待观察',
                'keyPoints': [
                    '事件正在发展中',
                    '需持续关注官方通报',
                    '建议跟踪后续报道'
                ]
            }
        }


async def main():
    """主函数"""
    crawler = OpinionCrawler()
    
    print("🚀 开始抓取全网热点（优化版）...")
    print("=" * 50)
    
    raw_data = await crawler.crawl_all()
    print(f"✅ 抓取到 {len(raw_data)} 条原始数据")
    
    # 生成完整舆情对象
    opinions = [crawler.generate_opinion(data, i) for i, data in enumerate(raw_data)]
    print(f"📊 生成 {len(opinions)} 条舆情")
    
    # 去重
    print("🔄 执行跨平台去重...")
    unique_opinions = crawler.deduplicate_opinions(opinions, threshold=0.7)
    print(f"✅ 去重后剩余 {len(unique_opinions)} 条（合并 {len(opinions) - len(unique_opinions)} 条重复）")
    
    # 保存数据
    import os
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'opinions.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_opinions, f, ensure_ascii=False, indent=2)
    
    print(f"📁 数据已保存到 {output_path}")
    print("=" * 50)
    
    # 平台分布
    platform_count = {}
    for op in unique_opinions:
        platform = op.get('platform', 'unknown')
        platform_count[platform] = platform_count.get(platform, 0) + 1
    
    print("📈 平台分布:")
    for platform, count in sorted(platform_count.items(), key=lambda x: x[1], reverse=True):
        print(f"   {platform}: {count} 条")
    
    print("=" * 50)
    print("🔥 TOP 10 热点:")
    for i, op in enumerate(unique_opinions[:10], 1):
        print(f"   {i}. [{op['category']}] {op['title']} ({', '.join(op.get('sources', [op['source']]))}) - {op['heat']}")
    
    print("=" * 50)
    print("✅ 所有改进已应用！")


if __name__ == "__main__":
    asyncio.run(main())
