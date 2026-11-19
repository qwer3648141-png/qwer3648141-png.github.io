"use strict";
/* ENJP Ocean public voice grammar regression tests: safe ruby, all three verb types and no persistent progress. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const files=["v3/voice-grammar-data.js","v3/voice-grammar.js"];
for(const file of files)new vm.Script(read(file),{filename:file});
const node=(tag)=>{
 const e={tagName:tag,children:[],events:{},attrs:{},dataset:{},textContent:"",value:"",disabled:false,
   classList:{add(){},remove(){}},style:{}};
 e.append=(...x)=>{e.children.push(...x);e.lastChild=e.children.at(-1);e.firstChild=e.children[0]};
 e.replaceChildren=(...x)=>{e.children=[];e.append(...x)};
 e.addEventListener=(type,f)=>{(e.events[type]||(e.events[type]=[])).push(f)};
 e.setAttribute=(k,v)=>{e.attrs[k]=String(v)};
 return e;
};
const walk=n=>[n,...(n.children||[]).flatMap(x=>x?.children?walk(x):[])];
let writes=0;
const audio={makeRuby:ja=>{const n=node("ruby");n.textContent=ja;return n},
 spokenJapanese:ja=>{const v=String(ja).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");return /[一-龯々]/.test(v)?null:v},
 play(){},stop(){}};
const inf={annotation:(word,reading)=>word===reading?word:word+"（"+reading+"）"};
const doc={createElement:node};
const C={jp:{N3:[]}};
const context={window:{ENJP_Audio:audio,ENJP_Inflections:inf,ENJP_COURSES:C},
 document:doc,localStorage:{setItem(){writes++},getItem(){throw Error("Do not read legacy progress")}}};
vm.createContext(context);
for(const file of files)vm.runInContext(read(file),context);
const D=context.window.ENJP_VOICE_GRAMMAR,V=context.window.ENJP_VoiceGrammar;
assert(V&&D&&C.jp.N3.some(ch=>ch.sections.length===4),"All four entrance sections registered");
assert.equal(D.lessons.length,3);assert.equal(V.stats.examples,31);assert.equal(V.stats.quizzes,18);
assert.equal(new Set(D.quizzes.map(q=>q[0])).size,3);
for(const lesson of D.lessons){
 assert(lesson.formula.length>30);
 const q=D.quizzes.filter(q=>q[0]===lesson.id);
 assert(q.length>=6);
 for(const p of lesson.patterns){
  assert(p.rule&&p.note&&p.examples.length>=2);
  for(const [ja,zh]of p.examples){
    assert(audio.spokenJapanese(ja),"Missing ruby on example: "+ja);
    assert(zh&&zh.length>2);
  }
 }
}
const get=(w)=>V.forms[D.verbs.findIndex(v=>v[0]===w)];
const expectForm=(word,passive,causative,cp,short)=>{
 const f=get(word);assert(f,"Missing verb: "+word);
 assert.equal(f.passive.surface,passive);
 assert.equal(f.causative.surface,causative);
 assert.equal(f.causativePassive.surface,cp);
 assert.equal(f.short?.surface||null,short);
};
expectForm("書く","書かれる","書かせる","書かせられる","書かされる");
expectForm("読む","読まれる","読ませる","読ませられる","読まされる");
expectForm("話す","話される","話させる","話させられる",null);
expectForm("買う","買われる","買わせる","買わせられる","買わされる");
expectForm("食べる","食べられる","食べさせる","食べさせられる",null);
expectForm("する","される","させる","させられる",null);
expectForm("来る","来られる","来させる","来させられる",null);
assert.equal(get("来る").passive.reading,"こられる");
for(const f of V.forms)for(const key of ["original","passive","causative","causativePassive"]){
 assert(f[key]?.surface&&f[key]?.reading,"Full readings in "+key);
}
for(const id of V.ids){
 const root=node("div");assert(V.has(id));
 assert.equal(V.render(root,id),true);
 const all=walk(root);
 assert(all.some(x=>x.tagName==="select"),"Conjugation selector must render "+id);
 assert(all.some(x=>x.textContent?.includes("開始")),"Quiz start button must render "+id);
 assert(all.some(x=>x.className==="vg-nav"),"Navigation tabs "+id);
}
assert.equal(writes,0,"No private personal progress records");
const html=read("v3/index.html"),app=read("v3/app.js"),css=read("v3/voice-grammar.css");
assert(html.includes("voice-grammar-data.js")&&html.includes("voice-grammar.js")&&html.includes("voice-grammar.css"));
assert(html.indexOf("voice-grammar-data.js")<html.indexOf("voice-grammar.js"));
assert(app.includes("ENJP_VoiceGrammar?.render(root,section.id)"));
assert(app.includes("ENJP_VoiceGrammar?.has(lessonId)"));
assert(css.includes("@media(max-width:660px)"));
console.log("PASS: passive, causative, causative-passive; 31 ruby-annotated bilingual examples; 18 quiz items; godan/ichidan/irregular/short-form, TTS, no personal progress, mobile and deep links");
