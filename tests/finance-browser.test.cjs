const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const now = Date.now();
  const story = (title, sourceId, url, priority, minutes, topic) => ({ title, sourceId, url, priority, topic, publishedAt: new Date(now - minutes * 60000).toISOString() });
  const payload = { version: 1, fetchedAt: new Date(now).toISOString(), status: 'fresh', items: [
    story('国际新闻', 'bbc-world', 'https://www.bbc.com/news/world/one', 1, 0, '国际'),
    story('ETF 市场动态', 'wallstreetcn', 'https://wallstreetcn.com/livenews/123', 2, 1, '基金与ETF'),
    story('央行利率公告', 'fed', 'https://www.federalreserve.gov/newsevents/one', 3, 10, '宏观政策'),
    story('企业财报', 'chinanews-finance', 'https://www.chinanews.com.cn/cj/one', 1, 2, '产业公司'),
    story('拒绝假域名', 'wallstreetcn', 'https://wallstreetcn.com.evil.test/story', 3, 0, '宏观政策'),
    story('拒绝未知来源', 'unknown', 'https://www.bbc.com/news/fake', 3, 0, '宏观政策'),
  ] };
  const server = http.createServer((req, res) => {
    const name = req.url.split('?')[0].replace(/^\//, '') || 'index.html';
    if (name === 'news.json') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(payload)); }
    if (name === 'news-data.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end('window.NEWS_FEED=' + JSON.stringify(payload)); }
    if (!['index.html', 'styles.css', 'app.js', 'model.js', 'commands.js', 'news.js'].includes(name)) return res.writeHead(404).end();
    res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(fs.readFileSync(path.join(root, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#news-list li').count(), 4);
    assert.equal(await page.locator('#news-list .news-headline').first().innerText(), '央行利率公告');
    await page.locator('#news-scope').selectOption('finance');
    assert.equal(await page.locator('#news-list li').count(), 3);
    assert.equal(await page.locator('.news-group').first().locator('[data-category="world"]').count(), 0);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#news-scope').inputValue(), 'finance');
    await page.locator('#news-list-open').click();
    await page.locator('#news-order').selectOption('latest');
    assert.equal(await page.locator('#news-list .news-headline').first().innerText(), 'ETF 市场动态');
    await page.locator('#news-filters [data-scope="world"]').click();
    assert.equal(await page.locator('#news-list li').count(), 1);
    assert.equal(await page.locator('#news-scope').inputValue(), 'world');
    // Filtering never discards the full cached dataset.
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('htf-news-last-good-v1')).items.length), 4);
    await page.locator('#news-filters [data-scope="all"]').click();
    await page.locator('#news-list-close').click();
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('#news-scope').selectOption('finance');
      assert.equal(await page.locator('.news-group').first().locator('.news-item').count(), 3);
    }
    assert.deepEqual(errors, []);
    console.log('PASS finance: source validation, priority/latest order, filters, persisted scope, full cache, mobile controls.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
