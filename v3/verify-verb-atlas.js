"use strict";
/* 4.4 verb atlas: all 276 real headwords, per-verb attribution, responsive page limits
 * and an in-DOM test of search, navigation, modal opening and individual readings.
 */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const paths=[
 "v3/course-map.js","v3/data/lexical.js","v3/inflections.js",
 "v3/vocab-batch-n5.js","v3/vocab-batch-n4.js","v3/vocab-batch-n3.js",
 "v3/vocab-expansion-n5.js","v3/vocab-expansion-n4.js","v3/vocab-expansion-n3.js",
 "v3/vocab-curated.js","v3/verb-atlas.js"
];
for(const path of paths)new vm.Script(read(path),{filename:path});
function node(tag){
 return {tagName:tag,className:"",textContent:"",value:"",type:"",disabled:false,hidden:false,
  children:[],events:{},attrs:{},open:false,style:{},dataset:{},
  append(...items){for(const child of items){if(child&&typeof child==="object")child.parentNode=this;this.children.push(child)}
    this.firstChild=this.children[0]||null},
  replaceChildren(...items){this.children=[];this.append(...items)},
  setAttribute(k,v){this.attrs[k]=String(v);if(k==="open")this.open=true},
  removeAttribute(k){delete this.attrs[k];if(k==="open")this.open=false},
  getAttribute(k){return this.attrs[k]||null},
  addEventListener(name,handler){(this.events[name]||(this.events[name]=[])).push(handler)},
  showModal(){this.open=true;this.attrs.open=""},
  close(){this.open=false;delete this.attrs.open;for(const fn of this.events.close||[])fn()}
 };
}
const flatten=root=>[root,...(root.children||[]).flatMap(flatten)];
const store={reads:[],writes:[],getItem(k){this.reads.push(k);return null},setItem(k,v){this.writes.push(k)}};
const doc={createElement:node,createTextNode:s=>({textContent:s})};
let mobile=true;
const ctx={document:doc,window:{
 localStorage:store,
 matchMedia:()=>({matches:mobile}),
 ENJP_Audio:{
  makeRuby(s){const n=node("span");n.textContent=String(s);return n},
  spokenJapanese(s){return !/[一-龯々]/.test(String(s).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2"))?String(s):null},
  play(){},stop(){}
 }
}};
for(const path of paths)vm.runInNewContext(read(path),ctx);
const a=ctx.window.ENJP_VerbAtlas,C=ctx.window.ENJP_COURSES;
assert(a,"atlas installed");assert.equal(a.list.length,276);
assert.equal(a.sourceCount.old,240);assert.equal(a.sourceCount.new,36);
assert.deepEqual(a.problems,[],"no verb-source mismatch or invalid conjugation");
assert.equal(new Set(a.list.map(w=>w.word)).size,276,"all 276 headwords unique");
for(const [level,count] of [["N5",68],["N4",91],["N3",117]]){
 assert.equal(a.filterRows({level}).length,count,"grade "+level);
 assert(C.jp[level].some(ch=>ch.sections.some(s=>s.id===a.id)),"atlas directly in grade "+level);
}
for(const type of ["godan","ichidan","third"])assert(a.filterRows({type}).length>20,"verb class "+type);
assert(a.filterRows({query:"よむ"}).some(x=>x.word==="読む"),"kana search");
assert(a.filterRows({query:"よむ",level:"N3"}).length===0,"grade filter combines with search");
assert(a.filterRows({query:"読む"}).some(x=>x.word==="読む"),"kanji search");
assert(a.filterRows({query:"閱讀"}).some(x=>x.word==="読む"),"Chinese search");
assert(a.filterRows({kana:"あ"}).every(v=>a.kanaGroup(v.reading)==="あ"),"gojuon initial filter");
for(const entry of a.list){
 const forms=ctx.window.ENJP_Inflections.verbForms(entry);
 assert(forms&&forms.length===11,"11 conjugations belong to "+entry.word);
 assert(ctx.window.ENJP_Audio.spokenJapanese(ctx.window.ENJP_Inflections.annotation(entry.word,entry.reading)),
   "word-head reading annotation "+entry.word);
 const ex=a.ownExamples(entry);
 if(entry.source==="legacy"){
  assert.equal(ex.length,2,entry.word+" has exactly two original collocations");
  for(const x of ex)assert(!x.full&&x.ja.includes(entry.word),"no other verb collocations attached to "+entry.word);
 }else{
  assert.equal(ex.length,1,entry.word+" has one own full sentence");
  assert(ex[0].full&&ex[0].zh&&ctx.window.ENJP_Audio.spokenJapanese(ex[0].ja),
    entry.word+" curated reading complete");
 }
}
const root=node("main");assert(a.render(root,a.id),"atlas screen rendered");
const all=flatten(root),cards=all.filter(x=>x.className==="va-item");
assert.equal(cards.length,16,"mobile view shows only 16 small buttons, not endless cards");
const search=all.find(x=>x.tagName==="input"&&x.type==="search");
assert(search&&search.events.input?.length,"live search input");
search.value="読む";search.events.input[0]();
assert.equal(flatten(root).filter(x=>x.className==="va-item").length,1,"filtered to single result");
search.value="";search.events.input[0]();
const selects=flatten(root).filter(x=>x.tagName==="select");
assert.equal(selects.length,2);
selects[0].value="N3";selects[0].events.change[0]();
assert.equal(flatten(root).filter(x=>x.className==="va-item").length,16,"filter grade and mobile page 16");
const pageNext=flatten(root).find(x=>x.className==="va-page"&&x.textContent==="下一頁 →");
assert(!pageNext.disabled,"N3 second page available");pageNext.events.click[0]();
const position=flatten(root).find(x=>x.className==="va-page-num");
assert.equal(position.textContent,"2 / 8","no infinite list; numbered pagination");
selects[0].value="all";selects[0].events.change[0]();
mobile=false;selects[0].events.change[0]();
assert.equal(flatten(root).filter(x=>x.className==="va-item").length,32,"desktop page shows only 32 compact items");
const action=flatten(root).find(x=>x.className==="va-item");
assert(action?.events.click?.length,"item opens details");
action.events.click[0]();
const dialog=flatten(root).find(x=>x.tagName==="dialog");
assert(dialog.open,"detail dialog opens without moving list down");
assert.equal(flatten(dialog).filter(x=>x.className==="va-form").length,11,"clicked word shows 11 forms");
assert(flatten(dialog).some(x=>String(x.className).includes("va-example")),"own example or collocation visible");
const close=flatten(dialog).find(x=>x.className==="va-close");close.events.click[0]();
assert(!dialog.open,"detail closes");
assert.deepEqual(store.writes,[],"atlas never writes or resets any history");
const html=read("v3/index.html"),app=read("v3/app.js"),legacy=read("v3/legacy-reader.js");
assert(html.includes("verb-atlas.js")&&html.includes("verb-atlas.css"),"atlas assets loaded");
assert(html.indexOf("verb-atlas.js")<html.indexOf("app.js"),"atlas before app nav");
assert(html.includes('href="#jp-verb-overview"'),"one-click topbar index access");
assert(app.includes("ENJP_VerbAtlas?.render(root,section.id)"),"app renders atlas in reader");
assert(app.includes("window.ENJP_VerbAtlas?.has(lessonId)"),"direct url grade routing");
assert(!legacy.includes("vf-example-list")&&!legacy.includes("verbExamples[row.key]"),
 "legacy verb card cannot display other verbs' example sentences");
assert(legacy.includes("item.collocations||[]"),"legacy own collocations preserved");
assert(read("v3/verb-atlas.css").includes("@media(max-width:700px)"),"responsive compact layout");
console.log(JSON.stringify({status:"PASS",verbs:a.list.length,legacy:240,curated:36,originalPhrases:480,fullNewExamples:36,
  mobilePage:16,desktopPage:32,noMismatchedExamples:true,historyUntouched:true}));
