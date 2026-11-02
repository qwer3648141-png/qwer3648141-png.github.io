/** ENJP V2: run real legacy answer/score functions with simulated dates. */
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync(require("node:path").join(__dirname,"..","index.html"),"utf8");
function portion(from,to){
 const a=html.indexOf(from),b=html.indexOf(to,a);
 assert(a>=0&&b>a,"Could not find scoring function "+from);
 return html.slice(a,b);
}
const mark=portion("function lexMark(v,ok){","function lexRuby(v)");
const answer=portion("function lexAnswer(value){","function lexInit(){");
let day="2026-11-03",saves=0,updates=0;
const item={level:0,seen:0,correct:0,wrong:0,due:"",last:""};
const trainer={current:null};
const feedback={className:"",innerHTML:""};
const ctx={
 lexItem:()=>item,lexToday:()=>day,lexDue:(level)=>"due:"+level,
 lexSave:()=>saves++,lexUpdateStats:()=>updates++,
 lexState:trainer,document:{getElementById:(id)=>{assert.equal(id,"lexTrainFeedback");return feedback}},
 lexNormalize:v=>String(v).trim()
};
const funcs=vm.runInNewContext(mark+"\n"+answer+"\n({lexMark,lexAnswer})",ctx);
const verb={kind:"verb",word:"書く",meaning:"寫"};
funcs.lexMark(verb,true);assert.equal(item.level,1);
funcs.lexMark(verb,true);assert.equal(item.level,1,"Repeated promotion on one day");
funcs.lexMark(verb,false);assert.equal(item.level,0);
funcs.lexMark(verb,true);assert.equal(item.level,0,"Same-day correction cannot regain a star after promotion");
day="2026-11-04";funcs.lexMark(verb,true);assert.equal(item.level,1);
assert.equal(item.lastPromotionDay,day);
const before=item.seen;
trainer.current={v:verb,answer:"書いて",mode:"conjugation"};
day="2026-11-05";
funcs.lexAnswer("書いて");assert.equal(item.seen,before+1);
assert.equal(trainer.current.answered,true);
funcs.lexAnswer("書いて");assert.equal(item.seen,before+1,"Double submit counted twice");
assert.equal(item.level,2);
assert.equal(saves,6);
assert.equal(updates,6);
console.log("PASS — legacy form quiz prevents double scoring; star promotion is limited across dates");
