"use strict";
const assert=require("node:assert/strict");
const core=require("./review-core.js");
const batch=require("./review-batch.js");
const words=[
 {kind:"verb",word:"書く",meaning:"寫",level:"N5"},
 {kind:"adj",word:"大きい",meaning:"大的",level:"N5"},
 {kind:"verb",word:"食べる",meaning:"吃",level:"N5"}
];
const grammar=[{f:"～てもいい",m:"允許",lv:"N5"},{f:"～らしい",m:"似乎",lv:"N3"}];
const forms=v=>v.kind==="adj"?{"過去形":"大きかった"}:v.word==="書く"?{"ます形":"書きます","て形":"書いて"}:{"ます形":"食べます"};
const oldL={"verb:書く":{seen:2,level:3,due:"2026-11-02"}, "adj:大きい":{seen:3,due:"2026-11-04"}};
const oldG={"～らしい":{seen:4,due:"2026-11-01"}};
const detailed={};
const key=core.keyFor({kind:"verb",id:"食べる",skill:"ます形"});
detailed[key]={stars:2,due:"2026-11-03",lastDay:"2026-11-02"};
const before=JSON.stringify({oldL,oldG,detailed});
const opts={words,grammar,forms,legacyLex:oldL,legacyGrammar:oldG,detailed,day:"2026-11-03"};
const result=batch.items(opts);
assert.deepEqual(result.due.map(x=>x.id),["～らしい","書く","食べる"]);
assert.equal(result.due.find(x=>x.id==="書く").skill,"て形");
assert(result.fresh.some(t=>t.id==="～てもいい"));
assert(!result.due.some(x=>x.id==="大きい"));
assert.deepEqual(batch.select(result.due,{kind:"verb",limit:1}).map(x=>x.id),["書く"]);
assert.deepEqual(batch.select(result.due,{kind:"grammar",limit:20}).map(x=>x.id),["～らしい"]);
assert.equal(JSON.stringify({oldL,oldG,detailed}),before,"Reading records must never mutate legacy progress");
const next=core.grade(detailed[key],{day:"2026-11-04",type:"input",correct:false});
assert.equal(next.due,"2026-11-04");assert.equal(detailed[key].stars,2,"New progress must be an independent copy");
console.log("PASS — legacy due dates, detailed review due dates, group limits and non-mutating score bridge");
