const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].replace(/^\//,'')||'index.html';if(!/^[\w.-]+$/.test(name)||!fs.existsSync(path.join(root,name)))return res.writeHead(404).end();res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(path.join(root,name)))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=JSON.parse(fs.readFileSync(path.join(root,'news.json')));base.fetchedAt=new Date(Date.now()-5*3600000).toISOString();
  let snapshot=base,fail=false,calls=0;
  let direct={code:20000,data:{items:[{title:'港股最新行情测试',uri:'https://wallstreetcn.com/livenews/direct-test',display_time:Math.floor(Date.now()/1000),score:2}]}};
  await page.route('**/news-data.js',r=>r.fulfill({contentType:'text/javascript',body:'window.NEWS_FEED='+JSON.stringify(base)}));
  await page.route('**/news.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(snapshot)}));
  await page.route('https://api-one.wallstcn.com/**',r=>{calls++;return r.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(direct)})});
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
  assert.equal(calls,1);assert.match(await page.locator('#news-updated').textContent(),/财经直连 已检查.*全源 更新延迟/);
  assert.equal(await page.locator('#news-list .news-headline').first().textContent(),'港股最新行情测试');
  const click=async()=>{await page.locator('#news-refresh').click();await page.waitForFunction(()=>!document.querySelector('#news-refresh').disabled)};
  await page.evaluate(()=>window.oldTicker=document.querySelector('.news-group'));
  await click();assert.equal(calls,2);assert.match(await page.locator('#news-refresh-status').textContent(),/暂无新新闻.*全源快照更新延迟/);
  assert.equal(await page.evaluate(()=>window.oldTicker===document.querySelector('.news-group')),true);
  const before=await page.locator('#news-list').textContent();fail=true;await click();assert.equal(await page.locator('#news-list').textContent(),before);assert.match(await page.locator('#news-refresh-status').textContent(),/财经直连失败/);
  fail=false;direct.data.items[0].title='港股再次更新测试';await click();assert.match(await page.locator('#news-list').textContent(),/港股再次更新测试/);
  // A newer unchanged snapshot advances its actual fetch time without losing cached direct news.
  snapshot={...base,fetchedAt:new Date(Date.now()-60000).toISOString()};await click();assert.match(await page.locator('#news-updated').textContent(),/全源 更新 /);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-news-last-good-v1')).fetchedAt),snapshot.fetchedAt);
  fail=true;await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#news-list').textContent(),/港股再次更新测试/);
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);console.log('PASS: direct refresh, stale snapshot disclosure, same headlines preserve ticker and advance metadata, failures/cache/reload/mobile');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
