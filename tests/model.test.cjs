const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const M=require('../model.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../commands.js'),'utf8'),ctx);
const seed=()=>M.validate(ctx.window.COMMAND_LIBRARY);
test('preserves every source command across hierarchical categories',()=>{const l=seed();assert.equal(l.commands.length,106);assert.equal(l.categories.length,47);assert.equal(M.ordered(l).length,47);assert.equal(M.descendants(l,'server-root').size,13);assert.equal(M.path(l,'mosh'),'服务器 / 连接与环境 / Mosh 远程连接');assert.deepEqual(Array.from(l.categories.filter(c=>c.parent===null&&c.id.startsWith('htf-')),c=>c.id),['htf-env','htf-vision','htf-learning','htf-ops','htf-web']);});
test('includes the supplied SSH host, port, and username',()=>{const l=seed(),command=l.commands.find(c=>c.id==='connect-ssh-zicp');assert.equal(M.path(l,command.category),'服务器 / 连接与环境');assert.equal(command.code,'ssh -p 12793 hutianfang@55e844v521.zicp.fun');});
test('includes the server Conda activation command with the supplied path',()=>{const l=seed();const command=l.commands.find(c=>c.id==='htf-conda-01');assert.equal(M.path(l,command.category),'Python 环境 / Conda · maskdino310');assert.equal(command.code,'source "/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh"\nconda activate maskdino310');});
test('provides separate Linux and Windows commands for a new Conda environment',()=>{const l=seed();const linux=l.commands.find(c=>c.id==='htf-conda-create-linux'),windows=l.commands.find(c=>c.id==='htf-conda-create-windows');assert.equal(M.path(l,linux.category),'Python 环境 / 新建 Conda 环境');assert.equal(windows.category,linux.category);assert.match(linux.code,/source "\/mnt\/sda1\/htf\/software\/miniforge3\/etc\/profile\.d\/conda\.sh"/);assert.match(linux.code,/conda create -n "\$ENV_NAME" python=3\.10/);assert.match(windows.code,/conda create -n your_new_env python=3\.10/);assert.doesNotMatch(windows.code,/source/);});
test('rejects cycles, excessive depth, duplicates, and orphan commands',()=>{
 let l=seed();l.categories[0].parent='mosh';assert.throws(()=>M.validate(l),/自身/);
 l=seed();l.categories.push({...l.categories[0]});assert.throws(()=>M.validate(l),/重复/);
 l=seed();l.commands[0].category='missing';assert.throws(()=>M.validate(l),/不存在/);
 l=seed();for(let n=0;n<7;n++)l.categories.push({id:'depth'+n,label:'深度',parent:n?'depth'+(n-1):null});assert.throws(()=>M.validate(l),/6 级/);
});
test('moves commands across categories and preserves exact multiline content',()=>{
 const l=seed(),a=l.commands[0],b=l.commands[1];const content=a.code;
 M.move(l,a.id,b.category,b.id);assert.equal(l.commands.find(c=>c.id===a.id).category,b.category);assert.equal(l.commands.findIndex(c=>c.id===a.id)+1,l.commands.findIndex(c=>c.id===b.id));assert.equal(l.commands.find(c=>c.id===a.id).code,content);assert.doesNotThrow(()=>M.validate(l));
 M.move(l,a.id,b.category);assert.equal(l.commands.at(-1).id,a.id);assert.equal(l.commands.length,106);
});

test('merges only missing project entries without overwriting edits or restoring deleted old commands',()=>{
 const all=seed(),pack={categories:all.categories.filter(c=>c.id.startsWith('htf-')),commands:all.commands.filter(c=>c.id.startsWith('htf-'))};
 const old={categories:all.categories.filter(c=>!c.id.startsWith('htf-')),commands:all.commands.filter(c=>!c.id.startsWith('htf-')&&c.id!=='connect-02')};
 old.commands[0].code='my custom command';const before=JSON.stringify(old);
 const merged=M.mergeMissing(old,pack);assert.equal(merged.commands.length,105);assert.equal(merged.commands.find(c=>c.id==='connect-01').code,'my custom command');assert.equal(merged.commands.some(c=>c.id==='connect-02'),false);assert.equal(JSON.stringify(old),before);
 merged.commands.find(c=>c.id==='htf-env-01').code='customized project command';merged.categories.find(c=>c.id==='htf-env').label='my environment';
 assert.deepEqual(M.mergeMissing(merged,pack),merged);
});
test('reorganizes the old project root while keeping custom content and edited commands',()=>{
 const template=seed(),old=seed();
 old.categories.push({id:'htf-projects',label:'HTF 项目常用',parent:null},{id:'my-project',label:'我的项目',parent:'htf-projects'});
 for(const category of old.categories)if(['htf-env','htf-vision','htf-learning','htf-ops','htf-web'].includes(category.id))category.parent='htf-projects';
 old.categories=old.categories.filter(c=>!['htf-venv','htf-resource','htf-backup','htf-web-local','htf-web-publish'].includes(c.id));
 for(const command of old.commands){
  if(/^htf-env-0[1-3]$/.test(command.id))command.category='htf-env';
  if(/^htf-ops-0[1-4]$/.test(command.id))command.category='htf-ops';
  if(/^htf-web-0[1-5]$/.test(command.id))command.category='htf-web';
 }
 old.commands.find(c=>c.id==='htf-env-01').code='my edited Python check';
 old.commands.find(c=>c.id==='htf-web-02').category='htf-env';
 old.commands.push({...old.commands[0],id:'my-custom',category:'my-project',title:'自建命令'});
 const before=JSON.stringify(old),migrated=M.reorganizeProjectCategories(old,template);
 assert.equal(JSON.stringify(old),before);
 assert.equal(migrated.commands.length,old.commands.length);
 assert.equal(migrated.commands.find(c=>c.id==='htf-env-01').code,'my edited Python check');
 assert.equal(migrated.commands.find(c=>c.id==='htf-env-01').category,'htf-venv');
 assert.equal(migrated.commands.find(c=>c.id==='htf-ops-03').category,'htf-backup');
 assert.equal(migrated.commands.find(c=>c.id==='htf-web-04').category,'htf-web-publish');
 assert.equal(migrated.commands.find(c=>c.id==='htf-web-02').category,'htf-env');
 assert.equal(migrated.commands.find(c=>c.id==='my-custom').category,'my-project');
 assert.ok(migrated.categories.some(c=>c.id==='htf-projects'));
 assert.deepEqual(M.reorganizeProjectCategories(migrated,template),migrated);
 old.categories=old.categories.filter(c=>c.id!=='my-project');old.commands=old.commands.filter(c=>c.id!=='my-custom');
 assert.equal(M.reorganizeProjectCategories(old,template).categories.some(c=>c.id==='htf-projects'),false);
});
