(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const strip = $('#news-strip'), track = $('#news-track');
  const CACHE_KEY = 'htf-news-last-good-v1';
  const refreshButton = $('#news-refresh');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_ITEMS = 48;
  const sourceNames = { 'bbc-zh': 'BBC 中文', 'dw-zh': '德国之声中文', 'bbc-world': 'BBC 国际', 'wallstreetcn': '华尔街见闻', 'chinanews-finance': '中新网财经', 'bbc-business': 'BBC 商业', fed: '美联储', ecb: '欧洲央行' };
  const financeSources = new Set(['wallstreetcn', 'chinanews-finance', 'bbc-business', 'fed', 'ecb']);
  const topics = new Set(['宏观政策', '基金与ETF', '全球市场', '汇率与商品', '产业公司', '财经综合', '国际']);
  const sources = [
    ['BBC 中文', 'https://www.bbc.com/zhongwen'],
    ['德国之声中文', 'https://www.dw.com/zh/'],
    ['BBC 国际', 'https://www.bbc.com/news/world'],
    ['华尔街见闻', 'https://wallstreetcn.com/live/global'],
    ['中新网财经', 'https://www.chinanews.com.cn/finance/'],
    ['BBC 商业', 'https://www.bbc.com/business'],
    ['美联储', 'https://www.federalreserve.gov/newsevents.htm'],
    ['欧洲央行', 'https://www.ecb.europa.eu/press/html/index.en.html'],
  ];
  let feed = null, manualPause = false, refreshing = false, refreshFailed = false;
  let refreshMessageTimer;
  let scope = 'all', order = 'latest', liveFeed = null, liveFailed = false;
  try { manualPause = localStorage.getItem('htf-news-paused') === 'true'; } catch { /* Optional preference. */ }
  try { const saved = localStorage.getItem('htf-news-scope-v1'); if (['all', 'finance', 'world'].includes(saved)) scope = saved; } catch { /* Optional preference. */ }
  try { const saved = localStorage.getItem('htf-news-order-v1'); if (['latest', 'priority'].includes(saved)) order = saved; } catch { /* Optional preference. */ }
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
      if (!['bbc.com', 'bbc.co.uk', 'dw.com', 'wallstreetcn.com', 'chinanews.com.cn', 'chinanews.com', 'federalreserve.gov', 'ecb.europa.eu'].some(host => url.hostname === host || url.hostname.endsWith('.' + host))) return null;
      return url.href;
    } catch { return null; }
  }
  function validate(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.items) || !Number.isFinite(Date.parse(raw.fetchedAt))) return null;
    const items = [], seen = new Set();
    for (const item of raw.items.slice(0, MAX_ITEMS * 2)) {
      if (!item || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 350 || !Object.hasOwn(sourceNames, item.sourceId)) continue;
      // Old browser caches and failed translations must never flash English headlines.
      const chinese = (item.title.match(/[\u3400-\u9fff]/g) || []).length;
      const letters = (item.title.match(/[A-Za-z]/g) || []).length;
      const words = (item.title.match(/[A-Za-z]+/g) || []).length;
      if (letters > 0 && (chinese === 0 || (words >= 3 && letters > chinese * 2))) continue;
      const url = safeURL(item.url);
      if (!url || seen.has(url) || !Number.isFinite(Date.parse(item.publishedAt))) continue;
      const category = financeSources.has(item.sourceId) ? 'finance' : 'world';
      seen.add(url); items.push({ title: item.title, url, sourceId: item.sourceId, source: sourceNames[item.sourceId], publishedAt: item.publishedAt,
        originalTitle: typeof item.originalTitle === 'string' && item.originalTitle.length <= 350 ? item.originalTitle : '',
        category, topic: topics.has(item.topic) ? item.topic : category === 'finance' ? '财经综合' : '国际',
        priority: [1, 2, 3].includes(item.priority) ? item.priority : 1, publisherImportant: item.publisherImportant === true });
    }
    return { version: 1, fetchedAt: raw.fetchedAt, status: raw.status, items: items.slice(0, MAX_ITEMS) };
  }
  function isPriority(item) { return item.priority >= 3 && Date.now() - Date.parse(item.publishedAt) <= 72 * 3600000; }
  function currentItems() {
    const base = feed?.items || [];
    return liveFeed?.items.length && (!feed || Date.parse(liveFeed.fetchedAt) > Date.parse(feed.fetchedAt))
      ? [...liveFeed.items, ...base.filter(item => item.sourceId !== 'wallstreetcn')].slice(0, MAX_ITEMS) : base;
  }
  function selectedItems() {
    return currentItems().filter(item => scope === 'all' || item.category === scope).sort((a, b) =>
      (order === 'priority' ? Number(isPriority(b)) - Number(isPriority(a)) : 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  function dateLabel(value) {
    return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  }
  function updateStatus() {
    if (!currentItems().length) {
      $('#news-updated').textContent = '暂未获取 · 可查看来源';
      $('#news-updated').title = '暂未取得新闻，请打开新闻列表查看来源。';
      $('#news-updated').setAttribute('aria-label', $('#news-updated').title);
      return;
    }
    const age = Date.now() - Date.parse(feed?.fetchedAt || 0);
    const olderNews = currentItems().every(item => Date.now() - Date.parse(item.publishedAt) > 72 * 3600000);
    const prefix = olderNews ? '较早新闻' : age > 3 * 3600000 ? '更新延迟' : feed?.status === 'cached' || refreshFailed ? '缓存' : feed?.status === 'partial' ? '部分来源' : '更新';
    const snapshotLabel = feed ? `${prefix} ${dateLabel(feed.fetchedAt)}` : '未取得';
    const liveLabel = liveFeed ? `${liveFailed ? '缓存' : Date.now() - Date.parse(liveFeed.fetchedAt) > 15 * 60000 ? '延迟' : '已检查'} ${dateLabel(liveFeed.fetchedAt)}` : '未取得';
    const timeOnly = value => new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const liveCompact = !liveFeed ? '未取得' : liveFailed ? '缓存' : Date.now() - Date.parse(liveFeed.fetchedAt) > 15 * 60000 ? '延迟' : timeOnly(liveFeed.fetchedAt);
    const snapshotCompact = !feed ? '未取得' : prefix === '更新' ? timeOnly(feed.fetchedAt) : prefix;
    $('#news-updated').textContent = `快讯 ${liveCompact} · 全源 ${snapshotCompact}`;
    $('#news-updated').title = `财经直连 ${liveLabel} · 全源 ${snapshotLabel}\n财经直连为华尔街见闻公开快讯；全源为定时发布的新闻快照。检查时间不等于新闻发布时间。`;
    $('#news-updated').setAttribute('aria-label', $('#news-updated').title);
    const shown = selectedItems().length;
    $('#news-summary').textContent = `${shown} / ${currentItems().length} 条 · 财经直连 ${liveLabel}；全源 ${snapshotLabel}。${order === 'priority' ? '近期宏观政策与来源重点优先，非热度排行' : '按发布时间排列'}；外文标题经机器翻译，点击标题查看原文。`;
  }
  function updatePause() {
    const reduced = preference.matches;
    strip.classList.toggle('news-paused', manualPause);
    strip.classList.toggle('news-reduced', reduced);
    strip.classList.toggle('news-page-hidden', document.hidden);
    const paused = manualPause || reduced;
    $('#news-pause').textContent = reduced ? '静态' : paused ? '继续' : '暂停';
    $('#news-pause').disabled = reduced || !selectedItems().length;
    $('#news-pause').setAttribute('aria-pressed', String(paused));
    $('#news-pause').setAttribute('aria-label', reduced ? '已遵循系统设置，减少动态效果' : paused ? '继续新闻滚动' : '暂停新闻滚动');
  }
  function articleLink(item, ticker = false) {
    const a = node('a', ticker ? 'news-item' : 'news-list-link');
    a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.title = `${item.title} · ${item.source} · ${dateLabel(item.publishedAt)}${item.originalTitle ? '\n机器翻译，原文：' + item.originalTitle : ''}`;
    if (ticker) a.tabIndex = -1; // The equivalent dialog list provides stable keyboard targets.
    a.append(node('span', 'news-source-tag', item.source), node('span', 'news-headline', item.title));
    a.dataset.category = item.category;
    return a;
  }
  function setSpeed() {
    const group = track.querySelector('.news-group');
    if (group) track.style.setProperty('--news-duration', `${Math.max(25, group.getBoundingClientRect().width / 45)}s`);
  }
  function render(next) {
    feed = next; track.replaceChildren(); $('#news-list').replaceChildren();
    const items = selectedItems();
    $('#news-scope').value = scope;
    $('#news-order').value = order;
    document.querySelectorAll('#news-filters [data-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scope === scope)));
    strip.classList.toggle('news-empty', !items.length);
    if (items.length) {
      const group = node('div', 'news-group');
      // Keep the ticker short while retaining the complete list and both beats.
      const ticker = scope === 'all' ? [...items.filter(item => item.category === 'finance').slice(0, 8), ...items.filter(item => item.category === 'world').slice(0, 6)] : items.slice(0, 14);
      const tickerURLs = new Set(ticker.map(item => item.url));
      items.forEach(item => {
        if (tickerURLs.has(item.url)) group.append(articleLink(item, true));
        const li = node('li'); li.append(articleLink(item), node('time', '', dateLabel(item.publishedAt)));
        const meta = node('div', 'news-item-meta'); meta.append(node('span', 'news-topic-tag', item.topic));
        if (isPriority(item)) { const tag = node('span', 'news-priority-tag', '重点'); tag.title = item.publisherImportant ? '来源标记为重点消息' : '宏观政策主题优先'; meta.append(tag); }
        meta.append(li.querySelector('time')); li.append(meta);
        li.querySelector('time').dateTime = item.publishedAt; $('#news-list').append(li);
      });
      track.append(group, group.cloneNode(true));
      requestAnimationFrame(setSpeed);
    } else {
      track.append(node('span', 'news-unavailable', feed?.items.length ? '当前分类暂无新闻，可切换“综合”或查看来源。' : '新闻源暂时不可用，可从右侧列表访问新闻网站。'));
      $('#news-summary').textContent = '暂未取得可用标题，命令工作台仍可正常使用。你可以直接访问以下新闻来源。';
    }
    updateStatus(); updatePause();
  }
  function remember() {
    if (!feed?.items.length) return;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(feed)); } catch { /* Keep the visible news even when storage is unavailable. */ }
  }
  function accept(next) {
    if (!next?.items.length || (feed?.items.length && Date.parse(next.fetchedAt) < Date.parse(feed.fetchedAt))) return false;
    // A changed fetch timestamp or missing articles alone must not erase old headlines.
    const changed = !feed?.items.length || next.items.some(item => !feed.items.some(old => old.url === item.url && old.title === item.title && old.publishedAt === item.publishedAt));
    if (!changed) {
      const before = JSON.stringify(selectedItems());
      feed = { ...feed, fetchedAt: next.fetchedAt, status: next.status };
      const displayChanged = before !== JSON.stringify(selectedItems());
      if (displayChanged) render(feed);
      remember(); updateStatus(); return displayChanged;
    }
    if (next.status === 'partial' && feed?.items.length) {
      const updatedSources = new Set(next.items.map(item => item.sourceId));
      const retained = feed.items.filter(item => !updatedSources.has(item.sourceId));
      next = { ...next, items: [...next.items, ...retained].slice(0, MAX_ITEMS) };
    }
    render(next); remember(); return true;
  }
  function refreshMessage(text) {
    clearTimeout(refreshMessageTimer);
    $('#news-refresh-status').textContent = text;
    refreshMessageTimer = setTimeout(() => { $('#news-refresh-status').textContent = ''; }, 6000);
  }
  async function refresh(manual = false) {
    if (refreshing || document.hidden) return;
    if (location.protocol === 'file:') {
      if (manual) refreshMessage('请在网站上刷新；当前新闻已保留');
      return;
    }
    refreshing = true;
    refreshButton.disabled = true; refreshButton.textContent = '刷新中'; refreshButton.setAttribute('aria-busy', 'true');
    if (manual) { clearTimeout(refreshMessageTimer); $('#news-refresh-status').textContent = '正在获取，当前新闻继续显示…'; }
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const [snapshot, direct] = await Promise.allSettled([
        fetch('./news.json', { cache: 'no-store', signal: controller.signal }).then(async response => {
          if (!response.ok) throw new Error('snapshot unavailable');
          const next = validate(await response.json());
          if (!next?.items.length) throw new Error('empty snapshot');
          return next;
        }),
        window.NewsLive.fetchLatest(controller.signal).then(validate),
      ]);
      let changed = false;
      refreshFailed = snapshot.status !== 'fulfilled';
      if (!refreshFailed) changed = accept(snapshot.value);
      liveFailed = direct.status !== 'fulfilled' || !direct.value?.items.length;
      if (!liveFailed) {
        const before = JSON.stringify(selectedItems());
        liveFeed = direct.value;
        try { localStorage.setItem('htf-news-direct-v1', JSON.stringify(liveFeed)); } catch { /* Optional cache. */ }
        if (before !== JSON.stringify(selectedItems())) { render(feed); changed = true; }
      }
      updateStatus();
      if (manual) {
        const stale = !feed || Date.now() - Date.parse(feed.fetchedAt) > 3 * 3600000;
        refreshMessage(`${liveFailed ? (changed ? '已更新热点新闻；财经直连失败，保留该来源旧新闻' : '财经直连失败，保留旧新闻') : changed ? '已更新热点新闻（财经直连已检查）' : '财经源已检查，暂无新新闻'}${stale ? '；全源快照更新延迟' : refreshFailed ? '；全源快照读取失败' : '；已检查全源快照'}`);
      }
    } catch {
      refreshFailed = true; updateStatus();
      if (manual) refreshMessage(feed?.items.length ? '刷新失败，已保留当前新闻' : '刷新失败，请稍后重试');
    } finally {
      clearTimeout(timeout); refreshing = false;
      refreshButton.disabled = false; refreshButton.textContent = '刷新'; refreshButton.setAttribute('aria-busy', 'false');
    }
  }
  refreshButton.addEventListener('click', () => refresh(true));
  function changeScope(value) {
    if (!['all', 'finance', 'world'].includes(value)) return;
    scope = value;
    try { localStorage.setItem('htf-news-scope-v1', scope); } catch { /* Optional preference. */ }
    render(feed);
  }
  $('#news-scope').addEventListener('change', event => changeScope(event.target.value));
  $('#news-filters').addEventListener('click', event => { const button = event.target.closest('[data-scope]'); if (button) changeScope(button.dataset.scope); });
  $('#news-order').addEventListener('change', event => { order = event.target.value; try { localStorage.setItem('htf-news-order-v1', order); } catch { /* Optional preference. */ } render(feed); });
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
  let cached = null;
  try { cached = validate(JSON.parse(localStorage.getItem(CACHE_KEY))); } catch { /* Invalid cache must not prevent loading the bundled news. */ }
  try { liveFeed = validate(JSON.parse(localStorage.getItem('htf-news-direct-v1'))); } catch { /* Optional cache. */ }
  const bundled = validate(window.NEWS_FEED);
  render(cached?.items.length ? cached : bundled);
  if (cached?.items.length) accept(bundled);
  remember();
  refresh();
  setInterval(refresh, 5 * 60 * 1000);
  setInterval(updateStatus, 60000);
})();
