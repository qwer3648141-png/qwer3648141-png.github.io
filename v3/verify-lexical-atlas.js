"use strict";
/* ENJP Ocean 4.5 — index accuracy, deduplication, safe example attribution,
   filters, mobile pagination, dialogs, TTS and original progress isolation. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const files=[
 "v3/course-map.js","v3/data/catalog.js","v3/data/lexical.js",
 "v3/data/vocab-1-6.js","v3/data/vocab-7-12.js","v3/data/vocab-13-18.js",
 "v3/data/vocab-19-24.js","v3/data/vocab-25-30.js","v3/inflections.js",
 "v3/vocab-batch-n5.js","v3/vocab-batch-n4.js","v3/vocab-batch-n3.js",
 "v3/vocab-expansion-n5.js","v3/vocab-expansion-n4.js","v3/vocab-expansion-n3.js",
 "v3/advanced-words-a.js","v3/advanced-words-b.js","v3/advanced-verbs-c.js","v3/advanced-verbs-d.js",
 "v3/advanced-lexicon-e.js","v3/advanced-lexicon-f.js","v3/advanced-cleanliness-words.js",
 "v3/vocab-curated.js","v3/advanced-atlas.js","v3/lexical-atlas.js","v3/global-search.js","v3/app.js"
];
for(const f of files)new vm.Script(read(f),{filename:f});
function node(tag){
 const el={tagName:tag,className:"",textContent:"",value:"",type:"",style:{},
    children:[],events:{},attrs:{},dataset:{},open:false,disabled:false,hidden:false};
 el.append=(...children)=>{for(const child of children){if(child&&typeof child==="object")child.parentNode=el;el.children.push(child)}el.firstChild=el.children[0]||null};
 el.replaceChildren=(...children)=>{el.children=[];el.append(...children)};
 el.setAttribute=(key,value)=>{el.attrs[key]=String(value);if(key==="open")el.open=true};
 el.getAttribute=key=>el.attrs[key]||null;
 el.removeAttribute=key=>{delete el.attrs[key];if(key==="open")el.open=false};
 el.addEventListener=(name,callback)=>{(el.events[name]||(el.events[name]=[])).push(callback)};
 el.showModal=()=>{el.open=true;el.attrs.open=""};
 el.close=()=>{el.open=false;delete el.attrs.open;for(const cb of el.events.close||[])cb()};
 return el;
}
const walk=el=>[el,...(el.children||[]).flatMap(walk)];
const saved={reads:[],writes:[],getItem(k){this.reads.push(k);return null},setItem(k,v){this.writes.push(k)}};
const doc={readyState:"loading",createElement:node,createTextNode:s=>({textContent:s}),
 addEventListener(){},querySelectorAll(){return []},getElementById(){return node("div")}};
let narrow=true;
const W={localStorage:saved,matchMedia:()=>({matches:narrow}),location:{hash:""},ENJP_Audio:{
 makeRuby(text){const t=node("span");t.textContent=String(text);return t},
 spokenJapanese(source){
  const kana=String(source||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
  return /[一-龯々]/.test(kana)?null:kana;
 },play(){},stop(){}
}};
const context={window:W,document:doc};
for(const file of files.slice(0,-1))vm.runInNewContext(read(file),context);
const A=W.ENJP_LexicalAtlas,V=W.ENJP_CuratedVocab;
assert(A,"module registered");
assert.equal(A.counts.legacyAdjectives,160,"all original adjectives retained");
assert.equal(A.counts.curatedAdjectives,36,"36 curated adjectives");
assert.equal(A.adjectiveRows.length,227,"196 existing + 31 advanced adjective headwords");
assert.equal(A.counts.legacyVocabulary,920,"all legacy vocabulary present");
assert.equal(A.counts.curatedVocabulary,V.words.length,"all curated words represented");
assert.equal(A.vocabularyRows.length,1170,"1067 existing + 103 nonduplicate advanced headwords");
assert.equal(A.counts.advancedVocabulary,103,"advanced word source counted");
assert.equal(A.vocabularyRows.reduce((n,x)=>n+x.records.length,0),
 A.counts.legacyVocabulary+A.counts.curatedVocabulary+A.counts.advancedVocabulary,"all 1311 source rows available after merging repeated words");
assert.deepEqual(Array.from(A.adjProblems),[],"all adjective forms valid");
assert.deepEqual(Array.from(A.wordProblems),[],"no malformed source rows");
const adjectiveTerms=new Set();
for(const x of A.adjectiveRows){
 const id=x.word+"|"+x.reading;
 assert(!adjectiveTerms.has(id),"adjectives unique by Japanese and reading "+id);
 adjectiveTerms.add(id);
 assert(["i","na"].includes(x.type),"adj grammar subtype");
 assert(["N5","N4","N3","N2","N1"].includes(x.level),"published adjective learning level");
 assert.equal(W.ENJP_Inflections.adjectiveForms(x.original||{word:x.word,reading:x.reading,type:x.type})?.length,
  x.type==="i"?5:6,"five or six conjugations "+x.word);
 const rows=A.adjExamples(x);
 assert.equal(rows.length,x.source==="curated"?1:2,"two original collocations or one new full example");
}
const vocabKeys=new Set();
let originalOnly=0,graded=0,advanced=0,hiddenOriginal=0;
for(const x of A.vocabularyRows){
 assert(!vocabKeys.has(x.key),"vocab unique "+x.key);vocabKeys.add(x.key);
 assert(x.word&&x.meaning&&x.records.length>0,"all entries have useful text");
 const curated=x.records.some(r=>r.source==="curated"),legacy=x.records.some(r=>r.source==="legacy");
 const advancedEntry=x.records.some(r=>r.source==="advanced");
 if(curated){graded++;assert(["N5","N4","N3"].includes(x.level),"base lexeme has its teaching grade")}
 else if(advancedEntry){advanced++;assert(["N3","N2","N1"].includes(x.level),"advanced learning grade")}
 else{originalOnly++;assert.equal(x.level,"ungraded","old 30-chapter items never assigned guessed JLPT")}
 const ex=A.vocabExamples(x);
 if(!ex.length)hiddenOriginal++;
 if(curated)assert(ex.some(t=>t.source==="curated"),"own curated example persists");
 if(advancedEntry)assert.equal(ex.filter(t=>t.source==="advanced").length,2,"both original advanced example sentences appear");
 for(const e of ex){
   assert(e.ja&&e.zh,"example has Japanese and Traditional Chinese");
   if(e.source==="legacy"){
     const original=x.records.filter(t=>t.source==="legacy");
     const pieces=original.some(t=>t.word.split(/[・／/、，,]/).map(s=>s.trim()).some(p=>p.length>1&&t.example?.includes(p)));
     assert(pieces,"only original Japanese example containing its headword is shown");
   }
 }
}
assert(originalOnly>500&&graded>=288&&advanced===103,"all old/new/advanced source categories preserved");
assert(hiddenOriginal>0,"unmatched legacy phrases are held back instead of displayed with wrong words");
assert(W.ENJP_COURSES.jp.N5[0].sections[0].id===A.IDS.adjective,"adjective index first JP chapter");
assert(V.chapters.N5[0].sections[0].id===A.IDS.vocabulary,"all-word index first vocab chapter");
for(const level of ["N5","N4","N3"]){
 assert(W.ENJP_COURSES.jp[level].some(ch=>ch.sections.some(s=>s.id===A.IDS.adjective)),level+" adjective access");
 assert(V.chapters[level].some(ch=>ch.sections.some(s=>s.id===A.IDS.vocabulary)),level+" vocab access");
}
function findClass(root,cls){return walk(root).filter(x=>x.className===cls)}
function findControl(root,label){
 return walk(root).find(x=>x.tagName==="select"&&x.attrs["aria-label"]===label);
}
const adjectiveHost=node("div");
assert(A.render(adjectiveHost,A.IDS.adjective),"render adjective directory");
assert.equal(findClass(adjectiveHost,"la-tile").length,16,"mobile adjective atlas 16 compact items");
const adjType=findControl(adjectiveHost,"形容詞類別");
assert(adjType&&adjType.events.change?.length,"adjective い/な filtering present");
adjType.value="na";adjType.events.change[0]();
assert.equal(findClass(adjectiveHost,"la-tile").length,16,"na adjective list paginated");
const adjGr=findControl(adjectiveHost,"學習程度");adjGr.value="N5";adjGr.events.change[0]();
const adjResults=findClass(adjectiveHost,"la-tile");
assert(adjResults.length>0&&adjResults.length<=16,"combined grade and adjective type");
const adjTile=adjResults[0];adjTile.events.click[0]();
const adjDialog=walk(adjectiveHost).find(x=>x.tagName==="dialog");
assert(adjDialog.open,"adjective detail opens modal");
assert(findClass(adjDialog,"la-form").length>=5,"adjective form chart shown");
const close=walk(adjDialog).find(x=>x.className==="la-close");close.events.click[0]();
assert(!adjDialog.open,"adjective modal close works");
const vocabHost=node("div");
assert(A.render(vocabHost,A.IDS.vocabulary),"render word directory");
assert.equal(findClass(vocabHost,"la-tile").length,16,"vocabulary also compact on phone");
const source=findControl(vocabHost,"來源");
source.value="advanced";source.events.change[0]();
assert(findClass(vocabHost,"la-tile").length===16,"103 advanced terms available in combined index");
source.value="legacy";source.events.change[0]();
assert.equal(findClass(vocabHost,"la-tile").length,16,"original 30 chapter items searchable");
const degree=findControl(vocabHost,"學習程度");
degree.value="N5";degree.events.change[0]();
const gradedTiles=findClass(vocabHost,"la-tile");
assert(gradedTiles.length<=16,"source and JLPT filters combine");
degree.value="all";degree.events.change[0]();
source.value="all";source.events.change[0]();
const searches=walk(vocabHost).filter(x=>x.tagName==="input"&&x.type==="search");
assert.equal(searches.length,1,"search field available");
const search=searches[0];search.value="履歴書";search.events.input[0]();
assert(findClass(vocabHost,"la-tile").some(x=>walk(x).some(y=>String(y.textContent).includes("履歴書"))),
 "search original Japanese word across 30 chapters");
search.value="";search.events.input[0]();
const japaneseTiles=findClass(vocabHost,"la-tile");
assert.equal(japaneseTiles.length,16);
japaneseTiles[0].events.click[0]();
const dialog=walk(vocabHost).find(x=>x.tagName==="dialog");
assert(dialog.open,"vocabulary opens detail modal without full-page expansion");
assert(walk(dialog).some(x=>x.className==="la-reading"),"word reading shown");
const count=findClass(vocabHost,"la-page-count")[0];
assert(count&&count.textContent.startsWith("1 /"),"has numbered pages");
narrow=false;source.events.change[0]();
assert.equal(findClass(vocabHost,"la-tile").length,36,"desktop shows 36 compact words");
assert.deepEqual(saved.writes,[],"no changes to saved course or vocabulary progress");
const html=read("v3/index.html"),app=read("v3/app.js");
for(const name of ["lexical-atlas.js","lexical-atlas.css"])assert(html.includes(name),name+" loaded");
assert(html.indexOf("lexical-atlas.js")<html.indexOf("app.js"),"indices before navigation");
assert(html.includes('href="#jp-adjective-overview"')&&html.includes('href="#jp-vocabulary-overview"'),
 "topbar links point to index ids");
assert(app.includes("ENJP_LexicalAtlas?.render(root,section.id)"),"v3 reader can render both atlases");
assert(app.includes("const adjective=lessonId===")&&app.includes("const vocabulary=lessonId==="),
 "direct hash navigation exists for both");
assert(app.includes('document.querySelectorAll(".top-links a[href'),"topbar links work without page refresh");
assert(read("v3/lexical-atlas.css").includes("@media(max-width:700px)"),"mobile grid");
console.log(JSON.stringify({status:"PASS",adjectives:A.adjectiveRows.length,advancedAdjectives:31,advancedWords:advanced,uniqueVocabulary:A.vocabularyRows.length,
  originalSources:A.counts.legacyVocabulary,newSources:A.counts.curatedVocabulary,
  unlabeledOriginal:originalOnly,hiddenMismatchedOriginalExamples:hiddenOriginal,
  mobilePage:16,desktopPage:36,historyUntouched:true}));
