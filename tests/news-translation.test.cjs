const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const name = req.url.split('?')[0].replace(/^\//, '') || 'index.html';
    if (!/^[\w.-]+$/.test(name) || !fs.existsSync(path.join(root, name))) return res.writeHead(404).end();
    res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(fs.readFileSync(path.join(root, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const now = new Date().toISOString();
    const original = { title: 'Federal Reserve issues FOMC statement', sourceId: 'fed', url: 'https://www.federalreserve.gov/story', publishedAt: now };
    const translated = { ...original, title: '美联储发布货币政策声明', originalTitle: original.title };
    const native = { ...original, title: '央行关注 ETF 与 AI 板块', url: 'https://www.federalreserve.gov/chinese' };
    const feed = { version: 1, fetchedAt: now, status: 'fresh', items: [translated, native, { ...original, url: 'https://www.federalreserve.gov/untranslated' }] };
    await page.addInitScript(({ now, original, native }) => {
      localStorage.setItem('htf-news-last-good-v1', JSON.stringify({ version: 1, fetchedAt: now, items: [original, native] }));
      window.englishFlashed = false;
      new MutationObserver(() => {
        if ([...document.querySelectorAll('.news-headline')].some(e => e.textContent === original.title)) window.englishFlashed = true;
      }).observe(document, { subtree: true, childList: true });
    }, { now, original, native });
    await page.route('**/news-data.js', r => r.fulfill({ contentType: 'text/javascript', body: 'window.NEWS_FEED=' + JSON.stringify(feed) }));
    await page.route('**/news.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(feed) }));
    await page.route('https://api-one.wallstcn.com/**', r => r.fulfill({ status: 503, body: '' }));
    await page.goto('http://127.0.0.1:' + server.address().port, { waitUntil: 'networkidle' });
    assert.deepEqual(await page.locator('#news-list .news-headline').allTextContents(), [translated.title, native.title]);
    assert.equal(await page.evaluate(() => window.englishFlashed), false);
    const link = page.locator('#news-track a').first();
    assert.equal(await link.getAttribute('href'), original.url);
    assert.match(await link.getAttribute('title'), /机器翻译，原文：Federal Reserve/);
    await page.locator('#news-pause').click();
    assert.match(await page.locator('#news-strip').getAttribute('class'), /news-paused/);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log('PASS: translated ticker/list, original links, old cache migration, no English flash, failed translation exclusion, pause and mobile');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
