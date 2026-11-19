"use strict";
/* Integration and linguistic contrast check for scenario-first Japanese particles. */
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const read=p=>fs.readFileSync(p,"utf8");
const files=["v3/particle-data.js","v3/particle-practice-data.js","v3/particle-intuitive.js","v3/particle-course.js"];
for(const file of files)new vm.Script(read(file),{filename:file});
function element(tag){
 const x={tagName:tag,textContent:"",className:"",children:[],dataset:{},style:{},events:{},attrs:{},type:"",value:"",hidden:false,disabled:false,
   classList:{add(c){x.className+=" "+c},remove(){}},scrollIntoView(){}};
 x.append=(...parts)=>x.children.push(...parts);
 x.replaceChildren=(...parts)=>{x.children=[];x.append(...parts)};
 x.setAttribute=(k,v)=>{x.attrs[k]=String(v)};
 x.addEventListener=(k,f)=>{(x.events[k]||(x.events[k]=[])).push(f)};
 return x;
}
const walk=x=>[x,...(x.children||[]).flatMap(y=>y&&typeof y==="object"&&y.children?walk(y):[])];
let storageReads=0,storageWrites=0,played=0;
const A={makeRuby:text=>{const ruby=element("ruby");ruby.textContent=text;return ruby},
 spokenJapanese:s=>{
   const cleaned=String(s).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
   return /[一-龯々]/.test(cleaned)?null:cleaned;
 },play(){played++},stop(){}};
const C={jp:{N4:[],N3:[]}};
const w={ENJP_Audio:A,ENJP_COURSES:C,localStorage:{getItem(){storageReads++},setItem(){storageWrites++}}};
const doc={createElement:element};
vm.createContext({window:w,document:doc,console});
const ctx={window:w,document:doc,console};
vm.createContext(ctx);
for(const file of files)vm.runInContext(read(file),ctx);
const module=w.ENJP_ParticleIntuitive,core=w.ENJP_Particles;
assert(module&&core,"Both new and original particle courses load");
assert.equal(module.scenes.length,4);
assert.equal(module.pitfalls.length,3);
assert.equal(module.tests.length,5);
assert.equal(core.quiz.length,24,"Original 24 questions are preserved");
assert.equal(core.pairs.length,20,"Original comparison set is preserved");
assert.equal(core.groups.length,14,"Original particle chapters remain");
for(const scene of module.scenes){
 assert.equal(scene.lines.length,3,"Each scene compares original, は and も");
 for(const line of scene.lines){assert.equal(line.length,3);assert(A.spokenJapanese(line[0]),"Furigana missing: "+line[0]);assert(line[1].length>4);assert(line[2].length>3)}
}
for(const topic of module.pitfalls)for(const [ja,zh]of topic.examples){
 assert(A.spokenJapanese(ja),"Unannotated kanji in trap example: "+ja);
 assert(zh.length>4);
}
for(const quiz of module.tests){
 assert(quiz.opts.length===3&&Number.isInteger(quiz.right)&&quiz.right>=0&&quiz.right<3);
 assert(quiz.why.length>12);
 for(const s of quiz.opts)assert(A.spokenJapanese(s),"Unannotated kanji in mini quiz: "+s);
}
const overview=element("div");
assert(core.render(overview,"jp-particle-overview"),"Overview works");
let all=walk(overview);
assert.equal(all.filter(x=>x.className==="pbi-case").length,3,"Exactly three contrasting sentences visible by default");
assert.equal(all.filter(x=>x.className==="pbi-tab").length,4,"Four particle context tabs");
assert.equal(all.filter(x=>x.className==="pbi-trap").length,3,"Three exceptions");
const tabs=all.filter(x=>x.className==="pbi-tab");
tabs[0].events.click[0]();
all=walk(overview);
assert(all.some(x=>x.textContent.includes("東京")), "に scenario renders after tab selection");
tabs[3].events.click[0]();
all=walk(overview);
assert(all.some(x=>x.textContent.includes("先生")), "と scenario renders after tab selection");
let options=all.filter(x=>x.className==="pbi-answer");
assert.equal(options.length,3,"Context quiz has three choices");
options[1].events.click[0]();
assert(all.find(x=>x.className==="pbi-feedback").children.some(x=>x.textContent.includes("對")),"Correct answer gives immediate explanation");
let next=walk(overview).find(x=>x.className==="pbi-button"&&x.textContent==="下一題 →");
assert(next&&!next.disabled,"Answered quiz advances");
next.events.click[0]();
assert.equal(walk(overview).filter(x=>x.className==="pbi-answer").length,3,"Next quiz question renders");
const group=element("div");
assert(core.render(group,"jp-particle-niwa"),"Existing group section works");
assert(walk(group).some(x=>x.className==="pbi-group"),"Existing group now explains same-scenario differences");
const html=read("v3/index.html");
assert(html.includes("particle-intuitive.js?v=3.8.3")&&html.includes("particle-intuitive.css?v=3.8.3"));
assert(html.indexOf("particle-intuitive.js")<html.indexOf("particle-course.js"),"Teaching bridge loads before chapter renderer");
assert.equal(storageReads+storageWrites,0,"Public lesson must not access learner progress");
console.log("PASS: four interactive contrasting cases, 3 semantic pitfalls, 5 context checks, 14 original particle topics, 20 original comparisons, 24 original quiz questions, safe annotated Japanese, no tracking");
