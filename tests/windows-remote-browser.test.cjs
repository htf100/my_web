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
  await page.goto(origin+'/#win-remote-quick');
  await page.waitForSelector('[data-command="win-remote-quick-connect"]');
  await page.locator('[data-count="1"]').click();
  assert.equal(await page.locator('.card').count(),6);
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'win-remote-root');
  assert.equal(await page.evaluate(()=>window.CommandModel.path(window.COMMAND_LIBRARY,'win-remote-root')),'服务器 / Windows 远程访问');
  assert.equal(await page.evaluate(()=>window.COMMAND_LIBRARY.categories.filter(c=>c.id.startsWith('win-remote-')).length),1);
  await page.locator('[data-command="win-remote-quick-connect"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),String.raw`ssh -T -i "$env:USERPROFILE\.ssh\lab_to_server" -o StrictHostKeyChecking=yes ubuntu@43.134.25.129 "cat /home/ubuntu/disk/htf/windows-remote/connect-windows.ps1" | Out-String | Invoke-Expression`);
  await page.locator('[data-command="win-remote-tunnel"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),String.raw`ssh -T -i "$env:USERPROFILE\.ssh\lab_to_server" -o StrictHostKeyChecking=yes ubuntu@43.156.51.71 "cat /home/ubuntu/disk/htf/windows-remote/connect-windows.ps1" | Out-String | Invoke-Expression`);
  await page.locator('[data-command="win-remote-services"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'Get-Service sshd,ssh-agent | Select-Object Name,Status,StartType');
  await page.locator('[data-command="win-remote-start-services"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),"Get-Service sshd,ssh-agent | Where-Object { $_.Status -eq 'Stopped' } | Start-Service");
  await page.locator('[data-command="win-remote-quick-list"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'/home/ubuntu/disk/htf/windows-remote/win-ssh.sh --list');
  await page.locator('[data-command="win-remote-quick-verify"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'read -r -p "Windows 隧道端口：" WIN_TUNNEL_PORT\n/home/ubuntu/disk/htf/windows-remote/win-ssh.sh --port "$WIN_TUNNEL_PORT" hostname\n/home/ubuntu/disk/htf/windows-remote/win-ssh.sh --port "$WIN_TUNNEL_PORT" whoami');
  await page.screenshot({path:path.join(root,'preview-windows-quick-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(root,'preview-windows-quick-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/#gpu-resources');
  await page.waitForSelector('[data-command="gpu-resource-overview"]');
  await page.locator('[data-count="1"]').click();
  assert.equal(await page.locator('.card').count(),4);
  assert.equal(await page.evaluate(()=>window.CommandModel.path(window.COMMAND_LIBRARY,'gpu-resources')),'服务器 / GPU 资源');
  for (const [id, code] of [
   ['overview','nvidia-smi'],
   ['live','nvidia-smi -l 1'],
   ['memory','nvidia-smi --query-gpu=index,name,utilization.gpu,memory.total,memory.used,memory.free --format=csv'],
   ['processes','nvidia-smi --query-compute-apps=gpu_uuid,pid,process_name,used_gpu_memory --format=csv'],
  ]) {
   await page.locator('[data-command="gpu-resource-'+id+'"] .copy').click();
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),code);
  }
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(root,'preview-gpu-resources-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/#cs2680-task-2');
  await page.waitForSelector('[data-command="course-cs2680-task2-start"]');
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'cs2680-task-2');
  assert.equal(await page.evaluate(()=>window.CommandModel.path(window.COMMAND_LIBRARY,'cs2680-task-2')),'课程作业 / CS2680 / Task 2');
  await page.locator('[data-command="course-cs2680-task2-start"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),String.raw`cd "D:\Desktop\all\learn\course\cs2680\task\2"
.\..venv\Scripts\python.exe .\my_agent_platform\main.py`);
  await page.goto(origin+'/#codex-launch');
  await page.waitForSelector('[data-command="codex-launch-network"]');
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'codex-launch');
  assert.equal(await page.evaluate(()=>window.CommandModel.path(window.COMMAND_LIBRARY,'codex-launch')),'服务器 / 连接与环境 / Codex 启动配置');
  await page.locator('[data-command="codex-launch-network"] .copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'codex --sandbox workspace-write -c sandbox_workspace_write.network_access=true');
  // A browser with no prior Windows additions receives the current six cards.
  await page.evaluate(()=>{
   const library=JSON.parse(JSON.stringify(window.COMMAND_LIBRARY));
   library.categories=library.categories.filter(c=>!c.id.startsWith('win-remote-'));
   library.commands=library.commands.filter(c=>!c.id.startsWith('win-remote-')&&c.id!=='connect-02');
   library.commands.find(c=>c.id==='connect-01').code='my custom connection';
   localStorage.setItem('htf-command-desk-v2',JSON.stringify({version:2,lock:{hash:'retained-hash',salt:'retained-salt'},library,migrations:['conda-create-v1','ssh-zicp-v1']}));
  });
  await page.goto(origin+'/?upgrade=first#win-remote-root');
  await page.waitForSelector('[data-command="win-remote-quick-connect"]');
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.filter(c=>c.id.startsWith('win-remote-')).length,6);
  assert.equal(saved.library.commands.find(c=>c.id==='connect-01').code,'my custom connection');
  assert.equal(saved.library.commands.some(c=>c.id==='connect-02'),false);
  assert.equal(saved.lock.hash,'retained-hash');assert.equal(saved.lock.salt,'retained-salt');
  assert.equal(saved.migrations.filter(v=>v==='windows-compact-v1').length,1);
  // Reproduce the real previous 21-card Windows section in a saved browser.
  const legacy=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/windows-remote-legacy.json'),'utf8'));
  await page.evaluate(legacy=>{
   const library=JSON.parse(JSON.stringify(window.COMMAND_LIBRARY));
   library.categories=library.categories.filter(c=>!c.id.startsWith('win-remote-')).concat(legacy.categories);
   library.commands=library.commands.filter(c=>!c.id.startsWith('win-remote-')).concat(legacy.commands.filter(c=>c.id!=='win-remote-quick-verify'));
   library.categories.push({id:'my-win',label:'我的远程命令',parent:'win-remote-use'});
   library.commands.push({...library.commands[0],id:'my-win-command',category:'win-remote-steps',code:'custom windows command'});
   library.commands.find(c=>c.id==='win-remote-quick-connect').code='my custom reconnect';
   library.commands.find(c=>c.id==='connect-01').code='my custom connection';
   localStorage.setItem('htf-command-desk-v2',JSON.stringify({version:2,lock:{hash:'retained-hash',salt:'retained-salt'},library,migrations:['conda-create-v1','ssh-zicp-v1','windows-remote-v1','codex-launch-v1','course-cs2680-v1','gpu-resources-v1','windows-quick-v1']}));
   localStorage.setItem('htf-command-desk-layout-v2',JSON.stringify({count:1,panels:['win-remote-errors','all','all','all'],collapsed:[]}));
  },legacy);
  await page.goto(origin+'/?upgrade=compact');
  await page.waitForSelector('[data-command="win-remote-quick-connect"]');
  assert.equal(await page.getByLabel('第 1 栏分类',{exact:true}).inputValue(),'win-remote-root');
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.categories.filter(c=>c.id.startsWith('win-remote-')).length,1);
  assert.equal(saved.library.categories.find(c=>c.id==='my-win').parent,'win-remote-root');
  assert.equal(saved.library.commands.find(c=>c.id==='my-win-command').category,'win-remote-root');
  assert.equal(saved.library.commands.find(c=>c.id==='win-remote-quick-connect').code,'my custom reconnect');
  assert.equal(saved.library.commands.find(c=>c.id==='connect-01').code,'my custom connection');
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-quick-verify'),false);
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-error-forward'),false);
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-tunnel'),true);
  assert.equal(saved.lock.hash,'retained-hash');assert.equal(saved.lock.salt,'retained-salt');
  assert.equal(saved.migrations.filter(v=>v==='windows-compact-v1').length,1);
  await page.evaluate(()=>{
   const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));
   r.library.commands=r.library.commands.filter(c=>c.id!=='win-remote-start-services'&&c.id!=='win-remote-quick-connect');
   localStorage.setItem(key,JSON.stringify(r));
  });
  await page.reload();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-start-services'),false);
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-quick-connect'),false);
  assert.equal(saved.migrations.filter(v=>v==='windows-compact-v1').length,1);
  // Restore the 43.156.51.71 command in browsers already compacted to five cards.
  await page.evaluate(()=>{
   const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));
   r.library.commands=r.library.commands.filter(c=>c.id!=='win-remote-tunnel');
   r.migrations=r.migrations.filter(v=>v!=='windows-server-7151-v1');
   localStorage.setItem(key,JSON.stringify(r));
  });
  await page.reload();await page.waitForSelector('[data-command="win-remote-tunnel"]');
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.filter(c=>c.id==='win-remote-tunnel').length,1);
  assert.equal(saved.migrations.filter(v=>v==='windows-server-7151-v1').length,1);
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-quick-connect'),false);
  assert.equal(saved.library.commands.find(c=>c.id==='connect-01').code,'my custom connection');
  assert.equal(saved.lock.hash,'retained-hash');
  await page.evaluate(()=>{const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));r.library.commands=r.library.commands.filter(c=>c.id!=='win-remote-tunnel');localStorage.setItem(key,JSON.stringify(r));});
  await page.reload();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.some(c=>c.id==='win-remote-tunnel'),false);
  assert.equal(saved.migrations.filter(v=>v==='windows-server-7151-v1').length,1);
  // Upgrade the original fixed-port preset, preserving credentials and custom code.
  const fixed7151=legacy.commands.find(c=>c.id==='win-remote-tunnel').code;
  await page.evaluate(fixed=>{
   const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));
   r.library.commands.push({...window.COMMAND_LIBRARY.commands.find(c=>c.id==='win-remote-tunnel'),code:fixed});
   r.migrations=r.migrations.filter(v=>v!=='windows-server-7151-auto-v1');
   localStorage.setItem(key,JSON.stringify(r));
  },fixed7151);
  await page.reload();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  const auto7151=await page.evaluate(()=>window.COMMAND_LIBRARY.commands.find(c=>c.id==='win-remote-tunnel'));
  assert.equal(saved.library.commands.find(c=>c.id==='win-remote-tunnel').code,auto7151.code);
  assert.equal(saved.library.commands.find(c=>c.id==='win-remote-tunnel').note,auto7151.note);
  assert.equal(saved.migrations.filter(v=>v==='windows-server-7151-auto-v1').length,1);
  assert.equal(saved.lock.hash,'retained-hash');
  await page.evaluate(()=>{
   const key='htf-command-desk-v2',r=JSON.parse(localStorage.getItem(key));
   r.library.commands.find(c=>c.id==='win-remote-tunnel').code='my custom server connection';
   r.migrations=r.migrations.filter(v=>v!=='windows-server-7151-auto-v1');
   localStorage.setItem(key,JSON.stringify(r));
  });
  await page.reload();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('htf-command-desk-v2')));
  assert.equal(saved.library.commands.find(c=>c.id==='win-remote-tunnel').code,'my custom server connection');
  assert.equal(saved.migrations.filter(v=>v==='windows-server-7151-auto-v1').length,1);
  assert.deepEqual(errors,[]);
  console.log('PASS: compact six-card Windows section, exact clipboard, mobile, old links/layout and saved legacy library migration preserve custom commands, lock and deletions');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
