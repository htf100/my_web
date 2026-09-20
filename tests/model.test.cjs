const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const M=require('../model.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../commands.js'),'utf8'),ctx);
const seed=()=>M.validate(ctx.window.COMMAND_LIBRARY);
test('preserves every source command across hierarchical categories',()=>{const l=seed();assert.equal(l.commands.length,45);assert.equal(l.categories.length,25);assert.equal(M.ordered(l).length,25);assert.equal(M.descendants(l,'server-root').size,7);assert.equal(M.path(l,'mosh'),'服务器 / 连接与环境 / Mosh 远程连接');});
test('rejects cycles, excessive depth, duplicates, and orphan commands',()=>{
 let l=seed();l.categories[0].parent='mosh';assert.throws(()=>M.validate(l),/自身/);
 l=seed();l.categories.push({...l.categories[0]});assert.throws(()=>M.validate(l),/重复/);
 l=seed();l.commands[0].category='missing';assert.throws(()=>M.validate(l),/不存在/);
 l=seed();for(let n=0;n<7;n++)l.categories.push({id:'depth'+n,label:'深度',parent:n?'depth'+(n-1):null});assert.throws(()=>M.validate(l),/6 级/);
});
test('moves commands across categories and preserves exact multiline content',()=>{
 const l=seed(),a=l.commands[0],b=l.commands[1];const content=a.code;
 M.move(l,a.id,b.category,b.id);assert.equal(l.commands.find(c=>c.id===a.id).category,b.category);assert.equal(l.commands.findIndex(c=>c.id===a.id)+1,l.commands.findIndex(c=>c.id===b.id));assert.equal(l.commands.find(c=>c.id===a.id).code,content);assert.doesNotThrow(()=>M.validate(l));
 M.move(l,a.id,b.category);assert.equal(l.commands.at(-1).id,a.id);assert.equal(l.commands.length,45);
});
