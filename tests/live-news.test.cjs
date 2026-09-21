const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parse}=require('../live-news.js');
const now=Date.parse('2026-09-21T11:00:00Z');
const entry=(extra={})=>({title:'美联储利率消息',uri:'https://wallstreetcn.com/livenews/123',display_time:now/1000-60,score:1,...extra});
test('uses publisher dates, filters unsafe/unrelated/old entries and deduplicates',()=>{
 const result=parse({code:20000,data:{items:[entry(),entry(),entry({uri:'https://evil.test/story'}),entry({uri:'https://wallstreetcn.com/x',display_time:0}),entry({uri:'https://wallstreetcn.com/y',title:'无关的本地消息'}),entry({uri:'javascript:alert(1)'})]}},now);
 assert.equal(result.items.length,1);assert.equal(result.items[0].publishedAt,'2026-09-21T10:59:00.000Z');assert.equal(result.items[0].topic,'宏观政策');
});
test('latest publication precedes older priority news',()=>{
 const result=parse({code:20000,data:{items:[entry({score:3}),entry({title:'港股指数上涨',uri:'https://wallstreetcn.com/livenews/124',display_time:now/1000})]}},now);
 assert.equal(result.items[0].title,'港股指数上涨');
});
test('empty and malformed responses are failures, never successful refreshes',()=>{
 for(const raw of [{code:500}, {code:20000,data:{items:[]}},null]) assert.throws(()=>parse(raw,now));
});
