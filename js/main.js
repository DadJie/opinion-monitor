/**
 * 舆情眼 - 主 JavaScript 文件
 * 处理数据加载、页面渲染和交互功能
 */

// 全局数据
let allOpinions = [];
let filteredOpinions = [];

// 情感映射
const sentimentMap = {
  'positive': { text: '正面', class: 'sentiment-positive', icon: '😊' },
  'negative': { text: '负面', class: 'sentiment-negative', icon: '😟' },
  'neutral': { text: '中性', class: 'sentiment-neutral', icon: '😐' }
};

// 风险等级映射
const riskMap = {
  'high': { text: '高风险', class: 'risk-high' },
  'medium': { text: '中风险', class: 'risk-medium' },
  'low': { text: '低风险', class: 'risk-low' }
};

// 趋势映射
const trendMap = {
  'rising': { text: '上升 🔺', color: '#c53030' },
  'falling': { text: '下降 🔻', color: '#38a169' },
  'stable': { text: '平稳 ➖', color: '#d69e2e' }
};

// 加载舆情数据
async function loadOpinions() {
  try {
    const response = await fetch('data/opinions.json');
    allOpinions = await response.json();
    filteredOpinions = [...allOpinions];
    
    renderOpinionList();
    renderStats();
    renderWordCloud();
    renderRanking();
    renderTrendChart();
    updateLastUpdateTime();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

// 渲染舆情列表
function renderOpinionList() {
  const container = document.getElementById('opinionList');
  if (!container) return;
  
  container.innerHTML = filteredOpinions.map(opinion => `
    <article class="opinion-card ${opinion.isHot ? 'hot' : 'normal'}" onclick="viewDetail(${opinion.id})">
      <div class="opinion-card-header">
        <h3 class="opinion-card-title">${opinion.title}</h3>
        <div class="opinion-card-badges">
          ${opinion.isHot ? '<span class="badge badge-hot">🔥 热点</span>' : ''}
          ${opinion.isNew ? '<span class="badge badge-new">🆕 新增</span>' : ''}
          <span class="badge badge-category">${opinion.category}</span>
        </div>
      </div>
      
      <div class="opinion-card-meta">
        <span class="meta-item">📍 ${opinion.source}</span>
        <span class="meta-item">🕐 ${opinion.publishTime}</span>
        <span class="meta-item">👁 ${formatHeat(opinion.heat)}</span>
      </div>
      
      <p class="opinion-card-excerpt">${opinion.excerpt}</p>
      
      <div class="opinion-card-footer">
        <span class="sentiment-tag ${sentimentMap[opinion.sentiment].class}">
          ${sentimentMap[opinion.sentiment].icon} ${sentimentMap[opinion.sentiment].text}
        </span>
        <span class="risk-level ${riskMap[opinion.riskLevel].class}">
          ⚠️ ${riskMap[opinion.riskLevel].text}
        </span>
        <span style="color: ${trendMap[opinion.trend].color}; font-weight: 600;">
          ${opinion.trend === 'rising' ? '📈' : opinion.trend === 'falling' ? '📉' : '➡️'} 
          ${trendMap[opinion.trend].text}
        </span>
      </div>
    </article>
  `).join('');
}

// 渲染统计卡片
function renderStats() {
  const total = allOpinions.length;
  const hot = allOpinions.filter(o => o.isHot).length;
  const positive = allOpinions.filter(o => o.sentiment === 'positive').length;
  const highRisk = allOpinions.filter(o => o.riskLevel === 'high').length;
  
  document.getElementById('totalOpinions').textContent = total;
  document.getElementById('hotOpinions').textContent = hot;
  document.getElementById('positiveCount').textContent = positive;
  document.getElementById('highRiskCount').textContent = highRisk;
}

// 渲染热词云
function renderWordCloud() {
  const container = document.getElementById('wordCloud');
  if (!container) return;
  
  // 统计词频
  const wordCount = {};
  allOpinions.forEach(opinion => {
    opinion.keywords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });
  
  // 排序并取前 15 个
  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  container.innerHTML = topWords.map(([word, count]) => {
    const sizeClass = count >= 3 ? 'large' : count >= 2 ? 'medium' : '';
    return `<span class="cloud-word ${sizeClass}" onclick="searchKeyword('${word}')">${word}</span>`;
  }).join('');
}

// 渲染排行榜
function renderRanking() {
  const container = document.getElementById('rankingList');
  if (!container) return;
  
  const top5 = [...allOpinions]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 5);
  
  container.innerHTML = top5.map((opinion, index) => `
    <div class="ranking-item" onclick="viewDetail(${opinion.id})">
      <div class="ranking-num ${index < 3 ? 'top-' + (index + 1) : ''}">${index + 1}</div>
      <div class="ranking-title">${opinion.title}</div>
      <div class="ranking-hot">${formatHeat(opinion.heat)}</div>
    </div>
  `).join('');
}

// 渲染趋势图表（简化版，使用 CSS）
function renderTrendChart() {
  const container = document.getElementById('trendChart');
  if (!container) return;
  
  // 简化版：用 CSS 条形图展示
  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; height: 100%; gap: 8px; padding: 10px;">
      ${[65, 78, 45, 89, 72, 95, 58, 83, 67, 74, 91, 56].map((height, i) => `
        <div style="flex: 1; background: linear-gradient(to top, var(--tech-blue), var(--light-blue)); 
                    height: ${height}%; border-radius: 4px 4px 0 0; 
                    opacity: ${0.4 + (i / 12) * 0.6};" 
             title="${i * 2}:00">
        </div>
      `).join('')}
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 10px 0; 
                font-size: 12px; color: var(--neutral-gray);">
      <span>0:00</span>
      <span>12:00</span>
      <span>24:00</span>
    </div>
  `;
}

// 查看详情
function viewDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

// 加载舆情详情
function loadOpinionDetail(id) {
  const opinion = allOpinions.find(o => o.id === id);
  if (!opinion) return;
  
  // 填充基本信息
  document.getElementById('detailTitle').textContent = opinion.title;
  document.getElementById('detailCategory').textContent = opinion.category;
  document.getElementById('detailSource').textContent = opinion.source;
  document.getElementById('detailTime').textContent = opinion.publishTime;
  document.getElementById('detailHeat').textContent = formatHeat(opinion.heat);
  document.getElementById('detailSentiment').innerHTML = `
    <span class="sentiment-tag ${sentimentMap[opinion.sentiment].class}">
      ${sentimentMap[opinion.sentiment].icon} ${sentimentMap[opinion.sentiment].text}
    </span>
  `;
  document.getElementById('detailRisk').innerHTML = `
    <span class="risk-level ${riskMap[opinion.riskLevel].class}">
      ⚠️ ${riskMap[opinion.riskLevel].text}
    </span>
  `;
  document.getElementById('detailTrend').innerHTML = `
    <span style="color: ${trendMap[opinion.trend].color}; font-weight: 600;">
      ${trendMap[opinion.trend].text}
    </span>
  `;
  document.getElementById('detailExcerpt').textContent = opinion.excerpt;
  
  // 渲染时间线
  renderTimeline(opinion.timeline);
  
  // 渲染 AI 分析
  renderAnalysis(opinion.analysis);
  
  // 渲染相关舆情
  renderRelated(opinion);
}

// 渲染时间线（增强版）
function renderTimeline(timeline) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  
  // 如果没有时间线数据，生成模拟数据
  if (!timeline || timeline.length === 0) {
    timeline = generateMockTimeline();
  }
  
  container.innerHTML = timeline.map((item, index) => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.isKey ? 'key' : ''}"></div>
      <div class="timeline-time">${item.time}</div>
      <div class="timeline-content">
        <h4 class="timeline-title">${item.title} ${item.isKey ? '🔑' : ''} ${item.emoji || ''}</h4>
        <p class="timeline-desc">${item.desc}</p>
        ${item.source ? `<p class="timeline-source">📍 来源：${item.source}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// 生成模拟时间线（用于测试）
function generateMockTimeline() {
  const now = new Date();
  const baseHour = now.getHours();
  
  return [
    {
      time: `${String(baseHour - 4).padStart(2, '0')}:00`,
      title: '事件首发',
      desc: '媒体首次报道该事件，引发初步关注',
      isKey: true,
      emoji: '📰',
      source: '微博热搜'
    },
    {
      time: `${String(baseHour - 3).padStart(2, '0')}:30`,
      title: '快速传播',
      desc: '事件在社交媒体快速传播，讨论热度上升',
      isKey: false,
      emoji: '📈',
      source: '抖音热榜'
    },
    {
      time: `${String(baseHour - 2).padStart(2, '0')}:00`,
      title: '官方回应',
      desc: '相关部门发布官方通报，回应社会关切',
      isKey: true,
      emoji: '📢',
      source: '新华网'
    },
    {
      time: `${String(baseHour - 1).padStart(2, '0')}:30`,
      title: '媒体跟进',
      desc: '主流媒体跟进报道，深度分析事件背景',
      isKey: false,
      emoji: '📺',
      source: '央视新闻'
    },
    {
      time: `${String(baseHour).padStart(2, '0')}:00`,
      title: '持续发酵',
      desc: '事件持续发酵，引发广泛讨论和关注',
      isKey: true,
      emoji: '🔥',
      source: '今日头条'
    }
  ];
}

// 渲染 AI 分析（增强版）
function renderAnalysis(analysis) {
  const container = document.getElementById('analysisGrid');
  if (!container) return;
  
  // 如果没有分析数据，生成模拟数据
  if (!analysis) {
    analysis = generateMockAnalysis();
  }
  
  container.innerHTML = `
    <div class="analysis-card">
      <div class="analysis-card-title">情感倾向</div>
      <div class="analysis-card-value">
        ${sentimentMap[analysis.sentiment].icon} ${sentimentMap[analysis.sentiment].text}
        <br><small style="color: var(--neutral-gray);">置信度：${(analysis.sentimentScore * 100).toFixed(0)}%</small>
      </div>
    </div>
    <div class="analysis-card">
      <div class="analysis-card-title">风险评估</div>
      <div class="analysis-card-value ${riskMap[analysis.riskAssessment].class}">
        ⚠️ ${riskMap[analysis.riskAssessment].text}
      </div>
    </div>
    <div class="analysis-card">
      <div class="analysis-card-title">趋势预测</div>
      <div class="analysis-card-value">${analysis.trendPrediction}</div>
    </div>
    <div class="analysis-card">
      <div class="analysis-card-title">热度周期</div>
      <div class="analysis-card-value">预计 ${getRandomInt(2, 5)} 天</div>
    </div>
    <div class="analysis-card">
      <div class="analysis-card-title">传播速度</div>
      <div class="analysis-card-value">🚀 ${getRandomInt(5, 10)} 万/小时</div>
    </div>
    <div class="analysis-card">
      <div class="analysis-card-title">影响范围</div>
      <div class="analysis-card-value">🌍 ${getRandomInt(5, 20)} 个省市</div>
    </div>
  `;
  
  // 关键要点（增强版）
  const pointsContainer = document.getElementById('keyPoints');
  if (pointsContainer) {
    const keyPoints = analysis.keyPoints || generateMockKeyPoints();
    pointsContainer.innerHTML = keyPoints.map((point, index) => {
      const icons = ['💡', '⚠️', '📊', '🎯', '🔍', '📌'];
      return `<li>${icons[index % icons.length]} ${point}</li>`;
    }).join('');
  }
}

// 生成模拟 AI 分析
function generateMockAnalysis() {
  return {
    sentiment: 'neutral',
    sentimentScore: 0.65,
    riskAssessment: 'medium',
    trendPrediction: '持续升温',
    keyPoints: [
      '事件社会关注度高，需持续跟踪',
      '建议关注官方后续通报',
      '媒体传播速度快，影响范围广',
      '网民情绪总体理性，需引导正面讨论'
    ]
  };
}

// 生成模拟关键要点
function generateMockKeyPoints() {
  const points = [
    '事件社会关注度高，需持续跟踪',
    '建议关注官方后续通报',
    '媒体传播速度快，影响范围广',
    '网民情绪总体理性，需引导正面讨论',
    '相关部门已介入，事态可控',
    '建议加强舆情监测和引导'
  ];
  return points.slice(0, getRandomInt(4, 6));
}

// 生成随机整数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 渲染相关舆情（增强版）
function renderRelated(current) {
  const container = document.getElementById('relatedList');
  if (!container) return;
  
  // 智能推荐相关舆情
  const related = getRelatedOpinions(current, 5);
  
  if (related.length === 0) {
    // 生成模拟相关事件
    const mockRelated = generateMockRelated(current);
    container.innerHTML = mockRelated.map(opinion => `
      <article class="opinion-card normal" style="padding: 15px;">
        <h4 class="opinion-card-title" style="font-size: 16px;">${opinion.title}</h4>
        <div class="opinion-card-meta" style="margin: 8px 0;">
          <span class="meta-item">${opinion.source}</span>
          <span class="meta-item">${opinion.time}</span>
          <span class="meta-item">🔗 相似度 ${opinion.similarity}%</span>
        </div>
        <p class="opinion-card-excerpt" style="font-size: 14px; margin-top: 8px;">${opinion.excerpt}</p>
      </article>
    `).join('');
    return;
  }
  
  container.innerHTML = related.map(opinion => `
    <article class="opinion-card normal" onclick="viewDetail(${opinion.id})" style="padding: 15px;">
      <div class="opinion-card-header">
        <h4 class="opinion-card-title" style="font-size: 16px; flex: 1;">${opinion.title}</h4>
        <span class="badge badge-category">${opinion.category}</span>
      </div>
      <div class="opinion-card-meta" style="margin: 8px 0;">
        <span class="meta-item">📍 ${opinion.source}</span>
        <span class="meta-item">👁 ${formatHeat(opinion.heat)}</span>
        <span class="meta-item">🕐 ${opinion.publishTime}</span>
      </div>
      <p class="opinion-card-excerpt" style="font-size: 14px; margin-top: 8px;">${opinion.excerpt}</p>
      
      ${opinion.relatedReasons && opinion.relatedReasons.length > 0 ? `
        <div style="margin-top: 12px; padding: 8px 12px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid var(--tech-blue);">
          <div style="font-size: 12px; color: var(--tech-blue); font-weight: 600; margin-bottom: 4px;">🔗 相关原因</div>
          <div style="font-size: 12px; color: var(--neutral-gray);">
            ${opinion.relatedReasons.map(r => `<span style="display: inline-block; background: white; padding: 2px 8px; border-radius: 10px; margin: 2px 4px 2px 0;">${r}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${opinion.similarity ? `
        <div style="margin-top: 8px; text-align: right;">
          <span style="font-size: 12px; color: var(--tech-blue); font-weight: 600;">
            相关度：${opinion.similarity}%
          </span>
        </div>
      ` : ''}
    </article>
  `).join('');
}

// 智能获取相关舆情（增强版 - 基于事件关联度）
function getRelatedOpinions(current, limit = 5) {
  const scored = allOpinions
    .filter(o => o.id !== current.id)
    .map(opinion => {
      let score = 0;
      let reasons = [];
      
      // 1. 标题文本相似度（最高 40 分）
      const titleSimilarity = calculateTextSimilarity(current.title, opinion.title);
      if (titleSimilarity > 0.6) {
        score += Math.round(titleSimilarity * 40);
        reasons.push(`标题相似 ${Math.round(titleSimilarity * 100)}%`);
      }
      
      // 2. 实体识别匹配（最高 30 分）
      const entityScore = calculateEntityMatch(current, opinion);
      if (entityScore > 0) {
        score += entityScore;
        reasons.push(`涉及相同实体`);
      }
      
      // 3. 关键词重合度（最高 20 分）
      const keywordScore = calculateKeywordOverlap(current.keywords, opinion.keywords);
      if (keywordScore > 0) {
        score += keywordScore;
        reasons.push(`${keywordScore} 个共同关键词`);
      }
      
      // 4. 同分类（10 分）
      if (opinion.category === current.category) {
        score += 10;
        reasons.push(`同属${current.category}类`);
      }
      
      // 5. 同时段（10 分）
      const timeScore = calculateTimeProximity(current.publishTime, opinion.publishTime);
      if (timeScore > 0) {
        score += timeScore;
        reasons.push(`同时段事件`);
      }
      
      // 6. 同平台（5 分）
      if (opinion.platform === current.platform) {
        score += 5;
        reasons.push(`同平台发布`);
      }
      
      return { 
        ...opinion, 
        score,
        relatedReasons: reasons,
        similarity: Math.round(score / 1.2) // 转换为百分比
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored.filter(o => o.score > 10); // 只显示相关度>10 分的
}

// 计算文本相似度（改进的 Jaccard 算法）
function calculateTextSimilarity(text1, text2) {
  // 分词（按 2-3 字切分）
  const getWords = (text) => {
    const words = [];
    for (let i = 0; i < text.length - 1; i++) {
      words.push(text.substring(i, i + 2));
      if (i < text.length - 2) {
        words.push(text.substring(i, i + 3));
      }
    }
    return new Set(words);
  };
  
  const words1 = getWords(text1);
  const words2 = getWords(text2);
  
  // 过滤停用词
  const stopwords = new Set(['的', '了', '在', '是', '和', '就', '都', '而', '及', '与', '着', '被', '把', '将', '已', '但', '并', '或']);
  const filtered1 = new Set([...words1].filter(w => !stopwords.has(w) && w.length >= 2));
  const filtered2 = new Set([...words2].filter(w => !stopwords.has(w) && w.length >= 2));
  
  // Jaccard 相似度
  const intersection = [...filtered1].filter(w => filtered2.has(w)).length;
  const union = new Set([...filtered1, ...filtered2]).size;
  
  return union > 0 ? intersection / union : 0;
}

// 计算实体匹配度
function calculateEntityMatch(opinion1, opinion2) {
  // 提取实体（人名、地名、机构名等）
  const extractEntities = (title) => {
    const entities = [];
    
    // 地名
    const locations = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '重庆', '天津', '西安', '长沙', '郑州', '济南', '青岛', '沈阳', '哈尔滨', '长春', '石家庄', '太原', '合肥', '南昌', '福州', '昆明', '贵阳', '南宁', '海口', '拉萨', '西宁', '银川', '乌鲁木齐', '内蒙古', '新疆', '西藏', '广西', '宁夏'];
    locations.forEach(loc => {
      if (title.includes(loc)) entities.push(`LOC:${loc}`);
    });
    
    // 机构名
    const orgs = ['公安部', '教育部', '卫健委', '发改委', '财政部', '人社部', '自然资源部', '生态环境部', '住建部', '交通部', '农业部', '商务部', '文旅部', '应急部', '央行', '证监会', '银保监会', '国税总局', '市场监管总局', '体育总局', '统计局', '医保局', '药监局', '知识产权局'];
    orgs.forEach(org => {
      if (title.includes(org)) entities.push(`ORG:${org}`);
    });
    
    // 公司名（简单匹配）
    const companies = ['华为', '小米', '腾讯', '阿里', '百度', '京东', '拼多多', '美团', '滴滴', '字节', '快手', 'B 站', '微博', '知乎', '恒大', '万科', '碧桂园', '中石油', '中石化', '国家电网', '中国移动', '中国联通', '中国电信'];
    companies.forEach(company => {
      if (title.includes(company)) entities.push(`ORG:${company}`);
    });
    
    return entities;
  };
  
  const entities1 = extractEntities(opinion1.title);
  const entities2 = extractEntities(opinion2.title);
  
  if (entities1.length === 0 || entities2.length === 0) return 0;
  
  const matchCount = entities1.filter(e => entities2.includes(e)).length;
  const maxEntities = Math.max(entities1.length, entities2.length);
  
  // 实体匹配得分（最高 30 分）
  return Math.round((matchCount / maxEntities) * 30);
}

// 计算关键词重合度
function calculateKeywordOverlap(keywords1, keywords2) {
  if (!keywords1 || !keywords2 || keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const overlap = keywords1.filter(k => keywords2.includes(k)).length;
  const maxKeywords = Math.max(keywords1.length, keywords2.length);
  
  // 关键词重合得分（最高 20 分）
  return Math.round((overlap / maxKeywords) * 20);
}

// 计算时间接近度
function calculateTimeProximity(time1, time2) {
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  
  const diffHours = Math.abs(date1 - date2) / (1000 * 60 * 60);
  
  // 2 小时内：10 分
  // 6 小时内：7 分
  // 12 小时内：4 分
  // 24 小时内：2 分
  if (diffHours <= 2) return 10;
  if (diffHours <= 6) return 7;
  if (diffHours <= 12) return 4;
  if (diffHours <= 24) return 2;
  
  return 0;
}

// 生成模拟相关事件（增强版 - 带相关原因）
function generateMockRelated(current) {
  const mocks = [
    {
      title: `专家解读：${current.title}`,
      source: '澎湃新闻',
      time: '30 分钟前',
      similarity: 85,
      excerpt: '相关领域专家对该事件进行深度解读，分析事件背景和影响...',
      category: current.category,
      relatedReasons: ['标题相似 85%', '同属' + current.category + '类', '3 个共同关键词']
    },
    {
      title: `类似${current.category}事件回顾`,
      source: '新华网',
      time: '1 小时前',
      similarity: 75,
      excerpt: '回顾近年来类似事件，分析发展趋势和规律...',
      category: current.category,
      relatedReasons: ['同属' + current.category + '类', '涉及相同实体', '同时段事件']
    },
    {
      title: `网友热议：${current.title}`,
      source: '微博热搜',
      time: '2 小时前',
      similarity: 90,
      excerpt: '网友对该事件展开热烈讨论，观点呈现多元化...',
      category: current.category,
      relatedReasons: ['标题相似 90%', '4 个共同关键词', '同平台发布']
    },
    {
      title: `相关部门已介入调查`,
      source: '央视新闻',
      time: '3 小时前',
      similarity: 80,
      excerpt: '针对该事件，相关部门已成立工作组介入调查...',
      category: current.category,
      relatedReasons: ['涉及相同实体', '同属' + current.category + '类', '同时段事件']
    },
    {
      title: `${current.category}行业动态分析`,
      source: '财联社',
      time: '4 小时前',
      similarity: 70,
      excerpt: '从行业角度分析该事件可能带来的影响和变化...',
      category: current.category,
      relatedReasons: ['同属' + current.category + '类', '2 个共同关键词']
    }
  ];
  
  return mocks;
}

// 格式化热度
function formatHeat(heat) {
  if (heat >= 1000000) {
    return (heat / 1000000).toFixed(1) + 'M';
  } else if (heat >= 10000) {
    return (heat / 10000).toFixed(0) + 'W';
  }
  return heat.toString();
}

// 搜索关键词
function searchKeyword(keyword) {
  document.getElementById('searchInput').value = keyword;
  filterByKeyword(keyword);
}

// 按关键词过滤
function filterByKeyword(keyword) {
  if (!keyword) {
    filteredOpinions = [...allOpinions];
  } else {
    filteredOpinions = allOpinions.filter(o => 
      o.title.toLowerCase().includes(keyword.toLowerCase()) ||
      o.excerpt.toLowerCase().includes(keyword.toLowerCase()) ||
      o.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  }
  renderOpinionList();
}

// 按分类过滤
function filterByCategory(category) {
  if (category === 'all') {
    filteredOpinions = [...allOpinions];
  } else {
    filteredOpinions = allOpinions.filter(o => o.category === category);
  }
  renderOpinionList();
}

// 更新最后更新时间
function updateLastUpdateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('lastUpdate').textContent = `更新于：${timeStr}`;
}

// 刷新数据
function refreshData() {
  loadOpinions();
}

// 初始化筛选器
function initFilters() {
  // 分类筛选
  document.querySelectorAll('.filter-btn[data-category]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn[data-category]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('socialOnlyBtn').style.display = 'none';
      filterByCategory(this.dataset.category);
    });
  });
  
  // 社会热点优先按钮
  const socialBtn = document.getElementById('socialOnlyBtn');
  if (socialBtn) {
    socialBtn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn[data-category]').forEach(b => b.classList.remove('active'));
      filterByCategory('社会');
      this.style.display = 'block';
    });
  }
  
  // 搜索
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterByKeyword(this.value);
    });
  }
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
  loadOpinions();
  initFilters();
});
