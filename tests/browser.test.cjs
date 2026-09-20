const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.replace(/^\/commands\//,'')||'index.html';if(!['index.html','styles.css','app.js','model.js','commands.js'].includes(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(root+'/'+name))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
 const origin='http://127.0.0.1:'+server.address().port;
 const context=await browser.newContext({viewport:{width:1600,height:1080},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/commands/');await page.waitForSelector('.card');assert.equal(await page.locator('.card').count(),45);assert.equal(await page.locator('.column').count(),3);
 await page.screenshot({path:root+'/preview-desktop.png'});
 await page.locator('[data-count="4"]').click();assert.equal(await page.locator('.column').count(),4);
 await page.locator('[data-count="2"]').click();await page.getByLabel('第 1 栏分类',{exact:true}).selectOption('mosh');await page.reload();assert.equal(await page.locator('.column').count(),2);assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'mosh');
 await page.locator('#unlock').click();await page.locator('[name=secret]').fill('test-secret-123');await page.locator('[name=confirm]').fill('test-secret-123');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});assert.equal(await page.locator('#lock-status').innerText(),'编辑已解锁');
 await page.locator('#manage-categories').click();await page.getByRole('button',{name:'＋ 添加一级标题',exact:true}).click();await page.locator('[name=label]').fill('我的工具');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 const categoryId=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')).library.categories.find(c=>c.label==='我的工具').id);
 await page.getByLabel('第 1 栏分类',{exact:true}).selectOption(categoryId);
 await page.locator('#add-command').click();await page.locator('[name=title]').fill('多行测试 <script>');await page.locator('[name=code]').fill('echo "hello"\nprintf "%s\\n" "$HOME"');await page.locator('input[name=description]').fill('检验原样保存和复制');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 let testCard=page.locator('.card').filter({hasText:'多行测试 <script>'});assert.equal(await testCard.count(),1);await testCard.getByRole('button',{name:'复制：多行测试 <script>',exact:true}).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'echo "hello"\nprintf "%s\\n" "$HOME"');
 await testCard.getByRole('button',{name:'编辑',exact:true}).click();await page.locator('[name=title]').fill('更新测试');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 testCard=page.locator('.card').filter({hasText:'更新测试'});await testCard.getByRole('button',{name:'移动',exact:true}).click();await page.locator('[name=category]').selectOption('mosh');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 await page.getByLabel('第 1 栏分类',{exact:true}).selectOption('mosh');testCard=page.locator('.card').filter({hasText:'更新测试'});assert.equal(await testCard.count(),1);
 await testCard.getByRole('button',{name:'删除',exact:true}).click();await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});assert.equal(await page.locator('.card').filter({hasText:'更新测试'}).count(),0);await page.locator('#undo').click();assert.equal(await page.locator('.card').filter({hasText:'更新测试'}).count(),1);
 // Real drag between categories.
 await page.getByLabel('第 2 栏分类',{exact:true}).selectOption('wsl');
 const drag=page.locator('.card').filter({hasText:'更新测试'}).locator('.drag-handle');await drag.dragTo(page.locator('[data-column="1"] .group-heading').first());
 assert.equal(await page.locator('[data-column="1"] .card').filter({hasText:'更新测试'}).count(),1);
 const dlPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await dlPromise;const file=await download.path();const exported=JSON.parse(fs.readFileSync(file));assert.equal(exported.library.commands.length,46);assert.equal(exported.library.categories.length,26);assert.equal(JSON.stringify(exported).includes('test-secret'),false);assert.equal(exported.lock,undefined);
 // Additive editing and replacement import.
 await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({categories:[{id:'cycle',label:'循环',parent:'cycle'}],commands:[]}))});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('导入失败'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')).library.commands.length),46);
 await page.reload();assert.equal(await page.locator('#lock-status').innerText(),'只读模式');assert.equal(await page.locator('.card-actions').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')).library.commands.length),46);
 await page.locator('#unlock').click();await page.locator('[name=secret]').fill('wrong-password');await page.locator('#dialog-submit').click();await page.waitForFunction(()=>!document.querySelector('#dialog-error').hidden);assert.match(await page.locator('#dialog-error').innerText(),/不正确/);await page.locator('[name=secret]').fill('test-secret-123');await page.locator('#dialog-submit').click();await page.locator('#modal').waitFor({state:'hidden'});
 // Storage failure must not claim a save or mutate the visible library.
 await page.locator('#add-command').click();await page.locator('[name=title]').fill('不应保存');await page.evaluate(()=>{window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='htf-command-desk-v2')throw new DOMException('QuotaExceededError');return window.oldSet.call(this,k,v)}});await page.locator('#dialog-submit').click();await page.waitForFunction(()=>!document.querySelector('#dialog-error').hidden);assert.match(await page.locator('#dialog-error').innerText(),/保存失败/);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')).library.commands.length),46);await page.evaluate(()=>Storage.prototype.setItem=window.oldSet);await page.locator('#dialog-cancel').click();
 // Cross-tab edits lock the current tab and cannot be overwritten.
 const other=await context.newPage();await other.goto(origin+'/commands/');await other.evaluate(()=>{const key='htf-command-desk-v2';const r=JSON.parse(localStorage.getItem(key));r.updatedAt='2026-09-21T00:00:00.000Z';localStorage.setItem(key,JSON.stringify(r))});await page.waitForFunction(()=>document.querySelector('#lock-status').textContent==='只读模式');assert.equal(await page.locator('#notice').isVisible(),true);await other.close();
 // Responsive widths, scoped search and clean-state screenshots.
 await page.reload();await page.locator('[data-count="3"]').click();await page.getByLabel('第 1 栏分类',{exact:true}).selectOption('server-root');await page.getByLabel('第 2 栏分类',{exact:true}).selectOption('colab-root');
 await page.locator('#search').fill('mosh 60000');assert.equal(await page.locator('.card').count(),1);await page.locator('#search').fill('no-match-xyz');assert.equal(await page.locator('.card').count(),0);await page.locator('#search').fill('');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:root+'/preview-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.setViewportSize({width:320,height:700});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.setViewportSize({width:1100,height:900});await page.locator('[data-count="4"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: layouts persist, nested categories, secret setup/wrong/correct, CRUD, exact clipboard, selection move + drag, delete/undo, export/import validation, refresh lock, quota atomicity, cross-tab lock, search, mobile widths, no JS errors.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
