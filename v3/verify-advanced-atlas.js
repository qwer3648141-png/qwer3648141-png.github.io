"use strict";
/* ENJP Ocean advanced lexicon 4.6: all 52 word-attributed N3/N2/N1 entries,
   two complete bilingual sentences, reading safety, classification and mobile UI.
 */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const scripts=["v3/course-map.js","v3/data/catalog.js","v3/data/lexical.js",
 "v3/data/vocab-1-6.js","v3/data/vocab-7-12.js","v3/data/vocab-13-18.js",
 "v3/data/vocab-19-24.js","v3/data/vocab-25-30.js","v3/inflections.js",
 "v3/vocab-batch-n5.js","v3/vocab-batch-n4.js","v3/vocab-batch-n3.js",
 "v3/vocab-expansion-n5.js","v3/vocab-expansion-n4.js","v3/vocab-expansion-n3.js",
 "v3/advanced-words-a.js","v3/advanced-words-b.js","v3/vocab-curated.js",
 "v3/advanced-atlas.js","v3/lexical-atlas.js"];
for(const file of scripts)new vm.Script(read(file),{filename:file});
function node(tag){
 const e={tagName:tag,className:"",children:[],events:{},dataset:{},attrs:{},
  textContent:"",value:"",type:"",open:false,disabled:false,hidden:false,style:{}};
 e.append=(...children)=>{for(const child of children){if(child&&typeof child==="object")child.parentNode=e;e.children.push(child)}e.firstChild=e.children[0]||null};
 e.replaceChildren=(...children)=>{e.children=[];e.append(...children)};
 e.addEventListener=(name,fn)=>{(e.events[name]||(e.events[name]=[])).push(fn)};
 e.setAttribute=(name,value)=>{e.attrs[name]=String(value);if(name==="open")e.open=true};
 e.getAttribute=name=>e.attrs[name]||null;
 e.removeAttribute=name=>{delete e.attrs[name];if(name==="open")e.open=false};
 e.showModal=()=>{e.open=true;e.attrs.open=""};
 e.close=()=>{e.open=false;delete e.attrs.open;for(const f of e.events.close||[])f()};
 return e;
}
const walk=e=>[e,...(e.children||[]).flatMap(walk)];
let mobile=true;const storage={writes:[],getItem(){return null},setItem(k){this.writes.push(k)}};
const Audio={
 makeRuby(x){const n=node("span");n.textContent=String(x);return n},
 spokenJapanese(x){
  const kana=String(x||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
  return /[一-龯々]/.test(kana)?null:kana;
 },play(){},stop(){}
};
const document={readyState:"loading",createElement:node,createTextNode:s=>({textContent:s}),
 addEventListener(){},querySelectorAll(){return []},getElementById:()=>node("div")};
const ctx={window:{ENJP_Audio:Audio,localStorage:storage,matchMedia:()=>({matches:mobile}),
 location:{hash:""}},document};
for(const file of scripts)vm.runInNewContext(read(file),ctx);
const A=ctx.window.ENJP_AdvancedAtlas,L=ctx.window.ENJP_LexicalAtlas,F=ctx.window.ENJP_Inflections;
assert(A&&L,"both advanced and all-word indices registered");
assert.equal(A.words.length,52);
assert.equal(A.themes.length,6);
assert.deepEqual(Array.from(A.issues),[],"dataset passes internal validation");
const levels={N3:8,N2:34,N1:10};
for(const [level,count]of Object.entries(levels))assert.equal(A.filterRows({level}).length,count,level+" count");
for(const theme of A.themes){
 assert.equal(A.filterRows({theme:theme.id}).length,theme.items.length,"theme count "+theme.id);
 assert(theme.title&&theme.description,"theme presentation");
}
assert.equal(A.filterRows({kind:"i"}).length,9);
assert.equal(A.filterRows({kind:"na"}).length,22);
assert.equal(A.filterRows({kind:"verb"}).length,3);
assert.equal(A.filterRows({kind:"noun"}).length,13);
assert.equal(A.filterRows({kind:"adverb"}).length,3);
assert.equal(A.filterRows({kind:"phrase"}).length,2);
assert.equal(A.filterRows({query:"せっかち"}).length,1);
assert.equal(A.filterRows({query:"性急"}).length,1,"Chinese lookup works");
assert.equal(A.filterRows({query:"せっかち",level:"N1"}).length,0,"combined grade filter");
assert(A.filterRows({tone:"negative"}).length>=10,"tone classification");
const old=new Set([...ctx.window.ENJP_LEGACY.lexical.map(w=>w.word),
 ...ctx.window.ENJP_CuratedVocab.words.map(w=>w.term),
 ...Object.values(ctx.window.ENJP_LEGACY.vocab).flat().map(w=>w.jp)]);
const unique=new Set(),allExample=new Set();let sentences=0,formCount=0;
for(const x of A.words){
 assert(!unique.has(x.word),"unique advanced "+x.word);
 assert(!old.has(x.word),"no duplicate legacy or curated "+x.word);
 unique.add(x.word);
 assert(x.reading&&x.zh&&x.nuance&&x.tone,"complete metadata "+x.word);
 assert(Audio.spokenJapanese(F.annotation(x.word,x.reading)),"headword ruby safe "+x.word);
 assert.equal(x.examples.length,2,"two own sentences "+x.word);
 for(const ex of x.examples){
   assert(ex.zh.length>5,"nontrivial Chinese gloss "+x.word);
   assert(Audio.spokenJapanese(ex.ja),"every example kanji has reading "+x.word+" "+ex.ja);
   assert(!allExample.has(ex.ja),"no copy/paste duplicate sentence "+ex.ja);
   allExample.add(ex.ja);sentences++;
 }
 const forms=A.formRows(x);
 if(["i","na"].includes(x.kind))assert.equal(forms.length,x.kind==="i"?5:6,x.word+" adjective forms");
 else if(x.kind.startsWith("verb:"))assert.equal(forms.length,11,x.word+" verb forms");
 else assert.equal(forms.length,0,"do not invent inflections for noun/idiom "+x.word);
 formCount+=forms.length;
}
assert.equal(sentences,104);
assert.equal(L.adjectiveRows.length,227,"previous 196 + 31 advanced adjectives");
assert.equal(L.vocabularyRows.length,1119,"old 1067 + 52 new unique entries");
assert.equal(L.counts.advancedVocabulary,52);
for(const x of A.words){
 const entry=L.vocabularyRows.find(w=>w.word===x.word&&w.reading===x.reading);
 assert(entry,"word appears in common atlas "+x.word);
 assert.equal(entry.level,x.level,"grade and source carried into common atlas");
 assert.equal(L.vocabExamples(entry).filter(e=>e.source==="advanced").length,2,"both own examples preserved across directories");
}
const id=A.id;
assert(ctx.window.ENJP_COURSES.jp.N3.some(t=>t.sections.some(s=>s.id===id)),"N3 Japanese course link");
assert(ctx.window.ENJP_CuratedVocab.chapters.N3.some(t=>t.sections.some(s=>s.id===id)),"N3 vocab course link");
function get(root,cls){return walk(root).filter(n=>n.className===cls)}
const root=node("article");
assert(A.render(root,id),"advanced atlas renders");
assert.equal(get(root,"av-tile").length,16,"mobile list is short");
const query=walk(root).find(n=>n.tagName==="input"&&n.type==="search");
assert(query&&query.events.input?.length,"live query available");
query.value="怒りっぽい";query.events.input[0]();
assert.equal(get(root,"av-tile").length,1,"search isolates a single headword");
let tile=get(root,"av-tile")[0];tile.events.click[0]();
const dialog=walk(root).find(n=>n.tagName==="dialog");
assert(dialog&&dialog.open,"popup detail opens");
assert.equal(get(dialog,"av-example").length,2,"both Japanese/Chinese examples shown");
assert(get(dialog,"av-speak").length>=3,"two sentence audio and headword");
assert(get(dialog,"av-nuance").length===1,"distinct nuance panel");
assert(get(dialog,"av-forms").length===1,"conjugation panel for adjective");
const related=get(dialog,"av-related-button");
assert(related.length>=1&&related[0].events.click?.length,"related comparison opens in same dialog");
related[0].events.click[0]();
assert.equal(get(dialog,"av-example").length,2,"related word opens its own examples");
const close=get(dialog,"av-close")[0];close.events.click[0]();
assert(!dialog.open,"popup can close");
query.value="";query.events.input[0]();
const themeSelect=walk(root).find(n=>n.tagName==="select"&&n.attrs["aria-label"]==="學習主題");
assert(themeSelect,"theme selector available");
themeSelect.value="emotions";themeSelect.events.change[0]();
assert.equal(get(root,"av-tile").length,8,"eight emotion vocabulary items");
themeSelect.value="all";themeSelect.events.change[0]();
mobile=false;query.events.input[0]();
assert.equal(get(root,"av-tile").length,32,"desktop shows max 32 words");
assert.deepEqual(storage.writes,[],"no existing learning records overwritten");
const html=read("v3/index.html"),app=read("v3/app.js");
for(const name of ["advanced-words-a.js","advanced-words-b.js","advanced-atlas.js","advanced-atlas.css"])
 assert(html.includes(name),"all advanced assets loaded");
assert(html.indexOf("advanced-words-b.js")<html.indexOf("advanced-atlas.js"),"advanced data loaded before renderer");
assert(html.indexOf("advanced-atlas.js")<html.indexOf("lexical-atlas.js"),"specialized and aggregate atlases order");
assert(html.indexOf("advanced-atlas.js")<html.indexOf("app.js"),"atlas before main app");
assert(app.includes("ENJP_AdvancedAtlas?.render(root,section.id)"),"reader includes advanced page");
assert(app.includes("const advanced=Boolean(window.ENJP_AdvancedAtlas?.has(lessonId))"),"hash deep-link route");
assert(html.includes('href="#jp-advanced-vocab-overview"'),"topbar direct access");
console.log(JSON.stringify({status:"PASS",themes:A.themes.length,words:A.words.length,examples:sentences,
 levelCounts:levels,conjugationForms:formCount,allAdjectives:L.adjectiveRows.length,
 uniqueAllWords:L.vocabularyRows.length,isolatedHistory:true,mobilePage:16,desktopPage:32}));
