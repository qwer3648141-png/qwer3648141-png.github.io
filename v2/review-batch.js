/* ENJP Ocean 2.0 — pure read-only adapter for old and new learning histories. */
(function(root,factory){"use strict";const api=factory(typeof module==="object"&&module.exports?require("./review-core.js"):root.ENJP_V2_REVIEW);if(typeof module==="object"&&module.exports)module.exports=api;else root.ENJP_V2_BATCH=api;})(typeof globalThis==="object"?globalThis:this,function(core){
"use strict";
if(!core)throw Error("Review core is missing");
const K=core.keyFor;
function validDue(record,day){return !!record&&Number(record.seen||0)>0&&typeof record.due==="string"&&record.due<=day}
function items(opts){
 const day=core.dateKey(opts.day);
 const detailed=opts.detailed&&typeof opts.detailed==="object"?opts.detailed:{};
 const oldLex=opts.legacyLex&&typeof opts.legacyLex==="object"?opts.legacyLex:{};
 const oldGrammar=opts.legacyGrammar&&typeof opts.legacyGrammar==="object"?opts.legacyGrammar:{};
 const due=[],fresh=[],seen=new Set();
 const make=(kind,id,skill,source,answer,meaning,lv,when)=>{
  const key=K({kind,id,skill});if(seen.has(key))return;seen.add(key);
  const t={key,kind,id,skill,source,answer:String(answer),meaning:String(meaning||""),level:lv||"",due:when||null};
  if(when&&when<=day)due.push(t);else if(!when)fresh.push(t);
 };
 for(const v of opts.words||[]){
  if(!v||!["verb","adj"].includes(v.kind)||!v.word)continue;
  const forms=Object.entries((opts.forms&&opts.forms(v))||{}).filter(x=>typeof x[1]==="string"&&x[1]);
  if(!forms.length)continue;
  const recorded=forms.some(([skill])=>Object.prototype.hasOwnProperty.call(detailed,K({kind:v.kind,id:v.word,skill})));
  for(const [skill,answer] of forms){
   const key=K({kind:v.kind,id:v.word,skill});
   if(Object.prototype.hasOwnProperty.call(detailed,key)){
    const dueAt=core.record(detailed[key]).due;
    if(dueAt&&dueAt<=day)make(v.kind,v.word,skill,v,answer,v.meaning,v.level,dueAt);
   }else if(recorded)make(v.kind,v.word,skill,v,answer,v.meaning,v.level,null);
  }
  if(!recorded){
   const old=oldLex[v.kind+":"+v.word];
   const offset=[...v.word].reduce((a,c)=>a+c.codePointAt(0),0)%forms.length;
   const [skill,answer]=forms[offset];
   if(validDue(old,day))make(v.kind,v.word,skill,v,answer,v.meaning,v.level,old.due);
   else if(!old||!old.seen)make(v.kind,v.word,skill,v,answer,v.meaning,v.level,null);
  }
 }
 for(const g of opts.grammar||[]){
  if(!g||!g.f||!g.m)continue;
  const skills=["meaning","form"];
  const recorded=skills.some(skill=>Object.prototype.hasOwnProperty.call(detailed,K({kind:"grammar",id:g.f,skill})));
  for(const skill of skills){
   const key=K({kind:"grammar",id:g.f,skill});
   if(Object.prototype.hasOwnProperty.call(detailed,key)){
    const dueAt=core.record(detailed[key]).due;
    if(dueAt&&dueAt<=day)make("grammar",g.f,skill,g,skill==="meaning"?g.m:g.f,g.m,g.lv,dueAt);
   }else if(recorded)make("grammar",g.f,skill,g,skill==="meaning"?g.m:g.f,g.m,g.lv,null);
  }
  if(!recorded){
   const old=oldGrammar[g.f];
   if(validDue(old,day))make("grammar",g.f,"meaning",g,g.m,g.m,g.lv,old.due);
   else if(!old||!old.seen)make("grammar",g.f,"meaning",g,g.m,g.m,g.lv,null);
  }
 }
 due.sort((a,b)=>a.due.localeCompare(b.due)||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
 return {due,fresh};
}
function select(list,options={}){
 const group=options.kind||"all",limit=Math.min(100,Math.max(1,Math.floor(Number(options.limit)||10)));
 return (list||[]).filter(t=>group==="all"||t.kind===group).slice(0,limit);
}
return Object.freeze({items,select});
});
