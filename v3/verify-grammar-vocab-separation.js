"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const paths=["v3/course-map.js","v3/legacy-bridge.js","v3/app.js","v3/contrast-grammar-data.js","v3/contrast-grammar.js"];
paths.forEach(path=>new vm.Script(read(path),{filename:path}));
const legacyVocab={};
for(let i=1;i<=30;i++)legacyVocab[String(i)]=Array.from({length:i===30?50:30},(_,j)=>({id:i+"-"+j}));
const L={
 vocab:legacyVocab,
 catalog:{},
 grammar:Array.from({length:200},()=>({lv:"N4",f:"測試"})),
 lexical:Array.from({length:400},()=>({kind:"verb",topic:"-unused",level:"N4"})),
 chapterGrammar:{},topics:[]
};
const mock={
 window:{ENJP_LEGACY:L,ENJP_Audio:{makeRuby:()=>({}),spokenJapanese:()=>true,play:()=>{}}},
 localStorage:{getItem:()=>null,setItem:()=>{}},
};
vm.runInNewContext(read("v3/course-map.js"),mock);
const C=mock.window.ENJP_COURSES;
const n4Initial=C.jp.N4.length,englishInitial=C.en.length,dualInitial=C.dual.length;
vm.runInNewContext(read("v3/legacy-bridge.js"),mock);
assert(!mock.window.ENJP_MIGRATION_ERROR,"Legacy data imports intact");
assert.equal(mock.window.ENJP_MIGRATED.summary.vocab,920);
assert.equal(C.jp.N4.filter(c=>c.id.startsWith("legacy-vocab-group")).length,0,"No duplicate 30-chapter vocabulary under N4");
for(const level of ["N5","N4","N3"]){
 assert.equal(C.jp[level].filter(c=>c.id.startsWith("legacy-vocab-group")).length,0,"No vocabulary chapters under "+level);
}
assert.equal(C.en.filter(c=>c.id.startsWith("legacy-vocab-group")).length,0,"No duplicate English vocabulary");
assert.equal(C.dual.filter(c=>c.id.startsWith("legacy-vocab-group")).length,0,"No duplicate bilingual vocabulary");
for(const mode of ["jp","en","dual"]){
 assert.equal(C.vocab[mode].length,6,mode+" six groups");
 assert.equal(C.vocab[mode].reduce((n,g)=>n+g.sections.length,0),30,mode+" all 30 chapters");
 for(let i=1;i<=30;i++)assert(mock.window.ENJP_MIGRATED.sections["legacy-vocab-"+mode+"-"+i]);
}
assert(C.jp.N4.length>n4Initial && C.en.length===englishInitial && C.dual.length===dualInitial);
vm.runInNewContext(read("v3/contrast-grammar-data.js"),mock);
const topics=mock.window.ENJP_CONTRAST_GRAMMAR;
assert.equal(topics.length,5);
const totalPatterns=topics.reduce((n,t)=>n+t.patterns.length,0);
const totalExamples=topics.reduce((n,t)=>n+t.patterns.reduce((m,p)=>m+p.examples.length,0),0);
const totalQuiz=topics.reduce((n,t)=>n+t.quiz.length,0);
assert.equal(totalPatterns,32);
assert.equal(totalExamples,64);
assert.equal(totalQuiz,25);
for(const topic of topics){
 assert(topic.patterns.length>=5);
 assert(topic.comparison.rows.length>=3);
 for(const pattern of topic.patterns){
  assert(pattern.examples.every(ex=>ex.length===2&&ex[0]&&ex[1]),"Bilingual examples "+pattern.form);
 }
 for(const quiz of topic.quiz)assert(quiz.choices.includes(quiz.correct),"Correct option "+topic.id);
}
vm.runInNewContext(read("v3/contrast-grammar.js"),mock);
assert(mock.window.ENJP_ContrastGrammar,"New renderer registered");
for(const level of ["N4","N3"]){
 const chapter=C.jp[level].find(c=>c.id==="contrast-"+level.toLowerCase());
 assert(chapter&&chapter.sections.length===5,"Contrast grammar navigable under "+level);
}
const html=read("v3/index.html"),app=read("v3/app.js");
assert(html.includes('data-mode="vocab"'));
assert(html.includes('id="vocab-langs"'));
for(const mode of ["jp","en","dual"])assert(html.includes('data-vocab-lang="'+mode+'"'));
assert(html.indexOf("contrast-grammar-data.js")<html.indexOf("contrast-grammar.js"));
assert(html.indexOf("contrast-grammar.js")<html.indexOf("app.js"));
assert(app.includes('state.mode==="vocab"?state.vocabLang:state.mode'),"Vocabulary reader preserves selected language");
assert(app.includes('ENJP_ContrastGrammar?.render(root,section.id)'),"New renderer wired into reader");
assert(!app.includes('["🌊 英日情境單字"'),"Old vocabulary home shortcut removed");
assert(read("v3/ui.css").includes(".mode-strip{grid-template-columns:repeat(4"));
assert(read("v3/contrast-grammar.css").includes(".cg-patterns"));
console.log("PASS: 30 chapter vocabulary in a separate 4th mode, N4/N3 grammar topics, 64 samples, 25 quizzes, legacy data preserved.");
