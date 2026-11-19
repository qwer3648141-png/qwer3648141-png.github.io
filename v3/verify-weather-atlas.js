"use strict";
/* ENJP Ocean: weather-atlas coverage, word fidelity, ruby, navigation and isolated quiz records. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const paths=["v3/weather-words-a.js","v3/weather-words-b.js","v3/weather-words-c.js","v3/weather-words-d.js","v3/weather-atlas.js","v3/app.js","v3/global-search.js"];
for(const path of paths)new vm.Script(read(path),{filename:path});
function node(tag){
 const x={tagName:tag,className:"",textContent:"",children:[],events:{},dataset:{},attrs:{},style:{},hidden:false,
   value:"",disabled:false,classList:{add(){},remove(){},contains(){return false}}};
 x.append=(...children)=>{for(const child of children){if(child&&typeof child==="object")child.parentNode=x;x.children.push(child)}x.firstChild=x.children[0]||null;x.lastChild=x.children.at(-1)||null};
 x.replaceChildren=(...children)=>{x.children=[];x.append(...children)};
 x.setAttribute=(k,v)=>{x.attrs[k]=String(v)};
 x.addEventListener=(k,fn)=>{(x.events[k]||(x.events[k]=[])).push(fn)};
 x.scrollIntoView=()=>{};
 return x;
}
const walk=x=>[x,...(x.children||[]).flatMap(walk)];
const storage={records:{},writes:[],getItem(k){return this.records[k]??null},setItem(k,v){this.writes.push(k);this.records[k]=v}};
const audio={makeRuby:s=>{const e=node("span");e.textContent=String(s);return e},
 spokenJapanese:s=>{const clean=String(s).replace(/([一-龯々]+)（([ぁ-ゖァ-ヺー]+)）/g,"$2");return /[一-龯々]/.test(clean)?null:clean},
 play(){},stop(){}};
const C={jp:{N3:[]}},V={chapters:{N3:[]}};
const mock={window:{ENJP_Audio:audio,ENJP_COURSES:C,ENJP_CuratedVocab:V,localStorage:storage},
 document:{createElement:node,createTextNode:text=>({textContent:text,children:[]})},console};
vm.createContext(mock);
for(const path of paths.slice(0,5))vm.runInContext(read(path),mock);
const atlas=mock.window.ENJP_WeatherAtlas;
assert(atlas&&atlas.issues.length===0,"Unmarked kanji, duplicate entries, or invalid tone: "+atlas?.issues);
assert.equal(atlas.themes.length,8,"Eight thematic units");
assert.equal(atlas.words.length,115,"At least 100 distinct vocabulary entries");
assert.equal(new Set(atlas.words.map(w=>w.word)).size,115,"Unique display headwords");
assert.equal(new Set(atlas.words.map(w=>w.id)).size,115,"Stable IDs");
const examples=new Set();
for(const w of atlas.words){
 assert(w.word&&w.reading&&w.zh&&w.en&&w.nuance,w.word+" has full bilingual/nuance fields");
 assert(["basic","conversation","forecast","safety"].includes(w.tone),"Tone classification "+w.word);
 assert(["N5","N4","N3","N2"].includes(w.level),"Grade classification "+w.word);
 assert.equal(w.examples.length,2,w.word+" must have two exclusive examples");
 assert(audio.spokenJapanese(w.head),w.word+" reading annotation");
 for(const e of w.examples){
   assert(e.zh&&e.zh.length>3,w.word+" has Chinese translation");
   assert(audio.spokenJapanese(e.ja),"Missing ruby in "+w.word+": "+e.ja);
   assert(!examples.has(e.ja),"Copied example used for two words: "+e.ja);
   examples.add(e.ja);
 }
}
assert.equal(examples.size,230,"230 distinct Japanese examples");
for(const q of ["天気","晴れ","土砂降り","酷暑日","風速","降水確率","颱風","rain"])
 assert(atlas.matching(q).length>0,"Search query failed: "+q);
assert.equal(atlas.matching("天気").length,1,"Exact headword priority");
assert(C.jp.N3.some(x=>x.sections.some(s=>s.id===atlas.id)),"Japanese course navigation");
assert(V.chapters.N3.some(x=>x.sections.some(s=>s.id===atlas.id)),"Curated vocabulary navigation");
assert.equal(atlas.progressKey,"enjpWeatherWrongV1","Separate progress key");
assert.equal(storage.writes.length,0,"Loading atlas does not mutate existing records");
const host=node("div");
assert.equal(atlas.render(host,atlas.id),true,"Atlas renders");
const visible=walk(host),cards=visible.filter(x=>x.className==="wt-card"),buttons=visible.filter(x=>x.className==="wt-open");
assert.equal(cards.length,12,"Page size caps at 12 for mobile readability");
assert.equal(buttons.length,12,"All visible cards can be opened");
buttons[0].events.click[0]();
assert.equal(walk(host).filter(x=>x.className==="wt-example").length,2,"Each detail page shows two bilingual examples");
const practice=walk(host).find(x=>x.textContent==="🎯 從目前篩選單字抽考");
assert(practice?.events.click?.length,"Quiz launch wired");
practice.events.click[0]();
const options=walk(host).filter(x=>x.className==="wt-option");
assert.equal(options.length,4,"Four distinct choices");
assert.equal(new Set(options.map(x=>x.dataset.id)).size,4);
options[0].events.click[0]();
assert(storage.writes.every(k=>k==="enjpWeatherWrongV1"),"Other saved history keys never modified");
const html=read("v3/index.html"),app=read("v3/app.js");
for(const file of ["weather-words-a.js","weather-words-b.js","weather-words-c.js","weather-words-d.js","weather-atlas.js","weather-atlas.css"])
 assert(html.includes(file),"Asset not linked: "+file);
assert(html.indexOf("weather-words-a.js")<html.indexOf("weather-atlas.js"));
assert(html.indexOf("weather-words-b.js")<html.indexOf("weather-atlas.js"));
assert(html.indexOf("weather-atlas.js")<html.indexOf("global-search.js"));
assert(app.includes("ENJP_WeatherAtlas?.render(root,section.id)"),"Reader integration missing");
assert(app.includes('state.vocabLevel="N3";'),"Weather deep-link route");
assert(read("v3/global-search.js").includes('mode:"weather"'),"Global vocabulary search integration missing");
assert(read("v3/weather-atlas.css").includes("@media(max-width:580px)"),"Mobile styling missing");
console.log("PASS: 8 themes, 115 Japanese words, 230 individual bilingual sentences, tone, audio/ruby, filters, 4-way quiz, mobile layout, isolated storage, deep links, global search.");
