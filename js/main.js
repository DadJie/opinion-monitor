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

// 渲染时间线
function renderTimeline(timeline) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  
  container.innerHTML = timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.isKey ? 'key' : ''}"></div>
      <div class="timeline-time">${item.time}</div>
      <div class="timeline-content">
        <h4 class="timeline-title">${item.title} ${item.isKey ? '🔑' : ''}</h4>
        <p class="timeline-desc">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

// 渲染 AI 分析
function renderAnalysis(analysis) {
  const container = document.getElementById('analysisGrid');
  if (!container) return;
  
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
      <div class="analysis-card-value">预计 3-5 天</div>
    </div>
  `;
  
  // 关键要点
  const pointsContainer = document.getElementById('keyPoints');
  if (pointsContainer) {
    pointsContainer.innerHTML = analysis.keyPoints.map(point => 
      `<li>${point}</li>`
    ).join('');
  }
}

// 渲染相关舆情
function renderRelated(current) {
  const container = document.getElementById('relatedList');
  if (!container) return;
  
  const related = allOpinions
    .filter(o => o.id !== current.id && 
                 (o.category === current.category || 
                  o.keywords.some(k => current.keywords.includes(k))))
    .slice(0, 3);
  
  if (related.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--neutral-gray); padding: 20px;">暂无相关舆情</p>';
    return;
  }
  
  container.innerHTML = related.map(opinion => `
    <article class="opinion-card normal" onclick="viewDetail(${opinion.id})" style="padding: 15px;">
      <h4 class="opinion-card-title" style="font-size: 16px;">${opinion.title}</h4>
      <div class="opinion-card-meta" style="margin: 8px 0;">
        <span class="meta-item">${opinion.source}</span>
        <span class="meta-item">${formatHeat(opinion.heat)}</span>
      </div>
    </article>
  `).join('');
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
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterByCategory(this.dataset.category);
    });
  });
  
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
