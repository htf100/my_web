const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const allowed=new Set(['index.html','styles.css','app.js','model.js','commands.js','news.js','live-news.js','news-data.js','news.json']);
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(path.join(root,name)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const origin='http://127.0.0.1:'+server.address().port;
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://api-one.wallstcn.com/**',r=>r.abort());
  await page.goto(origin+'/#codex-launch');
  await page.waitForSelector('[data-command="codex-launch-network"]');
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'codex-launch');
  assert.equal(await page.evaluate(()=>window.CommandModel.path(window.COMMAND_LIBRARY,'codex-launch')),'服务器 / 连接与环境 / Codex 启动配置');
  await page.locator('[data-command="codex-launch-network"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'codex --sandbox workspace-write -c sandbox_workspace_write.network_access=true');
  await page.goto(origin+'/#win-remote-root');await page.waitForSelector('[data-command="win-remote-tunnel"]');
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'win-remote-root');
  const tunnel=await page.evaluate(()=>window.COMMAND_LIBRARY.commands.find(c=>c.id==='win-remote-tunnel').code);
  assert.equal(tunnel, String.raw`ssh -A -T -i "$env:USERPROFILE\.ssh\lab_to_server" -R 127.0.0.1:2222:127.0.0.1:22 -o IdentitiesOnly=yes -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 ubuntu@43.156.51.71 'bash /home/ubuntu/disk/htf/windows-remote/hold-tunnel.sh'`);
  assert.equal(tunnel.includes('\n'),false);
  await page.locator('[data-command="win-remote-tunnel"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),tunnel);
  await page.locator('[data-count="1"]').click();
  assert.equal(await page.locator('.card').count(),18);
  await page.screenshot({path:path.join(root,'preview-windows-remote-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(root,'preview-windows-remote-mobile.png'),fullPage:true});
  // Reproduce an existing library with user changes before this feature existed.
  await page.evaluate(()=>{
   const original=JSON.parse(JSON.stringify(window.COMMAND_LIBRARY));
   original.categories=original.categories.filter(c=>!c.id.startsWith('win-remote-')&&c.id!=='codex-launch');
   original.commands=original.commands.filter(c=>!c.id.startsWith('win-remote-')&&c.id!=='codex-launch-network'&&c.id!=='connect-02');
   original.commands.find(c=>c.id==='connect-01').code='my custom connection';
   localStorage.setItem('htf-command-desk-v2',JSON.stringify({version:2,lock:{hash:'retained-hash',salt:'retained-salt'},library:original,migrations:['conda-create-v1','ssh-zicp-v1']}));
  });
  await page.reload();await page.waitForSelector('[data-command="win-remote-tunnel"]');
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.filter(c=>c.id.startsWith('win-remote-')).length,18);
  assert.equal(saved.library.commands.find(c=>c.id==='connect-01').code,'my custom connection');
  assert.equal(saved.library.commands.some(c=>c.id==='connect-02'),false);
  assert.equal(saved.lock.hash,'retained-hash');assert.equal(saved.lock.salt,'retained-salt');
  assert.equal(saved.migrations.filter(v=>v==='windows-remote-v1').length,1);
  assert.equal(saved.migrations.filter(v=>v==='codex-launch-v1').length,1);
  assert.equal(saved.library.commands.filter(c=>c.id==='codex-launch-network').length,1);
  await page.evaluate(()=>{const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));r.library.commands=r.library.commands.filter(c=>c.id!=='win-remote-load-key'&&c.id!=='codex-launch-network');r.library.commands.find(c=>c.id==='win-remote-tunnel').code='custom tunnel';localStorage.setItem(key,JSON.stringify(r));});
  await page.reload();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-load-key'),false);
  assert.equal(saved.library.commands.some(c=>c.id==='codex-launch-network'),false);
  assert.equal(saved.library.commands.find(c=>c.id==='win-remote-tunnel').code,'custom tunnel');
  assert.equal(saved.migrations.filter(v=>v==='windows-remote-v1').length,1);
  assert.deepEqual(errors,[]);
  console.log('PASS: direct link, exact one-line SSH clipboard, desktop/mobile, one-time upgrade preserves custom content/lock/deletions');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
