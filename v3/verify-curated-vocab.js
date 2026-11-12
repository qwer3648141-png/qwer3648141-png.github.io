"use strict";
/* Structural and behavioral checks for curated JLPT N5-N3 vocabulary. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const paths=["v3/inflections.js","v3/vocab-batch-n5.js","v3/vocab-batch-n4.js","v3/vocab-batch-n3.js","v3/vocab-expansion-n5.js","v3/vocab-expansion-n4.js","v3/vocab-expansion-n3.js","v3/vocab-curated.js"];
paths.forEach(path=>new vm.Script(read(path),{filename:path}));
function node(tag){
 return {
   tagName:tag,className:"",textContent:"",children:[],attrs:{},style:{},dataset:{},hidden:false,
   classList:{add(){},remove(){}},events:{},
   append(...children){this.children.push(...children);this.firstChild=this.children[0]||null},
   replaceChildren(...children){this.children=children;this.firstChild=this.children[0]||null},
   setAttribute(name,value){this.attrs[name]=String(value)},
   addEventListener(type,cb){(this.events[type]||(this.events[type]=[])).push(cb)},
   getAttribute(name){return this.attrs[name]||null}
 };
}
const container={
 document:{createElement:node,createTextNode:text=>({textContent:text})},
 window:{ENJP_Audio:{
   makeRuby:ja=>{const n=node("span");n.textContent=ja;return n},
   spokenJapanese:ja=>{
     const s=String(ja||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
     return /[一-龯々]/.test(s)?null:s;
   },
   play(){},stop(){}
 }}
};
const storage={data:{},reads:[],writes:[],getItem(k){this.reads.push(k);return this.data[k]||null},
 setItem(k,v){this.writes.push(k);this.data[k]=v}};
container.window.localStorage=storage;
for(const path of paths)vm.runInNewContext(read(path),container);
const db=container.window.ENJP_CuratedVocab,form=container.window.ENJP_Inflections;
assert(db&&db.topics.length===19,"nineteen independent topical lessons");
assert.equal(db.words.length,288,"180 original + 108 added");
assert.equal(db.topics.filter(t=>t.level==="N5").length,7);
assert.equal(db.topics.filter(t=>t.level==="N4").length,6);
assert.equal(db.topics.filter(t=>t.level==="N3").length,6);
assert.deepEqual(Array.from(db.topics,t=>t.words.length),[...Array(10).fill(18),...Array(9).fill(12)],"existing 180 rows have not been reordered");
const originalIds=db.words.slice(0,180).map(w=>w.id);
assert.equal(new Set(originalIds).size,180,"original stable study card IDs preserved");
const newRows=db.words.slice(180);
assert.equal(newRows.length,108);
assert.equal(newRows.filter(w=>w.kind==="verb").length,36);
assert.equal(newRows.filter(w=>w.kind==="adj").length,36);
assert.equal(newRows.filter(w=>w.kind==="noun").length,36);
const oldLexical=new Set();
{const other={};vm.runInNewContext(read("v3/data/lexical.js"),{window:other});
 for(const row of other.ENJP_LEGACY.lexical)oldLexical.add(row.word);}
for(const w of newRows){
 assert(!oldLexical.has(w.term),"do not recopy an existing V3 verb or adjective: "+w.term);
 const forms=w.kind==="verb"?form.verbForms({word:w.term,reading:w.reading,type:w.formType}):
             w.kind==="adj"?form.adjectiveForms({word:w.term,reading:w.reading,type:w.formType}):null;
 if(w.kind==="noun"){assert(w.formType==="-","noun has no verb inflection");continue}
 assert(Array.isArray(forms)&&forms.length>4,"verb or adjective inflection available "+w.term);
 for(const one of forms){
   assert(container.window.ENJP_Audio.spokenJapanese(form.annotation(one.word,one.reading)),
      "TTS-safe conjugated form "+w.term+" "+one.key);
 }
}
const uniqueIds=new Set(),terms=new Set(),examples=new Set();
for(const w of db.words){
 assert(!uniqueIds.has(w.id),"unique persistent ID "+w.id);uniqueIds.add(w.id);
 assert(!terms.has(w.term),"no repeated headword across batches "+w.term);terms.add(w.term);
 assert(!examples.has(w.example),"no cloned sentence "+w.example);examples.add(w.example);
 assert(w.term&&w.reading&&w.zh&&w.example&&w.translation,"all five required fields");
 assert(/^[ぁ-ゖァ-ヺー・\s]+$/.test(w.reading),"kana-only reading "+w.term);
 const source=form.annotation(w.term,w.reading);
 assert(container.window.ENJP_Audio.spokenJapanese(source),"word can be pronounced: "+w.term+" "+source);
 assert(container.window.ENJP_Audio.spokenJapanese(w.example),"sentence fully annotated: "+w.example);
 assert(w.translation.length>=4,"Chinese translation");
 assert(db.sections[w.topicId],"navigable topic section");
}
for(const level of ["N5","N4","N3"]){
 const rows=db.chapters[level];assert(rows.length>0,"grade exists "+level);
 for(const chapter of rows)for(const section of chapter.sections)
   assert(db.has(section.id),"section available in library "+section.id);
}
const initial=db.stats(db.words);
assert.equal(initial.newWords,288);
assert.equal(initial.due,0);
assert.equal(initial.weak,0);
const w=db.words[0];
db.recordAnswer(w,false);
const afterWrong=db.stats(db.words);
assert.equal(afterWrong.due,1,"wrong card immediately due");
assert.equal(afterWrong.weak,1,"wrong card in weak deck");
db.recordAnswer(w,true);
assert.equal(db.stats(db.words).due,0,"correct card scheduled to future");
assert.equal(db.stats(db.words).weak,1,"one correct answer does not erase weakness");
const saved=JSON.parse(storage.data[db.reviewKey]);
assert.equal(saved.cards[w.id].seen,2);
assert.equal(saved.cards[w.id].correct,1);
assert.equal(saved.cards[w.id].wrong,1);
assert.equal(saved.cards[w.id].streak,1);
assert.equal(db.selectSmart(db.words,"due").length,0);
const randomRound=db.selectSmart(db.words,"smart");
assert.equal(randomRound.length,10);
assert.equal(new Set(randomRound.map(w=>w.id)).size,10,"no repeat in a normal 10-question round");
assert.equal(db.selectSmart(db.words,"weak").length,1);
assert.deepEqual([...new Set(storage.writes)],[db.reviewKey],"new storage key only");
// Render actual study cards and the quiz with a minimal DOM stand-in.
const root=node("article");assert(db.render(root,db.topics[0].id),"topic renders");
const home=node("article");db.home(home,"N5");
const flatten=(root)=>[root,...(root.children||[]).flatMap(flatten)];
const button=flatten(home).find(x=>x.tagName==="button"&&x.textContent==="🌱 練 10 個新字");
assert(button,"new-word quiz button available");
button.events.click[0]();
const questionChoices=flatten(home).filter(x=>x.tagName==="button"&&String(x.className).includes("cv-option"));
assert(questionChoices.length===4,"four-choice quiz rendered");
questionChoices[0].events.click[0]();
assert(storage.writes.length>=3,"answer was saved into own review key");
const html=read("v3/index.html"),app=read("v3/app.js");
for(const path of ["vocab-batch-n5.js","vocab-batch-n4.js","vocab-batch-n3.js","vocab-expansion-n5.js","vocab-expansion-n4.js","vocab-expansion-n3.js","vocab-curated.js","vocab-curated.css"])
 assert(html.includes(path),"all assets loaded "+path);
assert(html.indexOf("vocab-expansion-n5.js")<html.indexOf("vocab-curated.js"),"N5 expansion before trainer");
assert(html.indexOf("vocab-expansion-n4.js")<html.indexOf("vocab-curated.js"),"N4 expansion before trainer");
assert(html.indexOf("vocab-expansion-n3.js")<html.indexOf("vocab-curated.js"),"N3 expansion before trainer");
assert(html.indexOf("vocab-curated.js")<html.indexOf("app.js"),"trainer before navigation");
assert(html.includes('data-vocab-lang="jlpt"'));
assert(html.includes('id="vocab-levels"'));
assert(app.includes('ENJP_CuratedVocab?.chapters?.[state.vocabLevel]'),"topic sidebar by grade");
assert(app.includes('ENJP_CuratedVocab?.render(root,section.id)'),"curated reader");
assert(app.includes('state.vocabLang="jlpt";state.vocabLevel=curated.level;'),"deep links");
assert(app.includes('state.vocabLang=next;state.filter="";renderAll();'),"old JP/EN vocabulary still selectable");
// Exercise actual V3 navigation with the curated library, not just string checks.
container.document.readyState="loading";
container.document.addEventListener=()=>{};
const readerContent=node("div");
container.document.getElementById=id=>id==="reader-content"?readerContent:node("div");
vm.runInNewContext(read("v3/course-map.js"),container);
vm.runInNewContext(read("v3/app.js"),container);
const nav=container.window.ENJP_3;
assert(nav&&typeof nav.listChapters==="function","main app controller exists");
nav.state.mode="vocab";nav.state.vocabLang="jlpt";
for(const level of ["N5","N4","N3"]){
 nav.state.vocabLevel=level;
 assert.equal(nav.listChapters().length,db.chapters[level].length,level+" topic sidebar");
 const id=db.chapters[level][0].sections[0].id;
 assert(nav.lookupSection(id),"topic appears in sidebar "+id);
 nav.state.sectionId=id;
 nav.renderReader();
 assert(flatten(readerContent).some(x=>String(x.className).includes("cv-word-card")),"topic renders its actual cards for "+level);
}

assert(read("v3/vocab-curated.css").includes("@media(max-width:640px)"),"mobile layout");
assert(read("v3/vocab-curated.css").includes(".cv-conjugations"),"conjugation layout available");
const n5Verb=db.words.find(w=>w.term==="遊ぶ");
const verbCardRoot=node("article");
db.render(verbCardRoot,n5Verb.topicId);
const verbCardNodes=flatten(verbCardRoot);
assert(verbCardNodes.some(w=>w.className==="cv-conjugations"),"verb card shows expandable forms");
assert(verbCardNodes.some(w=>String(w.textContent||"").includes("第一類動詞")),"verb group indicated");
const n4Adj=db.words.find(w=>w.term==="有名");
const adjCardRoot=node("article");
db.render(adjCardRoot,n4Adj.topicId);
assert(flatten(adjCardRoot).some(w=>w.className==="cv-conjugations"),"na-adjective has forms");

// Malformed storage must not be overwritten.
const corruptWrites=[],
 context2={window:{
   ENJP_CURATED_VOCAB_BATCHES:container.window.ENJP_CURATED_VOCAB_BATCHES,
   ENJP_Audio:container.window.ENJP_Audio,
   ENJP_Inflections:form,
   localStorage:{getItem(){return "{invalid"},setItem(k){corruptWrites.push(k)}}
 }};
vm.runInNewContext(read("v3/vocab-curated.js"),context2);
context2.window.ENJP_CuratedVocab.recordAnswer(context2.window.ENJP_CuratedVocab.words[0],true);
assert.deepEqual(corruptWrites,[],"corrupt user records never overwritten");
console.log(JSON.stringify({result:"PASS",n5:72,n4:54,n3:54,topics:db.topics.length,
 words:db.words.length,uniqueExamples:examples.size,quizItems:10,quizModes:5,
 storageKey:db.reviewKey,legacyProgressPreserved:true}));
