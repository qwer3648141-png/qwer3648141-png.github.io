"use strict";
/* Public textbook integration regression: real V3 datasets and all 21 chapters, open navigation, legacy IDs, no new tracking. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const html=read("v3/index.html");
const assets=[...html.matchAll(/<script src="\.\/([^"]+)" defer><\/script>/g)].map(x=>"v3/"+x[1].split("?")[0]);
for(const file of assets)new vm.Script(read(file),{filename:file});
assert(assets.includes("v3/public-library.js"));
assert(assets.includes("v3/voice-grammar.js"));
let accesses=0,writes=0;
const storage={getItem(){accesses++;return null},setItem(){writes++}};
function node(tag){
 const e={tagName:tag,className:"",children:[],events:{},attrs:{},dataset:{},style:{},textContent:"",value:"",
   disabled:false,hidden:false,type:"",classList:{add(){},remove(){},toggle(){}},scrollIntoView(){}};
 e.append=(...items)=>{e.children.push(...items);e.firstChild=e.children[0]||null;e.lastChild=e.children.at(-1)||null};
 e.replaceChildren=(...items)=>{e.children=[];e.append(...items)};
 e.addEventListener=(name,fn)=>{(e.events[name]||(e.events[name]=[])).push(fn)};
 e.setAttribute=(k,v)=>{e.attrs[k]=String(v)};
 e.getAttribute=k=>e.attrs[k]||null;
 return e;
}
const walk=e=>[e,...(e.children||[]).flatMap(x=>x?.children?walk(x):[])];
const ids=Object.fromEntries(["public-library","reader","reader-content"].map(x=>[x,node("div")]));
const document={readyState:"loading",createElement:node,createTextNode:s=>({textContent:s}),getElementById:id=>ids[id]||null,
 querySelectorAll(){return []},addEventListener(){},body:{classList:{add(){},toggle(){}}}};
const A={makeRuby:s=>{const x=node("span");x.textContent=s;return x},
 spokenJapanese:s=>String(s).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2").replace(/[一-龯々]/g,"")!==null?String(s):null,
 play(){},stop(){}};
const w={localStorage:storage,ENJP_Audio:A,matchMedia:()=>({matches:false}),
 location:{hash:""},addEventListener(){},history:{pushState(_a,_b,hash){w.location.hash=hash}}};
const ctx={document,window:w,localStorage:storage,console,Math,Date};
vm.createContext(ctx);
for(const file of assets){
 if(["v3/audio.js","v3/app.js","v3/public-library.js"].includes(file))continue;
 vm.runInContext(read(file),ctx);
}
assert(w.ENJP_COURSES&&w.ENJP_CuratedVocab&&w.ENJP_VoiceGrammar&&w.ENJP_WeatherAtlas&&w.ENJP_AppearanceAtlas);
const app={state:{mode:"jp",level:"N5",vocabLang:"jlpt",vocabLevel:"N5",sectionId:null,filter:""},
 renderAll(){this.state.sectionId=null},
 goToSection(id){this.state.sectionId=id;return true}};
w.ENJP_3=app;
const before={reads:accesses,writes};
vm.runInContext(read("v3/public-library.js"),ctx);
const P=w.ENJP_PublicLibrary;
assert(P&&P.stats().chapters===21);
assert.equal(P.parts.jp.length,5);assert.equal(P.parts.en.length,5);assert.equal(P.parts.dual.length,5);
assert.equal(P.parts.jp.reduce((n,x)=>n+x.chapters.length,0),21);
const count=P.stats();
assert(count.jp>65,"Japanese corpus should include old and new chapters");
assert(count.en>=30,"English corpus must include 30 original chapters");
assert(count.dual>=30,"Bilingual corpus must include 30 original chapters");
for(const [id,chapter,mode]of [
 ["jp-hira","01","jp"],["jp-verb-overview","04","jp"],["jp-voice-overview","04","jp"],
 ["jp-voice-passive","04","jp"],["jp-voice-causative","04","jp"],["jp-voice-causative-passive","04","jp"],
 ["jp-adjective-overview","05","jp"],["jp-particles","06","jp"],
 ["jp-contrast-so-two-uses","09","jp"],["jp-appearance-atlas","12","jp"],
 ["jp-weather-atlas","13","jp"],["jp-weather-basics","13","jp"],["jp-weather-forecast","13","jp"],["jp-weather-safety","13","jp"],["jp-appearance-height","12","jp"],["jp-appearance-fashion","12","jp"],["jp-advanced-vocab-overview","15","jp"],
 ["legacy-vocab-jp-29","13","jp"],["legacy-vocab-jp-10","11","jp"],
 ["legacy-vocab-en-30","E3","en"],["legacy-vocab-dual-30","D3","dual"]
 ]){
 const item=P.byMode[mode].find(x=>x.id===id);
 assert(item,"Missing original lesson "+mode+":"+id);
 assert.equal(item.chapter,chapter,"Wrong chapter for "+id);
}
for(const mode of ["jp","en","dual"]){
 const all=P.byMode[mode],uniq=new Set();
 for(const row of all){
  assert(!uniq.has(row.id),"Duplicate visible lesson "+mode+":"+row.id);uniq.add(row.id);
  assert(P.unitById.get(mode+":"+row.chapter).items.includes(row),"All registered lessons have chapters "+row.id);
 }
}
assert.deepEqual([accesses,writes],[before.reads,before.writes],"Public catalog must not touch old local storage");
assert(P.init(),"Public navigation should initialize over old engine");
assert.equal(P.getView(),"home");
assert.equal(walk(ids["public-library"]).filter(x=>x.className==="pl-part").length,5,"Only five chapter groups on homepage");
const first=walk(ids["public-library"]).find(x=>x.className==="pl-part");
first.events.click[0]();
assert.equal(P.getView(),"part","Part opens chapter list");
const ch=walk(ids["public-library"]).find(x=>x.className==="pl-chapter");
ch.events.click[0]();
assert.equal(P.getView(),"chapter","Chapter opens section list");
const lesson=walk(ids["public-library"]).find(x=>x.className==="pl-lesson");
assert(lesson?.events.click?.length,"Available section opens");
lesson.events.click[0]();
assert.equal(P.getView(),"lesson","Read open lesson");
assert.equal(app.state.sectionId,"jp-hira");
assert.equal(writes,before.writes,"Navigation must never persist personal progress");
assert(read("v3/public-library.css").includes("body.pl-active .quest-progress"),"Hide old individual progress");
assert(read("v3/public-library.css").includes("@media(max-width:640px)"),"Mobile layout styles");
assert(html.includes('id="public-library"'),"New public site root");
assert(html.indexOf("app.js?v=")<html.indexOf("public-library.js?v="),"Old engine loads before book index");
console.log("PASS: 5 public parts, 21 Japanese chapters, English/dual 30 original chapters, legacy ID preservation, direct routes, no personal storage, mobile public layout");
