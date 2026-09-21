/* Public publisher headlines, fetched directly without credentials. */
(function (root) {
  'use strict';
  const TOPICS = [["宏观政策", "央行|美联储|联储|降息|加息|降准|利率|货币政策|通胀|非农|失业率|关税|经贸|财政|统计局|证监会|GDP|CPI|PPI|PMI|FOMC|inflation|interest rate|monetary|economic projection|tariff|central bank", 3], ["基金与ETF", "基金|ETF|公募|QDII|funds?\\b", 2], ["全球市场", "A股|港股|美股|沪指|沪深|创业板|科创|恒指|恒生|纳指|纳斯达克|标普|道指|股市|股指|大盘|指数|stocks?\\b|shares?\\b|markets?\\b", 2], ["汇率与商品", "人民币|汇率|外汇|美元|欧元|日元|英镑|债券|国债|美债|黄金|金价|原油|油价|期货|大宗|收益率|gold|oil\\b|bonds?\\b|treasur|currency|yields?\\b", 2], ["产业公司", "财报|营收|利润|半导体|芯片|新能源|人工智能|科技|AI\\b|机器人|英伟达|苹果|微软|特斯拉|腾讯|阿里|earnings|profit|chip|nvidia|apple|tesla|microsoft", 1]];
  const ENDPOINT = 'https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=100';
  function parse(raw, now = Date.now()) {
    if (raw?.code !== 20000 || !Array.isArray(raw?.data?.items)) throw new Error('Invalid publisher response');
    const seen = new Set(), items = [];
    for (const item of raw.data.items.slice(0, 200)) {
      if (!item || typeof item.title !== 'string') continue;
      const title = item.title.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const published = Number(item.display_time) * 1000;
      if (!title || title.length > 350 || !Number.isFinite(published) || published < now - 7 * 86400000 || published > now + 3600000) continue;
      let url;
      try {
        url = new URL(item.uri);
        if (url.protocol !== 'https:' || url.username || url.password || url.port || !(url.hostname === 'wallstreetcn.com' || url.hostname.endsWith('.wallstreetcn.com'))) continue;
      } catch { continue; }
      if (seen.has(url.href)) continue;
      const topic = TOPICS.find(([, pattern]) => new RegExp(pattern, 'i').test(title));
      const publisherImportant = [2, 3].includes(item.score);
      if (!topic && !publisherImportant) continue;
      seen.add(url.href);
      items.push({ title, url: url.href, publishedAt: new Date(published).toISOString(), sourceId: 'wallstreetcn', source: '华尔街见闻',
        category: 'finance', topic: topic?.[0] || '财经综合', priority: publisherImportant ? 3 : topic?.[2] || 1, publisherImportant });
    }
    items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    if (!items.length) throw new Error('No usable publisher headlines');
    return { version: 1, fetchedAt: new Date(now).toISOString(), status: 'fresh', items: items.slice(0, 16) };
  }
  async function fetchLatest(signal) {
    const response = await fetch(ENDPOINT, { signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('Publisher unavailable');
    const text = await response.text();
    if (text.length > 2000000) throw new Error('Publisher response too large');
    return parse(JSON.parse(text));
  }
  const api = { parse, fetchLatest };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NewsLive = api;
})(globalThis);
