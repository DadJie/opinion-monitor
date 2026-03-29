/**
 * 舆情详情页专用 JavaScript
 * 处理详情页面的数据加载和渲染
 */

// API 地址
const DETAIL_API_BASE_URL = 'http://localhost:8001';

// 页面加载时获取 URL 参数并渲染详情
document.addEventListener('DOMContentLoaded', async function() {
  console.log('=== 详情页开始加载 ===');
  console.log('URL:', window.location.href);
  console.log('Search:', window.location.search);
  
  const params = new URLSearchParams(window.location.search);
  const opinionId = parseInt(params.get('id'));
  
  console.log('解析出的 Opinion ID:', opinionId);
  
  if (!opinionId) {
    alert('未指定舆情 ID');
    window.location.href = 'index.html';
    return;
  }
  
  // 先加载数据（优先从 API，失败则使用本地文件）
  try {
    console.log('尝试从 API 加载:', `${DETAIL_API_BASE_URL}/api/opinions/${opinionId}`);
    const response = await fetch(`${DETAIL_API_BASE_URL}/api/opinions/${opinionId}`);
    console.log('API 响应状态:', response.status);
    
    if (response.ok) {
      const opinion = await response.json();
      console.log('API 加载成功:', opinion.title);
      renderDetail(opinion);
    } else {
      throw new Error(`API 请求失败：${response.status}`);
    }
  } catch (error) {
    console.warn('API 加载失败，使用本地数据:', error);
    try {
      console.log('从本地文件加载...');
      const response = await fetch('data/opinions.json');
      const data = await response.json();
      console.log('本地数据加载成功，总数:', data.length);
      
      const opinion = data.find(o => o.id === opinionId);
      console.log('找到的舆情:', opinion ? opinion.title : '未找到');
      
      if (opinion) {
        renderDetail(opinion);
      } else {
        throw new Error(`未找到 ID 为 ${opinionId} 的舆情`);
      }
    } catch (localError) {
      console.error('加载数据失败:', localError);
      document.getElementById('detailTitle').textContent = '加载失败';
      document.getElementById('eventContent').innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
          <p style="color: var(--neutral-gray); font-size: 16px;">无法加载舆情数据</p>
          <p style="color: var(--neutral-gray); font-size: 14px; margin-top: 10px;">${localError.message}</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--tech-blue); color: white; border: none; border-radius: 6px; cursor: pointer;">🔄 刷新页面</button>
        </div>
      `;
    }
  }
});

/**
 * 渲染详情页
 */
function renderDetail(opinion) {
  console.log('=== 开始渲染详情 ===');
  console.log('标题:', opinion.title);
  
  // 填充基本信息
  document.getElementById('detailTitle').textContent = opinion.title;
  document.getElementById('detailCategory').textContent = opinion.category;
  document.getElementById('detailSource').textContent = opinion.source;
  document.getElementById('detailTime').textContent = opinion.publishTime;
  document.getElementById('detailHeat').textContent = formatHeat(opinion.heat);
  
  // 情感倾向
  document.getElementById('detailSentiment').innerHTML = `
    <span class="sentiment-tag ${sentimentMap[opinion.sentiment].class}">
      ${sentimentMap[opinion.sentiment].icon} ${sentimentMap[opinion.sentiment].text}
    </span>
  `;
  
  // 风险等级
  document.getElementById('detailRisk').innerHTML = `
    <span class="risk-level ${riskMap[opinion.riskLevel].class}">
      ⚠️ ${riskMap[opinion.riskLevel].text}
    </span>
  `;
  
  // 发展趋势
  document.getElementById('detailTrend').innerHTML = `
    <span style="color: ${trendMap[opinion.trend].color}; font-weight: 600;">
      ${opinion.trend === 'rising' ? '📈' : opinion.trend === 'falling' ? '📉' : '➡️'} 
      ${trendMap[opinion.trend].text}
    </span>
  `;
  
  // 摘要
  const excerptEl = document.getElementById('detailExcerpt');
  if (opinion.excerpt && opinion.excerpt.trim()) {
    excerptEl.textContent = opinion.excerpt;
  } else {
    excerptEl.style.display = 'none';
  }
  
  // 事件内容
  const contentEl = document.getElementById('eventContent');
  if (opinion.content && opinion.content.trim()) {
    console.log('显示实际内容');
    contentEl.innerHTML = `<div style="line-height: 1.8;">${opinion.content}</div>`;
  } else {
    console.log('生成详细内容');
    contentEl.innerHTML = generateDetailedContent(opinion);
  }
  
  // 渲染事件概要
  console.log('渲染事件概要...');
  if (typeof renderEventSummary === 'function') {
    renderEventSummary(opinion);
  } else {
    console.error('renderEventSummary 函数未定义');
  }
  
  // 渲染时间线
  console.log('渲染时间线...');
  if (typeof renderTimeline === 'function') {
    renderTimeline(opinion.timeline);
  } else {
    console.error('renderTimeline 函数未定义');
  }
  
  // 渲染 AI 分析
  console.log('渲染 AI 分析...');
  if (typeof renderAnalysis === 'function') {
    renderAnalysis(opinion.analysis);
  } else {
    console.error('renderAnalysis 函数未定义');
  }
  
  // 渲染相关舆情
  console.log('渲染相关舆情...');
  if (typeof renderRelated === 'function') {
    renderRelated(opinion);
  } else {
    console.error('renderRelated 函数未定义');
  }
  
  // 更新页面标题
  document.title = `${opinion.title} - 舆情详情`;
  console.log('=== 渲染完成 ===');
}

/**
 * 生成详细的事件内容（用于没有 content 字段的情况）
 */
function generateDetailedContent(opinion) {
  const title = opinion.title;
  const category = opinion.category || '社会';
  const source = opinion.source;
  const publishTime = opinion.publishTime;
  const heat = opinion.heat;
  const sentiment = opinion.sentiment;
  const keywords = opinion.keywords || [];
  
  // 生成内容结构
  const content = `
    <div style="margin-bottom: 25px;">
      <h4 style="font-size: 16px; font-weight: 600; color: var(--deep-blue); margin-bottom: 12px; border-left: 3px solid var(--tech-blue); padding-left: 12px;">📍 事件概述</h4>
      <p style="line-height: 1.8; margin-bottom: 15px;">
        <strong>${title}</strong> 是一起${category}类事件，由 <strong>${source}</strong> 于 <strong>${publishTime}</strong> 首次报道。
        该事件迅速引发社会关注，目前热度达到 <strong>${formatHeat(heat)}</strong>，
        舆论情感倾向为 <strong>${sentimentMap[sentiment].text}</strong> ${sentimentMap[sentiment].icon}。
      </p>
    </div>
    
    ${keywords && keywords.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h4 style="font-size: 16px; font-weight: 600; color: var(--deep-blue); margin-bottom: 12px; border-left: 3px solid var(--tech-blue); padding-left: 12px;">🏷️ 关键词</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${keywords.map(kw => `<span style="display: inline-block; background: #e0f2fe; color: var(--tech-blue); padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 500;">${kw}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div style="margin-bottom: 25px;">
      <h4 style="font-size: 16px; font-weight: 600; color: var(--deep-blue); margin-bottom: 12px; border-left: 3px solid var(--tech-blue); padding-left: 12px;">📊 舆情态势</h4>
      <p style="line-height: 1.8; margin-bottom: 10px;">
        该事件自发布以来，传播速度${opinion.trend === 'rising' ? '<strong>快速上升</strong> 🔺' : opinion.trend === 'falling' ? '<strong>逐渐下降</strong> 🔻' : '<strong>保持平稳</strong> ➖'}。
        根据风险评估，该事件属于 <strong>${riskMap[opinion.riskLevel].text}</strong> 级别，
        ${opinion.riskLevel === 'high' ? '需要重点关注和及时应对' : opinion.riskLevel === 'medium' ? '建议持续跟踪监测' : '整体风险可控'}。
      </p>
    </div>
    
    <div style="margin-bottom: 25px;">
      <h4 style="font-size: 16px; font-weight: 600; color: var(--deep-blue); margin-bottom: 12px; border-left: 3px solid var(--tech-blue); padding-left: 12px;">💡 关注建议</h4>
      <ul style="line-height: 2; padding-left: 20px;">
        <li>持续关注事件发展动态和官方通报</li>
        <li>注意媒体报道倾向和网民情绪变化</li>
        <li>警惕不实信息传播和谣言扩散</li>
        <li>做好舆情应对和引导准备工作</li>
      </ul>
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid var(--neutral-gray);">
      <p style="font-size: 13px; color: var(--neutral-gray); margin: 0;">
        ℹ️ 以上内容基于舆情数据自动生成，仅供参考。详细事件内容请以官方发布和权威媒体报道为准。
      </p>
    </div>
  `;
  
  return content;
}
