const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].replace(/^\/my_web\//,'')||'index.html';if(!['index.html','styles.css','app.js','model.js','commands.js','news.js','news-data.js','news.json'].includes(name)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(path.join(root,name)))});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const original=JSON.parse(fs.readFileSync(path.join(root,'news.json'))),updated=structuredClone(original);
  updated.fetchedAt=new Date(Date.parse(original.fetchedAt)+60000).toISOString();
  updated.items[0]={...original.items[0],title:'新的国际新闻测试',url:'https://www.bbc.com/news/articles/refresh-test'};
  let response=original,status=200,release=null,hold=false,calls=0;
  await page.route('**/news.json',async route=>{calls++;if(hold)await new Promise(resolve=>{release=resolve});await route.fulfill({status,contentType:'application/json',body:JSON.stringify(response)})});
  await page.goto('http://127.0.0.1:'+server.address().port+'/my_web/',{waitUntil:'networkidle'});
  const refresh=page.getByRole('button',{name:'刷新热点新闻',exact:true});
  const headlines=()=>page.locator('#news-list .news-headline').allTextContents();
  const oldTitles=await headlines();
  const mark=()=>page.evaluate(()=>{window.oldTicker=document.querySelector('.news-group')});
  const preserved=async()=>{assert.deepEqual(await headlines(),oldTitles);assert.equal(await page.evaluate(()=>window.oldTicker===document.querySelector('.news-group')),true)};
  const refreshDone=async()=>{await refresh.click();await page.waitForFunction(()=>!document.querySelector('#news-refresh').disabled)};
  await mark();hold=true;response=updated;const beforeCalls=calls;await refresh.click();
  await page.waitForFunction(()=>document.querySelector('#news-refresh').disabled);while(!release)await new Promise(r=>setTimeout(r,10));
  await preserved();assert.equal(calls,beforeCalls+1);assert.match(await page.locator('#news-refresh-status').textContent(),/当前新闻继续显示/);
  // A successful response with only a new fetch timestamp does not restart the ticker.
  response={...original,fetchedAt:updated.fetchedAt};hold=false;release();
  await page.waitForFunction(()=>!document.querySelector('#news-refresh').disabled);await preserved();
  assert.match(await page.locator('#news-refresh-status').textContent(),/暂无新新闻/);
  for(const scenario of [
   {status:503,response:original},
   {status:200,response:{...updated,items:[]}},
   {status:200,response:{items:'invalid'}},
   {status:200,response:{...updated,fetchedAt:'2000-01-01T00:00:00Z'}},
   {status:200,response:{...original,fetchedAt:updated.fetchedAt,items:original.items.slice(1)}}
  ]){status=scenario.status;response=scenario.response;await refreshDone();await preserved();}
  status=200;response=updated;await refreshDone();
  assert.equal((await headlines())[0],'新的国际新闻测试');assert.equal((await headlines()).includes(oldTitles[0]),false);
  assert.match(await page.locator('#news-refresh-status').textContent(),/已更新热点/);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-news-last-good-v1')).items[0].title),'新的国际新闻测试');
  // A failed source keeps its headlines when another source has a new story.
  const partial={...updated,status:'partial',fetchedAt:new Date(Date.parse(updated.fetchedAt)+60000).toISOString(),items:updated.items.filter(i=>i.sourceId!=='dw-zh')};
  partial.items[0]={...partial.items[0],title:'部分来源更新测试'};response=partial;await refreshDone();
  for(const item of original.items.filter(i=>i.sourceId==='dw-zh'))assert.equal((await headlines()).includes(item.title),true);
  const lastGood=await headlines();status=503;await page.reload({waitUntil:'networkidle'});assert.deepEqual(await headlines(),lastGood);
  // The success state replaces the copy SVG with a visible check, then restores it.
  const copy=page.locator('.card .copy').first(),command=await page.locator('.card code').first().textContent();
  await copy.focus();await page.keyboard.press('Enter');await copy.locator('.copy-check').waitFor();
  assert.equal(await copy.locator('.copy-check').textContent(),'✓');assert.equal(await copy.locator('svg').count(),0);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),command);
  await page.waitForTimeout(1100);await copy.click();await page.waitForTimeout(1100);assert.equal(await copy.locator('.copy-check').isVisible(),true);
  await copy.locator('svg').waitFor();assert.equal(await copy.locator('.copy-check').count(),0);
  await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('denied')};document.execCommand=()=>false});
  await copy.click();assert.equal(await copy.locator('.copy-check').count(),0);assert.equal(await page.evaluate(()=>getSelection().toString()),command);
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await refreshDone();assert.deepEqual(await headlines(),lastGood)}
  assert.deepEqual(errors,[]);
  console.log('PASS: visible check replacement/reset, exact copy, failure selection, refresh pending/same/subset/error/empty/invalid/older/new/partial, cache survives reload, mobile controls');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exit(1)});
