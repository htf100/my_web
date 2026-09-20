const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].replace(/^\/my_web\//,'')||'index.html';if(!['index.html','styles.css','app.js','model.js','commands.js','news.js','news-data.js','news.json'].includes(name)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(path.join(root,name)))});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port+'/my_web/';
  await page.goto(url,{waitUntil:'networkidle'});assert.equal(await page.locator('.card').count(),45);assert.equal(await page.locator('#news-list li').count(),12);assert.equal(await page.locator('.news-group').count(),2);
  await page.mouse.move(900,400);const transform=()=>page.locator('#news-track').evaluate(n=>getComputedStyle(n).transform);
  const a=await transform();await page.waitForTimeout(250);assert.notEqual(await transform(),a,'ticker moves');
  await page.locator('#news-pause').click();const b=await transform();await page.waitForTimeout(250);assert.equal(await transform(),b,'manual pause');
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#news-pause').getAttribute('aria-pressed'),'true');await page.locator('#news-pause').click();
  await page.locator('#news-viewport').hover();const c=await transform();await page.waitForTimeout(250);assert.equal(await transform(),c,'hover pause');
  await page.locator('#news-list-open').click();assert.equal(await page.locator('#news-dialog').isVisible(),true);
  const link=page.locator('#news-list a').first(),href=await link.getAttribute('href');assert.match(href,/^https:\/\/[^/]*(bbc\.com|bbc\.co\.uk|dw\.com)\//);assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
  await context.route('https://**/*',route=>route.fulfill({status:200,contentType:'text/html',body:'<title>Publisher destination</title>'}));const popupPromise=page.waitForEvent('popup');await link.click();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),href);await popup.close();
  await page.locator('#news-list-close').click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#news-pause').disabled);assert.equal(await page.locator('#news-track').evaluate(n=>getComputedStyle(n).animationName),'none');assert.equal(await page.locator('#news-pause').isDisabled(),true);
  await page.setViewportSize({width:320,height:740});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(root,'preview-news-mobile.png')});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(root,'preview-news-desktop.png')});
  const old=JSON.parse(fs.readFileSync(path.join(root,'news.json')));old.fetchedAt='2026-01-01T00:00:00Z';old.items=old.items.slice(0,1);old.items.push({...old.items[0],url:'javascript:alert(1)'});old.items[0].title='<img src=x onerror=alert(1)> test';old.status='cached';
  await page.evaluate(()=>localStorage.removeItem('htf-news-last-good-v1'));
  await page.route('**/news-data.js',r=>r.fulfill({contentType:'text/javascript',body:'window.NEWS_FEED='+JSON.stringify(old)}));await page.route('**/news.json',r=>r.fulfill({status:503,body:'unavailable'}));await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#news-list li').count(),1);assert.equal(await page.locator('#news-list img').count(),0);assert.match(await page.locator('#news-updated').innerText(),/更新延迟|较早新闻/);assert.equal(await page.locator('.card').count(),45);
  await page.evaluate(()=>localStorage.removeItem('htf-news-last-good-v1'));
  await page.route('**/news-data.js',r=>r.fulfill({contentType:'text/javascript',body:'window.NEWS_FEED=null'}));await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#news-updated').innerText(),/暂未获取/);assert.equal(await page.locator('.card').count(),45);assert.deepEqual(errors,[]);
  console.log('PASS: animated ticker, pause/resume/hover/preference, article new tab, reduced motion, mobile width, safe text/URLs, stale and offline fallbacks, existing desk intact.');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exit(1)});
