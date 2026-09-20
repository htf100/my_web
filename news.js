(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const strip = $('#news-strip'), track = $('#news-track');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const sourceNames = { 'bbc-zh': 'BBC 中文', 'dw-zh': '德国之声中文', 'bbc-world': 'BBC World' };
  const sources = [
    ['BBC 中文', 'https://www.bbc.com/zhongwen'],
    ['德国之声中文', 'https://www.dw.com/zh/'],
    ['BBC World', 'https://www.bbc.com/news/world'],
  ];
  let feed = null, manualPause = false, refreshing = false, refreshFailed = false;
  try { manualPause = localStorage.getItem('htf-news-paused') === 'true'; } catch { /* Optional preference. */ }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function safeURL(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
      if (!['bbc.com', 'bbc.co.uk', 'dw.com'].some(host => url.hostname === host || url.hostname.endsWith('.' + host))) return null;
      return url.href;
    } catch { return null; }
  }
  function validate(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.items) || !Number.isFinite(Date.parse(raw.fetchedAt))) return null;
    const items = [], seen = new Set();
    for (const item of raw.items.slice(0, 30)) {
      if (!item || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 350 || !Object.hasOwn(sourceNames, item.sourceId)) continue;
      const url = safeURL(item.url);
      if (!url || seen.has(url) || !Number.isFinite(Date.parse(item.publishedAt))) continue;
      seen.add(url); items.push({ title: item.title, url, source: sourceNames[item.sourceId], publishedAt: item.publishedAt });
    }
    return { fetchedAt: raw.fetchedAt, status: raw.status, items: items.slice(0, 12) };
  }
  function dateLabel(value) {
    return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  }
  function updateStatus() {
    if (!feed || !feed.items.length) {
      $('#news-updated').textContent = '暂未获取 · 可查看来源';
      return;
    }
    const age = Date.now() - Date.parse(feed.fetchedAt);
    const olderNews = feed.items.every(item => Date.now() - Date.parse(item.publishedAt) > 72 * 3600000);
    const prefix = olderNews ? '较早新闻' : age > 3 * 3600000 ? '更新延迟' : feed.status === 'cached' || refreshFailed ? '缓存' : feed.status === 'partial' ? '部分来源' : '更新';
    $('#news-updated').textContent = `${prefix} ${dateLabel(feed.fetchedAt)}`;
    $('#news-updated').title = `最近成功抓取：${new Date(feed.fetchedAt).toLocaleString('zh-CN')}。计划每小时更新，非实时热度排行。`;
    $('#news-summary').textContent = `${feed.items.length} 条最近发布的新闻 · ${prefix} ${dateLabel(feed.fetchedAt)}。按发布时间排列，不代表热度排名；点击标题在新标签页查看原文。`;
  }
  function updatePause() {
    const reduced = preference.matches;
    strip.classList.toggle('news-paused', manualPause);
    strip.classList.toggle('news-reduced', reduced);
    strip.classList.toggle('news-page-hidden', document.hidden);
    const paused = manualPause || reduced;
    $('#news-pause').textContent = reduced ? '静态' : paused ? '继续' : '暂停';
    $('#news-pause').disabled = reduced || !feed?.items.length;
    $('#news-pause').setAttribute('aria-pressed', String(paused));
    $('#news-pause').setAttribute('aria-label', reduced ? '已遵循系统设置，减少动态效果' : paused ? '继续新闻滚动' : '暂停新闻滚动');
  }
  function articleLink(item, ticker = false) {
    const a = node('a', ticker ? 'news-item' : 'news-list-link');
    a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.title = `${item.title} · ${item.source} · ${dateLabel(item.publishedAt)}`;
    if (ticker) a.tabIndex = -1; // The equivalent dialog list provides stable keyboard targets.
    a.append(node('span', 'news-source-tag', item.source), node('span', 'news-headline', item.title));
    return a;
  }
  function setSpeed() {
    const group = track.querySelector('.news-group');
    if (group) track.style.setProperty('--news-duration', `${Math.max(25, group.getBoundingClientRect().width / 45)}s`);
  }
  function render(next) {
    feed = next; track.replaceChildren(); $('#news-list').replaceChildren();
    strip.classList.toggle('news-empty', !feed?.items.length);
    if (feed?.items.length) {
      const group = node('div', 'news-group');
      feed.items.forEach(item => {
        group.append(articleLink(item, true));
        const li = node('li'); li.append(articleLink(item), node('time', '', dateLabel(item.publishedAt)));
        li.querySelector('time').dateTime = item.publishedAt; $('#news-list').append(li);
      });
      track.append(group, group.cloneNode(true));
      requestAnimationFrame(setSpeed);
    } else {
      track.append(node('span', 'news-unavailable', '新闻源暂时不可用，可从右侧列表访问新闻网站。'));
      $('#news-summary').textContent = '暂未取得可用标题，命令工作台仍可正常使用。你可以直接访问以下新闻来源。';
    }
    updateStatus(); updatePause();
  }
  async function refresh() {
    if (refreshing || location.protocol === 'file:' || document.hidden) return;
    refreshing = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('./news.json', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('news snapshot unavailable');
      const next = validate(await response.json());
      if (!next) throw new Error('invalid news snapshot');
      refreshFailed = false;
      if (!feed || Date.parse(next.fetchedAt) >= Date.parse(feed.fetchedAt)) {
        // Do not replace a populated snapshot with an unavailable/empty response.
        if (next.items.length || !feed?.items.length) {
          if (JSON.stringify(next) !== JSON.stringify(feed)) render(next);
        }
      }
      updateStatus();
    } catch {
      refreshFailed = true; updateStatus();
    } finally {
      clearTimeout(timeout); refreshing = false;
    }
  }
  $('#news-pause').addEventListener('click', () => {
    manualPause = !manualPause;
    try { localStorage.setItem('htf-news-paused', String(manualPause)); } catch { /* Keep in memory. */ }
    updatePause();
  });
  $('#news-list-open').addEventListener('click', () => { updateStatus(); $('#news-dialog').showModal(); });
  $('#news-list-close').addEventListener('click', () => $('#news-dialog').close());
  $('#news-dialog').addEventListener('keydown', event => event.stopPropagation());
  $('#news-sources').append(node('span', '', '来源：'));
  sources.forEach(([name, url]) => { const a = node('a', '', name); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; $('#news-sources').append(a); });
  preference.addEventListener('change', updatePause);
  document.addEventListener('visibilitychange', () => { updatePause(); if (!document.hidden) refresh(); });
  window.addEventListener('resize', setSpeed);
  render(validate(window.NEWS_FEED));
  refresh();
  setInterval(refresh, 5 * 60 * 1000);
})();
