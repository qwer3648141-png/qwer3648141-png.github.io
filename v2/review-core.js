/* ENJP V2 pure review engine. Isolated module: does not access or mutate legacy saved progress. */
(function(root,factory){
"use strict";
const api=factory();
if(typeof module==="object"&&module.exports)module.exports=api;
else root.ENJP_V2_REVIEW=api;
})(typeof globalThis==="object"?globalThis:this,function(){
"use strict";
const intervals=[0,1,2,4,7,14],iso=/^\d{4}-\d{2}-\d{2}$/;
function dateKey(day){
 if(typeof day!=="string"||!iso.test(day))throw Error("Expected YYYY-MM-DD");
 const d=new Date(day+"T12:00:00Z");
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==day)throw Error("Invalid date");
 return day;
}
function plusDays(day,n){dateKey(day);const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function keyFor({kind,id,skill}){
 for(const s of [kind,id,skill])if(typeof s!=="string"||!s.trim())throw Error("Missing review identity");
 return JSON.stringify([kind,id,skill]);
}
function record(r={}){
 if(!r||typeof r!=="object"||Array.isArray(r))r={};
 return {
  stars:Math.max(0,Math.min(5,Number.isFinite(r.stars)?Math.floor(r.stars):0)),
  attempts:Math.max(0,Math.floor(Number(r.attempts)||0)),
  misses:Math.max(0,Math.floor(Number(r.misses)||0)),
  types:Array.isArray(r.types)?[...new Set(r.types.filter(x=>typeof x==="string"&&x.trim()))]:[],
  lastDay:typeof r.lastDay==="string"&&iso.test(r.lastDay)?r.lastDay:null,
  lastPromotionDay:typeof r.lastPromotionDay==="string"&&iso.test(r.lastPromotionDay)?r.lastPromotionDay:null,
  due:typeof r.due==="string"&&iso.test(r.due)?r.due:null
 };
}
function grade(previous,attempt){
 if(!attempt||typeof attempt.correct!=="boolean")throw Error("Answer correctness required");
 const day=dateKey(attempt.day),r=record(previous);
 const type=typeof attempt.type==="string"&&attempt.type.trim()?attempt.type.trim():"basic";
 r.attempts++;r.lastDay=day;
 if(!r.types.includes(type))r.types.push(type);
 if(!attempt.correct){r.misses++;r.stars=Math.max(0,r.stars-1);r.due=day;return r}
 if(attempt.hint||attempt.revealed){r.due=day;return r}
 if(r.lastPromotionDay!==day){
  const allowed=r.types.length>=3?5:r.types.length>=2?4:3;
  const newStars=Math.min(r.stars+1,allowed,5);
  if(newStars>r.stars){r.stars=newStars;r.lastPromotionDay=day}
 }
 r.due=plusDays(day,intervals[r.stars]);
 return r;
}
function dueBatch(records,day,opts={}){
 dateKey(day);
 const limit=Math.max(1,Math.min(500,Math.floor(Number(opts.limit)||20)));
 const omit=new Set(Array.isArray(opts.exclude)?opts.exclude:[]);
 const due=[];
 for(const [key,value] of Object.entries(records||{})){
  if(omit.has(key))continue;
  const r=record(value);
  if(r.due&&r.due<=day)due.push({key,r});
 }
 due.sort((a,b)=>a.r.due.localeCompare(b.r.due)||a.r.stars-b.r.stars||a.key.localeCompare(b.key));
 return due.slice(0,limit).map(x=>x.key);
}
return Object.freeze({dateKey,plusDays,keyFor,record,grade,dueBatch});
});
